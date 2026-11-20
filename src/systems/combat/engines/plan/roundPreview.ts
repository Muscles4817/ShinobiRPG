import { createRng } from '@/core';

import type { CombatPreviewExchange, RangeBand } from '../../contract';
import { RANGE_LABEL } from '../../rules/range';
import { cardId, findCard, type Card } from './cards';
import { bandOf } from './distance';
import { WAITS } from './forecast';
import { asRound } from './intent';
import { plannedPlay } from './priority';
import { recoveredAfter } from './recovery';
import { play } from './play';
import { opponentsOf } from './senses';
import { slotVerdict, type Chosen } from './slots';
import { fighterIn, playerOf, type PlanFighter, type PlanState, type Round } from './state';
import { stepChance } from './steps';
import { recovered } from './tiring';
import { ROUND_EXCHANGES } from './roundEnd';
import { cardLabel } from './wording';

/**
 * How the round should go, before it is fought (the plan screen's preview): what your plan plays
 * in each of the round's exchanges if the fight goes as it stands now. Your side only, foes held
 * still, so it reads nothing you can't see: your own slots by the same judgement that plays them
 * (`priority.ts`), what each costs and rests, what comes back between exchanges, and a step that
 * would likely fail taken as failing. A preview, never a promise: a slip, a daze or a foe's step
 * changes what follows.
 */

/** A step at least this likely is taken as made. */
const LIKELY = 0.5;

/** How hard a step is, in words, from its chance. */
function stepWords(chance: number): string {
  if (chance >= 0.7) return 'Likely';
  if (chance >= LIKELY) return 'Even';
  return chance >= 0.25 ? 'Hard' : 'Very hard';
}

const RANKS = ['First choice', 'Second choice', 'Third choice', 'Fourth choice', 'Fifth choice'];

function rankWords(index: number): string {
  return RANKS[index] ?? 'A later choice';
}

/** Why the plan played this: the slot it came from, and the ones above it passed over. */
function whyWords(
  self: PlanFighter,
  round: Round,
  chosen: Chosen,
): Pick<CombatPreviewExchange, 'from' | 'passed'> {
  const slots = self.loadout[bandOf(round, self)];
  const at = slots.findIndex((s) => s.card === cardId(chosen.card));
  if (at < 0) return { from: fromWords(chosen) };
  const passed = slots.slice(0, at).flatMap((slot) => {
    const verdict = slotVerdict(self, round, slot);
    const card = findCard(self, slot.card);
    return 'passed' in verdict && card
      ? [`${cardLabel(card, self)}: ${WAITS[verdict.passed]}`]
      : [];
  });
  return { from: rankWords(at), ...(passed.length > 0 ? { passed } : {}) };
}

function fromWords(chosen: Chosen): string {
  switch (chosen.why) {
    case 'emergency':
      return 'An emergency slot';
    case 'step-to':
      return 'Fight at: before your slots';
    case 'charge':
      return 'Readying to make for where you fight';
    case 'improvised':
    case 'looking':
      return 'Nothing slotted could play';
    default:
      return 'Your plan';
  }
}

/** The preview's dice: fixed, so the same plan always previews the same. */
const PREVIEW_SEED = 1;

/**
 * You, as playing this card leaves you: played through the engine itself (`play.ts`) with fixed
 * dice, keeping only what it did to you (its cost, a rest, clones made, a power-up), never to them.
 */
function afterPlaying(round: Round, self: PlanFighter, chosen: Chosen): PlanFighter {
  const card = chosen.card;
  if (card.kind === 'step' || finding(card)) return self;
  const turn = { actor: self, target: chosen.target, rng: createRng(PREVIEW_SEED) };
  return fighterIn(play(round, turn, card), self.id) ?? self;
}

interface Stepped {
  readonly round: Round;
  readonly note: string;
}

/** A step towards where you fight: made if it is likely, else you stay where you are. */
function stepped(round: Round, self: PlanFighter, card: Extract<Card, { kind: 'step' }>): Stepped {
  const foe = opponentsOf(round.fighters, self)[0];
  if (!foe) return { round, note: '' };
  const chance = stepChance(round, self, foe, card.direction);
  const from = bandOf(round, self);
  const to: RangeBand =
    card.direction === 'in' ? (from === 'far' ? 'mid' : 'close') : from === 'close' ? 'mid' : 'far';
  const words = stepWords(chance);
  if (chance < LIKELY)
    return {
      round,
      note: `${words}: likely fails, and you stay at ${RANGE_LABEL[from].toLowerCase()} range.`,
    };
  const { distances: _apart, ...rest } = round;
  return { round: { ...rest, range: to }, note: `${words}: you should get there.` };
}

function finding(card: Card): boolean {
  return card.kind === 'search' || card.kind === 'dispel';
}

/** A look for the hidden, taken as finding them: what you'd play next is only worth seeing then. */
function revealed(round: Round, self: PlanFighter): Stepped {
  const fighters = round.fighters.map((f) =>
    f.side !== self.side && f.hidden ? { ...f, hidden: false } : f,
  );
  return { round: { ...round, fighters }, note: 'Taken as finding them, for what follows.' };
}

function withSelf(round: Round, self: PlanFighter): Round {
  return { ...round, fighters: round.fighters.map((f) => (f.id === self.id ? self : f)) };
}

/** One exchange of the preview, and the round it leaves. */
function previewed(
  round: Round,
  state: PlanState,
  n: number,
): { round: Round; said: CombatPreviewExchange } {
  const self = round.fighters.find((f) => f.isPlayer)!;
  const chosen = plannedPlay(self, round);
  const played = afterPlaying(round, self, chosen);
  const step = chosen.card.kind === 'step' ? stepped(round, played, chosen.card) : null;
  const found = finding(chosen.card) ? revealed(round, self) : null;
  const moved = withSelf(found?.round ?? step?.round ?? round, played);
  // What comes back between exchanges: chakra, breath, and resting techniques an exchange nearer.
  const back = { ...played, ...recovered(played, state) };
  const next = recoveredAfter({ ...withSelf(moved, back), number: round.number + 1 });
  const said: CombatPreviewExchange = {
    exchange: n,
    play: cardLabel(chosen.card, self),
    ...whyWords(self, round, chosen),
    ...(step?.note ? { note: step.note } : {}),
    ...(found ? { note: found.note } : {}),
  };
  return { round: next, said };
}

/** An exchange with only the passing-over not said already, so the same list isn't read twice. */
function onlyNew(
  said: CombatPreviewExchange,
  before: CombatPreviewExchange | undefined,
): CombatPreviewExchange {
  if (!said.passed || !before?.passed) return said;
  const fresh = said.passed.filter((why) => !before.passed?.includes(why));
  const { passed: _all, ...rest } = said;
  const asBefore = fresh.length < said.passed.length ? { passedAsBefore: true as const } : {};
  return { ...rest, ...(fresh.length > 0 ? { passed: fresh } : {}), ...asBefore };
}

/** What your plan should play in each exchange of the round, as the fight stands now. */
export function roundPreview(state: PlanState): CombatPreviewExchange[] {
  if (!playerOf(state)) return [];
  const told: CombatPreviewExchange[] = [];
  let round = asRound(state);
  let previous: CombatPreviewExchange | undefined;
  for (let n = 1; n <= ROUND_EXCHANGES; n++) {
    const next = previewed(round, state, n);
    told.push(onlyNew(next.said, previous));
    previous = next.said;
    round = next.round;
  }
  return told;
}
