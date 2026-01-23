import path from 'path';
import { getResourcePath } from '../store/paths';

interface SmartPathParams {
  type: string;
  baseModel?: string;
  tags?: string[];
}

const TYPE_MAP: Record<string, string> = {
  checkpoint: 'CHECKPOINT',
  textualinversion: 'TEXTUALINVERSION',
  hypernetwork: 'HYPERNETWORK',
  aestheticgradient: 'HYPERNETWORK',
  lora: 'LORA',
  locon: 'LOCON',
  controlnet: 'CONTROLNET',
  upscaler: 'UPSCALER',
  vae: 'VAE',
  dora: 'DORA',
  unet: 'UNET',
  clip: 'CLIP',
  gligen: 'GLIGEN',
  stylemodel: 'STYLE_MODEL',
  poses: 'OTHER',
  wildcards: 'OTHER',
  workflows: 'OTHER',
  motionmodule: 'ANIMATEDIFF',
  clipvision: 'CLIP_VISION',
  clip_vision: 'CLIP_VISION',
  ipadapter: 'IPADAPTER',
  'ip-adapter': 'IPADAPTER',
  textencoder: 'TEXT_ENCODER',
  text_encoder: 'TEXT_ENCODER',
  t5: 'TEXT_ENCODER',
  diffusionmodel: 'DIFFUSION_MODEL',
  diffusion_model: 'DIFFUSION_MODEL',
  animatediff: 'ANIMATEDIFF',
  motionlora: 'MOTION_LORA',
  motion_lora: 'MOTION_LORA',
  adapter: 'ADAPTER',
  insightface: 'INSIGHTFACE',
  facerestore: 'FACERESTORE',
  gfpgan: 'FACERESTORE',
  codeformer: 'FACERESTORE',
  sam: 'SAM',
  sam2: 'SAM',
  ultralytics: 'ULTRALYTICS',
  yolo: 'ULTRALYTICS',
  depth: 'DEPTH',
  depthanything: 'DEPTH',
  pulid: 'PULID',
  photomaker: 'PHOTOMAKER',
  llm: 'LLM',
};

