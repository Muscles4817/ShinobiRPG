import { contextForPack } from './context';
import { dispatch } from './dispatch';
import { dispatchAlone } from './offThread';
import { createVersus } from './versus';

/** A step played from the state alone (`offThread.ts`) is the step played on the page. */

describe('playing a step from the state alone', () => {
  it('gives exactly what dispatch gives, foes thinking ahead included', () => {
    const naruto = contextForPack('naruto')!;
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:asuma'],
      seed: 3,
      foesThink: true,
    });
    if (!made.ok) throw new Error(made.error);
    const action = { type: 'combatAct' as const, optionId: 'begin' };
    expect(dispatchAlone(made.value, action)).toEqual(dispatch(made.value, action, naruto));
  });

  it('says so when the save names a world there is none of', () => {
    const naruto = contextForPack('naruto')!;
    const made = createVersus(naruto, {
      side: ['person:kakashi'],
      foes: ['person:asuma'],
      seed: 3,
    });
    if (!made.ok) throw new Error(made.error);
    const lost = { ...made.value, packId: 'nowhere' };
    expect(dispatchAlone(lost, { type: 'combatAct', optionId: 'begin' }).ok).toBe(false);
  });
});
