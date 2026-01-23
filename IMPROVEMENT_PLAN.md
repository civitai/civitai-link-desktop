# Civitai Link Improvement Plan

This document outlines a comprehensive plan to organize, manage, and optimize the Civitai Link Desktop application, specifically focusing on model storage, file organization, security, and integration with Generative AI tools like ComfyUI.

> **📋 See `CHANGELOG.md` for detailed list of completed improvements.**
> **📖 See `DEVELOPER_README.md` for testing instructions.**

---

## 1. Smart Model Organization & Storage

### Current State ✅ IMPROVED

The application now supports **29 model types** with automatic organization by base model architecture.

### Completed Improvements ✅

#### A. Granular Component Sorting & Dynamic Organization ✅ DONE

*   **Expanded Type Detection** ✅:
    *   Added 15 new model types: CLIP_VISION, IPADAPTER, TEXT_ENCODER, DIFFUSION_MODEL, ANIMATEDIFF, MOTION_LORA, ADAPTER, INSIGHTFACE, FACERESTORE, SAM, ULTRALYTICS, DEPTH, PULID, PHOTOMAKER, LLM
    *   Added file extensions: `.pth`, `.onnx`
    *   Folder-based type detection for models not on Civitai
    *   Tag-based type detection from Civitai metadata

*   **Dynamic Hierarchy** ✅:
    *   Models organized by base model: SDXL, SD1.5, SD3, SD3.5, Flux1-Dev, Pony, etc.
    *   Folder structure: `{type}/{baseModel}/{model_file}`
    *   Example: `loras/SDXL/my_lora.safetensors`

*   **User Control**: 🔄 PENDING - Override types feature not yet implemented

### Proposed Improvements (Remaining)

#### B. Centralized Storage with Symlinks (The "One-File" Rule)
Many users have both **Automatic1111** and **ComfyUI** installed. Currently, they might duplicate models to have them visible in both.

*   **Solution**: Create a `Central Storage` directory.
*   **Mechanism**:
    1.  Download model to `Central Storage/Checkpoints/model.safetensors`.
    2.  Automatically create **Symbolic Links** (Symlinks) in *both* the configured A1111 folder and ComfyUI folder.
    3.  **Benefit**: Zero disk space waste. One download works everywhere.

#### C. Deduplication via Hash
Before downloading, check the hash of the file against *all* known local files in the database, regardless of their location.
*   **Logic**: If `hash` exists in `Central Storage`, simply create a Symlink to the new desired location instead of re-downloading bytes.

## 2. Security Implementations

### Current State
The app limits file extensions but performs no active content scanning or integrity verification during the download process itself.

### Proposed Improvements

#### A. Strict Hash Verification
Currently, `hash.ts` calculates a hash to *identify* a file.
*   **Improvement**: Enforce **Integrity Verification**. When a download finishes, compare the calculated hash against the `expected_hash` from the Civitai API.
*   **Action**: If hashes mismatch, quarantine the file and alert the user. This prevents man-in-the-middle attacks or corrupted downloads.

#### B. "Pickle" Warning System
*   **Risk**: `.ckpt` and `.pt` files use Python's `pickle` module, which can execute arbitrary code.
*   **Action**: Add a pre-download warning modal for any non-safetensors file.
    > "⚠️ Warning: This file format (.ckpt) is potentially unsafe. We recommend searching for a .safetensors version."

#### C. Local Malware Scanning
Integration with Windows Defender (or ClamAV) via command line.
*   **Implementation**: After download and before "Activating", run:
    ```powershell
    MpCmdRun.exe -Scan -ScanType 3 -File "C:\Path\To\Model.safetensors"
    ```
*   **Benefit**: Enterprise-grade security for the user’s library.

## 3. ComfyUI Integration & Optimization

### Current State
ComfyUI is supported as a target path, but the integration is passive (dropping files in folders).

### Proposed Improvements

#### A. "Civitai Link" Custom Node
Create a custom ComfyUI node suite (`comfyui-civitai-link`) that connects to the Desktop App via `socket.io` (localhost).

*   **Node: `CivitaiCheckpointLoader`**:
    *   Instead of reading the disk, it asks the Desktop App "What SDXL models do I have?"
    *   **Benefit**: Instant model availability without restarting ComfyUI or hitting "Refresh".
    *   **Metadata**: The node can output "Trigger Words" as a string output, which can be fed directly into a CLIP Text Encode node.

#### B. Metadata "Sidecars"
When downloading `model.safetensors`, automatically create `model.civitai.info` (JSON) next to it.
*   **Content**:
    ```json
    {
      "id": 12345,
      "triggerWords": ["best quality", "masterpiece"],
      "baseModel": "SDXL 1.0",
      "preferredWeight": 0.8,
      "userNotes": "Do not go above 0.8 strength or it burns.",
      "clipperJump": 2
    }
    ```
*   **Usage**: ComfyUI Model Manager and A1111 browsers can read this file to display covers, auto-fill prompts, and show user notes to avoid mistakes.

#### C. Model Ingress (Drag-and-Drop)
Enable drag-and-drop from the Civitai Link Desktop App UI directly onto the ComfyUI canvas within a browser.
*   **Action**: Dragging a Lora card from the App to the Canvas creates a "LoraLoader" node pre-populated with that file path.




## 4. Performance, Optimization & Storage Tools

### Model Pruning & Conversion
Many older models are released as massive 4GB-7GB FP32 or "EMA included" files.
*   **Feature**: **Auto-Pruning Service**.
    *   Offer to convert `.ckpt` to `.safetensors`.
    *   Offer to "Prune" weights (FP32 -> FP16) to save ~50% disk space with negligible quality loss.
    *   *Tools to Integrate*: `safetensors` library (Rust bindings exist), Python script execution.

### Storage Tiering (Active vs. Cold)
*   **Concept**: Users often have TBs of models but only use a few.
### Storage Tiering (Active vs. Cold)
*   **Concept**: Users often have TBs of models but only use a few.
*   **Feature**: "Usage Aging" & Inactivity Flags.
    *   **Mechanism**: Track "Last Used Date" for every model.
    *   **UI Indicators**:
        *   Flag models that haven't been touched in >30 days (Yellow warning).
        *   Escalate warnings at 45, 60, 90 days (Red warning).
    *   **User Action**: Instead of auto-moving, provide a "Clean Up" view sorted by inactivity.
    *   **Choice**: The user explicitly decides to Archive (move to HDD), Delete, or Keep (reset timer) based on these flags.

### Parallel Downloading & Chunking
*   **Current**: Splitting into 10 parts is good, but adaptive chunking based on network speed prevents "hanging" connections.
*   **Resume Capability**: Ensure `.part` files are robustly resumable if the app crashes.

## 5. Recommended External Repos & Resources

*   **ComfyUI-Manager**: Learn from their model database and installation scripts.
    *   *GitHub*: `ltdrdata/ComfyUI-Manager`
*   **Stability Matrix**: Excellent example of cross-UI package management and symlink usage.
    *   *GitHub*: `LykosAI/StabilityMatrix`
*   **Safetensors**: The gold standard for safe model storage.
    *   *GitHub*: `huggingface/safetensors`
*   **Kohya_ss**: Logic for model training folder structures (concepts, reg images) which could be useful for a "Training Data" organizer.
