import { v17ToV18 } from './aptitudeMigration';
import { v27ToV28, v28ToV29, v29ToV30 } from './crewMigration';
import { v23ToV24 } from './examMigration';
import { v24ToV25 } from './standingMigration';
import { v21ToV22 } from './gearMigration';
import { v25ToV26, v26ToV27 } from './settingsMigration';
import { v18ToV19 } from './peopleMigration';
import { v22ToV23 } from './scrollMigration';
import { v30ToV31 } from './permitMigration';
import { v31ToV32, v34ToV35 } from './cookingMigration';
import { v32ToV33 } from './creationMigration';
import { v33ToV34 } from './breakthroughMigration';
import { v35ToV36 } from './natureMigration';
// Technique ranks (4.1) follow teaching (3.3): its step moves up one version.
import { v19ToV20 as v20ToV21 } from './rankMigration';
import { v19ToV20 } from './teachingMigration';

/**
 * Save migrations, keyed by the version being migrated *from*. Each step takes the raw
 * state object of one version and returns the next version's shape. Never edit a step
 * once released; add a new one instead.
 */
type RawState = Record<string, unknown>;
export type Migration = (state: RawState) => RawState;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [];
}

/**
 * v1 → v2: content packs, locations, housing and result cards arrive.
 * Every v1 save was played in the original setting, in Tōrōgakure.
 */
function v1ToV2(state: RawState): RawState {
  const character = asRecord(state.character);
  const time = asRecord(state.time);
  const day = typeof time.day === 'number' ? time.day : 1;
  const journal = asRecord(state.journal);
  const mission = state.mission === null ? null : asRecord(state.mission);
  return {
    ...state,
    packId: 'original',
    locationId: 'torogakure',
    character: { ...character, startingStats: character.stats },
    housing: { placeId: 'home', rentPerWeek: 30, paidThroughDay: day + 6 },
    reports: [],
    journal: {
      ...journal,
      entries: asArray(journal.entries).map((e) => ({ slot: 0, ...asRecord(e) })),
    },
    mission: mission && {
      ...mission,
      notes: asArray(mission.notes).map((text) => ({ kind: 'story', text: String(text) })),
    },
  };
}

const DISCIPLINE_IDS = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'];

/** New disciplines start at the base value for characters made before they existed. */
function withNewDisciplines(stats: unknown): RawState {
  return { kenjutsu: 5, fuuinjutsu: 5, ...asRecord(stats) };
}

/**
 * v2 → v3: the full character profile (clan, grades, nature, traits, talent, nindō,
 * appearance) and two new disciplines. Old characters become clanless, with their old
 * gift as their A-grade specialty.
 */
function v2ToV3(state: RawState): RawState {
  const character = asRecord(state.character);
  const { aptitudeId, ...rest } = character;
  const specialty = typeof aptitudeId === 'string' ? aptitudeId : 'taijutsu';
  const grades = Object.fromEntries(DISCIPLINE_IDS.map((d) => [d, d === specialty ? 'A' : 'C']));
  return {
    ...state,
    character: {
      ...rest,
      familyName: '',
      pronouns: 'they',
      appearance: {
        hairStyle: 'spiky',
        hairColour: '#4a2f1d',
        eyeColour: '#2a1d14',
        skinTone: '#e2b48c',
        outfitColour: '#e8823a',
        headband: 'forehead',
      },
      clanId: 'none',
      grades,
      nature: 'fire',
      traitIds: [],
      talentId: null,
      nindoId: null,
      breakIn: { approachId: 'none', succeeded: true },
      stats: withNewDisciplines(character.stats),
      startingStats: withNewDisciplines(character.startingStats),
    },
  };
}

/**
 * v3 → v4: people and bonds. Existing characters have no classmates yet; teams are read
 * out the next time they are free, exactly as for a new character.
 */
function v3ToV4(state: RawState): RawState {
  return { ...state, people: { generated: [], bonds: {}, team: null, conversation: null } };
}

/** v4 → v5: weekly sensei lessons and sparring. Nobody has had a lesson yet. */
function v4ToV5(state: RawState): RawState {
  const people = asRecord(state.people);
  const team =
    typeof people.team === 'object' && people.team !== null
      ? { ...asRecord(people.team), lastLessonDay: null }
      : null;
  return { ...state, people: { ...people, team, sparringWith: null } };
}

/** v5 → v6: per-save settings, starting with the fight style (the classic engine). */
function v5ToV6(state: RawState): RawState {
  return { ...state, settings: { combatStyle: 'duel-v1' } };
}

/** v6 → v7: the rotating jobs board, seeded from the save's dice so it differs per save. */
function v6ToV7(state: RawState): RawState {
  const seed = typeof state.rngState === 'number' ? state.rngState : 1;
  return { ...state, board: { seed, refreshedDay: 0, postings: [], lastTaken: {} } };
}

/** v7 → v8: inventory (gear and pantry) and today's home-cooked meal. */
function v7ToV8(state: RawState): RawState {
  const character = asRecord(state.character);
  return {
    ...state,
    character: { ...character, meal: null },
    inventory: { gear: [], equipped: {}, pantry: {} },
  };
}

/** v8 → v9: fight plans remembered between fights; nothing remembered yet. */
function v8ToV9(state: RawState): RawState {
  return { ...state, settings: { ...asRecord(state.settings), combatPlans: {} } };
}

/** v9 → v10: village life; no spirit followed yet. */
function v9ToV10(state: RawState): RawState {
  return { ...state, village: { lastSightDay: null } };
}

/** v10 → v11: izakaya rounds; none bought yet. */
function v10ToV11(state: RawState): RawState {
  return { ...state, village: { ...asRecord(state.village), lastRoundDay: null } };
}

