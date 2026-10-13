import type { EnemyDef } from '@/content';
import {
  SAW_SCOUTS,
  encounterFlavour,
  startEncounter,
  type EncounterFact,
  type EncounterFlavour,
  type EncounterRun,
  type EncounterStage,
  type EncounterTemplate,
  type MissionDef,
  type MissionNote,
  type MissionRun,
} from '@/systems/missions';

import type { GameContext } from '../context';
import { activeMission, activeStage } from '../missionFlow';
import type { GameState } from '../state';

/**
 * The encounter the player is sizing up, gathered in one place for the recon and approach
 * rules: the mission, its encounter stage and template, and the encounter's own state.
 */
export interface EncounterHere {
  readonly def: MissionDef;
  readonly stage: EncounterStage;
  readonly template: EncounterTemplate;
  readonly flavour: EncounterFlavour;
  readonly foes: readonly EnemyDef[];
  readonly run: MissionRun;
  readonly encounter: EncounterRun;
}

/** What buying the client's report already told you. */
const REPORT_FACTS: readonly EncounterFact[] = ['identity', 'kit'];

/** The current stage when it is an encounter, with its template. */
export function encounterStageHere(
  state: GameState,
  ctx: GameContext,
): { readonly stage: EncounterStage; readonly template: EncounterTemplate } | null {
  const stage = activeStage(state, ctx);
  if (stage?.kind !== 'encounter') return null;
  return { stage, template: ctx.content.encounters.require(stage.template) };
}

/** The encounter under way, or null when there is none (or a fight has already begun). */
export function encounterHere(state: GameState, ctx: GameContext): EncounterHere | null {
  const def = activeMission(state, ctx);
  const at = encounterStageHere(state, ctx);
  const run = state.mission;
  if (!def || !at || !run?.encounter || state.combat) return null;
  return {
    def,
    ...at,
    flavour: encounterFlavour(at.stage, at.template),
    foes: at.stage.enemyIds.map((id) => ctx.content.enemies.require(id)),
    run,
    encounter: run.encounter,
  };
}

/** Steps into the encounter: what the client's report told you is known already. */
export function beginEncounter(state: GameState, ctx: GameContext): GameState {
  const def = activeMission(state, ctx);
  const at = encounterStageHere(state, ctx);
  if (!def || !at || !state.mission) return state;
  const reported = state.board.intel.includes(def.id) ? REPORT_FACTS : [];
  // Whoever kept watch the night before already saw how many there are, and where.
  const scouted: EncounterFact[] = state.mission.marks.includes(SAW_SCOUTS)
    ? ['count', 'terrain']
    : [];
  const known = [...new Set([...reported, ...scouted])];
  const notesFrom = state.mission.notes.length;
  const encounter = startEncounter(at.template, known, notesFrom);
  const opening: MissionNote = { kind: 'story', text: at.stage.text };
  return {
    ...state,
    mission: { ...state.mission, notes: [...state.mission.notes, opening], encounter },
  };
}

/** The run with notes added and the encounter's state replaced. */
export function withEncounter(
  here: EncounterHere,
  encounter: EncounterRun,
  ...notes: MissionNote[]
): MissionRun {
  return { ...here.run, notes: [...here.run.notes, ...notes], encounter };
}
