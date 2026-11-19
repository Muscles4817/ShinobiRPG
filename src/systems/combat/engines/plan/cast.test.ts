import { castAfter, trimmedLog } from './cast';
import { LOG_LIMIT, initialFighters, type PlanState } from './state';

/** Everyone who stood on the field is remembered, and a stretch being watched is never cut. */

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
const setup = (id: string) => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 50,
  maxChakra: 50,
  techniques: [],
});

describe('the cast', () => {
  it('keeps everyone who stood on the field, with their side, after they are gone', () => {
    const fighters = initialFighters({
      player: setup('you'),
      allies: [],
      enemies: [setup('itachi')],
      canFlee: true,
    });
    const clone = { ...fighters[1]!, id: 'itachi~shadow~1', name: "Itachi's shadow clone" };
    const first = castAfter(undefined, [...fighters, clone]);
    const later = castAfter(first, fighters);
    expect(later).toContainEqual({
      id: 'itachi~shadow~1',
      name: "Itachi's shadow clone",
      side: 'enemy',
    });
    expect(later).toHaveLength(3);
  });

  it('trims the log only to its length, counting what it let go', () => {
    const log = Array.from({ length: LOG_LIMIT + 5 }, (_, i) => `line ${i}`);
    const state = { log } as unknown as PlanState; // only the log matters here
    const trimmed = trimmedLog(state);
    expect(trimmed.log).toHaveLength(LOG_LIMIT);
    expect(trimmed.logDropped).toBe(5);
    expect(trimmed.log[0]).toBe('line 5');
  });
});
