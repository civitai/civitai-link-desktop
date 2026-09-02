import { safeStorage } from 'electron';
import { getOAuthBlob, setOAuthBlob } from '../store/store';

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

export function toTokens(data: TokenResponse): OAuthTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

function encode(tokens: OAuthTokens): string {
  const json = JSON.stringify(tokens);

  if (!safeStorage.isEncryptionAvailable()) {
    console.warn(
      'safeStorage is unavailable, storing Civitai tokens unencrypted',
    );
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
    console.error('Could not read stored Civitai tokens', error);
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
