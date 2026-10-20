import { QUALITY_GRADES } from '@/content';
import { DUST_GIFTS, DUST_QUALITIES, type DustGift, type DustQuality } from '@/systems/combat';
import { GATHER_AT_HOME } from '@/systems/dusts';

import type { GameContext } from '../context';
import { choice, type Choice } from './common';
import { drawable, dustKindOf, yourDust } from '../dust/dust';
import type { GameState } from '../state';

/**
 * Your dust on the Shinobi tab: the kind you command, what it is good at, what scatters it, how
 * much you carry, in words, and whether it comes back on its own.
 */

export interface DustCard {
  readonly name: string;
  readonly description: string;
  /** How full the store is, 0 to 1, for the bar. */
  readonly fill: number;
  readonly state: string;
  readonly gathering: string;
  readonly gifts: readonly string[];
  readonly qualities: readonly { readonly name: string; readonly grade: string }[];
  /** What scatters it ("Water", "A heavy blow"). */
  readonly banes: readonly string[];
  /** Making a batch at home, for dust no ground gives back; null for sand and ash. */
  readonly make: (Choice & { readonly cost: number }) | null;
}

const GIFT_WORDS: Readonly<Record<DustGift, string>> = {
  cutting: 'Cuts where it lands',
  blinding: 'Blinds whoever it reaches',
};
const STRENGTH = ['', 'a little', 'badly', 'terribly'] as const;
const QUALITY_NAMES: Readonly<Record<DustQuality, string>> = {
  weight: 'Weight',
  hold: 'Hold',
  draw: 'Draw',
};

function stateWord(fill: number): string {
  if (fill >= 1) return 'Full';
  if (fill >= 0.6) return 'Thinned';
  return fill > 0 ? 'Thin' : 'Spent';
}

function gatheringLine(fill: number, comesBack: boolean): string {
  if (fill >= 1) return 'You carry as much as you can hold up.';
  if (!comesBack) return 'No ground gives this back: what is lost must be made or bought.';
  return (1 - fill) / GATHER_AT_HOME <= 1
    ? 'A night at home will gather it back.'
    : 'A few days at home will gather it back; it comes slowly away.';
}

export function dustCard(state: GameState, ctx: GameContext): DustCard | null {
  const yours = yourDust(state, ctx);
  if (!yours) return null;
  const kind = dustKindOf(yours.def);
  const fill = yours.cap > 0 ? Math.min(1, yours.store.count / yours.cap) : 0;
  return {
    name: yours.def.name,
    description: yours.def.description,
    fill,
    state: stateWord(fill),
    gathering: gatheringLine(fill, drawable(yours.def)),
    gifts: DUST_GIFTS.flatMap((gift) => {
      const strength = kind.gifts[gift];
      return strength ? [`${GIFT_WORDS[gift]}, ${STRENGTH[strength]}`] : [];
    }),
    qualities: DUST_QUALITIES.map((q) => ({
      name: QUALITY_NAMES[q],
      grade: QUALITY_GRADES[kind.qualities[q] - 1] ?? 'A',
    })),
    make: yours.def.making
      ? { ...choice(state, ctx, { type: 'makeDust' }), cost: yours.def.making.ryo }
      : null,
    banes: yours.def.banes.map((b) =>
      b === 'heavy' ? 'A heavy blow' : b.charAt(0).toUpperCase() + b.slice(1),
    ),
  };
}
