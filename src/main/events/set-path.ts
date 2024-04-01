import { setResourcePath } from '../store/paths';

export function eventSetPath(_, directory) {
  if (directory['path'] !== '') {
    setResourcePath(directory['type'], directory['path']);
  }
}
