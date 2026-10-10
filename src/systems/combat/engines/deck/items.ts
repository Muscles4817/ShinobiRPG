import { err, ok, type Result, type Rng } from '@/core';

import type { CombatChoice, CombatItem, CombatItemEffect, CombatOption } from '../../contract';
import { carried, itemBlocker, itemTargeted, useItem } from '../../rules/items';
import { fleeIfCoward, UNSEEN_REASON } from './kit';
import { decide, visibleEnemies } from './turn';
import { LOG_LIMIT, playerOf, type DeckFighter, type DeckState } from './state';

/**
 * Fight tools in deck fights: each carried tool is a move from the pouch (not a card in the
 * deck) costing one action. Tools never misfire from confusion, and using one never gives a
 * smoke-hidden player away.
 */

export const ITEM_POINTS = 1;
export const ITEM_PREFIX = 'item:';

const WHAT_IT_DOES: Readonly<Record<CombatItemEffect, string>> = {
  smoke: 'Vanish until you attack',
  flash: 'Reveal hidden foes',
  blast: 'Seal blast · through armour',
  chakra: 'Restore chakra',
  heal: 'Restore health',
  clarity: 'Clear confusion',
};

function enemiesOf(fighters: readonly DeckFighter[]): DeckFighter[] {
  return fighters.filter((f) => f.side === 'enemy');
}

function blockerFor(state: DeckState, item: CombatItem): string | null {
  const player = playerOf(state);
  const why = itemBlocker(player, item, enemiesOf(state.fighters));
  if (why) return why;
  if (state.points < ITEM_POINTS) return 'Not enough actions';
  if (itemTargeted(item.effect) && visibleEnemies(state.fighters).length === 0) {
    return UNSEEN_REASON;
  }
  return null;
}

/** One option per tool still in the pouch. */
export function itemOptions(state: DeckState): CombatOption[] {
  return playerOf(state)
    .items.filter((item) => item.count > 0)
    .map((item) => {
      const blocker = blockerFor(state, item);
      return {
        id: `${ITEM_PREFIX}${item.id}`,
        label: item.name,
        detail: `×${item.count} · ${WHAT_IT_DOES[item.effect]}`,
        kind: 'item' as const,
        cost: ITEM_POINTS,
        ...(itemTargeted(item.effect) ? { targeted: true } : {}),
        ...(blocker ? { disabledReason: blocker } : {}),
      };
    });
}

/** The item id in an option id; ids may contain ':' themselves, so split on the first only. */
function itemIdOf(optionId: string): string {
  return optionId.slice(optionId.indexOf(':') + 1);
}

function aimAt(state: DeckState, item: CombatItem, targetId: string | undefined) {
  if (!itemTargeted(item.effect)) return ok(undefined);
  if (targetId === undefined) return ok(visibleEnemies(state.fighters)[0]?.id);
  const target = state.fighters.find((f) => f.id === targetId && f.side === 'enemy');
  if (!target || target.health <= 0) return err('That target is already down.');
  return target.hidden ? err(UNSEEN_REASON) : ok(targetId);
}

/** Uses one tool from the pouch (the option was already checked for blockers). */
export function useTool(state: DeckState, choice: CombatChoice, rng: Rng): Result<DeckState> {
  const player = playerOf(state);
  const item = carried(player, itemIdOf(choice.optionId));
  if (!item) return err('You carry no such tool.');
  const aimed = aimAt(state, item, choice.targetId);
  if (!aimed.ok) return aimed;
  const foes = enemiesOf(state.fighters);
  const used = useItem(
    { user: player, item, foes, ...(aimed.value ? { targetId: aimed.value } : {}) },
    rng,
  );
  const byId = new Map([used.user, ...used.foes].map((f) => [f.id, f]));
  const replaced = state.fighters.map((f) => byId.get(f.id) ?? f);
  const fled = aimed.value
    ? fleeIfCoward(replaced, aimed.value)
    : { fighters: replaced, lines: [] };
  return ok({
    ...state,
    fighters: fled.fighters,
    points: state.points - ITEM_POINTS,
    log: [...state.log, ...used.log, ...fled.lines].slice(-LOG_LIMIT),
    result: decide(fled.fighters),
  });
}
