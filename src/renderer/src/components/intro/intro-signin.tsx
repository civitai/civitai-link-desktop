import { DeviceCode } from '@/components/oauth/device-code';
import { Button } from '@/components/ui/button';
import { useOAuthLogin } from '@/hooks/use-oauth-login';
import { LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useWizard } from 'react-use-wizard';

export function IntroSignin() {
  const { nextStep } = useWizard();
  const { status, message, pending, login, cancel } = useOAuthLogin();

  useEffect(() => {
    if (status === 'signed-in') nextStep();
  }, [status]);

  return (
    <div className="space-y-4 flex flex-1 flex-col">
      <div className="space-y-2">
        <div className="flex justify-center mb-8">
          <LogIn size={48} />
        </div>
        <h1 className="text-xl">Sign in with Civitai</h1>
        <p className="text-sm text-primary mb-2">
          {status === 'error'
            ? message
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
