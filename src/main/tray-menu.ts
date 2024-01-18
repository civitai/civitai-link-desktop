import { app, Tray, Menu, nativeImage } from 'electron';
import logo from '../../resources/favicon@2x.png?asset';

let tray;

export function TrayMenu() {
  const icon = nativeImage.createFromPath(logo);
  tray = new Tray(icon);

  tray.setToolTip('Civitai Link');
}
