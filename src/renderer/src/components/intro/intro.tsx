import { PathInput } from '@/components/path-input';
import { Button } from '@/components/ui/button';
import { ResourceType } from '@/types';
import { CodeInput } from '@/components/code-input';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';

export function Intro() {
  const [segments, setSegments] = useState<string[]>(new Array(6).fill(''));
  const [folderValue, setFolderValue] = useState<string | null>(null);

  const { setKey } = useApi();

  const submitSetKey = async () => {
    const segmentsString = segments.join('');
    if (segmentsString && segmentsString.length === 6) {
      setKey(segmentsString);
    } else {
      console.log('No input value');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <img src={logo} alt="logo" className="w-8 h-8" />
      </div>
      <div>
        <p className="mb-2">
          Copy the shortcode provided on the Civitai website and paste it into
          the input.
        </p>
        <CodeInput segments={segments} setSegments={setSegments} />
      </div>
      <div>
        <p className="mb-2">Set the default model folder.</p>
        <PathInput
          defaultPath="Root Models Directory"
          type={ResourceType.DEFAULT}
          onChange={(value) => setFolderValue(value)}
        />
      </div>
      <div className="space-x-4 justify-center flex">
        <Button
          onClick={submitSetKey}
          disabled={segments.join('').length !== 6 || !folderValue}
          variant="secondary"
          className="w-full rounded-full"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
