import { MemberButton } from '@/components/buttons/member-button';
import { ApiKeyInput } from '@/components/inputs/api-key-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VaultFilter } from '@/components/vault/vault-filter';
import { VaultItem } from '@/components/vault/vault-item';
import { VaultSort } from '@/components/vault/vault-sort';
import { useApi } from '@/hooks/use-api';
import { useDebounce } from '@/hooks/use-debounce';
import { PanelWrapper } from '@/layout/panel-wrapper';
import { formatKBytes } from '@/lib/utils';
import { useElectron } from '@/providers/electron';
import { useVault } from '@/providers/vault';
import {
  RefreshCcw,
  RefreshCwOff,
  Search,
  Vault as VaultIcon,
  XCircle,
} from 'lucide-react';
import { useEffect } from 'react';

export function Vault() {
  const { apiKey, user } = useElectron();
  const {
    refetchVault,
    canRefresh,
    vaultMeta,
    vault,
    setSearchTerm,
    searchVault,
    searchTerm,
    filteredVault,
  } = useVault();
  const { fetchVaultMeta, fetchVaultModels } = useApi();
  const percentUsed = vaultMeta
    ? (
        ((vaultMeta?.usedStorageKb || 0) / (vaultMeta?.storageKb || 1)) *
        100
      ).toFixed(2)
    : '0';

  useEffect(() => {
    if (apiKey) {
      fetchVaultMeta();
      fetchVaultModels();
    }
  }, [apiKey]);

  const clearFilter = () => {
    setSearchTerm('');
    searchVault('');
  };

  const search = () => {
    searchVault(searchTerm);
  };

  const debouncedOnChange = useDebounce(search);

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
        <div className="flex justify-between w-full items-center px-4 min-h-14">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Vault</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={refetchVault}>
                  {canRefresh ? (
                    <RefreshCcw className="h-4 w-4" />
                  ) : (
                    <RefreshCwOff className="h-4 w-4" color="#F15252" />
                  )}
                  <span className="sr-only">Re-fetch vault items</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {canRefresh
                  ? 'Re-fetch vault items'
                  : `Can't refresh for 1 minute`}
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex flex-col text-right gap-2">
            <Progress value={parseFloat(percentUsed)} />
            <p className="text-sm text-[#909296]">
              {percentUsed}% of {formatKBytes(vaultMeta?.storageKb || 0)} Used
            </p>
          </div>
        </div>
        <Separator />
        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex">
          <form>
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8"
                onChange={(e) => {
                  debouncedOnChange();
                  setSearchTerm(e.target.value);
                }}
                value={searchTerm}
              />
              {searchTerm ? (
                <XCircle
                  className="cursor-pointer absolute right-2 top-3 text-muted-foreground"
                  onClick={clearFilter}
                  size={18}
                />
              ) : null}
            </div>
          </form>
          <div className="flex">
            <VaultFilter />
            <VaultSort />
          </div>
        </div>
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-2 bg-background px-4 pt-4 pb-[145px]">
            {filteredVault.length === 0 ? (
              <div className="flex flex-col items-center justify-center">
                <VaultIcon />
                <p className="text-center text-sm">No Vault Items</p>
              </div>
            ) : null}
            {filteredVault.map((item) => (
              <VaultItem {...item} key={item.modelVersionId} />
            ))}
          </div>
        </ScrollArea>
      </>
    </PanelWrapper>
  );
}
