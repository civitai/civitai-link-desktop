import { app } from 'electron';
import Store, { Schema } from 'electron-store';
import path from 'path';
import { initFolderCheck } from '../folder-watcher';

export enum Resources {
  CHECKPOINT = 'CHECKPOINT',
  CONTROLNET = 'CONTROLNET',
  UPSCALER = 'UPSCALER',
  HYPERNETWORK = 'HYPERNETWORK',
  TEXTUALINVERSION = 'TEXTUALINVERSION',
  LORA = 'LORA',
  LOCON = 'LOCON',
  VAE = 'VAE',
  DORA = 'DORA',
  UNET = 'UNET',
  CLIP = 'CLIP',
  GLIGEN = 'GLIGEN',
  STYLE_MODEL = 'STYLE_MODEL',
  CLIP_VISION = 'CLIP_VISION',
  IPADAPTER = 'IPADAPTER',
  TEXT_ENCODER = 'TEXT_ENCODER',
  DIFFUSION_MODEL = 'DIFFUSION_MODEL',
  ANIMATEDIFF = 'ANIMATEDIFF',
  MOTION_LORA = 'MOTION_LORA',
  ADAPTER = 'ADAPTER',
  INSIGHTFACE = 'INSIGHTFACE',
  FACERESTORE = 'FACERESTORE',
  SAM = 'SAM',
  ULTRALYTICS = 'ULTRALYTICS',
  DEPTH = 'DEPTH',
  PULID = 'PULID',
  PHOTOMAKER = 'PHOTOMAKER',
  LLM = 'LLM',
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
      [Resources.DORA]: '',
      [Resources.UNET]: '',
      [Resources.CLIP]: '',
      [Resources.GLIGEN]: '',
      [Resources.STYLE_MODEL]: '',
      [Resources.CLIP_VISION]: '',
      [Resources.IPADAPTER]: '',
      [Resources.TEXT_ENCODER]: '',
      [Resources.DIFFUSION_MODEL]: '',
      [Resources.ANIMATEDIFF]: '',
      [Resources.MOTION_LORA]: '',
      [Resources.ADAPTER]: '',
      [Resources.INSIGHTFACE]: '',
      [Resources.FACERESTORE]: '',
      [Resources.SAM]: '',
      [Resources.ULTRALYTICS]: '',
      [Resources.DEPTH]: '',
      [Resources.PULID]: '',
      [Resources.PHOTOMAKER]: '',
      [Resources.LLM]: '',
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
  const storedPath = store.get('rootResourcePath') as string;
  if (storedPath) return storedPath;

  return '';
}

export function setRootResourcePath(path: string) {
  store.set('rootResourcePath', path);
}

export function setResourcePath(resource: string, path: string) {
  store.set(`resourcePaths.${resource}`, path);
  initFolderCheck();

  return;
}

const SYMLINK: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'checkpoints',
  [Resources.CONTROLNET]: 'controlnet',
  [Resources.UPSCALER]: 'upscale_models',
  [Resources.HYPERNETWORK]: 'hypernetworks',
  [Resources.TEXTUALINVERSION]: 'embeddings',
  [Resources.LORA]: 'loras',
  [Resources.LOCON]: 'LoCon',
  [Resources.VAE]: 'vae',
  [Resources.DORA]: 'DoRA',
  [Resources.UNET]: 'unet',
  [Resources.CLIP]: 'clip',
  [Resources.GLIGEN]: 'gligen',
  [Resources.STYLE_MODEL]: 'style_models',
  [Resources.CLIP_VISION]: 'clip_vision',
  [Resources.IPADAPTER]: 'ipadapter',
  [Resources.TEXT_ENCODER]: 'text_encoders',
  [Resources.DIFFUSION_MODEL]: 'diffusion_models',
  [Resources.ANIMATEDIFF]: 'animatediff_models',
  [Resources.MOTION_LORA]: 'animatediff_motion_lora',
  [Resources.ADAPTER]: 'adapter',
  [Resources.INSIGHTFACE]: 'insightface',
  [Resources.FACERESTORE]: 'facerestore_models',
  [Resources.SAM]: 'sams',
  [Resources.ULTRALYTICS]: 'ultralytics',
  [Resources.DEPTH]: 'depth',
  [Resources.PULID]: 'pulid',
  [Resources.PHOTOMAKER]: 'photomaker',
  [Resources.LLM]: 'llm',
};

