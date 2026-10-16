import { reachOf } from '@/systems/combat';
import { STAT_IDS, type Stats } from '@/systems/stats';
import { freshGame } from '@/test/gameFixtures';

import { playerCombatant } from './combatants';
import { contextForPack } from './context';
import { canDoNow, doableNow } from './people/capable';
import { companionCombatant, senseiCombatant } from './people/companions';
import { teachesNow } from './people/signatures';
import { teachingOf } from './people/teachers';
import type { GameState } from './state';

/** People with an arsenal fight with their own techniques, not their specialty's generic kit. */

const naruto = contextForPack('naruto')!;
const state = freshGame(naruto);
const kakashi = naruto.content.people.require('kakashi');
const ids = (techniques: readonly { readonly id: string }[]) => techniques.map((t) => t.id);

describe('arsenals', () => {
  it('fights with their own techniques and perks in place of the academy kit', () => {
    const fighter = companionCombatant(kakashi, state, naruto, 'Partner');
    expect(ids(fighter.techniques)).toEqual(
      doableNow(kakashi, state, naruto, kakashi.arsenal!.techniqueIds),
    );
    expect(ids(fighter.techniques)).toContain('lightning-blade');
    expect(ids(fighter.techniques)).not.toContain('shuriken-jutsu');
    // His Sharingan's perks, and as a jōnin he walks on water and up trees.
    expect(fighter.perks).toEqual([
      'insight',
      'foresight',
      'mimicry',
      'water-walking',
      'tree-walking',
    ]);
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

  it('uses and teaches a technique only once their grades have grown into it', () => {
    const genin = naruto.content.people.require('naruto');
    const behind = (list: readonly string[]) =>
      list.filter((id) => !canDoNow(genin, state, naruto, id));
    const toFight = behind(genin.arsenal!.techniqueIds);
    const toTeach = behind(genin.teacher!.teaches);
    expect(toFight).toContain('rasenshuriken');
    expect(toTeach).toContain('rasenshuriken');
    const fights = ids(companionCombatant(genin, state, naruto, 'Partner').techniques);
    const teaches = teachesNow(state, teachingOf(state, genin)!, naruto);
    expect(fights.filter((id) => toFight.includes(id))).toEqual([]);
    expect(teaches.filter((id) => toTeach.includes(id))).toEqual([]);

    const peak = Object.fromEntries(STAT_IDS.map((id) => [id, 45])) as unknown as Stats;
    const grown: GameState = {
      ...state,
      people: {
        ...state.people,
        progress: { ...state.people.progress, naruto: { stats: peak, lastGrownDay: 0 } },
      },
    };
    const later = ids(companionCombatant(genin, grown, naruto, 'Partner').techniques);
    expect(later).toEqual(expect.arrayContaining(toFight));
    expect(teachesNow(grown, teachingOf(grown, genin)!, naruto)).toEqual(
      expect.arrayContaining(toTeach),
    );
  });
});

describe('a bloodline’s eyes in a fight', () => {
  it('an awakened bloodline brings its perks with insight; a dormant one brings nothing', () => {
    const awake = naruto.content.clans.all.map((c) =>
      c.id === 'uchiha' && c.kekkeiGenkai
        ? { ...c, kekkeiGenkai: { ...c.kekkeiGenkai, dormant: false } }
        : c,
    );
    const find = (id: string) => awake.find((c) => c.id === id);
    const clans = { all: awake, get: find, require: (id: string) => find(id)! };
    const ctx = { ...naruto, content: { ...naruto.content, clans } };
    const uchiha = { ...state, character: { ...state.character, clanId: 'uchiha' } };
    expect(playerCombatant(uchiha, ctx).perks).toEqual(
      expect.arrayContaining(['insight', 'foresight', 'mimicry']),
    );
    expect(playerCombatant(uchiha, naruto).perks).not.toContain('foresight');
  });
});
