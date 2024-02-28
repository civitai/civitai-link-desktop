import { useElectron } from '@/providers/electron';
import { ActivitiesItem } from './activities-item';
import { Activity } from 'lucide-react';

export function Activities() {
  const { activityList } = useElectron();

  if (activityList.length === 0) {
    return (
      <div className="flex items-center justify-center">
        <Activity />
        <p className="ml-2 text-center text-sm">No Activity</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4 ">
      {activityList.map((activity, key) => (
        <ActivitiesItem {...activity} key={`${name}-${key}`} />
      ))}
    </div>
  );
}
