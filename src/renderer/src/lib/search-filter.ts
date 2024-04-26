export enum SortType {
  MODEL_NAME = 'modelName',
  DOWNLOAD_DATE = 'downloadDate',
  FILE_SIZE = 'fileSize',
}

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
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

export const sortModelName = (
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
    return filteredFileListB.localeCompare(filteredFileListA);
  } else {
    return filteredFileListA.localeCompare(filteredFileListB);
  }
};

export const sortDownloadDate = (
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
    return (
      new Date(filteredFileListB).getTime() -
      new Date(filteredFileListA).getTime()
    );
  } else {
    return (
      new Date(filteredFileListA).getTime() -
      new Date(filteredFileListB).getTime()
    );
  }
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
