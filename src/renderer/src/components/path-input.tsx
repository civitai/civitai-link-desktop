import { useState } from 'react';
import { Button } from './ui/button';
import { GoFileDirectory } from 'react-icons/go';

type PathInputProps = {
  defaultPath?: string;
};

export function PathInput(props: PathInputProps) {
  const [dir, setDir] = useState<string | null>(null);

  async function getDir() {
    const selectedDir = await window.api.selectFolder();

    setDir(selectedDir !== null && selectedDir !== undefined ? selectedDir : null);
  }

  return (
    <div className="w-full flex flex-row justify-between gap-4">
      <div className="px-4 py-2 mb-2 border w-full rounded-lg">{dir || props.defaultPath}</div>
      <Button onClick={getDir}>
        <GoFileDirectory />
      </Button>
    </div>
  );
}
