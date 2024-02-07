import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from 'dayjs';

type ItemProps = Resource;

export function ActivityItem(props: ItemProps) {
  const [progress, setProgress] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [downloaded, setDownloaded] = useState(0);

  useEffect(() => {
    if (props.id) {
      window.electron.ipcRenderer.on(`resource-download:${props.id}`, function (_, message) {
        setProgress(message.progress);
        setTotalLength(message.totalLength);
        setDownloaded(message.downloaded);
      });
    }
  }, []);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>
          <Badge color="primary">{props.type}</Badge>
        </CardTitle>
        <CardDescription>{props.modelVersionName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{props.modelName}</p>
            {props.downloadDate ? (
              <p className="text-sm text-muted-foreground">{dayjs(props.downloadDate).format('YYYY-MM-DD')}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
      {progress !== 0 && progress < 100 ? (
        <CardFooter className="flex-col items-end">
          <Progress value={progress} />
          <p>
            {Math.floor(downloaded / 1024 ** 2)}MB / {Math.floor(totalLength / 1024 ** 2)}MB - {Math.floor(progress)}%
          </p>
        </CardFooter>
      ) : null}
    </Card>
  );
}
