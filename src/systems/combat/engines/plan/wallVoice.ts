import type { Element } from '@/systems/techniques';

import type { Matchup } from '../../rules/elements';
import type { Told } from '../../rules/telling';
import { told, type Moment } from './fresh';
import { BREAKS, HOLDS, MEETS, TAKES } from './wallLines';

/** An elemental wall's moment, told by what it is made of and what met it (`wallLines.ts`). */

export interface WallTold {
  readonly target: Told;
  readonly attacker: Told;
  readonly what: string;
  /** The wall's name. */
  readonly jutsu: string;
  /** How its element met the attack's. */
  readonly wall: Matchup;
  /** What the wall is made of; a plain substitution has no element. */
  readonly walls: Element | undefined;
  /** The attack's element, if it has one. */
  readonly hits: Element | undefined;
}

function linesFor({ wall, walls, hits }: WallTold & { walls: Element }): readonly string[] {
  if (wall === 'strong') return HOLDS[walls];
  if (wall === 'weak') return BREAKS[walls];
  return hits ? [...TAKES[walls], ...MEETS[hits]] : TAKES[walls];
}

/** A wall holding, breaking or spent; null for a plain substitution (`swapLine`). */
export function wallLine(moment: Moment, w: WallTold): string | null {
  const { walls } = w;
  if (!walls) return null;
  const id = `wall-${w.wall}-${walls}-${w.hits ?? 'plain'}`;
  return told(
    moment,
    { id, lines: linesFor({ ...w, walls }) },
    { t: w.target, a: w.attacker, what: w.what, wall: w.jutsu },
  );
}
