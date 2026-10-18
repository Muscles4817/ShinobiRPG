import { hashString } from '@/core';
import { REGISTERS, type PersonDef, type Phrased, type Register } from '@/content';

import type { GameContext } from '../context';

/**
 * How a person talks, and the words a phrased line takes in their mouth. A person's register
 * is their first trait's (`TraitDef.register`): brash and diligent people are blunt, the kind
 * warm, the curious and the lazy wry, the calm formal. A line phrased by register reads in
 * theirs, else in the other of its pair (blunt and wry, warm and formal), else in whichever
 * phrasing the person's id hashes to, so the choice is always the same for the same person.
 */

/** The register of someone with no traits to read one from. */
export const DEFAULT_REGISTER: Register = 'warm';

/** The other register of each pair, whose phrasing reads nearly as well. */
const PAIRED: Readonly<Record<Register, Register>> = {
  blunt: 'wry',
  wry: 'blunt',
  warm: 'formal',
  formal: 'warm',
};

export function registerOf(ctx: GameContext, person: PersonDef): Register {
  for (const id of person.traitIds) {
    const trait = ctx.content.traits.get(id);
    if (trait) return trait.register;
  }
  return DEFAULT_REGISTER;
}

/** The words a line takes for a speaker of this register; `key` settles a line with no match. */
export function phrasingFor(line: Phrased, register: Register, key: string): string {
  if (typeof line === 'string') return line;
  const near = line[register] ?? line[PAIRED[register]];
  if (near !== undefined) return near;
  const given = REGISTERS.flatMap((r) => line[r] ?? []);
  return given[hashString(key) % Math.max(given.length, 1)] ?? '';
}

/** Every phrasing of a line, for checks that must read them all. */
export function phrasingsOf(line: Phrased): readonly string[] {
  return typeof line === 'string' ? [line] : REGISTERS.flatMap((r) => line[r] ?? []);
}
