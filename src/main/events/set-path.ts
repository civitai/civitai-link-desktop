import { setResourcePath } from '../store';

export function eventSetPath(_, directory) {
  if (directory['path'] !== '') {
    setResourcePath(directory['type'], directory['path']);
  }
}
