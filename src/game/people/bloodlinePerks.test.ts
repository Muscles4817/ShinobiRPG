import { draft } from '@/test/gameFixtures';

import { contextForPack } from '../context';
import { createNewGame } from '../creation';
import { companionCombatant } from './companions';

/** A bloodline's perks reach everyone born to the clan, not only you; a dormant one gives none. */
describe('bloodline perks for people', () => {
  const naruto = contextForPack('naruto')!;
  const game = createNewGame({ draft: draft(), seed: 1234 }, naruto);
  const fighter = (id: string) =>
    companionCombatant(naruto.content.people.require(id), game, naruto, '');

  it('a Hyūga fights with the Byakugan', () => {
    expect(fighter('neji').perks).toContain('insight');
  });

  it('a clan whose bloodline sleeps gives nothing', () => {
    expect(fighter('sasuke').perks ?? []).not.toContain('foresight');
  });
});
