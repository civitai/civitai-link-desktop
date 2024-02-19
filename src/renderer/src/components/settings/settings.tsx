import { Button } from '@/components/ui/button';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Label } from '@/components/ui/label';
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
        <Label>Root Model Folder</Label>
        <PathInput
          defaultPath="Root Models Directory"
          type={ResourceType.DEFAULT}
        />
        {/* <PathInput defaultPath="LoRA Directory" type={ResourceType.LORA} />
          <PathInput defaultPath="LyCORIS Directory" type={ResourceType.LYCORIS} /> */}
        <div className="flex items-center space-x-2 justify-center mt-6">
          <Button onClick={() => clearSettings()} variant="destructive">
            Reset Settings
          </Button>
        </div>
      </div>
    </SheetContent>
  );
}
