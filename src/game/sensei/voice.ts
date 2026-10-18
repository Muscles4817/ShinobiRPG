import type { PersonDef, SenseiFeedback } from '@/content';
import { fillSlots } from '@/core';
import type { Told } from '@/systems/telling';

import { personSlots } from '../people/pronouns';
import type { GameState } from '../state';
import { tellFresh } from '../telling';
import { waysOf } from './generate';

/**
 * Putting a sensei's words together: picks from banks that remember what they said lately,
 * threaded through one speech, and a run of spoken sentences turned into a quotation with one
 * attribution, so a paragraph names them once and then says "he" or "she".
 */

export interface Speaker {
  readonly sensei: PersonDef;
  readonly feedback: SenseiFeedback;
  /** Their name with every pronoun form, plus any slots the speech needs. */
  readonly slots: Readonly<Record<string, string>>;
  /** Picks a line from a bank, passing over what they said lately. */
  pick(bank: string, lines: readonly string[]): string;
  /** What has been said, after every pick so far. */
  told(): Told;
}

/** A speaker for one moment (`key`), starting from the save's memory of what was said. */
export function speakerFor(state: GameState, sensei: PersonDef, key: string): Speaker {
  let told = state.told;
  return {
    sensei,
    feedback: waysOf(sensei)?.feedback ?? 'warm',
    slots: personSlots('name', sensei),
    pick(bank, lines) {
      const picked = tellFresh(told, { name: bank, lines }, key);
      told = picked.told;
      return picked.line;
    },
    told: () => told,
  };
}

/**
 * Sentences they say, as one quotation: the first carries the attribution ("…,” he says.
 * “…”). A question keeps its mark; a statement's full stop turns to a comma.
 */
export function spoken(sentences: readonly string[], attribution: string): string {
  const [first, ...rest] = sentences;
  if (first === undefined) return '';
  const lead = first.endsWith('.') ? `${first.slice(0, -1)},` : first;
  const tail = rest.length > 0 ? ` “${rest.join(' ')}”` : '';
  return `“${lead}” ${attribution}.${tail}`;
}

/** Fills a paragraph's slots for this speaker. */
export function said(speaker: Speaker, text: string, extra: Record<string, string> = {}): string {
  return fillSlots(text, { ...speaker.slots, ...extra });
}

/** A line that follows a quotation mid-sentence ("he says"), whatever filling it capitalised. */
export function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
