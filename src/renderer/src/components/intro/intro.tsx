import logo from '@/assets/logo.png';
import { Wizard } from 'react-use-wizard';
import { IntroWelcome } from './intro-welcome';
import { IntroCode } from './intro-code';
import { IntroSd } from './intro-sd';
import { IntroCongrats } from './intro-congrats';
import { useApi } from '@/hooks/use-api';
import { useState } from 'react';

export function Intro() {
  const [segments, setSegments] = useState<string[]>(new Array(6).fill(''));
  const [folderValue, setFolderValue] = useState<string | null>(null);
  const [sdType, setSdType] = useState<string>('symlink');
  const { setKey, init, setStableDiffusion } = useApi();

  const submit = async () => {
    const segmentsString = segments.join('');
    if (segmentsString && segmentsString.length === 6) {
      setStableDiffusion(sdType);
      setKey(segmentsString);
      init();
    } else {
      console.log('No input value');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 flex flex-col h-screen">
      <div>
        <img src={logo} alt="logo" className="w-10 h-10" />
      </div>
      <Wizard>
        <IntroWelcome />
        <IntroCode segments={segments} setSegments={setSegments} />
        <IntroSd
          folderValue={folderValue}
          setFolderValue={setFolderValue}
          sdType={sdType}
          setSdType={setSdType}
        />
        <IntroCongrats submit={submit} />
      </Wizard>
    </div>
  );
}
