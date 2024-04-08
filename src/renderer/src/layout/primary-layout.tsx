import * as React from 'react';
import { Files, Vault, Activity, Folder, Cog, Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Nav } from './components/nav';
import { useElectron } from '@/providers/electron';
import { ConnectionStatus } from '@/types';
import { useCallback } from 'react';
import logo from '@/assets/logo.png';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ResetKeyModal } from '@/components/header/reset-key-modal';
import { useFile } from '@/providers/files';
import { useApi } from '@/hooks/use-api';

interface MailProps {
  defaultLayout?: number[];
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

// TODO: Split this out into layout components
// TODO: layout size should be based on the default width
export function PrimaryLayout({
  defaultLayout = [20, 40, 40],
  defaultCollapsed = false,
  navCollapsedSize,
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const { connectionStatus } = useElectron();
  const { fileListCount } = useFile();
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
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          className={cn(
            isCollapsed &&
              'min-w-[50px] transition-all duration-300 ease-in-out',
          )}
        >
          <div
            className={cn(
              'flex h-[56px] items-center justify-between',
              isCollapsed ? 'h-[52px]' : 'px-2',
            )}
          >
            <a href="https://civitai.com/" target="_blank">
              <img src={logo} alt="logo" className="w-10 h-10" />
            </a>
            <Dialog>
              {connectionStatus === ConnectionStatus.CONNECTED ? (
                <div className="flex items-center space-x-2 rounded-full border-[#373A40] border px-3 py-2">
                  {connectionRender(connectionStatus)}
                  <p className="text-sm capitalize">connected</p>
                </div>
              ) : (
                <DialogTrigger asChild>
                  <div className="flex items-center space-x-2 rounded-full border-[#373A40] border px-3 py-2 cursor-pointer">
                    {connectionRender(connectionStatus)}
                    <p className="text-sm capitalize">disconnected</p>
                  </div>
                </DialogTrigger>
              )}
              <ResetKeyModal />
            </Dialog>
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Files',
                label: fileListCount.toString(),
                icon: Files,
                variant: 'default',
                href: '/files',
              },
              {
                title: 'Vault',
                label: '9',
                icon: Vault,
                variant: 'ghost',
                href: '/vault',
              },
              {
                title: 'Activities',
                label: '',
                icon: Activity,
                variant: 'ghost',
                href: '/activities',
              },
              {
                title: 'Open Model Folder',
                label: '',
                icon: Folder,
                variant: 'ghost',
                href: '/open-model-folder',
                onClick: (e: React.MouseEvent<HTMLElement>) => {
                  e.preventDefault();
                  openRootModelFolder();
                },
              },
              {
                title: 'Settings',
                label: '',
                icon: Cog,
                variant: 'ghost',
                href: '/settings',
              },
            ]}
          />
        </ResizablePanel>

        {/* TODO: These two are the different <Outlets/> */}
        {/* TODO: Need to figure out what it looks like when no 3rd window */}
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={40}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Files</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Checkpoint
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  LoRA
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <Outlet />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <h1>Unread</h1>
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]}>
          <h1>Message</h1>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
