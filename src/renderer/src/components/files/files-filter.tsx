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
import { FileListFilters, useFile } from '@/providers/files';
import { BaseModels, ModelTypes } from '@/lib/search-filter';
import { useElectron } from '@/providers/electron';

export function FilesFilter() {
  const { appliedFilters, clearFilters, filterFiles } = useFile();
  const { 
    enums,
  } = useElectron();

  // Use old `BaseModels`  for legacy support
  const baseModels = enums?.BaseModel ?? Object.values(BaseModels);

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
                    onClick={() => filterFiles(type, FileListFilters.TYPE)}
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
          {baseModels.length > 0 && (
            <MenubarSub>
              <MenubarSubTrigger>Base Model</MenubarSubTrigger>
              <MenubarSubContent  className="max-h-[300px] overflow-y-auto"> 
                {(enums?.BaseModel ?? []).map(
                  (type) => (
                    <MenubarCheckboxItem
                      key={type}
                      onClick={() =>
                        filterFiles(type, FileListFilters.BASE_MODEL)
                      }
                      checked={appliedFilters.baseModelType.includes(
                        type.toLowerCase(),
                      )}
                    >
                      {type}
                    </MenubarCheckboxItem>
                  ),
                )}
              </MenubarSubContent>
            </MenubarSub>
          )}
          <MenubarSeparator />
          <MenubarItem onClick={clearFilters}>Clear Filters</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
