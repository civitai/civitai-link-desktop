import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { useApi } from '@/hooks/use-api';
import { ellipsis } from '@/lib/utils';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { useEffect, useState } from 'react';
import { GoFileDirectory } from 'react-icons/go';

type PathInputProps = {
  type: keyof typeof ResourceType;
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
    getRootPath,
  } = useApi();
  const { rootResourcePath } = useElectron();
  const [dirPath, setDirPath] = useState<string | null>();

  useEffect(() => {
    const fetchResourcePath = async () => {
      if (type === 'DEFAULT') {
        const root = await getRootPath();
        setDirPath(root);
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

    if (type !== 'DEFAULT') {
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
