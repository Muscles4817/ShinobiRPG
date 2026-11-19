import type { CombatTechnique } from '../../contract';
import { recovering, restingAfter } from './recovery';
import { initialFighters, type Round } from './state';
import { recoveredAfter } from './recovery';

/** A technique that needs a breath between uses can't be used two exchanges running. */

const push: CombatTechnique = {
  id: 'push',
  name: 'Push',
  discipline: 'ninjutsu',
  effects: [{ verb: 'knock', power: 10, to: 'far' }],
  chakraCost: 0,
  tags: { execution: { recovery: 1 } },
};

describe('recovery', () => {
  it('rests a technique through the exchange after it is used, then frees it', () => {
    const [f] = initialFighters({
      player: {
        id: 'p',
        name: 'p',
        attributes: {
          strength: 10,
          speed: 10,
          stamina: 10,
          chakraControl: 10,
          intellect: 10,
          perception: 10,
          willpower: 10,
          taijutsu: 10,
          ninjutsu: 10,
          genjutsu: 10,
          kenjutsu: 10,
          fuuinjutsu: 10,
        },
        health: 100,
        maxHealth: 100,
        chakra: 50,
        maxChakra: 50,
        techniques: [push],
      },
      allies: [],
      enemies: [],
      canFlee: true,
    });
    const resting = restingAfter(f!, push);
    const round: Round = {
      number: 1,
      fighters: [{ ...f!, ...(resting ? { recovering: resting } : {}) }],
      range: 'close',
      lines: [],
      seen: {},
      intents: {},
    };
    expect(recovering(round.fighters[0]!, push)).toBe(true);
    const next = recoveredAfter(round);
    expect(recovering(next.fighters[0]!, push)).toBe(true);
    expect(recovering(recoveredAfter(next).fighters[0]!, push)).toBe(false);
  });
});
