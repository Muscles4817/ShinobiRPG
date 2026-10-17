import { hashUnit } from '@/core';

import type { ReplyOption } from './lines';
import type { Rival, RivalShape, Temperament } from './state';

/**
 * How a rival gets under your skin: something specific they did, by temperament (a proud one
 * takes your job and says why, a kind one pities you in public, a cold one corrects you and
 * walks on), and what you may say back. The cruel answer goes for the sore spot the shape of
 * the gap leaves them, so it is there only once you know them well enough to find it.
 */

export interface Provocation {
  readonly id: string;
  readonly temperament: Temperament;
  readonly line: string;
}

export const PROVOCATIONS: readonly Provocation[] = [
  {
    id: 'took-job',
    temperament: 'proud',
    line: '{name} took the job off the board you had been eyeing, and told the clerk you weren’t ready for it.',
  },
  {
    id: 'asked-the-way',
    temperament: 'proud',
    line: '{name} asked, loud enough for the whole mission hall, whether you had found your way to the training ground yet.',
  },
  {
    id: 'carried-pack',
    temperament: 'kind',
    line: '{name} offered, in front of your team, to carry your pack, “since it looks heavy for you.”',
  },
  {
    id: 'told-sensei',
    temperament: 'kind',
    line: '{name} told your sensei they were worried you were overdoing it. Your sensei asked you about it, in front of everyone.',
  },
  {
    id: 'corrected-stance',
    temperament: 'cold',
    line: '{name} stopped at the edge of your drill, corrected your stance in one sentence, and walked on.',
  },
  {
    id: 'walked-past',
    temperament: 'cold',
    line: '{name} walked past you at the gate as if you were a post, while your team watched.',
  },
];

/** The sore spot each shape of gap leaves, for anyone who knows them well enough. */
const CRUEL: Readonly<Record<RivalShape, string>> = {
  prodigy:
    '“Everyone’s waiting for you to be great. Must be lonely, letting them all down slowly.”',
  neck: '“You’ve never beaten me at anything that mattered. You never will.”',
  chaser: '“You’ll be behind me your whole life. Get used to the view.”',
  fallen: '“You peaked at the academy. Everyone can see it but you.”',
};

const REPLIES: readonly ReplyOption[] = [
  { tone: 'quiet', say: 'Let it go.', heat: 2 },
  { tone: 'tease', say: 'A dig back, where people can hear.', heat: -6, rattles: true },
  { tone: 'challenge', say: '“Settle it, then. Pick the day.”', heat: 1 },
];

export function provocationReplies(rival: Rival, knowsThem: boolean): readonly ReplyOption[] {
  if (!knowsThem) return REPLIES;
  return [...REPLIES, { tone: 'cruel', say: CRUEL[rival.shape], heat: -18, rattles: true }];
}

export function provocationById(id: string): Provocation | undefined {
  return PROVOCATIONS.find((p) => p.id === id);
}

/** At least this many days between provocations. */
const PROVOKE_GAP = 5;
/** Chance of one on a day the gap has passed, by temperament; bitter rivals needle more. */
const PROVOKE_CHANCE: Readonly<Record<Temperament, number>> = { proud: 0.3, kind: 0.2, cold: 0.15 };
const BITTER_HEAT = 50;
const BITTER_SCALE = 1.5;

/** Whether they needle you today, and with what: a hash of the seed and the day. */
export function provocationToday(rival: Rival, seed: number, day: number): Provocation | null {
  if (day - rival.lastProvocationDay < PROVOKE_GAP) return null;
  const chance = PROVOKE_CHANCE[rival.temperament] * (rival.heat < BITTER_HEAT ? BITTER_SCALE : 1);
  if (hashUnit(seed, day, 'rival-provoke') >= chance) return null;
  const theirs = PROVOCATIONS.filter((p) => p.temperament === rival.temperament);
  return theirs[Math.floor(hashUnit(seed, day, 'rival-provocation') * theirs.length)] ?? null;
}
