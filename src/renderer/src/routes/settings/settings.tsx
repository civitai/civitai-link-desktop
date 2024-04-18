import { PanelWrapper } from '@/layout/panel-wrapper';
import { Button } from '@/components/ui/button';
import { PathInput } from '@/components/inputs/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/use-api';
import { ApiKeyInput } from '@/components/inputs/api-key-input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCcw } from 'lucide-react';

export function Settings() {
  const { clearSettings, settings, appVersion, updateAvailable } =
    useElectron();
  const { setNSFW, restartApp } = useApi();

  return (
    <PanelWrapper>
      <>
        <div className="flex items-center px-4 py-2 min-h-14 justify-between">
          <h1 className="text-xl font-bold">Settings</h1>
          <div className="flex gap-2 items-center">
            {updateAvailable ? (
              <RefreshCcw
                size={16}
                className="cursor-pointer"
                onClick={restartApp}
              />
            ) : null}
            <p className="text-sm text-primary">v{appVersion}</p>
          </div>
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
                <Label className="text-primary capitalize">
                  {ResourceType[key] === ResourceType.DEFAULT
                    ? 'Root Model'
                    : ResourceType[key].toLowerCase()}{' '}
                  Folder
                </Label>
                <PathInput type={key as ResourceType} />
              </div>
            ))}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-36 py-4">
                  Reset Settings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Reseting this will clear all settings, keys, paths and
                    connections within the Link app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="p-2">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearSettings}
                    className="p-2 destructive"
                  >
                    Reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ScrollArea>
      </>
    </PanelWrapper>
  );
}
