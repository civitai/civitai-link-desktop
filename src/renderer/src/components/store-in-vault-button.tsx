import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApi } from '@/hooks/use-api';
import { VaultItemDelete } from './vault/vault-item-delete';
import { useElectron } from '@/providers/electron';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type StoreInVaultButtonProps = {
  file: Resource;
};

export function StoreInVaultButton({ file }: StoreInVaultButtonProps) {
  const { toggleVaultItem, resourceRemove } = useApi();
  const { apiKey } = useElectron();

  const removeFile = () => {
    resourceRemove(file);
  };

  const toggleInVault = () => {
    if (file.modelVersionId) {
      toggleVaultItem({
        hash: file.hash,
        modelVersionId: file.modelVersionId,
      });
    }
  };

  return apiKey && file.modelVersionId ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          {file.vaultId ? (
            <VaultItemDelete
              hidden
              hash={file.hash}
              modelVersionId={file.modelVersionId}
              className="h-4 w-4"
            />
          ) : (
            <AlertDialog>
              <AlertDialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <UploadCloud className="h-4 w-4" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete from file system?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Saving to vault allows you to clear up space locally. We can
                    remove the file from your file system if you'd like.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={toggleInVault} className="p-2">
                    Keep File
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      toggleInVault();
                      removeFile();
                    }}
                    className="p-2 destructive"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <span className="sr-only">
            {file.vaultId
              ? 'Remove from Vault'
              : 'Store resource in your Vault'}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {file.vaultId ? 'Remove from Vault' : 'Store resource in your Vault'}
      </TooltipContent>
    </Tooltip>
  ) : null;
}
