import { act, ctx, lastJournal, newGame, withAllStats } from '@/test/gameFixtures';

import { dispatch } from './dispatch';

describe('new game', () => {
  it('starts a genin with academy and aptitude techniques', () => {
    const state = newGame();
    expect(state.character.name).toBe('Kaito');
    expect(state.techniques.known).toEqual(['palm-strike', 'shadow-feint', 'gale-heel']);
    expect(state.standing.rank).toBe('genin');
    expect(state.time).toEqual({ day: 1, slot: 0 });
  });

  it('applies aptitude stat bonuses', () => {
    expect(newGame().character.stats.taijutsu).toBe(8);
  });
});

describe('daily actions', () => {
  it('training raises stats, costs energy and time', () => {
    const before = newGame();
    const after = act(before, { type: 'train', trainingId: 'rooftop-sprints' });
    expect(after.character.stats.speed).toBeGreaterThan(before.character.stats.speed);
    expect(after.character.vitals.energy).toBe(80);
    expect(after.time.slot).toBe(1);
    expect(lastJournal(after)).toMatch(/Rooftop Sprints: Speed \+/);
  });

  it('refuses training when exhausted', () => {
    const tired = newGame();
    const exhausted = {
      ...tired,
      character: { ...tired.character, vitals: { ...tired.character.vitals, energy: 5 } },
    };
    expect(dispatch(exhausted, { type: 'train', trainingId: 'lake-laps' }, ctx)).toEqual({
      ok: false,
      error: 'You are too tired to train.',
    });
  });

  it('eating costs ryo and fills you up', () => {
    const before = newGame();
    const after = act(before, { type: 'eat', foodId: 'ember-noodles' });
    expect(after.wallet.ryo).toBe(before.wallet.ryo - 45);
    expect(after.character.vitals.satiety).toBe(100);
  });

  it('sleep advances to the next morning and restores energy', () => {
    const trained = act(newGame(), { type: 'train', trainingId: 'lake-laps' });
    const slept = act(trained, { type: 'sleep' });
    expect(slept.time).toEqual({ day: 2, slot: 0 });
    expect(slept.character.vitals.energy).toBe(100);
  });

  it('studying eventually masters a technique', () => {
    let state = withAllStats(newGame(), 15);
    for (let i = 0; i < 10 && !state.techniques.known.includes('ember-breath'); i++) {
      state = act(act(state, { type: 'study', techniqueId: 'ember-breath' }), { type: 'sleep' });
    }
    expect(state.techniques.known).toContain('ember-breath');
  });

  it('blocks studying techniques with unmet requirements', () => {
    const result = dispatch(newGame(), { type: 'study', techniqueId: 'tide-lash' }, ctx);
    expect(result).toEqual({ ok: false, error: 'Requires better Chakra Control, Ninjutsu.' });
  });
});

describe('determinism', () => {
  it('produces identical states from identical inputs', () => {
    const run = () =>
      act(act(newGame(), { type: 'startMission', missionId: 'lantern-keepers-cat' }), {
        type: 'missionContinue',
      });
    expect(run()).toEqual(run());
  });
});
