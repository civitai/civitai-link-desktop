import { Header } from '@/components/header';
import { useElectron } from '@/providers/electron';
import logo from '@/assets/logo.png';
import { Activity } from '@/components/activity';
import { PathInput } from '@/components/path-input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/use-api';
import { ResourceType } from '@/types';
import { CodeInput } from './components/code-input';

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

  return (
    <div className="h-lvh">
      {/* This is used if you want a custom drag top bar */}
      {/* <div className="titlebar" /> */}
      {key ? (
        <>
          <Header />
          <div className="container mx-auto p-4 mb-2 overflow-y-scroll h-full">
            <Activity />
          </div>
        </>
      ) : (
        <div className="container mx-auto p-6 space-y-8">
          <div>
            <img src={logo} alt="logo" className="w-8 h-8" />
          </div>
          <div>
            <p className="mb-2">
              Copy the shortcode provided on the Civitai website and paste it
              into the input.
            </p>
            {/* <Input
              type="text"
              placeholder="Civitai Link Key"
              onChange={(e) => handleSetInputValue(e.target.value)}
            /> */}
            <CodeInput />
          </div>
          <div>
            <p className="mb-2">Set the default model folder.</p>
            <PathInput
              defaultPath="Root Models Directory"
              type={ResourceType.DEFAULT}
              onChange={(value) => setFolderValue(value)}
            />
          </div>
          <div className="space-x-4 justify-center flex">
            <Button
              onClick={submitSetKey}
              disabled={!inputValue || !folderValue}
              variant="secondary"
              className="w-full rounded-full"
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
