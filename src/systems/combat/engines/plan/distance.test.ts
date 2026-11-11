import type { CombatantSetup } from '../../contract';
import { bandOf, distanceBetween, pairKey, sameSpacing, spacingOf } from './distance';
import { initialFighters } from './state';

/** Each pair of foes keeps a distance of its own; a pair with none stands at the fight's. */

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

const setup = (id: string): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 50,
  maxChakra: 50,
  techniques: [],
});

const fighters = initialFighters({
  player: setup('kakashi'),
  allies: [],
  enemies: [setup('zabuza'), setup('haku')],
  canFlee: true,
});
const kakashi = fighters.find((f) => f.id === 'kakashi')!;

describe('distance between foes', () => {
  it('is the same pair whichever way round it is named', () => {
    expect(pairKey('a', 'b')).toBe(pairKey('b', 'a'));
  });

  it('is the fight’s distance for a pair with none of its own', () => {
    expect(distanceBetween({ range: 'mid' }, 'kakashi', 'haku')).toBe('mid');
  });

  it('is the pair’s own where it has one', () => {
    const spacing = {
      range: 'mid' as const,
      distances: { [pairKey('kakashi', 'zabuza')]: 'close' as const },
    };
    expect(distanceBetween(spacing, 'zabuza', 'kakashi')).toBe('close');
    expect(distanceBetween(spacing, 'kakashi', 'haku')).toBe('mid');
  });

  it('a fighter stands at their distance to the nearest foe still up', () => {
    const close = { [pairKey('kakashi', 'zabuza')]: 'close' as const };
    expect(bandOf({ range: 'far', fighters, distances: close }, kakashi)).toBe('close');
    const zabuzaDown = fighters.map((f) => (f.id === 'zabuza' ? { ...f, health: 0 } : f));
    expect(bandOf({ range: 'far', fighters: zabuzaDown, distances: close }, kakashi)).toBe('far');
  });

  it('with no foe standing, a fighter is at the fight’s distance', () => {
    const alone = fighters.filter((f) => f.side === 'player');
    expect(bandOf({ range: 'mid', fighters: alone }, kakashi)).toBe('mid');
  });

  it('knows when nobody has moved, and carries only distances there are', () => {
    const distances = { [pairKey('kakashi', 'haku')]: 'far' as const };
    expect(sameSpacing({ range: 'mid' }, { range: 'mid' })).toBe(true);
    expect(sameSpacing({ range: 'mid' }, { range: 'close' })).toBe(false);
    expect(sameSpacing({ range: 'mid' }, { range: 'mid', distances })).toBe(false);
    expect(spacingOf({ range: 'mid' })).toEqual({});
    expect(spacingOf({ range: 'mid', distances })).toEqual({ distances });
  });
});
