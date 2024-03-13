import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApi } from '@/hooks/use-api';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function Settings() {
  const { clearSettings, settings, apiKey } = useElectron();
  const { setNSFW, setApiKey } = useApi();
  const [key, setKey] = useState<string>(apiKey || '');

  const onClickSaveApiKey = () => {
    setApiKey(key);
    toast({
      title: 'API Key Saved',
    });
  };

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
          <div className="flex flex-col items-center space-y-2">
            <label
              htmlFor="nsfw"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center w-full"
            >
              Civitai API Key (
              <a
                href="https://civitai.com/user/account"
                target="_blank"
                className="text-blue-500 underline"
              >
                Generate Key
              </a>
              )
            </label>
            <div className="flex items-center w-full space-x-2">
              <Input
                placeholder="API Key"
                onChange={(e) => setKey(e.target.value)}
                onPaste={(e) =>
                  setApiKey(e.clipboardData.getData('text/plain'))
                }
                value={key}
              />
              <Button onClick={onClickSaveApiKey} className="p-3">
                <Save size={18} />
              </Button>
            </div>
          </div>
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
