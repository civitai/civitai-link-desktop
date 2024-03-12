import { leaveSocketRoom } from '../socket';
import { clearSettings } from '../store/store';

export function eventClearSettings() {
  clearSettings();
  leaveSocketRoom();
}
