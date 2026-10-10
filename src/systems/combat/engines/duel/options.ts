import { err, ok, type Result } from '@/core';

import type { CombatChoice, CombatOption, CombatTechnique } from '../../contract';
import { targetable } from '../../rules/body';
import { DISPEL_CHAKRA } from '../../rules/conditions';
import type { DuelAction } from './actions';
import { reaches, UNSEEN } from './reach';
import { livingEnemies, playerOf, type DuelState, type Fighter } from './state';
import { isToolOption, toolAction, toolOptions } from './tools';

/**
 * What the player can choose this round, why some choices are shut, and turning a choice
 * back into a duel action (refusing targets they can't see or reach).
 */

const TECHNIQUE_PREFIX = 'tech:';
const OUT_OF_REACH = 'Out of reach. Close in first.';

const EFFECT_DETAIL: Readonly<Record<CombatTechnique['effect'], (power: number) => string>> = {
  damage: (power) => `power ${power}`,
  stun: () => 'dazes',
  heal: () => 'heals',
  seal: () => 'seals',
};

/**
 * Why an attack can't be made at all: nobody in sight. Foes merely out of reach don't block
 * it; aiming at one is refused, and an unaimed blow closes in on them instead.
 */
function attackBlocker(state: DuelState): string | undefined {
  return livingEnemies(state).some(targetable) ? undefined : UNSEEN;
}

function techniqueOption(state: DuelState, t: CombatTechnique): CombatOption {
  const player = playerOf(state);
  const heals = t.effect === 'heal';
  const base: CombatOption = {
    id: `${TECHNIQUE_PREFIX}${t.id}`,
    label: t.name,
    detail: `${t.chakraCost} chakra · ${EFFECT_DETAIL[t.effect](t.power)}`,
    kind: 'technique',
    discipline: t.discipline,
    ...(heals ? {} : { targeted: true }),
  };
  if ((player.sealed ?? 0) > 0) return { ...base, disabledReason: 'Your chakra is sealed' };
  if (t.chakraCost > player.chakra) return { ...base, disabledReason: 'Not enough chakra' };
  const blocked = heals ? undefined : attackBlocker(state);
  return blocked ? { ...base, disabledReason: blocked } : base;
}

/** Close in, Search and Dispel: shown only while there is someone to reach or find. */
function moveOptions(state: DuelState): CombatOption[] {
  const player = playerOf(state);
  const enemies = livingEnemies(state);
  const someoneHidden = enemies.some((f) => f.hidden);
  const dispel: CombatOption = {
    id: 'dispel',
    label: 'Dispel',
    detail: `Break illusions · ${DISPEL_CHAKRA} chakra`,
    kind: 'move',
  };
  const short = player.chakra < DISPEL_CHAKRA;
  return [
    ...(enemies.some((f) => targetable(f) && f.distant)
      ? [
          {
            id: 'close-in',
            label: 'Close in',
            detail: 'Speed against theirs',
            kind: 'move',
            targeted: true,
          } as const,
        ]
      : []),
    ...(someoneHidden
      ? [{ id: 'search', label: 'Search', detail: 'Find hidden foes', kind: 'move' } as const]
      : []),
    ...(someoneHidden || player.confused > 0
      ? [short ? { ...dispel, disabledReason: `Needs ${DISPEL_CHAKRA} chakra.` } : dispel]
      : []),
  ];
}

export function options(state: DuelState): CombatOption[] {
  if (state.result) return [];
  const player = playerOf(state);
  const strikeBlocked = attackBlocker(state);
  const flee: CombatOption = { id: 'flee', label: 'Flee', detail: 'Try to escape', kind: 'escape' };
  return [
    {
      id: 'strike',
      label: 'Strike',
      detail: 'Free',
      kind: 'basic',
      targeted: true,
      ...(strikeBlocked ? { disabledReason: strikeBlocked } : {}),
    },
    { id: 'guard', label: 'Guard', detail: 'Halve damage · +chakra', kind: 'basic' },
    ...moveOptions(state),
    ...player.techniques.map((t) => techniqueOption(state, t)),
    ...toolOptions(state),
    state.canFlee ? flee : { ...flee, disabledReason: 'You cannot flee this fight' },
  ];
}

function actionFor(state: DuelState, optionId: string): Result<DuelAction> {
  switch (optionId) {
    case 'strike':
    case 'guard':
    case 'flee':
    case 'close-in':
    case 'search':
    case 'dispel':
      return ok({ kind: optionId });
  }
  if (isToolOption(optionId)) return toolAction(state, optionId);
  const techniqueId = optionId.slice(TECHNIQUE_PREFIX.length);
  const technique = playerOf(state).techniques.find((t) => t.id === techniqueId);
  return technique
    ? ok({ kind: 'technique', technique })
    : err(`Unknown technique "${techniqueId}".`);
}

/** A chosen target must be in sight, and in reach of the attack (or far, to close in). */
function targetProblem(state: DuelState, action: DuelAction, target: Fighter): string | null {
  if (!targetable(target)) return UNSEEN;
  switch (action.kind) {
    case 'strike':
    case 'technique':
      return reaches(playerOf(state), target, action) ? null : OUT_OF_REACH;
    case 'close-in':
      return target.distant ? null : `${target.name} is already within reach.`;
    case 'guard':
    case 'flee':
    case 'search':
    case 'dispel':
    case 'item':
      return null;
  }
}

export function parseChoice(state: DuelState, choice: CombatChoice): Result<DuelAction> {
  const option = options(state).find((o) => o.id === choice.optionId);
  if (!option) return err(`Unknown combat option "${choice.optionId}".`);
  if (option.disabledReason) return err(option.disabledReason);
  const action = actionFor(state, choice.optionId);
  const target = livingEnemies(state).find((f) => f.id === choice.targetId);
  if (action.ok && action.value.kind === 'item' && choice.targetId !== undefined && !target) {
    return err('They are already down.');
  }
  if (!action.ok || !option.targeted || !target) return action;
  const problem = targetProblem(state, action.value, target);
  return problem ? err(problem) : action;
}
