import { Header } from '@/components/header';
import { useElectron } from '@/providers/electron';
import logo from '@/assets/logo.png';
import { Activity } from '@/components/activity';
import { PathInput } from '@/components/path-input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/use-api';

function App() {
  const { appLoading, key } = useElectron();
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [folderValue, setFolderValue] = useState<string | null>(null);
  const { setKey } = useApi();

  const submitSetKey = async () => {
    if (inputValue) {
      setKey(inputValue);
    } else {
      console.log('No input value');
    }
  };

  const handleSetInputValue = (value: string) => {
    setInputValue(value);
  };

  if (appLoading)
    return (
      <div className="flex flex-1 justify-center items-center h-screen">
        <img src={logo} alt="loading" className="w-48 h-48" />
      </div>
    );

  // TODO: Add screens to prevent flickr when checking key
  // resources should become the activity list
  return (
    <div>
      {key ? (
        <>
          <Header />
          <div className="container mx-auto p-4 mb-2">
            <Activity />
          </div>
        </>
      ) : (
        <div className="container mx-auto p-4 space-y-8">
          <div>
            <p>Copy the shortcode provided on the Civitai website and paste it into the input.</p>
            <Input type="text" placeholder="Civitai Link Key" onChange={(e) => handleSetInputValue(e.target.value)} />
          </div>
          <div>
            <p>Set the default model folder for your A1111 installation.</p>
            <PathInput defaultPath="Root Models Directory" type="default" onChange={(value) => setFolderValue(value)} />
          </div>
          <div className="space-x-4 justify-center flex">
            <Button onClick={submitSetKey} disabled={!inputValue && !folderValue}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
