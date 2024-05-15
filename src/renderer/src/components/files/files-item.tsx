import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge, TypeBadge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useApi } from '@/hooks/use-api';
import { Image } from 'lucide-react';
import { useFile } from '@/providers/files';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type FilesItemProps = { resource: Resource };

export function FilesItem({ resource }: FilesItemProps) {
  const [isDownloading, setIsDownloading] = useState(resource.downloading);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const { cancelDownload } = useApi();
  const { removeActivity } = useFile();
  const isNotDone = isDownloading && progress < 100;
  const [imageFailed, setImageFailed] = useState(false);

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
    });
  };

  // TODO: Fix modelName wrapping and ellipsis
  return (
    <Card className="bg-transparent group overflow-hidden">
      {!isNotDone ? (
        <NavLink to={`/files/${resource.hash}`} reloadDocument>
          {({ isActive }) => (
            <CardContent
              className={classnames('group-hover:bg-muted', {
                'bg-muted': isActive,
              })}
            >
              <div className="flex gap-2">
                {resource.previewImageUrl && !imageFailed ? (
                  <div className="w-12 h-12 items-center overflow-hidden rounded">
                    <img
                      src={resource.previewImageUrl}
                      alt={resource.modelName}
                      onError={() => setImageFailed(true)}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ) : (
                  <div className="bg-card w-12 h-12 rounded flex items-center justify-center">
                    <Image size={24} />
                  </div>
                )}
                <div className="text-ellipsis overflow-hidden justify-between flex flex-col flex-1 gap-2">
                  <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                    {resource.modelName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <TypeBadge type={resource.type} />
                    {resource.baseModel && <Badge variant="outline">{resource.baseModel}</Badge>}
                    <Badge variant="outline">{resource.modelVersionName}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </NavLink>
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
              <div className="cursor-pointer" onClick={cancelAndRemoveDownload}>
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
              {dayjs.duration({ seconds: remainingTime }).humanize()} remaining
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
