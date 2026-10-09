import { checkChance, STAT_INFO } from '@/systems/stats';
import type { CombatView } from '@/systems/combat';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';

export interface MissionChoice {
  readonly label: string;
  readonly detail: string;
  readonly action: GameAction;
}

export interface MissionView {
  readonly title: string;
  readonly client: string;
  /** The story so far. */
  readonly notes: readonly string[];
  /** Text describing the current situation. */
  readonly prompt: string;
  readonly choices: readonly MissionChoice[];
}

export function missionView(state: GameState, ctx: GameContext): MissionView | null {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || state.combat) return null;
  const stage = activeStage(state, ctx);
  const base = { title: def.title, client: def.client, notes: state.mission.notes };

  if (!stage) {
    return {
      ...base,
      prompt: 'The job is done.',
      choices: [{ label: 'Report back', detail: '', action: { type: 'missionContinue' } }],
    };
  }
  switch (stage.kind) {
    case 'narrative':
      return {
        ...base,
        prompt: stage.text,
        choices: [{ label: 'Continue', detail: '', action: { type: 'missionContinue' } }],
      };
    case 'combat':
      return {
        ...base,
        prompt: stage.text,
        choices: [{ label: 'Fight!', detail: '', action: { type: 'missionContinue' } }],
      };
    case 'check':
      return {
        ...base,
        prompt: stage.text,
        choices: stage.approaches.map((a, approachIndex) => ({
          label: a.label,
          detail: `${STAT_INFO[a.stat].label} · ${Math.round(checkChance(state.character.stats[a.stat], a.difficulty) * 100)}% chance`,
          action: { type: 'missionChoose', approachIndex },
        })),
      };
  }
}

export function combatView(state: GameState, ctx: GameContext): CombatView | null {
  return state.combat ? ctx.combat.view(state.combat) : null;
}
