import fs from 'fs/promises';

export async function fileStats(path?: string) {
  if (!path) return {};

  try {
    const stats = await fs.stat(path);

    return {
      fileSize: stats.size,
    };
  } catch (err) {
    console.error(err);
    return {};
  }
}
