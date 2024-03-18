import { useElectron } from '@/providers/electron';
import { ApiKeyInput } from '../api-key-input';
import { MemberButton } from '../member-button';

export function Vault() {
  const { apiKey, user } = useElectron();
  const vault = null;
  // const [vault, setVault] = useState(null); // TODO: Fetch vault

  // useEffect(() => {
  //   const fetchVault = async () => {
  //     const { data } = await axios.get(`https://civitai.com/api/v1/vault/get`, {
  //       headers: {
  //         Authorization: `Bearer ${apiKey}`,
  //       },
  //     });

  //     setVault(data.vault);
  //   };

  //   if (apiKey && user && Object.hasOwn(user, 'tier')) {
  //     fetchVault();
  //   }
  // }, []);

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

  if (!vault && user && !Object.hasOwn(user, 'tier')) {
    return (
      <div className="flex flex-col justify-center items-center mt-4">
        <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-8">
          In order to use Civitai Vault, you need to purchase membership.
        </p>
        <MemberButton />
      </div>
    );
  }

  return <h1>Vault</h1>;
}
