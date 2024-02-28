import { app } from 'electron';

export function eventCloseApp() {
  console.log('Closing app');
  app.quit();
}
