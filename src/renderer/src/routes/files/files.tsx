import { FilesItem } from '@/components/files/files-item';
import { useMemo } from 'react';
import { Files as FilesIcon } from 'lucide-react';
import { useFile } from '@/providers/files';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Files() {
  const { filteredFileList } = useFile();
  const fileKeys = useMemo(
    () => Object.keys(filteredFileList),
    [filteredFileList],
  );

  // TODO: Virtualize list here
  return (
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
  );
}
