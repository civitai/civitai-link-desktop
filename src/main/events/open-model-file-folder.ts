import { shell } from 'electron';

export function eventOpenModelFileFolder(filePath: string) {
  shell.showItemInFolder(filePath);
}
