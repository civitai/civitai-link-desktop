import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="mb-4 bg-transparent">
      <CardHeader>
        <CardTitle className="justify-between flex-row flex">
          <div className="flex items-center space-x-2">
            <Badge variant="modelTag">{props.type}</Badge>
            <Badge variant="outline">{props.modelVersionName}</Badge>
          </div>
          {props.downloadDate ? (
            <p className="text-sm font-normal text-[#909296] flex items-center">
              <DownloadCloud className="mr-1" size={16} color="#909296" />
              {dayjs(props.downloadDate).format('YYYY-MM-DD')}
            </p>
          ) : null}
        </CardTitle>
      </CardHeader>
      {!isNotDone ? (
        <CardContent>
          <div className="flex items-center pt-2">
            {props.previewImageUrl ? (
              <div className="min-w-9 h-9 mr-2 items-center overflow-hidden rounded">
                <img
                  src={props.previewImageUrl}
                  alt={props.modelName}
                  className="h-full w-full object-cover object-center"
                />
              </div>
            ) : (
              <div className="bg-card w-9 h-9 mr-2 rounded flex items-center justify-center">
                <Image size={16} />
              </div>
            )}
            <div className="space-y-1 w-full whitespace-nowrap overflow-hidden relative pr-8">
              <a href={props.civitaiUrl} target="_blank">
                <p className="text-sm leading-none dark:text-white font-bold text-ellipsis overflow-hidden">
                  {props.modelName}
                </p>
              </a>
              <p className="text-xs dark:text-[#909296] text-ellipsis overflow-hidden">
                {props.name}
              </p>
              {!isNotDone ? (
                <Trash2
                  color="red"
                  className="cursor-pointer absolute right-0 bottom-0"
                  onClick={removeResource}
                  size={20}
                />
              ) : null}
            </div>
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
