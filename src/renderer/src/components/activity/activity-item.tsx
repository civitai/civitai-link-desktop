import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { useApi } from '@/hooks/use-api';
import { useElectron } from '@/providers/electron';
import { FaCloudDownloadAlt, FaTrashAlt } from 'react-icons/fa';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type ItemProps = Resource;

export function ActivityItem(props: ItemProps) {
  const [progress, setProgress] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const { cancelDownload, resourceRemove } = useApi();
  const { removeActivity } = useElectron();

  useEffect(() => {
    if (props.id) {
      window.electron.ipcRenderer.on(
        `resource-download:${props.id}`,
        function (_, message) {
          setProgress(message.progress);
          setTotalLength(message.totalLength);
          setDownloaded(message.downloaded);
          setSpeed(message.speed);
          setRemainingTime(message.remainingTime);
        },
      );
    }

    return () => {
      window.electron.ipcRenderer.removeAllListeners(
        `resource-download:${props.id}`,
      );
    };
  }, []);

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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="justify-between flex-row flex">
          <div className="flex items-center space-x-1">
            <Badge color="primary">{props.type}</Badge>
            <Badge variant="outline">{props.modelVersionName}</Badge>
          </div>
          {props.downloadDate ? (
            <p className="text-sm text-muted-foreground flex items-center">
              <FaCloudDownloadAlt className="mr-1" />
              {dayjs(props.downloadDate).format('YYYY-MM-DD')}
            </p>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          {props.previewImageUrl ? (
            <div className="min-w-12 h-12 mr-2 items-center overflow-hidden rounded">
              <img
                src={props.previewImageUrl}
                alt={props.modelName}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ) : null}
          <div className="space-y-1">
            <a
              href={props.civitaiUrl}
              target="_blank"
              className="text-sm leading-none dark:text-[#c1c2c5] font-bold"
            >
              {props.modelName}
            </a>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-1">
                <p className="text-xs dark:text-[#c1c2c5]">{props.name}</p>
              </div>
              {/* TODO: Figure out how to get this to emit resources:remove */}
              {/* <FaTrashAlt
                color="red"
                className="cursor-pointer"
                onClick={removeResource}
              /> */}
            </div>
          </div>
        </div>
      </CardContent>
      {progress !== 0 && progress < 100 ? (
        <CardFooter className="flex-col items-start">
          <div className="flex w-full items-center my-2 ">
            <Progress value={progress} className="mr-2" />
            <div className="cursor-pointer" onClick={cancelAndRemoveDownload}>
              <AiOutlineCloseCircle size={24} />
            </div>
          </div>
          <div className="flex-row flex justify-between w-full">
            <div>
              <p className="text-sm font-medium leading-none">
                {dayjs.duration({ seconds: remainingTime }).humanize()} -{' '}
                {prettyBytes(speed)}/sec
              </p>
            </div>
            <p className="text-sm font-medium leading-none">
              {prettyBytes(downloaded)} / {prettyBytes(totalLength)} -{' '}
              {Math.floor(progress)}%
            </p>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
