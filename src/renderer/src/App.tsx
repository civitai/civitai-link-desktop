import { Item } from './components/item';

function App() {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-2">
        <h1>Downloading</h1>
        <Item />
      </div>
      <div>
        <h1>Available Models</h1>
        <Item />
      </div>
    </div>
  );
}

export default App;
