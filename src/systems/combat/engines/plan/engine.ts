import { clamp, err, ok, type Result, type Rng } from '@/core';

import type {
  CombatChoice,
  CombatEngine,
  CombatOption,
  CombatOutcome,
  CombatState,
  CombatView,
  RangeBand,
} from '../../contract';
import { alive, hasPerk, viewOf } from '../../rules/body';
import { RANGE_BANDS, RANGE_LABEL } from '../../rules/range';
import {
  cardDetail,
  cardId,
  cardLabel,
  cardsFor,
  defaultLoadout,
  findCard,
  slotLimit,
} from './cards';
import { upgradeLegacy, withKits } from './legacy';
import { rememberedLoadout } from './memory';
import { decide, resolveExchange } from './round';
import {
  decode,
  encode,
  initialFighters,
  patch,
  PLAN_ENGINE_ID,
  playerOf,
  type PlanFighter,
  type PlanState,
} from './state';

/**
 * Plan & Watch, after Punch Club: before each round you slot a few cards for each distance
 * (attacks, techniques, footwork that tries to change the range, defences that react on their
 * own), then watch the round play out. Between rounds you see what worked and re-plan.
 */

const START_RANGE = 'mid';
/** Exchanges per round; the cards can be changed between rounds. */
export const ROUND_EXCHANGES = 4;
const SLOT_PREFIX = 'slot:';

function read(state: CombatState): PlanState {
  return upgradeLegacy(withKits(decode(state)));
}

function statuses(f: PlanFighter): string[] {
  return [...(f.stunned > 0 ? ['Dazed'] : []), ...(f.sealed > 0 ? ['Sealed'] : [])];
}

function slotOptions(player: PlanFighter, band: RangeBand): CombatOption[] {
  const chosen = player.loadout[band];
  const full = chosen.length >= slotLimit(player);
  return cardsFor(player, band).map((card) => {
    const id = cardId(card);
    const selected = chosen.includes(id);
    return {
      id: `${SLOT_PREFIX}${band}:${id}`,
      label: cardLabel(card),
      detail: cardDetail(card, player),
      kind: 'plan',
      group: RANGE_LABEL[band],
      selected,
      ...(card.kind === 'jutsu' ? { discipline: card.technique.discipline } : {}),
      ...(full && !selected ? { disabledReason: 'Slots full. Take a card out first.' } : {}),
    };
  });
}

function options(state: PlanState): CombatOption[] {
  if (state.result) return [];
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  const escape = state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' };
  if (state.phase === 'loadout') {
    const player = playerOf(state);
    const begin = state.bout === 1 ? 'Begin the fight' : `Begin round ${state.bout}`;
    return [
      ...RANGE_BANDS.flatMap((band) => slotOptions(player, band)),
      { id: 'begin', label: begin, detail: '', kind: 'continue' },
      escape,
    ];
  }
  return [
    { id: 'next', label: 'Next exchange', detail: '', kind: 'continue' },
    { id: 'round', label: 'Watch the round', detail: '', kind: 'continue' },
    escape,
  ];
}

function toggle(state: PlanState, optionId: string): PlanState {
  const rest = optionId.slice(SLOT_PREFIX.length);
  const split = rest.indexOf(':');
  // The id came from our own options, so the band is one of RANGE_BANDS.
  const band = rest.slice(0, split) as RangeBand;
  const id = rest.slice(split + 1);
  const player = playerOf(state);
  const chosen = player.loadout[band];
  const next = chosen.includes(id) ? chosen.filter((c) => c !== id) : [...chosen, id];
  const loadout = { ...player.loadout, [band]: next };
  return { ...state, fighters: patch(state.fighters, player.id, { loadout }) };
}

function fleeChance(state: PlanState): number {
  const runner = playerOf(state);
  const chasers = state.fighters.filter((f) => f.side === 'enemy' && alive(f));
  const fastest = Math.max(...chasers.map((c) => c.attributes.speed));
  const distance = state.range === 'far' ? 0.2 : state.range === 'mid' ? 0.1 : 0;
  return clamp(0.4 + (runner.attributes.speed - fastest) * 0.05 + distance, 0.1, 0.9);
}

/** Fights an exchange and, when the round is over, returns to the card table. */
function exchange(state: PlanState, rng: Rng): PlanState {
  const next = resolveExchange(state, rng);
  if (next.result || next.exchange < ROUND_EXCHANGES) return next;
  return {
    ...next,
    phase: 'loadout',
    bout: next.bout + 1,
    exchange: 0,
    log: [...next.log, `— End of round ${state.bout}. Change your cards if you like. —`],
  };
}

