import { createRng } from '@/core';
import { freeLodging, newTenancy } from '@/systems/housing';
import { EMPTY_JOURNAL } from '@/systems/journal';
import {
  gradeStatBonuses,
  gradesProblem,
  topDisciplines,
  type Appearance,
  type Grades,
  type Pronouns,
} from '@/systems/profile';
import { NEW_GENIN } from '@/systems/standing';
import { checkChance, createStats, STAT_INFO, sumDeltas } from '@/systems/stats';
import type { Element } from '@/systems/techniques';
import { START_TIME } from '@/systems/time';
import { fullVitals } from '@/systems/vitals';

import type { GameContext } from './context';
import { chip, log, placeHere } from './ops';
import { newBoard } from './boardState';
import { defaultSettings } from './fightStyle';
import { NO_PEOPLE } from './people/state';
import type { GameState } from './state';

/**
 * Character creation. The UI collects a CreationDraft over the academy break-in scene;
 * `createNewGame` turns a valid draft into the first GameState.
 */

export const BASE_STAT = 5;
export const TRAIT_COUNT = 2;

export interface CreationDraft {
  readonly name: string;
  /** Used only when clanless; clan members take the clan's name. */
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Appearance;
  readonly clanId: string;
  readonly grades: Grades;
  readonly nature: Element;
  readonly traitIds: readonly string[];
  readonly talentId: string;
  readonly nindoId: string;
  readonly breakInApproachId: string;
}

export interface NewGameOptions {
  readonly draft: CreationDraft;
  readonly seed: number;
}

export interface BreakInRoll {
  readonly succeeded: boolean;
  readonly chance: number;
  readonly text: string;
  /** RNG state after the roll, so the game continues the same sequence. */
  readonly rngState: number;
}

/** The opening dice roll. Deterministic for a seed, so the UI and the game agree. */
export function rollBreakIn(ctx: GameContext, approachId: string, seed: number): BreakInRoll {
  const approach = ctx.content.breakIn.approaches.find((a) => a.id === approachId);
  if (!approach) throw new Error(`Unknown break-in approach "${approachId}"`);
  const rng = createRng(seed);
  const chance = checkChance(BASE_STAT, approach.difficulty);
  const succeeded = rng.chance(chance);
  return {
    succeeded,
    chance,
    text: succeeded ? approach.success : approach.failure,
    rngState: rng.state(),
  };
}

/** Everything wrong with a draft (empty when it can start a game). */
export function draftProblems(draft: CreationDraft, ctx: GameContext): string[] {
  const { content } = ctx;
  const traits = draft.traitIds.map((id) => content.traits.get(id));
  const [first, second] = traits;
  const problems = [
    !draft.name.trim() && 'Write your name.',
    !content.clans.get(draft.clanId) && 'Choose your family.',
    !content.talents.get(draft.talentId) && 'Choose a special note.',
    !content.nindos.get(draft.nindoId) && 'Write your essay.',
    (traits.length !== TRAIT_COUNT || traits.some((t) => !t)) && 'Choose two traits.',
    first?.opposite === second?.id &&
      first !== undefined &&
      'Those two traits contradict each other.',
    gradesProblem(draft.grades),
  ];
  return problems.filter((p): p is string => typeof p === 'string');
}

function startingTechniques(draft: CreationDraft, ctx: GameContext): string[] {
  const { content } = ctx;
  const clan = content.clans.require(draft.clanId);
  const starters = topDisciplines(draft.grades).map((d) => content.disciplineStarters[d]);
  return [...new Set([...content.academyTechniques, ...clan.startingTechniqueIds, ...starters])];
}

function housingFor(draft: CreationDraft, ctx: GameContext, homeId: string, rent: number) {
  const lodging = ctx.content.clans.require(draft.clanId).lodging;
  return lodging
    ? freeLodging(homeId, lodging, START_TIME.day)
    : newTenancy(homeId, rent, START_TIME.day);
}

export function createNewGame({ draft, seed }: NewGameOptions, ctx: GameContext): GameState {
  const problems = draftProblems(draft, ctx);
  if (problems.length > 0) throw new Error(`Invalid character: ${problems.join(' ')}`);
  const { content } = ctx;
  const clan = content.clans.require(draft.clanId);
  const talent = content.talents.require(draft.talentId);
  const stats = createStats(
    BASE_STAT,
    sumDeltas(clan.statBonuses, talent.statBonuses, gradeStatBonuses(draft.grades)),
  );
  const location = { locationId: content.startLocationId };
  const home = placeHere(location, ctx, 'home');
  if (!home) throw new Error(`Start location "${content.startLocationId}" has no home`);
  const roll = rollBreakIn(ctx, draft.breakInApproachId, seed);

  const state: GameState = {
    packId: content.packId,
    rngState: roll.rngState,
    time: START_TIME,
    ...location,
    character: {
      name: draft.name.trim(),
      familyName: clan.id === 'none' ? draft.familyName.trim() : clan.name,
      pronouns: draft.pronouns,
      appearance: draft.appearance,
      clanId: clan.id,
      grades: draft.grades,
      nature: draft.nature,
      traitIds: draft.traitIds,
      talentId: talent.id,
      nindoId: draft.nindoId,
      breakIn: { approachId: draft.breakInApproachId, succeeded: roll.succeeded },
      stats,
      startingStats: stats,
      vitals: fullVitals(stats),
    },
    wallet: { ryo: content.startingRyo },
    housing: housingFor(draft, ctx, home.id, home.rentPerWeek),
    techniques: { known: startingTechniques(draft, ctx), progress: {} },
    standing: NEW_GENIN,
    journal: EMPTY_JOURNAL,
    mission: null,
    combat: null,
    reports: [],
    people: NO_PEOPLE,
    settings: defaultSettings(ctx),
    board: newBoard(seed),
  };
  return logOpening(state, ctx, roll);
}

function logOpening(state: GameState, ctx: GameContext, roll: BreakInRoll): GameState {
  const { breakIn, text } = ctx.content;
  const approach = breakIn.approaches.find((a) => a.id === state.character.breakIn.approachId);
  const stat = approach ? STAT_INFO[approach.stat].label : 'Luck';
  const pct = `${Math.round(roll.chance * 100)}%`;
  let next = log(state, {
    heading: 'The night before graduation',
    text: breakIn.intro,
    tone: 'info',
  });
  next = log(next, {
    heading: approach?.label ?? 'Break in',
    text: roll.text,
    tone: roll.succeeded ? 'success' : 'warning',
    chips: [
      chip(
        `${stat} check · ${pct} · ${roll.succeeded ? 'passed' : 'failed'}`,
        roll.succeeded ? 'gain' : 'harm',
      ),
    ],
  });
  next = log(next, { text: breakIn.caught, tone: 'info' });
  return log(next, { heading: 'Graduation', text: text.intro, tone: 'success' });
}
