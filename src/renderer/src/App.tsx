import { KeyInput } from './key-input';
import { Header } from './components/header';
import { useElectron } from './providers/electron';
import logo from './assets/logo.png';
import { Activity } from './components/activity';

function App() {
  const { appLoading, key } = useElectron();

  if (appLoading)
    return (
      <div className="flex flex-1 justify-center items-center h-screen">
        <img src={logo} alt="loading" className="w-48 h-48" />
      </div>
    );

  // TODO: Add screens to prevent flickr when checking key
  // resources should become the activity list
  return (
    <div className="">
      {key ? (
        <>
          <Header />
          <div className="container mx-auto p-4 mb-2">
            <Activity />
          </div>
        </>
      ) : (
        <KeyInput />
      )}
    </div>
  );
}

export default App;
