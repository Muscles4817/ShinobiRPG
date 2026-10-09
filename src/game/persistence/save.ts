import { err, ok, type Result } from '@/core';

import type { GameState } from '../state';
import { MIGRATIONS } from './migrations';

/**
 * Save files are versioned JSON. When `GameState`'s shape changes:
 *  1. bump SAVE_VERSION,
 *  2. add a migration from the previous version in `migrations.ts`,
 *  3. add a test that an old-format save still loads.
 * Never break a player's existing save.
 */
export const SAVE_VERSION = 2;

/** Where saves live. Implemented by the platform layer (e.g. localStorage). */
export interface SaveStore {
  load(): string | null;
  save(data: string): void;
  clear(): void;
}

interface SaveFile {
  readonly version: number;
  readonly state: unknown;
}

export function serialize(state: GameState): string {
  const file: SaveFile = { version: SAVE_VERSION, state };
  return JSON.stringify(file);
}

const REQUIRED_KEYS: readonly (keyof GameState)[] = [
  'packId',
  'locationId',
  'housing',
  'reports',
  'rngState',
  'time',
  'character',
  'wallet',
  'techniques',
  'standing',
  'journal',
  'mission',
  'combat',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function migrate(version: number, state: Record<string, unknown>): Result<Record<string, unknown>> {
  let current = state;
  for (let v = version; v < SAVE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) return err(`No migration from save version ${v}.`);
    current = step(current);
  }
  return ok(current);
}

export function deserialize(raw: string): Result<GameState> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return err('Save data is corrupted.');
  }
  if (!isRecord(parsed) || typeof parsed.version !== 'number' || !isRecord(parsed.state)) {
    return err('Save data is not a valid save file.');
  }
  if (parsed.version > SAVE_VERSION) return err('This save is from a newer version of the game.');

  const migrated = migrate(parsed.version, parsed.state);
  if (!migrated.ok) return migrated;
  const missing = REQUIRED_KEYS.filter((key) => !(key in migrated.value));
  if (missing.length > 0) return err(`Save data is missing: ${missing.join(', ')}.`);
  return ok(migrated.value as unknown as GameState);
}
