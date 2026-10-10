import type { Rng } from '@/core';

import type { CombatItemEffect, CombatOption } from '../../contract';
import { alive, targetable } from '../../rules/body';
import { carried, itemBlocker, itemTargeted, useItem } from '../../rules/items';
import { shouldFlee } from '../../rules/kit';
import { UNSEEN } from './moves';
import { playerOf, type MindFighter, type Move } from './state';

/**
 * Fight tools in the mind game. Using one is the player's pick for the exchange: it goes off
 * as the exchange opens (like a healing jutsu), so smoke thrown now already hides you from
 * this exchange's attacks. Enemies still commit and act as usual.
 */

export const ITEM_PREFIX = 'item:';

const WHAT_IT_DOES: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'Vanish until you attack',
  flash: 'Reveal hidden foes',
  blast: 'Seal blast · through armour',
  chakra: 'Restore chakra',
  heal: 'Restore health',
  clarity: 'Clear confusion',
};

/** One option per tool still in the pouch, each saying why not when it can't be used. */
export function itemOptions(player: MindFighter, foes: readonly MindFighter[]): CombatOption[] {
  const visibleFoes = foes.some(targetable);
  return player.items
    .filter((item) => item.count > 0)
    .map((item): CombatOption => {
      const targeted = itemTargeted(item.effect);
      const reason = targeted && !visibleFoes ? UNSEEN : itemBlocker(player, item, foes);
      return {
        id: `${ITEM_PREFIX}${item.id}`,
        label: item.name,
        detail: `×${item.count} · ${WHAT_IT_DOES[item.effect]}`,
        kind: 'item',
        ...(targeted ? { targeted: true } : {}),
        ...(reason ? { disabledReason: reason } : {}),
      };
    });
}

/** Turns an `item:<id>` option back into a move (the id is everything after the first colon). */
export function itemMove(player: MindFighter, optionId: string): Move | null {
  if (!optionId.startsWith(ITEM_PREFIX)) return null;
  const item = carried(player, optionId.slice(ITEM_PREFIX.length));
  return item ? { kind: 'item', item } : null;
}

/** A foe the tool hurt badly enough runs, like after any other hit. */
function cowardsRun(before: readonly MindFighter[], after: readonly MindFighter[]) {
  const lines: string[] = [];
  const fighters = after.map((f) => {
    const was = before.find((b) => b.id === f.id);
    if (!was || f.health >= was.health) return f;
    lines.push(`${f.name} takes ${was.health - f.health}.`);
    if (!shouldFlee(f)) return f;
    lines.push(`${f.name} flees!`);
    return { ...f, health: 0 };
  });
  return { fighters, lines };
}

/** Uses the player's tool, if their move is one, writing back the player and the foes. */
export function useTool(
  fighters: MindFighter[],
  move: Move,
  targetId: string | undefined,
  rng: Rng,
): { fighters: MindFighter[]; lines: string[] } {
  if (move.kind !== 'item' || !move.item) return { fighters, lines: [] };
  const user = playerOf({ fighters });
  const item = carried(user, move.item.id);
  if (!item) return { fighters, lines: [] };
  const foes = fighters.filter((f) => f.side === 'enemy' && alive(f));
  const used = useItem({ user, item, foes, ...(targetId ? { targetId } : {}) }, rng);
  const ran = cowardsRun(foes, used.foes);
  const changed = new Map([used.user, ...ran.fighters].map((f) => [f.id, f]));
  return {
    fighters: fighters.map((f) => changed.get(f.id) ?? f),
    lines: [...used.log, ...ran.lines],
  };
}
