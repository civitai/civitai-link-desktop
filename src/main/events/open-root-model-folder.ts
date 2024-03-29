import { shell } from 'electron';
import { getRootResourcePath } from '../store/store';

export function eventOpenRootModelFolder() {
  const rootResourcePath = getRootResourcePath();
  if (rootResourcePath) {
    shell.openPath(rootResourcePath);
  }
}
