import { createHash } from 'crypto';

//  hashes.sha256(filename, f"{automatic_type}/{automatic_name}")
export function hash(filename: string) {
  return createHash('sha256').update(filename);
}
