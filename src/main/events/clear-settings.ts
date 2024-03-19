import { leaveSocketRoom } from '../socket';
import { clearSettings } from '../store/store';
import { clearActivities } from '../store/activities';
import { clearFiles } from '../store/files';
import { clearVault } from '../store/vault';

export function eventClearSettings() {
  clearSettings();
  leaveSocketRoom();
  clearVault();
  clearFiles();
  clearActivities();
}
