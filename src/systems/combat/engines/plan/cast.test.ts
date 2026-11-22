import { textOf } from '@/test/fightLines';
import { castAfter, trimmedStory } from './cast';
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
    expect(later).toContainEqual(
      expect.objectContaining({
        id: 'itachi~shadow~1',
        name: "Itachi's shadow clone",
        side: 'enemy',
      }),
    );
    expect(later).toHaveLength(3);
  });

  it('trims the story only to its length in lines, counting what it let go', () => {
    const story = Array.from({ length: LOG_LIMIT + 5 }, (_, i) => [
      { kind: 'health' as const, who: 'hero', to: i, cause: 'settled' as const },
      { kind: 'told' as const, text: `line ${i}` },
    ]).flat();
    const state = { story } as unknown as PlanState; // only the story matters here
    const trimmed = trimmedStory(state);
    expect(textOf(trimmed.story)).toHaveLength(LOG_LIMIT);
    // What was told with the first line kept is kept with it.
    expect(trimmed.story[0]).toMatchObject({ kind: 'health', to: 5 });
    expect(trimmed.storyDropped).toBe(10);
    expect(textOf(trimmed.story)[0]).toBe('line 5');
  });
});
