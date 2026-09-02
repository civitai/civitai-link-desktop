import { getWindow } from '../browser-window';

export type OAuthStatus =
  | 'idle'
  | 'waiting'
  | 'pairing'
  | 'signed-in'
  | 'signed-out'
  | 'error';

export type OAuthState = {
  status: OAuthStatus;
  message?: string;
  username?: string;
  verificationUri?: string;
};

export function sendOAuthState(state: OAuthState) {
  const mainWindow = getWindow();
  if (!mainWindow || mainWindow.isDestroyed()) return;

  mainWindow.webContents.send('oauth-state', state);
}
