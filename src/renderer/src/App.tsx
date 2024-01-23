import { useEffect, useState } from 'react';
import { Item } from './components/item';
import { KeyInput } from './key-input';
// import { ipcRenderer } from 'electron';

function App() {
  const [key, setKey] = useState(null);

  useEffect(() => {
    window.electron.ipcRenderer.on('upgrade-key', function (_, message) {
      console.log('MESSAGE', message);
      setKey(message.key);
    });
  }, []);

  return (
    <div className="container mx-auto p-4">
      {key ? (
        <>
          <h1>Key: {key}</h1>
          <div className="mb-2">
            <h1>Downloading</h1>
            <Item />
          </div>
          <div>
            <h1>Available Models</h1>
            <Item />
          </div>
        </>
      ) : (
        <KeyInput />
      )}
    </div>
  );
}

export default App;
