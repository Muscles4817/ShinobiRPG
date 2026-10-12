import type { Rng } from '@/core';
import { afterRecon, MAX_RECON, stillHidden, type ReconId } from '@/systems/missions';
import { checkChance, type StatId } from '@/systems/stats';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { bestHandFor, type Hand } from '../missionRoles';
import { adjust, firstBlocker } from '../ops';
import type { GameState } from '../state';
import { encounterHere, withEncounter, type EncounterHere } from './current';
import { senseMeans } from './means';
import { watchedFor } from './spotted';

/**
 * Recon: watching, tracking, sensing and asking around before choosing how to go in. Each costs
 * something and tests a stat (on team missions, the teammate best at it); success reveals facts,
 * failure puts the foes more on guard, and they may spot you. Asking around is paid for and never
 * fails.
 */

export const OBSERVE_ENERGY = 5;
export const TRACK_ENERGY = 8;
export const SENSE_CHAKRA = 10;
export const ASK_AROUND_FEE = 15;

/** What a recon takes out of you. */
export interface ReconCost {
  readonly energy?: number;
  readonly chakra?: number;
  readonly ryo?: number;
}

const COSTS: Readonly<Record<ReconId, ReconCost>> = {
  observe: { energy: OBSERVE_ENERGY },
  track: { energy: TRACK_ENERGY },
  sense: { chakra: SENSE_CHAKRA },
  ask: { ryo: ASK_AROUND_FEE },
};

const SUCCESS: Readonly<Record<ReconId, string>> = {
  observe: 'From cover you take in the ground, and how they hold themselves.',
  track: 'The trail tells you who passed this way, and how many.',
  sense: 'Their chakra burns in your mind’s eye: how many, how they fight, and whether they know.',
  ask: 'A few words and a few coins, and you know who they are and how they fight.',
};

/** A recon as it stands now: who would do it, the odds and what it costs, or why not. */
export interface ReconPlan {
  readonly id: ReconId;
  readonly label: string;
  /** The stat tested; null for asking around, which can't fail. */
  readonly stat: StatId | null;
  readonly hand: Hand;
  readonly chance: number;
  readonly cost: ReconCost;
  readonly blocker: string | null;
}

/** Who takes the recon's roll and with what; sensing reads the better of perception and ninjutsu. */
function reconHand(state: GameState, ctx: GameContext, id: ReconId): [StatId | null, Hand] {
  const { stats, name } = state.character;
  if (id === 'ask') return [null, { personId: null, name, value: 0 }];
  if (id === 'sense') {
    const stat: StatId = stats.ninjutsu > stats.perception ? 'ninjutsu' : 'perception';
    return [stat, { personId: null, name: 'You', value: stats[stat] }];
  }
  return ['perception', bestHandFor(state, ctx, 'perception')];
}

function costBlocker(state: GameState, cost: ReconCost): string | null {
  const { vitals } = state.character;
  return firstBlocker(
    (cost.energy ?? 0) > vitals.energy && `Needs ${cost.energy} energy.`,
    (cost.chakra ?? 0) > vitals.chakra && `Needs ${cost.chakra} chakra.`,
    (cost.ryo ?? 0) > state.wallet.ryo && `Costs ${cost.ryo} ryo.`,
  );
}

function reconBlocker(
  state: GameState,
  ctx: GameContext,
  here: EncounterHere,
  id: ReconId,
): string | null {
  return firstBlocker(
    here.encounter.recons >= MAX_RECON && 'You’ve scouted all you can without being seen.',
    id === 'ask' &&
      state.board.intel.includes(here.def.id) &&
      'You already have the client’s report.',
    stillHidden(here.encounter, id).length === 0 && 'Nothing more to learn that way.',
    id === 'sense' &&
      senseMeans(state, ctx) === null &&
      'You can’t feel chakra yet. Learn a sensing technique, or raise ninjutsu to D.',
    costBlocker(state, COSTS[id]),
  );
}

function chanceOf(
  state: GameState,
  ctx: GameContext,
  id: ReconId,
  check: { readonly value: number; readonly difficulty: number },
): number {
  if (id === 'ask') return 1;
  if (id === 'sense' && senseMeans(state, ctx) === 'insight') return 1;
  return checkChance(check.value, check.difficulty);
}

/** The template's recon options, as they stand for you now. */
export function reconPlans(state: GameState, ctx: GameContext, here: EncounterHere): ReconPlan[] {
  return here.template.recon.map((option) => {
    const [stat, hand] = reconHand(state, ctx, option.id);
    return {
      id: option.id,
      label: option.label,
      stat,
      hand,
      chance: chanceOf(state, ctx, option.id, {
        value: hand.value,
        difficulty: option.difficulty,
      }),
      cost: COSTS[option.id],
      blocker: reconBlocker(state, ctx, here, option.id),
    };
  });
}

function payFor(state: GameState, cost: ReconCost): GameState {
  const paid = cost.ryo ? spend(state.wallet, cost.ryo) : null;
  const wallet = paid?.ok ? paid.value : state.wallet;
  return adjust({ ...state, wallet }, { energy: -(cost.energy ?? 0), chakra: -(cost.chakra ?? 0) });
}

/** Takes a recon: pays for it, rolls it, and reveals facts or puts the foes on guard. */
export function performRecon(state: GameState, ctx: GameContext, id: ReconId, rng: Rng): GameState {
  const here = encounterHere(state, ctx);
  if (!here) return state;
  const plan = reconPlans(state, ctx, here).find((p) => p.id === id);
  if (!plan) return state;
  const success = plan.chance >= 1 || rng.chance(plan.chance);
  const who = plan.hand.personId ? ` (${plan.hand.name})` : '';
  const encounter = afterRecon(here.encounter, id, success);
  const mission = withEncounter(
    here,
    encounter,
    { kind: 'choice', text: `${plan.label}${who}` },
    ...(plan.stat && plan.chance < 1
      ? [{ kind: 'roll' as const, stat: plan.stat, chance: plan.chance, success }]
      : []),
    { kind: 'story', text: success ? SUCCESS[id] : here.flavour.noticed },
  );
  const paid = payFor({ ...state, mission }, plan.cost);
  return success ? paid : watchedFor(paid, ctx, rng, false);
}
