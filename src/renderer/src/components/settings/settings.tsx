import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Label } from '../ui/label';

export function Settings() {
  const { clearSettings } = useElectron();

  return (
    <SheetContent className="w-full p-0">
      <SheetHeader>
        <SheetTitle className="py-4">Settings</SheetTitle>
      </SheetHeader>
      <div className="h-full overflow-y-auto pb-20 w-full px-4">
        <div className="grid gap-6">
          {(Object.keys(ResourceType) as Array<keyof typeof ResourceType>).map(
            (key) => (
              <div className="flex flex-col gap-y-4 overflow-hidden" key={key}>
                <Label>{key === 'DEFAULT' ? 'Root Model' : key} Folder</Label>
                <PathInput
                  defaultPath="Root Models Directory"
                  type={ResourceType[key]}
                />
              </div>
            ),
          )}
          <div className="bg-red-200 border border-red-400 pt-2 px-10 rounded mt-6">
            <p className="text-center text-black font-bold uppercase">
              Danger Zone
            </p>
            <div className="py-10  flex flex-col justify-center">
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