const A1111_PATHS: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'Stable-diffusion',
  [Resources.VAE]: 'VAE',
  [Resources.TEXTUALINVERSION]: '../embeddings',
  [Resources.LOCON]: 'LyCORIS',
  [Resources.DORA]: 'DoRA',
};

const COMFY_UI_PATHS: { [key in Resources]?: string } = {
  [Resources.CHECKPOINT]: 'checkpoints',
  [Resources.CONTROLNET]: 'controlnet',
  [Resources.UPSCALER]: 'upscale_models',
  [Resources.HYPERNETWORK]: 'hypernetworks',
  [Resources.TEXTUALINVERSION]: 'embeddings',
  [Resources.LORA]: 'loras',
  [Resources.VAE]: 'vae',
  [Resources.DORA]: 'DoRA',
  [Resources.UNET]: 'unet',
  [Resources.CLIP]: 'clip',
  [Resources.GLIGEN]: 'gligen',
  [Resources.STYLE_MODEL]: 'style_models',
  [Resources.CLIP_VISION]: 'clip_vision',
  [Resources.IPADAPTER]: 'ipadapter',
  [Resources.TEXT_ENCODER]: 'text_encoders',
  [Resources.DIFFUSION_MODEL]: 'diffusion_models',
  [Resources.ANIMATEDIFF]: 'animatediff_models',
  [Resources.MOTION_LORA]: 'animatediff_motion_lora',
  [Resources.ADAPTER]: 'adapter',
  [Resources.INSIGHTFACE]: 'insightface',
  [Resources.FACERESTORE]: 'facerestore_models',
  [Resources.SAM]: 'sams',
  [Resources.ULTRALYTICS]: 'ultralytics',
  [Resources.DEPTH]: 'depthanything',
  [Resources.PULID]: 'pulid',
  [Resources.PHOTOMAKER]: 'photomaker',
  [Resources.LLM]: 'llm',
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

    // If key not found in map, use the resource name (capitalized) as the folder name
    // e.g. "UNKNOWN" -> D:\models\UNKNOWN
    const folderName = PATHS[resource] || resource;

    return path.join(rootResourcePath || app.getPath('home'), folderName);
  }

  return resourcePaths[resource];
}

export function getAllPaths() {
  const resourcePaths = store.get('resourcePaths') as {
    [k: string]: string;
  };
  const rootResourcePath = getRootResourcePath();
  const sdType = store.get('sdType') as string;

  // Create a unique set of paths to watch
  const pathsToWatch = new Set<string>();

  if (rootResourcePath) {
    pathsToWatch.add(rootResourcePath);
  }

  // Build the path mapping based on SD type
  const PATHS = {
    ...SYMLINK,
    ...(sdType === 'a1111'
      ? A1111_PATHS
      : sdType === 'comfyui'
        ? COMFY_UI_PATHS
        : {}),
  };

  // Add all resource type paths
  Object.values(Resources).forEach((resourceKey) => {
    // Check if user has set a custom path for this resource
    let pathToAdd = resourcePaths[resourceKey];

    // If no custom path, use default structure under root
    if (!pathToAdd || pathToAdd === '') {
      const folderName = PATHS[resourceKey];
      if (folderName && rootResourcePath) {
        pathToAdd = path.join(rootResourcePath, folderName);
      }
    }

    if (pathToAdd && pathToAdd !== rootResourcePath) {
      pathsToWatch.add(pathToAdd);
    }
  });

  console.log('getAllPaths returning:', Array.from(pathsToWatch));
  return Array.from(pathsToWatch);
}
