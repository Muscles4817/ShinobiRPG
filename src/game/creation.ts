import { createRng } from '@/core';
import { freeLodging, newTenancy } from '@/systems/housing';
import { EMPTY_INVENTORY } from '@/systems/inventory';
import { EMPTY_JOURNAL } from '@/systems/journal';
import {
  GRADES,
  gradesFor,
  giftsKnown,
  STANDING_INFO,
  topDisciplines,
  withGifts,
  type AcademyFile,
  type Appearance,
  type ClassStanding,
  type Grades,
  type Pronouns,
  type QuickPick,
} from '@/systems/profile';
import { NEW_GENIN } from '@/systems/standing';
import { checkChance, nothingKnown, STAT_INFO } from '@/systems/stats';
import { DISCIPLINES, type Discipline, type Element } from '@/systems/techniques';
import { START_TIME } from '@/systems/time';
import { fullVitals } from '@/systems/vitals';

import { rollCharacterAptitude } from './aptitude';
import type { GameContext } from './context';
import { chip, log, placeHere } from './ops';
import { newBoard } from './boardState';
import { NO_EXAMS } from './exam/state';
import { defaultSettings } from './fightStyle';
import { withIssuedBlade } from './gear';
import { NO_PEOPLE } from './people/state';
import type { GameState } from './state';
import { BASE_STAT, graduationStats, studentProblems, type StudentProfile } from './student';

/**
 * Character creation. The UI collects a CreationDraft over the academy break-in scene;
 * `createNewGame` turns a valid draft into the first GameState.
 */

export const TRAIT_COUNT = 2;

export interface CreationDraft {
  readonly name: string;
  /** Used only when clanless; clan members take the clan's name. */
  readonly familyName: string;
  readonly pronouns: Pronouns;
  readonly appearance: Appearance;
  readonly clanId: string;
  /** Where they stood in their class; with fate, what the file turned out to say. */
  readonly standing: ClassStanding;
  /** The player let fate decide the standing (the file revealed it). */
  readonly fated?: boolean;
  /** How they were raised (`UpbringingDef`): their early training. */
  readonly upbringingId: string;
  /** Their frame (`BuildDef`). */
  readonly buildId: string;
  /** Early training, known gifts and flaws, and when they bloomed. */
  readonly file: AcademyFile;
  /** The kind of student the file was filled for, or null when it was written by hand. */
  readonly quickPick: QuickPick | null;
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
  /** The break-in's dice after the roll; creation goes on to roll aptitude from them. */
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
    ...studentProblems(profileOf(draft), ctx),
  ];
  return problems.filter((p): p is string => typeof p === 'string');
}

/** The draft as the student it describes. */
export function profileOf(draft: CreationDraft): StudentProfile {
  return {
    clanId: draft.clanId,
    talentId: draft.talentId,
    buildId: draft.buildId,
    upbringingId: draft.upbringingId,
    standing: draft.standing,
    file: draft.file,
  };
}

function startingTechniques(draft: CreationDraft, grades: Grades, ctx: GameContext): string[] {
  const { content } = ctx;
  const clan = content.clans.require(draft.clanId);
  const starters = topDisciplines(grades).map((d) => content.disciplineStarters[d]);
  return [...new Set([...content.academyTechniques, ...clan.startingTechniqueIds, ...starters])];
}

/** The arts graded highest on the file: the roll never voids them, and a genius's are gifted. */
function bestArts(grades: Grades): Discipline[] {
  const best = GRADES.find((g) => DISCIPLINES.some((d) => grades[d] === g));
  return DISCIPLINES.filter((d) => grades[d] === best);
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
  const stats = graduationStats(profileOf(draft), ctx);
  const grades = gradesFor(stats);
  const location = { locationId: content.startLocationId };
  const home = placeHere(location, ctx, 'home');
  if (!home) throw new Error(`Start location "${content.startLocationId}" has no home`);
  const roll = rollBreakIn(ctx, draft.breakInApproachId, seed);
  const dice = createRng(roll.rngState);
  const shape = { band: STANDING_INFO[draft.standing].talent, specialties: bestArts(grades) };
  const rolled = rollCharacterAptitude(dice, clan, talent, shape);
  // What the special note fixes (an art that never takes) stands over any gift.
  const aptitude = { ...withGifts(rolled, draft.file.gifts), ...talent.aptitude };
  const known = startingTechniques(draft, grades, ctx);

  const state: GameState = {
    packId: content.packId,
    rngState: dice.state(),
    time: START_TIME,
    ...location,
    character: {
      name: draft.name.trim(),
      familyName: clan.id === 'none' ? draft.familyName.trim() : clan.name,
      pronouns: draft.pronouns,
      appearance: draft.appearance,
      clanId: clan.id,
      grades,
      classStanding: draft.standing,
      upbringingId: draft.upbringingId,
      buildId: draft.buildId,
      nature: draft.nature,
      traitIds: draft.traitIds,
      talentId: talent.id,
      nindoId: draft.nindoId,
      breakIn: { approachId: draft.breakInApproachId, succeeded: roll.succeeded },
      stats,
      startingStats: stats,
      aptitude,
      aptitudeKnown: giftsKnown(nothingKnown(), draft.file.gifts),
      aptitudeSessions: {},
      vitals: fullVitals(stats),
      meal: null,
      injuries: [],
      exhaustion: null,
    },
    wallet: { ryo: content.startingRyo },
    housing: housingFor(draft, ctx, home.id, home.rentPerWeek),
    techniques: { known, progress: {}, unstable: [] },
    standing: NEW_GENIN,
    journal: EMPTY_JOURNAL,
    mission: null,
    combat: null,
    combatFinale: null,
    reports: [],
    people: NO_PEOPLE,
    settings: defaultSettings(ctx),
    board: newBoard(seed),
    inventory: withIssuedBlade(EMPTY_INVENTORY, known, content),
    village: { lastSightDay: null, lastRoundDay: null, marks: [], memories: [], clients: {} },
    exams: NO_EXAMS,
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
        `${stat} check ${roll.succeeded ? 'passed' : 'failed'} at ${pct}`,
        roll.succeeded ? 'gain' : 'harm',
      ),
    ],
  });
  next = log(next, { text: breakIn.caught, tone: 'info' });
  return log(next, { heading: 'Graduation', text: text.intro, tone: 'success' });
}
