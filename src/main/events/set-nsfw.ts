import { setSettings } from '../store';

export function eventSetNSFW(_, nsfw: boolean) {
  setSettings({ nsfw });
}
