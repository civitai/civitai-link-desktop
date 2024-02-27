import { LogOut, Settings, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApi } from '@/hooks/use-api';
import { SheetTrigger } from '../ui/sheet';

export function DropdownMenuDemo() {
  const { closeApp } = useApi();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="none">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-8">
        <DropdownMenuGroup>
          <SheetTrigger className="w-full">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
          </SheetTrigger>
        </DropdownMenuGroup>
        <DropdownMenuItem onClick={() => closeApp()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Quit Civitai Link</span>
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
