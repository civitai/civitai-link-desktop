import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CodeInput } from '../inputs/code-input';
import { useApi } from '@/hooks/use-api';
import { useState } from 'react';
import logo from '@/assets/logo.png';

export function ResetKeyModal() {
  const [segments, setSegments] = useState<string[]>(new Array(6).fill(''));

  const { setKey } = useApi();

  const submitSetKey = async () => {
    const segmentsString = segments.join('');
    if (segmentsString && segmentsString.length === 6) {
      setKey(segmentsString);
      setSegments(new Array(6).fill(''));
    } else {
      console.log('No input value');
    }
  };

  return (
    <DialogContent className="max-w-[360px] rounded p-4">
      <DialogHeader>
        <DialogTitle>
          <img src={logo} alt="logo" className="w-10 h-10 mb-4" />
        </DialogTitle>
        <DialogDescription className="text-white text-left">
          Copy the shortcode provided on the Civitai website and paste it onto
          the input.
        </DialogDescription>
      </DialogHeader>
      <CodeInput segments={segments} setSegments={setSegments} />
      <DialogFooter>
        <DialogClose asChild>
          <Button
            onClick={submitSetKey}
            disabled={segments.join('').length !== 6}
            variant="secondary"
            className="w-full rounded-full py-2"
          >
            Reconnect
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
