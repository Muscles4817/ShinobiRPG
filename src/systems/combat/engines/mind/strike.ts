import type { Rng } from '@/core';

import {
  alive,
  chakraCost,
  healAmount,
  holdTurns,
  resistChance,
  strikeDamage,
  techniqueDamage,
} from '../../rules/body';
import { CONFUSION_TURNS, confuseChance, HIDDEN_DAMAGE } from '../../rules/conditions';
import { matchup, matchupLine } from '../../rules/elements';
import {
  attackKindOf,
  hasTrait,
  isPhysical,
  kitDamageScale,
  packScale,
  shouldFlee,
  SWIFT_DODGE,
  type AttackKind,
} from '../../rules/kit';
import type { Landing } from './exchange';
import { patch, type MindFighter, type Move } from './state';

/**
 * Applying a landed move: damage (scaled by kits), dazes, seals, confusion, cowards running,
 * and the narration for each.
 */

const THROW_SCALE = 0.6;
const OPENED_BONUS = 1.5;

export interface Hit {
  readonly fighters: MindFighter[];
  readonly lines: string[];
}

/** Who did what to whom, and how it landed. */
export interface Exchange {
  readonly moverId: string;
  readonly targetId: string;
  readonly move: Move;
  readonly landing: Landing;
}

interface Blow {
  readonly attacker: MindFighter;
  readonly target: MindFighter;
  readonly move: Move;
  readonly scale: number;
}

function find(fighters: readonly MindFighter[], id: string): MindFighter | undefined {
  return fighters.find((f) => f.id === id);
}

/** Everything the attacker's and defender's kits do to a hit's damage. */
function kitScale(fighters: readonly MindFighter[], blow: Blow, kind: AttackKind): number {
  const hidden = blow.attacker.hidden ? HIDDEN_DAMAGE : 1;
  return kitDamageScale(blow.target, kind) * packScale(blow.attacker, fighters) * hidden;
}

/** A short line when the defender's kit changed how much a hit hurt. */
function kitLine(target: MindFighter, kind: AttackKind): string[] {
  if (hasTrait(target, 'spirit') && isPhysical(kind))
    return [`It half passes through ${target.name}.`];
  if (hasTrait(target, 'spirit') && kind === 'seal')
    return [`The seal bites deep into ${target.name}.`];
  if (hasTrait(target, 'armoured') && isPhysical(kind))
    return [`${target.name}'s armour takes the edge off.`];
  return [];
}

/** Deals damage; a coward hurt badly enough runs and is out of the fight. */
function wound(fighters: MindFighter[], target: MindFighter, damage: number): Hit {
  const health = Math.max(0, target.health - damage);
  const hurt = patch(fighters, target.id, { health, opened: false });
  if (!shouldFlee({ ...target, health })) return { fighters: hurt, lines: [] };
  return { fighters: patch(hurt, target.id, { health: 0 }), lines: [`${target.name} flees!`] };
}

function basicVerb(move: Move, attacker: string, target: string, damage: number): string {
  if (move.kind === 'throw') return `${attacker}'s kunai catches ${target} for ${damage}.`;
  if (move.kind === 'counter') return `${attacker} counters ${target} for ${damage}!`;
  if (move.kind === 'feint') {
    return `${attacker} feints. ${target} bites and is left open, taking ${damage}.`;
  }
  return `${attacker} strikes ${target} for ${damage}.`;
}

function basicHit(fighters: MindFighter[], blow: Blow, rng: Rng): Hit {
  const { attacker, target, move } = blow;
  const kind = attackKindOf(null, move.kind === 'throw');
  const opened = target.opened ? OPENED_BONUS : 1;
  const kindScale = move.kind === 'throw' ? THROW_SCALE : 1;
  const kit = kitScale(fighters, blow, kind);
  const raw = strikeDamage(attacker, target, rng.next()) * blow.scale * kindScale * opened * kit;
  const damage = Math.max(1, Math.round(raw));
  const hurt = wound(fighters, target, damage);
  const next =
    move.kind === 'feint' && !hurt.lines.length
      ? patch(hurt.fighters, target.id, { opened: true })
      : hurt.fighters;
  const verb = basicVerb(move, attacker.name, target.name, damage);
  return { fighters: next, lines: [verb, ...kitLine(target, kind), ...hurt.lines] };
}

