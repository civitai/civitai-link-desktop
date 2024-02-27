import { useElectron } from '@/providers/electron';
import { FilesItem } from './files-item';
import { useMemo } from 'react';

// TODO: Updating name and pull file list
export function Files() {
  const { activityList } = useElectron();
  const activityKeys = useMemo(() => Object.keys(activityList), [activityList]);

  if (activityKeys.length === 0) {
    return <p>No Activity</p>;
  }

  return (
    <div>
      {activityKeys?.map((activity) => {
        return (
          <FilesItem
            {...activityList[activity]}
            key={activityList[activity].hash}
          />
        );
      })}
    </div>
  );
}
