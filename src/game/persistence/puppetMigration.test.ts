import { newGame } from '@/test/gameFixtures';

import { deserialize } from './save';

describe('the puppet migration', () => {
  it('gives a save from before puppets of your own an empty workshop', () => {
    const { puppetry: _puppetry, ...older } = newGame();
    const loaded = deserialize(JSON.stringify({ version: 70, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.puppetry).toEqual({
      puppets: [],
      craft: 0,
      stock: {},
      build: null,
      nextId: 1,
    });
  });

  it('keeps a v71 save’s puppets and craft, with an empty stock and bench', () => {
    const doll = { frameId: 'lantern-doll', name: 'Lantern Doll', condition: 0.5 };
    const older = { ...newGame(), puppetry: { puppets: [doll], craft: 7 } };
    const loaded = deserialize(JSON.stringify({ version: 71, state: older }));
    if (!loaded.ok) throw new Error(loaded.error);
    expect(loaded.value.puppetry).toEqual({
      puppets: [{ id: 'lantern-doll', name: 'Lantern Doll', condition: 0.5 }],
      craft: 7,
      stock: {},
      build: null,
      nextId: 1,
    });
  });
});
