import type { MissionTemplate } from '../../../../missionTemplates';

/**
 * A C-rank team job that goes off the paths: a hunt for a beast changed by chakra
 * (`docs/design/chakra-beasts-plan.md`), a day at each depth of the wild country it lives in,
 * its heart, and two days back out. The days draw on their depth's road events (`deepRegion`)
 * for sights and finds; a job's foes are its own, so the depths' foes stay off it.
 */
export const C_TEAM_WILD: readonly MissionTemplate[] = [
  {
    id: 'c-team-deep-hunt',
    rank: 'C',
    slots: 6,
    energyCost: 35,
    reward: { ryo: 650, reputation: 10 },
    minMissionsCompleted: 5,
    placeholders: {
      title: 'the job’s title, e.g. The Burning Boar',
      client: 'who sends for the team, e.g. the Charcoal-Burners of Sumiyama',
      quarry: 'the one beast the team hunts, mid-sentence, e.g. a boar whose tusks smoke',
      village: 'where it threatens, mid-sentence, e.g. the charcoal village of Sumiyama',
      harm: 'a sentence: what the beast has done, seen on arrival',
      going: 'a sentence: the day in at the edge of the wild, off the paths',
      country:
        'the kind of wild country, as a deep-wilds biome: woods, mountain, marsh, shore or desert',
      sign: 'a sentence: the trail on into the heart, and what it tells a sharp eye',
      lair: 'a sentence: the beast where it lives, doing what it does',
      foe: 'an enemy id: a changed chakra beast, such as ember-tusk-boar',
      second: 'an enemy id: a lesser beast with it, such as mist-fox',
      terrain: 'a sentence: the lie of the land round the lair, once observed',
      ending: 'a sentence: the village safe, and what it does about it',
    },
    title: '{title}',
    client: '{client}',
    summary: 'Go into the wild after {quarry}, before it ruins {village}.',
    stages: [
      { kind: 'narrative', text: '{harm}' },
      { kind: 'leg', text: '{going}', days: 1, region: '{country}-edge', danger: 'armed' },
      {
        kind: 'leg',
        text: 'Further in, past where anyone from the village goes.',
        days: 1,
        region: '{country}-deep',
        danger: 'deadly',
      },
      {
        kind: 'check',
        text: '{sign}',
        approaches: [
          { label: 'Follow its trail in', stat: 'perception', difficulty: 10, role: 'tracker' },
          { label: 'Work out where it beds down', stat: 'intellect', difficulty: 11 },
        ],
        success: 'You find the way in before noon, and the trail is fresh.',
        failure: 'You lose the trail twice and find it again late, tired and scraped.',
        onFailure: 'forward',
        failureDamage: 6,
      },
      {
        kind: 'leg',
        text: 'Into the heart, where nobody from the village has been.',
        days: 1,
        region: '{country}-heart',
        danger: 'elite',
      },
      {
        kind: 'encounter',
        template: 'beast',
        job: 'eliminate',
        text: '{lair}',
        enemyIds: ['{foe}', '{second}'],
        canFlee: false,
        flavour: { terrain: '{terrain}' },
      },
      {
        kind: 'leg',
        text: 'Two days back out the way you came.',
        days: 2,
        region: '{country}-edge',
        danger: 'armed',
      },
      { kind: 'narrative', text: '{ending}' },
    ],
  },
];
