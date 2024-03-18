import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/use-api';
import { ApiKeyInput } from '../api-key-input';

export function Settings() {
  const { clearSettings, settings } = useElectron();
  const { setNSFW } = useApi();

  return (
    <SheetContent className="w-full p-0">
      <SheetHeader>
        <SheetTitle className="pb-4">Settings</SheetTitle>
      </SheetHeader>
      <div className="overflow-y-scroll max-h-screen pb-20 w-full px-4">
        <div className="grid gap-6">
          <h1 className="text-xl">General Settings</h1>
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
          <ApiKeyInput />
          <h1 className="text-xl">Model Settings</h1>
          {(Object.keys(ResourceType) as Array<keyof typeof ResourceType>).map(
            (key) => (
              <div className="flex flex-col gap-y-4 overflow-hidden" key={key}>
                <Label className="text-primary">
                  {key === 'DEFAULT' ? 'Root Model' : key} Folder
                </Label>
                <PathInput
                  defaultPath="Root Models Directory"
                  type={ResourceType[key]}
                />
              </div>
            ),
          )}
          <div className="bg-red-200 border border-red-400 py-4 px-10 rounded mt-6">
            <p className="text-center text-black font-bold uppercase mb-2">
              Danger Zone
            </p>
            <div className="flex flex-col justify-center">
              <Button
                onClick={() => clearSettings()}
                variant="destructive"
                className="py-4"
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}
