import { reachOf } from '@/systems/combat';
import { freshGame } from '@/test/gameFixtures';

import { contextForPack } from './context';
import { companionCombatant, senseiCombatant } from './people/companions';

/** People with an arsenal fight with their own techniques, not their specialty's generic kit. */

const naruto = contextForPack('naruto')!;
const state = freshGame(naruto);
const kakashi = naruto.content.people.require('kakashi');
const ids = (techniques: readonly { readonly id: string }[]) => techniques.map((t) => t.id);

describe('arsenals', () => {
  it('fights with their own techniques and perks in place of the academy kit', () => {
    const fighter = companionCombatant(kakashi, state, naruto, 'Partner');
    expect(ids(fighter.techniques)).toEqual(kakashi.arsenal!.techniqueIds);
    expect(ids(fighter.techniques)).not.toContain('shuriken-jutsu');
    expect(fighter.perks).toEqual(['insight']);
  });

  it('arms Asuma with his canon trench-knife jutsu and Burning Ash', () => {
    const asuma = naruto.content.people.require('asuma');
    const fighter = companionCombatant(asuma, state, naruto, 'Partner');
    expect(ids(fighter.techniques)).toEqual(
      expect.arrayContaining(['flying-swallow', 'chakra-blade-straight-line', 'ash-pile-burning']),
    );
    expect(ids(fighter.techniques)).not.toContain('shadow-clone');
    expect(ids(fighter.techniques)).not.toContain('wind-blade-flurry');
    expect(ids(fighter.techniques)).not.toContain('iaido-draw');
  });

  it('keeps a sensei’s signatures on top of the arsenal', () => {
    const fighter = senseiCombatant(kakashi, state, naruto, 'Sensei');
    expect(ids(fighter.techniques)).toEqual(
      expect.arrayContaining(['lightning-blade', 'rasengan']),
    );
    expect(fighter.nature).toBe('lightning');
  });

  it('throws shuriken from a distance and drives hand-held jutsu home up close', () => {
    const reach = (id: string) => reachOf(naruto.content.techniques.require(id));
    expect(reach('shuriken-jutsu')).toEqual(['mid', 'far']);
    expect(reach('lightning-blade')).toEqual(['close']);
    expect(reach('rasengan')).toEqual(['close']);
    expect(reach('flying-swallow')).toEqual(['close']);
  });
});
