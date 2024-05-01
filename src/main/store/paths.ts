import Store, { Schema } from 'electron-store';
import path from 'path';
import { checkModelsFolder } from '../check-models-folder';
import { app } from 'electron';

export enum Resources {
  CHECKPOINT = 'CHECKPOINT',
  CONTROLNET = 'CONTROLNET',
  UPSCALER = 'UPSCALER',
  HYPERNETWORK = 'HYPERNETWORK',
  TEXTUALINVERSION = 'TEXTUALINVERSION',
  LORA = 'LORA',
  LOCON = 'LOCON',
  VAE = 'VAE',
}

const schema: Schema<Record<string, unknown>> = {
  sdType: {
    type: 'string',
    default: '',
  },
  resourcePaths: {
    type: 'object',
    default: {
      [Resources.CHECKPOINT]: '',
      [Resources.CONTROLNET]: '',
      [Resources.UPSCALER]: '',
      [Resources.HYPERNETWORK]: '',
      [Resources.TEXTUALINVERSION]: '',
      [Resources.LORA]: '',
      [Resources.LOCON]: '',
      [Resources.VAE]: '',
    },
  },
  resources: {
    type: 'object',
    default: {},
  },
};

// Check if paths set in store and migrate over at startup
export const store = new Store({ schema });

export function getRootResourcePath(): string {
  return store.get('rootResourcePath') as string;
}

export function setRootResourcePath(path: string) {
  store.set('rootResourcePath', path);
}

export function setResourcePath(resource: string, path: string) {
  // Rescan directory
  checkModelsFolder({ directory: path });

  return store.set(`resourcePaths.${resource}`, path);
}

const SYMLINK: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'Checkpoints',
  [Resources.CONTROLNET]: 'ControlNet',
  [Resources.UPSCALER]: 'Upscaler',
  [Resources.HYPERNETWORK]: 'Hypernetwork',
  [Resources.TEXTUALINVERSION]: 'embeddings',
  [Resources.LORA]: 'Lora',
  [Resources.LOCON]: 'LoCon',
  [Resources.VAE]: 'VAE',
};

const A1111_PATHS: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'Stable-diffusion',
  [Resources.VAE]: 'VAE',
  [Resources.TEXTUALINVERSION]: 'embeddings',
};

const COMFY_UI_PATHS: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'checkpoints',
  [Resources.CONTROLNET]: 'controlnet',
  [Resources.UPSCALER]: 'upscale_models',
  [Resources.HYPERNETWORK]: 'hypernetworks',
  [Resources.TEXTUALINVERSION]: 'embeddings',
  [Resources.LORA]: 'loras',
  [Resources.VAE]: 'vae',
};

export function setSDType(sdType: string) {
  store.set('sdType', sdType);
}

export function getResourcePath(resourcePath: string) {
  const resource = resourcePath.toUpperCase();
  const resourcePaths = store.get('resourcePaths') as {
    [k: string]: string;
  };

  if (!resourcePaths[resource] || resourcePaths[resource] === '') {
    const rootResourcePath = getRootResourcePath();
    const sdType = store.get('sdType') as string;

    const PATHS = {
      ...SYMLINK,
      ...(sdType === 'a1111'
        ? A1111_PATHS
        : sdType === 'comfyui'
          ? COMFY_UI_PATHS
          : {}),
    };

    return path.join(rootResourcePath || app.getPath('home'), PATHS[resource]);
  }

  return resourcePaths[resource];
}

export function getAllPaths() {
  const resourcePaths = store.get('resourcePaths') as {
    [k: string]: string;
  };
  const rootResourcePath = getRootResourcePath();
  const sdType = store.get('sdType') as string;

  return Object.keys(resourcePaths).map((key) => {
    const uppercaseKey = key.toUpperCase();
    if (!resourcePaths[uppercaseKey] || resourcePaths[uppercaseKey] === '') {
      const PATHS = {
        ...SYMLINK,
        ...(sdType === 'a1111'
          ? A1111_PATHS
          : sdType === 'comfyui'
            ? COMFY_UI_PATHS
            : {}),
      };

      return path.join(
        rootResourcePath || app.getPath('home'),
        PATHS[uppercaseKey],
      );
    }

    return resourcePaths[uppercaseKey];
  });
}
