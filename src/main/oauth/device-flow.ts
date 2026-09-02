import axios from 'axios';
import { shell } from 'electron';
import { sleep } from '../utils/concurrency-helpers';
import { AUTH_URL, OAUTH_CLIENT_ID, OAUTH_SCOPE } from './constants';
import { OAuthState } from './state';
import {
  OAuthTokens,
  TokenResponse,
  saveTokens,
  toTokens,
} from './token-store';

type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
};

const FORM_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
};

const RETRY_ERRORS = new Set(['authorization_pending', 'network_error']);

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Sign in was denied on Civitai.',
  expired_token: 'Sign in timed out. Try again.',
  invalid_grant: 'Sign in failed. Try again.',
};

export class DeviceLoginCancelledError extends Error {
  constructor() {
    super('Sign in cancelled');
    this.name = 'DeviceLoginCancelledError';
  }
}

let controller: AbortController | null = null;

export function cancelDeviceLogin() {
  controller?.abort();
}

type PollResult =
  | { tokens: OAuthTokens; error?: undefined }
  | { tokens?: undefined; error: string };

async function pollToken(
  deviceCode: string,
  signal: AbortSignal,
): Promise<PollResult> {
  try {
    const { data } = await axios.post<TokenResponse>(
      `${AUTH_URL}/api/auth/oauth/device-token`,
      new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: deviceCode,
        client_id: OAUTH_CLIENT_ID,
      }).toString(),
      { headers: FORM_HEADERS, signal },
    );

    return { tokens: toTokens(data) };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 429) return { error: 'rate_limited' };

      const body = error.response.data as { error?: string };

      return { error: body?.error || 'invalid_grant' };
    }

    if (axios.isAxiosError(error) && !signal.aborted)
      return { error: 'network_error' };

    throw error;
  }
}

export async function startDeviceLogin(
  onState: (state: OAuthState) => void,
): Promise<OAuthTokens> {
  controller = new AbortController();
  const { signal } = controller;

  const { data: device } = await axios.post<DeviceCodeResponse>(
    `${AUTH_URL}/api/auth/oauth/device`,
    new URLSearchParams({
      client_id: OAUTH_CLIENT_ID,
      scope: String(OAUTH_SCOPE),
    }).toString(),
    { headers: FORM_HEADERS, signal },
  );

  await shell.openExternal(device.verification_uri_complete);
  onState({ status: 'waiting', message: device.user_code });

  const deadline = Date.now() + device.expires_in * 1000;
  let interval = device.interval * 1000;

  while (Date.now() < deadline) {
    await sleep(interval);
    if (signal.aborted) throw new DeviceLoginCancelledError();

    let result: PollResult;
    try {
      result = await pollToken(device.device_code, signal);
    } catch (error) {
      if (signal.aborted) throw new DeviceLoginCancelledError();
      throw error;
    }

    if (result.tokens) {
      saveTokens(result.tokens);
      return result.tokens;
    }

    if (result.error === 'rate_limited') {
      interval += 5000;
      continue;
    }

    if (!RETRY_ERRORS.has(result.error))
      throw new Error(
        ERROR_MESSAGES[result.error] || 'Sign in failed. Try again.',
      );
  }

  throw new Error('Sign in timed out. Try again.');
}
