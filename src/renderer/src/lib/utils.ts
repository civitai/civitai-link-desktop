import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ellipsis({
  str,
  maxLength = 35,
  start = 20,
  end = 30,
}: {
  str: string;
  maxLength?: number;
  start?: number;
  end?: number;
}) {
  if (str.length > maxLength) {
    return (
      str.substring(0, start) +
      '...' +
      str.substring(str.length - end, str.length)
    );
  }
  return str;
}

export const KB = 1024 as const;

export function bytesToKB(bytes: number): number {
  return bytes / KB;
}

export const formatKBytes = (kb: number, decimals = 2) =>
  formatBytes(kb * KB, decimals);

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes <= 0) return '0 Bytes';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(KB));

  return (
    parseFloat((bytes / Math.pow(KB, i)).toFixed(decimals)) + ' ' + sizes[i]
  );
}
