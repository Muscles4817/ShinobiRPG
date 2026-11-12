import { findCard, fitsBand, type Card } from '@/systems/combat/engines/plan/cards';
import { isOpen } from '@/systems/combat/engines/plan/finishers';
import { techniqueIncoming, avoidOdds } from '@/systems/combat/engines/plan/avoid';
import type { CardId, PlanFighter, PlanState, Round } from '@/systems/combat/engines/plan/state';
import { cardWorth } from '@/systems/combat/engines/plan/worth';
import { conditionResist } from '@/systems/combat/rules/avoidance';
import { effortOf } from '@/systems/combat/rules/breath';
import { searchChance } from '@/systems/combat/rules/conditions';
import { LETHAL_SCALE, strikesToKill } from '@/systems/combat/rules/lethal';
import { RANGE_BANDS, type RangeBand } from '@/systems/combat/rules/range';

import { beamSearch, type Decision, type Planner } from './planners';
import { Sim } from './sim';

/**
 * A lightweight approximate forward model (design Part 7, "the forward model is an abstract
 * exchange"): expected values from the engine's own pure reckonings, no Rng, no exchange.
 *  - What a card does to the foe: `cardWorth` (`worth.ts`: the avoid roll the foe would make
 *    times the gap-formula hit, a little less for the cost), with the foe's condition and the
 *    user's concealment laid on the fighters, so a killing blow from hiding and a slip-free
 *    finisher on a dazed foe read through the same `avoidOdds`; a killing blow that strikes to
 *    kill is scaled by `LETHAL_SCALE`.
 *  - What it leaves behind: the odds a daze or pin takes hold (reaches × not resisted, from
 *    `avoidOdds` and `conditionResist`); a conceal held until the foe's Search finds it
 *    (`searchChance`); a step moves the distance.
 *  - The foe's reply: its announced card first, then its best attack by `cardWorth`, lost to a
 *    daze and blind to a hidden user.
 * It ignores ready defences, counters, clones, summons, rows, breath and everything else; that is
 * what "approximate" costs, and the comparison measures it.
 */

interface AState {
  readonly me: PlanFighter;
  readonly foe: PlanFighter;
  readonly band: RangeBand;
  /** Odds the foe is open (dazed or held) during this exchange. */
  readonly open: number;
  /** Odds I'm hidden from the foe during this exchange. */
  readonly hidden: number;
  readonly chakra: number;
  readonly foeHealth: number;
  readonly myHealth: number;
  /** The foe's card this exchange (its telegraph at the root), else its best. */
  readonly foeCard: CardId | null;
}

const ENDED = 150;
/** Share of the foe's blows an Evade or a Brace keeps off, roughly. */
const COMMIT_SCALE: Readonly<Record<string, number>> = { evade: 0.45, brace: 0.6 };
/** Share of a full tank a Gather brings back (`rules/gather.ts`: a fifth). */
const GATHER_SHARE = 0.2;

const sketch = (fighters: PlanFighter[], band: RangeBand): Round => ({
  number: 1,
  fighters,
  range: band,
  lines: [],
  seen: {},
  intents: {},
});

const asOpen = (f: PlanFighter): PlanFighter => (isOpen(f) ? f : { ...f, stunned: 1 });
const asSteady = (f: PlanFighter): PlanFighter => ({ ...f, stunned: 0, openUntil: undefined });
const asHidden = (f: PlanFighter, h: boolean): PlanFighter => ({ ...f, hidden: h });

function stepTo(band: RangeBand, direction: 'in' | 'back'): RangeBand {
  const i = RANGE_BANDS.indexOf(band) + (direction === 'in' ? -1 : 1);
  return RANGE_BANDS[Math.max(0, Math.min(RANGE_BANDS.length - 1, i))]!;
}

/** What one card does to the foe when it reaches them, for given conditions. */
function harm(card: Card, me: PlanFighter, foe: PlanFighter, band: RangeBand): number {
  const w = cardWorth(me, foe, card, { band, fighters: [me, foe] }) ?? 0;
  if (card.kind !== 'jutsu') return w;
  const killing = strikesToKill(card.technique, {
    unseen: me.hidden,
    open: isOpen(foe),
  });
  return killing ? w * LETHAL_SCALE : w;
}

/** Odds a card's daze or pin takes hold on the foe. */
function holds(card: Card, me: PlanFighter, foe: PlanFighter, band: RangeBand): number {
  if (card.kind !== 'jutsu') return 0;
  const effect = card.technique.effects.find((e) => e.verb === 'daze' || e.verb === 'pin');
  if (!effect) return 0;
  const incoming = techniqueIncoming(me, foe, card.technique, sketch([me, foe], band));
  const reaches = incoming ? 1 - avoidOdds(sketch([me, foe], band), incoming) : 0;
  return reaches * (1 - conditionResist(me, foe, { technique: card.technique, effect }));
}

