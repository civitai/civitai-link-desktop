import axios, { AxiosError } from 'axios';
import { getApiKey, getSettings } from './store/store';

const CIVITAI_API_URL = 'https://civitai.com/api/v1';

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
  } catch (error: any | AxiosError) {
    if (error.response) {
      console.error('Error fetching model by hash: ', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    } else {
      throw new Error(`Error fetching model by hash: ${hash}`);
    }
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
  const apiKey = getApiKey();

  if (!apiKey) {
    return;
  }

  try {
    const result: { data: VaultMeta } = await axios.get(
      `${CIVITAI_API_URL}/vault/get`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
    if (!result) return; // If for some reason the result is empty return undefined

    return result.data;
  } catch (error: any | AxiosError) {
    console.error('Error fetching all vault models: ', error.response.data);
    throw error.response.data;
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
  const apiKey = getApiKey();

  if (!apiKey) {
    return [];
  }

  try {
    const { data }: { data: VersionResource[] } = await axios.get(
      `${CIVITAI_API_URL}/vault/check-vault?modelVersionIds=${modelVersionIds.join(',')}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return data;
  } catch (error: any | AxiosError) {
    console.error('Error fetching vault models: ', error.response.data);
    throw error.response.data;
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
  const apiKey = getApiKey();

  if (!apiKey) {
    return [];
  }

  try {
    console.log(apiKey);
    const { data }: { data: { items: VaultModelResource[] } } = await axios.get(
      `${CIVITAI_API_URL}/vault/all`,
      {
        params: {
          limit: 100,
          sort: 'Recently Added',
          page: 1,
        },
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    console.log(data);

    return data.items;
  } catch (error: any | AxiosError) {
    console.error('Error fetching vault models: ', error.response.data);
    throw error.response.data;
  }
};

type ToggleVaultResponse = { success: boolean; vaultId?: number };
export const toggleVaultModel = async (
  modelVersionId: number,
): Promise<ToggleVaultResponse> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { success: false };
  }

  try {
    const { data } = await axios.post(
      `${CIVITAI_API_URL}/vault/toggle-version?modelVersionId=${modelVersionId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return data;
  } catch (error: any | AxiosError) {
    console.error('Error toggling vault model: ', error.response.data);
    throw error.response.data;
  }
};

export const fetchMember = async () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  try {
    const { data } = await axios.get(`${CIVITAI_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return data;
  } catch (error: any | AxiosError) {
    console.error('Error fetching member: ', error.response.data);
    throw error.response.data;
  }
};

export const fetchEnums = async () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  try {
    const { data } = await axios.get(`${CIVITAI_API_URL}/enums`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return data as ApiEnums;
  } catch (error: any | AxiosError) {
    console.error('Error fetching enums: ', error.response.data);
    throw error.response.data;
  }
};
