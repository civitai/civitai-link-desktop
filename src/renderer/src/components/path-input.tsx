import { useState } from 'react';
import { Button } from './ui/button';
import { GoFileDirectory } from 'react-icons/go';
import { useApi } from '@/hooks/use-api';
// import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';

type PathInputProps = {
  defaultPath?: string;
  type: ResourceType;
  onChange?: (value: string) => void;
};

// TODO: ResourceType isnt being defined properly for client
export function PathInput(props: PathInputProps) {
  const [dir, setDir] = useState<string | null>(null);
  const { selectDirectory, setRootResourcePath } = useApi();
  // const { modelDirectories } = useElectron();

  async function getDir() {
    const selectedDir = await selectDirectory();
    const directory = selectedDir !== null && selectedDir !== undefined ? selectedDir : '';

    setDir(directory);

    // TODO: ResourceType is not defined
    if (props.type !== ResourceType.DEFAULT) {
      // TODO: use setPath but have it merge with root path
      // setRootResourcePath('model', directory);
      // setRootResourcePath('lora', `${directory}/Lora`);
    } else {
      setRootResourcePath(directory);
    }

    if (props.onChange) {
      props.onChange(directory);
    }
  }

  return (
    <div className="overflow-hidden">
      <div className="w-full flex flex-row justify-between gap-4 items-center">
        <div className="px-4 py-2 border bg-slate-700/20 rounded-lg overflow-hidden w-full">
          <p className="text-ellipsis overflow-hidden text-white/40 cursor-default">{dir || props.defaultPath}</p>
        </div>
        <Button onClick={getDir}>
          <GoFileDirectory />
        </Button>
      </div>
    </div>
  );
}