const conceals = (card: Card) =>
  card.kind === 'jutsu' && card.technique.effects.some((e) => e.verb === 'conceal');
const isAttack = (card: Card) => ['jutsu', 'strike', 'throw'].includes(card.kind);

/** Expected harm over the four (open, hidden) cases. */
function mixed(s: AState, f: (me: PlanFighter, foe: PlanFighter) => number): number {
  let total = 0;
  for (const o of [true, false]) {
    for (const h of [true, false]) {
      const p = (o ? s.open : 1 - s.open) * (h ? s.hidden : 1 - s.hidden);
      if (p > 0) total += p * f(asHidden(s.me, h), o ? asOpen(s.foe) : asSteady(s.foe));
    }
  }
  return total;
}

function affordable(me: PlanFighter, card: Card, chakra: number): boolean {
  if (card.kind !== 'jutsu') return true;
  const e = effortOf(me, card.technique);
  return e.pool !== 'chakra' || e.amount <= chakra;
}

const STRIKE: Card = { kind: 'strike' };

/** The foe's best attack card at a distance, by its own reckoning. */
function foeBest(s: AState, band: RangeBand): Card | null {
  const cards: Card[] = [
    STRIKE,
    { kind: 'throw' },
    ...s.foe.techniques.map((t) => ({ kind: 'jutsu' as const, technique: t })),
  ];
  let best: Card | null = null;
  let bestW = 0;
  for (const c of cards) {
    if (!fitsBand(c, band)) continue;
    if (c.kind === 'jutsu' && c.technique.needsTarget === 'open') continue;
    const w = cardWorth(s.foe, s.me, c, { band, fighters: [s.me, s.foe] }) ?? 0;
    if (w > bestW) {
      bestW = w;
      best = c;
    }
  }
  return best;
}

export interface Step {
  readonly next: AState;
  readonly dealt: number;
  readonly taken: number;
}

/** One exchange in the model: my card, then the foe's reply. */
export function stepModel(s: AState, id: CardId): Step {
  let card = findCard(s.me, id) ?? STRIKE;
  let band = s.band;
  let dealt = 0;
  let open = 0;
  let hidden = s.hidden;
  let chakra = s.chakra;
  let shield = 1;
  if (isAttack(card) && (!fitsBand(card, band) || !affordable(s.me, card, chakra))) card = STRIKE;
  if (card.kind === 'step') band = stepTo(band, card.direction);
  else if (card.kind === 'gather')
    chakra = Math.min(s.me.maxChakra, chakra + s.me.maxChakra * GATHER_SHARE);
  else if (COMMIT_SCALE[card.kind]) shield = COMMIT_SCALE[card.kind]!;
  else if (isAttack(card) && fitsBand(card, band)) {
    const c = card;
    const finisher = c.kind === 'jutsu' && c.technique.needsTarget === 'open';
    dealt = finisher
      ? s.open * harm(c, asHidden(s.me, false), asOpen(s.foe), band) +
        (1 - s.open) * harm(STRIKE, s.me, asSteady(s.foe), band)
      : mixed(s, (me, foe) => harm(c, me, foe, band));
    open = mixed(s, (me, foe) => holds(c, me, foe, band));
    if (c.kind === 'jutsu')
      chakra -=
        effortOf(s.me, c.technique).pool === 'chakra' ? effortOf(s.me, c.technique).amount : 0;
    hidden = conceals(c) ? 1 - searchChance(s.foe, asHidden(s.me, true)) : 0;
  }
  if (card.kind !== 'jutsu' || !conceals(card)) {
    hidden =
      card.kind === 'step' || !isAttack(card)
        ? hidden * (1 - searchChance(s.foe, asHidden(s.me, true)))
        : hidden;
  }
  // The foe's reply: its telegraph at the root, else its best attack where it now stands.
  const telegraph = s.foeCard ? findCard(s.foe, s.foeCard) : null;
  const reply =
    telegraph && isAttack(telegraph) && fitsBand(telegraph, band) ? telegraph : foeBest(s, band);
  const foeHits = reply
    ? (cardWorth(s.foe, asHidden(s.me, false), reply, { band, fighters: [s.me, s.foe] }) ?? 0)
    : 0;
  const taken = foeHits * (1 - s.open) * (1 - s.hidden) * shield;
  if (!reply) band = stepTo(band, 'in');
  return {
    dealt,
    taken,
    next: {
      ...s,
      band,
      open,
      hidden,
      chakra,
      foeHealth: s.foeHealth - dealt,
      myHealth: s.myHealth - taken,
      foeCard: null,
    },
  };
}

