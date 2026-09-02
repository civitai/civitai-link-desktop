import { useOAuthLogin } from '@/hooks/use-oauth-login';

export function DeviceCode() {
  const { message, verificationUri, pending } = useOAuthLogin();

  if (!pending || !message) return null;

  return (
    <div className="space-y-1">
      <p className="text-sm text-primary font-mono">{message}</p>
      {verificationUri ? (
        <p className="text-xs text-primary break-all">{verificationUri}</p>
      ) : null}
    </div>
  );
}
