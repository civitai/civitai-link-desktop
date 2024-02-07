import { useElectron } from '@/providers/electron';
import { ActivityItem } from './activity-item';

export function Activity() {
  const { activityList } = useElectron();

  if (!activityList) {
    return <p>No Activity</p>;
  }

  return (
    <div>
      {Object.keys(activityList)?.map((activity) => {
        return <ActivityItem {...activityList[activity]} key={activityList[activity].hash} />;
      })}
    </div>
  );
}
