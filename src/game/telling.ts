import { freshIndex } from '@/core';
import { noteTold, recentlyTold, type Told } from '@/systems/telling';

/**
 * Picking a line the player hasn't just read: by a hash of the moment's key (never the game's
 * Rng, so choosing words never changes what happens), passing over the bank's recent picks,
 * and remembering this one. The bank's name keys the memory; a bank used in several places
 * with different lines should use different names.
 */

export interface Telling<T> {
  readonly line: T;
  readonly told: Told;
}

export function tellFresh<T>(
  told: Told,
  bank: { readonly name: string; readonly lines: readonly T[] },
  key: string,
): Telling<T> {
  const size = bank.lines.length;
  const index = freshIndex(`${bank.name}|${key}`, size, recentlyTold(told, bank.name));
  const line = bank.lines[index];
  if (line === undefined) throw new Error(`The bank "${bank.name}" is empty`);
  return { line, told: noteTold(told, bank.name, { index, size }) };
}
