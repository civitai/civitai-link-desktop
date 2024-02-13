import Store from 'electron-store';

const schema = {
  activities: {},
};

// @ts-ignore
export const store = new Store({ schema });
