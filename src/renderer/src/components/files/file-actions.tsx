import {
  UploadCloud,
  ClipboardCopy,
  Trash2,
  FolderOpenDot,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useApi } from '@/hooks/use-api';
import { useElectron } from '@/providers/electron';
import { VaultItemDelete } from '../vault/vault-item-delete';
import { FileItemDelete } from './file-item-delete';

type FileActionsProps = {
  file: Resource;
};

export function FileActions({ file }: FileActionsProps) {
  const { apiKey } = useElectron();
  const { toggleVaultItem, openModelFileFolder } = useApi();

  const toggleInVault = () => {
    if (file.modelVersionId) {
      toggleVaultItem({
        hash: file.hash,
        modelVersionId: file.modelVersionId,
      });
    }
  };

  return (
    <div className="flex items-center p-2">
      <div className="flex items-center gap-2">
        {apiKey && file.modelVersionId ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                {file.vaultId ? (
                  <VaultItemDelete
                    hidden
                    hash={file.hash}
                    modelVersionId={file.modelVersionId}
                  />
                ) : (
                  <UploadCloud
                    className="absolute top-3 left-3 w-6 h-6 cursor-pointer hidden group-hover:flex"
                    onClick={toggleInVault}
                  />
                )}
                <span className="sr-only">
                  {file.vaultId
                    ? 'Remove from Vault'
                    : 'Store resource in your Vault'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {file.vaultId
                ? 'Remove from Vault'
                : 'Store resource in your Vault'}
            </TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                file?.localPath
                  ? openModelFileFolder(file.localPath)
                  : alert('Path to file cant be found.')
              }
            >
              <FolderOpenDot className="h-4 w-4" />
              <span className="sr-only">Open File in Folder</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open File in Folder</TooltipContent>
        </Tooltip>
        {file.civitaiUrl ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <a href={file.civitaiUrl} target="_blank">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Open Model on Civitai</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Model on Civitai</TooltipContent>
          </Tooltip>
        ) : null}
        {/* TODO: add in copy */}
        {/* <Separator orientation="vertical" className="mx-1 h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <ClipboardCopy className="h-4 w-4" />
              <span className="sr-only">Copy Keywords</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy Keywords</TooltipContent>
        </Tooltip> */}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <FileItemDelete resource={file} />
      </div>
    </div>
  );
}
