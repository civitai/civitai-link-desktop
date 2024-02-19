import axios from 'axios';

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
    }[];
  };
};

export const getModelByHash = async (hash: string): Promise<Resource> => {
  const { data }: ResponsePayload = await axios.get(
    `https://civitai.com/api/v1/model-versions/by-hash/${hash}`,
  );

  const resource: Resource = {
    hash,
    url: data.downloadUrl,
    type: data.model.type,
    name: data.files[0].name, // Filename
    modelName: data.model.name,
    modelVersionName: data.name,
    previewImageUrl: data.images[0]?.url,
    civitaiUrl: `https://civitai.com/models/${data.modelId}`,
  };

  return resource;
};
