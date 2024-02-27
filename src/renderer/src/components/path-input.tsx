import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { GoFileDirectory } from 'react-icons/go';
import { useApi } from '@/hooks/use-api';
import { ResourceType } from '@/types';
import { useElectron } from '@/providers/electron';
import { toast } from './ui/use-toast';

type PathInputProps = {
  defaultPath?: string;
  type: ResourceType;
  onChange?: (value: string) => void;
};

export function PathInput(props: PathInputProps) {
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
      const resourecePath = await getResourcePath(props.type);

      if (props.type === ResourceType.DEFAULT) {
        setDirPath(rootResourcePath);
      } else {
        setDirPath(resourecePath);
      }
    };

    fetchResourcePath();
  }, []);

  async function getDir() {
    const selectedDir = await selectDirectory();
    const directory =
      selectedDir !== null && selectedDir !== undefined ? selectedDir : '';

    if (directory === '') return;

    setDirPath(directory);

    if (props.type !== ResourceType.DEFAULT) {
      setResourcePath(props.type, directory);

      toast({
        title: `${props.type} Model directory set`,
        description: 'Root Model directory has been set successfully',
      });
    } else {
      setRootResourcePath(directory);

      toast({
        title: 'Root Model directory set',
        description: 'Root Model directory has been set successfully',
      });
    }

    if (props.onChange) {
      props.onChange(directory);
    }
  }

  return (
    <div className="flex flex-row gap-x-4 items-center overflow-hidden">
      <div className="p-2 border border-[#373A40] bg-[#2C2E33] rounded-lg overflow-hidden shrink">
        <p className="text-sm text-ellipsis overflow-hidden dark:text-[#ADB5BD] text-black/40 cursor-default">
          {dirPath || 'Select a directory'}
        </p>
      </div>
      <Button onClick={getDir} className="p-3 min-h-14 min-w-14">
        <GoFileDirectory size={24} />
      </Button>
    </div>
  );
}
