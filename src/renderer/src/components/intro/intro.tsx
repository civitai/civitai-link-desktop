import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/code-input';
import logo from '@/assets/logo.png';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { KeyRound } from 'lucide-react';

// import { PathInput } from '@/components/path-input';
// import { ResourceType } from '@/types';
// import { Label } from '@/components/ui/label';

export function Intro() {
  const [segments, setSegments] = useState<string[]>(new Array(6).fill(''));
  const [folderValue, setFolderValue] = useState<string | null>(null);

  const { setKey, init } = useApi();

  const submitSetKey = async () => {
    const segmentsString = segments.join('');
    if (segmentsString && segmentsString.length === 6) {
      setKey(segmentsString);
      init();
    } else {
      console.log('No input value');
    }
  };

  // Intro welcome to Link
  // Connect your key
  // Select your SD program - <Bot/> <BrainCircuit/>
  // Select your model folders (maybe not needed unless symlink?) <FileBox/>
  // Congrats, you're all set up! <PartyPopper/> (confetti animation)

  // Add framer-motion for wizard transitions

  return (
    <div className="container mx-auto p-6 space-y-8 flex flex-col h-screen">
      <div>
        <img src={logo} alt="logo" className="w-10 h-10" />
      </div>
      <div className="space-y-4 flex flex-1 flex-col">
        <div className="space-y-2">
          <div className="flex justify-center mb-8">
            <KeyRound size={48} />
          </div>
          <h1 className="text-xl">Connect your key</h1>
          <p className="text-sm text-primary mb-2">
            Copy the shortcode provided on the Civitai website and paste it into
            the input.
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center space-y-4">
          <CodeInput segments={segments} setSegments={setSegments} />
          <Button
            onClick={submitSetKey}
            disabled={segments.join('').length !== 6 || !folderValue}
            variant="secondary"
            className="w-full rounded-full py-2"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="flex flex-col gap-y-4 overflow-hidden">
        <Label>Set the default model folder</Label>
        <PathInput
          defaultPath="Root Models Directory"
          type={ResourceType.DEFAULT}
          onChange={(value) => setFolderValue(value)}
        />
      </div> */
}
