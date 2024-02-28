import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
import { useMemo } from 'react';
import { ActivityType } from '@/types';
import { Activity } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center">
        <Activity />
        <p className="ml-2 text-center text-sm">No Activity</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 ">
      {activities.map((activity, key) => (
        <ActivitiesItem {...activity} key={`${name}-${key}`} />
      ))}
    </div>
  );
}
