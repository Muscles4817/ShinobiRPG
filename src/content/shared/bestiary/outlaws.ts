import type { EnemyDef } from '../../types';
import { foeStats, NO_ARTS } from './foeStats';
import type { FoeKit } from './kit';

/**
 * Bandits beyond the thug, the archer and the chief: the middle of the ladder, where a road gang
 * has a deserter who knows a technique or two and a lieutenant who can use a sword. Smugglers
 * and mercenaries are the same trade with better manners.
 */

/*#__NO_SIDE_EFFECTS__*/
export function bandits(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'bandit-cutpurse',
      kind: 'Bandit',
      danger: 'petty',
      name: 'Cutpurse',
      description: 'Light fingers, light feet, and a smoke tag for when both fail.',
      ...foeStats(5, [7, 12, 8, 9]),
      maxChakra: 19,
      techniqueIds: [kit.smoke],
      traits: ['swift', 'coward'],
    },
    {
      id: 'bandit-knifeman',
      kind: 'Bandit',
      danger: 'armed',
      name: 'Bandit Knife-Man',
      description: 'Gets in close and stays there. The knife is the least of it.',
      ...foeStats(5, [10, 11, 9, 7], { taijutsu: 7 }),
      maxChakra: 13,
      techniqueIds: [kit.palm, kit.sweep],
      traits: ['swift'],
    },
    {
      id: 'bandit-deserter',
      kind: 'Bandit',
      danger: 'armed',
      name: 'Deserter Bandit',
      description:
        'Wore a forehead protector once and scratched it through. Knows tricks the others don’t.',
      ...foeStats(7, [10, 10, 10, 8], { ninjutsu: 10, chakraControl: 8 }),
      maxChakra: 50,
      techniqueIds: [kit.earthShot, kit.earthGrip, kit.palm],
      nature: 'earth',
    },
    {
      id: 'bandit-firebrand',
      kind: 'Bandit',
      danger: 'armed',
      name: 'Firebrand',
      description:
        'Burns out caravans for a living. Learned the fire from a village that threw them out.',
      ...foeStats(7, [9, 10, 9, 7], { ninjutsu: 10 }),
      maxChakra: 49,
      techniqueIds: [kit.fireShot, kit.fireBreath],
      nature: 'fire',
    },
    {
      id: 'roadside-fortune-teller',
      kind: 'Bandit',
      danger: 'armed',
      name: 'Roadside Fortune-Teller',
      description:
        'Reads palms at a crossroads, and the travellers who stop never see the gang arrive.',
      ...foeStats(7, [6, 8, 7, 9], { genjutsu: 10, willpower: 9, intellect: 9, taijutsu: 4 }),
      maxChakra: 55,
      techniqueIds: [kit.feint, kit.heavyLimbs],
      traits: ['illusionist', 'coward'],
    },
    {
      id: 'bandit-lieutenant',
      kind: 'Bandit',
      danger: 'armed',
      name: 'Bandit Lieutenant',
      description: 'The chief’s right hand: a stolen sword, a padded coat and a habit of winning.',
      ...foeStats(7, [12, 10, 11, 8], { kenjutsu: 7, taijutsu: 7 }),
      maxChakra: 38,
      techniqueIds: [kit.cut, kit.bleedCut, kit.throw],
      traits: ['armoured'],
    },
    {
      id: 'hill-warlord',
      kind: 'Bandit',
      danger: 'deadly',
      name: 'Hill Warlord',
      description:
        'Rules three valleys from a burned-out fort. The gangs pay tribute or disappear.',
      ...foeStats(10, [14, 11, 13, 10], { kenjutsu: 13, willpower: 13, ninjutsu: 5, genjutsu: 5 }),
      maxChakra: 60,
      techniqueIds: [kit.heavyCut, kit.sweepCut, kit.bleedCut, kit.blastTag],
      traits: ['armoured'],
    },
  ];
}

/*#__NO_SIDE_EFFECTS__*/
export function smugglersAndSellswords(kit: FoeKit): EnemyDef[] {
  return [
    {
      id: 'smuggler',
      kind: 'Smuggler',
      danger: 'petty',
      name: 'Smuggler',
      description: 'Carries what the tax-men want and runs the moment one appears.',
      ...foeStats(5, [8, 10, 8, 8], { intellect: 8 }),
      maxChakra: 19,
      techniqueIds: [kit.smoke, kit.throw],
      traits: ['coward'],
    },
    {
      id: 'guard-dog',
      kind: 'Beast',
      danger: 'petty',
      name: 'Guard Dog',
      description: 'Big, chained most of the day, and in a very bad mood about it.',
      ...foeStats(3, [9, 13, 11, 15], { ...NO_ARTS, taijutsu: 7, willpower: 7 }),
      healthScale: 0.6,
      maxChakra: 0,
      techniqueIds: [],
      traits: ['brawler'],
    },
    {
      id: 'smuggler-boss',
      kind: 'Smuggler',
      danger: 'armed',
      name: 'Smuggler Boss',
      description:
        'Owns the warehouse, the boats and the dog. Doesn’t like to get their hands dirty.',
      ...foeStats(7, [9, 10, 9, 9], { intellect: 11, taijutsu: 8 }),
      maxChakra: 32,
      techniqueIds: [kit.palm, kit.smoke, kit.snare],
      retinue: [{ enemyId: 'guard-dog', tell: 'open' }],
    },
    {
      id: 'mercenary-blade',
      kind: 'Mercenary',
      danger: 'armed',
      name: 'Hired Sword',
      description: 'Paid by the day, and fights exactly as hard as the day’s pay.',
      ...foeStats(7, [10, 9, 10, 8], { kenjutsu: 11 }),
      maxChakra: 25,
      techniqueIds: [kit.cut, kit.bleedCut],
      traits: ['armoured'],
    },
    {
      id: 'mercenary-veteran',
      kind: 'Mercenary',
      danger: 'deadly',
      name: 'Mercenary Veteran',
      description: 'Twenty years of other people’s wars. Picked up a little of everyone’s tricks.',
      ...foeStats(10, [14, 11, 14, 11], {
        kenjutsu: 17,
        taijutsu: 14,
        intellect: 12,
        willpower: 12,
      }),
      maxChakra: 55,
      techniqueIds: [kit.heavyCut, kit.throw, kit.substitute, kit.blastTag],
      traits: ['armoured'],
    },
    {
      id: 'hired-assassin',
      kind: 'Assassin',
      danger: 'deadly',
      name: 'Hired Knife',
      description: 'Nobody sees them come in. The ones who see them leave aren’t telling.',
      ...foeStats(10, [10, 15, 9, 14], { kenjutsu: 16, taijutsu: 12 }),
      maxChakra: 60,
      techniqueIds: [kit.bleedCut, kit.conceal, kit.throw, kit.move],
      traits: ['swift'],
    },
  ];
}
