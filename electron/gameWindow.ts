/**
 * The game's window: sized for the desktop layout, dark from the first frame, locked down
 * (isolated, sandboxed, no Node), kept on the game's own pages. Links out (the Share option)
 * open in the system browser; nothing else may navigate, open windows or ask for permissions.
 */
import { BrowserWindow, Menu, shell, type WebContents } from 'electron';

/** The night theme's background (`--bg`), so the window never flashes white. */
const BACKGROUND = '#14121a';
const TITLE = 'Shinobi RPG';
const SIZE = { width: 1440, height: 900 };
/** Wide enough that the game lays itself out for a desk, not a phone. */
const MIN_SIZE = { width: 1100, height: 700 };
const EXTERNAL_PROTOCOLS: ReadonlySet<string> = new Set(['https:', 'http:', 'mailto:']);

export interface WindowOptions {
  /** The page to load: the game's entry, or the dev server. */
  readonly url: string;
  readonly preload: string;
  /** Whether a URL is one of the game's own pages. */
  readonly isGamePage: (url: string) => boolean;
  /** Development only: F12 opens the developer tools. */
  readonly devTools: boolean;
}

function openOutside(url: string): void {
  try {
    if (EXTERNAL_PROTOCOLS.has(new URL(url).protocol)) void shell.openExternal(url);
  } catch {
    // Not a URL at all: nothing to open.
  }
}

function keepOnGame(contents: WebContents, isGamePage: (url: string) => boolean): void {
  contents.setWindowOpenHandler(({ url }) => {
    openOutside(url);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => {
    if (isGamePage(url)) return;
    event.preventDefault();
    openOutside(url);
  });
  contents.on('will-redirect', (event, url) => {
    if (!isGamePage(url)) event.preventDefault();
  });
  contents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });
  contents.session.setPermissionRequestHandler((_contents, _permission, answer) => {
    answer(false);
  });
}

function addKeys(window: BrowserWindow, devTools: boolean): void {
  window.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11') {
      event.preventDefault();
      window.setFullScreen(!window.isFullScreen());
    } else if (devTools && input.key === 'F12') {
      event.preventDefault();
      window.webContents.toggleDevTools();
    }
  });
}

/** The standard app menu on a Mac (quit, copy and paste, the window); no menu bar elsewhere. */
export function setAppMenu(platform: NodeJS.Platform): void {
  if (platform !== 'darwin') Menu.setApplicationMenu(null);
}

export function createGameWindow(options: WindowOptions): BrowserWindow {
  const window = new BrowserWindow({
    ...SIZE,
    minWidth: MIN_SIZE.width,
    minHeight: MIN_SIZE.height,
    title: TITLE,
    backgroundColor: BACKGROUND,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: options.preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
      devTools: options.devTools,
    },
  });
  // The window keeps the game's name whatever the page calls itself.
  window.on('page-title-updated', (event) => {
    event.preventDefault();
  });
  window.once('ready-to-show', () => {
    window.show();
  });
  keepOnGame(window.webContents, options.isGamePage);
  addKeys(window, options.devTools);
  void window.loadURL(options.url);
  return window;
}
