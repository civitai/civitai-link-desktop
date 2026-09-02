import { Button } from '@/components/ui/button';
import { useOAuthLogin } from '@/hooks/use-oauth-login';

export function SignedInRow() {
  const { username, logout } = useOAuthLogin();

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium leading-none">
        Signed in as @{username || 'your Civitai account'}
      </p>
      <Button variant="outline" className="py-2 px-4" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
