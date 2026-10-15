import { BOND_STAGES, bondWith } from '@/systems/bonds';
import { MAX_HEALTH } from '@/systems/vitals';
import { act, ctx, intoFight, newGame, veteran, withAllStats } from '@/test/gameFixtures';
import { atEncounter, capable, spying, withStats } from '@/test/encounterFixtures';

import { attributesOf } from './combatants';
import { approachPlans } from './encounter/approaches';
import { encounterHere } from './encounter/current';
import { crewOn, jobOf, seriousJob } from './crew';
import { underSensei } from './mentorship';
import { MEDIC_CONTROL } from './missionTeam';
import { requirePerson } from './people/cast';
import { personStats } from './people/progress';
import { STANCE_ORDERS_STAGE } from './people/teamOrders';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { encounterScene } from './views/encounter';
import { missionScene } from './views/missionScene';

const TEAM_JOB = 'river-road-bandits';
const ESCORT_JOB = 'tea-merchant-escort';

/** A teammate's stats set outright (their grown stats, as the save keeps them). */
function teammateWith(
  state: GameState,
  index: number,
  stats: Partial<GameState['character']['stats']>,
): GameState {
  const id = state.people.team!.teammateIds[index]!;
  const person = requirePerson(state, ctx, id);
  const grown = { ...personStats(person, state), ...stats };
  const progress = { ...state.people.progress, [id]: { stats: grown, lastGrownDay: 9999 } };
  return { ...state, people: { ...state.people, progress } };
}

function hurt(state: GameState, health: number): GameState {
  const { character } = state;
  return { ...state, character: { ...character, vitals: { ...character.vitals, health } } };
}

/** On the team job, at its tracking check. */
function atTrail(start: GameState): GameState {
  const s = act(veteran(start, 2), { type: 'startMission', missionId: TEAM_JOB });
  return act(s, { type: 'missionContinue' });
}

describe('the sensei joins serious team missions', () => {
  it('leads a C-rank team job: the notice says so, and they fight beside you on their own terms', () => {
    const spy = spying();
    const start = withAllStats(veteran(newGame({}, spy.context), 2), 40);
    const sensei = requirePerson(start, ctx, start.people.team!.senseiId!);
    const notice = missionBoardView(start, ctx)!.notices.find((n) => n.id === TEAM_JOB);
    expect(notice?.crew?.line).toBe(`With your team, ${sensei.name} leading`);

    let s = act(start, { type: 'startMission', missionId: TEAM_JOB }, spy.context);
    s = act(s, { type: 'missionContinue' }, spy.context);
    s = act(s, { type: 'missionChoose', approachIndex: 0 }, spy.context);
    intoFight(s, spy.context);
    const allies = spy.setups[0]!.allies;
    expect(allies.map((a) => a.tag)).toEqual(['Teammate', 'Teammate', 'Sensei']);
    const theirs = allies[2]!;
    expect(theirs.attributes).toEqual(attributesOf(personStats(sensei, start)));
    expect(theirs.orders?.stanceLocked).toMatch(/doesn’t take orders|don’t take orders/);
    expect(theirs.orders?.cardsLocked).toBeDefined();
    // They fight by their ways: shield covers you, watchful supports, lets-fail holds back.
    const kind = { shield: 'cover', watchful: 'support', 'lets-fail': 'hold' }[
      sensei.sensei!.ways.onMissions
    ];
    expect(theirs.stance?.kind).toBe(kind);
    const signatures = sensei.teacher?.teaches ?? [];
    expect(theirs.techniques.map((t) => t.id)).toEqual(expect.arrayContaining([...signatures]));
  });

  it('stays home on easy jobs, but comes when the foes far outclass you', () => {
    const state = newGame();
    const team = ctx.content.missions.require(TEAM_JOB);
    const easy = { ...team, rank: 'D' as const };
    const day = state.time.day;
    expect(seriousJob(withAllStats(state, 60), ctx, easy)).toBe(false);
    expect(crewOn(withAllStats(state, 60), ctx, easy, day)?.leaderId).toBeNull();
    expect(seriousJob(withAllStats(state, 1), ctx, easy)).toBe(true);
    // An armed D-rank job: the team goes, but the sensei leaves it to them.
    const escort = crewOn(
      withAllStats(state, 60),
      ctx,
      ctx.content.missions.require(ESCORT_JOB),
      day,
    );
    expect(escort).toMatchObject({ kind: 'old-team', leaderId: null });
  });
});

