import { FilesItem } from '@/components/files/files-item';
import { Files as FilesIcon, XCircle } from 'lucide-react';
import { useFile } from '@/providers/files';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { useDebounce } from '@/hooks/use-debounce';
import { PanelWrapper } from '@/layout/panel-wrapper';
import { Virtuoso } from 'react-virtuoso';
import { FilesSort } from '@/components/files/files-sort';
import { FilesFilter } from '@/components/files/files-filter';
import { useMemo } from 'react';

export function Files() {
  const { searchFiles, searchTerm, setSearchTerm, fuseList } = useFile();
  const fuseListCount = useMemo(() => fuseList?.length || 0, [fuseList]);

  const clearFilter = () => {
    setSearchTerm('');
    searchFiles('');
  };

  const search = () => {
    searchFiles(searchTerm);
  };

  const debouncedOnChange = useDebounce(search);

  return (
    <PanelWrapper>
      <>
        <div className="flex items-center justify-between px-4 py-2 min-h-14">
          <h1 className="text-xl font-bold">Files</h1>
          <div className="flex">
            <FilesFilter />
            <FilesSort />
          </div>
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
        {fuseListCount === 0 ? (
          <div className="flex items-center justify-center py-4">
            <FilesIcon />
            <p className="ml-2 text-center text-sm">No Files</p>
          </div>
        ) : (
          <div className="h-full pb-[130px]">
            <Virtuoso
              totalCount={fuseListCount || 0}
              itemContent={(index) => (
                <div className="mx-4 py-1" key={fuseList[index]?.item.hash}>
                  <FilesItem resource={fuseList[index]?.item} />
                </div>
              )}
            />
          </div>
        )}
      </>
      <Outlet />
    </PanelWrapper>
  );
}
