import { Button } from '../ui/button';
import { useWizard } from 'react-use-wizard';
import * as linkAnimation from '../../assets/lotties/link-animation.json';
import Lottie from 'react-lottie-player';

export function IntroWelcome() {
  const { nextStep } = useWizard();

  return (
    <div className="space-y-4 flex flex-1 flex-col">
      <div className="space-y-2">
        <div className="flex justify-center mb-8">
          <Lottie loop play animationData={linkAnimation} />
        </div>
        <h1 className="text-xl">Welcome to Link</h1>
        <p className="text-sm text-primary mb-2">
          Add models from Civitai to your Stable Diffusion installation with one
          click.
        </p>
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        <Button
          variant="secondary"
          className="w-full rounded-full py-2"
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
