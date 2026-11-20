import type { CombatantSetup } from '../../contract';
import { keepTryingOptions } from './keepTryingTable';
import { suggestedKeepTrying, triesNow } from './keepTrying';
import { initialFighters, plainSlots, type PlanFighter } from './state';

/** How hard to keep trying to get where you fight: the three ways, and the one suggested. */

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
  chakra: 30,
  maxChakra: 30,
  techniques: [],
});

const [you, foe] = initialFighters({
  player: setup('you'),
  allies: [],
  enemies: [setup('foe')],
  canFlee: true,
});

const wanting = (over: Partial<PlanFighter>): PlanFighter => ({
  ...you!,
  keepAt: 'far',
  loadout: { close: plainSlots(['strike']), mid: [], far: [] },
  ...over,
});

describe('keeping trying', () => {
  it('suggests going while the odds are fair when the plan works from elsewhere, else always', () => {
    expect(suggestedKeepTrying(wanting({})).way).toBe('odds');
    const nothing = wanting({ loadout: { close: [], mid: [], far: plainSlots(['throw']) } });
    expect(suggestedKeepTrying(nothing).way).toBe('always');
  });

  it('tries by the way chosen', () => {
    const at = { exchange: 1, foes: [foe!] };
    expect(triesNow(wanting({ keepTrying: 'always' }), { ...at, odds: 0.1 })).toBe(true);
    expect(triesNow(wanting({ keepTrying: 'odds' }), { ...at, odds: 0.3 })).toBe(false);
    expect(triesNow(wanting({ keepTrying: 'odds' }), { ...at, odds: 0.6 })).toBe(true);
    expect(triesNow(wanting({ keepTrying: 'clear' }), at)).toBe(false);
    expect(
      triesNow(wanting({ keepTrying: 'clear' }), { ...at, foes: [{ ...foe!, stunned: 1 }] }),
    ).toBe(true);
  });

  it('offers the choice only with somewhere to get to, and warns when nothing clears the way', () => {
    expect(keepTryingOptions(you!, 'mid')).toEqual([]);
    const options = keepTryingOptions(wanting({}), 'mid');
    expect(options.map((o) => o.label)).toEqual([
      'When the odds are fair',
      'Every exchange',
      'Only when the way is clear',
    ]);
    expect(options.find((o) => o.selected)?.detail).toMatch(/Suggested/);
    expect(options.at(-1)?.detail).toMatch(/might never go/);
  });
});
