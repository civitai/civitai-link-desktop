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
import { SortType, SortDirection } from '@/providers/files';

export function FilesSort() {
  const { sortFiles } = useFile();
  const [direction, setDirection] = useState<SortDirection>(SortDirection.DESC);
  const [type, setType] = useState<SortType | null>(null);

  const sort = (type: SortType) => {
    sortFiles({ type, direction });
    setType(type);
    setDirection(
      direction === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC,
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
          {(Object.keys(SortType) as Array<keyof typeof SortType>).map(
            (sortType) => (
              <MenubarCheckboxItem
                key={sortType}
                checked={type === SortType[sortType]}
                onClick={() => sort(SortType[sortType])}
                className="capitalize"
              >
                {sortType.split('_').join(' ').toLowerCase()}
              </MenubarCheckboxItem>
            ),
          )}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