function normalizeBaseModel(base: string): string {
  const b = base.toLowerCase();

  // ==========================================
  // Flux Architecture (check specific versions first)
  // ==========================================
  if (b.includes('flux.1') || b.includes('flux 1') || b.includes('flux1')) {
    if (b.includes('dev')) return 'Flux1-Dev';
    if (b.includes('schnell')) return 'Flux1-Schnell';
    if (b.includes('pro')) return 'Flux1-Pro';
    if (b.includes('fill')) return 'Flux1-Fill';
    if (b.includes('canny')) return 'Flux1-Canny';
    if (b.includes('depth')) return 'Flux1-Depth';
    if (b.includes('redux')) return 'Flux1-Redux';
    return 'Flux1';
  }
  if (b.includes('flux')) return 'Flux';

  // ==========================================
  // Hunyuan Architecture
  // ==========================================
  if (b.includes('hunyuan')) {
    if (b.includes('video')) return 'HunyuanVideo';
    if (b.includes('dit')) return 'HunyuanDiT';
    return 'Hunyuan';
  }

  // ==========================================
  // SD 3.5 variants (check before SD 3)
  // ==========================================
  if (
    b.includes('sd 3.5') ||
    b.includes('sd3.5') ||
    b.includes('stable diffusion 3.5')
  ) {
    if (b.includes('large') && b.includes('turbo')) return 'SD3.5-Large-Turbo';
    if (b.includes('large')) return 'SD3.5-Large';
    if (b.includes('medium')) return 'SD3.5-Medium';
    return 'SD3.5';
  }

  // ==========================================
  // SD 3 variants
  // ==========================================
  if (
    b.includes('sd 3') ||
    b.includes('sd3') ||
    b.includes('stable diffusion 3')
  ) {
    if (b.includes('medium')) return 'SD3-Medium';
    return 'SD3';
  }

  // ==========================================
  // SDXL Derivatives (check BEFORE base SDXL!)
  // These are standalone architectures based on SDXL
  // ==========================================
  
  // Illustrious XL - Anime-focused SDXL derivative
  if (b.includes('illustrious')) {
    if (b.includes('xl')) return 'Illustrious-XL';
    return 'Illustrious';
  }

  // NoobAI XL - Another SDXL derivative
  if (b.includes('noob') && (b.includes('xl') || b.includes('ai'))) {
    return 'NoobAI-XL';
  }

  // Pony Diffusion - SDXL-based but treated as standalone
  if (b.includes('pony')) {
    if (b.includes('v6') || b.includes('6')) return 'Pony-V6';
    return 'Pony';
  }

  // Kohaku XL - SDXL derivative
  if (b.includes('kohaku') && b.includes('xl')) {
    return 'Kohaku-XL';
  }

  // Animagine XL - Anime SDXL derivative
  if (b.includes('animagine')) {
    if (b.includes('3.1') || b.includes('3.0') || b.includes('xl 3')) return 'Animagine-XL3';
    return 'Animagine-XL';
  }

  // ==========================================
  // Base SDXL variants (after checking derivatives)
  // ==========================================
  if (b.includes('sdxl') || b.includes('sd-xl') || b.includes('sd xl')) {
    if (b.includes('turbo')) return 'SDXL-Turbo';
    if (b.includes('lightning')) return 'SDXL-Lightning';
    if (b.includes('hyper')) return 'SDXL-Hyper';
    if (b.includes('distilled')) return 'SDXL-Distilled';
    return 'SDXL';
  }

  // ==========================================
  // SD 2.x variants
  // ==========================================
  if (
    b.includes('sd 2.1') ||
    b.includes('sd2.1') ||
    b.includes('stable diffusion 2.1') ||
    b.includes('v2.1')
  )
    return 'SD2.1';
  if (
    b.includes('sd 2.0') ||
    b.includes('sd2.0') ||
    b.includes('stable diffusion 2.0') ||
    b.includes('v2.0')
  )
    return 'SD2.0';
  if (b.includes('sd 2') || b.includes('sd2') || b.includes('v2'))
    return 'SD2.1';

  // ==========================================
  // SD 1.x variants
  // ==========================================
  if (
    b.includes('sd 1.5') ||
    b.includes('sd1.5') ||
    b.includes('stable diffusion 1.5') ||
    b.includes('v1.5') ||
    b.includes('1.5')
  )
    return 'SD1.5';
  if (b.includes('sd 1.4') || b.includes('sd1.4') || b.includes('v1.4'))
    return 'SD1.4';
  if (b.includes('sd 1') || b.includes('sd1') || b.includes('v1'))
    return 'SD1.5';

  // ==========================================
  // Video models
  // ==========================================
  if (b.includes('svd') || b.includes('stable video')) return 'SVD';
  if (b.includes('animatediff')) return 'AnimateDiff';
  if (b.includes('mochi')) return 'Mochi';
  if (b.includes('cogvideo')) return 'CogVideoX';
  if (b.includes('ltx')) return 'LTX-Video';
  if (b.includes('wan')) return 'Wan';

  // ==========================================
  // Other architectures
  // ==========================================
  if (b.includes('cascade')) return 'Cascade';
  if (b.includes('pixart')) {
    if (b.includes('sigma')) return 'PixArt-Sigma';
    if (b.includes('alpha')) return 'PixArt-Alpha';
    return 'PixArt';
  }
  if (b.includes('playground')) {
    if (b.includes('2.5')) return 'Playground-v2.5';
    if (b.includes('2')) return 'Playground-v2';
    return 'Playground';
  }
  if (b.includes('kolors')) return 'Kolors';
  if (b.includes('auraflow')) return 'AuraFlow';
  if (b.includes('lumina')) return 'Lumina';
  if (b.includes('stable cascade')) return 'StableCascade';
  if (b.includes('sana')) return 'Sana';
  if (b.includes('omnigen')) return 'OmniGen';

  // Fallback to safe string
  return base.replace(/[^a-zA-Z0-9 -]/g, '').trim() || 'Other';
}

/**
 * Refine the base model by checking additional signals from tags.
 * This is critical because Civitai often reports "SDXL 1.0" for derivatives like
 * Illustrious, Pony, NoobAI, etc. We check tags to detect the real base.
 */
function refineBaseModelFromTags(
  currentBase: string,
  tags: string[] | undefined,
): string {
  if (!tags || tags.length === 0) return currentBase;
  
  const combined = tags.map((t) => t.toLowerCase()).join(' ');

  // Check for SDXL derivatives (these override generic "SDXL" base)
  const isGenericSDXL = currentBase.toUpperCase().includes('SDXL');
  
  if (isGenericSDXL || currentBase === 'Other') {
    // Illustrious XL
    if (combined.includes('illustrious')) {
      if (combined.includes('xl')) return 'Illustrious-XL';
      return 'Illustrious';
    }

    // NoobAI XL
    if (combined.includes('noob') && (combined.includes('xl') || combined.includes('ai'))) {
      return 'NoobAI-XL';
    }

    // Pony Diffusion
    if (combined.includes('pony')) {
      if (combined.includes('v6') || combined.includes(' 6')) return 'Pony-V6';
      return 'Pony';
    }

    // Kohaku XL
    if (combined.includes('kohaku') && combined.includes('xl')) {
      return 'Kohaku-XL';
    }

    // Animagine XL  
    if (combined.includes('animagine')) {
      if (combined.includes('3.1') || combined.includes('3.0') || combined.includes('xl 3')) return 'Animagine-XL3';
      return 'Animagine-XL';
    }
  }

  // Return the original base if no refinement matched
  return currentBase;
}

