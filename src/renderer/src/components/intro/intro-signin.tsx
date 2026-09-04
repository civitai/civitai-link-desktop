import { DeviceCode } from '@/components/oauth/device-code';
import { Button } from '@/components/ui/button';
import { useOAuthLogin } from '@/hooks/use-oauth-login';
import { LogIn } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useWizard } from 'react-use-wizard';

export function IntroSignin() {
  const { nextStep } = useWizard();
  const { status, message, pending, signedIn, username, login, pair, cancel } =
    useOAuthLogin();
  const repaired = useRef(false);

  useEffect(() => {
    if (status === 'signed-in') nextStep();
  }, [status]);

  // Reaching this step while still holding tokens means the instance key was lost, not the
  // sign-in — `kicked` clears the key and leaves the tokens alone. Pair on those tokens
  // instead of sending the user to a browser to sign in to an account they never left.
  // Advancing on `signedIn` instead would skip the pairing this step exists to do.
  useEffect(() => {
    if (!signedIn || repaired.current || status !== 'idle') return;

    repaired.current = true;
    pair();
  }, [signedIn, status]);

  const reconnecting = signedIn && status !== 'error';

  return (
    <div className="space-y-4 flex flex-1 flex-col">
      <div className="space-y-2">
        <div className="flex justify-center mb-8">
          <LogIn size={48} />
        </div>
        <h1 className="text-xl">
          {reconnecting ? 'Reconnecting' : 'Sign in with Civitai'}
        </h1>
        <p className="text-sm text-primary mb-2">
          {status === 'error'
            ? message
            : reconnecting
              ? `Reconnecting this device${username ? ` as ${username}` : ''}.`
              : pending
                ? 'Approve in your browser to connect this device.'
                : 'We will open your browser so you can approve this device.'}
        </p>
        <DeviceCode />
      </div>
      <div className="flex flex-1 flex-col justify-center space-y-4">
        {pending ? (
          <Button
            onClick={cancel}
            variant="outline"
            className="w-full rounded-full py-2"
          >
            Cancel
          </Button>
        ) : (
          <Button
            onClick={login}
            variant="secondary"
            className="w-full rounded-full py-2"
          >
            {status === 'error' ? 'Try again' : 'Sign in with Civitai'}
          </Button>
        )}
      </div>
    </div>
  );
}
