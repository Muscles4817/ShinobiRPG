import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { foldStory } from '../../storyFold';
import { createPlanEngine } from './engine';
import { decode, encode } from './state';

/** A fight saved mid-way before its story was kept as events still loads and plays. */

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

const fighter = (id: string): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 30,
  maxChakra: 30,
  techniques: [],
});

/** The lines a fight of the old shape held: its facts inside its words. */
const OLD_LOG = [
  'Foe squares up.',
  '— The fight begins —',
  '— First exchange — ⟦rs⟧ ⟦pl:hero=health:100,chakra:30|foe=health:100,chakra:30⟧ ⟦st:hero=|foe=⟧',
  'Hero hits foe. ⟦n:hero|foe⟧ ⟦-9⟧ ⟦pl:foe=health:91⟧ ⟦by:hero⟧ ⟦at:close⟧',
];

describe('a fight saved as lines', () => {
  it('is read into events as it loads, and plays on', () => {
    const engine = createPlanEngine();
    const rng = createRng(1);
    const fresh = decode(
      engine.start(
        { player: fighter('hero'), allies: [], enemies: [fighter('foe')], canFlee: false },
        rng,
      ),
    );
    const { story: _story, ...rest } = fresh;
    const saved = encode({ ...rest, log: OLD_LOG, logDropped: 3 } as unknown as typeof fresh);
    const view = engine.view(saved);
    expect(view.storyOffset).toBe(3);
    expect(view.story).toContainEqual(
      expect.objectContaining({ kind: 'told', text: 'Hero hits foe.', actor: 'hero' }),
    );
    expect(foldStory(view.story).pools.foe).toEqual({ health: 91, chakra: 30 });
    const begun = engine.act(saved, { optionId: 'begin' }, rng);
    if (!begun.ok) throw new Error(begun.error);
    const played = engine.act(begun.value, { optionId: 'next' }, rng);
    expect(played.ok).toBe(true);
  });
});
