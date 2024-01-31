import { KeyInput } from './key-input';
import { Header } from './components/header';
import { useElectron } from './providers/electron';
import logo from './assets/logo.png';
import { Activity } from './components/activity';
import { useState } from 'react';
import { TABS } from './types';

function App() {
  const { appLoading, key } = useElectron();
  const [tab, setTab] = useState<TABS>(TABS.ACTIVITY);

  if (appLoading)
    return (
      <div className="flex flex-1 justify-center items-center h-screen">
        <img src={logo} alt="loading" className="w-48 h-48" />
      </div>
    );

  const tabSelector = () => {
    switch (tab) {
      case TABS.ACTIVITY:
        return <Activity />;
      case TABS.FILES:
        return <div>Files</div>;
      default:
        return <Activity />;
    }
  };

  // TODO: Add screens to prevent flickr when checking key
  // resources should become the activity list
  return (
    <div className="">
      {key ? (
        <>
          <Header setTab={setTab} />
          <div className="container mx-auto p-4 mb-2">{tabSelector()}</div>
        </>
      ) : (
        <KeyInput />
      )}
    </div>
  );
}

export default App;
