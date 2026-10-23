import { createRng } from '@/core';
import { EMPTY_FIELD_BOOK } from '@/systems/collections';
import { learnRecipes, NO_COOKING } from '@/systems/cooking';
import {
  addFurniture,
  freeLodging,
  newTenancy,
  placeFurniture,
  type HomeRef,
} from '@/systems/housing';
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
  type ClassStanding,
  type Grades,
  type Look,
  type Pronouns,
  type QuickPick,
} from '@/systems/profile';
import { NEW_GENIN } from '@/systems/standing';
import { checkChance, nothingKnown, STAT_INFO, type Sex } from '@/systems/stats';
import { DISCIPLINES, type Discipline } from '@/systems/techniques';
import { START_TIME } from '@/systems/time';
import { NOTHING_TOLD } from '@/systems/telling';
import { NO_LEAVE } from '@/systems/travel';
import { homeAtlas } from './atlas';
import type { HiveShare } from '@/systems/hives';
import { fullVitals } from '@/systems/vitals';

import { rollCharacterAptitude } from './aptitude';
import { bornFor } from './born';
import type { GameContext } from './context';
import { chip, log, placeHere } from './ops';
import { newBoard } from './boardState';
import { NO_EXAMS } from './exam/state';
import { defaultSettings } from './fightStyle';
import { withIssuedBlade } from './gear';
import { NO_PEOPLE } from './people/state';
import { NO_MENTOR } from './sensei/state';
import { openDay } from './daybook/open';
import { NO_DAYBOOK } from './daybook/state';
import { bornCompanions, kindOf, playerCompanion } from './companions/make';
import { bornHive, chakraBody, DEFAULT_SHARE } from './hives/hive';
import { bornDust } from './dust/dust';
import type { GameState } from './state';
import { homeClans } from './homeClans';
import { bornNature } from './nature';
import { notesAptitude, notesProblems } from './notes';
import { BASE_STAT, graduationStats, studentProblems, type StudentProfile } from './student';
import { graduationMastery } from './weaponMastery';

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
  /** Their body's sex, which shapes how it was drawn; never read from pronouns. */
  readonly sex: Sex;
  /**
   * The seed their body and mind were drawn from (`game/born.ts`), set by the creation scene; null
   * is the middle of the class.
   */
  readonly bornSeed: number | null;
  readonly appearance: Look;
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
  readonly traitIds: readonly string[];
  readonly talentIds: readonly string[];
  readonly quirkIds: readonly string[];
  readonly nindoId: string;
  readonly breakInApproachId: string;
  /** How much of their chakra a child of a hive clan gave the hive at birth. */
  readonly hiveShare?: HiveShare;
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
    !homeClans(content).some((c) => c.id === draft.clanId) && 'Choose your family.',
    ...notesProblems(draft, ctx),
    draft.quirkIds.some((id) => !content.quirks.get(id)) && 'That habit isn’t on the list.',
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
    talentIds: draft.talentIds,
    buildId: draft.buildId,
    upbringingId: draft.upbringingId,
    standing: draft.standing,
    file: draft.file,
    born: bornFor(draft.bornSeed, draft.sex),
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

function housingFor(draft: CreationDraft, ctx: GameContext, home: HomeRef, rent: number) {
  const lodging = ctx.content.clans.require(draft.clanId).lodging;
  const housing = lodging
    ? freeLodging(home, lodging, START_TIME.day)
    : newTenancy(home, rent, START_TIME.day);
  // Every new home has the starter furniture laid out (a futon, at least).
  return ctx.content.furnishings.all
    .filter((f) => f.starter)
    .reduce((h, f) => placeFurniture(addFurniture(h, f.id), f.spot, f.id), housing);
}

