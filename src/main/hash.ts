import { createHash } from 'crypto';

export function hash(filename: string) {
  return createHash('sha256').update(filename).digest('hex');
}
