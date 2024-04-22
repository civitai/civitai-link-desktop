import { setSettings } from '../store/store';

export function eventSetAlwaysOnTop(alwaysOnTop: boolean) {
  setSettings({ alwaysOnTop });
}
