import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { Progress } from '@/components/ui/progress';
import { AiOutlineCloseCircle } from 'react-icons/ai';

type VaultItemDownloadProps = {
  id: number;
  url: string;
  name: string;
  type: string;
};

export function VaultItemDownload({
  id,
  url,
  name,
  type,
}: VaultItemDownloadProps) {
  const { downloadVaultItem, cancelVaultDownload } = useApi();
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  // Watch for events from download process
  useEffect(() => {
    if (id && isDownloading) {
      window.electron.ipcRenderer.on(
        `vault-download:${id}`,
        function (_, message) {
          setProgress(message.progress);
          setSpeed(message.speed);
          setRemainingTime(message.remainingTime);
          setIsDownloading(message.downloading);

          console.log('message', message);
        },
      );
    }
    return () => {
      window.electron.ipcRenderer.removeAllListeners(`vault-download:${id}`);
    };
  }, []);

  const cancel = () => {
    cancelVaultDownload(id);
  };

  const download = () => {
    console.log(id);

    downloadVaultItem({ id, url, name, type });
  };

  if (isDownloading) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <AiOutlineCloseCircle
            className="absolute w-6 h-6 cursor-pointer top-1/2 right-14 transform -translate-y-1/2"
            onClick={cancel}
          />
          <Progress value={progress} />
        </TooltipTrigger>
        <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
          <p className="text-xs">Cancel download</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Download
          className="absolute w-6 h-6 cursor-pointer top-1/2 right-14 transform -translate-y-1/2"
          onClick={download}
        />
      </TooltipTrigger>
      <TooltipContent className="max-w-[360px] bg-background/90 rounded mr-2 p-1 border z-50">
        <p className="text-xs">Download to disk</p>
      </TooltipContent>
    </Tooltip>
  );
}
