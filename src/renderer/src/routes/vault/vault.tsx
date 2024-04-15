import { useElectron } from '@/providers/electron';
import { ApiKeyInput } from '@/components/inputs/api-key-input';
import { MemberButton } from '@/components/buttons/member-button';
import { useVault } from '@/providers/vault';
import { Progress } from '@/components/ui/progress';
import { VaultItem } from '@/components/vault/vault-item';
import { useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Vault as VaultIcon } from 'lucide-react';
import { formatKBytes } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PanelWrapper } from '@/layout/panel-wrapper';
import { Separator } from '@/components/ui/separator';

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
      <PanelWrapper>
        <div className="p-4 flex flex-1 h-full flex-col justify-center items-center">
          <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-20">
            API Key and Membership are required to use Vault.
          </p>
          <ApiKeyInput />
          <div className="flex justify-center items-center mt-4">
            <MemberButton />
          </div>
        </div>
      </PanelWrapper>
    );
  }

  if (!vault || (user && !Object.hasOwn(user, 'tier'))) {
    return (
      <PanelWrapper>
        <div className="p-4 flex flex-1 h-full flex-col justify-center items-center">
          <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-8">
            In order to use Civitai Vault, you need to purchase membership.
          </p>
          <MemberButton />
        </div>
      </PanelWrapper>
    );
  }

  return (
    <PanelWrapper>
      <>
        <div className="flex justify-end w-full items-center px-4 min-h-14">
          <div className="flex flex-col text-right gap-2">
            <Progress value={parseFloat(percentUsed)} />
            <p className="text-sm text-[#909296]">
              {percentUsed}% of {formatKBytes(vaultMeta?.storageKb || 0)} Used
            </p>
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 bg-background px-4 pt-4 pb-[145px]">
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
        </ScrollArea>
      </>
    </PanelWrapper>
  );
}
