import { act, ctx, lastEntry, newGame, withAllStats } from '@/test/gameFixtures';

import { contextForPack, packChoices } from './context';
import { dispatch } from './dispatch';
import { createNewGame } from './newGame';

describe('new game', () => {
  it('starts a genin in the pack’s home village with academy and aptitude techniques', () => {
    const state = newGame();
    expect(state).toMatchObject({ packId: 'original', locationId: 'torogakure' });
    expect(state.techniques.known).toEqual(['palm-strike', 'shadow-feint', 'gale-heel']);
    expect(state.standing.rank).toBe('genin');
    expect(state.housing).toEqual({ placeId: 'home', rentPerWeek: 30, paidThroughDay: 7 });
  });

  it('applies aptitude stat bonuses', () => {
    expect(newGame().character.stats.taijutsu).toBe(8);
  });

  it('can start in any shipped pack', () => {
    for (const pack of packChoices()) {
      const context = contextForPack(pack.id)!;
      const aptitudeId = context.content.aptitudes.all[0]!.id;
      const state = createNewGame({ name: 'A', aptitudeId, seed: 1 }, context);
      expect(state.packId).toBe(pack.id);
    }
  });
});

describe('daily actions', () => {
  it('training raises stats, costs energy and time, and records chips', () => {
    const before = newGame();
    const after = act(before, { type: 'train', trainingId: 'rooftop-sprints' });
    expect(after.character.stats.speed).toBeGreaterThan(before.character.stats.speed);
    expect(after.character.vitals.energy).toBe(80);
    expect(after.time.slot).toBe(1);
    expect(lastEntry(after)).toMatchObject({ heading: 'Rooftop Sprints' });
    expect(lastEntry(after)?.chips?.map((c) => c.label)).toContain('−20 energy');
  });

  it('refuses training when exhausted, saying how to fix it', () => {
    const s = newGame();
    const tired = {
      ...s,
      character: { ...s.character, vitals: { ...s.character.vitals, energy: 5 } },
    };
    expect(dispatch(tired, { type: 'train', trainingId: 'lake-laps' }, ctx)).toEqual({
      ok: false,
      error: 'Needs 25 energy. Nap or eat first.',
    });
  });

  it('only offers activities from places in the current location', () => {
    expect(dispatch(newGame(), { type: 'train', trainingId: 'nope' }, ctx).ok).toBe(false);
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
    expect(result).toEqual({ ok: false, error: 'Needs better Chakra Control, Ninjutsu.' });
  });
});

describe('rent', () => {
  function sleepDays(state: ReturnType<typeof newGame>, days: number) {
    let s = state;
    for (let i = 0; i < days; i++)
      s = act(act(s, { type: 'eat', foodId: 'rice-ball' }), { type: 'sleep' });
    return s;
  }

  it('locks you out once overdue, and paying lets you back in', () => {
    const overdue = sleepDays(newGame({ wallet: { ryo: 1000 } }), 7);
    expect(overdue.time.day).toBe(8);
    expect(dispatch(overdue, { type: 'rest' }, ctx)).toEqual({
      ok: false,
      error: 'The door is locked until you pay rent.',
    });
    const paid = act(overdue, { type: 'payRent' });
    expect(paid.wallet.ryo).toBe(overdue.wallet.ryo - 30);
    expect(paid.housing.paidThroughDay).toBe(14);
  });

  it('warns on the morning rent falls due', () => {
    const due = sleepDays(newGame({ wallet: { ryo: 1000 } }), 7);
    expect(due.journal.entries.some((e) => e.text.includes('rent is due'))).toBe(true);
  });

  it('caps prepaying at two weeks', () => {
    const once = act(newGame(), { type: 'payRent' });
    expect(dispatch(once, { type: 'payRent' }, ctx).ok).toBe(false);
  });
});

describe('hospital', () => {
  it('treats injuries for a fee', () => {
    const s = newGame();
    const hurt = {
      ...s,
      character: { ...s.character, vitals: { ...s.character.vitals, health: 10 } },
    };
    const treated = act(hurt, { type: 'treat' });
    expect(treated.character.vitals.health).toBeGreaterThan(80);
    expect(treated.wallet.ryo).toBe(s.wallet.ryo - 60);
  });

  it('refuses when you are not hurt', () => {
    expect(dispatch(newGame(), { type: 'treat' }, ctx)).toEqual({
      ok: false,
      error: 'You are not hurt.',
    });
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
