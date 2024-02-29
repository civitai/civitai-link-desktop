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
import { useElectron } from '@/providers/electron';
import { DownloadCloud, Trash2, Image } from 'lucide-react';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type ItemProps = Resource;

export function FilesItem(props: ItemProps) {
  const [isDownloading, setIsDownloading] = useState(props.downloading);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const { cancelDownload, resourceRemove } = useApi();
  const { removeActivity } = useElectron();
  const isNotDone = isDownloading && progress < 100;

  useEffect(() => {
    if (props.id && isDownloading) {
      window.electron.ipcRenderer.on(
        `resource-download:${props.id}`,
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
        `resource-download:${props.id}`,
      );
    };
  }, [isDownloading]);

  const cancelAndRemoveDownload = () => {
    cancelDownload(props.id || '');
    removeActivity({
      hash: props.hash,
      title: 'Download canceled',
      description: `The download for ${props.modelName} has been canceled.`,
    });
  };

  const removeResource = () => {
    resourceRemove(props);
  };

  return (
    <Card className="mb-2 bg-transparent">
      {!isNotDone ? (
        <CardContent>
          <div className="flex group relative">
            {props.previewImageUrl ? (
              <div className="min-w-12 h-12 mr-2 items-center overflow-hidden rounded">
                <img
                  src={props.previewImageUrl}
                  alt={props.modelName}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="bg-card w-12 h-12 mr-2 rounded flex items-center justify-center">
                <Image size={24} />
              </div>
            )}
            <div className="w-full whitespace-nowrap overflow-hidden pr-8 justify-between flex flex-col flex-1">
              <div>
                <a href={props.civitaiUrl} target="_blank">
                  <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                    {props.modelName}
                  </p>
                </a>
              </div>
              <div className="flex items-center space-x-2 group-hover:hidden">
                <Badge variant="modelTag">{props.type}</Badge>
                <Badge variant="outline">{props.modelVersionName}</Badge>
              </div>
              <div className="justify-center hidden group-hover:flex flex-col">
                {props.downloadDate ? (
                  <p className="text-[10px] font-normal text-[#909296] flex items-center">
                    <DownloadCloud className="mr-1" size={12} color="#909296" />
                    {dayjs(props.downloadDate).format('YYYY-MM-DD')}
                  </p>
                ) : null}
                <p className="text-[10px] dark:text-[#909296] text-ellipsis overflow-hidden">
                  {props.name}
                </p>
              </div>
            </div>
            {!isNotDone ? (
              <Trash2
                color="#F15252"
                className="cursor-pointer absolute group-hover:flex hidden top-1/2 right-0 transform -translate-y-1/2"
                onClick={removeResource}
                size={20}
              />
            ) : null}
          </div>
        </CardContent>
      ) : (
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <a href={props.civitaiUrl} target="_blank">
              <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                {props.modelName}
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
