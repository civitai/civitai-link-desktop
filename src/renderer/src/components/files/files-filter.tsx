import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { useFile } from '@/providers/files';
import { ListFilter } from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sortType, sortDirection } from '@/providers/files';

export function FilesFilter() {
  const { sortFiles } = useFile();
  const [direction, setDirection] = useState<sortDirection>(sortDirection.DESC);

  const sort = (type: sortType) => {
    sortFiles({ type, direction });
    setDirection(
      direction === sortDirection.ASC ? sortDirection.DESC : sortDirection.ASC,
    );
  };

  // TODO: Check which type is selected
  //   checked={selectedType === type} add <MenubarCheckboxItem/>
  // Checkpoint
  // Embedding
  // Hypernetwork
  // Aesthetic Gradient
  // LoRA
  // LyCORIS
  // DoRA
  // ControlNet
  // Upscaler
  // Motion
  // VAE
  // Poses
  // Wildcards
  // Workflows
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
          <MenubarItem onClick={() => sort(sortType.MODEL_NAME)}>
            Name
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
