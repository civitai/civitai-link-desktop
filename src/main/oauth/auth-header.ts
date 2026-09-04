import { getApiKey } from '../store/store';
import { getAccessToken, loadTokens } from './token-store';

function legacyApiKey(): string | null {
  const apiKey = getApiKey();

  return typeof apiKey === 'string' && apiKey ? apiKey : null;
}

export function hasCredentials(): boolean {
  return !!loadTokens() || !!legacyApiKey();
}

// Never return null for a user who still has a session: callers read null as an
// authoritative empty vault and overwrite the local one with it.
export async function getAuthHeader(): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (accessToken) return `Bearer ${accessToken}`;

  const apiKey = legacyApiKey();
  if (apiKey) return `Bearer ${apiKey}`;

  if (hasCredentials())
    throw new Error(
      'Could not authorize this request with your Civitai sign in',
    );

  return null;
}
