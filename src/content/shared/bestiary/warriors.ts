import type { EnemyDef } from '../../types';
import type { FoeKit } from './kit';

/**
 * Fighters trained outside the shinobi villages. Samurai have little chakra and less use for
 * hand signs, but a will that shrugs off illusions and a blade that is the whole of their art.
 * Trained archers are not bandits with bows; warrior monks fight with open hands and mend
 * themselves.
 */

/** A samurai's art is the blade alone: ninjutsu and genjutsu are this far below their base. */
const NO_HAND_SIGNS = -4;

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
      baseStat: 6,
      statBonuses: { strength: 2, stamina: 2, taijutsu: 1, speed: -1 },
      maxChakra: 10,
      techniqueIds: [kit.sweep, kit.palm],
      traits: ['armoured'],
    },
    {
      id: 'samurai',
      kind: 'Samurai',
      danger: 'armed',
      name: 'Samurai',
      description: 'Trained to the sword since they could stand. No tricks, and none needed.',
      baseStat: 7,
      statBonuses: {
        kenjutsu: 4,
        willpower: 3,
        stamina: 1,
        ninjutsu: NO_HAND_SIGNS,
        genjutsu: NO_HAND_SIGNS,
      },
      maxChakra: 25,
      techniqueIds: [kit.cut, kit.heavyCut, kit.drawStrike],
      traits: ['armoured'],
    },
    {
      id: 'samurai-archer',
      kind: 'Samurai',
      danger: 'armed',
      name: 'Samurai Archer',
      description: 'Shoots from horseback at a gallop and still picks which eye.',
      baseStat: 8,
      statBonuses: {
        perception: 3,
        speed: 1,
        willpower: 2,
        ninjutsu: NO_HAND_SIGNS,
        genjutsu: NO_HAND_SIGNS,
      },
      maxChakra: 10,
      techniqueIds: [],
      traits: ['archer'],
    },
    {
      id: 'ronin',
      kind: 'Samurai',
      danger: 'deadly',
      name: 'Rōnin',
      description:
        'Their lord is dead and their name is gone. The sword is all that came with them.',
      baseStat: 10,
      statBonuses: {
        kenjutsu: 5,
        speed: 2,
        willpower: 2,
        ninjutsu: NO_HAND_SIGNS - 1,
        genjutsu: NO_HAND_SIGNS - 1,
      },
      maxChakra: 35,
      techniqueIds: [kit.cut, kit.heavyCut, kit.bleedCut, kit.drawStrike],
      traits: ['swift'],
    },
    {
      id: 'retainer-captain',
      kind: 'Samurai',
      danger: 'deadly',
      name: 'Retainer Captain',
      description: 'Commands a lord’s guard and has never once been surprised.',
      baseStat: 12,
      statBonuses: {
        kenjutsu: 5,
        willpower: 4,
        stamina: 2,
        intellect: 2,
        ninjutsu: NO_HAND_SIGNS - 2,
        genjutsu: NO_HAND_SIGNS - 2,
      },
      maxChakra: 40,
      techniqueIds: [kit.heavyCut, kit.masterCut, kit.breakCut, kit.drawStrike],
      traits: ['armoured'],
    },
    {
      id: 'wandering-sword-saint',
      kind: 'Samurai',
      danger: 'elite',
      name: 'Wandering Sword Saint',
      description:
        'Walks from dojo to dojo asking for the master. None of them has a sign up any more.',
      baseStat: 14,
      statBonuses: {
        kenjutsu: 7,
        speed: 3,
        willpower: 4,
        ninjutsu: NO_HAND_SIGNS * 2,
        genjutsu: NO_HAND_SIGNS * 2,
      },
      maxChakra: 60,
      techniqueIds: [kit.masterCut, kit.heavyCut, kit.drawStrike, kit.bleedCut],
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
      baseStat: 5,
      statBonuses: { perception: 3, speed: 1, strength: -1 },
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
      baseStat: 7,
      statBonuses: { perception: 3, stamina: 2 },
      maxChakra: 10,
      techniqueIds: [],
      traits: ['archer', 'armoured'],
    },
    {
      id: 'temple-archer',
      kind: 'Archer',
      danger: 'armed',
      name: 'Temple Archer',
      description:
        'Shoots as a prayer, eyes half closed. Feels you coming before the bowstring does.',
      baseStat: 8,
      statBonuses: { perception: 4, willpower: 3, speed: 1 },
      maxChakra: 20,
      techniqueIds: [kit.sense],
      traits: ['archer'],
    },
    {
      id: 'border-marksman',
      kind: 'Archer',
      danger: 'deadly',
      name: 'Border Marksman',
      description: 'A lord pays them by the head. They have never had to take a second shot.',
      baseStat: 10,
      statBonuses: { perception: 5, speed: 2, willpower: 2 },
      maxChakra: 30,
      techniqueIds: [kit.throw],
      traits: ['archer', 'swift'],
    },
    {
      id: 'warrior-monk',
      kind: 'Monk',
      danger: 'armed',
      name: 'Warrior Monk',
      description: 'Shaved head, bare feet and a temple to defend. Hits like a falling bell.',
      baseStat: 8,
      statBonuses: { taijutsu: 3, willpower: 4, stamina: 2 },
      maxChakra: 40,
      techniqueIds: [kit.palm, kit.grapple, kit.heal],
      traits: ['brawler'],
    },
    {
      id: 'temple-abbot',
      kind: 'Monk',
      danger: 'deadly',
      name: 'Fighting Abbot',
      description: 'Sixty years of the same prayers and the same drills. Neither has worn thin.',
      baseStat: 11,
      statBonuses: { taijutsu: 4, willpower: 5, chakraControl: 2, speed: -1 },
      maxChakra: 70,
      techniqueIds: [kit.palm, kit.grapple, kit.lock, kit.heal],
      traits: ['brawler'],
    },
  ];
}
