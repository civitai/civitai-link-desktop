import path from 'path';

// Files being written by the download flow. The folder watcher sees them as
// soon as they are created and would otherwise hash a partial file; the
// download registers the finished file itself.
const inProgress = new Set<string>();

export function markDownloadStarted(filePath: string) {
  inProgress.add(path.resolve(filePath));
}

export function markDownloadFinished(filePath: string) {
  inProgress.delete(path.resolve(filePath));
}

export function isDownloadInProgress(filePath: string) {
  return inProgress.has(path.resolve(filePath));
}
