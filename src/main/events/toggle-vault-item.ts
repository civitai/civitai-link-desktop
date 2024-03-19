import { toggleVaultModel } from '../civitai-api';

export function eventToggleVaultItem(_, modelVersionId: number) {
  toggleVaultModel(modelVersionId);
  // TODO: Update store
}
