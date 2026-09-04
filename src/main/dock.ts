import { is } from '@electron-toolkit/utils';
import { BrowserWindow, app, nativeImage } from 'electron';
import dockIcon from '../../resources/dock-icon.png?asset';

// macOS only: the tray is the app's permanent presence, so the Dock icon and the ⌘-Tab
// entry track whether a window is actually on screen.

// A dev run is the stock Electron binary, so the Dock would otherwise show Electron's own
// icon; a packaged build takes build/icon.icns. dock-icon.png is the same squircle artwork
// that icns is built from. Re-applied on every show because dock.show() drops the override.
function applyDockIcon() {
  if (!is.dev) return;

  app.dock?.setIcon(nativeImage.createFromPath(dockIcon));
}

function hasVisibleWindow() {
  return BrowserWindow.getAllWindows().some((w) => !w.isDestroyed() && w.isVisible());
}

// Our own record of what we last asked for. `app.dock.isVisible()` is not usable as the
// guard: measured on macOS 26 it still reports true after a hide that demonstrably took
// effect, which made the next show a no-op and stranded the app with no Dock icon.
let shown: boolean | null = null;

// Derived from the windows rather than driven by show/hide events: a window created with
// `show: true` is already shown by the time a listener could be attached, so an
// event-driven version misses the first one and the app starts with no Dock icon.
export async function syncDock() {
  if (process.platform !== 'darwin' || !app.dock) return;

  const wanted = hasVisibleWindow();
  if (wanted === shown) return;
  shown = wanted;

  if (!wanted) {
    app.dock.hide();
    return;
  }

  await app.dock.show();
  applyDockIcon();
}
