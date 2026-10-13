import { act, ctx, newGame } from '@/test/gameFixtures';

import { cueAfter } from './cues';
import { dispatch } from './dispatch';
import { animationSetting } from './views/settings';

describe('action cues', () => {
  it('play for everyday actions while animations are on', () => {
    const state = newGame();
    expect(cueAfter({ type: 'sleep' }, state)).toBe('sleep');
    expect(cueAfter({ type: 'eat', foodId: 'any' }, state)).toBe('eat');
    expect(cueAfter({ type: 'treat' }, state)).toBe('heal');
    expect(cueAfter({ type: 'travel', locationId: 'any' }, state)).toBeNull();
  });

  it('stay still once the player turns animations off, and come back on', () => {
    const off = act(newGame(), { type: 'setAnimations', on: false });
    expect(off.settings.animations).toBe(false);
    expect(cueAfter({ type: 'sleep' }, off)).toBeNull();
    expect(animationSetting(off, ctx)).toMatchObject({
      on: false,
      action: { type: 'setAnimations', on: true },
      blocker: null,
    });
    expect(act(off, { type: 'setAnimations', on: true }).settings.animations).toBe(true);
  });

  it('refuses to set animations to what they already are', () => {
    const result = dispatch(newGame(), { type: 'setAnimations', on: true }, ctx);
    expect(result).toEqual({ ok: false, error: 'Animations are already on.' });
  });
});
