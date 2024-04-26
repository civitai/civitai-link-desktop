export enum SortType {
  MODEL_NAME = 'modelName',
  DOWNLOAD_DATE = 'downloadDate',
  FILE_SIZE = 'fileSize',
}

export enum VaultSortType {
  MODEL_NAME = 'modelName',
  ADDED_DATE = 'addedAt',
  FILE_SIZE = 'modelSizeKb',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ModelTypes {
  CHECKPOINT = 'Checkpoint',
  EMBEDDING = 'Embedding',
  HYPERNETWORK = 'Hypernetwork',
  AESTHETIC_GRADIENT = 'Aesthetic Gradient',
  LORA = 'LoRA',
  LYCORIS = 'LyCORIS',
  DORA = 'DoRA',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  MOTION = 'Motion',
  VAE = 'VAE',
  POSES = 'Poses',
  WILDCARDS = 'Wildcards',
  WORKFLOWS = 'Workflows',
}

export enum BaseModels {
  SD_1_5 = 'SD 1.5',
  SDXL_1_0 = 'SDXL 1.0',
  PONY = 'Pony',
}

export const reduceFileMap = (
  acc: Record<string, Resource>,
  file: Resource,
): Record<string, Resource> => {
  return {
    ...acc,
    [file.hash]: file,
  };
};

export const sortResource = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: SortDirection,
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as string;
  const filteredFileListB = b[sortType] as string;

  if (!filteredFileListA) return 1;
  if (!filteredFileListB) return -1;

  if (direction === SortDirection.DESC) {
    if (sortType === SortType.MODEL_NAME) {
      return filteredFileListB.localeCompare(filteredFileListA);
    }
    if (sortType === SortType.DOWNLOAD_DATE) {
      return (
        new Date(filteredFileListB).getTime() -
        new Date(filteredFileListA).getTime()
      );
    }
  } else {
    if (sortType === SortType.MODEL_NAME) {
      return filteredFileListA.localeCompare(filteredFileListB);
    }
    if (sortType === SortType.DOWNLOAD_DATE) {
      return (
        new Date(filteredFileListA).getTime() -
        new Date(filteredFileListB).getTime()
      );
    }
  }

  // Default
  return 1;
};

export const sortFileSize = (
  a: Resource,
  b: Resource,
  type: keyof Resource,
  direction: SortDirection,
) => {
  const sortType = type as keyof Resource;
  const filteredFileListA = a[sortType] as number;
  const filteredFileListB = b[sortType] as number;

  if (!filteredFileListA) return 1;
  if (!filteredFileListB) return -1;

  if (direction === SortDirection.DESC) {
    return filteredFileListA - filteredFileListB;
  } else {
    return filteredFileListB - filteredFileListA;
  }
};
