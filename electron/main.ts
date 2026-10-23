/**
 * The desktop app's main process: one instance at a time, the game served from its own scheme
 * (or the Vite dev server when `SHINOBI_DEV_SERVER` names one), the save files in the app's data
 * folder, and every write finished before the app quits.
 */
import { join } from 'node:path';

import { app, BrowserWindow } from 'electron';

import { GAME_ENTRY, onSite } from './gameFiles.js';
import { registerGameScheme, serveGame } from './gameProtocol.js';
import { createGameWindow, setAppMenu } from './gameWindow.js';
import { serveSlotFiles } from './ipc.js';
import { slotFiles } from './slotFiles.js';

/** The release build of the game, beside this folder: never the personal build's `dist`. */
const GAME_FOLDER = join(app.getAppPath(), 'dist-release');
const PRELOAD = join(import.meta.dirname, 'preload.cjs');
const devServer = process.env.SHINOBI_DEV_SERVER;

const entry = devServer ?? GAME_ENTRY;
const isGamePage = (url: string) => onSite(url, entry);

function openWindow(): BrowserWindow {
  return createGameWindow({
    url: entry,
    preload: PRELOAD,
    isGamePage,
    devTools: devServer !== undefined,
  });
}

function start(): void {
  const files = slotFiles(app.getPath('userData'));
  serveSlotFiles(files, isGamePage);
  setAppMenu(process.platform);

  // A second copy would write over the first one's save: focus the first instead.
  app.on('second-instance', () => {
    const [window] = BrowserWindow.getAllWindows();
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) openWindow();
  });
  // Writes still under way finish before the app goes.
  app.on('before-quit', (event) => {
    if (!files.busy()) return;
    event.preventDefault();
    void files.settled().finally(() => {
      app.quit();
    });
  });

  void app.whenReady().then(() => {
    if (!devServer) serveGame(GAME_FOLDER);
    openWindow();
  });
}

if (app.requestSingleInstanceLock()) {
  registerGameScheme();
  start();
} else {
  app.quit();
}
