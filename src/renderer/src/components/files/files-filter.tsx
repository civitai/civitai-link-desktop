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
import {
  BaseModels,
  FileListFilters,
  ModelTypes,
  useFile,
} from '@/providers/files';
import { useState } from 'react';

export function FilesFilter() {
  const { filterFilesByType } = useFile();
  const [modelTypeArray, setModelTypeArray] = useState<string[]>([]);
  const [baseModelArray, setBaseModelArray] = useState<string[]>([]);

  const handleModelTypeFilter = (type: string, filterType: FileListFilters) => {
    const typeLowerCase = type.toLowerCase();
    let modelType: string[] = [...modelTypeArray];
    let baseModelType: string[] = [...baseModelArray];

    if (filterType === FileListFilters.BASE_MODEL) {
      if (baseModelArray.includes(typeLowerCase)) {
        const newBaseModelArray = baseModelArray.filter(
          (baseModelType) => baseModelType !== typeLowerCase,
        );
        setBaseModelArray(newBaseModelArray);

        baseModelType = newBaseModelArray;
      } else {
        setBaseModelArray([...baseModelArray, typeLowerCase]);
        baseModelType = [...baseModelArray, typeLowerCase];
      }
    }

    if (filterType === FileListFilters.TYPE) {
      if (modelTypeArray.includes(typeLowerCase)) {
        const newModelTypeArray = modelTypeArray.filter(
          (modelType) => modelType !== typeLowerCase,
        );
        setModelTypeArray(newModelTypeArray);

        modelType = newModelTypeArray;
      } else {
        setModelTypeArray([...modelTypeArray, typeLowerCase]);
        modelType = [...modelTypeArray, typeLowerCase];
      }
    }

    filterFilesByType({
      modelType,
      baseModelType,
    });
  };

  const handleClearFilters = () => {
    setModelTypeArray([]);
    setBaseModelArray([]);
    filterFilesByType({
      modelType: [],
      baseModelType: [],
    });
  };

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
                    onClick={() =>
                      handleModelTypeFilter(type, FileListFilters.TYPE)
                    }
                    checked={modelTypeArray.includes(type.toLowerCase())}
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
                      handleModelTypeFilter(
                        BaseModels[type],
                        FileListFilters.BASE_MODEL,
                      )
                    }
                    checked={baseModelArray.includes(
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
          <MenubarItem onClick={handleClearFilters}>Clear Filters</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