/** v11 → v12: fight tools and mission intel; an empty pouch, no intel bought. */
function v11ToV12(state: RawState): RawState {
  return {
    ...state,
    inventory: { ...asRecord(state.inventory), tools: {} },
    board: { ...asRecord(state.board), intel: [] },
  };
}

/** Fight styles no longer offered: Mind Game (deleted) and Deck (shelved). */
const RETIRED_ENGINE_IDS: readonly unknown[] = ['mind-v1', 'deck-v1'];
const DEFAULT_ENGINE_ID = 'duel-v1';

/**
 * v12 → v13: the Mind Game and Deck fight styles are retired. Saves that chose one go back to
 * Classic, and a fight in progress in one is called off before any blow lands: a mission returns to
 * its fight stage (vitals only change when a fight resolves), a spar is simply cancelled.
 */
function v12ToV13(state: RawState): RawState {
  const settings = asRecord(state.settings);
  const combatPlans = Object.fromEntries(
    Object.entries(asRecord(settings.combatPlans)).filter(
      ([id]) => !RETIRED_ENGINE_IDS.includes(id),
    ),
  );
  const combatStyle = RETIRED_ENGINE_IDS.includes(settings.combatStyle)
    ? DEFAULT_ENGINE_ID
    : settings.combatStyle;
  const migrated = { ...state, settings: { ...settings, combatStyle, combatPlans } };
  if (!RETIRED_ENGINE_IDS.includes(asRecord(state.combat).engineId)) return migrated;
  return {
    ...migrated,
    combat: null,
    people: { ...asRecord(state.people), sparringWith: null },
  };
}

/** The one fight style offered from save version 14 on. */
const CANONICAL_ENGINE_ID = 'plan-v1';

/**
 * v13 → v14: Plan & Watch becomes the only fight style; Classic is shelved. A save that chose
 * any other style moves to Plan & Watch. A Classic fight in progress is left alone: the game
 * still routes it to the shelved Classic engine, so it finishes as it started.
 */
function v13ToV14(state: RawState): RawState {
  const settings = asRecord(state.settings);
  return { ...state, settings: { ...settings, combatStyle: CANONICAL_ENGINE_ID } };
}

/** Every human's health from save version 15 on. */
const HEALTH_MAX = 100;

function statOf(stats: RawState, id: string): number {
  const value = stats[id];
  return typeof value === 'number' ? value : 0;
}

/**
 * v14 → v15: health is 100 for everyone instead of growing with stamina and strength. Current
 * health keeps its fraction of the old maximum. A fight in progress keeps its own numbers; its
 * result sets health when it ends, as always.
 */
function v14ToV15(state: RawState): RawState {
  const character = asRecord(state.character);
  const stats = asRecord(character.stats);
  const vitals = asRecord(character.vitals);
  const oldMax = Math.round(60 + statOf(stats, 'stamina') * 4 + statOf(stats, 'strength'));
  const health = typeof vitals.health === 'number' ? vitals.health : oldMax;
  const rescaled = Math.round((health / oldMax) * HEALTH_MAX);
  return {
    ...state,
    character: {
      ...character,
      vitals: { ...vitals, health: Math.min(HEALTH_MAX, Math.max(0, rescaled)) },
    },
  };
}

/** Max chakra before save version 16, which grew with stamina and chakra control. */
function oldMaxChakra(stats: RawState): number {
  return Math.round(30 + statOf(stats, 'chakraControl') * 3 + statOf(stats, 'stamina') * 1.5);
}

/**
 * Reserves that keep max chakra where it was under the version 16 rule (30, plus 3.5 a point
 * of reserves, plus 1 a point of control). Written out here so the step never changes.
 */
function seededReserves(stats: RawState): number {
  const reserves = (oldMaxChakra(stats) - 30 - statOf(stats, 'chakraControl')) / 3.5;
  return Math.max(0, Math.round(reserves * 10) / 10);
}

function withReserves(stats: unknown): RawState {
  const record = asRecord(stats);
  return { ...record, reserves: seededReserves(record) };
}

/**
 * v15 → v16: chakra reserves become a stat and max chakra derives from them instead of from
 * stamina. Reserves are seeded so max chakra stays about where it was; current chakra is kept.
 */
function v15ToV16(state: RawState): RawState {
  const character = asRecord(state.character);
  return {
    ...state,
    character: {
      ...character,
      stats: withReserves(character.stats),
      startingStats: withReserves(character.startingStats),
    },
  };
}

/** v16 → v17: injuries and chakra exhaustion arrive; everyone starts unhurt and rested. */
function v16ToV17(state: RawState): RawState {
  const character = asRecord(state.character);
  return { ...state, character: { ...character, injuries: [], exhaustion: null } };
}

export const MIGRATIONS: Readonly<Record<number, Migration>> = {
  1: v1ToV2,
  2: v2ToV3,
  3: v3ToV4,
  4: v4ToV5,
  5: v5ToV6,
  6: v6ToV7,
  7: v7ToV8,
  8: v8ToV9,
  9: v9ToV10,
  10: v10ToV11,
  11: v11ToV12,
  12: v12ToV13,
  13: v13ToV14,
  14: v14ToV15,
  15: v15ToV16,
  16: v16ToV17,
  17: v17ToV18,
  18: v18ToV19,
  19: v19ToV20,
  20: v20ToV21,
  21: v21ToV22,
  22: v22ToV23,
  23: v23ToV24,
  24: v24ToV25,
  25: v25ToV26,
  26: v26ToV27,
  27: v27ToV28,
  28: v28ToV29,
  29: v29ToV30,
  30: v30ToV31,
  31: v31ToV32,
  32: v32ToV33,
  33: v33ToV34,
  34: v34ToV35,
  35: v35ToV36,
};
