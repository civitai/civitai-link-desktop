import { setRootResourcePath } from '../store/paths';

export function eventSetRootPath(_, directory) {
  if (directory['path'] !== '') {
    setRootResourcePath(directory['path']);
  }
}
