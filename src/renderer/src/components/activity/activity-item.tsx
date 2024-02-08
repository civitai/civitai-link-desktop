import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

type ItemProps = Resource;

export function ActivityItem(props: ItemProps) {
  const [progress, setProgress] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [downloaded, setDownloaded] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (props.id) {
      window.electron.ipcRenderer.on(`resource-download:${props.id}`, function (_, message) {
        setProgress(message.progress);
        setTotalLength(message.totalLength);
        setDownloaded(message.downloaded);
        setSpeed(message.speed);
        setRemainingTime(message.remainingTime);
      });
    }
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="justify-between flex-row flex">
          <Badge color="primary">{props.type}</Badge>
          {props.downloadDate ? (
            <p className="text-sm text-muted-foreground">{dayjs(props.downloadDate).format('YYYY-MM-DD')}</p>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <div className="space-y-1">
            <p className="text-sm leading-none text-[#c1c2c5] font-bold">{props.modelName}</p>
            <CardDescription>{props.modelVersionName}</CardDescription>
          </div>
        </div>
      </CardContent>
      {progress !== 0 && progress < 100 ? (
        <CardFooter className="flex-col items-start">
          <Progress value={progress} className="my-2" />
          <div className="flex-row flex justify-between w-full">
            <div>
              {/* TODO: I think this is mathed wrong */}
              <p className="text-sm font-medium leading-none">
                {dayjs.duration({ seconds: remainingTime }).humanize()} - {prettyBytes(speed)}/sec
              </p>
            </div>
            <p className="text-sm font-medium leading-none">
              {prettyBytes(downloaded)} / {prettyBytes(totalLength)} - {Math.floor(progress)}%
            </p>
          </div>
        </CardFooter>
      ) : null}
    </Card>
  );
}
