/**
 * The page's only door to the desktop: `window.shinobiNative`, three calls on the game's slots
 * (`src/platform/electronBackend.ts` reads it). A sandboxed preload can't import its own files,
 * so the channel names are repeated from `slots.ts`.
 */
import { contextBridge, ipcRenderer } from 'electron';

const CHANNELS = {
  read: 'shinobi:read',
  write: 'shinobi:write',
  remove: 'shinobi:remove',
} as const;

contextBridge.exposeInMainWorld('shinobiNative', {
  kind: 'electron',
  read: (slot: string): Promise<unknown> => ipcRenderer.invoke(CHANNELS.read, slot),
  write: (slot: string, data: string): Promise<unknown> =>
    ipcRenderer.invoke(CHANNELS.write, slot, data),
  remove: (slot: string): Promise<unknown> => ipcRenderer.invoke(CHANNELS.remove, slot),
});
