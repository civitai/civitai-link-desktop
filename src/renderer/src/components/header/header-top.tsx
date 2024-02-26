import { Sheet } from '@/components/ui/sheet';
import { useElectron } from '@/providers/electron';
import { ConnectionStatus } from '@/types';
import { TbPlugConnected, TbPlugConnectedX } from 'react-icons/tb';
import { useCallback } from 'react';
import { Settings } from '@/components/settings';
import { DropdownMenuDemo } from './header-dropdown-menu';
import logo from '@/assets/logo.png';

export function HeaderTop() {
  const { connectionStatus } = useElectron();

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
          <img src={logo} alt="logo" className="w-8 h-8" />
          {connectionRender(connectionStatus)}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenuDemo />
        </div>
      </div>
      <Settings />
    </Sheet>
  );
}
