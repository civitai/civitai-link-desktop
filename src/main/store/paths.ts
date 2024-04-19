import Store, { Schema } from 'electron-store';
import path from 'path';

export enum Resources {
  CHECKPOINT = 'Checkpoint',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  HYPERNETWORK = 'Hypernetwork',
  TEXTUALINVERSION = 'Embeddings',
  LORA = 'Lora',
  LOCON = 'LoCon',
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
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  return store.set('resourcePaths', {
    ...resourcePaths,
    [resource]: path,
  });
}

const A1111_PATHS = {
  [Resources.CHECKPOINT]: 'Stable-diffusion',
  [Resources.VAE]: 'VAE',
};

const COMFY_UI_PATHS = {
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
  const resource = Resources[resourcePath.toUpperCase()];
  const resourcePaths = store.get('resourcePaths') as { [k: string]: string };

  if (resourcePaths[resource] === '') {
    const rootResourcePath = getRootResourcePath();
    const uppercaseResourcePath = resourcePath.toUpperCase();
    const sdType = store.get('sdType') as string;
    const PATHS =
      sdType === 'a1111'
        ? A1111_PATHS[uppercaseResourcePath]
        : COMFY_UI_PATHS[uppercaseResourcePath];
    const DEFAULT_PATH = Resources[uppercaseResourcePath];

    if (!PATHS || sdType === 'symlink') {
      return path.resolve(rootResourcePath, DEFAULT_PATH);
    }

    return path.resolve(rootResourcePath, PATHS);
  }

  return resourcePaths[resource];
}
