import { ApiKeyInput } from '@/components/inputs/api-key-input';
import { PathInput } from '@/components/inputs/path-input';
import { DeviceCode } from '@/components/oauth/device-code';
import { SignedInRow } from '@/components/settings/signed-in-row';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useApi } from '@/hooks/use-api';
import { useOAuthLogin } from '@/hooks/use-oauth-login';
import { PanelWrapper } from '@/layout/panel-wrapper';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { RefreshCcw } from 'lucide-react';

export function Settings() {
  const { clearSettings, settings, appVersion, updateAvailable, DEBUG } =
    useElectron();
  const { setNSFW, setAlwaysOnTop, restartApp, setConcurrent } = useApi();
  const { signedIn, status, message, pending, login, cancel } = useOAuthLogin();

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
              <Switch
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
            <div className="flex items-center space-x-2">
              <Switch
                id="alwaysOnTop"
                checked={settings.alwaysOnTop}
                onCheckedChange={(checked: boolean) => setAlwaysOnTop(checked)}
              />
              <label
                htmlFor="alwaysOnTop"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Window always on top
              </label>
            </div>
            {DEBUG ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  id="concurrent"
                  name="concurrent"
                  min="1"
                  max="30"
                  className="max-w-16"
                  value={settings.concurrent}
                  onChange={(e) => setConcurrent(Number(e.target.value))}
                />
                <label
                  htmlFor="concurrent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-col flex"
                >
                  Single download connections
                  <span className="text-xs">Min: 1 / Max: 30</span>
                </label>
              </div>
            ) : null}
            {signedIn ? (
              <SignedInRow />
            ) : (
              <div className="grid gap-4">
                {status === 'error' || pending ? (
                  <p className="text-sm text-primary">
                    {status === 'error'
                      ? message
                      : 'Approve in your browser to connect this device.'}
                  </p>
                ) : null}
                <DeviceCode />
                {pending ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-full py-2"
                    onClick={cancel}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full rounded-full py-2"
                    onClick={login}
                  >
                    {status === 'error' ? 'Try again' : 'Sign in with Civitai'}
                  </Button>
                )}
                <ApiKeyInput />
              </div>
            )}
            <h1 className="text-xl">Model Settings</h1>
            {(
              Object.keys(ResourceType) as Array<keyof typeof ResourceType>
            ).map((key) => (
              <div className="flex flex-col gap-y-4 overflow-hidden" key={key}>
                <Label className="text-primary">
                  {ResourceType[key] === ResourceType.DEFAULT
                    ? 'Root Model'
                    : ResourceType[key]}{' '}
                  Folder
                </Label>
                <PathInput type={key} />
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
