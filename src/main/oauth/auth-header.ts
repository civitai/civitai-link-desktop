import { getApiKey } from '../store/store';
import { getAccessToken, loadTokens } from './token-store';

export async function getAuthHeader(): Promise<string | null> {
  const accessToken = await getAccessToken();
  if (accessToken) return `Bearer ${accessToken}`;

  const apiKey = getApiKey() as string | null;

  return apiKey ? `Bearer ${apiKey}` : null;
}

export function hasCredentials(): boolean {
  return !!loadTokens() || !!getApiKey();
}
