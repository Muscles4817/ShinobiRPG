/**
 * The main process's half of the bridge: answers the preload's calls with the slot files, but
 * only for the game's own pages, and only for slots it knows.
 */
import { ipcMain, type IpcMainInvokeEvent } from 'electron';

import type { SlotFiles } from './slotFiles.js';
import { CHANNELS, slotDataFrom, slotFrom } from './slots.js';

/** Whether a call came from one of the game's own pages, not anything else that got loaded. */
export type TrustedPage = (url: string) => boolean;

function checkSender(event: IpcMainInvokeEvent, trusted: TrustedPage): void {
  const url = event.senderFrame?.url ?? '';
  if (!trusted(url)) throw new Error('Refused: not the game.');
}

export function serveSlotFiles(files: SlotFiles, trusted: TrustedPage): void {
  ipcMain.handle(CHANNELS.read, (event, slot: unknown) => {
    checkSender(event, trusted);
    return files.read(slotFrom(slot));
  });
  ipcMain.handle(CHANNELS.write, (event, slot: unknown, data: unknown) => {
    checkSender(event, trusted);
    return files.write(slotFrom(slot), slotDataFrom(data));
  });
  ipcMain.handle(CHANNELS.remove, (event, slot: unknown) => {
    checkSender(event, trusted);
    return files.remove(slotFrom(slot));
  });
}
