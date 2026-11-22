import type { CombatantSetup } from '../../contract';
import { toldFrom } from '../../rules/narration';
import { openingReads } from './fighterReads';
import { initialFighters } from './state';

/** What the player's fighter notices as the fight opens (`fighterReads.ts`). */

const base: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function fighters(you: Partial<CombatantSetup>, foe: Partial<CombatantSetup>) {
  const setup = (id: string, extra: Partial<CombatantSetup>): CombatantSetup => ({
    id,
    name: id,
    attributes: base,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
    ...extra,
  });
  return initialFighters({
    player: setup('you', { called: 'you', grammar: 'you', ...you }),
    allies: [],
    enemies: [setup('Gōran', { grammar: 'he', ...foe })],
    canFlee: false,
  });
}

const sword = {
  held: { name: 'Katana', weaponClass: 'sword' as const, rank: 'C' as const },
  armour: { name: 'Plate', level: 'plate' as const, rank: 'C' as const },
};

describe('reads as the fight opens', () => {
  it('notices the blade first, and every read is marked as one', () => {
    const lines = openingReads(fighters({}, { gear: sword }), undefined);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => toldFrom(l).read === true)).toBe(true);
    expect(toldFrom(lines[0]!).text).toContain('sword');
  });

  it('a keener eye notices more, and says it plainly', () => {
    const foe = { gear: sword, size: 'large' as const, attributes: { ...base, speed: 30 } };
    const dull = openingReads(fighters({ attributes: { ...base, perception: 2 } }, foe), 'lake');
    const keen = openingReads(fighters({ attributes: { ...base, perception: 40 } }, foe), 'lake');
    expect(keen.length).toBeGreaterThan(dull.length);
    const said = keen.map((l) => toldFrom(l).text);
    expect(said.some((t) => t.includes('armoured'))).toBe(true);
    expect(said.some((t) => t.includes('big'))).toBe(true);
    expect(said.some((t) => t.includes('footing'))).toBe(true);
    expect(said.some((t) => t.includes('quicker than you'))).toBe(true);
    expect(toldFrom(dull[0]!).text).toBe('Gōran has a sword in hand.');
  });

  it('says nothing of a foe with nothing to notice, or one in hiding', () => {
    expect(openingReads(fighters({}, {}), undefined)).toEqual([]);
    const hidden = fighters({}, { gear: sword }).map((f) =>
      f.id === 'Gōran' ? { ...f, hidden: true } : f,
    );
    expect(openingReads(hidden, undefined)).toEqual([]);
  });
});
