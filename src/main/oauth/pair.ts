import axios from 'axios';
import os from 'os';
import { getWindow } from '../browser-window';
import { socketEmit } from '../socket';
import {
  ConnectionStatus,
  getOrCreateInstallId,
  setConnectionStatus,
  setUpgradeKey,
} from '../store/store';
import { OAuthTokens } from './token-store';

type LinkInstance = { id: number; key: string; name: string };

export async function pairWithLink(tokens: OAuthTokens): Promise<LinkInstance> {
  const installId = getOrCreateInstallId();

  let instance: LinkInstance;
  try {
    const { data } = await axios.post<LinkInstance>(
      `${import.meta.env.MAIN_VITE_SOCKET_URL}/api/link/self`,
      { installId, name: `${os.hostname()} (${process.platform})` },
      { headers: { Authorization: `Bearer ${tokens.accessToken}` } },
    );

    instance = data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as { error?: string };

      if (body?.error === 'Instance limit reached')
        throw new Error(
          'You have too many Civitai Link instances. Remove one on civitai.com and try again.',
        );

      if (error.response.status === 401)
        throw new Error('Civitai rejected this sign in. Sign in again.');

      if (error.response.status === 503)
        throw new Error('Civitai is unavailable right now. Try again shortly.');
    }

    throw new Error('Could not connect this device to Civitai Link.');
  }

  setUpgradeKey(instance.key);
  getWindow().webContents.send('upgrade-key', { key: instance.key });

  socketEmit({
    eventName: 'join',
    payload: instance.key,
    cb: () => {
      setConnectionStatus(ConnectionStatus.CONNECTED);
      console.log('Joined Civitai Link room');
    },
  });

  return instance;
}
