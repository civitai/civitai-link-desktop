import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { GoFileDirectory } from 'react-icons/go';
import { useApi } from '@/hooks/use-api';
import { ResourceType } from '@/types';
import { useElectron } from '@/providers/electron';
import { toast } from '../ui/use-toast';
import { ellipsis } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PathInputProps = {
  type: ResourceType;
  onChange?: (value: string) => void;
  showToast?: boolean;
};

export function PathInput({
  type,
  onChange,
  showToast = true,
}: PathInputProps) {
  const {
    selectDirectory,
    setRootResourcePath,
    setResourcePath,
    getResourcePath,
  } = useApi();
  const { rootResourcePath } = useElectron();
  const [dirPath, setDirPath] = useState<string | null>();

  useEffect(() => {
    const fetchResourcePath = async () => {
      if ((type as string) === 'DEFAULT') {
        setDirPath(rootResourcePath);
      } else {
        const resourecePath = await getResourcePath(type);
        setDirPath(resourecePath);
      }
    };

    fetchResourcePath();
  }, [rootResourcePath]);

  async function getDir() {
    const selectedDir = await selectDirectory(dirPath || '');
    const directory =
      selectedDir !== null && selectedDir !== undefined ? selectedDir : '';

    if (directory === '') return;

    setDirPath(directory);

    if ((type as string) !== 'DEFAULT') {
      setResourcePath(type, directory);

      if (showToast) {
        toast({
          // @ts-ignore
          title: `${ResourceType[type]} Model directory set`,
          // @ts-ignore
          description: `${ResourceType[type]} Model directory has been set successfully`,
        });
      }
    } else {
      setRootResourcePath(directory);

      if (showToast) {
        toast({
          title: 'Root Model directory set',
          description: 'Root Model directory has been set successfully',
        });
      }
    }

    if (onChange) {
      onChange(directory);
    }
  }

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="w-full">
        <Tooltip>
          <TooltipTrigger className="text-left w-full">
            <div className="p-2 border bg-secondary dark:border-[#373A40] dark:bg-[#2C2E33] rounded-lg overflow-hidden cursor-default">
              <p className="text-sm text-ellipsis overflow-hidden dark:text-[#ADB5BD] text-black/40">
                {ellipsis({ str: dirPath || 'Select a directory' })}
              </p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[360px] ml-4 bg-background">
            <p>{dirPath || 'Select a directory'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Button onClick={getDir} className="p-3">
        <GoFileDirectory size={16} />
      </Button>
    </div>
  );
}
