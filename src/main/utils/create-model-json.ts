import fs from 'fs';

export function createModelJson(file: Resource) {
  let sd_version = 'unknown';
  if (file.baseModel?.includes('SD 1')) {
    sd_version = 'SD1';
  } else if (file.baseModel?.includes('SD 2')) {
    sd_version = 'SD2';
  } else if (file.baseModel?.includes('SDXL')) {
    sd_version = 'SDXL';
  }

  const data = {
    description: file.description,
    'sd version': sd_version,
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
