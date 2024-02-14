import { useElectron } from '@/providers/electron';
import { ActivityItem } from './activity-item';
import { useMemo } from 'react';

export function Activity() {
  const { activityList } = useElectron();
  const activityKeys = useMemo(() => Object.keys(activityList), [activityList]);

  if (activityKeys.length === 0) {
    return <p>No Activity</p>;
  }

  return (
    <div>
      {activityKeys?.map((activity) => {
        return (
          <ActivityItem
            {...activityList[activity]}
            key={activityList[activity].hash}
          />
        );
      })}
    </div>
  );
}
