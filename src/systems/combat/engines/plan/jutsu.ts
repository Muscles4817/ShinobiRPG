import type { CombatTechnique } from '../../contract';
import { alive, chakraCost, holdTurns } from '../../rules/body';
import { healAmount, techniqueDamage } from '../../rules/damage';
import { resistChance } from '../../rules/defence';
import { matchup, matchupLine } from '../../rules/elements';
import { attackKindOf } from '../../rules/kit';
import { healLine } from '../../rules/narration';
import { breakRating } from '../../rules/conditions';
import {
  confuseTurns,
  driveOf,
  hasVerb,
  isHarmful,
  profileOf,
  type EffectUse,
} from '../../rules/verbs';
import { react, type Blow } from './react';
import { opponentsOf, type Turn } from './senses';
import { conceal, sense } from './sight';
import { fighterIn, patch, say, type PlanFighter, type Round } from './state';

/**
 * Using a technique in a planned fight: pay its chakra, see whether the target saw it coming,
 * then apply its effects in order (damage, then daze…), each on the fighters as the effects
 * before it left them. An area technique does this to every foe, each seeing it coming,
 * dodging and guarding on their own; effects aimed at the user happen once.
 */

/** A technique aimed at one foe, as the fighters stand now. */
interface Aimed extends Turn {
  readonly target: PlanFighter;
}

/** The effects that wound. */
type Wounding = EffectUse<'damage' | 'area' | 'break'>;

function withChakraSpent(round: Round, actor: PlanFighter, t: CombatTechnique): Round {
  const chakra = Math.max(0, actor.chakra - chakraCost(actor, t));
  return say(
    { ...round, fighters: patch(round.fighters, actor.id, { chakra }) },
    `${actor.name} uses ${t.name}!`,
  );
}

function physical(t: CombatTechnique): boolean {
  return t.discipline === 'taijutsu' || t.discipline === 'kenjutsu';
}

/**
 * A daze costs one exchange and doesn't stack: rounds play out on their own, so a chain of
 * dazes would leave the player watching themselves lose.
 */
function daze(round: Round, target: PlanFighter): Round {
  return say(
    {
      ...round,
      fighters: patch(round.fighters, target.id, { stunned: 1, openUntil: round.number + 1 }),
    },
    `${target.name} is dazed!`,
  );
}

function seal(round: Round, target: PlanFighter, use: EffectUse<'seal'>): Round {
  const sealed = target.sealed + holdTurns(use.effect) + 1;
  return say(
    { ...round, fighters: patch(round.fighters, target.id, { sealed }) },
    `Seals lock ${target.name}'s chakra!`,
  );
}

function confuse(round: Round, { actor, target }: Aimed, use: EffectUse<'confuse'>): Round {
  const turns = confuseTurns(driveOf(actor, use), use, breakRating(target));
  // The target counts a turn down as their own turn starts, before acting: hold one more.
  const confused = Math.max(target.confused, turns + 1);
  return say(
    { ...round, fighters: patch(round.fighters, target.id, { confused }) },
    `${target.name}'s senses twist in the illusion.`,
  );
}

function heal(round: Round, actor: PlanFighter, use: EffectUse<'heal'>): Round {
  const health = Math.min(actor.maxHealth, actor.health + healAmount(actor, use));
  const healed = { ...round, fighters: patch(round.fighters, actor.id, { health }) };
  return say(healed, healLine(`${actor.name} recovers.`, health - actor.health));
}

function damage(round: Round, { actor, target, rng }: Aimed, use: Wounding): Round {
  const t = use.technique;
  const blow: Blow = {
    raw: techniqueDamage(actor, target, use, rng.next()),
    what: t.name,
    dodgeable: t.discipline !== 'genjutsu',
    physical: physical(t),
    kind: attackKindOf(t),
    ...(use.effect.verb === 'break' ? { breaks: true } : {}),
  };
  const hit = react(round, { attacker: actor, target, blow, rng });
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  return element ? say(hit, element) : hit;
}

/** One effect on one foe, as the fighters stand now. Nothing happens to a foe who is down. */
function onFoe(round: Round, turn: Aimed, { technique, effect }: EffectUse): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  const target = fighterIn(round, turn.target.id);
  if (!target || !alive(target)) return round;
  const aimed = { ...turn, actor, target };
  switch (effect.verb) {
    case 'damage':
    case 'area':
    case 'break':
      return damage(round, aimed, { technique, effect });
    case 'daze':
      return daze(round, target);
    case 'seal':
      return seal(round, target, { technique, effect });
    case 'confuse':
      return confuse(round, aimed, { technique, effect });
    case 'heal':
    case 'conceal':
    case 'sense':
      return round;
  }
}

/** One effect on the user themselves. */
function onSelf(round: Round, turn: Turn, { technique, effect }: EffectUse): Round {
  const actor = fighterIn(round, turn.actor.id) ?? turn.actor;
  switch (effect.verb) {
    case 'heal':
      return heal(round, actor, { technique, effect });
    case 'conceal':
      return conceal(round, actor, { technique, effect });
    case 'sense':
      return sense(round, { ...turn, actor }, { technique, effect });
    case 'damage':
    case 'area':
    case 'break':
    case 'daze':
    case 'seal':
    case 'confuse':
      return round;
  }
}

/** A wounding effect the target slipped (their health untouched): the rest of it misses. */
function slipped(before: Round, after: Round, use: EffectUse, targetId: string): boolean {
  const { verb } = use.effect;
  if (verb !== 'damage' && verb !== 'area' && verb !== 'break') return false;
  return fighterIn(before, targetId)?.health === fighterIn(after, targetId)?.health;
}

/**
 * Who a technique is aimed at: every foe standing for an area technique (the hidden too: it
 * needs no aim), else the turn's target.
 */
function targetsOf(round: Round, turn: Turn, t: CombatTechnique): PlanFighter[] {
  if (!isHarmful(t)) return [];
  if (hasVerb(t, 'area')) return opponentsOf(round.fighters, turn.actor);
  return turn.target ? [turn.target] : [];
}

/** A technique in flight: the round so far, and the foes it still reaches. */
interface Flight {
  readonly round: Round;
  readonly reaching: readonly PlanFighter[];
}

function applyEffect(flight: Flight, turn: Turn, use: EffectUse): Flight {
  if (profileOf(use.effect).aim === 'self') {
    return { ...flight, round: onSelf(flight.round, turn, use) };
  }
  return flight.reaching.reduce<Flight>(({ round, reaching }, foe) => {
    const next = onFoe(round, { ...turn, target: foe }, use);
    const missed = slipped(round, next, use, foe.id);
    return { round: next, reaching: missed ? reaching.filter((f) => f !== foe) : reaching };
  }, flight);
}

export function useJutsu(round: Round, turn: Turn, t: CombatTechnique): Round {
  const { actor, rng } = turn;
  const paid = withChakraSpent(round, actor, t);
  const targets = targetsOf(paid, turn, t);
  if (isHarmful(t) && targets.length === 0) return paid;
  const seen = targets.filter((foe) => rng.chance(resistChance(actor, foe, t)));
  const told = seen.reduce((r, foe) => say(r, `${foe.name} sees it coming.`), paid);
  if (isHarmful(t) && seen.length === targets.length) return told;
  const start: Flight = { round: told, reaching: targets.filter((f) => !seen.includes(f)) };
  const end = t.effects.reduce(
    (flight, effect) => applyEffect(flight, turn, { technique: t, effect }),
    start,
  );
  return end.round;
}
