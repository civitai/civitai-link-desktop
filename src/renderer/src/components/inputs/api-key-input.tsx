import { Button } from '@/components/ui/button';
import { useElectron } from '@/providers/electron';
import { useApi } from '@/hooks/use-api';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon, Save } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

export function ApiKeyInput() {
  const { apiKey } = useElectron();
  const { setApiKey } = useApi();
  const [key, setKey] = useState<string>(apiKey || '');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onClickSaveApiKey = () => {
    setApiKey(key);
    toast({
      title: 'API Key Saved',
    });
  };

  return (
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
        <div className="relative w-full">
          <Input
            type={isVisible ? 'text' : 'password'}
            placeholder="API Key"
            onChange={(e) => setKey(e.target.value)}
            onPaste={(e) => setApiKey(e.clipboardData.getData('text/plain'))}
            value={key}
          />
          <div
            className="cursor-pointer absolute right-2 top-3 text-muted-foreground"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? (
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
        </div>
        <Button onClick={onClickSaveApiKey} className="p-3">
          <Save size={18} />
        </Button>
      </div>
    </div>
  );
}
