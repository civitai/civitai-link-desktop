import axios from 'axios';
import { AUTH_URL, OAUTH_CLIENT_ID } from '../oauth/constants';
import {
  DeviceLoginCancelledError,
  cancelDeviceLogin,
  startDeviceLogin,
} from '../oauth/device-flow';
import { pairWithLink } from '../oauth/pair';
import { OAuthState, sendOAuthState } from '../oauth/state';
import {
  clearTokens,
  loadTokens,
  setSessionExpiredHandler,
} from '../oauth/token-store';
import { leaveSocketRoom } from '../socket';
import {
  ConnectionStatus,
  getUser,
  setApiKey,
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

// The api throws its parsed body rather than the AxiosError.
function vaultErrorReason(error: unknown) {
  return (error as { error?: string } | null)?.error ?? requestStatus(error);
}

let activeLogin: symbol | null = null;

export async function eventOAuthLogin() {
  if (activeLogin) return;

  const login = Symbol('oauth-login');
  activeLogin = login;

  // A superseded login must not write over the state of the one that replaced it.
  const send = (state: OAuthState) => {
    if (activeLogin === login) sendOAuthState(state);
  };

  try {
    send({ status: 'waiting' });

    const tokens = await startDeviceLogin(send);

    send({ status: 'pairing' });

    try {
      await pairWithLink(tokens);
    } catch (error) {
      // startDeviceLogin already persisted the tokens, and nothing re-pairs later.
      clearTokens();
      throw error;
    }

    await setUser();
    send({ status: 'signed-in', username: username() });

    // A vault refresh throws on any non-2xx; sign in has already succeeded here.
    try {
      await setVaultMeta();
      await setVault();
    } catch (error) {
      console.error('Civitai vault refresh failed', vaultErrorReason(error));
    }
  } catch (error) {
    if (error instanceof DeviceLoginCancelledError) {
      send({ status: 'idle' });
      return;
    }

    const { log, message } = describeSignInError(error);

    console.error('Civitai sign in failed', log);
    send({ status: 'error', message });
  } finally {
    if (activeLogin === login) activeLogin = null;
  }
}

export function eventOAuthCancel() {
  cancelDeviceLogin();
  activeLogin = null;
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

  await endOAuthSession();
}

// Everything a session leaves behind, whichever way it ended. Revoking on the hub is the
// caller's job — a refresh that came back 4xx has nothing left to revoke.
async function endOAuthSession() {
  clearTokens();
  setApiKey(null);
  setKey(null);
  setUpgradeKey(null);
  leaveSocketRoom();
  setConnectionStatus(ConnectionStatus.DISCONNECTED);
  await setUser();
  sendOAuthState({ status: 'signed-out' });
}

// A refresh rejected with a 4xx means the grant is gone, which has to tear down as much as
// an explicit sign-out does.
setSessionExpiredHandler(() => void endOAuthSession());

export async function eventOAuthStatus() {
  return loadTokens()
    ? { signedIn: true, username: username() }
    : { signedIn: false };
}
