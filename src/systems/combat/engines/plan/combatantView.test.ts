import { splitNarration } from '../../rules/narration';
import type { CombatantSetup } from '../../contract';
import { combatantView } from './combatantView';
import { pairKey } from './distance';
import { staged } from './staging';
import { initialFighters, type PlanState, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
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

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  const base = { id, name: id, attributes, health: 100, maxHealth: 100, chakra: 60 };
  return { ...base, maxChakra: 60, techniques: [], ...overrides };
}

/** The hero up close with a swordsman, while a caster keeps to mid range. */
const fighters = initialFighters({
  player: setup('hero'),
  allies: [setup('friend')],
  enemies: [setup('sword', { row: 'front' }), setup('caster', { row: 'back' })],
  canFlee: true,
});
const distances = { [pairKey('hero', 'sword')]: 'close' } as const;

const plan: PlanState = {
  phase: 'loadout',
  round: 1,
  bout: 1,
  exchange: 0,
  fighters,
  range: 'mid',
  distances,
  seen: {},
  intents: {},
  log: [],
  result: null,
  canFlee: true,
};

const shown = (id: string) =>
  combatantView(
    plan,
    plan.fighters.find((f) => f.id === id)!,
    false,
  );

describe('each fighter’s distance on the screen', () => {
  it('says how far each foe stands from you, and each of yours from the foe they face', () => {
    expect(shown('sword').distance).toBe('close');
    expect(shown('caster').distance).toBe('mid');
    expect(shown('hero').distance).toBe('close');
    expect(shown('friend').distance).toBe('mid');
  });

  it('tags a turn’s lines with the distance to whom it was aimed at', () => {
    const before: Round = {
      number: 1,
      fighters,
      range: 'mid',
      distances,
      lines: [],
      seen: {},
      intents: {},
    };
    const at = (aimedAt: string) =>
      splitNarration(
        staged(before, { ...before, lines: ['The hero throws.'], aimedAt }, 'hero').lines[0]!,
      ).range;
    expect(at('caster')).toBe('mid');
    expect(at('sword')).toBe('close');
    // Helping a teammate is told from the foe they face.
    expect(at('friend')).toBe('close');
  });
});
