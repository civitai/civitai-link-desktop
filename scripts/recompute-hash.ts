// https://stackoverflow.com/questions/37140799/passing-environment-variables-in-npm-scripts
import { parse, stringify } from 'yaml';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';

interface ILatestDto {
  version: string;
  files: IFileDto[];
  path: string;
  sha512: string;
  releaseDate: string;
}

interface IFileDto {
  url: string;
  size: number;
  sha512: string;
}

const hashFile = (file: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const hash = crypto.createHash('sha512');
    hash.on('error', reject).setEncoding('base64');

    fs.createReadStream(file, {
      highWaterMark: 1024 * 1024,
    })
      .on('error', reject)
      .on('end', () => {
        hash.end();
        resolve(hash.read());
      })
      .pipe(hash, {
        end: false,
      });
    const stats = fs.statSync(file);
    console.log('File size: ', stats.size);
  });
};

const updateLatestYaml = async (
  latestYamlPath: string,
  targetPath: string,
  newHash: string,
): Promise<void> => {
  const latestYaml = await fsPromises.readFile(latestYamlPath, {
    encoding: 'utf-8',
  });
  const latestDto = parse(latestYaml) as ILatestDto;
  const parsedPath = path.parse(targetPath);
  const targetFileName = parsedPath.name + parsedPath.ext;
  const targetFileSize = fs.statSync(targetPath).size;

  if (latestDto.path.includes(targetFileName)) {
    latestDto.sha512 = newHash;
  }

  for (const file of latestDto.files) {
    if (file.url.includes(targetFileName)) {
      file.sha512 = newHash;
      file.size = targetFileSize;
    }
  }

  await fsPromises.writeFile(latestYamlPath, stringify(latestDto));
};

void (async () => {
  try {
    if (!process.env.TARGET_PATH) {
      console.error('TARGET_PATH is missing');
      process.exit(1);
    }

    if (!process.env.LATEST_YAML_PATH) {
      console.error('LATEST_YAML_PATH is missing');
      process.exit(1);
    }

    const newHash = await hashFile(process.env.TARGET_PATH);
    console.log('New hash: ', newHash);

    await updateLatestYaml(
      process.env.LATEST_YAML_PATH,
      process.env.TARGET_PATH,
      newHash,
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
