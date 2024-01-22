import { useState } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

export function KeyInput() {
  const [inputValue, setInputValue] = useState<string | null>(null);

  const submitSetKey = async () => {
    if (inputValue) {
      // TODO: Maybe make a hook where the window object can be established from preload index.d.ts
      await window.api.setKey(inputValue);
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
