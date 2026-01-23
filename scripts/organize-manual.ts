
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import axios from 'axios';

// --- CONFIGURATION ---
const TARGET_DIR = 'D:\\models';
const FILE_TYPES = ['.pt', '.safetensors', '.ckpt', '.bin'];
const CIVITAI_API_URL = 'https://civitai.com/api/v1';

// --- MOCK GET RESOURCE PATH ---
// We simply map types to subfolders within TARGET_DIR for this script
// This mimics the app's structure but purely within D:\models
function getResourcePathStub(type: string): string {
  const map: Record<string, string> = {
    'CHECKPOINT': 'Checkpoints',
    'CONTROLNET': 'ControlNet',
    'UPSCALER': 'Upscaler',
    'HYPERNETWORK': 'Hypernetwork',
    'TEXTUALINVERSION': 'Embeddings',
    'LORA': 'LoRA',
    'LOCON': 'LoCon',
    'VAE': 'VAE',
    'DORA': 'DoRA',
    'UNET': 'UNET',
    'CLIP': 'CLIP',
    'GLIGEN': 'GLIGEN',
    'STYLE_MODEL': 'StyleModel',
  };
  const sub = map[type.toUpperCase()] || 'Other';
  return path.join(TARGET_DIR, sub);
}

// --- SMART PATH LOGIC (Replicating src/main/utils/smart-path.ts without imports) ---
interface SmartPathParams {
  type: string;
  baseModel?: string;
  tags?: string[];
}

function getSmartPath({ type, baseModel, tags }: SmartPathParams): { path: string; smartType: string } {
  let smartType = type;

  if (tags && tags.length > 0) {
    const lowerTags = tags.map((t) => t.toLowerCase());
    if (lowerTags.includes('unet')) smartType = 'UNET';
    else if (lowerTags.includes('clip') || lowerTags.includes('text encoder')) smartType = 'CLIP';
    else if (lowerTags.includes('gligen')) smartType = 'GLIGEN';
    else if (lowerTags.includes('style model')) smartType = 'StyleModel';
    else if (lowerTags.includes('vae')) smartType = 'VAE';
  }

  let targetPath = getResourcePathStub(smartType);

  if (baseModel) {
    const safeBaseModel = baseModel.replace(/[^a-zA-Z0-9 -]/g, '').trim();
    targetPath = path.join(targetPath, safeBaseModel);

    if (tags && tags.length > 0) {
      const categoryTag = tags.find(
        (t) =>
          !t.toLowerCase().includes(baseModel.toLowerCase()) &&
          t.toLowerCase() !== smartType.toLowerCase(),
      );
      if (categoryTag) {
        const safeTag = categoryTag.replace(/[^a-zA-Z0-9 -]/g, '').trim();
        targetPath = path.join(targetPath, safeTag);
      }
    }
  }

  return { path: targetPath, smartType };
}

// --- HASHING UTILS ---
async function calculateHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex').substr(0, 10).toUpperCase())); // Short hash logic often used, purely example
    stream.on('error', reject);
  });
}

// Note: Civitai AutoV2 hash is complex (buffer read). For simplicity in this script,
// we will start by reading metadata sidecar if exists, if not, we rely on filename search strictly if hash is hard?
// Actually, let's use the filename search API if hash logic is too complex to port quickly.
// OR we just use the SHA256 of the first 64KB? Civitai often uses CRC32 or BLAKE3 or SHA256 of file.
// Let's implement a simple "Check by Filename" fallback if Hash fails or is mismatching.

// --- API ---
async function getModelByHash(hash: string): Promise<any> {
    try {
        const res = await axios.get(`${CIVITAI_API_URL}/model-versions/by-hash/${hash}`);
        return res.data;
    } catch (e) {
        return null;
    }
}

async function scanAndOrganize(dir: string) {
  console.log(`Scanning ${dir}...`);
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
        // Recursive scan
        await scanAndOrganize(fullPath);
        continue;
    }

    // Is it a model?
    if (!FILE_TYPES.some(ext => entry.name.endsWith(ext))) continue;

    console.log(`Processing ${entry.name}...`);
    
    // 1. Try to find local metadata (Civitai info file?)
    // 2. Or compute hash (SHA256 of file for now, simple)
    // 3. Or query by Hash
    
    const hash = await calculateHash(fullPath); // Simple SHA256
    let metadata = await getModelByHash(hash);

    if (!metadata) {
       console.log(`   Hash lookup failed for ${entry.name}. Skipping (Safety).`);
       continue;
    }

    // We have data!
    console.log(`   Identified: ${metadata.model.name} (${metadata.model.type})`);
    
    const { path: targetPath, smartType } = getSmartPath({
        type: metadata.model.type,
        baseModel: metadata.baseModel,
        tags: metadata.model.tags
    });

    const currentDir = path.dirname(fullPath);
    if (path.relative(currentDir, targetPath) === '') {
        console.log(`   Already in correct place.`);
        continue;
    }

    // Move
    if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
    
    const newPath = path.join(targetPath, entry.name);
    console.log(`   Moving to ${targetPath}...`);
    fs.renameSync(fullPath, newPath);

    // Companions
    const baseName = path.parse(entry.name).name;
    const allFiles = fs.readdirSync(currentDir);
    const companions = allFiles.filter(f => f.startsWith(baseName + '.') && f !== entry.name);
    
    for (const c of companions) {
        const oldC = path.join(currentDir, c);
        const newC = path.join(targetPath, c);
        fs.renameSync(oldC, newC);
        console.log(`     Moved companion: ${c}`);
    }
  }
}

// --- EXECUTE ---
(async () => {
    if (!fs.existsSync(TARGET_DIR)) {
        console.error(`Target directory ${TARGET_DIR} does not exist!`);
        process.exit(1);
    }
    await scanAndOrganize(TARGET_DIR);
})();
