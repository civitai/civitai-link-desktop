import axios from 'axios';
import { getAuthHeader } from './oauth/auth-header';
import { getSettings } from './store/store';

const CIVITAI_API_URL: string =
  import.meta.env.MAIN_VITE_API_URL || 'https://civitai.com/api/v1';
const MODEL_LOOKUP_TIMEOUT = 15000;

export class ModelNotFoundError extends Error {
  constructor(hash: string) {
    super(`No Civitai model found for hash ${hash}`);
    this.name = 'ModelNotFoundError';
  }
}

function getRequestError(error: unknown) {
  if (!axios.isAxiosError(error)) return error;
  return error.response?.data ?? error.message;
}

type ResponsePayload = {
  data: {
    id: number;
    modelId: number;
    downloadUrl: string;
    description: string;
    baseModel: string;
    model: {
      name: string;
      type: string;
      nsfw: boolean;
      poi: boolean;
    };
    name: string;
    trainedWords: string[];
    files: {
      id: number;
      name: string;
      metadata: { format: string };
    }[];
    images: {
      id: number;
      url: string;
      nsfwLevel: number;
      meta: { [key: string]: string };
    }[];
  };
};

export const getModelByHash = async (hash: string): Promise<Resource> => {
  try {
    const { data }: ResponsePayload = await axios.get(
      `${CIVITAI_API_URL}/model-versions/by-hash/${hash}`,
      { timeout: MODEL_LOOKUP_TIMEOUT },
    );

    // Filter NSFW based on settings
    const nsfw = getSettings().nsfw;
    const previewImageUrl = data.images.find((image) => {
      // If NSFW is enabled, return the first image
      if (nsfw) return true;

      // If NSFW is disabled, return the first non-NSFW image
      if (image.nsfwLevel === 1) return true;

      return false;
    })?.url;

    const resource: Resource = {
      hash,
      url: data.downloadUrl,
      type: data.model.type,
      name:
        data.files.find((file) => file.metadata.format !== 'Other')?.name || '', // Filename
      modelName: data.model.name,
      modelVersionName: data.name,
      modelVersionId: data.id,
      previewImageUrl,
      trainedWords: data.trainedWords,
      description: data.description,
      baseModel: data.baseModel,
      civitaiUrl: `https://civitai.com/models/${data.modelId}`,
    };

    return resource;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new ModelNotFoundError(hash);
    }

    if (axios.isAxiosError(error) && error.response) {
      console.error('Error fetching model by hash: ', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }

    throw new Error(`Error fetching model by hash: ${hash}`, {
      cause: error,
    });
  }
};

type VaultMeta = {
  vault: {
    userId: number;
    usedStorageKb: number;
    storageKb: number;
    updatedAt: string;
  };
};

export const fetchVaultMeta = async (): Promise<VaultMeta | undefined> => {
  const authorization = await getAuthHeader();

  if (!authorization) {
    return;
  }

  try {
    const result: { data: VaultMeta } = await axios.get(
      `${CIVITAI_API_URL}/vault/get`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );
    if (!result) return; // If for some reason the result is empty return undefined

    return result.data;
  } catch (error: unknown) {
    const requestError = getRequestError(error);
    console.error('Error fetching all vault models: ', requestError);
    throw requestError;
  }
};

type VersionResource = {
  modelVersionId: number;
  vaultItem: null | { vaultId: number };
  modelName?: string;
  versionName?: string;
};

export const fetchVaultModelsByVersion = async (
  modelVersionIds: number[],
): Promise<VersionResource[]> => {
  const authorization = await getAuthHeader();

  if (!authorization) {
    return [];
  }

  try {
    const { data }: { data: VersionResource[] } = await axios.get(
      `${CIVITAI_API_URL}/vault/check-vault?modelVersionIds=${modelVersionIds.join(',')}`,
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return data;
  } catch (error: unknown) {
    const requestError = getRequestError(error);
    console.error('Error fetching vault models: ', requestError);
    throw requestError;
  }
};

type VaultModelResource = {
  id: number;
  modelVersionId: number;
  modelId: number;
  modelName: string;
  versionName: string;
  coverImageUrl: string;
  status: 'Pending' | 'Stored';
  isLocal?: boolean;
};
// TODO: Add pagination
export const fetchVaultModels = async (): Promise<VaultModelResource[]> => {
  const authorization = await getAuthHeader();

  if (!authorization) {
    return [];
  }

  try {
    const { data }: { data: { items: VaultModelResource[] } } = await axios.get(
      `${CIVITAI_API_URL}/vault/all`,
      {
        params: {
          limit: 100,
          sort: 'Recently Added',
          page: 1,
        },
        headers: {
          Authorization: authorization,
        },
      },
    );

    return data.items;
  } catch (error: unknown) {
    const requestError = getRequestError(error);
    console.error('Error fetching vault models: ', requestError);
    throw requestError;
  }
};

type ToggleVaultResponse = { success: boolean; vaultId?: number };
export const toggleVaultModel = async (
  modelVersionId: number,
): Promise<ToggleVaultResponse> => {
  const authorization = await getAuthHeader();

  if (!authorization) {
    return { success: false };
  }

  try {
    const { data } = await axios.post(
      `${CIVITAI_API_URL}/vault/toggle-version?modelVersionId=${modelVersionId}`,
      {},
      {
        headers: {
          Authorization: authorization,
        },
      },
    );

    return data;
  } catch (error: unknown) {
    const requestError = getRequestError(error);
    console.error('Error toggling vault model: ', requestError);
    throw requestError;
  }
};

export const fetchMember = async () => {
  const authorization = await getAuthHeader();

  if (!authorization) {
    return null;
  }

  try {
    const { data } = await axios.get(`${CIVITAI_API_URL}/me`, {
      headers: {
        Authorization: authorization,
      },
    });

    return data;
  } catch (error: unknown) {
    const requestError = getRequestError(error);
    console.error('Error fetching member: ', requestError);
    throw requestError;
  }
};
