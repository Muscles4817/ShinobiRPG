import type { CombatView } from '@/systems/combat';
import type { CheckApproach, MissionNote } from '@/systems/missions';
import { checkChance, STAT_INFO } from '@/systems/stats';

import type { GameAction } from '../actions/types';
import type { GameContext } from '../context';
import { combatFinaleView } from '../combatFinale';
import { engineFor } from '../fightStyle';
import { activeMission, activeStage } from '../missionFlow';
import { checkHand } from '../missionRoles';
import { scoutOpponents, type ScoutingRead } from '../scouting';
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

/** A line of the mission's story as the scene shows it; rolls are worded with their odds. */
export function noteLine(n: MissionNote): SceneLine {
  return n.kind === 'roll'
    ? {
        kind: 'roll',
        success: n.success,
        text: `${STAT_INFO[n.stat].label} check ${n.success ? 'passed' : 'failed'} at ${Math.round(n.chance * 100)}%`,
      }
    : n;
}

/** The odds of a check, and who takes it when a teammate does ("Perception 70%, Kaen the tracker"). */
function checkDetail(state: GameState, ctx: GameContext, approach: CheckApproach): string {
  const hand = checkHand(state, ctx, approach);
  const odds = `${STAT_INFO[approach.stat].label} ${Math.round(checkChance(hand.value, approach.difficulty) * 100)}%`;
  return hand.personId && approach.role ? `${odds}, ${hand.name} the ${approach.role}` : odds;
}

export function missionScene(state: GameState, ctx: GameContext): MissionScene | null {
  const def = activeMission(state, ctx);
  if (!def || !state.mission || state.combat) return null;
  const stage = activeStage(state, ctx);
  const lines = state.mission.notes.map(noteLine);
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
    case 'encounter':
      return {
        ...base,
        prompt: stage.text,
        choices: [
          {
            label: 'Size them up',
            detail: ctx.content.encounters.require(stage.template).name,
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
          detail: checkDetail(state, ctx, a),
          primary: false,
          action: { type: 'missionChoose', approachIndex },
        })),
      };
  }
}

export function combatScene(state: GameState, ctx: GameContext): CombatView | null {
  return state.combat ? engineFor(state, ctx).view(state.combat) : null;
}

/** A fight that has just ended, as a view with nothing left to choose, until you leave it. */
export function finishedFightScene(state: GameState): CombatView | null {
  return state.combatFinale ? combatFinaleView(state.combatFinale) : null;
}

/** How each opponent in the current fight sizes up against you. */
export function combatScouting(
  state: GameState,
  ctx: GameContext,
): Readonly<Record<string, ScoutingRead>> {
  const view = combatScene(state, ctx) ?? finishedFightScene(state);
  if (!view) return {};
  const foes = view.combatants.filter((c) => c.side === 'enemy').map((c) => c.id);
  return scoutOpponents(state, ctx, foes);
}
