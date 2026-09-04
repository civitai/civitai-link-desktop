import logo from '@/assets/logo.png';
import { useElectron } from '@/providers/electron';
import { useEffect, useState } from 'react';
import { Intro } from './components/intro';
import Root from './routes/root';

function App() {
  const { appLoading, key } = useElectron();
  const [onboarding, setOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    if (appLoading || onboarding !== null) return;
    setOnboarding(!key);
  }, [appLoading, key, onboarding]);

  if (appLoading || onboarding === null)
    return (
      <div className="flex flex-1 justify-center items-center h-screen">
        <img src={logo} alt="loading" className="w-48 h-48" />
      </div>
    );

  return onboarding ? (
    <Intro onComplete={() => setOnboarding(false)} />
  ) : (
    <Root />
  );
}

export default App;
