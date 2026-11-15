import { createRng } from '@/core';
import { createPlanEngine, type CombatState, type Decision } from '@/systems/combat';
import { findCard, isOffence, type Card } from '@/systems/combat/engines/plan/cards';
import { OBJECTIVES, type Objective } from '@/systems/combat/engines/plan/mind';
import { decode, type PlanFighter } from '@/systems/combat/engines/plan/state';
import { isTrump } from '@/systems/combat/rules/trumps';
import { hasVerb, isHindering, isWounding } from '@/systems/combat/rules/verbs';

import { toSetup } from './fighters';
import { castMember, type CastId } from './matrixCast';
import { STALEMATE_EXCHANGES } from './runner';

/**
 * The objective layer in shadow (`engines/plan/mind/objectives.ts`), read against today's AI:
 * for each move a fighter made, the objective they held and whether the move served it, how long
 * objectives were held, and which each kind of fighter held most.
 */

type Jutsu = Extract<Card, { kind: 'jutsu' }>['technique'];
const jutsuOf = (card: Card): Jutsu | undefined =>
  card.kind === 'jutsu' ? card.technique : undefined;
const withJutsu = (test: (t: Jutsu) => boolean) => (card: Card) => {
  const t = jutsuOf(card);
  return t !== undefined && test(t);
};
const attacks = (card: Card) => {
  const t = jutsuOf(card);
  return isOffence(card) && (t === undefined || isWounding(t));
};

/** What serves each objective, read from what the card does. */
const SERVES: Readonly<Record<Objective, (card: Card) => boolean>> = {
  'wear-down': attacks,
  finish: attacks,
  'set-up': withJutsu((t) => (isHindering(t) && !isWounding(t)) || hasVerb(t, 'conceal')),
  survive: (card) =>
    card.kind === 'evade' ||
    card.kind === 'brace' ||
    (card.kind === 'step' && card.direction === 'back') ||
    withJutsu((t) => isHindering(t) || hasVerb(t, 'substitute'))(card),
  'control-distance': (card) => card.kind === 'step' || withJutsu((t) => hasVerb(t, 'move'))(card),
  recover: (card) => card.kind === 'gather' || withJutsu((t) => hasVerb(t, 'heal'))(card),
  find: (card) =>
    card.kind === 'search' || card.kind === 'dispel' || withJutsu((t) => hasVerb(t, 'sense'))(card),
  escalate: withJutsu((t) => hasVerb(t, 'empower') || hasVerb(t, 'summon') || isTrump(t)),
};

/** Whether a move serves an objective. */
export function serves(objective: Objective, card: Card): boolean {
  return SERVES[objective](card);
}

/** The objectives a move would serve, other than plain attacking. */
export function servesOther(card: Card): Objective[] {
  return OBJECTIVES.filter((o) => o !== 'wear-down' && o !== 'finish' && SERVES[o](card));
}

/** One traced, watched fight: its decisions and the fighters as they ended. */
export function shadowFight(a: CastId, b: CastId, seed: number) {
  const engine = createPlanEngine();
  const rng = createRng(seed);
  let state: CombatState = engine.start(
    {
      player: toSetup(castMember(a, 'chunin'), 'player'),
      allies: [],
      enemies: [toSetup(castMember(b, 'chunin'), 'foe')],
      canFlee: false,
      watch: true,
      trace: true,
    },
    rng,
  );
  for (let n = 0; n < STALEMATE_EXCHANGES && !engine.outcome(state); n++) {
    const next = engine.act(state, { optionId: 'next' }, rng);
    if (!next.ok) break;
    state = next.value;
  }
  const plan = decode(state);
  return { decisions: plan.decisions ?? [], fighters: plan.fighters };
}

export interface ShadowTally {
  /** Turns made under each objective, and how many of them served it. */
  readonly held: Record<Objective, { turns: number; served: number }>;
  /** Objectives held in a row, and how many runs there were. */
  readonly runs: number;
  readonly runTurns: number;
  /** Moves that served an objective other than the one held, by the objective they served. */
  readonly elsewhere: Record<Objective, number>;
}

export function emptyTally(): ShadowTally {
  const held = Object.fromEntries(
    OBJECTIVES.map((o) => [o, { turns: 0, served: 0 }]),
  ) as ShadowTally['held'];
  const elsewhere = Object.fromEntries(OBJECTIVES.map((o) => [o, 0])) as ShadowTally['elsewhere'];
  return { held, runs: 0, runTurns: 0, elsewhere };
}

/** Folds a fight's turns into the tally (only fighters' own turns, each with its objective). */
export function tallyShadow(
  tally: ShadowTally,
  { decisions, fighters }: { decisions: readonly Decision[]; fighters: readonly PlanFighter[] },
): ShadowTally {
  const turns = decisions.flatMap((d) =>
    d.phase === 'turn' && d.objective ? [{ ...d, objective: d.objective }] : [],
  );
  const held = Object.fromEntries(
    OBJECTIVES.map((o) => [o, { ...tally.held[o] }]),
  ) as ShadowTally['held'];
  const elsewhere = { ...tally.elsewhere };
  let runs = tally.runs;
  const last = new Map<string, Objective>();
  for (const d of turns) {
    const { objective } = d;
    const fighter = fighters.find((f) => f.id === d.fighterId);
    const card = fighter ? findCard(fighter, d.card) : null;
    const row = held[objective];
    row.turns += 1;
    const served = card !== null && serves(objective, card);
    row.served += served ? 1 : 0;
    if (card && !served) for (const other of servesOther(card)) elsewhere[other] += 1;
    if (last.get(d.fighterId) !== objective) runs += 1;
    last.set(d.fighterId, objective);
  }
  return { held, elsewhere, runs, runTurns: tally.runTurns + turns.length };
}
