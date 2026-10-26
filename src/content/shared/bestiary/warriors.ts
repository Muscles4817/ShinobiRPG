import type { EnemyDef } from '../../types';
import type { FoeKit } from './kit';
import { foeStats } from './foeStats';

/**
 * Fighters trained outside the shinobi villages. Samurai have little chakra and less use for
 * hand signs, but a will that shrugs off illusions and a blade that is the whole of their art.
 * Trained archers are not bandits with bows; warrior monks fight with open hands and mend
 * themselves.
 */

/** A samurai's art is the blade alone: whatever their rank, they never learn hand signs. */
const NO_HAND_SIGNS = { ninjutsu: 3, genjutsu: 3 } as const;

/*#__NO_SIDE_EFFECTS__*/
export function samurai(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'spear-footman',
      kind: 'Samurai',
      danger: 'armed',
      name: 'Spear Footman',
      description:
        'A lord’s foot soldier: a long spear, a lacquered hat and orders to hold the line.',
      ...foeStats(6, [11, 8, 11, 8], { ...NO_HAND_SIGNS, taijutsu: 9, kenjutsu: 8, willpower: 9 }),
      maxChakra: 13,
      techniqueIds: [kit.sweep, kit.palm],
      carries: { gearIds: [kit.gear.spear, kit.gear.heavyArmour] },
      traits: ['armoured'],
    },
    {
      id: 'samurai',
      kind: 'Samurai',
      danger: 'armed',
      name: 'Samurai',
      description: 'Trained to the sword since they could stand. No tricks, and none needed.',
      ...foeStats(7, [9, 8, 9, 8], { ...NO_HAND_SIGNS, kenjutsu: 12, willpower: 10 }),
      maxChakra: 32,
      techniqueIds: [kit.cut, kit.heavyCut, kit.drawStrike],
      carries: { gearIds: [kit.gear.sword, kit.gear.heavyArmour] },
      traits: ['armoured'],
    },
    {
      id: 'samurai-archer',
      kind: 'Samurai',
      danger: 'armed',
      name: 'Samurai Archer',
      description: 'Shoots from horseback at a gallop and still picks which eye.',
      ...foeStats(7, [10, 10, 10, 13], { ...NO_HAND_SIGNS, kenjutsu: 12, willpower: 10 }),
      maxChakra: 13,
      techniqueIds: [],
      carries: { gearIds: [kit.gear.heavyArmour] },
      traits: ['archer'],
    },
    {
      id: 'ronin',
      kind: 'Samurai',
      danger: 'deadly',
      name: 'Rōnin',
      description:
        'Their lord is dead and their name is gone. The sword is all that came with them.',
      ...foeStats(10, [14, 14, 13, 12], {
        ...NO_HAND_SIGNS,
        kenjutsu: 18,
        willpower: 13,
        taijutsu: 12,
      }),
      maxChakra: 44,
      techniqueIds: [kit.cut, kit.heavyCut, kit.bleedCut, kit.drawStrike],
      carries: { gearIds: [kit.gear.fineSword, kit.gear.lightArmour] },
      traits: ['swift'],
    },
    {
      id: 'retainer-captain',
      kind: 'Samurai',
      danger: 'deadly',
      name: 'Retainer Captain',
      description: 'Commands a lord’s guard and has never once been surprised.',
      ...foeStats(12, [15, 13, 15, 13], {
        ...NO_HAND_SIGNS,
        kenjutsu: 17,
        willpower: 15,
        intellect: 13,
      }),
      maxChakra: 50,
      techniqueIds: [kit.heavyCut, kit.masterCut, kit.breakCut, kit.drawStrike],
      carries: { gearIds: [kit.gear.fineSword, kit.gear.plate] },
      traits: ['armoured'],
    },
    {
      id: 'wandering-sword-saint',
      kind: 'Samurai',
      danger: 'elite',
      name: 'Wandering Sword Saint',
      description:
        'Walks from dojo to dojo asking for the master. None of them has a sign up any more.',
      ...foeStats(14, [16, 20, 16, 18], {
        ...NO_HAND_SIGNS,
        kenjutsu: 30,
        willpower: 20,
        taijutsu: 16,
      }),
      maxChakra: 70,
      techniqueIds: [kit.masterCut, kit.heavyCut, kit.drawStrike, kit.bleedCut],
      carries: { gearIds: [kit.gear.fineSword] },
      traits: ['swift'],
    },
  ];
}

/*#__NO_SIDE_EFFECTS__*/
export function archersAndMonks(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'village-hunter',
      kind: 'Archer',
      danger: 'petty',
      name: 'Hunter',
      description: 'Feeds a family with a bow. Would rather not shoot a person, and might anyway.',
      ...foeStats(5, [8, 9, 10, 11], { kenjutsu: 6 }),
      maxChakra: 0,
      techniqueIds: [],
      traits: ['archer', 'coward'],
    },
    {
      id: 'garrison-bowman',
      kind: 'Archer',
      danger: 'armed',
      name: 'Garrison Bowman',
      description: 'Drilled on the walls of a border fort until loosing is as easy as breathing.',
      ...foeStats(6, [11, 9, 12, 12], { kenjutsu: 12, willpower: 9 }),
      maxChakra: 13,
      techniqueIds: [],
      carries: { gearIds: [kit.gear.lightArmour] },
      traits: ['archer', 'armoured'],
    },
    {
      id: 'temple-archer',
      kind: 'Archer',
      danger: 'armed',
      name: 'Temple Archer',
      description:
        'Shoots as a prayer, eyes half closed. Feels you coming before the bowstring does.',
      ...foeStats(8, [9, 10, 9, 13], { kenjutsu: 12, willpower: 12, chakraControl: 10 }),
      maxChakra: 25,
      techniqueIds: [kit.sense],
      traits: ['archer'],
    },
    {
      id: 'border-marksman',
      kind: 'Archer',
      danger: 'deadly',
      name: 'Border Marksman',
      description: 'A lord pays them by the head. They have never had to take a second shot.',
      ...foeStats(10, [11, 13, 12, 18], { kenjutsu: 17, willpower: 13 }),
      maxChakra: 38,
      techniqueIds: [kit.throw],
      traits: ['archer', 'swift'],
    },
    {
      id: 'warrior-monk',
      kind: 'Monk',
      danger: 'armed',
      name: 'Warrior Monk',
      description: 'Shaved head, bare feet and a temple to defend. Hits like a falling bell.',
      ...foeStats(7, [10, 9, 10, 9], { taijutsu: 10, willpower: 11, chakraControl: 8 }),
      maxChakra: 50,
      techniqueIds: [kit.palm, kit.grapple, kit.heal],
      carries: { gearIds: [kit.gear.knuckles] },
      traits: ['brawler'],
    },
    {
      id: 'temple-abbot',
      kind: 'Monk',
      danger: 'deadly',
      name: 'Fighting Abbot',
      description: 'Sixty years of the same prayers and the same drills. Neither has worn thin.',
      ...foeStats(10, [12, 9, 12, 13], {
        taijutsu: 17,
        willpower: 16,
        chakraControl: 14,
        kenjutsu: 6,
      }),
      maxChakra: 80,
      techniqueIds: [kit.palm, kit.grapple, kit.lock, kit.heal],
      carries: { gearIds: [kit.gear.knuckles], tools: { 'wound-salve': 1 } },
      traits: ['brawler'],
    },
  ];
}
