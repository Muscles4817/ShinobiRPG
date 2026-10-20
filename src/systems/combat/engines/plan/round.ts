import type { Rng } from '@/core';

import type { CombatResult } from '../../contract';
import { alive } from '../../rules/body';
import { reachLead } from '../../rules/blades';
import { gathered } from '../../rules/chakra';
import { searchChance } from '../../rules/conditions';
import { revealOnAttack } from '../../rules/items';
import { afterUsing } from '../../rules/trumps';
import { strike } from './arms';
import { charge, step, type Charged } from './steps';
import { keepHolding } from './holding';
import { lostTurn } from './lostTurn';
import { inCover, lostToGround } from './groundPlay';
import { momentOf, SCENE_MEMORY } from './fresh';
import { cardId, isOffence, needsAim, type Card } from './cards';
import { chooseCard } from './choose';
import { cloneFollowUp } from './clones';
import { afterEmpowers } from './empower';
import { fieldAfter, lostInField, ownField } from './field';
import { intendedCard } from './intent';
import { staged } from './staging';
import { useJutsu } from './jutsu';
import { lingerAfter } from './lingering';
import { useTool } from './pouch';
import { secondWinds } from './provisions';
import { canHit, hittable } from './rows';
import { plannedPlay, type Play } from './priority';
import { readsInTheMoment } from './judgement';
import { noteAttack } from './reads';
import { bestTarget } from './targeting';
import { dispel, inSight, misfires, opponentsOf, search, startOfTurn, type Turn } from './senses';
import { intercept } from './team';
import { springTraps } from './traps';
import { aid, struggleFree } from './struggle';
import { clonesAfter } from './cloneUpkeep';
import { shroudsAfter } from './shrouds';
import { summonsAfter } from './summons';
import { plannedSummons } from './summonPlans';
import { swarmsAfter } from './swarm';
import { wearOffDaze } from './daze';
import {
  fighterIn,
  LOG_LIMIT,
  patch,
  playerOf,
  say,
  type PlanFighter,
  type PlanState,
  type Round,
} from './state';
import { tracedLine } from './sceneVoice';
import { closingLine } from './falls';
import { tell } from '../../rules/telling';

/**
 * One exchange of a planned fight: everyone acts in speed order, playing a card slotted for
 * the current distance (the player by their plan's priorities, see `priority.ts`). Footwork is
 * contested by speed; defences react on their own. A foe's trap springs as a turn begins where
 * it waits, or when a step moves the fight onto it; empowers take their price as it ends.
 */

/** Initiative the side that moved first gets in exchange 1: more than any speed gap. */
const FIRST_MOVER_LEAD = 1000;
/** How the log marks each exchange of a round: in words, since story text shows no numbers. */
const EXCHANGE_NAMES = ['First', 'Second', 'Third', 'Last'] as const;

/** Foes acting on instinct pick a target at random. */
function targetFor(foes: readonly PlanFighter[], rng: Rng) {
  return foes.length === 0 ? undefined : rng.pick(foes);
}

/**
 * Foes play their telegraphed card, or follow their instincts. They size up a foe in sight;
 * when the card can't reach them past their front row, they turn on one it can reach.
 */
function instinct(round: Round, actor: PlanFighter, rng: Rng): Play {
  const seen = opponentsOf(round.fighters, actor).filter((f) => inSight(actor, f));
  // A mind that reads the fight picks whom to go for; a dull one goes for whoever is there.
  const there = targetFor(seen, rng);
  const foe = readsInTheMoment(actor) ? bestTarget(actor, seen) : there;
  const hiddenFoe = opponentsOf(round.fighters, actor).some((f) => f.hidden);
  const moment = {
    band: round.range,
    foe,
    hiddenFoe,
    opening: round.opening ?? false,
    fieldUp: ownField(round.field, actor),
    fighters: round.fighters,
    exchange: round.number,
    ...(round.reads ? { reads: round.reads } : {}),
  };
  const card = intendedCard(actor, round.intents, round.range) ?? chooseCard(actor, moment, rng);
  if (!foe || !isOffence(card) || canHit(card, foe, round.fighters)) return { card, target: foe };
  return { card, target: targetFor(hittable(card, seen, round.fighters), rng) };
}

export function decide(fighters: readonly PlanFighter[]): CombatResult | null {
  if (!alive(playerOf({ fighters }))) return 'defeat';
  return fighters.some((f) => f.side === 'enemy' && alive(f)) ? null : 'victory';
}

/** Counts a plain strike or a step towards the fighter's usage report. */
function practise(round: Round, actor: PlanFighter, work: 'blows' | 'footwork'): Round {
  const done = fighterIn(round, actor.id)?.[work] ?? 0;
  return { ...round, fighters: patch(round.fighters, actor.id, { [work]: done + 1 }) };
}

