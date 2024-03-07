import { FilesItem } from './files-item';
import { useMemo } from 'react';
import { Files as FilesIcon, Search, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useFile } from '@/providers/files';
import { useDebounce } from '@/hooks/use-debounce';

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
    <div>
      <div className="fixed z-10 bg-background py-2 pr-8 w-full">
        <div className="relative">
          <Search
            className="absolute left-2 top-3 h-4 w-4 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder="Search"
            className="pl-8 pr-8"
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
      </div>
      <div className="pt-14">
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
    </div>
  );
}
