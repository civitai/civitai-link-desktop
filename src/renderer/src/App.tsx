import { Item } from './components/item';
import { KeyInput } from './key-input';
import { Header } from './components/header';
import { useElectron } from './providers/electron';

function App() {
  const { key, resources } = useElectron();

  // TODO: Add screens to prevent flickr when checking key
  return (
    <div className="container mx-auto p-4">
      {/* Maybe look at menubar */}
      <Header />
      {key ? (
        <div className="mb-2">
          <h1>Downloading</h1>
          {resources?.map((resource) => <Item id={resource.id} name={resource.name} key={resource.id} />)}
        </div>
      ) : (
        <KeyInput />
      )}
    </div>
  );
}

export default App;
