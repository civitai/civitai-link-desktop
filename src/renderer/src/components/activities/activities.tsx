import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
import { useMemo } from 'react';
import { ActivityType } from '@/types';

export function Activities() {
  const { activityList } = useElectron();
  const activityKeys = useMemo(() => Object.keys(activityList), [activityList]);

  const activities = [
    {
      name: 'test',
      date: '2021-10-10',
      type: ActivityType.Downloaded,
      civitaiUrl: 'https://civitai.com',
    },
    {
      name: 'test2',
      date: '2021-10-10',
      type: ActivityType.Deleted,
      civitaiUrl: 'https://civitai.com',
    },
  ];

  if (activities.length === 0) {
    return <p>No Activities</p>;
  }

  return (
    <div className="flex flex-col gap-y-4 ">
      {activities.map((activity, key) => (
        <ActivitiesItem {...activity} key={`${name}-${key}`} />
      ))}
    </div>
  );
}