function watchRound(state: PlanState, rng: Rng): PlanState {
  let current = state;
  while (current.phase === 'fight' && !current.result) current = exchange(current, rng);
  return current;
}

function flee(state: PlanState, rng: Rng): PlanState {
  if (rng.chance(fleeChance(state))) {
    return {
      ...state,
      log: [...state.log, 'You vanish in a swirl of leaves and escape!'],
      result: 'escaped',
    };
  }
  const failed = {
    ...state,
    phase: 'fight' as const,
    log: [...state.log, 'You try to slip away, but you are cut off!'],
  };
  return exchange(failed, rng);
}

function act(state: PlanState, optionId: string, rng: Rng): Result<PlanState> {
  const option = options(state).find((o) => o.id === optionId);
  if (!option) return err(`Unknown combat option "${optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  if (optionId.startsWith(SLOT_PREFIX)) return ok(toggle(state, optionId));
  switch (optionId) {
    case 'begin':
      return ok({ ...state, phase: 'fight', log: [...state.log, `— Round ${state.bout} —`] });
    case 'flee':
      return ok(flee(state, rng));
    case 'round':
      return ok(watchRound(state, rng));
    default:
      return ok(exchange(state, rng));
  }
}

/** What you know of an enemy's cards: all of them with insight, else what you've seen. */
function intentOf(state: PlanState, f: PlanFighter, insight: boolean): string | undefined {
  if (f.side !== 'enemy' || !alive(f)) return undefined;
  const ids = insight ? f.loadout[state.range] : (state.seen[f.id] ?? []);
  const names = ids.flatMap((id) => {
    const card = findCard(f, id);
    return card ? [cardLabel(card)] : [];
  });
  if (names.length === 0) return undefined;
  return `${insight ? `${RANGE_LABEL[state.range]} cards` : 'Seen'}: ${names.join(', ')}`;
}

function prompt(state: PlanState): string {
  if (state.phase === 'loadout') {
    const pick = `Round ${state.bout}: pick up to ${slotLimit(playerOf(state))} cards for each distance.`;
    const hidden = state.fighters.some((f) => f.side === 'enemy' && alive(f) && f.hidden);
    return hidden ? `${pick} Someone is hidden: Search or Dispel finds them.` : pick;
  }
  return `${RANGE_LABEL[state.range]} range · round ${state.bout}, exchange ${state.exchange + 1} of ${ROUND_EXCHANGES}`;
}

export function createPlanEngine(): CombatEngine {
  return {
    id: PLAN_ENGINE_ID,
    label: 'Plan & Watch',
    summary:
      'Slot cards for each distance, then watch each round play out. Re-plan between rounds.',

    start(setup) {
      const names = setup.enemies.map((e) => e.name).join(', ');
      const fighters = initialFighters(setup).map((f) => ({
        ...f,
        loadout: (f.isPlayer ? rememberedLoadout(setup.plan, f) : null) ?? defaultLoadout(f),
      }));
      const state: PlanState = {
        phase: 'loadout',
        round: 1,
        bout: 1,
        exchange: 0,
        fighters,
        range: START_RANGE,
        seen: {},
        log: [setup.intro ?? `${names} square up. How will you fight?`],
        result: null,
        canFlee: setup.canFlee,
      };
      return encode(state);
    },

    act(state: CombatState, choice: CombatChoice, rng): Result<CombatState> {
      const plan = read(state);
      if (plan.result) return err('The fight is already over.');
      const next = act(plan, choice.optionId, rng);
      return next.ok ? ok(encode(next.value)) : next;
    },

    view(state): CombatView {
      const plan = read(state);
      const insight = hasPerk(playerOf(plan), 'insight');
      return {
        round: plan.round,
        combatants: plan.fighters.map((f) => viewOf(f, statuses(f), intentOf(plan, f, insight))),
        log: plan.log,
        options: options(plan),
        range: plan.range,
        prompt: prompt(plan),
      };
    },

    outcome(state): CombatOutcome | null {
      const plan = read(state);
      const result = plan.result ?? decide(plan.fighters);
      if (!result) return null;
      const player = playerOf(plan);
      return {
        result,
        rounds: plan.round,
        player: { health: player.health, chakra: player.chakra },
        plan: player.loadout,
      };
    },
  };
}
