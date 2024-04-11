import { PanelWrapper } from '@/layout/panel-wrapper';
import { Button } from '@/components/ui/button';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/use-api';
import { ApiKeyInput } from '@/components/api-key-input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Settings() {
  const { clearSettings, settings, appVersion } = useElectron();
  const { setNSFW } = useApi();

  return (
    <PanelWrapper>
      <>
        <div className="flex items-center px-4 py-2 min-h-14 justify-between">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-primary">v{appVersion}</p>
        </div>
        <Separator />

        <ScrollArea className="h-screen">
          <div className="grid gap-6 p-4 pb-[145px] max-w-[600px]">
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
            {(
              Object.keys(ResourceType) as Array<keyof typeof ResourceType>
            ).map((key) => (
              <div className="flex flex-col gap-y-4 overflow-hidden" key={key}>
                <Label className="text-primary">
                  {key === 'DEFAULT' ? 'Root Model' : key} Folder
                </Label>
                <PathInput type={ResourceType[key]} />
              </div>
            ))}
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
        </ScrollArea>
      </>
    </PanelWrapper>
  );
}
