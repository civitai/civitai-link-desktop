import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar';
import { useFile } from '@/providers/files';
import { ArrowDownWideNarrow } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sortType, sortDirection } from '@/providers/files';

export function FilesSort() {
  const { sortFiles } = useFile();
  const [direction, setDirection] = useState<sortDirection>(sortDirection.DESC);
  const [type, setType] = useState<sortType | null>(null);

  const sort = (type: sortType) => {
    sortFiles({ type, direction });
    setType(type);
    setDirection(
      direction === sortDirection.ASC ? sortDirection.DESC : sortDirection.ASC,
    );
  };

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <ArrowDownWideNarrow size={18} />
            </TooltipTrigger>
            <TooltipContent>Sort Files</TooltipContent>
          </Tooltip>
        </MenubarTrigger>
        <MenubarContent>
          {/* <MenubarItem onClick={() => sort(sortType.DOWNLOAD_DATE)}>
            Date Downloaded
          </MenubarItem> */}
          <MenubarCheckboxItem
            checked={type === sortType.MODEL_NAME}
            onClick={() => sort(sortType.MODEL_NAME)}
          >
            Name
          </MenubarCheckboxItem>
          {/* <MenubarItem>Size</MenubarItem> */}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
