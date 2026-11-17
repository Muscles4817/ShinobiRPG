import type { CombatantSetup, CombatTrait } from '../../contract';
import { kitNote } from './kitNote';
import { initialFighters, type PlanFighter } from './state';

/** What a defender's kit made of a hit, said only as far as it did (`kitNote.ts`). */

const attributes: CombatantSetup['attributes'] = {
  strength: 15,
  speed: 15,
  stamina: 15,
  chakraControl: 15,
  intellect: 15,
  perception: 15,
  willpower: 15,
  taijutsu: 15,
  ninjutsu: 15,
  genjutsu: 15,
  kenjutsu: 15,
  fuuinjutsu: 15,
};

function defender(traits: readonly CombatTrait[]): PlanFighter {
  const [one] = initialFighters({
    player: {
      id: 'them',
      name: 'Them',
      attributes,
      health: 100,
      maxHealth: 100,
      chakra: 50,
      maxChakra: 50,
      techniques: [],
      traits: [...traits],
    },
    allies: [],
    enemies: [],
    canFlee: false,
  });
  return one!;
}

const moment = { key: 'kit-note', recent: [] };
const blow = { kind: 'blow' as const, hit: 'blunt' as const, breaks: false };
const MOST = /Much of it glances|Little of it bites|barely seem/;

describe('what the kit kept out of a hit', () => {
  it('says most of it glanced off only when most of it did', () => {
    const [line] = kitNote(moment, defender(['spirit']), blow);
    expect(line).toMatch(MOST);
  });

  it('says only some of it did when armour kept out some', () => {
    const [line] = kitNote(moment, defender(['armoured']), blow);
    expect(line).toBeDefined();
    expect(line).not.toMatch(MOST);
  });

  it('says nothing when nothing was kept out', () => {
    expect(kitNote(moment, defender([]), blow)).toEqual([]);
  });
});
