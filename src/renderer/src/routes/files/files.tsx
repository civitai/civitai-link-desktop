import { FilesItem } from '@/components/files/files-item';
import { useMemo } from 'react';
import { Files as FilesIcon, XCircle } from 'lucide-react';
import { useFile } from '@/providers/files';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import { PanelWrapper } from '@/layout/panel-wrapper';

export function Files() {
  const { filterFiles, filteredFileList, searchTerm, setSearchTerm } =
    useFile();
  const fileKeys = useMemo(
    () => Object.keys(filteredFileList),
    [filteredFileList],
  );

  const clearFilter = () => {
    setSearchTerm('');
    filterFiles('');
  };

  const search = () => {
    filterFiles(searchTerm);
  };

  const debouncedOnChange = useDebounce(search);

  return (
    <PanelWrapper>
      <>
        <div className="flex items-center px-4 py-2 min-h-14">
          <h1 className="text-xl font-bold">Files</h1>
          {/* TODO: Dropdown Filter */}
        </div>
        <Separator />
        <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form>
            <div className="relative">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search"
                className="pl-8"
                onChange={(e) => {
                  debouncedOnChange();
                  setSearchTerm(e.target.value);
                }}
                value={searchTerm}
              />
              {searchTerm ? (
                <XCircle
                  className="cursor-pointer absolute right-2 top-3 text-muted-foreground"
                  onClick={clearFilter}
                  size={18}
                />
              ) : null}
            </div>
          </form>
        </div>
        {/* // TODO: Virtualize list here */}
        <ScrollArea className="h-screen pb-[145px]">
          <div className="flex flex-col gap-2 p-4 pt-0">
            {fileKeys?.map((file) => {
              return (
                <FilesItem
                  resource={filteredFileList[file]}
                  key={filteredFileList[file].hash}
                />
              );
            })}
            {fileKeys.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <FilesIcon />
                <p className="ml-2 text-center text-sm">No Files</p>
              </div>
            ) : null}
          </div>
        </ScrollArea>
      </>
      <Outlet />
    </PanelWrapper>
  );
}
