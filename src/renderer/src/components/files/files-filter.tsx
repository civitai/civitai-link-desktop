import {
  Menubar,
  MenubarContent,
  MenubarCheckboxItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { ListFilter } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BaseModels, ModelTypes } from '@/providers/files';

export function FilesFilter() {
  //   const sort = (type: sortType) => {
  //     sortFiles({ type, direction });
  //     setDirection(
  //       direction === sortDirection.ASC ? sortDirection.DESC : sortDirection.ASC,
  //     );
  //   };

  // TODO: Check which type is selected
  //   checked={selectedType === type} add <MenubarCheckboxItem/>
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
                  <MenubarCheckboxItem key={type}>
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
                  <MenubarCheckboxItem key={type}>
                    {BaseModels[type]}
                  </MenubarCheckboxItem>
                ),
              )}
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
