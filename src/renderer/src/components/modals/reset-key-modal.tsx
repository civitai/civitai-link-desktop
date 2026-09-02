import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOAuthLogin } from '@/hooks/use-oauth-login';

export function ResetKeyModal() {
  const { status, message, pending, login, cancel } = useOAuthLogin();

  return (
    <DialogContent className="max-w-[360px] rounded p-4">
      <DialogHeader>
        <DialogTitle>
          <img src={logo} alt="logo" className="w-10 h-10 mb-4" />
        </DialogTitle>
        <DialogDescription className="text-white text-left">
          {status === 'error'
            ? message
            : pending
              ? 'Approve in your browser to reconnect this device.'
              : 'Sign in with Civitai to reconnect this device.'}
        </DialogDescription>
      </DialogHeader>
      {pending && message ? (
        <p className="text-sm text-primary font-mono">{message}</p>
      ) : null}
      <DialogFooter>
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
      </DialogFooter>
    </DialogContent>
  );
}
