import { act, ctx, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { deserialize, serialize } from './persistence/save';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { onsenView } from './views/onsen';

const MORNING = 0;
const EVENING = 2;
const NIGHT = 3;

/** Tired and a little hurt, with money for the baths, at a slot of day two. */
const at = (slot: number): GameState => {
  const state = newGame({ wallet: { ryo: 200 } });
  const { vitals } = state.character;
  return {
    ...state,
    time: { day: 2, slot },
    board: { ...state.board, refreshedDay: 2 },
    character: { ...state.character, vitals: { ...vitals, energy: 20, health: 50 } },
  };
};

const alone = { type: 'soak', withId: null } as const;

describe('the hot springs', () => {
  it('drain at night', () => {
    expect(hubView(at(NIGHT), ctx).places.find((p) => p.id === 'ember-springs')?.closed).toBe(
      'Closed. Opens in the morning.',
    );
    expect(blockerFor(at(NIGHT), alone, ctx)).toBe(
      'The Ember Springs is closed. Opens in the morning.',
    );
    expect(hubView(at(MORNING), ctx).places.find((p) => p.id === 'ember-springs')?.line).toBe(
      'A soak for 15 ryo',
    );
  });

  it('a soak costs ryo and a stretch of the day, and gives back energy and some health', () => {
    const before = at(MORNING);
    const after = act(before, alone);
    expect(after.wallet.ryo).toBe(200 - 15);
    expect(after.time.slot).toBe(MORNING + 1);
    expect(after.character.vitals.energy).toBeGreaterThanOrEqual(20 + 40 - 5);
    expect(after.character.vitals.health).toBe(50 + 8);
    expect(after.character.soaked).toBe(true);
    expect(blockerFor(after, alone, ctx)).toBe('You’ve already had your soak today.');
    expect(hubView(after, ctx).places.find((p) => p.id === 'ember-springs')?.line).toBe(
      'You’re warm through',
    );
  });

  it('leaves you warm through, so the night’s sleep heals more, and wears off by morning', () => {
    const evening = at(EVENING);
    const hurt = (state: GameState): GameState => ({
      ...state,
      character: { ...state.character, vitals: { ...state.character.vitals, health: 5 } },
    });
    const soaked = hurt(act(evening, alone));
    const { soaked: _warm, ...cold } = soaked.character;
    const unsoaked = { ...soaked, character: cold };
    const slept = act(soaked, { type: 'sleep' });
    const sleptCold = act(unsoaked, { type: 'sleep' });
    expect(slept.character.vitals.health).toBeGreaterThan(sleptCold.character.vitals.health);
    expect(slept.character.soaked).toBeUndefined();
    expect(blockerFor({ ...slept, wallet: { ryo: 200 } }, alone, ctx)).toBeNull();
  });

  it('beside someone in the water, it is your time with them today', () => {
    const evening = at(EVENING);
    const view = onsenView(evening, ctx)!;
    expect(view.bathers.map((b) => b.face.id)).toContain('shiori');
    const after = act(evening, { type: 'soak', withId: 'shiori' });
    // Shiori is calm: a quiet hour suits her.
    expect(after.people.bonds.shiori?.points).toBe((evening.people.bonds.shiori?.points ?? 0) + 10);
    expect(after.people.bonds.shiori?.lastTalkDay).toBe(2);
    expect(blockerFor(evening, { type: 'soak', withId: 'kaen' }, ctx)).toBe(
      'Kaen isn’t in the water.',
    );
  });

  it('a save from before the baths can soak', () => {
    const loaded = deserialize(serialize(at(MORNING)));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.character.soaked).toBeUndefined();
    expect(blockerFor(loaded.value, alone, ctx)).toBeNull();
  });
});
