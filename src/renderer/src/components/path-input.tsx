import { useState } from 'react';
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
  const [dir, setDir] = useState<string | null>(null);
  const { selectDirectory, setRootResourcePath, setResourcePath } = useApi();
  // TODO: Expose model type paths based on props.type
  // Test with a Lora and the folder newLora
  const { rootResourcePath } = useElectron();
  const dirPath = dir || rootResourcePath || props.defaultPath || '';

  async function getDir() {
    const selectedDir = await selectDirectory();
    const directory =
      selectedDir !== null && selectedDir !== undefined ? selectedDir : '';

    setDir(directory);

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
    <div className="overflow-hidden">
      <div className="w-full flex flex-row justify-between gap-4 items-center">
        <div className="px-4 py-2 border bg-slate-700/20 rounded-lg overflow-hidden w-full">
          <p className="text-ellipsis overflow-hidden dark:text-white/40 text-black/40 cursor-default">
            {dirPath}
          </p>
        </div>
        <Button onClick={getDir}>
          <GoFileDirectory />
        </Button>
      </div>
    </div>
  );
}
