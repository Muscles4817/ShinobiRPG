import { CONTENT_PACKS } from '@/content';
import { contextForPack } from '@/game/context';
import { freshGame } from '@/test/gameFixtures';

import { deserialize } from './save';

/** A save from before a pack merged two techniques into one still loads, knowing the one. */

const naruto = contextForPack('naruto')!;

describe('technique merges', () => {
  it('moves known, studied and owned techniques to the id they became', () => {
    const game = freshGame(naruto);
    const renames = CONTENT_PACKS.find((p) => p.id === 'naruto')?.renamedTechniques ?? {};
    const [oldKnown, oldStudied] = Object.keys(renames);
    if (!oldKnown || !oldStudied) throw new Error('the naruto pack merges two techniques');
    const v38 = {
      ...game,
      techniques: { known: [oldKnown], progress: { [oldStudied]: 12 }, unstable: [oldKnown] },
      inventory: { ...game.inventory, scrolls: { [oldStudied]: true } },
    };
    const loaded = deserialize(JSON.stringify({ version: 38, state: v38 }));
    if (!loaded.ok) throw new Error(loaded.error);
    const merged = (id: string) => renames[id] ?? id;
    expect(loaded.value.techniques).toEqual({
      known: [merged(oldKnown)],
      progress: { [merged(oldStudied)]: 12 },
      unstable: [merged(oldKnown)],
      repertoire: null,
      chains: null,
    });
    expect(loaded.value.inventory.scrolls).toEqual({ [merged(oldStudied)]: true });
    for (const id of [merged(oldKnown), merged(oldStudied)]) {
      expect(naruto.content.techniques.get(id)).toBeDefined();
    }
  });

  it('leaves a save of a pack that merged nothing as it was', () => {
    const game = freshGame();
    const loaded = deserialize(JSON.stringify({ version: 38, state: game }));
    expect(loaded).toEqual({ ok: true, value: game });
  });
});
