import { setApiKey, setUser } from '../store/store';

export function eventSetApiKey(_, key: string) {
  setApiKey(key);
  setUser();
}
