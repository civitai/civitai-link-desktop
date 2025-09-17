# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Civitai Link Desktop is an Electron application that allows users to manage and interact with their Stable Diffusion instance directly from Civitai. It facilitates downloading models, managing files, and connecting to Civitai's services through a desktop interface.

## Development Commands

### Essential Development Commands
- `npm run dev` - Start development server with hot reload and debugging
- `npm run build` - Build the application (runs typecheck first)
- `npm run typecheck` - Run TypeScript checks for both main and renderer processes
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Platform-Specific Builds
- `npm run build:win` - Build and publish for Windows
- `npm run build:mac` - Build and publish for macOS
- `npm run build:linux` - Build and publish for Linux

### TypeScript Checking
- `npm run typecheck:node` - Check main process TypeScript
- `npm run typecheck:web` - Check renderer process TypeScript

## Architecture

### Electron Structure
The application follows standard Electron architecture with three main processes:

- **Main Process** (`src/main/`): Node.js backend handling system operations, file management, API communication, and window management
- **Renderer Process** (`src/renderer/`): React frontend with React Router for navigation
- **Preload Process** (`src/preload/`): Security bridge between main and renderer processes

### Key Main Process Components
- `src/main/index.ts` - Main entry point with app lifecycle, tray management, and auto-updater
- `src/main/socket.ts` - Socket.IO client for real-time communication with Civitai services
- `src/main/folder-watcher.ts` - File system monitoring for model directories
- `src/main/download-file.ts` - File download management with progress tracking
- `src/main/store/` - Electron-store based persistence layer
- `src/main/events/` - IPC event handlers for renderer communication
- `src/main/commands/` - Application commands and operations

### Frontend Architecture
- **React Router** for navigation between main sections: Activities, Files, Vault, Settings
- **Context Providers** (`src/renderer/src/providers/`) for state management:
  - `electron/` - IPC communication and app state
  - `files/` - File management state
  - `vault/` - Civitai vault integration
  - `model-loading/` - Model download progress
- **Radix UI + Tailwind CSS** for component library and styling
- **React components** organized in `src/renderer/src/components/`

### Key Configuration Files
- `electron.vite.config.ts` - Vite configuration for Electron with main/preload/renderer targets
- `electron-builder.yml` - Build configuration for packaging and distribution
- `tailwind.config.js` - Tailwind CSS configuration with custom theme

### State Management
- Main process uses `electron-store` for persistent storage
- Renderer process uses React Context for state management
- IPC communication bridges state between processes
- Real-time updates via Socket.IO connection to Civitai services

### Security Model
- Preload script with `contextIsolation` enabled
- No direct Node.js access in renderer process
- All system operations routed through IPC to main process

## Technology Stack
- **Electron 30** with electron-vite for build tooling
- **React 18** with TypeScript for frontend
- **Radix UI** component primitives with Tailwind CSS styling
- **Socket.IO** for real-time communication
- **electron-store** for persistent data storage
- **chokidar** for file system watching
- **axios** for HTTP requests to Civitai API