export function getSmartPath({ type, baseModel, tags }: SmartPathParams): {
  path: string;
  smartType: string;
} {
  let smartType = type;
  const lowerType = type.toLowerCase().replace(/\s/g, ''); // Remove spaces for mapping (Textual Inversion -> textualinversion)

  // 1. Precise Type Detection from Tags (Overrides generic types)
  if (tags && tags.length > 0) {
    const lowerTags = tags.map((t) => t.toLowerCase());

    if (lowerTags.includes('unet')) smartType = 'UNET';
    else if (
      lowerTags.includes('clip vision') ||
      lowerTags.includes('clipvision')
    )
      smartType = 'CLIP_VISION';
    else if (
      lowerTags.includes('clip') ||
      lowerTags.includes('text encoder') ||
      lowerTags.some((t) => t.includes('t5'))
    )
      smartType = 'CLIP';
    else if (lowerTags.includes('gligen')) smartType = 'GLIGEN';
    else if (lowerTags.includes('style model')) smartType = 'STYLE_MODEL';
    else if (lowerTags.includes('vae')) smartType = 'VAE';
    else if (lowerTags.includes('controlnet')) smartType = 'CONTROLNET';
    else if (lowerTags.includes('lora')) smartType = 'LORA';
    else if (lowerTags.includes('dora')) smartType = 'DORA';
    else if (lowerTags.includes('locon')) smartType = 'LOCON';
    else if (
      lowerTags.includes('ipadapter') ||
      lowerTags.includes('ip-adapter')
    )
      smartType = 'IPADAPTER';
    else if (
      lowerTags.includes('animatediff') ||
      lowerTags.includes('motion module')
    )
      smartType = 'ANIMATEDIFF';
    else if (lowerTags.includes('motion lora')) smartType = 'MOTION_LORA';
    else if (lowerTags.includes('insightface')) smartType = 'INSIGHTFACE';
    else if (
      lowerTags.includes('sam') ||
      lowerTags.includes('segment anything')
    )
      smartType = 'SAM';
    else if (lowerTags.includes('depth') || lowerTags.includes('depthanything'))
      smartType = 'DEPTH';
    else if (lowerTags.includes('pulid')) smartType = 'PULID';
    else if (lowerTags.includes('photomaker')) smartType = 'PHOTOMAKER';
    else if (
      lowerTags.includes('upscaler') ||
      lowerTags.includes('esrgan') ||
      lowerTags.includes('realesrgan')
    )
      smartType = 'UPSCALER';
  }

  // 2. Map to Resource Enum Key
  // If smartType is still generic or unmapped, use the map
  let mappedType =
    TYPE_MAP[smartType.toLowerCase().replace(/\s/g, '')] ||
    TYPE_MAP[lowerType] ||
    smartType.toUpperCase();

  // Correction for edge cases not in map
  if (mappedType === 'TEXTUAL INVERSION') mappedType = 'TEXTUALINVERSION';
  if (mappedType === 'STYLE MODEL') mappedType = 'STYLE_MODEL';

  // 3. Determine Root Path
  // We use the store's getResourcePath which expects the uppercase Enum key
  let targetPath = getResourcePath(mappedType);

  // If getResourcePath returned default or empty because detection failed, try Checkpoint default?
  // Or keep it as is (likely creates folder named "Undefined" or similar if logic fails? No, it defaults to Root/ResourceName)
  // Ensure we don't get "undefined" folder.

  // 4. Dynamic Sub-folder Construction (BaseModel / Category)
  if (baseModel) {
    // First normalize, then refine with tags to detect SDXL derivatives
    let normBaseModel = normalizeBaseModel(baseModel);
    normBaseModel = refineBaseModelFromTags(normBaseModel, tags);
    targetPath = path.join(targetPath, normBaseModel);

    // 5. Category from Tags (only if not redundancy)
    if (tags && tags.length > 0) {
      const categoryTag = tags.find(
        (t) =>
          !t.toLowerCase().includes(baseModel.toLowerCase()) &&
          !t.toLowerCase().includes(smartType.toLowerCase()) &&
          t.toLowerCase() !== 'anime' && // Too generic
          t.toLowerCase() !== 'photorealistic' && // Too generic
          t.toLowerCase() !== 'base model',
      );
      if (categoryTag) {
        const safeTag = categoryTag.replace(/[^a-zA-Z0-9 -]/g, '').trim();
        // Limit depth? Usually just one level is enough "SDXL/Characters"
        targetPath = path.join(targetPath, safeTag);
      }
    }
  }

  return { path: targetPath, smartType: mappedType };
}
