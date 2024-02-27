import { Sheet } from '@/components/ui/sheet';
import { useElectron } from '@/providers/electron';
import { ConnectionStatus } from '@/types';
import { useCallback } from 'react';
import { Settings } from '@/components/settings';
import { DropdownMenuDemo } from './header-dropdown-menu';
import { Folder } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useApi } from '@/hooks/use-api';

export function Header() {
  const { connectionStatus } = useElectron();
  const { openRootModelFolder } = useApi();

  const connectionRender = useCallback(
    (connectionStatus: ConnectionStatus) => {
      switch (connectionStatus) {
        case ConnectionStatus.CONNECTED:
          return <div className="rounded-full w-2 h-2 bg-[#1EBD8E]" />;
        case ConnectionStatus.DISCONNECTED:
          return <div className="rounded-full w-2 h-2 bg-[#F15252]" />;
        case ConnectionStatus.CONNECTING:
          return <div className="rounded-full w-2 h-2 bg-[#FDAA3E]" />;
        default:
          return <div className="rounded-full w-2 h-2 bg-[#FDAA3E]" />;
      }
    },
    [connectionStatus],
  );

  return (
    <Sheet>
      <div className="flex items-center px-4 pt-4 mb-4">
        <div className="flex space-x-4 items-center">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <div className="flex items-center space-x-2 rounded-full border-[#373A40] border px-3 py-2">
            {connectionRender(connectionStatus)}
            <p className="text-sm">My SD Instance</p>
          </div>
        </div>
        <div className="ml-auto flex items-center">
          <Folder
            className="cursor-pointer"
            onClick={() => openRootModelFolder()}
          />
          <DropdownMenuDemo />
        </div>
      </div>
      <Settings />
    </Sheet>
  );
}
