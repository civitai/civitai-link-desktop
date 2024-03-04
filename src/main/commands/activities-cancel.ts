import { BrowserWindow } from 'electron';

type ActivitiesCancelParams = {
  activityId: string;
  mainWindow: BrowserWindow;
};

export function activitiesCancel({
  mainWindow,
  activityId,
}: ActivitiesCancelParams) {
  console.log('Cancelling activity from web', activityId);

  // Send a cancel activity to the browserWindow to remove the file
  mainWindow.webContents.send('activity-cancel', { id: activityId });
}
