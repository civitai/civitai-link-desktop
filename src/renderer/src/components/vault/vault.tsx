import { useElectron } from '@/providers/electron';
import { ApiKeyInput } from '../api-key-input';
import { MemberButton } from '../member-button';
import { useVault } from '@/providers/vault';
import prettyBytes from 'pretty-bytes';
import { Progress } from '@/components/ui/progress';
import { VaultItem } from './vault-item';

export function Vault() {
  const { apiKey, user } = useElectron();
  const { vaultMeta } = useVault();
  const percentUsed = (
    ((vaultMeta?.usedStorageKb || 0) / (vaultMeta?.storageKb || 0)) *
    100
  ).toFixed(2);
  const vault = [
    {
      modelVersionId: 337944,
      vaultItem: {
        id: 44,
        vaultId: 3019815,
        status: 'Stored',
        files: [
          {
            id: 268313,
            url: 'https://civitai-delivery-worker-prod.5ac0637cfd0766c97916cefa3764fbdf.r2.cloudflarestorage.com/model/99813/neonNoirSDXL.WLGH.safetensors',
            sizeKB: 223099.09765625,
            displayName: 'LoRA',
          },
        ],
        modelVersionId: 337944,
        modelId: 300898,
        modelName: 'Neon Noir SDXL',
        versionName: 'SDXL',
        creatorId: 99813,
        creatorName: 'maDcaDDie',
        type: 'LORA',
        baseModel: 'SDXL 1.0',
        category: 'style',
        createdAt: '2024-02-10T22:18:30.884Z',
        addedAt: '2024-03-18T20:12:37.707Z',
        refreshedAt: null,
        modelSizeKb: 223099,
        detailsSizeKb: 10,
        imagesSizeKb: 1970,
        notes: null,
        meta: {},
      },
    },
  ];

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

  if (!vault || (user && !Object.hasOwn(user, 'tier'))) {
    return (
      <div className="flex flex-col justify-center items-center mt-4">
        <p className="text-sm leading-none dark:text-white font-bold mb-4 text-center mx-8">
          In order to use Civitai Vault, you need to purchase membership.
        </p>
        <MemberButton />
      </div>
    );
  }

  // TODO: Add ability to download from vault
  return (
    <div>
      <div className="flex justify-end w-full pt-2 pb-4">
        <div className="flex flex-col text-right gap-2">
          <Progress value={parseFloat(percentUsed)} />
          <p className="text-sm text-[#909296]">
            {percentUsed}% of {prettyBytes(vaultMeta?.storageKb || 0)} Used
          </p>
        </div>
      </div>
      {vault.map((item) => (
        <VaultItem {...item.vaultItem} />
      ))}
    </div>
  );
}
