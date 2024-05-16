import { toggleVaultModel } from '../civitai-api';
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

let updateTimeout: NodeJS.Timeout;
async function updateVaultData() {
  if (updateTimeout) clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    setVault();
    setVaultMeta();
  }, 2000);
}

export async function eventToggleVaultItem(
  _,
  { hash, modelVersionId }: { hash?: string; modelVersionId: number },
) {
  const { success, vaultId } = await toggleVaultModel(modelVersionId);

  if (success) {
    // Fetch update
    updateVaultData();

    if (!hash) {
      const file = searchFileByModelVersionId(modelVersionId);
      hash = file?.hash;

      if (!hash) {
        return;
      }
    }

    const file = searchFile(hash.toLowerCase());
    updateFile({
      ...file,
      vaultId,
    });

    // NOTE: This only works from app
    // TODO: Move this event as part of the socket connection
    updateActivity({
      name: file.modelName,
      type: vaultId
        ? ('added vault' as ActivityType)
        : ('removed vault' as ActivityType),
      date: new Date().toISOString(),
    });

    return vaultId;
  }

  return undefined;
}
