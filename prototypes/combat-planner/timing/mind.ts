import {
  isReaction,
  kitCards,
  cardId,
  findCard,
  type Card,
} from '@/systems/combat/engines/plan/cards';
import { bandOf } from '@/systems/combat/engines/plan/distance';
import { asRound } from '@/systems/combat/engines/plan/intent';
import { plannedPlay } from '@/systems/combat/engines/plan/priority';
import { opponentsOf } from '@/systems/combat/engines/plan/senses';
import { fromSlot } from '@/systems/combat/engines/plan/slots';
import type { CardId, PlanFighter, PlanState } from '@/systems/combat/engines/plan/state';
import { cardWorth } from '@/systems/combat/engines/plan/worth';
import { alive } from '@/systems/combat/rules/body';
import { RANGE_BANDS } from '@/systems/combat/rules/range';
import { statTier, type StatGrade } from '@/systems/stats';

import { holdsNow, makes, needs } from '../perf/goap';
import { Model, sideOf } from './model';

/**
 * ONE planner, scaled by parameters. Every fighter, dull or sharp, runs this same search:
 * candidate sequences of its own cards (singletons by a cheap prior, then GOAP enabling chains),
 * each scored in the real exchange over a few seeds, on the fight as that mind believes it. What
 * changes with the mind is only how much of that it does and how well it models the other side.
 *
 * - `firstK`: single first cards scored, best by a prior that costs no exchange (the engine's
 *   own pick now first, then attacks by `cardWorth`, then the rest in kit order).
 * - `chain`: how long an enabling chain it proposes: 0 none (each card then its default plan),
 *   1 pairs, 2 triples. Read per chain from the better of intellect and the expertise of the art
 *   the chain is in (`expertise`), so a taijutsu master sees a taijutsu pair with a dull mind.
 * - `widthOne`: the best first card is also extended by every card (the safety net for two-card
 *   ideas the schema has no fact for).
 * - `rollouts`, `horizon`: seeds and exchanges each sequence is scored over.
 * - `blur`: how wrong its read of others' attributes is (a fixed misjudgement for the fight, up
 *   to ±blur of each attribute).
 * - `telegraph`: whether it reads the foes' announced next card (only the player's side gets one).
 */

export interface MindParams {
  readonly grade: StatGrade;
  readonly firstK: number;
  readonly chain: 0 | 1 | 2;
  readonly widthOne: boolean;
  readonly rollouts: number;
  readonly horizon: number;
  readonly blur: number;
  readonly telegraph: boolean;
  /**
   * During the round, past the plan's first step: `default` keeps the plan (its sequence, then
   * the default plan it was scored with) unless the reactive checks invalidate it; `warm`
   * re-scores the plan's tail and its top alternatives each exchange (no fresh candidates).
   */
  readonly between?: 'default' | 'warm';
}

/**
 * Ladder v2, after the first runs: horizon 2 at every tier (longer horizons kite, and cost),
 * pairs from C (triples bought nothing), the sharp tiers re-score their plan each exchange.
 */
export const LADDER_V2: Readonly<Record<StatGrade, MindParams>> = {
  E: {
    grade: 'E',
    firstK: 3,
    chain: 0,
    widthOne: false,
    rollouts: 2,
    horizon: 2,
    blur: 0.3,
    telegraph: false,
    between: 'default',
  },
  D: {
    grade: 'D',
    firstK: 4,
    chain: 0,
    widthOne: false,
    rollouts: 3,
    horizon: 2,
    blur: 0.2,
    telegraph: true,
    between: 'default',
  },
  C: {
    grade: 'C',
    firstK: 5,
    chain: 1,
    widthOne: false,
    rollouts: 4,
    horizon: 2,
    blur: 0.1,
    telegraph: true,
    between: 'default',
  },
  B: {
    grade: 'B',
    firstK: 6,
    chain: 1,
    widthOne: false,
    rollouts: 6,
    horizon: 2,
    blur: 0.05,
    telegraph: true,
    between: 'warm',
  },
  A: {
    grade: 'A',
    firstK: 8,
    chain: 1,
    widthOne: false,
    rollouts: 8,
    horizon: 2,
    blur: 0,
    telegraph: true,
    between: 'warm',
  },
  S: {
    grade: 'S',
    firstK: 99,
    chain: 1,
    widthOne: true,
    rollouts: 12,
    horizon: 2,
    blur: 0,
    telegraph: true,
    between: 'warm',
  },
};

