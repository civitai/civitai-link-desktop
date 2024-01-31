import { useElectron } from '@/providers/electron';
import { ActivityItem } from './activity-item';

export function Activity() {
  const { resources } = useElectron();

  return (
    <div>
      {resources?.length && resources.length > 0 ? (
        resources?.map((resource) => <ActivityItem id={resource.id} name={resource.name} key={resource.id} />)
      ) : (
        <h1>No activity</h1>
      )}
    </div>
  );
}
