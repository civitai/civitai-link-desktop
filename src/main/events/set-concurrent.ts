import { setSettings } from '../store/store';

export function eventSetConcurrent(_, concurrent: number) {
  setSettings({ concurrent });
}
