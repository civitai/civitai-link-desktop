import { BrainCircuit, Bot } from 'lucide-react';
import { Button } from '../ui/button';
import { useWizard } from 'react-use-wizard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PathInput } from '@/components/inputs/path-input';
import { ResourceType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/use-api';
import { useElectron } from '@/providers/electron';

type IntroSdProps = {
  folderValue: string | null;
  setFolderValue: React.Dispatch<React.SetStateAction<string | null>>;
  sdType: string;
  setSdType: React.Dispatch<React.SetStateAction<string>>;
};

export function IntroSd(props: IntroSdProps) {
  const { nextStep } = useWizard();
  const { setNSFW } = useApi();
  const { settings } = useElectron();

  return (
    <div className="space-y-4 flex flex-1 flex-col">
      <div className="space-y-2">
        <div className="flex justify-center mb-8">
          <BrainCircuit size={48} />
          <Bot size={48} />
        </div>
        <h1 className="text-xl">Stable Diffusion Installation</h1>
        <p className="text-sm text-primary mb-2">
          Select which stable diffusion software you are using and where the
          models are stored. We'll take care of the rest.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="nsfw"
          checked={settings.nsfw}
          onCheckedChange={(checked: boolean) => setNSFW(checked)}
        />
        <label
          htmlFor="nsfw"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Add NSFW images to model preview
        </label>
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        <RadioGroup
          defaultValue={props.sdType}
          className="flex flex-col space-y-4"
        >
          <div className="flex space-x-2">
            <RadioGroupItem id="a1111" value="a1111" />
            <label
              htmlFor="a1111"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Automatic 1111
            </label>
          </div>
          <div className="flex space-x-2">
            <RadioGroupItem id="comfiyui" value="comfyui" />
            <label
              htmlFor="comfyui"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              ComfyUI
            </label>
          </div>
          <div className="flex space-x-2">
            <RadioGroupItem id="symlink" value="symlink" />
            <label
              htmlFor="symlink"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Symlink
            </label>
          </div>
        </RadioGroup>
        <div className="flex flex-col gap-y-4 overflow-hidden">
          <PathInput
            type={ResourceType.DEFAULT}
            onChange={(value) => props.setFolderValue(value)}
            showToast={false}
          />
        </div>
        <Button
          variant="secondary"
          className="w-full rounded-full py-2"
          disabled={!props.folderValue}
          onClick={nextStep}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