export const GRADES: readonly StatGrade[] = ['E', 'D', 'C', 'B', 'A', 'S'];

/** The ladder: what each intellect grade's mind does. */
export const LADDER: Readonly<Record<StatGrade, MindParams>> = {
  E: {
    grade: 'E',
    firstK: 3,
    chain: 0,
    widthOne: false,
    rollouts: 2,
    horizon: 2,
    blur: 0.3,
    telegraph: false,
  },
  D: {
    grade: 'D',
    firstK: 4,
    chain: 0,
    widthOne: false,
    rollouts: 3,
    horizon: 2,
    blur: 0.2,
    telegraph: true,
  },
  C: {
    grade: 'C',
    firstK: 5,
    chain: 1,
    widthOne: false,
    rollouts: 4,
    horizon: 2,
    blur: 0.1,
    telegraph: true,
  },
  B: {
    grade: 'B',
    firstK: 6,
    chain: 1,
    widthOne: false,
    rollouts: 6,
    horizon: 2,
    blur: 0.05,
    telegraph: true,
  },
  A: {
    grade: 'A',
    firstK: 8,
    chain: 1,
    widthOne: true,
    rollouts: 8,
    horizon: 2,
    blur: 0,
    telegraph: true,
  },
  S: {
    grade: 'S',
    firstK: 99,
    chain: 2,
    widthOne: true,
    rollouts: 12,
    horizon: 3,
    blur: 0,
    telegraph: true,
  },
};

/**
 * Ladder v3, after v2's tier runs: re-scoring every exchange on few seeds (B, r6) did worse than
 * keeping the plan's default continuation, so only the sharpest tier re-scores, and on more seeds.
 */
export const LADDER_V3: Readonly<Record<StatGrade, MindParams>> = {
  ...LADDER_V2,
  B: { ...LADDER_V2.B, between: 'default' },
  A: { ...LADDER_V2.A, between: 'default' },
  S: { ...LADDER_V2.S, rollouts: 16 },
};

/** The perf study's recommended setting, for comparison (GOAP pairs r8, every first card). */
export const PERF_GOAP: MindParams = {
  grade: 'A',
  firstK: 99,
  chain: 1,
  widthOne: false,
  rollouts: 8,
  horizon: 2,
  blur: 0,
  telegraph: true,
};

const gradeOrder = (g: StatGrade) => GRADES.indexOf(g);
const better = (a: StatGrade, b: StatGrade) => (gradeOrder(a) >= gradeOrder(b) ? a : b);

/** The art a card is played in (none for steps, defences, gathering, tools). */
export function artOf(card: Card): string | null {
  switch (card.kind) {
    case 'jutsu':
      return card.technique.discipline ?? null;
    case 'strike':
      return 'taijutsu';
    case 'throw':
      return 'kenjutsu';
    default:
      return null;
  }
}

function artGrade(self: PlanFighter, art: string | null): StatGrade {
  if (art === null) return 'E';
  const v = (self.attributes as unknown as Record<string, number | undefined>)[art];
  return v === undefined ? 'E' : statTier(v).grade;
}

/** Every card the fighter could play at any distance (no ready defences), as `forward.actionsOf`. */
export function actionsOf(fighter: PlanFighter): CardId[] {
  const ids = RANGE_BANDS.flatMap((band) =>
    kitCards(fighter, band)
      .filter((c) => !isReaction(c))
      .map(cardId),
  );
  return [...new Set(ids)];
}

/** The card the engine itself would play now: a foe's standing intent, else the default plan's. */
export function enginePick(state: PlanState, self: PlanFighter): CardId | null {
  if (sideOf(self) === 'enemy') {
    const id = state.intents[self.id];
    if (id !== undefined) return id;
  }
  try {
    return cardId(plannedPlay(self, asRound(state)).card);
  } catch {
    return null;
  }
}

