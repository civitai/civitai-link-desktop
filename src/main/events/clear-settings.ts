import { leaveSocketRoom } from '../socket';
import { clearSettings } from '../store';

export function eventClearSettings() {
  clearSettings();
  leaveSocketRoom();
}
