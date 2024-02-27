// import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
// import { useMemo } from 'react';

export function Activities() {
  // const { activityList } = useElectron();
  // const activityKeys = useMemo(() => Object.keys(activityList), [activityList]);

  //   if (activityKeys.length === 0) {
  //     return <p>No Activities</p>;
  //   }

  return (
    <div>
      <ActivitiesItem />
    </div>
  );
}