/** First cards in prior order: the engine's pick, attacks by worth, then the rest. */
export function priorOrder(
  state: PlanState,
  self: PlanFighter,
  first: readonly CardId[],
): CardId[] {
  const pick = enginePick(state, self);
  const foes = opponentsOf(state.fighters, self).filter(alive);
  const foe = foes[0];
  const band = bandOf(state, self);
  const worth = (id: CardId) => {
    const card = findCard(self, id);
    if (!card || !foe) return null;
    return cardWorth(self, foe, card, { band, fighters: state.fighters });
  };
  const scored = first.map((id, i) => ({ id, i, w: id === pick ? Infinity : worth(id) }));
  scored.sort((a, b) => {
    const wa = a.w ?? -1;
    const wb = b.w ?? -1;
    return wb !== wa ? wb - wa : a.i - b.i;
  });
  return scored.map((s) => s.id);
}

/** What a mind believes of the others: their attributes off by a fixed amount for the fight. */
export function blurred(
  state: PlanState,
  selfId: string,
  blur: number,
  fightSeed: number,
): PlanState {
  if (blur === 0) return state;
  return {
    ...state,
    fighters: state.fighters.map((f) => {
      if (f.id === selfId) return f;
      const attributes = Object.fromEntries(
        Object.entries(f.attributes).map(([k, v]) => [
          k,
          typeof v === 'number'
            ? Math.max(0, v * (1 + blur * (2 * hash01(fightSeed, selfId, f.id + k) - 1)))
            : v,
        ]),
      ) as PlanFighter['attributes'];
      return { ...f, attributes };
    }),
  };
}

