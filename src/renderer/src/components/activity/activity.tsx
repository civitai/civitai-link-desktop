import { useElectron } from '@/providers/electron';
import { ActivityItem } from './activity-item';

export function Activity() {
  const { resources, activityList } = useElectron();

  if (!resources || !activityList) {
    return <p>No Activity</p>;
  }

  return (
    <div>
      {resources?.map((resource) => <ActivityItem id={resource.id} name={resource.name} key={resource.id} />)}
      {activityList?.map((activity) => {
        const key = Object.keys(activity)[0];
        return <p key={key}>{activity[key].name}</p>;
      })}
    </div>
  );
}
