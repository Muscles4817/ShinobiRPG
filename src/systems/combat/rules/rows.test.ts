import type { CombatTechnique, CombatTrait } from '../contract';
import { canReach, formed, preferredRow, reachable, screened, type Ranked } from './rows';

const mend: CombatTechnique = {
  id: 'mend',
  name: 'Mend',
  discipline: 'ninjutsu',
  effects: [{ verb: 'heal', power: 10 }],
  chakraCost: 4,
};
const blast: CombatTechnique = {
  id: 'blast',
  name: 'Blast',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 6,
};

const kit = (traits: CombatTrait[], techniques: CombatTechnique[] = []) => ({ traits, techniques });

function ranked(id: string, row: Ranked['row'], side: Ranked['side'] = 'enemy'): Ranked {
  return { id, side, row, health: 50, hidden: false };
}

describe('rows: placement', () => {
  it('puts archers, illusionists and healers at the back, everyone else in front', () => {
    expect(preferredRow(kit(['archer']))).toBe('back');
    expect(preferredRow(kit(['illusionist']))).toBe('back');
    expect(preferredRow(kit([], [mend]))).toBe('back');
    expect(preferredRow(kit([], [mend, blast, blast]))).toBe('front');
    expect(preferredRow(kit(['brawler']))).toBe('front');
    expect(preferredRow(kit(['armoured', 'illusionist']))).toBe('front');
    expect(preferredRow(kit([]))).toBe('front');
  });

  it("follows a setup's own row", () => {
    expect(preferredRow({ ...kit(['archer']), row: 'front' })).toBe('front');
    expect(preferredRow({ ...kit([]), row: 'back' })).toBe('back');
  });

  it('a side with no one in front stands in front', () => {
    const fighters = [
      ranked('hero', 'back', 'player'),
      ranked('archer', 'back'),
      ranked('archer2', 'back'),
    ];
    expect(formed(fighters).map((f) => f.row)).toEqual(['front', 'front', 'front']);
    const mixed = [ranked('wall', 'front'), ranked('archer', 'back')];
    expect(formed(mixed).map((f) => f.row)).toEqual(['front', 'back']);
  });
});

describe('rows: reach', () => {
  const wall = ranked('wall', 'front');
  const archer = ranked('archer', 'back');
  const close = { reach: ['close'] } as const;

  it('the back row is out of reach up close while the front stands', () => {
    const field = [wall, archer];
    expect(screened(archer, field)).toBe(true);
    expect(screened(wall, field)).toBe(false);
    expect(canReach(close, archer, field)).toBe(false);
    expect(reachable(close, field, field)).toEqual([wall]);
  });

  it('thrown weapons, longer reach and area effects still land', () => {
    const field = [wall, archer];
    expect(canReach({ reach: ['mid', 'far'] }, archer, field)).toBe(true);
    expect(canReach({ reach: ['close', 'mid'] }, archer, field)).toBe(true);
    expect(canReach({ ...close, area: true }, archer, field)).toBe(true);
  });

  it('the back is exposed once the front falls or vanishes', () => {
    expect(canReach(close, archer, [{ ...wall, health: 0 }, archer])).toBe(true);
    expect(canReach(close, archer, [{ ...wall, hidden: true }, archer])).toBe(true);
  });

  it("only a fighter's own side screens them", () => {
    const field = [ranked('hero', 'front', 'player'), archer];
    expect(canReach(close, archer, field)).toBe(true);
  });
});
