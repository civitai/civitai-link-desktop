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
