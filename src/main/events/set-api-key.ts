import { setApiKey, setUser } from '../store/store';
import { setVaultMeta, setVault } from '../store/vault';

export async function eventSetApiKey(_, key: string) {
  setApiKey(key);
  await setUser();
  await setVaultMeta();
  await setVault();
}
