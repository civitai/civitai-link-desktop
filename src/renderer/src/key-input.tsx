import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { useApi } from './hooks/use-api';

export function KeyInput() {
  const [inputValue, setInputValue] = useState<string | null>(null);
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

  return (
    <div className="container mx-auto p-4">
      <Input type="text" placeholder="Civitai Link Key" onChange={(e) => handleSetInputValue(e.target.value)} />
      <Button onClick={submitSetKey}>Set Link Key</Button>
    </div>
  );
}
