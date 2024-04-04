import { useElectron } from '@/providers/electron';
import logo from '@/assets/logo.png';
import Root from './routes/root';

function App() {
  const { appLoading, key } = useElectron();

  if (appLoading)
    return (
      <div className="flex flex-1 justify-center items-center h-screen">
        <img src={logo} alt="loading" className="w-48 h-48" />
      </div>
    );

  // TODO: Add in flow if no key
  return <Root />;
}

export default App;
