/**
 * The game's files on disk, one per slot, in the desktop app's own folder. Writes are atomic
 * (a temp file, flushed to disk, renamed over the old one), so a crash mid-write keeps the last
 * good file; the save also keeps the copy before it, read back if the save itself won't parse.
 * Writes to a slot run one at a time, and `settled` lets the app wait for them before it quits.
 */
import { mkdir, open, readFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

import type { Slot } from './slots.js';

/** The folder under the app's data folder that holds every slot. */
export const SAVES_FOLDER = 'saves';
/** Only the save keeps the copy before it: settings and edits are cheap to lose. */
const BACKED_UP: ReadonlySet<Slot> = new Set(['save']);
/** Windows may hold a file briefly (a virus scan, an indexer); a rename is tried again. */
const RENAME_TRIES = 5;
const RENAME_WAIT_MS = 50;

export interface SlotFiles {
  readonly read: (slot: Slot) => Promise<string | null>;
  readonly write: (slot: Slot, data: string) => Promise<void>;
  readonly remove: (slot: Slot) => Promise<void>;
  /** Settles once every write and removal asked for so far has finished. */
  readonly settled: () => Promise<void>;
  /** Whether a write or removal is still under way. */
  readonly busy: () => boolean;
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

async function readIfThere(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}

function parses(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

const pause = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function renameOver(from: string, to: string): Promise<void> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await rename(from, to);
      return;
    } catch (error) {
      if (attempt >= RENAME_TRIES) throw error;
      await pause(RENAME_WAIT_MS * attempt);
    }
  }
}

/** Writes `data` beside `path`, flushes it to disk, then puts it in place in one rename. */
async function writeAtomically(path: string, data: string): Promise<void> {
  const temp = `${path}.tmp`;
  const handle = await open(temp, 'w');
  try {
    await handle.writeFile(data, 'utf8');
    await handle.sync();
  } finally {
    await handle.close();
  }
  await renameOver(temp, path);
}

/** Keeps the file as it is now as `.bak`, if it is whole: a broken save never replaces a good copy. */
async function backUp(path: string): Promise<void> {
  const current = await readIfThere(path);
  if (current !== null && parses(current)) await writeAtomically(`${path}.bak`, current);
}

export function slotFiles(dataFolder: string): SlotFiles {
  const folder = join(dataFolder, SAVES_FOLDER);
  const pathOf = (slot: Slot) => join(folder, `${slot}.json`);
  // Each slot's writes in order; a failed one doesn't stop the next.
  const queues = new Map<Slot, Promise<void>>();
  let running = 0;

  const queued = (slot: Slot, job: () => Promise<void>): Promise<void> => {
    running += 1;
    const done = (queues.get(slot) ?? Promise.resolve()).then(job).finally(() => {
      running -= 1;
    });
    queues.set(
      slot,
      done.catch(() => undefined),
    );
    return done;
  };

  const read = async (slot: Slot): Promise<string | null> => {
    await queues.get(slot);
    const text = await readIfThere(pathOf(slot));
    if (!BACKED_UP.has(slot) || (text !== null && parses(text))) return text;
    // The save is missing or broken: the copy before it, if that one is whole.
    const backup = await readIfThere(`${pathOf(slot)}.bak`);
    return backup !== null && parses(backup) ? backup : text;
  };

  const write = (slot: Slot, data: string) =>
    queued(slot, async () => {
      await mkdir(folder, { recursive: true });
      if (BACKED_UP.has(slot)) await backUp(pathOf(slot));
      await writeAtomically(pathOf(slot), data);
    });

  // A removed save takes its copy with it, or the copy would come back as the save.
  const remove = (slot: Slot) =>
    queued(slot, async () => {
      await rm(pathOf(slot), { force: true });
      await rm(`${pathOf(slot)}.bak`, { force: true });
    });

  const settled = async () => {
    while (running > 0) await Promise.all(queues.values());
  };

  return { read, write, remove, settled, busy: () => running > 0 };
}
