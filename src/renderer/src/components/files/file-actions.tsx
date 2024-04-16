import {
  ClipboardCopy,
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
import { FileItemDelete } from './file-item-delete';
import { useEffect, useState } from 'react';
import { StoreInVaultButton } from '../buttons/store-in-vault-button';
// import { FileFetchMetadata } from './file-fetch-metadata';

type FileActionsProps = {
  file: Resource;
};

export function FileActions({ file }: FileActionsProps) {
  const { openModelFileFolder } = useApi();

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(false);
    }, 4000);
  }, [isCopied]);

  return (
    <div className="flex items-center p-2">
      <div className="flex items-center gap-2">
        <StoreInVaultButton file={file} />
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
        {/* {file.localPath ? (
          <FileFetchMetadata localPath={file.localPath} />
        ) : null} */}
        {file.trainedWords && file.trainedWords.length > 0 ? (
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
                  <span className="sr-only">Copy All Trigger Words</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy All Trigger Words</TooltipContent>
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
