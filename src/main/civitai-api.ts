import axios from 'axios';

type PartialResource = { previewImageUrl: string; civitaiUrl: string };

// TODO: Could use this for getting all the Resource details
export const getModelByHash = async (
  hash: string,
): Promise<PartialResource> => {
  const response = await axios.get(
    `https://civitai.com/api/v1/model-versions/by-hash/${hash}`,
  );

  const resource: PartialResource = {
    previewImageUrl: response.data.images[0]?.url,
    civitaiUrl: `https://civitai.com/models/${response.data.modelId}`,
  };

  return resource;
};
