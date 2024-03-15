import Store, { Schema } from 'electron-store';

const schema: Schema<Record<string, unknown>> = {
  vault: {
    type: 'object',
    default: {},
  },
};

export const store = new Store({ schema });
