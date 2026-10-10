import type { Rng } from '@/core';

import { alive, targetable } from '../../rules/body';
import {
  dispelChance,
  DISPEL_CHAKRA,
  MISFIRE_CHANCE,
  rehidesNow,
  searchChance,
  shakeOffChance,
} from '../../rules/conditions';
import { isAttack } from './moves';
import { patch, playerOf, type MindFighter, type Move } from './state';

/**
 * Hidden and Confused in the mind game. Before the clash the player's confusion is tested
 * (shake it off, or the attack may go wide) and a Search or Dispel looks through the
 * illusion; after the round, illusionists who were found may slip back into hiding.
 */

const IDLE: Move = { kind: 'idle' };
export const MISFIRE_LINE = 'Your senses lie to you. The attack goes wide.';

export interface Sensed {
  readonly fighters: MindFighter[];
  /** The player's move after confusion had its say. */
  readonly move: Move;
  readonly lines: string[];
}

function hiddenFoes(fighters: readonly MindFighter[]): MindFighter[] {
  return fighters.filter((f) => f.side === 'enemy' && alive(f) && f.hidden);
}

/** The confused player may shake it off; if not, an attack can misfire. Ticks down after. */
function steady(fighters: MindFighter[], move: Move, rng: Rng): Sensed {
  const player = playerOf({ fighters });
  if (player.confused === 0) return { fighters, move, lines: [] };
  if (rng.chance(shakeOffChance(player))) {
    const clear = patch(fighters, player.id, { confused: 0 });
    return { fighters: clear, move, lines: ['You shake off the illusion. Your head clears.'] };
  }
  const ticked = patch(fighters, player.id, { confused: player.confused - 1 });
  if (isAttack(move) || move.kind === 'jutsu') {
    if (rng.chance(MISFIRE_CHANCE)) return { fighters: ticked, move: IDLE, lines: [MISFIRE_LINE] };
  }
  return { fighters: ticked, move, lines: [] };
}

function search(fighters: MindFighter[], rng: Rng): Sensed {
  const player = playerOf({ fighters });
  return hiddenFoes(fighters).reduce<Sensed>(
    (acc, foe) =>
      rng.chance(searchChance(player, foe))
        ? {
            ...acc,
            fighters: patch(acc.fighters, foe.id, { hidden: false }),
            lines: [...acc.lines, `You spot ${foe.name}!`],
          }
        : { ...acc, lines: [...acc.lines, `${foe.name} stays hidden.`] },
    { fighters, move: { kind: 'search' }, lines: ['You search the shadows.'] },
  );
}

function dispel(fighters: MindFighter[], rng: Rng): Sensed {
  const player = playerOf({ fighters });
  const paid = patch(fighters, player.id, {
    chakra: Math.max(0, player.chakra - DISPEL_CHAKRA),
    confused: 0,
  });
  const move: Move = { kind: 'dispel' };
  const hidden = hiddenFoes(fighters);
  const strongest = hidden.reduce<MindFighter | undefined>(
    (best, f) => (!best || f.attributes.genjutsu > best.attributes.genjutsu ? f : best),
    undefined,
  );
  if (!strongest) return { fighters: paid, move, lines: ['You break the illusion on your mind.'] };
  if (!rng.chance(dispelChance(player, strongest))) {
    return { fighters: paid, move, lines: ['You try to break the illusion, but it holds.'] };
  }
  const revealed = hidden.reduce((acc, f) => patch(acc, f.id, { hidden: false }), paid);
  const names = hidden.map((f) => f.name).join(', ');
  return { fighters: revealed, move, lines: [`The illusion shatters: ${names} revealed!`] };
}

/** Everything the player's senses do before the clash. */
export function sense(fighters: MindFighter[], move: Move, rng: Rng): Sensed {
  const steadied = steady(fighters, move, rng);
  const { kind } = steadied.move;
  if (kind !== 'search' && kind !== 'dispel') return steadied;
  const looked =
    kind === 'search' ? search(steadied.fighters, rng) : dispel(steadied.fighters, rng);
  return { ...looked, lines: [...steadied.lines, ...looked.lines] };
}

/** Illusionists in the open slip back into hiding as the next round begins. */
export function rehide(
  fighters: MindFighter[],
  round: number,
): { fighters: MindFighter[]; lines: string[] } {
  const hiding = fighters.filter(
    (f) => f.side === 'enemy' && targetable(f) && rehidesNow(f, round),
  );
  return {
    fighters: hiding.reduce((acc, f) => patch(acc, f.id, { hidden: true }), fighters),
    lines: hiding.map((f) => `${f.name} melts back into the illusion.`),
  };
}
