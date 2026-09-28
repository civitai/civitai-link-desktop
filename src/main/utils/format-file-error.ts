import path from 'path';

// Replaces the full path in an error message with the filename so logs don't
// expose the user's model directory layout.
export function formatFileError(error: unknown, filepath: string) {
  const message = error instanceof Error ? error.message : String(error);
  return message.split(filepath).join(path.basename(filepath));
}
