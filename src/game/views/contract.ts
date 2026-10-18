import type { SummonDef } from '@/content';
import { stageForPair, stageName, stageProgress } from '@/systems/bonds';
import { standingStage } from '@/systems/contracts';
import { fightingPower, statTier } from '@/systems/stats';

import { heldContract, summonBlocker } from '../contracts/summons';
import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Your summoning contract on the Shinobi tab: the clan, your standing with it, and each summon,
 * whether it answers you now, and what it asks, in words (the price stays out of the story).
 */

/** Upkeep this many chakra an exchange or more is heavy to keep. */
const HEAVY_UPKEEP = 10;

export interface SummonCard {
  readonly name: string;
  readonly description: string;
  /** How strong it is, as a grade of its whole body. */
  readonly grade: string;
  readonly answers: boolean;
  /** Why it doesn't answer yet, or what it asks of you. */
  readonly note: string;
}

export interface ContractCard {
  readonly name: string;
  readonly description: string;
  readonly standing: string;
  readonly progress: number;
  readonly summons: readonly SummonCard[];
}

function priceWords(summon: SummonDef, ctx: GameContext): string {
  const keep = summon.upkeep >= HEAVY_UPKEEP ? 'Heavy to keep' : 'Light to keep';
  const offering = summon.price?.offeringId;
  const asks = [
    ...(summon.price?.blood ? ['blood'] : []),
    ...(offering
      ? [`an offering of ${ctx.content.ingredients.require(offering).name.toLowerCase()}`]
      : []),
  ];
  return asks.length > 0 ? `${keep}; asks ${asks.join(' and ')}.` : `${keep}.`;
}

export function contractCard(state: GameState, ctx: GameContext): ContractCard | null {
  const held = heldContract(state, ctx);
  if (!held) return null;
  const stage = standingStage(held.contract);
  return {
    name: held.def.name,
    description: held.def.description,
    standing: stageName(stage),
    progress: stageProgress(held.contract.standing),
    summons: held.def.summons.map((s) => {
      const blocker = summonBlocker(state, ctx, s);
      const ready = stage >= s.standing;
      return {
        name: s.name,
        description: s.description,
        grade: statTier(fightingPower(s.stats)).grade,
        answers: blocker === null,
        note: ready
          ? (blocker ?? priceWords(s, ctx))
          : `Answers once the clan counts you ${stageForPair(s.standing)}.`,
      };
    }),
  };
}
