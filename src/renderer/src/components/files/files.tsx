import { useElectron } from '@/providers/electron';
import { FilesItem } from './files-item';
import { useMemo } from 'react';
import { Files as FilesIcon } from 'lucide-react';

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

  return (
    <div className="pt-2">
      {fileKeys?.map((file) => {
        return (
          <FilesItem resource={fileList[file]} key={fileList[file].hash} />
        );
      })}
    </div>
  );
}
