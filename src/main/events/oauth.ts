import axios from 'axios';
import { AUTH_URL, OAUTH_CLIENT_ID } from '../oauth/constants';
import {
  DeviceLoginCancelledError,
  cancelDeviceLogin,
  startDeviceLogin,
} from '../oauth/device-flow';
import { pairWithLink } from '../oauth/pair';
import { sendOAuthState } from '../oauth/state';
import { clearTokens, loadTokens } from '../oauth/token-store';
import { leaveSocketRoom } from '../socket';
import {
  ConnectionStatus,
  getUser,
  setConnectionStatus,
  setKey,
  setUpgradeKey,
  setUser,
} from '../store/store';
import { setVault, setVaultMeta } from '../store/vault';

function username() {
  const user = getUser() as { username?: string } | null;

  return user?.username;
}

function requestStatus(error: unknown) {
  if (!axios.isAxiosError(error)) return 'unknown';

  return error.response?.status ?? error.code ?? 'network error';
}

// An AxiosError carries the request body, so it never reaches the user or the log.
function describeSignInError(error: unknown) {
  if (axios.isAxiosError(error))
    return {
      log: requestStatus(error),
      message: 'Sign in failed. Try again.',
    };

  if (error instanceof Error)
    return { log: error.message, message: error.message };

  return { log: 'unknown', message: 'Sign in failed. Try again.' };
}

export async function eventOAuthLogin() {
  sendOAuthState({ status: 'waiting' });

  try {
    const tokens = await startDeviceLogin(sendOAuthState);

    sendOAuthState({ status: 'pairing' });
    await pairWithLink(tokens);
    await setUser();
    sendOAuthState({ status: 'signed-in', username: username() });

    await setVaultMeta();
    await setVault();
  } catch (error) {
    if (error instanceof DeviceLoginCancelledError) {
      sendOAuthState({ status: 'idle' });
      return;
    }

    const { log, message } = describeSignInError(error);

    console.error('Civitai sign in failed', log);
    sendOAuthState({ status: 'error', message });
  }
}

export function eventOAuthCancel() {
  cancelDeviceLogin();
  sendOAuthState({ status: 'idle' });
}

export async function eventOAuthLogout() {
  const tokens = loadTokens();

  if (tokens) {
    try {
      await axios.post(
        `${AUTH_URL}/api/auth/oauth/revoke`,
        new URLSearchParams({
          token: tokens.refreshToken,
          client_id: OAUTH_CLIENT_ID,
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
    } catch (error) {
      console.error('Civitai token revoke failed', requestStatus(error));
    }
  }

  clearTokens();
  setKey(null);
  setUpgradeKey(null);
  leaveSocketRoom();
  setConnectionStatus(ConnectionStatus.DISCONNECTED);
  await setUser();
  sendOAuthState({ status: 'signed-out' });
}

export async function eventOAuthStatus() {
  return loadTokens()
    ? { signedIn: true, username: username() }
    : { signedIn: false };
}
