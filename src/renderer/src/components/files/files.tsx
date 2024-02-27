import { useElectron } from '@/providers/electron';
import { FilesItem } from './files-item';
import { useMemo } from 'react';

export function Files() {
  const { fileList } = useElectron();
  const fileKeys = useMemo(() => Object.keys(fileList), [fileList]);

  if (fileKeys.length === 0) {
    return <p>No Files</p>;
  }

  return (
    <div>
      {fileKeys?.map((file) => {
        return <FilesItem {...fileList[file]} key={fileList[file].hash} />;
      })}
    </div>
  );
}
