# Civitai Link Desktop - Changelog

## Version 2.0.0 - Smart Model Organization Update (January 2026)

This release introduces comprehensive model organization, expanded model type support, and significant bug fixes to improve the reliability of model scanning and organization.

---

## ✅ Completed Improvements

### 1. Expanded Model Type Support

**15 new model types added** to support the full range of AI models:

| New Type | Folder | Description |
|----------|--------|-------------|
| `CLIP_VISION` | `clip_vision/` | CLIP vision encoders for IP-Adapter |
| `IPADAPTER` | `ipadapter/` | IP-Adapter models |
| `TEXT_ENCODER` | `text_encoders/` | T5, CLIP text encoders |
| `DIFFUSION_MODEL` | `diffusion_models/` | Standalone diffusion models |
| `ANIMATEDIFF` | `animatediff_models/` | AnimateDiff motion modules |
| `MOTION_LORA` | `animatediff_motion_lora/` | AnimateDiff motion LoRAs |
| `ADAPTER` | `adapter/` | Generic adapters |
| `INSIGHTFACE` | `insightface/` | Face detection/recognition |
| `FACERESTORE` | `facerestore_models/` | GFPGAN, CodeFormer |
| `SAM` | `sams/` | Segment Anything models |
| `ULTRALYTICS` | `ultralytics/` | YOLO detection models |
| `DEPTH` | `depth/` | Depth estimation models |
| `PULID` | `pulid/` | PuLID identity models |
| `PHOTOMAKER` | `photomaker/` | PhotoMaker models |
| `LLM` | `llm/` | Large language models |

**Files Modified:**
- `src/main/store/paths.ts` - Resources enum, SYMLINK, COMFY_UI_PATHS
- `src/index.d.ts` - ResourceType enum
- `src/main/utils/smart-path.ts` - TYPE_MAP

### 2. Expanded File Extension Support

Added support for additional model file formats:

| Extension | Use Case |
|-----------|----------|
| `.pth` | PyTorch models (upscalers, face models) |
| `.onnx` | ONNX models (ControlNets, detection) |

**Files Modified:**
- `src/main/folder-watcher.ts` - FILE_TYPES array
- `src/main/list-directory.ts` - FILE_TYPES array

### 3. Smart Base Model Organization

Models are now automatically organized into subfolders by their base model architecture:

```
D:\models\
├── checkpoints/
│   ├── SDXL/
│   ├── SD1.5/
│   ├── Flux1-Dev/
│   ├── SD3.5/
│   └── Pony/
├── loras/
│   ├── SDXL/
│   ├── SD1.5/
│   ├── Flux1/
│   └── Pony/
└── controlnet/
    ├── SDXL/
    └── SD1.5/
```

**Base Models Detected:**
- SD 1.4, SD 1.5
- SD 2.0, SD 2.1
- SDXL, SDXL-Turbo, SDXL-Lightning
- SD3, SD3-Medium
- SD3.5, SD3.5-Medium, SD3.5-Large, SD3.5-Large-Turbo
- Flux, Flux1, Flux1-Dev, Flux1-Schnell, Flux1-Pro
- Pony
- SVD, AnimateDiff
- Cascade, PixArt, Playground, Kolors, HunyuanDiT, AuraFlow, Lumina

**Files Modified:**
- `src/main/utils/smart-path.ts` - `normalizeBaseModel()` function
- `src/main/events/organize-files.ts` - `detectBaseModelFromString()` function

### 4. Folder-Based Type Detection

For models not found on Civitai, the app now infers the model type from the folder structure:

```typescript
// Example: D:\models\loras\my_lora.safetensors → Type: LORA
// Example: D:\models\controlnet\canny.safetensors → Type: CONTROLNET
```

**Files Modified:**
- `src/main/folder-watcher.ts` - Added `FOLDER_TYPE_MAP` and `detectTypeFromPath()`

### 5. Inventory Report Generation

After organizing, the app generates a detailed inventory report saved to your root model folder:

**Report includes:**
- Total files scanned
- Files moved count
- Unknown files list (with paths and hashes for manual review)
- Organized files grouped by type and base model

**Example:** `D:\models\inventory_report_2026-01-22T00-30-15.txt`

**Files Modified:**
- `src/main/events/organize-files.ts` - Added `InventoryEntry` interface and report generation

### 6. Unknown File Handling

Files with unknown types are now **left in place** instead of being moved to a generic folder. They are logged in the inventory report for manual review.

**Files Modified:**
- `src/main/events/organize-files.ts` - Skip logic for Unknown types

---

## 🐛 Bug Fixes

### 1. Preview Image Path Bug (Critical)
**Problem:** Preview images were being saved to the app's installation directory instead of next to the model file.

**Fix:** Removed erroneous `path.resolve(__dirname, ...)` call.

**File:** `src/main/utils/create-preview-image.ts`

### 2. File Extension Check Bug
**Problem:** File extension matching used `.includes()` which could cause false matches.

**Fix:** Changed to `.endsWith()` for proper extension matching.

**File:** `src/main/folder-watcher.ts`

### 3. getAllPaths() Not Returning All Folders
**Problem:** The function wasn't properly iterating over all resource types.

**Fix:** Changed to iterate over `Object.values(Resources)` enum.

**File:** `src/main/store/paths.ts`

### 4. SYMLINK Folder Mappings Mismatch
**Problem:** Default folder names didn't match common ComfyUI folder structures.

**Fix:** Updated mappings to use lowercase folder names matching ComfyUI conventions.

**File:** `src/main/store/paths.ts`

### 5. Hardcoded Path Removed
**Problem:** `D:\models` was hardcoded as a fallback path.

**Fix:** Removed hardcoded path - all paths are now controlled via UI.

**File:** `src/main/store/paths.ts`

---

## 🔧 Developer Improvements

### Comprehensive Logging Added

Debug logging has been added throughout the codebase to help diagnose issues:

- `listDirectories()` - Logs directories being scanned
- `getAllPaths()` - Logs paths being watched
- `onAdd()` - Logs each file being processed
- `hashFile()` - Logs hashing progress and Civitai lookup results
- `eventOrganizeFiles()` - Logs organize progress with try-catch wrapper

### Error Handling

- Added try-catch wrapper around entire organize function
- Errors are now logged and reported to UI instead of silently failing
- Crash information is sent to the UI for user visibility

---

## 📋 Testing Checklist

See `DEVELOPER_README.md` for detailed testing instructions.
