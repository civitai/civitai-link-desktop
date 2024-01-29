import { useEffect, useState } from 'react';
import { Item } from './components/item';
import { KeyInput } from './key-input';
import { Header } from './components/header';

function App() {
  const [key, setKey] = useState(null);
  const [resources, setResources] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    window.electron.ipcRenderer.on('upgrade-key', function (_, message) {
      setKey(message.key);
    });
  }, []);

  useEffect(() => {
    window.electron.ipcRenderer.on('resource-add', function (_, message) {
      // @ts-ignore
      setResources((resources) => [...resources, message]);
    });
  }, []);

  // TODO: Add screens to prevent flickr when checking key
  return (
    <div className="container mx-auto p-4">
      {/* Maybe look at menubar */}
      <Header />
      {key ? (
        <div className="mb-2">
          <h1>Downloading</h1>
          {resources.map((resource) => (
            <Item id={resource.id} name={resource.name} key={resource.id} />
          ))}
        </div>
      ) : (
        <KeyInput />
      )}
    </div>
  );
}

export default App;
