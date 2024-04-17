import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar';
import { useFile } from '@/providers/files';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SortType, SortDirection } from '@/providers/files';

export function FilesSort() {
  const { sortFiles, sortType: type, sortDirection } = useFile();

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              {sortDirection === SortDirection.ASC ? (
                <ArrowUpWideNarrow size={18} />
              ) : (
                <ArrowDownWideNarrow size={18} />
              )}
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
                onClick={() => sortFiles(SortType[sortType])}
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
