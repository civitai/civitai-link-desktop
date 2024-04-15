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

  const sort = (type: 'modelName' | 'downloadDate') => {
    sortFiles({ type, direction });
    setDirection(direction === 'asc' ? 'desc' : 'asc');
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <ArrowDownWideNarrow size={18} />
        </MenubarTrigger>
        <MenubarContent>
          {/* <MenubarItem onClick={() => sort('downloadDate')}>
            Date Downloaded
          </MenubarItem> */}
          <MenubarItem onClick={() => sort('modelName')}>Name</MenubarItem>
          {/* <MenubarItem>Size</MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
