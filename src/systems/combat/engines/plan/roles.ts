import type { Discipline } from '@/systems/techniques';

import { alive } from '../../rules/body';
import type { PlanFighter } from './state';

/**
 * Reading the matchup before a planned fight: a fighter whose best art every foe outclasses
 * (`OUTCLASS_RATIO` of theirs or more in that art) can't win trading it head-on. When someone
 * on their side still has a matchup worth fighting, the outclassed one's plan leads with what
 * sets that teammate up (holds, pins, clones) rather than with blows that won't land.
 */

/** A foe this much better in your best art outclasses you in it. */
export const OUTCLASS_RATIO = 1.3;

const ARTS: readonly Discipline[] = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

function bestArt(f: PlanFighter): Discipline {
  return ARTS.reduce((best, art) => (f.attributes[art] > f.attributes[best] ? art : best));
}

function outclassedBy(f: PlanFighter, foe: PlanFighter): boolean {
  const art = bestArt(f);
  return foe.attributes[art] >= f.attributes[art] * OUTCLASS_RATIO;
}

/** Whether a fighter should set others up: every foe outclasses them, and a teammate stands a chance. */
export function setsOthersUp(self: PlanFighter, fighters: readonly PlanFighter[]): boolean {
  const foes = fighters.filter((f) => f.side !== self.side && alive(f));
  if (foes.length === 0 || !foes.every((foe) => outclassedBy(self, foe))) return false;
  const team = fighters.filter((f) => f.side === self.side && f.id !== self.id && alive(f));
  return team.some((mate) => foes.some((foe) => !outclassedBy(mate, foe)));
}
