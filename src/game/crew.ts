import type { PersonDef } from '@/content';
import { jobProfile, postedAway } from '@/content';
import { hashUnit } from '@/core';
import {
  crewOptions,
  pickCrewKind,
  SOLO,
  type Assignee,
  type Crew,
  type CrewKind,
  type JobProfile,
  type MissionDef,
} from '@/systems/missions';
import type { Standing } from '@/systems/standing';

import type { GameContext } from './context';
import { underSensei } from './mentorship';
import { villagers } from './people/cast';
import { missionThreat } from './scouting';
import type { GameState } from './state';

/**
 * Who the village sends with you on a job. The rules (`systems/missions/crew.ts`) say which
 * crews a job may get; this picks one for each posting and names the people, both by a hash of
 * the save's seed, the day it went up and the job, so the notice and the job agree and nothing
 * draws on the game's dice.
 */

/** Genin a chūnin may be given to lead, fewest and most. */
export const GENIN_SQUAD_SIZES = [2, 3] as const;
/** Other chūnin who go with you in a squad, most. */
export const CHUNIN_SQUAD_MAX = 2;
/** Chūnin under a jōnin on an A-rank job. */
export const JONIN_LED_CHUNIN = 2;
/** The share of chūnin squads one of the others leads, when you are only a chūnin yourself. */
export const SQUAD_LED_BY_OTHER = 0.5;

/** Mission ranks, lowest first; from `SERIOUS_RANK` up, the sensei leads your old team. */
const RANK_ORDER: readonly MissionDef['rank'][] = ['D', 'C', 'B', 'A', 'S'];
export const SERIOUS_RANK: MissionDef['rank'] = 'C';

/**
 * Whether a job is serious enough for the sensei to lead the old team: C-rank and up, or a foe
 * the notice reads as far stronger than you.
 */
export function seriousJob(state: GameState, ctx: GameContext, def: MissionDef): boolean {
  if (RANK_ORDER.indexOf(def.rank) >= RANK_ORDER.indexOf(SERIOUS_RANK)) return true;
  return missionThreat(state, ctx, def)?.threat === 'much-stronger';
}

const profiles = new WeakMap<MissionDef, JobProfile>();

/** A job's rank, danger and whether it leaves the village, worked out once per job. */
export function jobOf(ctx: GameContext, def: MissionDef): JobProfile {
  const known = profiles.get(def);
  if (known) return known;
  const away = postedAway(ctx.content.locations.all, ctx.content.startLocationId, def.id);
  const profile = jobProfile(def, (id) => ctx.content.enemies.get(id), away);
  profiles.set(def, profile);
  return profile;
}

export function assigneeOf(standing: Standing): Assignee {
  return { rank: standing.rank, seniorMissions: standing.seniorMissionsCompleted };
}

interface CrewPick {
  readonly state: GameState;
  readonly ctx: GameContext;
  readonly def: MissionDef;
  readonly day: number;
}

/** People in hash order for this posting, so each job gets its own faces. */
function shuffled(pick: CrewPick, people: readonly PersonDef[]): PersonDef[] {
  const seed = pick.state.board.seed;
  return people
    .map((p) => ({ p, k: hashUnit(seed, pick.day, pick.def.id, 'crew', p.id) }))
    .sort((a, b) => a.k - b.k)
    .map(({ p }) => p);
}

function pool(pick: CrewPick, rank: PersonDef['rank'], roles: readonly PersonDef['role'][]) {
  const team = new Set(pick.state.people.team?.teammateIds ?? []);
  const senseiId = pick.state.people.team?.senseiId;
  const fits = villagers(pick.state, pick.ctx).filter(
    (p) => p.rank === rank && roles.includes(p.role) && !team.has(p.id) && p.id !== senseiId,
  );
  return shuffled(pick, fits);
}

function roll(pick: CrewPick, what: string): number {
  return hashUnit(pick.state.board.seed, pick.day, pick.def.id, what);
}

function oldTeam(pick: CrewPick): Crew | null {
  const team = pick.state.people.team;
  if (!team || team.teammateIds.length === 0) return null;
  const leads = team.senseiId !== null && senseiLeads(pick);
  return { kind: 'old-team', leaderId: leads ? team.senseiId : null, memberIds: team.teammateIds };
}

/** Your sensei leads serious jobs, and every job out of the village in your genin years. */
function senseiLeads(pick: CrewPick): boolean {
  const away = underSensei(pick.state) && jobOf(pick.ctx, pick.def).away === true;
  return away || seriousJob(pick.state, pick.ctx, pick.def);
}

function geninSquad(pick: CrewPick): Crew | null {
  const [fewest, most] = GENIN_SQUAD_SIZES;
  const size = roll(pick, 'size') < 0.5 ? fewest : most;
  const genin = pool(pick, 'genin', ['genin']).slice(0, size);
  if (genin.length < fewest) return null;
  return { kind: 'genin-squad', leaderId: null, memberIds: genin.map((p) => p.id) };
}

function chuninSquad(pick: CrewPick): Crew | null {
  const chunin = pool(pick, 'chunin', ['shinobi']).slice(0, CHUNIN_SQUAD_MAX);
  const [first, ...rest] = chunin;
  if (!first) return null;
  const senior = pick.state.standing.rank !== 'chunin';
  const otherLeads = !senior && roll(pick, 'lead') < SQUAD_LED_BY_OTHER;
  return otherLeads
    ? { kind: 'chunin-squad', leaderId: first.id, memberIds: rest.map((p) => p.id) }
    : { kind: 'chunin-squad', leaderId: null, memberIds: chunin.map((p) => p.id) };
}

function joninLed(pick: CrewPick): Crew | null {
  const [jonin] = pool(pick, 'jonin', ['shinobi', 'sensei']);
  const chunin = pool(pick, 'chunin', ['shinobi']).slice(0, JONIN_LED_CHUNIN);
  if (!jonin || chunin.length === 0) return null;
  return { kind: 'jonin-led', leaderId: jonin.id, memberIds: chunin.map((p) => p.id) };
}

function staff(pick: CrewPick, kind: CrewKind): Crew | null {
  switch (kind) {
    case 'solo':
      return SOLO;
    case 'old-team':
      return oldTeam(pick);
    case 'genin-squad':
      return geninSquad(pick);
    case 'chunin-squad':
      return chuninSquad(pick);
    case 'jonin-led':
      return joninLed(pick);
    case 'exam-team':
    case 'companion':
      // Only an exam sends its own team, a friend comes on trips: never through the board.
      return null;
  }
}

/**
 * The crew a job posted on `day` goes out with, as your standing is now; null when nobody can
 * be sent with you (the job is never yours, or there's nobody to staff it).
 */
export function crewOn(
  state: GameState,
  ctx: GameContext,
  def: MissionDef,
  day: number,
): Crew | null {
  const pick: CrewPick = { state, ctx, def, day };
  const staffed = crewOptions(jobOf(ctx, def), assigneeOf(state.standing)).filter(
    (o) => staff(pick, o.kind) !== null,
  );
  const kind = pickCrewKind(staffed, roll(pick, 'kind'));
  return kind === null ? null : staff(pick, kind);
}

/** The crew on a job you are on, solo when nobody went. */
export function crewOf(state: Pick<GameState, 'mission'>): Crew {
  return state.mission?.crew ?? SOLO;
}
