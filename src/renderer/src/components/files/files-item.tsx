import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useApi } from '@/hooks/use-api';
import { DownloadCloud, Image, UploadCloud } from 'lucide-react';
import { FileItemDelete } from './file-item-delete';
import { useFile } from '@/providers/files';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import classnames from 'classnames';
import { useElectron } from '@/providers/electron';
import { VaultItemDelete } from '../vault/vault-item-delete';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type FilesItemProps = { resource: Resource };

export function FilesItem({ resource }: FilesItemProps) {
  const [isDownloading, setIsDownloading] = useState(resource.downloading);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const { cancelDownload, openModelFileFolder } = useApi();
  const { apiKey } = useElectron();
  const { removeActivity } = useFile();
  const isNotDone = isDownloading && progress < 100;

  const { toggleVaultItem } = useApi();

  const toggleInVault = () => {
    if (resource.modelVersionId) {
      toggleVaultItem({
        hash: resource.hash,
        modelVersionId: resource.modelVersionId,
      });
    }
  };

  useEffect(() => {
    if (resource.id && isDownloading) {
      window.electron.ipcRenderer.on(
        `resource-download:${resource.id}`,
        function (_, message) {
          setProgress(message.progress);
          setSpeed(message.speed);
          setRemainingTime(message.remainingTime);
          setIsDownloading(message.downloading);
        },
      );
    }

    return () => {
      window.electron.ipcRenderer.removeAllListeners(
        `resource-download:${resource.id}`,
      );
    };
  }, [isDownloading]);

  const cancelAndRemoveDownload = () => {
    cancelDownload(resource.id || '');
    removeActivity({
      hash: resource.hash,
      title: 'Download canceled',
      description: `The download for ${resource.modelName} has been canceled.`,
    });
  };

  return (
    <TooltipProvider>
      <Card className="bg-transparent group">
        {!isNotDone ? (
          <CardContent>
            <div className="flex relative">
              {resource.previewImageUrl ? (
                <div className="w-12 h-12 mr-2 items-center overflow-hidden rounded relative">
                  <img
                    src={resource.previewImageUrl}
                    alt={resource.modelName}
                    className={classnames(
                      'h-full w-full object-cover object-center',
                      {
                        'group-hover:opacity-5':
                          apiKey && resource.modelVersionId,
                      },
                    )}
                  />
                  {apiKey && resource.modelVersionId ? (
                    <Tooltip>
                      <TooltipTrigger>
                        {resource.vaultId ? (
                          <VaultItemDelete
                            hidden
                            hash={resource.hash}
                            modelVersionId={resource.modelVersionId}
                          />
                        ) : (
                          <UploadCloud
                            className="absolute top-3 left-3 w-6 h-6 cursor-pointer hidden group-hover:flex"
                            onClick={toggleInVault}
                          />
                        )}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[360px] bg-background/90 rounded p-1 ml-8 border">
                        <p className="text-xs">
                          {resource.vaultId
                            ? 'Remove from Vault'
                            : 'Store resource in your Vault'}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              ) : (
                <div className="bg-card w-12 h-12 mr-2 rounded flex items-center justify-center">
                  <Image size={24} />
                </div>
              )}
              <div className="w-full whitespace-nowrap overflow-hidden pr-8 justify-between flex flex-col flex-1">
                <div>
                  <a href={resource.civitaiUrl} target="_blank">
                    <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                      {resource.modelName}
                    </p>
                  </a>
                </div>
                <div className="flex items-center space-x-2 group-hover:hidden">
                  <Badge variant="modelTag">{resource.type}</Badge>
                  <Badge variant="outline">{resource.modelVersionName}</Badge>
                </div>
                <div className="justify-center hidden group-hover:flex flex-col">
                  {resource.downloadDate ? (
                    <p className="text-[10px] font-normal text-[#909296] flex items-center">
                      <DownloadCloud
                        className="mr-1"
                        size={12}
                        color="#909296"
                      />
                      {dayjs(resource.downloadDate).fromNow()}
                    </p>
                  ) : null}
                  <p
                    className="text-[10px] dark:text-[#909296] text-ellipsis overflow-hidden cursor-pointer"
                    onClick={() =>
                      resource?.localPath
                        ? openModelFileFolder(resource.localPath)
                        : alert('Path to file cant be found.')
                    }
                  >
                    {resource.name}
                  </p>
                </div>
              </div>
              {!isNotDone ? (
                <Tooltip>
                  <TooltipTrigger>
                    <FileItemDelete resource={resource} />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
                    <p className="text-xs">Delete from file system</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>
          </CardContent>
        ) : (
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <a href={resource.civitaiUrl} target="_blank">
                <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                  {resource.modelName}
                </p>
              </a>
              <div>
                <p className="text-xs text-[#909296] leading-none">
                  {prettyBytes(speed)}/s
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex w-full items-center">
                <Progress value={progress} className="mr-2" />
                <div
                  className="cursor-pointer"
                  onClick={cancelAndRemoveDownload}
                >
                  <AiOutlineCloseCircle size={16} />
                </div>
              </div>
            </div>
            <div className="flex-row flex justify-between w-full">
              <div>
                <p className="text-xs text-[#909296] leading-none">
                  {Math.floor(progress)}%
                </p>
              </div>
              <p className="text-xs text-[#909296] leading-none">
                {dayjs.duration({ seconds: remainingTime }).humanize()}{' '}
                remaining
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </TooltipProvider>
  );
}
