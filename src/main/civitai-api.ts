import axios, { AxiosError } from 'axios';
import { getSettings } from './store';

type ResponsePayload = {
  data: {
    modelId: number;
    downloadUrl: string;
    model: {
      name: string;
      type: string;
      nsfw: boolean;
      poi: boolean;
    };
    name: string;
    files: {
      id: number;
      name: string;
    }[];
    images: {
      id: number;
      url: string;
      nsfw: boolean | NsfwType;
    }[];
  };
};

enum NsfwType {
  NONE = 'None',
  SOFT = 'Soft',
  MATURE = 'Mature',
  X = 'X',
}

// TODO: Create ignore list for not found models?
export const getModelByHash = async (hash: string): Promise<Resource> => {
  try {
    const { data }: ResponsePayload = await axios.get(
      `https://civitai.com/api/v1/model-versions/by-hash/${hash}`,
    );

    // Filter NSFW based on settings
    const nsfw = getSettings().nsfw;
    const previewImageUrl = data.images.find((image) => {
      if (nsfw) {
        // If NSFW is enabled, return the first image
        return true;
      }

      // If NSFW is disabled, return the first non-NSFW image
      if (image.nsfw === NsfwType.NONE) {
        return true;
      }

      return false;
    })?.url;

    const resource: Resource = {
      hash,
      url: data.downloadUrl,
      type: data.model.type,
      name: data.files[0].name, // Filename
      modelName: data.model.name,
      modelVersionName: data.name,
      previewImageUrl,
      civitaiUrl: `https://civitai.com/models/${data.modelId}`,
    };

    return resource;
  } catch (error: any | AxiosError) {
    console.error('Error fetching model by hash: ', error.response.data);
    throw error.response.data;
  }
};
