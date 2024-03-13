import { setApiKey } from '../store/store';

export function eventSetApiKey(_, key: string) {
  setApiKey(key);
}
