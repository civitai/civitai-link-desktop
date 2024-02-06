import { Progress } from '@/components/ui/progress';
import { useEffect, useState } from 'react';

type ItemProps = {
  id: string;
  name: string;
};

export function ActivityItem(props: ItemProps) {
  const [progress, setProgress] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [downloaded, setDownloaded] = useState(0);

  useEffect(() => {
    window.electron.ipcRenderer.on(`resource-download:${props.id}`, function (_, message) {
      setProgress(message.progress);
      setTotalLength(message.totalLength);
      setDownloaded(message.downloaded);
    });
  }, []);

  return (
    <div className="flex flex-row">
      <div>
        <h1>{props.name}</h1>
        {progress < 100 ? (
          <>
            <Progress value={progress} />
            <p>
              {Math.floor(downloaded / 1024 ** 2)}MB / {Math.floor(totalLength / 1024 ** 2)}MB - {Math.floor(progress)}%
            </p>
          </>
        ) : (
          <p>{Math.floor(totalLength / 1024 ** 2)}MB</p>
        )}
      </div>
    </div>
  );
}
