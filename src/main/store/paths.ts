import Store, { Schema } from 'electron-store';

const schema: Schema<Record<string, unknown>> = {};

export const store = new Store({ schema });

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
