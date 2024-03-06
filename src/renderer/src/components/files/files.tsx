import { useElectron } from '@/providers/electron';
import { FilesItem } from './files-item';
import { useMemo } from 'react';
import { Files as FilesIcon, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function Files() {
  const { fileList } = useElectron();
  const fileKeys = useMemo(() => Object.keys(fileList), [fileList]);

  if (fileKeys.length === 0) {
    return <p>No Files</p>;
  }

  if (fileKeys.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <FilesIcon />
        <p className="ml-2 text-center text-sm">No Files</p>
      </div>
    );
  }

  // TODO: Debounce, fileList, filteredList - add to provider
  // clear button
  return (
    <div>
      <div className="fixed z-10 bg-background py-2 pr-8 w-full">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search" className="pl-8" />
        </div>
      </div>
      <div className="pt-14">
        {fileKeys?.map((file) => {
          return (
            <FilesItem resource={fileList[file]} key={fileList[file].hash} />
          );
        })}
      </div>
    </div>
  );
}
