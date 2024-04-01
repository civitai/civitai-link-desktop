import { PartyPopper } from 'lucide-react';
import { Button } from '../ui/button';

type IntroCongratsProps = {
  submit: () => void;
};

export function IntroCongrats(props: IntroCongratsProps) {
  return (
    <div className="space-y-4 flex flex-1 flex-col">
      <div className="space-y-2">
        <div className="flex justify-center mb-8">
          <PartyPopper size={48} />
        </div>
        <h1 className="text-xl">Congrats!</h1>
        <p className="text-sm text-primary mb-2">
          You are ready to start downloading models from Civitai
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        <Button
          variant="secondary"
          className="w-full rounded-full py-2"
          onClick={props.submit}
        >
          Let's Go!
        </Button>
      </div>
    </div>
  );
}
