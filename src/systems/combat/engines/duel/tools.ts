import { err, ok, type Result, type Rng } from '@/core';

import type { CombatItem, CombatItemEffect, CombatOption } from '../../contract';
import { targetable } from '../../rules/body';
import { itemBlocker, itemTargeted, useItem } from '../../rules/items';
import { kitLine, land, type ActionResult, type DuelAction } from './actions';
import { UNSEEN } from './reach';
import { livingEnemies, playerOf, type DuelState, type Fighter } from './state';

/**
 * Fight tools in the Classic style: each carried tool is an option that takes the player's
 * turn, like a strike or a guard. The tools themselves work as `rules/items.ts` says; this
 * module offers them and writes their effect back into the duel.
 */

const TOOL_PREFIX = 'item:';

const TOOL_DETAIL: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'Vanish until you attack',
  flash: 'Reveal hidden foes',
  blast: 'Seal blast · through armour',
  chakra: 'Restore chakra',
  heal: 'Restore health',
  clarity: 'Clear confusion',
};

function toolBlocker(state: DuelState, item: CombatItem): string | null {
  const blocked = itemBlocker(playerOf(state), item, livingEnemies(state));
  if (blocked) return blocked;
  const unseen = itemTargeted(item.effect) && !livingEnemies(state).some(targetable);
  return unseen ? UNSEEN : null;
}

/** One option per tool still in the pouch. */
export function toolOptions(state: DuelState): CombatOption[] {
  return playerOf(state)
    .items.filter((item) => item.count > 0)
    .map((item) => {
      const option: CombatOption = {
        id: `${TOOL_PREFIX}${item.id}`,
        label: item.name,
        detail: `×${item.count} · ${TOOL_DETAIL[item.effect]}`,
        kind: 'item',
        ...(itemTargeted(item.effect) ? { targeted: true } : {}),
      };
      const blocked = toolBlocker(state, item);
      return blocked ? { ...option, disabledReason: blocked } : option;
    });
}

export function isToolOption(optionId: string): boolean {
  return optionId.startsWith(TOOL_PREFIX);
}

/** The tool a tool option names (everything after the first colon is the tool's id). */
export function toolAction(state: DuelState, optionId: string): Result<DuelAction> {
  const itemId = optionId.slice(TOOL_PREFIX.length);
  const item = playerOf(state).items.find((i) => i.id === itemId);
  return item ? ok({ kind: 'item', item }) : err(`Unknown tool "${itemId}".`);
}

function replaceAll(fighters: readonly Fighter[], changed: readonly Fighter[]): Fighter[] {
  return fighters.map((f) => changed.find((c) => c.id === f.id) ?? f);
}

/** A blast lands like any other damage: the target may fall, or run if they're a coward. */
function blastLands(fighters: readonly Fighter[], user: Fighter, target: Fighter, rng: Rng) {
  const after = fighters.find((f) => f.id === target.id)?.health ?? target.health;
  const damage = target.health - after;
  if (damage <= 0) return { fighters, lines: [] };
  const restored = replaceAll(fighters, [target]);
  const landed = land(restored, { actor: user, target }, damage, rng);
  return {
    fighters: landed.fighters,
    lines: [`${target.name} takes ${damage} damage.`, ...kitLine(target, 'seal'), ...landed.lines],
  };
}

export interface ToolUse {
  readonly item: CombatItem;
  /** The foe a blast is aimed at; another one in sight if they've since hidden or fallen. */
  readonly targetId?: string;
}

/** The actor uses one of a tool. Tools never misfire and never give a hidden user away. */
export function useTool(
  fighters: readonly Fighter[],
  actor: Fighter,
  use: ToolUse,
  rng: Rng,
): ActionResult {
  const foes = fighters.filter((f) => f.side !== actor.side);
  const inSight = foes.filter(targetable);
  const target = inSight.find((f) => f.id === use.targetId) ?? inSight[0];
  const used = useItem(
    { user: actor, item: use.item, foes, ...(target ? { targetId: target.id } : {}) },
    rng,
  );
  const next = replaceAll(fighters, [used.user, ...used.foes]);
  if (!target || !itemTargeted(use.item.effect)) return { fighters: next, lines: used.log };
  const landed = blastLands(next, used.user, target, rng);
  return { fighters: landed.fighters, lines: [...used.log, ...landed.lines] };
}
