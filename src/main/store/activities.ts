import Store, { Schema } from 'electron-store';
import { getWindow } from '../browser-window';

const schema: Schema<Record<string, unknown>> = {
  activities: {
    type: 'array',
    default: [],
  },
};

export const store = new Store({ schema });

export function updateActivity(activity: ActivityItem) {
  const activities = store.get('activities') as ActivityItem[];

  // Only keep last 60 activities
  if (activities.length > 60) {
    const clonedActivities = [...activities];
    clonedActivities.pop();

    return store.set('activities', [activity, ...clonedActivities]);
  } else {
    return store.set('activities', [activity, ...activities]);
  }
}

export function getActivities() {
  return store.get('activities') as ActivityItem[];
}

export function watcherActivities() {
  store.onDidChange('activities', (newValue) => {
    getWindow().webContents.send('activity-update', newValue);
  });
}

export function clearActivities() {
  store.clear();
}
