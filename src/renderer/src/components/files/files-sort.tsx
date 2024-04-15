import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useFile } from '@/providers/files';
import { ArrowDownWideNarrow } from 'lucide-react';
import { useState } from 'react';

export function FilesSort() {
  const { sortFiles } = useFile();
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <ArrowDownWideNarrow size={18} />
        </MenubarTrigger>
        <MenubarContent>
          {/* <MenubarItem>Date Downloaded</MenubarItem> */}
          <MenubarItem
            onClick={() => {
              sortFiles({ type: 'modelName', direction });
              setDirection(direction === 'asc' ? 'desc' : 'asc');
            }}
          >
            Name
          </MenubarItem>
          {/* <MenubarItem>Size</MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
