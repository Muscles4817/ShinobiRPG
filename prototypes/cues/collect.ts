import { createRng } from '@/core';
import { createPlanEngine } from '@/systems/combat';
import type { RangeBand } from '@/systems/combat/contract';
import { findCard, type Card } from '@/systems/combat/engines/plan/cards';
import { bandOf } from '@/systems/combat/engines/plan/distance';
import { decode, type PlanFighter, type PlanState } from '@/systems/combat/engines/plan/state';
import { hasPerk } from '@/systems/combat/rules/body';
import { isBodyMove } from '@/systems/combat/rules/breath';
import { castMember, type CastId } from '@/test/bench/matrixCast';
import { toSetup, type Scale } from '@/test/bench/fighters';

import { inView } from './infer';

/**
 * Decision points from real watched fights in the Plan & Watch engine. Before each exchange,
 * for each foe: the card it has announced (`state.intents`, what today's telegraph tells the
 * truth about) and what the player has seen of it so far. The reverse too: what the player
 * plays that exchange (their `streak` after it), and what the foe had seen of the player.
 * Each observer's memory (cards seen, how often) is kept here, from plays they had in view.
 */

export type Direction = 'player-reads-foe' | 'foe-reads-player';

export interface DecisionPoint {
  readonly fight: string;
  readonly scale: Scale;
  readonly exchange: number;
  readonly direction: Direction;
  readonly observer: PlanFighter;
  readonly actor: PlanFighter;
  readonly truth: Card;
  readonly band: RangeBand;
  readonly seenCards: readonly string[];
  readonly habits: Readonly<Record<string, number>>;
  readonly insight: boolean;
  readonly observerHidden: boolean;
  readonly actorConfused: boolean;
  readonly fieldUp: boolean;
}

const MAX_EXCHANGES = 60;

type Memory = Map<string, Map<string, number>>;

function remember(memory: Memory, key: string, id: string) {
  const counts = memory.get(key) ?? new Map<string, number>();
  counts.set(id, (counts.get(id) ?? 0) + 1);
  memory.set(key, counts);
}

/** What an observer has learnt of an actor, as the inference reads it. */
function learnt(memory: Memory, observerId: string, actorId: string) {
  const counts = memory.get(`${observerId}>${actorId}`) ?? new Map<string, number>();
  return { seenCards: [...counts.keys()], habits: Object.fromEntries(counts) };
}

/**
 * What a fighter played this exchange: a technique whose use count rose (a hold-off fires its
 * technique outside the turn, so the streak misses it), else the card of a new streak.
 */
function played(before: PlanFighter | undefined, after: PlanFighter | undefined): Card | null {
  if (!before || !after) return null;
  const rose = Object.entries(after.uses ?? {}).find(([id, n]) => n > (before.uses?.[id] ?? 0));
  if (rose) return findCard(after, `jutsu:${rose[0]}`);
  const s = after.streak;
  if (!s) return null;
  const same = before.streak && before.streak.card === s.card && before.streak.turns === s.turns;
  return same ? null : findCard(after, s.card);
}

/** A card as an onlooker files it: a styled strike (a body move) is seen as a strike. */
function filed(card: Card): string[] {
  if (card.kind === 'jutsu') {
    const id = `jutsu:${card.technique.id}`;
    return isBodyMove(card.technique) ? [id, 'strike'] : [id];
  }
  if (card.kind === 'item') return [`item:${card.item.id}`];
  return [card.kind === 'step' ? `step-${card.direction}` : card.kind];
}

interface Fight {
  readonly a: CastId;
  readonly b: CastId;
  readonly scale: Scale;
  readonly seed: number;
}

function point(
  key: { fight: Fight; state: PlanState; memory: Memory },
  observer: PlanFighter,
  actor: PlanFighter,
  truth: Card,
  direction: Direction,
): DecisionPoint {
  const { fight, state, memory } = key;
  return {
    fight: `${fight.a}-${fight.b}-${fight.scale}-${fight.seed}`,
    scale: fight.scale,
    exchange: state.round,
    direction,
    observer,
    actor,
    truth,
    band: bandOf(state, actor),
    ...learnt(memory, observer.id, actor.id),
    insight: hasPerk(observer, 'insight'),
    observerHidden: observer.hidden,
    actorConfused: actor.confused > 0,
    fieldUp: state.field !== undefined,
  };
}

/** One watched fight's decision points, both directions. */
export function collectFight(fight: Fight): DecisionPoint[] {
  const engine = createPlanEngine();
  const rng = createRng(fight.seed);
  let cs = engine.start(
    {
      player: toSetup(castMember(fight.a, fight.scale), 'player'),
      allies: [],
      enemies: [toSetup(castMember(fight.b, fight.scale), 'foe')],
      canFlee: false,
      watch: true,
    },
    rng,
  );
  const memory: Memory = new Map();
  const out: DecisionPoint[] = [];
  for (let n = 0; n < MAX_EXCHANGES && !engine.outcome(cs);) {
    const atTable = engine.view(cs).options.some((o) => o.id === 'begin');
    if (atTable) {
      const next = engine.act(cs, { optionId: 'begin' }, rng);
      if (!next.ok) throw new Error(next.error);
      cs = next.value;
      continue;
    }
    const before = decode(cs);
    const player = before.fighters.find((f) => f.id === 'player')!;
    const foe = before.fighters.find((f) => f.id === 'foe')!;
    const key = { fight, state: before, memory };
    const intent = before.intents.foe;
    const truth = intent === undefined ? null : findCard(foe, intent);
    if (truth && foe.stunned === 0 && player.health > 0) {
      out.push(point(key, player, foe, truth, 'player-reads-foe'));
    }
    const next = engine.act(cs, { optionId: 'next' }, rng);
    if (!next.ok) throw new Error(next.error);
    cs = next.value;
    n += 1;
    const after = decode(cs);
    const p2 = after.fighters.find((f) => f.id === 'player');
    const f2 = after.fighters.find((f) => f.id === 'foe');
    const playerPlayed = played(player, p2);
    if (playerPlayed && foe.health > 0 && player.stunned === 0) {
      out.push(point(key, foe, player, playerPlayed, 'foe-reads-player'));
    }
    const foePlayed = played(foe, f2);
    // What each saw the other play, if the other was in view as the exchange began.
    if (playerPlayed && inView(foe, player))
      filed(playerPlayed).forEach((id) => remember(memory, 'foe>player', id));
    if (foePlayed && inView(player, foe))
      filed(foePlayed).forEach((id) => remember(memory, 'player>foe', id));
  }
  return out;
}

/** Decision points over many fights. */
export function collect(fights: readonly Fight[]): DecisionPoint[] {
  return fights.flatMap(collectFight);
}
