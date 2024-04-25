import fs from 'fs';

export const findOrCreateFolder = (dir) =>
  !fs.existsSync(dir) ? fs.mkdirSync(dir) : undefined;
