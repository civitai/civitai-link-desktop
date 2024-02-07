import { useElectron } from '@/providers/electron';
import { ActivityItem } from './activity-item';

export function Activity() {
  const { resources, activityList } = useElectron();

  if (!resources || !activityList) {
    return <p>No Activity</p>;
  }

  return (
    <div>
      {resources?.map((resource) => <ActivityItem {...resource} key={resource.hash} />)}
      {activityList?.map((activity) => {
        const key = Object.keys(activity)[0];
        return <ActivityItem {...activity[key]} key={activity[key].hash} />;
      })}
    </div>
  );
}
