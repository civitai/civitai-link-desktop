# Civitai Link Desktop - Developer Guide

---

## ⚠️ A Note to Reviewers

> **This project is a labor of love.** 
> 
> I'm an indie developer who mostly "vibecoded" this enhancement to the Civitai Link Desktop app. The features work well in my testing environment, but **I'm looking for help verifying edge cases** before this goes to production.
> 
> If you have time to test, I'd really appreciate it! Things to look out for:
> - Models that don't categorize correctly (especially newer architectures)
> - Files that get moved to unexpected locations
> - Any edge cases with unusual folder structures or model names
> - Performance issues with very large libraries (1000+ models)
> 
> Every bit of feedback helps! 🙏
>
> — *theCosmicCrafter*

---

## Overview

This document provides instructions for developers to understand, test, and verify the new Smart Model Organization features added to Civitai Link Desktop.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Run TypeScript type checking
npm run typecheck

# Build for production
npm run build
```

---

## New Features Summary

### 1. Expanded Model Type Support

The app now supports **29 model types** (up from 14), including:

- CLIP_VISION, IPADAPTER, TEXT_ENCODER, DIFFUSION_MODEL
- ANIMATEDIFF, MOTION_LORA, ADAPTER
- INSIGHTFACE, FACERESTORE, SAM, ULTRALYTICS
- DEPTH, PULID, PHOTOMAKER, LLM

### 2. Smart Base Model Organization

Models are automatically organized into subfolders by their base architecture:

```
loras/
├── SDXL/
├── SD1.5/
├── Flux1-Dev/
├── SD3.5/
└── Pony/
```

### 3. Folder-Based Type Detection

Models not found on Civitai have their type inferred from folder structure.

### 4. Inventory Reports

After organizing, a detailed report is saved to the root model folder.

### 5. Unknown File Handling

Unknown files are left in place and logged for manual review.

---

## Testing Instructions

### Test 1: Verify Model Scanning

**Purpose:** Ensure all model folders are being scanned correctly.

**Steps:**

1. Run the app: `npm run dev`
2. Open DevTools: Press `Ctrl+Shift+I` in the app window
3. Go to **Settings** and set your **Root Model Folder** (e.g., `D:\models`)
4. Check the console for:

```
=== LIST DIRECTORIES ===
Root path: D:\models
Directories to scan: [array of paths]
Scanning directory: D:\models\loras
  Found X files in D:\models\loras
```

**Expected:** All your model subfolders should appear in "Directories to scan".

**If folders are missing:** Check `src/main/store/paths.ts` - the `SYMLINK` object defines folder names.

---

### Test 2: Verify File Detection

**Purpose:** Ensure model files are being detected and added to the store.

**Steps:**

1. With the app running, check console for:

```
onAdd: Processing D:\models\loras\my_lora.safetensors
onAdd: New file, hashing: D:\models\loras\my_lora.safetensors
hashFile: Hashing D:\models\loras\my_lora.safetensors...
hashFile: Got hash abc123 for D:\models\loras\my_lora.safetensors
hashFile: Found on Civitai - type: LORA, baseModel: SDXL
```

2. Go to the **Files** tab in the app
3. Verify your models appear in the list

**Expected:** All model files should appear in the Files view.

**If files are missing:** Check:
- File extension is supported (`.safetensors`, `.ckpt`, `.pt`, `.pth`, `.bin`, `.onnx`)
- Console for any error messages

---

### Test 3: Verify Organization

**Purpose:** Ensure the Organize Library feature works correctly.

**Steps:**

1. Go to **Settings** in the app
2. Click **"Organize Library"** button
3. Watch the progress bar and console output:

```
=== ORGANIZE FILES STARTED ===
Total files in store: 150
Processing 1/150: my_model.safetensors (type: LORA)
Processing 2/150: another_model.safetensors (type: CHECKPOINT)
...
=== ORGANIZE FILES COMPLETE: moved 45, unknown 5, total 150 ===
```

4. Check your model folder for the inventory report:
   - File: `inventory_report_YYYY-MM-DDTHH-MM-SS.txt`

**Expected:**
- Models are moved to appropriate subfolders by type and base model
- Unknown files are NOT moved
- Inventory report is generated

---

### Test 4: Verify Base Model Detection

**Purpose:** Ensure models are sorted into correct base model subfolders.

**Steps:**

1. After organizing, check folder structure:

```
D:\models\loras\
├── SDXL/
│   └── (SDXL LoRAs here)
├── SD1.5/
│   └── (SD 1.5 LoRAs here)
├── Flux1-Dev/
│   └── (Flux Dev LoRAs here)
└── Pony/
    └── (Pony LoRAs here)
