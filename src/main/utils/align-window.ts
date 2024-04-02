import { screen } from 'electron';

let mainWindow;
let tray;

let height = 600;
let width = 400;
let margin_x = 0;
let margin_y = 0;

export function alignWindow() {
  const position = calculateWindowPosition();
  mainWindow.setPosition(position.x, position.y, false);
}

function calculateWindowPosition() {
  const screenBounds = screen.getPrimaryDisplay().size;
  const trayBounds = tray.getBounds();

  //where is the icon on the screen?
  let trayPos = 4; // 1:top-left 2:top-right 3:bottom-left 4.bottom-right
  trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
  trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

  let DEFAULT_MARGIN = { x: margin_x, y: trayBounds.height / 2 + margin_y };
  let x;
  let y;

  //calculate the new window position
  switch (trayPos) {
    case 1: // for TOP - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 2: // for TOP - RIGHT
      x = Math.floor(
        trayBounds.x - width / 2 - DEFAULT_MARGIN.x + trayBounds.width / 2,
      );
      y = Math.floor(trayBounds.y + DEFAULT_MARGIN.y + trayBounds.height / 2);
      break;

    case 3: // for BOTTOM - LEFT
      x = Math.floor(trayBounds.x + DEFAULT_MARGIN.x + trayBounds.width / 2);
      y = Math.floor(
        trayBounds.y - height - DEFAULT_MARGIN.y + trayBounds.height / 2,
      );
      break;

    case 4: // for BOTTOM - RIGHT
      x = Math.floor(
        trayBounds.x - width / 2 - DEFAULT_MARGIN.x - 50 + trayBounds.width / 2,
      );
      y = Math.floor(
        trayBounds.y - height - DEFAULT_MARGIN.y - 30 + trayBounds.height / 2,
      );
      break;
  }

  return { x: x, y: y };
}
