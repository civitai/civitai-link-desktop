import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PathInput } from '@/components/path-input';
import { useElectron } from '@/providers/electron';
import { ResourceType } from '@/types';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { FaRegSave } from 'react-icons/fa';
import { Label } from '../ui/label';
import { toast } from '../ui/use-toast';

export function Settings() {
  const { clearSettings, key } = useElectron();
  const { setKey } = useApi();
  const [inputValue, setInputValue] = useState<string | null>(key || '');

  useEffect(() => {
    setInputValue(key || '');
  }, [key]);

  const submitSetKey = async () => {
    if (inputValue) {
      setKey(inputValue);

      toast({
        title: 'Link Key Updated',
        description: 'Link key has been updated successfully',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Link Key Empty',
        description: 'No link key provided',
      });
    }
  };

  const handleSetInputValue = (value: string) => {
    setInputValue(value);
  };

  return (
    <SheetContent className="w-full overflow-y-scroll">
      <SheetHeader>
        <SheetTitle>Settings</SheetTitle>
      </SheetHeader>
      <div className="grid gap-4 my-4">
        <Label>Civitai Link Key</Label>
        <div className="flex items-center space-x-4 justify-center">
          <Input
            type="text"
            value={inputValue || ''}
            onChange={(e) => handleSetInputValue(e.target.value)}
            className="overflow-ellipsis"
          />
          <Button onClick={submitSetKey} disabled={!inputValue}>
            <FaRegSave />
          </Button>
        </div>
        {(Object.keys(ResourceType) as Array<keyof typeof ResourceType>).map(
          (key) => (
            <>
              <Label>{key === 'DEFAULT' ? 'Root Model' : key} Folder</Label>
              <PathInput
                defaultPath="Root Models Directory"
                type={ResourceType[key]}
              />
            </>
          ),
        )}
        <div className="flex items-center space-x-2 justify-center mt-6">
          <Button onClick={() => clearSettings()} variant="destructive">
            Reset Settings
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
