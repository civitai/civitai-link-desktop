import Store, { Schema } from 'electron-store';

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

type watcherActivitiesParams = {
  mainWindow: Electron.BrowserWindow;
};

export function watcherActivities({ mainWindow }: watcherActivitiesParams) {
  store.onDidChange('activities', (newValue) => {
    mainWindow.webContents.send('activity-update', newValue);
  });
}