function jutsuHit(fighters: MindFighter[], blow: Blow, rng: Rng): Hit {
  const { attacker, target } = blow;
  const t = blow.move.technique;
  if (!t) return { fighters, lines: [] };
  const opener = `${attacker.name} uses ${t.name}!`;
  if (rng.chance(resistChance(attacker, target, t))) {
    return { fighters, lines: [opener, `${target.name} sees through it.`] };
  }
  if (t.effect === 'stun') {
    const stunned = target.stunned + holdTurns(t);
    return {
      fighters: patch(fighters, target.id, { stunned }),
      lines: [opener, `${target.name} is dazed!`],
    };
  }
  if (t.effect === 'seal') {
    const sealed = target.sealed + holdTurns(t) + 1;
    return {
      fighters: patch(fighters, target.id, { sealed }),
      lines: [opener, `Seals lock ${target.name}'s chakra!`],
    };
  }
  const kind = attackKindOf(t);
  const opened = target.opened ? OPENED_BONUS : 1;
  const kit = kitScale(fighters, blow, kind);
  const raw = techniqueDamage(attacker, target, t, rng.next()) * blow.scale * opened * kit;
  const damage = Math.max(1, Math.round(raw));
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  const hurt = wound(fighters, target, damage);
  return {
    fighters: hurt.fighters,
    lines: [
      opener,
      `${target.name} takes ${damage}.`,
      ...(element ? [element] : []),
      ...kitLine(target, kind),
      ...hurt.lines,
    ],
  };
}

/** Whether the hit actually did something to the target (not resisted or shrugged off). */
function landed(before: MindFighter, after: MindFighter | undefined): boolean {
  if (!after) return false;
  return (
    after.health < before.health || after.stunned > before.stunned || after.sealed > before.sealed
  );
}

/** An illusionist's hit may leave its victim confused. */
function maybeConfuse(hit: Hit, blow: Blow, rng: Rng): Hit {
  if (!hasTrait(blow.attacker, 'illusionist')) return hit;
  const after = find(hit.fighters, blow.target.id);
  if (!landed(blow.target, after) || !after || !alive(after)) return hit;
  if (!rng.chance(confuseChance(blow.attacker, blow.target))) return hit;
  return {
    fighters: patch(hit.fighters, after.id, { confused: CONFUSION_TURNS }),
    lines: [...hit.lines, `The world tilts around ${after.name}. Confused!`],
  };
}

function hitWith(fighters: MindFighter[], exchange: Exchange, scale: number, rng: Rng): Hit {
  const attacker = find(fighters, exchange.moverId);
  const target = find(fighters, exchange.targetId);
  if (!attacker || !target || !alive(target)) return { fighters, lines: [] };
  if (hasTrait(target, 'swift') && rng.chance(SWIFT_DODGE)) {
    return { fighters, lines: [`${target.name} slips aside, too quick for ${attacker.name}.`] };
  }
  const blow: Blow = { attacker, target, move: exchange.move, scale };
  const hit =
    exchange.move.kind === 'jutsu' ? jutsuHit(fighters, blow, rng) : basicHit(fighters, blow, rng);
  return maybeConfuse(hit, blow, rng);
}

/** Applies what a move did to its target, given how it landed. */
export function applyLanding(fighters: MindFighter[], exchange: Exchange, rng: Rng): Hit {
  const { move, landing } = exchange;
  const mover = find(fighters, exchange.moverId)?.name ?? '';
  const target = find(fighters, exchange.targetId)?.name ?? '';
  switch (landing.kind) {
    case 'none':
    case 'countered':
      return { fighters, lines: [] };
    case 'whiff':
      return { fighters, lines: [`${mover} finds nothing but air.`] };
    case 'blocked':
      return move.kind === 'jutsu'
        ? { fighters, lines: [] }
        : { fighters, lines: [`${target} blocks ${mover}.`] };
    case 'opens':
    case 'hit':
      return hitWith(fighters, exchange, landing.scale, rng);
  }
}

/** Pays a jutsu's chakra up front; healing jutsu take effect immediately on the user. */
export function castJutsu(fighters: MindFighter[], moverId: string, move: Move): Hit {
  const mover = find(fighters, moverId);
  const t = move.technique;
  if (move.kind !== 'jutsu' || !mover || !t) return { fighters, lines: [] };
  const chakra = Math.max(0, mover.chakra - chakraCost(mover, t));
  const paid = patch(fighters, mover.id, { chakra });
  if (t.effect !== 'heal') return { fighters: paid, lines: [] };
  const health = Math.min(mover.maxHealth, mover.health + healAmount(mover, t));
  return {
    fighters: patch(paid, mover.id, { health }),
    lines: [`${mover.name} uses ${t.name} and recovers ${health - mover.health}.`],
  };
}
