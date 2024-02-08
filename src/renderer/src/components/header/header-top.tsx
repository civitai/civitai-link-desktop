import { FaCog } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ConnectionStatus } from '@/types';
import { TbPlugConnected, TbPlugConnectedX } from 'react-icons/tb';
import { ResourceType } from '@/types';
import logoDark from '@/assets/logo_dark_mode.png';
import logoLight from '@/assets/logo_light_mode.png';

export function HeaderTop() {
  const { clearSettings, connectionStatus } = useElectron();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  function connectionRender() {
    switch (connectionStatus) {
      case ConnectionStatus.CONNECTED:
        return <TbPlugConnected color="green" />;
      case ConnectionStatus.DISCONNECTED:
        return <TbPlugConnectedX color="red" />;
      case ConnectionStatus.CONNECTING:
        return <TbPlugConnected color="orange" />;
      default:
        return <TbPlugConnectedX />;
    }
  }

  return (
    <Sheet>
      <div className="flex items-center px-4 pt-4">
        <div className="flex space-x-2 items-center">
          <img src={systemTheme ? logoDark : logoLight} alt="Civitai" />
          {connectionRender()}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div>
            <SheetTrigger>
              <FaCog size={18} className="cursor-pointer" />
            </SheetTrigger>
          </div>
        </div>
      </div>
      <SheetContent className="w-full overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 my-4">
          {/* <div className="flex items-center space-x-2">
            <Checkbox id="download_missing_preview" />
            <Label htmlFor="download_missing_preview">Download missing preview images on startup</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="download_missing_activation" />
            <Label htmlFor="download_missing_activation">Download missing activation triggers on startup</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="download_missing_nsfw_preview" />
            <Label htmlFor="download_missing_nsfw_preview">Download NSFW (adult) preview images</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="download_missing_models" />
            <Label htmlFor="download_missing_models">
              Download missing models upon reading generation parameters from prompt
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="include_hashes" />
            <Label htmlFor="include_hashes">
              Include resource hashes in image metadata (for resource auto-detection on Civitai)
            </Label>
          </div> */}
          <PathInput defaultPath="Root Models Directory" type={ResourceType.DEFAULT} />
          {/* <PathInput defaultPath="LoRA Directory" type={ResourceType.LORA} />
          <PathInput defaultPath="LyCORIS Directory" type={ResourceType.LYCORIS} /> */}
          <div className="flex items-center space-x-2 justify-center mt-6">
            <Button onClick={() => clearSettings()} variant="destructive">
              Reset Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
