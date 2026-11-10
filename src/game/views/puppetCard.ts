import { isBroken, type BuiltSheet } from '@/systems/puppets';
import { statTier, type StatGrade } from '@/systems/stats';

import type { GameContext } from '../context';
import { mendingCost } from '../puppetry/mending';
import { knowsPuppetry, stayingHome, yourPuppets } from '../puppetry/yours';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/**
 * Your puppets on the Shinobi tab: your craft in words, and each puppet you own, how whole it
 * is, whether it comes to fights, and a session at the bench to mend it, with what the
 * materials cost. Nothing shows until you know the art or own one.
 */

export interface PuppetRow {
  readonly puppetId: string;
  readonly name: string;
  readonly description: string;
  /** How whole it is, 0 to 1, for the bar. */
  readonly condition: number;
  readonly state: string;
  /** Why it stays home from fights, or null when it comes. */
  readonly staysHome: string | null;
  /** A session at the bench, null when it is whole. */
  readonly mend: (Choice & { readonly cost: number }) | null;
  /** How you built it, to start a rebuild from; null for a puppet given with its art. */
  readonly sheet: BuiltSheet | null;
}

export interface PuppetCard {
  readonly craft: string;
  readonly puppets: readonly PuppetRow[];
}

const CRAFT_WORDS: Readonly<Record<StatGrade, string>> = {
  E: 'An apprentice’s hands',
  D: 'A journeyman’s hands',
  C: 'A craftsman’s hands',
  B: 'A master’s hands',
  A: 'Hands a school would boast of',
  S: 'Hands to rival the old masters',
};

function stateWord(condition: number): string {
  if (condition >= 1) return 'Whole';
  if (condition >= 0.6) return 'Scuffed';
  return condition > 0 ? 'Badly damaged' : 'Broken';
}

export function puppetCard(state: GameState, ctx: GameContext): PuppetCard | null {
  const yours = yourPuppets(state, ctx);
  if (yours.length === 0 && !knowsPuppetry(state, ctx)) return null;
  return {
    craft: CRAFT_WORDS[statTier(state.puppetry.craft).grade],
    puppets: yours.map((p) => ({
      puppetId: p.owned.id,
      name: p.owned.name,
      description: p.def.description,
      condition: p.owned.condition,
      state: isBroken(p.owned) ? 'Broken' : stateWord(p.owned.condition),
      staysHome: stayingHome(state, ctx, p),
      sheet: p.owned.built ?? null,
      mend:
        p.owned.condition < 1
          ? {
              ...choice(state, ctx, { type: 'mendPuppet', puppetId: p.owned.id }),
              cost: mendingCost(state, p),
            }
          : null,
    })),
  };
}
