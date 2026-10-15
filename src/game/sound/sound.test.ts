import { act, ctx, intoFight, newGame } from '@/test/gameFixtures';

import type { FightBeat } from '../views/fightReplay';
import {
  DEFAULT_AUDIO_SETTINGS,
  beatSound,
  clampVolume,
  musicMood,
  readAudioSettings,
  reportSound,
  soundAfter,
  writeAudioSettings,
} from '.';

/** Kite Day, the village's festival on the seventh of spring. */
const KITE_DAY = 7;

function beat(overrides: Partial<FightBeat>): FightBeat {
  return {
    kind: 'line',
    text: 'A line.',
    chips: [],
    actorId: 'you',
    targetId: 'foe',
    range: null,
    health: {},
    ...overrides,
  };
}

describe('sounds', () => {
  it('give everyday actions their own sound, even with animations off', () => {
    const off = act(newGame(), { type: 'setAnimations', on: false });
    expect(soundAfter({ type: 'sleep' }, off, off)).toBe('sleep');
    expect(soundAfter({ type: 'buyTool', toolId: 'any' }, off, off)).toBe('coins');
    expect(soundAfter({ type: 'dismissReport' }, off, off)).toBeNull();
  });

  it('greet a report card by how things went', () => {
    const fight = { kind: 'fight', enemies: 'a bandit', rounds: 2 } as const;
    const tally = { damageTaken: 0, chakraSpent: 0, health: 100, maxHealth: 100 };
    expect(reportSound({ ...fight, ...tally, result: 'victory' })).toBe('victory');
    expect(reportSound({ ...fight, ...tally, result: 'defeat' })).toBe('defeat');
    expect(reportSound({ ...fight, ...tally, result: 'escaped' })).toBe('paper');
  });

  it('hear a fight from your side: blows on you hurt, blows by anyone else strike', () => {
    const harm = [{ label: '12', tone: 'harm' } as const];
    expect(beatSound(beat({ chips: harm }), 'you')).toBe('strike');
    expect(beatSound(beat({ chips: harm, actorId: 'foe', targetId: 'you' }), 'you')).toBe('hurt');
    expect(beatSound(beat({ chips: [{ label: '8', tone: 'gain' }] }), 'you')).toBe('mend');
    expect(beatSound(beat({}), 'you')).toBe('swish');
    expect(beatSound(beat({ kind: 'divider', actorId: null }), 'you')).toBe('exchange');
  });
});

describe('music', () => {
  it('follows the clock and the calendar in the village', () => {
    const game = newGame();
    expect(musicMood({ ...game, time: { day: 2, slot: 0 } }, ctx)).toBe('day');
    expect(musicMood({ ...game, time: { day: 2, slot: 3 } }, ctx)).toBe('night');
    expect(musicMood({ ...game, time: { day: KITE_DAY, slot: 1 } }, ctx)).toBe('festival');
  });

  it('takes to the road on a job, and gives way to a fight', () => {
    const veteran = newGame({ standing: { ...newGame().standing, missionsCompleted: 5 } });
    let state = act(veteran, { type: 'startMission', missionId: 'tea-merchant-escort' });
    expect(musicMood(state, ctx)).toBe('road');
    state = act(state, { type: 'missionContinue' });
    state = act(state, { type: 'missionChoose', approachIndex: 0 });
    expect(musicMood(intoFight(state), ctx)).toBe('fight');
  });
});

describe('audio settings', () => {
  it('round-trip, and fall back to defaults for missing or damaged storage', () => {
    const quiet = { sound: false, effectsVolume: 30, musicVolume: 0 };
    expect(readAudioSettings(writeAudioSettings(quiet))).toEqual(quiet);
    expect(readAudioSettings(null)).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(readAudioSettings('not json')).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(readAudioSettings('{"musicVolume":"loud","sound":1}')).toEqual(DEFAULT_AUDIO_SETTINGS);
  });

  it('keep volumes to steps of ten between silent and full', () => {
    expect(clampVolume(43)).toBe(40);
    expect(clampVolume(250)).toBe(100);
    expect(clampVolume(-5)).toBe(0);
    expect(clampVolume(Number.NaN)).toBe(0);
    expect(readAudioSettings('{"effectsVolume":87}').effectsVolume).toBe(90);
  });
});
