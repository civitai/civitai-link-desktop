import { useApi } from '@/hooks/use-api';
import { useElectron } from '@/providers/electron';

export function useOAuthLogin() {
  const { oauthState, oauthSignedIn, oauthUsername } = useElectron();
  const { oauthLogin, oauthPair, oauthCancel, oauthLogout } = useApi();

  return {
    status: oauthState.status,
    message: oauthState.message,
    verificationUri: oauthState.verificationUri,
    signedIn: oauthSignedIn,
    username: oauthUsername,
    pending: oauthState.status === 'waiting' || oauthState.status === 'pairing',
    login: oauthLogin,
    pair: oauthPair,
    cancel: oauthCancel,
    logout: oauthLogout,
  };
}
