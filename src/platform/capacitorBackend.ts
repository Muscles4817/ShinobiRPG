import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';

import type { NativeBackend, SlotName, StorageBackend } from './storageBackend';

/**
 * The phone app's files (Capacitor, iOS and Android): each slot is a UTF-8 file in the app's
 * own data directory, `saves/<slot>.json`, private to the app and kept by the OS's backups.
 *
 * The Filesystem plugin has no atomic replace, and whether a rename overwrites differs by
 * platform, so a write never relies on it: the new data goes to `<slot>.json.tmp` first, the
 * old file steps aside (the save to `save.json.bak`, the one previous copy kept; the others
 * are deleted), then the temp file takes its name. A crash once a slot has been written
 * leaves a whole file to read: the current one, else the temp file (the crash came between
 * the two renames, after it was written in full). The previous copy is never read by the
 * game: it is there for a person to restore by hand (`docs/mobile.md`).
 */

export const CAPACITOR_SHELL = 'phone';

const FOLDER = 'saves';
const DIRECTORY = Directory.Data;
const ENCODING = Encoding.UTF8;

/** Only the save keeps a previous copy; settings and edits are cheap to lose. */
const KEEPS_PREVIOUS: Readonly<Record<SlotName, boolean>> = {
  save: true,
  prefs: false,
  edits: false,
};

interface SlotFiles {
  readonly current: string;
  readonly temp: string;
  readonly previous: string;
}

function filesOf(slot: SlotName): SlotFiles {
  const current = `${FOLDER}/${slot}.json`;
  return { current, temp: `${current}.tmp`, previous: `${current}.bak` };
}

async function exists(path: string): Promise<boolean> {
  try {
    await Filesystem.stat({ path, directory: DIRECTORY });
    return true;
  } catch {
    return false;
  }
}

/** The file's text, or null if it isn't there. A file that is there but won't read throws. */
async function readText(path: string): Promise<string | null> {
  try {
    const { data } = await Filesystem.readFile({ path, directory: DIRECTORY, encoding: ENCODING });
    // With an encoding the plugin always gives text; a Blob only comes back without one.
    return typeof data === 'string' ? data : await data.text();
  } catch (error) {
    if (await exists(path)) throw error;
    return null;
  }
}

async function deleteIfThere(path: string): Promise<void> {
  if (await exists(path)) await Filesystem.deleteFile({ path, directory: DIRECTORY });
}

async function rename(from: string, to: string): Promise<void> {
  await Filesystem.rename({ from, to, directory: DIRECTORY, toDirectory: DIRECTORY });
}

/** Moves the current file out of the way: to the previous copy, or gone. */
async function stepAside(slot: SlotName, files: SlotFiles): Promise<void> {
  if (!(await exists(files.current))) return;
  if (!KEEPS_PREVIOUS[slot]) {
    await Filesystem.deleteFile({ path: files.current, directory: DIRECTORY });
    return;
  }
  await deleteIfThere(files.previous);
  await rename(files.current, files.previous);
}

async function read(slot: SlotName): Promise<string | null> {
  const files = filesOf(slot);
  const current = await readText(files.current);
  if (current !== null) return current;
  // No current file but a temp one: a write was cut off between its renames.
  return readText(files.temp);
}

async function write(slot: SlotName, data: string): Promise<void> {
  const files = filesOf(slot);
  await Filesystem.writeFile({
    path: files.temp,
    data,
    directory: DIRECTORY,
    encoding: ENCODING,
    recursive: true,
  });
  await stepAside(slot, files);
  await rename(files.temp, files.current);
}

/** Empties the slot. A removed save is kept as the previous copy, as an overwritten one is. */
async function remove(slot: SlotName): Promise<void> {
  const files = filesOf(slot);
  await deleteIfThere(files.temp);
  await stepAside(slot, files);
}

export const capacitorFiles: StorageBackend = { read, write, remove };

export const capacitorBackend: NativeBackend = {
  name: CAPACITOR_SHELL,
  detect: () => (Capacitor.isNativePlatform() ? capacitorFiles : null),
};
