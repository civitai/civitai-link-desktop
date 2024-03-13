import Store, { Schema } from 'electron-store';

export enum Resources {
  CHECKPOINT = 'Checkpoint',
  CONTROLNET = 'ControlNet',
  UPSCALER = 'Upscaler',
  HYPERNETWORK = 'Hypernetwork',
  TEXTUALINVERSION = 'TextualInversion',
  LORA = 'Lora',
  LOCON = 'LoCon',
  VAE = 'VAE',
}

const schema: Schema<Record<string, unknown>> = {
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

// A1111
// /models
//  /Stable-diffusion - checkpoint
//  /VAE-approx
//  /VAE
//  /deepbooru
//  /karlo
// All others are created by us or the user

// ComfyUI
// ComfyUI\models\checkpoints
