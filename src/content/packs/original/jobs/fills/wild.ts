import type { MissionFill } from '../../../../missionTemplates';

/**
 * Hunts that go off the paths after a beast changed by chakra, into the heart of the wild
 * country it lives in, for the villages at its edge: a charcoal wood, a goat hamlet, a reed
 * village, an oasis and a fishing cove.
 */
export const WILD_FILLS: readonly MissionFill[] = [
  {
    id: 'the-burning-boar',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 5,
    values: {
      title: 'The Burning Boar',
      client: 'The Charcoal-Burners of Sumiyama',
      quarry: 'a boar whose tusks smoke',
      village: 'the charcoal village of Sumiyama',
      harm: 'Two of the charcoal kilns have been dug open from below, and the wood around them has burned. The tracks in the ash are a boar’s, and each one is as wide as a hand.',
      going:
        'The burners’ path ends at the last kiln. After that the cedars have never been cut, and the ground is soft with needles.',
      country: 'woods',
      sign: 'Past the old trees the wallows are dry and black, and the ferns round them have burned to the root.',
      lair: 'A boar the size of an ox gets up out of a scorched hollow and shakes itself, and the rain hisses on its back.',
      foe: 'ember-tusk-boar',
      second: 'mist-fox',
      terrain: 'A hollow of burned ferns among cedar roots, with a stream along one side.',
      ending:
        'The kilns are lit again by the end of the week. Somebody nails a tusk over the burners’ door before you have left the village.',
    },
  },
  {
    id: 'the-kite-over-hachiro',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Kite over Hachirō',
      client: 'The Goatherds of Hachirō',
      quarry: 'a bird that comes down with the lightning',
      village: 'the goat hamlet of Hachirō, high under the ridge',
      harm: 'Six goats are dead on the high pasture, burned black in a ring. Every storm this month has come straight for the hamlet.',
      going: 'Where the goat track stops at the last pasture, you climb on over the scree.',
      country: 'mountain',
      sign: 'Above the snow line the rocks are scorched in lines, all struck from the same height.',
      lair: 'On the third storm the kite drops out of the cloud, and the goats on the far slope were right to run.',
      foe: 'thunder-kite',
      second: 'stone-serow',
      terrain: 'Bare stone on a saddle between two peaks. Nowhere to hide from the sky.',
      ending:
        'The next storm goes round Hachirō to the north. The goatherds give the team a cheese each and argue about whose goats it saved.',
    },
  },
  {
    id: 'the-serpent-in-the-black-water',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Serpent in the Black Water',
      client: 'The Reed-Cutters of Ashikawa',
      quarry: 'a serpent as long as a boat',
      village: 'the reed village of Ashikawa, at the edge of the far marsh',
      harm: 'A reed-cutter’s boat was found upside down in the channel, crushed flat. Nobody has gone out past the dykes since.',
      going: 'The dykes stop. After that it is reeds over your head and water to the knee.',
      country: 'marsh',
      sign: 'Out in the far marsh a path of flattened reeds, a boat’s width across, leads towards the black water.',
      lair: 'Half a reed-cutter’s boat drifts out of the mist, and the serpent comes up under it to take the rest.',
      foe: 'marsh-serpent',
      second: 'lightning-eel',
      terrain: 'Black water between small islands, and mist lying low on the surface.',
      ending:
        'The reed-cutters go out the next morning, two boats together. The headwoman keeps one scale, which is the size of a plate.',
    },
  },
  {
    id: 'the-glass-at-the-well',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 7,
    values: {
      title: 'The Glass at the Well',
      client: 'The Well-Keepers of Hoshimizu',
      quarry: 'a scorpion you can see through',
      village: 'the oasis of Hoshimizu',
      harm: 'Two of the well-keepers are in bed with swollen legs, and the third won’t go near the water at night.',
      going:
        'You leave the caravan track at the last palm and head for where the sand turns white.',
      country: 'desert',
      sign: 'In the white sand there are tracks like beads pressed in a row, going away from the oasis.',
      lair: 'A scorpion as long as your arm is waiting by a rock, tail up, with the sun showing through it.',
      foe: 'glass-scorpion',
      second: 'dune-serpent',
      terrain: 'White sand to the edge of sight, and one ridge of rock.',
      ending:
        'The well-keepers draw water at night again. They fill the team’s flasks from the deep well, which they say is never given away.',
    },
  },
  {
    id: 'the-crab-that-brings-the-tide',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Crab that Brings the Tide',
      client: 'The Fishers of Kurohama',
      quarry: 'a crab that walks up the beach with the sea behind it',
      village: 'the cove village of Kurohama',
      harm: 'Waves came up the beach at low tide three nights running and dragged the boats off their rollers. There are claw marks on the hulls.',
      going: 'Past the last fishing hut there is only empty sand, and the cliffs a long way ahead.',
      country: 'shore',
      sign: 'Out past the cliffs the rock pools have been emptied, and the weed in them is torn.',
      lair: 'The crab is turning over a beached boat with one claw, looking under it.',
      foe: 'tide-crab',
      second: 'ink-squid',
      terrain: 'Black rocks running out into the sea, with the tide coming in round them.',
      ending:
        'Nobody at Kurohama will take the claw. It comes home with you, and smells worse every day.',
    },
  },
];
