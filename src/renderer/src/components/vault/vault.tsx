import { useElectron } from '@/providers/electron';
import { ApiKeyInput } from '../api-key-input';
import { MemberButton } from '../member-button';

export function Vault() {
  const { apiKey } = useElectron();
  const vault = null; // TODO: Fetch vault
  const me = {};

  if (!apiKey) {
    return (
      <div>
        <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-20">
          API Key and Membership are required to use Vault.
        </p>
        <ApiKeyInput />
        <div className="flex justify-center items-center mt-4">
          <MemberButton />
        </div>
      </div>
    );
  }

  if (!vault && !Object.hasOwn(me, 'tier')) {
    return (
      <div className="flex justify-center items-center mt-4">
        <MemberButton />
      </div>
    );
  }

  return <h1>Vault</h1>;
}
