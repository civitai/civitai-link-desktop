import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarCheckboxItem,
} from '@/components/ui/menubar';
import { useVault } from '@/providers/vault';
import { ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { VaultSortType, SortDirection } from '@/lib/search-filter';

export function VaultSort() {
  const { sortVault, sortType: type, sortDirection } = useVault();

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
          {(
            Object.keys(VaultSortType) as Array<keyof typeof VaultSortType>
          ).map((sortType) => (
            <MenubarCheckboxItem
              key={sortType}
              checked={type === VaultSortType[sortType]}
              onClick={() => sortVault(VaultSortType[sortType])}
              className="capitalize"
            >
              {sortType.split('_').join(' ').toLowerCase()}
            </MenubarCheckboxItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