```

2. Verify models are in correct folders based on their base model

**Expected:** Each model should be in a subfolder matching its base architecture.

---

### Test 5: Verify Unknown File Handling

**Purpose:** Ensure unknown files are left in place.

**Steps:**

1. Place a model file that won't be recognized (e.g., custom local model not on Civitai, in a folder not in FOLDER_TYPE_MAP)
2. Run Organize Library
3. Check console for:

```
Skipping unknown_model.safetensors - Unknown type, leaving in place
```

4. Check inventory report for "UNKNOWN FILES" section

**Expected:** Unknown files remain in their original location and are listed in the report.

---

### Test 6: Verify Preview Images

**Purpose:** Ensure preview images are saved next to model files.

**Steps:**

1. Download a model from Civitai (or let the app scan one)
2. Check the model's folder for a `.preview.png` or `.preview.jpg` file
3. The preview should be named: `modelname.preview.png`

**Expected:** Preview image is in the same folder as the model, not in the app directory.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/main/store/paths.ts` | Resource types, folder mappings, path functions |
| `src/main/folder-watcher.ts` | File system watching, type detection from path |
| `src/main/list-directory.ts` | Directory scanning |
| `src/main/events/organize-files.ts` | Organization logic, inventory reports |
| `src/main/utils/smart-path.ts` | Smart path generation, base model detection |
| `src/main/utils/create-preview-image.ts` | Preview image downloading |
| `src/index.d.ts` | TypeScript type definitions |

---

## Debugging Tips

### Enable Verbose Logging

The codebase now includes comprehensive `console.log` statements. To see them:

1. Run `npm run dev`
2. Open DevTools in the Electron window (`Ctrl+Shift+I`)
3. Go to the **Console** tab

### Common Issues

**Issue:** "No files found in store"

**Cause:** The folder watcher hasn't scanned your directories yet.

**Fix:** 
- Ensure Root Model Folder is set in Settings
- Wait for initial scan to complete (watch the loading indicator)
- Check console for scanning errors

---

**Issue:** Files not being detected

**Cause:** File extension not in supported list.

**Fix:** Check `FILE_TYPES` array in `folder-watcher.ts` and `list-directory.ts`.

---

**Issue:** Models going to wrong folder

**Cause:** Folder mapping mismatch.

**Fix:** Check `SYMLINK` and `COMFY_UI_PATHS` in `src/main/store/paths.ts`.

---

**Issue:** Base model not detected correctly

**Cause:** Base model string not recognized.

**Fix:** Add pattern to `normalizeBaseModel()` in `smart-path.ts`.

---

## Architecture Overview

```
User sets Root Model Folder
         ↓
    getAllPaths()
    (generates list of folders to watch)
         ↓
    listDirectories()
    (scans all folders for model files)
         ↓
    processFilesInBackground()
    (hashes files, queries Civitai API)
         ↓
    addFile()
    (stores file info, creates preview/JSON)
         ↓
    [User clicks Organize Library]
         ↓
    eventOrganizeFiles()
    (moves files to smart paths, generates report)
```

---

## Contributing

When adding new model types:

1. Add to `Resources` enum in `src/main/store/paths.ts`
2. Add to schema default in `src/main/store/paths.ts`
3. Add to `SYMLINK` mapping in `src/main/store/paths.ts`
4. Add to `COMFY_UI_PATHS` mapping in `src/main/store/paths.ts`
5. Add to `TYPE_MAP` in `src/main/utils/smart-path.ts`
6. Add to `FOLDER_TYPE_MAP` in `src/main/folder-watcher.ts`
7. Add to `ResourceType` enum in `src/index.d.ts`
8. Run `npm run typecheck` to verify

---

## Questions?

Check the console logs first - they contain detailed information about what the app is doing at each step.
