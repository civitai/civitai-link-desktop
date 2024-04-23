import { searchFile, updateFile } from '../store/files';
import fs from 'fs';

export async function eventFetchFileNotes(_, hash: string) {
  const file = searchFile(hash);

  // Check if notes exist in the data store
  if (file.notes) {
    return file.notes;
  }

  const jsonFile = file.localPath?.split('.').slice(0, -1).join('.') + '.json';

  // If the json file exists read the notes from it
  if (jsonFile && fs.existsSync(jsonFile)) {
    const data = fs.readFileSync(jsonFile, 'utf8');
    const jsonData = JSON.parse(data);

    // Update the notes in the data store so we can short circuit later
    updateFile({ ...file, notes: jsonData.notes });

    return jsonData.notes;
  }

  return '';
}

export async function eventSaveFileNotes(
  _,
  { hash, notes }: { hash: string; notes: string },
) {
  const file = searchFile(hash);

  updateFile({ ...file, notes });

  const jsonFile = file.localPath?.split('.').slice(0, -1).join('.') + '.json';

  if (jsonFile && fs.existsSync(jsonFile)) {
    const data = fs.readFileSync(jsonFile, 'utf8');
    const jsonData = JSON.parse(data);

    fs.writeFileSync(jsonFile, JSON.stringify({ ...jsonData, notes }));
  }
}
