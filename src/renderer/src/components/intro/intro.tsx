import { useApi } from '@/hooks/use-api';
import { useState } from 'react';
import { Wizard } from 'react-use-wizard';
import { IntroCongrats } from './intro-congrats';
import { IntroSd } from './intro-sd';
import { IntroSignin } from './intro-signin';
import { IntroWelcome } from './intro-welcome';

type IntroProps = {
  onComplete: () => void;
};

export function Intro(props: IntroProps) {
  const [folderValue, setFolderValue] = useState<string | null>(null);
  const [sdType, setSdType] = useState<string>('symlink');
  const { init, setStableDiffusion } = useApi();

  const submit = async () => {
    setStableDiffusion(sdType);
    init();
    props.onComplete();
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="titlebar border-b border-border" />
      <div className="container mx-auto p-6 space-y-8 flex flex-col h-screen pt-16">
        <Wizard>
          <IntroWelcome />
          <IntroSignin />
          <IntroSd
            folderValue={folderValue}
            setFolderValue={setFolderValue}
            sdType={sdType}
            setSdType={setSdType}
          />
          <IntroCongrats submit={submit} />
        </Wizard>
      </div>
    </div>
  );
}