function rootModel(start: PlanState, selfId: string): AState {
  const me = start.fighters.find((f) => f.id === selfId)!;
  const foes = start.fighters.filter((f) => f.side !== me.side && f.health > 0 && !f.shadowOf);
  const foe = foes.sort((a, b) => b.maxHealth - a.maxHealth)[0] ?? foes[0]!;
  return {
    me,
    foe,
    band: start.range,
    open: isOpen(foe) ? 1 : 0,
    hidden: me.hidden ? 1 : 0,
    chakra: me.chakra,
    foeHealth: foe.health,
    myHealth: me.health,
    foeCard: start.intents[foe.id] ?? null,
  };
}

/** The value of an outcome in the model, as `beam.value` reckons a real one. */
function worthOf(root: AState, end: AState, ownHurt: number): number {
  const dealt = root.foeHealth - Math.max(0, end.foeHealth);
  const taken = root.myHealth - Math.max(0, end.myHealth);
  const ended = end.foeHealth <= 0 ? ENDED : end.myHealth <= 0 ? -ENDED : 0;
  return dealt - ownHurt * taken + ended;
}

export interface ModelRun {
  evals: number;
}

/** The default plan in the model: greedy, the card with the best single exchange. */
function greedy(s: AState, actions: readonly CardId[], run: ModelRun): CardId {
  let best = actions[0]!;
  let bestV = -Infinity;
  for (const a of actions) {
    run.evals++;
    const st = stepModel(s, a);
    const v = st.dealt - st.taken;
    if (v > bestV) {
      bestV = v;
      best = a;
    }
  }
  return best;
}

/** Plays a sequence then greedy to the horizon, in the model. */
export function modelValue(
  root: AState,
  sequence: readonly CardId[],
  o: { readonly horizon: number; readonly actions: readonly CardId[] },
  run: ModelRun,
): number {
  let s = root;
  for (let k = 0; k < o.horizon; k++) {
    if (s.foeHealth <= 0 || s.myHealth <= 0) break;
    const id = k < sequence.length ? sequence[k]! : greedy(s, o.actions, run);
    run.evals++;
    s = stepModel(s, id).next;
  }
  return worthOf(root, s, 1);
}

/** Every first card's model value (its best continuation to `depth`), best first. */
export function modelRanking(
  start: PlanState,
  selfId: string,
  o: {
    readonly depth: number;
    readonly first: readonly CardId[];
    readonly actions: readonly CardId[];
  },
  run: ModelRun,
): { first: CardId; value: number; sequence: CardId[] }[] {
  const root = rootModel(start, selfId);
  const grow = (prefix: CardId[]): CardId[][] =>
    prefix.length === o.depth ? [prefix] : o.actions.flatMap((a) => grow([...prefix, a]));
  return o.first
    .map((a) => {
      let best = { value: -Infinity, sequence: [a] };
      for (const seq of grow([a])) {
        const v = modelValue(root, seq, { horizon: o.depth, actions: o.actions }, run);
        if (v > best.value) best = { value: v, sequence: seq };
      }
      return { first: a, ...best };
    })
    .sort((x, y) => y.value - x.value);
}

/** Decides by the approximate model alone. */
export const approxPlanner =
  (o: { readonly depth: number }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = new Sim(start, selfId, { share: true, seedBase: 1, ownHurt: 1 });
    const run = { evals: 0 };
    const ranked = modelRanking(
      start,
      selfId,
      { depth: o.depth, first: s.first, actions: s.actions },
      run,
    );
    const best = ranked[0]!;
    const d: Decision = {
      first: best.first,
      value: best.value,
      exchanges: 0,
      evals: run.evals,
      ms: performance.now() - began,
      sequence: best.sequence,
    };
    return d;
  };

/**
 * Hybrid: the model ranks the first cards and keeps the best `keep`; the real engine (depth 2,
 * every second card, prefix sharing) decides among them.
 */
export const hybridPlanner =
  (o: { readonly keep: number; readonly rollouts: number; readonly depth?: number }): Planner =>
  (start, selfId) => {
    const began = performance.now();
    const s = new Sim(start, selfId, { share: true, seedBase: 1, ownHurt: 1 });
    const run = { evals: 0 };
    const ranked = modelRanking(
      start,
      selfId,
      { depth: o.depth ?? 2, first: s.first, actions: s.actions },
      run,
    );
    const firsts = ranked.slice(0, o.keep).map((r) => r.first);
    const deep = beamSearch(s, { depth: 2, width: o.keep, rollouts: o.rollouts }, firsts);
    const best = deep[0]!;
    return {
      first: best.sequence[0]!,
      value: best.value,
      exchanges: s.exchanges,
      evals: run.evals,
      ms: performance.now() - began,
      sequence: best.sequence,
    };
  };