export function createNewGame({ draft, seed }: NewGameOptions, ctx: GameContext): GameState {
  const problems = draftProblems(draft, ctx);
  if (problems.length > 0) throw new Error(`Invalid character: ${problems.join(' ')}`);
  const { content } = ctx;
  const clan = content.clans.require(draft.clanId);
  const notes = draft.talentIds.map((id) => content.talents.require(id));
  const stats = graduationStats(profileOf(draft), ctx);
  const grades = gradesFor(stats);
  const location = { locationId: content.startLocationId };
  const home = placeHere(location, ctx, 'home');
  if (!home) throw new Error(`Start location "${content.startLocationId}" has no home`);
  const roll = rollBreakIn(ctx, draft.breakInApproachId, seed);
  const dice = createRng(roll.rngState);
  const shape = { band: STANDING_INFO[draft.standing].talent, specialties: bestArts(grades) };
  const rolled = rollCharacterAptitude(dice, clan, notes, shape);
  // What a special note fixes (an art that never takes) stands over any gift.
  const aptitude = { ...withGifts(rolled, draft.file.gifts), ...notesAptitude(notes) };
  const known = startingTechniques(draft, grades, ctx);
  const hive = bornHive(clan, draft.hiveShare ?? DEFAULT_SHARE, stats, ctx);

  const state: GameState = {
    packId: content.packId,
    edits: ctx.edits,
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
      breakthroughs: [],
      nature: bornNature(seed, clan),
      natureKnown: false,
      traitIds: draft.traitIds,
      talentIds: notes.map((n) => n.id),
      quirkIds: draft.quirkIds,
      nindoId: draft.nindoId,
      breakIn: { approachId: draft.breakInApproachId, succeeded: roll.succeeded },
      stats,
      startingStats: stats,
      aptitude,
      aptitudeKnown: giftsKnown(nothingKnown(), draft.file.gifts),
      aptitudeSessions: {},
      vitals: fullVitals(chakraBody({ character: { stats }, hive })),
      meal: null,
      assignment: null,
      injuries: [],
      exhaustion: null,
      weaponMastery: graduationMastery(stats),
    },
    wallet: { ryo: content.startingRyo },
    housing: housingFor(
      draft,
      ctx,
      { villageId: content.startLocationId, placeId: home.id },
      home.rentPerWeek,
    ),
    techniques: { known, progress: {}, unstable: [], repertoire: null, chains: null },
    standing: NEW_GENIN,
    journal: EMPTY_JOURNAL,
    mission: null,
    combat: null,
    combatFinale: null,
    journeyEnd: null,
    reports: [],
    people: NO_PEOPLE,
    settings: defaultSettings(ctx),
    board: newBoard(seed),
    inventory: withIssuedBlade(EMPTY_INVENTORY, known, content),
    village: {
      lastSightDay: null,
      lastRoundDay: null,
      marks: [],
      memories: [],
      clients: {},
      tallies: {},
    },
    exams: NO_EXAMS,
    leave: NO_LEAVE,
    atlas: homeAtlas(ctx),
    mentor: NO_MENTOR,
    told: NOTHING_TOLD,
    daybook: NO_DAYBOOK,
    rival: null,
    fieldBook: EMPTY_FIELD_BOOK,
    companions: bornCompanions(clan, seed, ctx),
    contract: null,
    hunt: { heat: 0 },
    brokenContracts: [],
    hive,
    rites: [],
    dust: bornDust(clan, ctx),
    dustScrolls: [],
    cooking: learnRecipes(
      NO_COOKING,
      content.recipes.all.filter((r) => r.starter === true).map((r) => r.id),
    ),
  };
  const opened = logOpening(state, ctx, roll);
  return { ...opened, daybook: { start: openDay(opened), ended: null } };
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
  next = log(next, { heading: 'Graduation', text: text.intro, tone: 'success' });
  const companion = playerCompanion(next);
  if (!companion) return next;
  const kind = kindOf(companion, ctx).name.toLowerCase();
  return log(next, {
    text: `${companion.name}, your ${kind}, has been at your side since you were small. They come too.`,
    tone: 'info',
  });
}
