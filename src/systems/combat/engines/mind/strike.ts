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
import { matchup, matchupLine } from '../../rules/elements';
import type { Landing } from './exchange';
import { patch, type MindFighter, type Move } from './state';

/** Applying a landed move: damage, dazes, seals and the narration for each. */

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

function wound(fighters: MindFighter[], target: MindFighter, damage: number): MindFighter[] {
  return patch(fighters, target.id, { health: Math.max(0, target.health - damage), opened: false });
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
  const opened = target.opened ? OPENED_BONUS : 1;
  const kindScale = move.kind === 'throw' ? THROW_SCALE : 1;
  const raw = strikeDamage(attacker, target, rng.next()) * blow.scale * kindScale * opened;
  const damage = Math.max(1, Math.round(raw));
  const hurt = wound(fighters, target, damage);
  const next = move.kind === 'feint' ? patch(hurt, target.id, { opened: true }) : hurt;
  return { fighters: next, lines: [basicVerb(move, attacker.name, target.name, damage)] };
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
  const opened = target.opened ? OPENED_BONUS : 1;
  const raw = techniqueDamage(attacker, target, t, rng.next()) * blow.scale * opened;
  const damage = Math.max(1, Math.round(raw));
  const element = matchupLine(matchup(t.element, target.nature), target.name);
  return {
    fighters: wound(fighters, target, damage),
    lines: [opener, `${target.name} takes ${damage}.`, ...(element ? [element] : [])],
  };
}

function hitWith(fighters: MindFighter[], exchange: Exchange, scale: number, rng: Rng): Hit {
  const attacker = find(fighters, exchange.moverId);
  const target = find(fighters, exchange.targetId);
  if (!attacker || !target || !alive(target)) return { fighters, lines: [] };
  const blow: Blow = { attacker, target, move: exchange.move, scale };
  return exchange.move.kind === 'jutsu'
    ? jutsuHit(fighters, blow, rng)
    : basicHit(fighters, blow, rng);
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
