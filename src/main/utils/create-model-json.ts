import fs from 'fs';

const SD_VERSION = [
  { baseModel: 'SD 1', version: 'SD1' },
  { baseModel: 'SD 2', version: 'SD2' },
  { baseModel: 'SDXL', version: 'SDXL' },
  { baseModel: 'PONY', version: 'PONY' },
];

export function createModelJson(file: Resource) {
  const sdVersion = SD_VERSION.find((version) =>
    file.baseModel?.includes(version.baseModel),
  );

  const data = {
    description: file.description,
    'sd version': sdVersion?.version ? sdVersion.version : 'unknown',
    'activation text': file.trainedWords?.join(', '),
    'preferred weight': 0.8,
    notes: '',
  };

  if (file.localPath) {
    const jsonFile = file.localPath.split('.').slice(0, -1).join('.') + '.json';

    // If json file already exists, don't overwrite
    if (fs.existsSync(jsonFile)) {
      return;
    }

    fs.writeFile(jsonFile, JSON.stringify(data), (err) => {
      if (err) return console.error(err);
      console.log(JSON.stringify(data));
      console.log(`Writing to: ${jsonFile}`);
    });
  }
}
