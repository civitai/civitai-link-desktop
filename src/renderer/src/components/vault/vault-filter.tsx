import {
  Menubar,
  MenubarContent,
  MenubarCheckboxItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
} from '@/components/ui/menubar';
import { ListFilter } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ModelTypes, BaseModels } from '@/lib/search-filter';
import { useVault, VaultFilters } from '@/providers/vault';

export function VaultFilter() {
  const { appliedFilters, clearFilters, filterVault } = useVault();

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>
          <Tooltip>
            <TooltipTrigger asChild>
              <ListFilter size={18} />
            </TooltipTrigger>
            <TooltipContent>Filter By Type</TooltipContent>
          </Tooltip>
        </MenubarTrigger>
        <MenubarContent>
          <MenubarSub>
            <MenubarSubTrigger>Model Types</MenubarSubTrigger>
            <MenubarSubContent>
              {(Object.keys(ModelTypes) as Array<keyof typeof ModelTypes>).map(
                (type) => (
                  <MenubarCheckboxItem
                    key={type}
                    onClick={() => filterVault(type, VaultFilters.TYPE)}
                    checked={appliedFilters.modelType.includes(
                      type.toLowerCase(),
                    )}
                  >
                    {ModelTypes[type]}
                  </MenubarCheckboxItem>
                ),
              )}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>Base Model</MenubarSubTrigger>
            <MenubarSubContent>
              {(Object.keys(BaseModels) as Array<keyof typeof BaseModels>).map(
                (type) => (
                  <MenubarCheckboxItem
                    key={type}
                    onClick={() =>
                      filterVault(BaseModels[type], VaultFilters.BASE_MODEL)
                    }
                    checked={appliedFilters.baseModelType.includes(
                      BaseModels[type].toLowerCase(),
                    )}
                  >
                    {BaseModels[type]}
                  </MenubarCheckboxItem>
                ),
              )}
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem onClick={clearFilters}>Clear Filters</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
