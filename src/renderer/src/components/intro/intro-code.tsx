import { Button } from '@/components/ui/button';
import { CodeInput } from '@/components/inputs/code-input';
import { KeyRound } from 'lucide-react';
import { useWizard } from 'react-use-wizard';

type IntroCodeProps = {
  segments: string[];
  setSegments: React.Dispatch<React.SetStateAction<string[]>>;
};

export function IntroCode(props: IntroCodeProps) {
  const { nextStep } = useWizard();

  return (
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
        <CodeInput segments={props.segments} setSegments={props.setSegments} />
        <Button
          onClick={nextStep}
          disabled={props.segments.join('').length !== 6}
          variant="secondary"
          className="w-full rounded-full py-2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