describe('in the genin years, the sensei takes you out of the village', () => {
  const ROAD_CHORE = 'arc-salt-coast-road';
  const PORT_CHORE = 'harbour-lost-cargo';
  const chunin = (state: GameState): GameState => ({
    ...state,
    standing: { ...state.standing, rank: 'chunin' },
  });

  it('lasts while you are a genin with a sensei', () => {
    const state = newGame();
    expect(underSensei(state)).toBe(true);
    expect(underSensei(chunin(state))).toBe(false);
    expect(underSensei({ ...state, people: { ...state.people, team: null } })).toBe(false);
  });

  it('reads a job as away when it takes the road or is posted only in another town', () => {
    const job = (id: string) => jobOf(ctx, ctx.content.missions.require(id));
    expect(job(ROAD_CHORE).away).toBe(true);
    expect(job(PORT_CHORE).away).toBe(true);
    expect(job(ESCORT_JOB).away).toBe(false);
  });

  it('leads even a chore away from home, and leaves the chūnin to it alone', () => {
    const state = withAllStats(newGame(), 60);
    const senseiId = state.people.team!.senseiId;
    for (const id of [ROAD_CHORE, PORT_CHORE]) {
      const def = ctx.content.missions.require(id);
      expect(crewOn(state, ctx, def, state.time.day)).toMatchObject({
        kind: 'old-team',
        leaderId: senseiId,
      });
      expect(crewOn(chunin(state), ctx, def, state.time.day)?.kind).toBe('solo');
    }
  });
});

describe('mission roles', () => {
  it('a check with a role falls to the teammate best at it, and says who', () => {
    const start = teammateWith(withStats(newGame(), { perception: 1 }), 0, { perception: 60 });
    const name = requirePerson(start, ctx, start.people.team!.teammateIds[0]!).name;
    const s = atTrail(start);
    const [trail, guess] = missionScene(s, ctx)!.choices;
    expect(trail?.detail).toMatch(new RegExp(`^Perception 100%, ${name} the tracker$`));
    expect(guess?.detail).not.toMatch(name);
    const done = act(s, { type: 'missionChoose', approachIndex: 0 });
    expect(done.mission?.notes).toContainEqual({
      kind: 'choice',
      text: `Follow the trail (${name})`,
    });
    expect(done.mission?.stageIndex).toBe(2);
  });

  it('a medic teammate patches you up between stages', () => {
    let start = teammateWith(withAllStats(newGame(), 60), 0, { chakraControl: 12 });
    start = teammateWith(start, 1, { chakraControl: MEDIC_CONTROL });
    const s = hurt(atTrail(start), 50);
    const done = act(s, { type: 'missionChoose', approachIndex: 0 });
    expect(done.character.vitals.health).toBe(62);
    expect(done.mission?.notes.at(-1)).toMatchObject({ kind: 'story' });
    expect(done.journal.entries.at(-1)?.chips).toEqual([
      expect.objectContaining({ label: '+12 health' }),
    ]);
  });

  it('no medic without the control for it, and never past full health', () => {
    let start = teammateWith(withAllStats(newGame(), 60), 0, { chakraControl: MEDIC_CONTROL - 1 });
    start = teammateWith(start, 1, { chakraControl: 2 });
    const s = hurt(atTrail(start), 50);
    expect(act(s, { type: 'missionChoose', approachIndex: 0 }).character.vitals.health).toBe(50);

    const healer = teammateWith(withAllStats(newGame(), 60), 0, { chakraControl: 30 });
    const scratched = hurt(atTrail(healer), MAX_HEALTH - 5);
    const tended = act(scratched, { type: 'missionChoose', approachIndex: 0 });
    expect(tended.character.vitals.health).toBe(MAX_HEALTH);
  });
});

describe('sneaking as a team', () => {
  it('moves at the pace of its slowest who won’t take your orders', () => {
    const start = teammateWith(capable(), 0, { speed: 2 });
    const slow = requirePerson(start, ctx, start.people.team!.teammateIds[0]!).name;
    const s = atEncounter(TEAM_JOB, start);
    const here = encounterHere(s, ctx)!;
    const sneak = approachPlans(s, ctx, here).find((p) => p.id === 'sneak')!;
    expect(sneak.pace).toBe(slow);
    expect(sneak.stat).toBe('speed');
    const card = encounterScene(s, ctx)!.approaches.find((a) => a.id === 'sneak')!;
    expect(card.detail).toMatch(`at ${slow}’s pace`);

    // Once they count you friends, they hang back when told and you go at your own pace.
    const friends = Object.fromEntries(
      s.people.team!.teammateIds.map((id) => [id, bondWith(BOND_STAGES[STANCE_ORDERS_STAGE].min)]),
    );
    const bonds = { ...s.people.bonds, ...friends };
    const told: GameState = { ...s, people: { ...s.people, bonds } };
    const alone = approachPlans(told, ctx, encounterHere(told, ctx)!).find(
      (p) => p.id === 'sneak',
    )!;
    expect(alone.pace).toBeNull();
    expect(alone.chance).toBeGreaterThan(sneak.chance);
  });
});
