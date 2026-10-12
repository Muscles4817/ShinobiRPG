import { act, ctx, newGame, veteran, withAllStats } from '@/test/gameFixtures';
import { atEncounter, capable, hardCtx, SURE, withStats } from '@/test/encounterFixtures';

import { dispatch } from './dispatch';
import { OBSERVE_ENERGY, ASK_AROUND_FEE, reconPlans } from './encounter/recon';
import { encounterHere } from './encounter/current';
import { bestHandFor } from './missionRoles';
import type { GameState } from './state';
import { activeScene } from './views/peopleScenes';
import { encounterScene } from './views/encounter';

function known(state: GameState) {
  return state.mission?.encounter?.known ?? [];
}

describe('stepping into an encounter', () => {
  it('takes over the screen, and what the client’s report said is already known', () => {
    const plain = atEncounter('academy-dropout');
    expect(activeScene(plain)).toBe('encounter');
    expect(known(plain)).toEqual([]);
    expect(encounterScene(plain, ctx)?.foes).toBeNull();

    const briefed = capable();
    const withReport = { ...briefed, board: { ...briefed.board, intel: ['academy-dropout'] } };
    const told = atEncounter('academy-dropout', withReport);
    expect(known(told)).toEqual(['identity', 'kit']);
    expect(encounterScene(told, ctx)?.foes).toEqual([
      expect.objectContaining({ name: 'Academy Dropout', count: 1 }),
    ]);
  });

  it('keeps the mission busy: the mission can’t be pressed on until you choose a way in', () => {
    const s = atEncounter('academy-dropout');
    expect(dispatch(s, { type: 'missionContinue' }, ctx)).toEqual({
      ok: false,
      error: 'Choose how to go in first.',
    });
  });
});

describe('recon', () => {
  it('watching reveals how many, the ground and their awareness, for some energy', () => {
    const s = atEncounter('academy-dropout');
    const watched = act(s, { type: 'encounterRecon', recon: 'observe' });
    expect(known(watched)).toEqual(['count', 'terrain', 'awareness']);
    expect(watched.mission?.encounter?.alertness).toBe('wary');
    expect(watched.character.vitals.energy).toBe(s.character.vitals.energy - OBSERVE_ENERGY);
    expect(watched.mission?.notes.slice(-3).map((n) => n.kind)).toEqual([
      'choice',
      'roll',
      'story',
    ]);
    const facts = encounterScene(watched, ctx)!.facts;
    expect(facts.find((f) => f.fact === 'awareness')?.value).toMatch(/Uneasy/);
    expect(facts.find((f) => f.fact === 'identity')?.value).toBeNull();
  });

  it('nothing more to learn the same way once it has told you everything', () => {
    const s = act(atEncounter('academy-dropout'), { type: 'encounterRecon', recon: 'observe' });
    expect(dispatch(s, { type: 'encounterRecon', recon: 'observe' }, ctx)).toEqual({
      ok: false,
      error: 'Nothing more to learn that way.',
    });
  });

  it('failing puts them on guard, a step at a time, and the looks run out', () => {
    let s = atEncounter('academy-dropout', capable(hardCtx), hardCtx);
    expect(s.mission?.encounter?.alertness).toBe('wary');
    s = act(s, { type: 'encounterRecon', recon: 'observe' }, hardCtx);
    expect(s.mission?.encounter?.alertness).toBe('alert');
    expect(known(s)).toEqual([]);
    s = act(s, { type: 'encounterRecon', recon: 'track' }, hardCtx);
    s = act(s, { type: 'encounterRecon', recon: 'observe' }, hardCtx);
    expect(s.mission?.encounter?.alertness).toBe('alert');
    expect(dispatch(s, { type: 'encounterRecon', recon: 'track' }, hardCtx)).toEqual({
      ok: false,
      error: 'You’ve scouted all you can without being seen.',
    });
  });

  it('asking around always works, for ryo, but not when you hold the client’s report', () => {
    const s = atEncounter('academy-dropout');
    const asked = act(s, { type: 'encounterRecon', recon: 'ask' });
    expect(known(asked)).toEqual(['identity', 'kit']);
    expect(asked.wallet.ryo).toBe(s.wallet.ryo - ASK_AROUND_FEE);

    const briefed = capable();
    const told = atEncounter('academy-dropout', {
      ...briefed,
      board: { ...briefed.board, intel: ['academy-dropout'] },
    });
    expect(dispatch(told, { type: 'encounterRecon', recon: 'ask' }, ctx)).toEqual({
      ok: false,
      error: 'You already have the client’s report.',
    });
  });

  it('sensing needs a way to feel chakra', () => {
    const s = withStats(atEncounter('academy-dropout'), { ninjutsu: 4 });
    expect(dispatch(s, { type: 'encounterRecon', recon: 'sense' }, ctx)).toEqual({
      ok: false,
      error: 'You can’t feel chakra yet. Learn a sensing technique, or raise ninjutsu to D.',
    });
    const sensor = act(withStats(s, { ninjutsu: SURE }), {
      type: 'encounterRecon',
      recon: 'sense',
    });
    expect(known(sensor)).toEqual(['count', 'kit', 'awareness']);
  });
});

describe('mission roles', () => {
  /** On a team job with your perception at 3, the first teammate's at `best`, the rest at 1. */
  function onTeamJob(best: number): GameState {
    const start = withAllStats(veteran(newGame(), 5), SURE);
    const s = withStats(atEncounter('river-road-bandits', start), { perception: 3 });
    const mates = s.people.team?.teammateIds ?? [];
    const progress = Object.fromEntries(
      mates.map((id, i) => [
        id,
        {
          stats: { ...s.character.stats, perception: i === 0 ? best : 1 },
          lastGrownDay: s.time.day,
        },
      ]),
    );
    return { ...s, people: { ...s.people, progress: { ...s.people.progress, ...progress } } };
  }

  it('the teammate best at a check takes it on a team job', () => {
    const s = onTeamJob(20);
    const [mate] = s.people.team?.teammateIds ?? [];
    expect(bestHandFor(s, ctx, 'perception')).toMatchObject({ personId: mate, value: 20 });
    const track = reconPlans(s, ctx, encounterHere(s, ctx)!).find((p) => p.id === 'track');
    expect(track?.hand.personId).toBe(mate);
    expect(encounterScene(s, ctx)?.recon.find((r) => r.id === 'track')?.odds).toMatch(/, /);
  });

  it('you take it when you are the best, and always alone', () => {
    expect(bestHandFor(onTeamJob(1), ctx, 'perception').personId).toBeNull();
    const solo = withStats(atEncounter('academy-dropout'), { perception: 2 });
    expect(bestHandFor(solo, ctx, 'perception')).toMatchObject({ personId: null, value: 2 });
  });
});
