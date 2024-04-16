import { UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApi } from '@/hooks/use-api';
import { VaultItemDelete } from '../vault/vault-item-delete';
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

  const toggleInVault = async ({ removeFile }: { removeFile?: boolean }) => {
    if (file.modelVersionId) {
      await toggleVaultItem({
        hash: file.hash,
        modelVersionId: file.modelVersionId,
      });

      if (removeFile) {
        setTimeout(() => {
          resourceRemove(file);
        }, 500);
      }
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
              <AlertDialogTrigger asChild>
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
                  <AlertDialogCancel
                    className="p-2"
                    onClick={() => toggleInVault({})}
                  >
                    Keep File
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      toggleInVault({ removeFile: true });
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
