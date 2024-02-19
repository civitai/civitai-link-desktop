import { FaCog } from 'react-icons/fa';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { useElectron } from '@/providers/electron';
import { ConnectionStatus } from '@/types';
import { TbPlugConnected, TbPlugConnectedX } from 'react-icons/tb';
import logoDark from '@/assets/logo_dark_mode.png';
import logoLight from '@/assets/logo_light_mode.png';
import { useCallback } from 'react';
import { Settings } from '@/components/settings';

export function HeaderTop() {
  const { connectionStatus } = useElectron();
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const connectionRender = useCallback(
    (connectionStatus: ConnectionStatus) => {
      switch (connectionStatus) {
        case ConnectionStatus.CONNECTED:
          return <TbPlugConnected color="green" />;
        case ConnectionStatus.DISCONNECTED:
          return <TbPlugConnectedX color="red" />;
        case ConnectionStatus.CONNECTING:
          return <TbPlugConnected color="orange" />;
        default:
          return <TbPlugConnectedX />;
      }
    },
    [connectionStatus],
  );

  return (
    <Sheet>
      <div className="flex items-center px-4 pt-4">
        <div className="flex space-x-2 items-center">
          <img src={systemTheme ? logoDark : logoLight} alt="Civitai" />
          {connectionRender(connectionStatus)}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <SheetTrigger>
            <FaCog size={18} className="cursor-pointer" />
          </SheetTrigger>
        </div>
      </div>
      <Settings />
    </Sheet>
  );
}
