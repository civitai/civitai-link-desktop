import { fetchVaultModelsByVersion, toggleVaultModel } from '../civitai-api';
import {
  searchFile,
  searchFileByModelVersionId,
  updateFile,
} from '../store/files';

export async function eventToggleVaultItem(
  _,
  { hash, modelVersionId }: { hash?: string; modelVersionId: number },
) {
  const { success } = await toggleVaultModel(modelVersionId);

  if (success) {
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
  }
}
