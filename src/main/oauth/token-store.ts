import axios from 'axios';
import { safeStorage } from 'electron';
import { getOAuthBlob, setOAuthBlob } from '../store/store';
import { AUTH_URL, OAUTH_CLIENT_ID } from './constants';
import { sendOAuthState } from './state';

export type OAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

const REFRESH_WINDOW_MS = 60_000;

export function toTokens(data: TokenResponse): OAuthTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

let warnedPlaintext = false;

function encode(tokens: OAuthTokens): string {
  const json = JSON.stringify(tokens);

  if (!safeStorage.isEncryptionAvailable()) {
    if (!warnedPlaintext) {
      warnedPlaintext = true;
      console.warn(
        'safeStorage is unavailable, storing Civitai tokens unencrypted',
      );
    }

    return json;
  }

  return safeStorage.encryptString(json).toString('base64');
}

function decode(blob: string): OAuthTokens | null {
  try {
    if (blob.startsWith('{')) return JSON.parse(blob) as OAuthTokens;

    return JSON.parse(
      safeStorage.decryptString(Buffer.from(blob, 'base64')),
    ) as OAuthTokens;
  } catch (error) {
    console.error(
      'Could not read stored Civitai tokens',
      error instanceof Error ? error.message : 'unknown',
    );
    if (safeStorage.isEncryptionAvailable()) clearTokens();

    return null;
  }
}

export function saveTokens(tokens: OAuthTokens) {
  setOAuthBlob(encode(tokens));
}

export function loadTokens(): OAuthTokens | null {
  const blob = getOAuthBlob();

  return blob ? decode(blob) : null;
}

export function clearTokens() {
  setOAuthBlob(null);
}

let refreshPromise: Promise<OAuthTokens | null> | null = null;

async function requestRefresh(
  refreshToken: string,
): Promise<OAuthTokens | null> {
  try {
    const { data } = await axios.post<TokenResponse>(
      `${AUTH_URL}/api/auth/oauth/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OAUTH_CLIENT_ID,
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const tokens = toTokens(data);
    saveTokens(tokens);

    return tokens;
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    console.error(
      'Civitai token refresh failed',
      status ?? (error instanceof Error ? error.message : 'unknown'),
    );

    if (status && status >= 400 && status < 500) {
      clearTokens();
      sendOAuthState({ status: 'signed-out' });
    }

    return null;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;
  if (tokens.expiresAt - Date.now() >= REFRESH_WINDOW_MS)
    return tokens.accessToken;

  if (!refreshPromise) {
    refreshPromise = requestRefresh(tokens.refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  const refreshed = await refreshPromise;

  return refreshed ? refreshed.accessToken : null;
}
