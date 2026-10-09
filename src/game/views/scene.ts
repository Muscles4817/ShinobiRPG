import type { CombatView } from '@/systems/combat';
import { checkChance, STAT_INFO } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';

export type SceneLine =
  | { readonly kind: 'story' | 'choice' | 'outcome'; readonly text: string }
  | { readonly kind: 'roll'; readonly text: string; readonly success: boolean };

export interface SceneChoice {
  readonly label: string;
  readonly detail: string;
  readonly primary: boolean;
  readonly action: GameAction;
}

export interface MissionScene {
  readonly title: string;
  readonly rank: string;
  readonly client: string;
  readonly lines: readonly SceneLine[];
  /** The current situation, shown last in the feed. */
  readonly prompt: string | null;
  readonly choices: readonly SceneChoice[];
}

const CONTINUE: GameAction = { type: 'missionContinue' };

export function missionScene(state: GameState, ctx: GameContext): MissionScene | null {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || state.combat) return null;
  const stage = activeStage(state, ctx);
  const lines = state.mission.notes.map((n): SceneLine =>
    n.kind === 'roll'
      ? {
          kind: 'roll',
          success: n.success,
          text: `${STAT_INFO[n.stat].label} check · ${Math.round(n.chance * 100)}% · ${n.success ? 'passed' : 'failed'}`,
        }
      : n,
  );
  const base = { title: def.title, rank: def.rank, client: def.client, lines };
  if (!stage) {
    return {
      ...base,
      prompt: null,
      choices: [{ label: 'Report back', detail: '', primary: true, action: CONTINUE }],
    };
  }
  switch (stage.kind) {
    case 'narrative':
      return {
        ...base,
        prompt: stage.text,
        choices: [{ label: 'Continue', detail: '', primary: true, action: CONTINUE }],
      };
    case 'combat':
      return {
        ...base,
        prompt: stage.text,
        choices: [
          {
            label: 'Fight',
            detail: stage.canFlee ? 'You can flee' : 'No escape',
            primary: true,
            action: CONTINUE,
          },
        ],
      };
    case 'check':
      return {
        ...base,
        prompt: stage.text,
        choices: stage.approaches.map((a, approachIndex) => ({
          label: a.label,
          detail: `${STAT_INFO[a.stat].label} · ${Math.round(checkChance(state.character.stats[a.stat], a.difficulty) * 100)}%`,
          primary: false,
          action: { type: 'missionChoose', approachIndex },
        })),
      };
  }
}

export function combatScene(state: GameState, ctx: GameContext): CombatView | null {
  return state.combat ? ctx.combat.view(state.combat) : null;
}