function hash01(seed: number, a: string, b: string): number {
  let h = 2166136261 ^ seed;
  for (const ch of a + '/' + b) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export interface Scored {
  readonly sequence: readonly CardId[];
  readonly value: number;
}

export interface Planned {
  readonly best: Scored;
  readonly ranked: readonly Scored[];
  /** Facts each step after the first relied on (made by the steps before it), by index. */
  readonly relies: readonly (readonly string[])[];
  readonly exchanges: number;
  readonly ms: number;
  readonly candidates: number;
  /** Expected health of each side after the first step. */
  readonly expect: { readonly own: number; readonly them: number };
}

export interface PlanRequest {
  readonly state: PlanState;
  readonly selfId: string;
  readonly params: MindParams;
  /** Expertise raises a chain's depth by the art it is in. */
  readonly expertise: boolean;
  readonly fightSeed: number;
  /** Extra sequences to score whatever the generator says (a warm start's survivors). */
  readonly also?: readonly (readonly CardId[])[];
  /** Score only `also` (and the engine's pick), not a fresh candidate set. */
  readonly onlyAlso?: boolean;
}

/** The chain depth a chain gets, from the mind and, with expertise, the art it is in. */
function chainFor(self: PlanFighter, p: PlanRequest, cards: readonly Card[]): number {
  if (!p.expertise) return p.params.chain;
  const arts = new Set(cards.map(artOf).filter((a): a is string => a !== null));
  if (arts.size !== 1) return p.params.chain;
  const art = [...arts][0]!;
  return Math.max(p.params.chain, LADDER_V2[better(p.params.grade, artGrade(self, art))].chain);
}

/** GOAP chains of length 2 and 3 the mind may propose, with the facts each step relies on. */
function chains(
  state: PlanState,
  self: PlanFighter,
  p: PlanRequest,
  sets: { readonly first: readonly CardId[]; readonly actions: readonly CardId[] },
): { seq: CardId[]; relies: string[][] }[] {
  const now = holdsNow(state, self);
  const out: { seq: CardId[]; relies: string[][] }[] = [];
  const card = (id: CardId) => findCard(self, id);
  for (const a of sets.first) {
    const ca = card(a);
    if (!ca) continue;
    const madeA = [...makes(ca, state.range)].filter((f) => !now.has(f));
    for (const b of sets.actions) {
      const cb = card(b);
      if (!cb) continue;
      const usedA = enabledBy(cb, madeA, now);
      if (usedA && chainFor(self, p, [ca, cb]) >= 1) out.push({ seq: [a, b], relies: [[], usedA] });
      // Triples: a, b, c where c is enabled by what a and b made (b may itself be enabled or a step).
      if (chainFor(self, p, [ca, cb]) < 2) continue;
      const madeAB = [...new Set([...madeA, ...makes(cb, state.range)])].filter((f) => !now.has(f));
      const madeB = [...makes(cb, state.range)].filter((f) => !now.has(f) && !madeA.includes(f));
      if (madeB.length === 0 && !usedA) continue;
      for (const c of sets.actions) {
        const cc = card(c);
        if (!cc) continue;
        const usedAB = enabledBy(cc, madeAB, now);
        if (!usedAB || !usedAB.some((f) => madeB.includes(f))) continue;
        if (chainFor(self, p, [ca, cb, cc]) < 2) continue;
        out.push({ seq: [a, b, c], relies: [[], usedA ?? [], usedAB] });
      }
    }
  }
  return out;
}

/** The new facts a card's precondition uses, when the made facts (and what holds) meet it. */
function enabledBy(card: Card, made: readonly string[], now: ReadonlySet<string>): string[] | null {
  for (const way of needs(card)) {
    if (way.every((f) => made.includes(f) || now.has(f)) && way.some((f) => made.includes(f))) {
      return way.filter((f) => made.includes(f));
    }
  }
  return null;
}

/** The planner: the best sequence of the fighter's cards, as this mind sees it. */
export function plan(p: PlanRequest): Planned {
  const began = performance.now();
  const real = p.state.fighters.find((f) => f.id === p.selfId)!;
  let believed = blurred(p.state, p.selfId, p.params.blur, p.fightSeed);
  if (!p.params.telegraph && sideOf(real) === 'player') believed = { ...believed, intents: {} };
  const self = believed.fighters.find((f) => f.id === p.selfId)!;
  const model = new Model(believed, p.selfId, { seedBase: 1, ownHurt: 1 });
  const actions = actionsOf(self);
  const now = asRound(believed);
  const first = actions.filter((id) => fromSlot(self, now, { card: id }) !== null);
  const keyed = new Map<
    string,
    { seq: readonly CardId[]; relies: readonly (readonly string[])[] }
  >();
  const add = (
    seq: readonly CardId[],
    relies: readonly (readonly string[])[] = seq.map(() => []),
  ) => {
    if (seq.length > 0 && !keyed.has(seq.join('|'))) keyed.set(seq.join('|'), { seq, relies });
  };
  const pick = enginePick(p.state, real);
  if (pick && first.includes(pick)) add([pick]);
  if (!p.onlyAlso) {
    for (const id of priorOrder(believed, self, first).slice(0, p.params.firstK)) add([id]);
    for (const c of chains(believed, self, p, { first, actions })) add(c.seq, c.relies);
  }
  for (const seq of p.also ?? []) if (seq.length > 0 && first.includes(seq[0]!)) add(seq);
  if (keyed.size === 0 && first.length > 0) add([first[0]!]);
  const horizon = (len: number) => Math.max(p.params.horizon, len);
  const scored = [...keyed.values()].map((c) => ({
    sequence: c.seq,
    value: model.score(c.seq, horizon(c.seq.length), p.params.rollouts),
    relies: c.relies,
  }));
  if (p.params.widthOne && scored.length > 0 && !p.onlyAlso) {
    const top = [...scored].sort((a, b) => b.value - a.value)[0]!.sequence[0]!;
    for (const b of actions) {
      const sequence = [top, b];
      if (keyed.has(sequence.join('|'))) continue;
      keyed.set(sequence.join('|'), { seq: sequence, relies: [[], []] });
      scored.push({
        sequence,
        value: model.score(sequence, horizon(2), p.params.rollouts),
        relies: [[], []],
      });
    }
  }
  scored.sort((a, b) => b.value - a.value);
  const best = scored[0] ?? { sequence: [], value: 0, relies: [] };
  const expect =
    best.sequence.length > 0
      ? model.expectedAfterFirst(best.sequence[0]!, p.params.rollouts)
      : { own: 0, them: 0 };
  return {
    best: { sequence: best.sequence, value: best.value },
    ranked: scored.map(({ sequence, value }) => ({ sequence, value })),
    relies: best.relies,
    exchanges: model.exchanges,
    ms: performance.now() - began,
    candidates: scored.length,
    expect,
  };
}

/**
 * The light decision of a mind: the same planner, singletons only, a few first cards, a few
 * seeds. It reads and believes exactly as its full plan does.
 */
export function lightOf(params: MindParams): MindParams {
  return {
    ...params,
    firstK: Math.min(4, params.firstK),
    chain: 0,
    widthOne: false,
    rollouts: Math.max(2, Math.round(params.rollouts / 4)),
    horizon: 2,
  };
}
