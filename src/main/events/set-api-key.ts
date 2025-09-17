import { setupCommons } from '../store/common';
import { setApiKey, setUser } from '../store/store';
import { setVault, setVaultMeta } from '../store/vault';

export async function eventSetApiKey(_, key: string) {
  setApiKey(key);
  await setupCommons();
  await setUser();
  await setVaultMeta();
  await setVault();
}
