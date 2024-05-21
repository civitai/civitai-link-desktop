import { setSettings } from '../store/store';

export function eventSetConcurrent(_, conncurrent: number) {
  setSettings({ conncurrent });
}
