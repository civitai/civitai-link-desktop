import { socketEmit } from '../socket';
import { setKey } from '../store';

export function eventSetKey(_, key: string) {
  console.log('Setting key', key);
  setKey(key);
  socketEmit({
    eventName: 'join',
    payload: key,
    cb: () => {
      console.log(`Joined room ${key}`);
    },
  });
}
