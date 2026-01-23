import fs from 'fs';
import path from 'path';
import { getWindow } from '../browser-window';
import { getModelByHash } from '../civitai-api';
import { getFiles, updateFile } from '../store/files';
import { getRootResourcePath } from '../store/paths';
import { getSmartPath } from '../utils/smart-path';

import { readMetadata } from '../utils/read-metadata';

interface InventoryEntry {
  name: string;
  type: string;
  baseModel: string;
  localPath: string;
  hash: string;
  status: 'moved' | 'skipped' | 'unknown';
}

function detectBaseModelFromString(base: string): string {
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
 * Refine the base model by checking additional signals from tags and model name.
 * This is critical because Civitai often reports "SDXL 1.0" for derivatives like
 * Illustrious, Pony, NoobAI, etc. We check tags and model name to detect the real base.
 */
function refineBaseModel(
  currentBase: string,
  tags: string[] | undefined,
  modelName: string | undefined,
): string {
  // Combine all signals for checking
  const allSignals: string[] = [];
  if (tags) allSignals.push(...tags.map((t) => t.toLowerCase()));
  if (modelName) allSignals.push(modelName.toLowerCase());
  
  const combined = allSignals.join(' ');

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

export async function eventOrganizeFiles() {
  console.log('=== ORGANIZE FILES STARTED ===');

  try {
    const files = getFiles();
    const fileList = Object.values(files);
    let movedCount = 0;
    let processedCount = 0;
    const inventory: InventoryEntry[] = [];
    const unknownFiles: InventoryEntry[] = [];

    console.log(`Total files in store: ${fileList.length}`);

    if (fileList.length === 0) {
      console.warn(
        'No files found in store! Make sure the folder watcher has scanned your model directories.',
      );
      getWindow().webContents.send('organize-files-complete', {
        movedCount: 0,
        unknownCount: 0,
        totalCount: 0,
        error:
          'No files found in store. Please ensure your model folder is set correctly in Settings.',
      });
      return;
    }

    for (const file of fileList) {
      processedCount++;
      console.log(
        `Processing ${processedCount}/${fileList.length}: ${file.name} (type: ${file.type})`,
      );

      if (!file.localPath) continue;

      // Reliability Check: Ensure we have metadata (tags, baseModel)
      if (!file.tags || file.tags.length === 0 || !file.baseModel) {
        // 1. Try API if Hash exists
        if (file.hash) {
          try {
            console.log(`Fetching metadata for ${file.name} (${file.hash})...`);
            const metadata = await getModelByHash(file.hash);

            file.tags = metadata.tags;
            file.baseModel = metadata.baseModel;
            file.modelName = metadata.modelName || file.modelName;
            file.type = metadata.type || file.type;

            // Refine base model detection for SDXL derivatives
            // Civitai often reports "SDXL 1.0" for Illustrious/Pony/NoobAI models
            if (file.baseModel) {
              const detected = detectBaseModelFromString(file.baseModel);
              file.baseModel = refineBaseModel(detected, file.tags, file.modelName);
            }

            updateFile(file);
          } catch (error) {
            console.warn(`Could not fetch metadata from API for ${file.hash}.`);
          }
        }

        // 2. Fallback: Deep Scan (Read Safetensors Header)
        // If we still lack baseModel/tags, read the file directly
        if (
          (!file.baseModel || !file.tags || file.tags.length === 0) &&
          file.name.endsWith('.safetensors')
        ) {
          try {
            const meta = (await readMetadata(file.localPath)) as Record<
              string,
              any
            >;
            if (meta) {
              console.log(`Read internal metadata for ${file.name}`);

              // Attempt to detect Base Model from "ss_base_model_version" or "modelspec.architecture"
              const internalBase =
                meta['ss_base_model_version'] || meta['modelspec.architecture'];
              if (internalBase && typeof internalBase === 'string') {
                file.baseModel = detectBaseModelFromString(internalBase);
                updateFile(file);
              }

              // Attempt to detect tags/type from "ss_network_module" (lora)
              if (
                meta['ss_network_module'] &&
                meta['ss_network_module'].includes('lora')
              ) {
                if (!file.tags) file.tags = [];
                if (!file.tags.includes('lora')) file.tags.push('lora');
                file.type = 'LORA'; // Force type if detected
                updateFile(file);
              }

              // Heuristic: If Base Model is known but Type is still Unknown, default to Checkpoint
              // This handles standard checkpoints that don't have specific type tags
              if (file.baseModel && (!file.type || file.type === 'Unknown')) {
                file.type = 'CHECKPOINT';
                updateFile(file);
              }
            }
          } catch (readErr) {
            console.warn(
              `Failed to read internal metadata for ${file.name}`,
              readErr,
            );
          }
        }
      }

      // Skip Unknown types - leave them where they are
      if (
        !file.type ||
        file.type === 'Unknown' ||
        file.type.toUpperCase() === 'UNKNOWN'
      ) {
        console.log(`Skipping ${file.name} - Unknown type, leaving in place`);
        unknownFiles.push({
          name: file.name,
          type: file.type || 'Unknown',
          baseModel: file.baseModel || 'Unknown',
          localPath: file.localPath,
          hash: file.hash || '',
          status: 'unknown',
        });
        getWindow().webContents.send('organize-progress', {
          current: movedCount,
          total: fileList.length,
          filename: file.name,
        });
        continue;
      }

      const { path: targetPath, smartType } = getSmartPath({
        type: file.type,
        baseModel: file.baseModel,
        tags: file.tags,
      });

      const currentDir = path.dirname(file.localPath);
      let changed = false;

      if (file.type !== smartType) {
        file.type = smartType;
        changed = true;
      }

      // Normalize paths for comparison (handle Windows backslashes)
      if (path.relative(currentDir, targetPath) !== '') {
        // Paths are different, move the file
        try {
          const fileName = path.basename(file.localPath);
          const newFullPath = path.join(targetPath, fileName);

          // Ensure target directory exists
          if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
          }

          // Move file
          fs.renameSync(file.localPath, newFullPath);

          file.localPath = newFullPath;
          changed = true;

          movedCount++;
          console.log(`Moved ${fileName} to ${targetPath}`);

          // Move companion files (images, json, txt, etc.)
          try {
            const fileBaseName = path.parse(fileName).name;
            const dirFiles = fs.readdirSync(currentDir);

            // Match files that start with the base name followed by a dot (to avoid partial matches like model_v1 matching model_v1_2)
            // e.g. model.safetensors -> base: model
            // Matches: model.png, model.preview.png, model.json, model.txt
            // Ignores: model_backup.safetensors
            const companionFiles = dirFiles.filter(
              (f) => f.startsWith(fileBaseName + '.') && f !== fileName,
            );

            let companionCount = 0;
            for (const companion of companionFiles) {
              const oldCompanionPath = path.join(currentDir, companion);
              const newCompanionPath = path.join(targetPath, companion);

              // Avoid overwriting if possible or just do it?
              // fs.renameSync overwrites.
              fs.renameSync(oldCompanionPath, newCompanionPath);
              companionCount++;
            }
            if (companionCount > 0) {
              console.log(
                `Moved ${companionCount} companion files for ${fileName}`,
              );
            }
          } catch (companionErr) {
            console.error(
              `Error identifying/moving companion files for ${fileName}:`,
              companionErr,
            );
          }
        } catch (err) {
          console.error(`Failed to move ${file.name}:`, err);
        }
      }

      if (changed) {
        updateFile(file);
      }

      // Send progress every file or every X files
      getWindow().webContents.send('organize-progress', {
        current: movedCount, // Or just simple processing count?
        total: fileList.length,
        filename: file.name,
      });
    }

    // Add moved files to inventory
    for (const file of fileList) {
      if (!file.localPath) continue;
      if (
        !file.type ||
        file.type === 'Unknown' ||
        file.type.toUpperCase() === 'UNKNOWN'
      )
        continue;

      inventory.push({
        name: file.name,
        type: file.type,
        baseModel: file.baseModel || 'Unknown',
        localPath: file.localPath,
        hash: file.hash || '',
        status: 'moved',
      });
    }

    // Generate inventory report
    const rootPath = getRootResourcePath();
    if (rootPath) {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, 19);
      const reportPath = path.join(
        rootPath,
        `inventory_report_${timestamp}.txt`,
      );

      let report = `=== CIVITAI LINK INVENTORY REPORT ===\n`;
      report += `Generated: ${new Date().toLocaleString()}\n`;
      report += `Total Files Scanned: ${fileList.length}\n`;
      report += `Files Moved: ${movedCount}\n`;
      report += `Unknown Files: ${unknownFiles.length}\n\n`;

      // Unknown files section
      if (unknownFiles.length > 0) {
        report += `${'='.repeat(60)}\n`;
        report += `UNKNOWN FILES (Not Moved - Needs Manual Review)\n`;
        report += `${'='.repeat(60)}\n\n`;

        for (const entry of unknownFiles) {
          report += `File: ${entry.name}\n`;
          report += `  Path: ${entry.localPath}\n`;
          report += `  Hash: ${entry.hash || 'N/A'}\n`;
          report += `  Type: ${entry.type}\n`;
          report += `  Base Model: ${entry.baseModel}\n`;
          report += `\n`;
        }
      }

      // Organized files by type
      report += `\n${'='.repeat(60)}\n`;
      report += `ORGANIZED FILES BY TYPE\n`;
      report += `${'='.repeat(60)}\n\n`;

      const byType: Record<string, InventoryEntry[]> = {};
      for (const entry of inventory) {
        if (!byType[entry.type]) byType[entry.type] = [];
        byType[entry.type].push(entry);
      }

      for (const [type, entries] of Object.entries(byType).sort()) {
        report += `--- ${type} (${entries.length} files) ---\n`;

        // Group by base model within type
        const byBaseModel: Record<string, InventoryEntry[]> = {};
        for (const entry of entries) {
          const bm = entry.baseModel || 'Unknown';
          if (!byBaseModel[bm]) byBaseModel[bm] = [];
          byBaseModel[bm].push(entry);
        }

        for (const [baseModel, bmEntries] of Object.entries(
          byBaseModel,
        ).sort()) {
          report += `  [${baseModel}]\n`;
          for (const entry of bmEntries) {
            report += `    - ${entry.name}\n`;
          }
        }
        report += `\n`;
      }

      try {
        fs.writeFileSync(reportPath, report, 'utf-8');
        console.log(`Inventory report saved to: ${reportPath}`);
      } catch (err) {
        console.error('Failed to write inventory report:', err);
      }
    }

    // Notify UI
    console.log(
      `=== ORGANIZE FILES COMPLETE: moved ${movedCount}, unknown ${unknownFiles.length}, total ${fileList.length} ===`,
    );
    getWindow().webContents.send('organize-files-complete', {
      movedCount,
      unknownCount: unknownFiles.length,
      totalCount: fileList.length,
    });
  } catch (error) {
    console.error('=== ORGANIZE FILES CRASHED ===', error);
    getWindow().webContents.send('organize-files-complete', {
      movedCount: 0,
      unknownCount: 0,
      totalCount: 0,
      error: `Organization failed: ${error}`,
    });
  }
}
