import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { canAttackFrom, hasTrait, homeBand } from '../../rules/kit';
import { inReach, RANGE_BANDS, reachOf } from '../../rules/range';
import { coverChance } from '../../rules/team';
import { isHindering, isWounding } from '../../rules/verbs';
import type { CombatStance } from '../../teamContract';
import { findCard, isOffence, isReaction, needsAim, slotLimit, type Card } from './cards';
import { withoutLoneCombos } from './combo';
import { defaultLoadout } from './defaults';
import { canHit } from './rows';
import type { Turn } from './senses';
import { isDazed, say, type Loadout, type PlanFighter, type Round, type Slot } from './state';

/**
 * Teammates in a planned fight. Each fights by a stance: their own cards (the default plan for
 * their kit) shaped by it, played in priority order like the player's.
 *  - press: closes in when their kit can fight up close, attacks aim at the team mark;
 *  - cover: keeps a guard slotted, goes for whoever threatens the back row, and may step in
 *    front of a single attack aimed at the one they cover (`intercept`);
 *  - support: dazes, seals and confusion first (on foes not already held), to set up the rest;
 *  - hold: keeps to where their kit fights best and spares chakra, blows before jutsu.
 */

/** A teammate with no stance given: an illusionist supports, anyone else presses. */
function kitStance(f: PlanFighter): CombatStance {
  return hasTrait(f, 'illusionist') ? { kind: 'support' } : { kind: 'press' };
}

/** A teammate fights on the player's side but isn't the player. */
export function isTeammate(f: PlanFighter): boolean {
  return f.side === 'player' && !f.isPlayer;
}

function stanceOf(f: PlanFighter): CombatStance {
  return f.stance ?? kitStance(f);
}

type Shaper = (f: PlanFighter, slots: readonly Slot[]) => Slot[];

function cardOf(f: PlanFighter, slot: Slot): Card | null {
  return findCard(f, slot.card);
}

function aimed(f: PlanFighter, slots: readonly Slot[], target: Slot['target']): Slot[] {
  return slots.map((s) => {
    const card = cardOf(f, s);
    return card && needsAim(card) ? { ...s, ...(target ? { target } : {}) } : s;
  });
}

/** A slot that plays only on a condition about the fighter (heal when hurt, sense the hidden). */
function conditional(s: Slot): boolean {
  return s.when === 'low-health' || s.when === 'foe-hidden';
}

function hinders(f: PlanFighter, s: Slot): boolean {
  const card = cardOf(f, s);
  return card?.kind === 'jutsu' && isHindering(card.technique) && !isWounding(card.technique);
}

/** Conditional slots first, then hindering ones (whenever they can), then the rest. */
const supportFirst: Shaper = (f, slots) => {
  const rank = (s: Slot) => (conditional(s) ? 0 : hinders(f, s) ? 1 : 2);
  const freed = slots.map((s) => (hinders(f, s) ? { card: s.card } : s));
  return [...freed].sort((a, b) => rank(a) - rank(b));
};

/** A guard in every distance's slots, taking the last slot when they are full. */
const guarded: Shaper = (f, slots) => {
  const threat = aimed(f, slots, 'threat');
  if (threat.some((s) => s.card === 'guard')) return threat;
  return [...threat.slice(0, slotLimit(f) - 1), { card: 'guard' }];
};

function holdRank(f: PlanFighter, s: Slot): number {
  const card = cardOf(f, s);
  if (conditional(s) || card === null) return 0;
  if (card.kind === 'step' || isReaction(card)) return card.kind === 'step' ? 1 : 4;
  return card.kind === 'jutsu' ? 3 : 2;
}

/** Footwork home first, then blows, then jutsu: chakra is kept for when it's needed. */
const sparing: Shaper = (f, slots) => [...slots].sort((a, b) => holdRank(f, a) - holdRank(f, b));

const pressing: Shaper = (f, slots) => aimed(f, slots, 'marked');

function shaperFor(stance: CombatStance): Shaper {
  switch (stance.kind) {
    case 'press':
      return pressing;
    case 'cover':
      return guarded;
    case 'support':
      return supportFirst;
    case 'hold':
      return sparing;
  }
}

/**
 * Where a stance wants to fight: pressing closes in when the kit can strike up close and their
 * wounding jutsu (if any) still reach there; a caster whose jutsu don't stays at their distance.
 */
function homeFor(f: PlanFighter, stance: CombatStance): RangeBand {
  if (stance.kind !== 'press' || !canAttackFrom(f, 'close')) return homeBand(f);
  const wounding = f.techniques.filter(isWounding);
  const reachClose = wounding.some((t) => inReach(reachOf(t), 'close'));
  return wounding.length === 0 || reachClose ? 'close' : homeBand(f);
}

/** A teammate's cards for their stance. */
export function stanceLoadout(
  f: PlanFighter,
  stance: CombatStance,
  fighters: readonly PlanFighter[],
): Loadout {
  const base = defaultLoadout(withoutLoneCombos(f, fighters), fighters, {
    home: homeFor(f, stance),
    support: stance.kind === 'support',
  });
  const shape = shaperFor(stance);
  const [close, mid, far] = RANGE_BANDS.map((band) => shape(f, base[band]));
  return { close: close ?? [], mid: mid ?? [], far: far ?? [] };
}

/** Every teammate takes up their stance (from the setup, else their kit) and its cards. */
export function withStances(fighters: readonly PlanFighter[]): PlanFighter[] {
  return fighters.map((f) => {
    if (!isTeammate(f)) return f;
    const stance = stanceOf(f);
    return { ...f, stance, loadout: stanceLoadout(f, stance, fighters) };
  });
}

/** A teammate's stance in a word or two, for the fight screen. */
export function stanceStatus(f: PlanFighter, fighters: readonly PlanFighter[]): string[] {
  if (!isTeammate(f) || !alive(f)) return [];
  const stance = stanceOf(f);
  switch (stance.kind) {
    case 'press':
      return ['Pressing'];
    case 'support':
      return ['Supporting'];
    case 'hold':
      return ['Holding'];
    case 'cover': {
      const ward = fighters.find((w) => w.id === stance.covers);
      return [ward?.isPlayer ? 'Covering you' : `Covering ${ward?.name ?? 'a teammate'}`];
    }
  }
}

/** A standing teammate covering this fighter who could get in front of this card. */
function coverFor(round: Round, target: PlanFighter, card: Card): PlanFighter | undefined {
  return round.fighters.find(
    (f) =>
      f.id !== target.id &&
      f.side === target.side &&
      alive(f) &&
      !isDazed(f) &&
      f.stance?.kind === 'cover' &&
      f.stance.covers === target.id &&
      canHit(card, f, round.fighters),
  );
}

/** Who a single attack ends up aimed at, once a cover has had the chance to step in. */
export interface Aim {
  readonly round: Round;
  readonly target: PlanFighter | undefined;
}

/**
 * A single attack (not an area technique) aimed at a covered fighter: their cover may step in
 * front of it and take it instead, with their own defences.
 */
export function intercept(round: Round, turn: Turn, card: Card): Aim {
  const { actor, target, rng } = turn;
  if (!target || !isOffence(card) || !needsAim(card)) return { round, target };
  const cover = coverFor(round, target, card);
  if (!cover || !rng.chance(coverChance(cover, actor))) return { round, target };
  const ward = target.isPlayer ? 'you' : target.name;
  return { round: say(round, `${cover.name} steps in front of ${ward}.`), target: cover };
}