function play(round: Round, turn: Turn, card: Card): Round {
  switch (card.kind) {
    case 'step':
      return step(
        practise(round, turn.actor, 'footwork'),
        { ...turn, target: turn.target ?? opponentsOf(round.fighters, turn.actor)[0] },
        card.direction,
      );
    case 'search':
      return search(round, turn);
    case 'dispel':
      return dispel(round, turn);
    case 'jutsu': {
      const trumpsUsed = afterUsing(turn.actor, card.technique);
      const marked = { ...round, fighters: patch(round.fighters, turn.actor.id, { trumpsUsed }) };
      return useJutsu(marked, turn, card.technique);
    }
    case 'item':
      return useTool(round, turn, card.item);
    case 'strike':
      return strike(practise(round, turn.actor, 'blows'), turn, false);
    case 'throw':
      return strike(round, turn, true);
    case 'guard':
    case 'dodge':
    case 'counter':
      return round;
  }
}

function remember(seen: Round['seen'], fighterId: string, id: string): Round['seen'] {
  const known = seen[fighterId] ?? [];
  return known.includes(id) ? seen : { ...seen, [fighterId]: [...known, id] };
}

/** Nobody in sight to attack: rather than stand idle, look for whoever is hiding. */
function unseen(round: Round, turn: Turn): Round {
  const hiding = opponentsOf(round.fighters, turn.actor).some((f) => f.hidden);
  if (hiding) return search(round, turn);
  return say(round, tell('{a} can’t find a target.', { a: turn.actor }));
}

/**
 * Attacking from smoke or a conceal gives you away, hit or miss. An illusionist stays hidden,
 * unless the one they struck at traces the illusion back (as a Search would find them).
 */
function revealed(round: Round, { actor: before, target, rng }: Turn): Round {
  const actor = fighterIn(round, before.id);
  if (!actor?.hidden) return round;
  if (!revealOnAttack(actor).hidden) {
    return { ...round, fighters: patch(round.fighters, actor.id, { hidden: false }) };
  }
  const victim = target && fighterIn(round, target.id);
  const hiding = inCover(round.ground, actor);
  if (!victim || !alive(victim) || !rng.chance(searchChance(victim, hiding))) return round;
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { hidden: false }) },
    tracedLine(momentOf(round, victim.id), victim, actor),
  );
}

/**
 * Plays a card, unless it's an attack with no one in sight (then they search instead) or
 * confusion or a field that blinds them sends it wide. Tools
 * never misfire and don't give a hidden fighter away; attacks and techniques that hurt do.
 */
function attempt(round: Round, turn: Turn, card: Card): Round {
  const { actor, target, rng } = turn;
  if (needsAim(card) && !target) return unseen(round, turn);
  if (card.kind === 'item' || !isOffence(card)) return play(round, turn, card);
  if (misfires(actor, rng)) {
    const line = tell('{a.poss} senses lie to {a.them}, and the attack goes wide.', { a: actor });
    return revealed(say(round, line), turn);
  }
  const lost = lostInField(round, actor, rng) ?? lostToGround(round, actor, rng);
  if (lost) return revealed(say(round, lost), turn);
  const charged = charge(round, turn, card);
  if (charged.stopped) return charged.round;
  const played = afterTheCast(play(charged.round, turn, card), charged);
  return cloneFollowUp(revealed(played, turn), turn, card);
}

/** Lines a charge saved for after its technique is announced (slipping through the fire). */
function afterTheCast(played: Round, { round, after }: Charged): Round {
  if (after.length === 0) return played;
  const at = round.lines.length + 1;
  return { ...played, lines: [...played.lines.slice(0, at), ...after, ...played.lines.slice(at)] };
}

/** A step that moved the fight springs any foe's trap waiting where it now stands. */
function afterStep(before: Round, after: Round, actorId: string, rng: Rng): Round {
  return after.range === before.range ? after : springTraps(after, actorId, rng, true);
}

/**
 * What a fighter plays: the player and their teammates their cards in priority order, foes on
 * instinct; but a teammate caught in a hold comes first (`struggle.ts`), whether that means
 * aiming at its caster or spending the turn pulling them free.
 */
function choosePlay(round: Round, actor: PlanFighter, rng: Rng): Play | { spent: Round } {
  const planned = actor.side === 'player' ? plannedPlay(actor, round) : instinct(round, actor, rng);
  const helping = aid(round, { actor, rng }, planned.card);
  if (helping.kind === 'spent') return { spent: helping.round };
  return helping.kind === 'strike' ? { ...planned, target: helping.at } : planned;
}

