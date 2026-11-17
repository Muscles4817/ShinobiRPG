import type { CombatantSetup } from '../../contract';
import { decide } from './round';
import { initialFighters, type PlanFighter } from './state';

/**
 * Who has to fall for a fight to be lost: the player, on a job; on a team fought to the last
 * (versus, `CombatSetup.toTheLast`), everyone on their side.
 */

const attributes = {
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
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
  };
}

const fighters = initialFighters({
  player: setup('you'),
  allies: [setup('friend')],
  enemies: [setup('foe-a'), setup('foe-b')],
  canFlee: false,
});

const down = (list: readonly PlanFighter[], ...ids: string[]) =>
  list.map((f) => (ids.includes(f.id) ? { ...f, health: 0 } : f));

describe('when a fight is decided', () => {
  it('ends a job’s fight when you fall, teammates or not', () => {
    expect(decide(down(fighters, 'you'))).toBe('defeat');
  });

  it('fights on to the last when told: lost only once everyone on your side is down', () => {
    expect(decide(down(fighters, 'you'), true)).toBeNull();
    expect(decide(down(fighters, 'you', 'friend'), true)).toBe('defeat');
    expect(decide(down(fighters, 'foe-a'), true)).toBeNull();
    expect(decide(down(fighters, 'foe-a', 'foe-b'), true)).toBe('victory');
  });
});
