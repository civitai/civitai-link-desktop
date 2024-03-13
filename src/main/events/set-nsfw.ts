import { setSettings } from '../store/store';

export function eventSetNSFW(_, nsfw: boolean) {
  setSettings({ nsfw });
}
