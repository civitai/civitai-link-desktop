import {
  UploadCloud,
  ClipboardCopy,
  Trash2,
  FolderOpenDot,
  ExternalLink,
  Check,
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
import { useEffect, useState } from 'react';

type FileActionsProps = {
  file: Resource;
};

export function FileActions({ file }: FileActionsProps) {
  const { apiKey } = useElectron();
  const { toggleVaultItem, openModelFileFolder } = useApi();

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  }, [isCopied]);

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
                    className="h-4 w-4"
                  />
                ) : (
                  <UploadCloud className="h-4 w-4" onClick={toggleInVault} />
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
        {file.trainedWords ? (
          <>
            <Separator orientation="vertical" className="mx-1 h-6" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      file.trainedWords?.join(', ') || '',
                    );
                    setIsCopied(true);
                  }}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" color="green" />
                  ) : (
                    <ClipboardCopy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy Trigger Words</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Trigger Words</TooltipContent>
            </Tooltip>
          </>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <FileItemDelete resource={file} />
      </div>
    </div>
  );
}
