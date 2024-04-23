import { fetchVaultModelsByVersion, toggleVaultModel } from '../civitai-api';
import { updateActivity } from '../store/activities';
import {
  searchFile,
  searchFileByModelVersionId,
  updateFile,
} from '../store/files';
import { setVault, setVaultMeta } from '../store/vault';

export function eventFetchVaultModels() {
  setVault();
}

export function eventFetchVaultMeta() {
  setVaultMeta();
}

export async function eventToggleVaultItem(
  _,
  { hash, modelVersionId }: { hash?: string; modelVersionId: number },
) {
  const { success } = await toggleVaultModel(modelVersionId);

  if (success) {
    // Fetch update
    setVault();
    setVaultMeta();

    if (!hash) {
      const file = searchFileByModelVersionId(modelVersionId);
      hash = file?.hash;

      if (!hash) {
        return;
      }
    }

    const vaultStatus = await fetchVaultModelsByVersion([modelVersionId]);
    const file = searchFile(hash);
    updateFile({
      ...file,
      vaultId: vaultStatus[0].vaultItem?.vaultId,
    });

    // NOTE: This only works from app
    // TODO: Move this event as part of the socket connection
    updateActivity({
      name: file.modelName,
      type: vaultStatus[0].vaultItem?.vaultId
        ? ('added vault' as ActivityType)
        : ('removed vault' as ActivityType),
      date: new Date().toISOString(),
    });
  }
}