function turn(start: Round, actorId: string, rng: Rng): Round {
  const before = start.fighters.find((f) => f.id === actorId);
  // A fighter who met an attack in a clash has spent their turn already.
  if (!before || !alive(before) || decide(start.fighters) || start.acted?.includes(actorId)) {
    return start;
  }
  const sprung = springTraps(startOfTurn(start, before, rng), actorId, rng, false);
  // A channelled hold takes the turn while it holds (`holding.ts`).
  const held = keepHolding(sprung, sprung.fighters.find((f) => f.id === actorId) ?? before);
  if (held.spent) return held.round;
  const round = held.round;
  const actor = round.fighters.find((f) => f.id === actorId) ?? before;
  if (!alive(actor)) return round;
  const lost = lostTurn(round, actor);
  if (lost) return lost;
  const chosen = choosePlay(round, actor, rng);
  if ('spent' in chosen) return chosen.spent;
  const { card, target } = chosen;
  const aim = intercept(round, { actor, target, rng }, card);
  const tried = attempt(aim.round, { actor, target: aim.target, rng }, card);
  const played = afterStep(aim.round, tried, actor.id, rng);
  const noted = noteAttack(played, actor.id, card);
  const acted = [...(noted.acted ?? []), actor.id];
  const id = cardId(card);
  const turns = actor.streak?.card === id ? actor.streak.turns + 1 : 1;
  const fighters = patch(noted.fighters, actor.id, { streak: { card: id, turns } });
  return { ...noted, fighters, acted, seen: remember(noted.seen, actor.id, id), played: id };
}

/** A fighter's turn, its lines tagged for the screen (`staging.ts`). */
function stagedTurn(round: Round, id: string, rng: Rng): Round {
  return staged(round, turn(round, id, rng), id);
}

/** What an exchange carries in from the fight as it stands: reads, the field, the ground, marks. */
function carriedIn(state: PlanState): Partial<Round> {
  return {
    ...(state.reads ? { reads: state.reads } : {}),
    ...(state.field ? { field: state.field } : {}),
    ...(state.ground ? { ground: state.ground } : {}),
    ...(state.occasion ? { occasion: state.occasion } : {}),
    ...(state.mark ? { mark: state.mark } : {}),
    ...(state.foeMark ? { foeMark: state.foeMark } : {}),
    ...(state.watching ? { watching: true as const } : {}),
  };
}

/** Resolves one exchange. */
export function resolveExchange(state: PlanState, rng: Rng): PlanState {
  // Whoever moved first (the fight's opening) acts first in the first exchange.
  const ahead = state.round === 1 ? state.firstMover : undefined;
  const order = state.fighters
    .filter(alive)
    .map((f) => ({
      id: f.id,
      initiative:
        f.attributes.speed +
        rng.next() * 4 +
        (f.side === ahead ? FIRST_MOVER_LEAD : 0) +
        // A drawn blade's reach strikes first up close (`blades.ts`).
        reachLead(f, opponentsOf(state.fighters, f), state.range),
    }))
    .sort((a, b) => b.initiative - a.initiative);
  const start: Round = {
    number: state.round,
    opening: state.exchange === 0,
    fighters: [...state.fighters],
    range: state.range,
    lines: [`— ${EXCHANGE_NAMES[state.exchange] ?? 'Another'} exchange —`],
    recent: state.log.slice(-SCENE_MEMORY),
    seen: state.seen,
    intents: state.intents,
    ...carriedIn(state),
  };
  const played = order.reduce((round, { id }) => stagedTurn(round, id, rng), start);
  const kept = plannedSummons(
    summonsAfter(clonesAfter(shroudsAfter(afterEmpowers(played, state.round)))),
  );
  const end = secondWinds(lingerAfter(swarmsAfter(struggleFree(kept, rng), rng), state.round));
  const result = decide(end.fighters);
  const { field, lines: fading } = fieldAfter(end.field, state.round);
  const fighters = end.fighters.map((f) => ({
    ...wearOffDaze(f, state.round),
    sealed: Math.max(0, f.sealed - 1),
    chakra: alive(f) ? gathered(f) : f.chakra,
  }));
  const { field: _old, ...rest } = state;
  const closing = result ? [closingLine(end, result)] : fading;
  const story = [...state.log, ...end.lines, ...closing];
  const dropped = (state.logDropped ?? 0) + Math.max(0, story.length - LOG_LIMIT);
  return {
    ...rest,
    round: result ? state.round : state.round + 1,
    exchange: state.exchange + 1,
    fighters,
    range: end.range,
    seen: end.seen,
    ...(end.reads ? { reads: end.reads } : {}),
    log: story.slice(-LOG_LIMIT),
    ...(dropped > 0 ? { logDropped: dropped } : {}),
    result,
    ...(field ? { field } : {}),
  };
}
