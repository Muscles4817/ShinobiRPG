import { crewOptions, dangerAtLeast, type CrewKind } from '@/systems/missions';
import { act, ctx, intoFight, newGame, pressOn, veteran, withAllStats } from '@/test/gameFixtures';
import { spying } from '@/test/encounterFixtures';

import { crewFor } from './board';
import { assigneeOf, crewOn, jobOf } from './crew';
import { requirePerson } from './people/cast';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';

/** A chūnin's C-rank job with a bandit camp; a chūnin's A-rank job. */
const C_JOB = 'river-road-bandits';
const A_JOB = 'border-fort-courier';
const DAYS_SEARCHED = 400;

function ranked(state: GameState, rank: GameState['standing']['rank']): GameState {
  return { ...veteran(state, 40), standing: { ...veteran(state, 40).standing, rank } };
}

/** The job re-posted on the first earlier day whose crew is `kind`. */
function postedWith(state: GameState, missionId: string, kind: CrewKind): GameState {
  const def = ctx.content.missions.require(missionId);
  for (let back = 0; back < DAYS_SEARCHED; back++) {
    const day = state.time.day - back;
    if (crewOn(state, ctx, def, day)?.kind !== kind) continue;
    const postings = state.board.postings.map((p) =>
      p.missionId === missionId ? { ...p, postedDay: day } : p,
    );
    return { ...state, board: { ...state.board, postings } };
  }
  throw new Error(`No day sends ${missionId} with a ${kind} crew`);
}

describe('who goes on a job', () => {
  it('never sends a genin alone against anything worse than a petty foe', () => {
    const genin = newGame();
    for (const def of ctx.content.missions.all.filter((m) => !m.examOnly)) {
      const job = jobOf(ctx, def);
      for (let day = 1; day < 30; day++) {
        const crew = crewOn(genin, ctx, def, day);
        if (crew?.kind === 'solo') expect(job.danger === null || job.danger === 'petty').toBe(true);
        if (job.rank === 'B' || job.rank === 'A') expect(crew).toBeNull();
      }
    }
  });

  it('sends a genin’s whole team on an armed job, and names it on the notice', () => {
    const state = veteran(newGame(), 5);
    const escort = ctx.content.missions.require('tea-merchant-escort');
    expect(dangerAtLeast(jobOf(ctx, escort).danger!, 'armed')).toBe(true);
    expect(crewFor(state, ctx, escort)).toEqual({
      kind: 'old-team',
      leaderId: null,
      memberIds: state.people.team!.teammateIds,
    });
    const notice = missionBoardView(state, ctx)!.notices.find((n) => n.id === escort.id);
    expect(notice?.crew).toEqual({ line: 'With your team', youLead: true });
  });

  it('gives a chūnin genin to lead, other chūnin, or a jōnin over them, as the rules allow', () => {
    const chunin = ranked(newGame(), 'chunin');
    const team = new Set(chunin.people.team!.teammateIds);
    const cJob = ctx.content.missions.require(C_JOB);
    const seen = new Set<CrewKind>();
    for (let day = 1; day < 120; day++) {
      const crew = crewOn(chunin, ctx, cJob, day)!;
      seen.add(crew.kind);
      const people = crew.memberIds.map((id) => requirePerson(chunin, ctx, id));
      if (crew.kind === 'genin-squad') {
        expect(people.every((p) => p.rank === 'genin' && !team.has(p.id))).toBe(true);
        expect(people.length).toBeGreaterThanOrEqual(2);
      }
      if (crew.kind === 'chunin-squad') expect(people.every((p) => p.rank === 'chunin')).toBe(true);
    }
    expect([...seen].sort()).toEqual(
      crewOptions(jobOf(ctx, cJob), assigneeOf(chunin.standing))
        .map((o) => o.kind)
        .sort(),
    );

    const aCrew = crewOn(chunin, ctx, ctx.content.missions.require(A_JOB), 1)!;
    expect(aCrew.kind).toBe('jonin-led');
    expect(requirePerson(chunin, ctx, aCrew.leaderId!).rank).toBe('jonin');
  });

  it('keeps who went on the run, and the genin you lead take every order', () => {
    const spy = spying();
    const chunin = withAllStats(postedWith(ranked(newGame(), 'chunin'), C_JOB, 'genin-squad'), 40);
    let s = act(chunin, { type: 'startMission', missionId: C_JOB }, spy.context);
    expect(s.mission?.crew.kind).toBe('genin-squad');
    s = act(s, { type: 'missionContinue' }, spy.context);
    s = act(s, { type: 'missionChoose', approachIndex: 0 }, spy.context);
    intoFight(s, spy.context);
    const allies = spy.setups[0]!.allies;
    expect(allies.length).toBe(s.mission!.crew.memberIds.length);
    expect(allies.every((a) => a.orders && Object.keys(a.orders).length === 0)).toBe(true);
  });

  it('in a chūnin squad, the notice says who leads', () => {
    const spy = spying();
    const chunin = withAllStats(postedWith(ranked(newGame(), 'chunin'), C_JOB, 'chunin-squad'), 40);
    const led = crewFor(chunin, ctx, ctx.content.missions.require(C_JOB))!;
    const s = act(chunin, { type: 'startMission', missionId: C_JOB }, spy.context);
    expect(s.mission?.crew).toEqual(led);
    const notice = missionBoardView(chunin, ctx)!.notices.find((n) => n.id === C_JOB);
    const lead = led.leaderId ? requirePerson(chunin, ctx, led.leaderId).name : null;
    expect(notice?.crew?.youLead).toBe(lead === null);
    if (lead) expect(notice?.crew?.line).toMatch(new RegExp(`^${lead}`));
  });
});

describe('a jōnin-led job', () => {
  it('has the jōnin fight their own way and give the orders', () => {
    const spy = spying();
    const chunin = withAllStats(ranked(newGame(), 'chunin'), 60);
    const crew = crewFor(chunin, ctx, ctx.content.missions.require(A_JOB))!;
    const jonin = requirePerson(chunin, ctx, crew.leaderId!);
    let s = act(chunin, { type: 'startMission', missionId: A_JOB }, spy.context);
    for (let i = 0; i < 10 && !s.combat; i++) s = pressOn(s, spy.context);
    const allies = spy.setups[0]!.allies;
    const leader = allies.find((a) => a.tag === 'Leader')!;
    expect(leader.name).toBe(jonin.name);
    expect(leader.orders?.stanceLocked).toMatch(`${jonin.name} leads this mission`);
    const members = allies.filter((a) => a.tag === 'Teammate');
    expect(members.length).toBe(crew.memberIds.length);
    expect(
      members.every(
        (m) => m.orders?.stanceLocked === `${jonin.name} gives the orders on this job.`,
      ),
    ).toBe(true);
  });
});
