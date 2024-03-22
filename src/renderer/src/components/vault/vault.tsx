import { useElectron } from '@/providers/electron';
import { ApiKeyInput } from '../api-key-input';
import { MemberButton } from '../member-button';
import { useVault } from '@/providers/vault';
import prettyBytes from 'pretty-bytes';
import { Progress } from '@/components/ui/progress';
import { VaultItem } from './vault-item';
import { useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Vault as VaultIcon } from 'lucide-react';

export function Vault() {
  const { apiKey, user } = useElectron();
  const { vaultMeta, vault } = useVault();
  const { fetchVaultMeta } = useApi();
  const percentUsed = vaultMeta
    ? (
        ((vaultMeta?.usedStorageKb || 0) / (vaultMeta?.storageKb || 0)) *
        100
      ).toFixed(2)
    : '0';

  useEffect(() => {
    if (apiKey) {
      fetchVaultMeta();
    }
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div>
        <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-20">
          API Key and Membership are required to use Vault.
        </p>
        <ApiKeyInput />
        <div className="flex justify-center items-center mt-4">
          <MemberButton />
        </div>
      </div>
    );
  }

  if (!vault || (user && !Object.hasOwn(user, 'tier'))) {
    return (
      <div className="flex flex-col justify-center items-center mt-4">
        <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-8">
          In order to use Civitai Vault, you need to purchase membership.
        </p>
        <MemberButton />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end w-full pt-2 pb-4">
        <div className="flex flex-col text-right gap-2">
          <Progress value={parseFloat(percentUsed)} />
          <p className="text-sm text-[#909296]">
            {percentUsed}% of {prettyBytes(vaultMeta?.storageKb || 0)} Used
          </p>
        </div>
      </div>
      {vault.length === 0 ? (
        <div className="flex flex-col items-center justify-center">
          <VaultIcon />
          <p className="text-center text-sm">No Vault Items</p>
        </div>
      ) : null}
      {vault.map((item) => (
        <VaultItem {...item} key={item.modelVersionId} />
      ))}
    </div>
  );
}
