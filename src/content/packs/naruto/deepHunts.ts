import type { MissionDef } from '@/systems/missions';

import { missionsFromTemplates, type MissionFill } from '../../missionTemplates';
import { DEEP_HUNT } from '../../shared/jobs/deepHunt';

/**
 * The Leaf's hunts for beasts changed by chakra (`docs/design/chakra-beasts-plan.md`): a charcoal
 * camp in the Great Forest, the watch post on the northern pass, a reed hamlet down the Naka, all
 * posted at the mission desk, and the barge road out of Kagerō Landing, posted at its Barge
 * Office. The serpent is fought on the mudbanks, out of the water it can't walk on either.
 */
export const DEEP_HUNT_FILLS: readonly MissionFill[] = [
  {
    id: 'embers-under-the-oaks',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 5,
    ground: 'forest',
    values: {
      title: 'Embers under the Oaks',
      client: 'The Charcoal Camp on the Coast Road',
      quarry: 'a boar that sets the undergrowth alight where it roots',
      village: 'the charcoal camp where the coast road enters the Great Forest',
      harm: 'Every kiln in the camp was knocked over in one night, and the ground round them is ploughed up and still smoking.',
      going: 'At the Fallen Oak you step off the road and keep the morning sun at your backs.',
      country: 'woods',
      sign: 'By afternoon the moss is singed in patches a stride apart, and the patches get fresher as you go.',
      lair: 'In a clearing of burned saplings, a boar lifts its head out of the ash and snorts sparks.',
      foe: 'ember-tusk-boar',
      second: 'mist-fox',
      terrain:
        'Burned saplings round a clearing deep in ash, with a fallen oak along one side to put your back to.',
      ending:
        'The burners have the first kiln lit again before the team is out of sight of the camp.',
    },
  },
  {
    id: 'the-struck-watchtower',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Struck Watchtower',
      client: 'The Northern Watch Post',
      quarry: 'a kite that rides the storms in from the north',
      village: 'the Leaf’s watch post on the northern pass',
      harm: 'Lightning has hit the watch post’s signal tower three times since the new moon. The last strike threw the sentry off the platform, and the sentry swears it came down in the shape of a bird.',
      going:
        'Above the watch post the path narrows to a goat track, and then there is no path at all.',
      country: 'mountain',
      sign: 'On the high ridge the snow has melted in streaks, and every streak points up at the same peak.',
      lair: 'The kite drops out of the cloud with its feathers crackling, and the hairs on your arms stand up just before it strikes.',
      foe: 'thunder-kite',
      second: 'stone-serow',
      terrain:
        'A bare ridge above the tree line, loose stone underfoot and the sky open on every side.',
      ending:
        'The sentries rebuild the platform a little lower down the slope, and nothing has struck the tower since.',
    },
  },
  {
    id: 'the-serpent-of-the-lower-reeds',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Serpent of the Lower Reeds',
      client: 'The Reed-Cutters of the Lower Naka',
      quarry: 'a serpent that pulls boats under',
      village: 'the reed hamlet where the Naka River spreads out into marsh',
      harm: 'A punt came back to the hamlet empty with its pole snapped, and nobody will cut reeds past the marker posts now.',
      going:
        'You pole out past the marker posts and leave the punt where the water gets too shallow for it.',
      country: 'marsh',
      sign: 'Deeper in, the herons have all gone, and a furrow through the reeds runs ahead of you towards open water.',
      lair: 'The open water goes still. Then a green head breaks the surface without a ripple and turns to watch you.',
      foe: 'marsh-serpent',
      second: 'lightning-eel',
      terrain: 'Mudbanks firm enough to stand on, cut apart by black channels too deep to wade.',
      ending:
        'Within the week the reed-cutters are back past the marker posts, and the newest punt in the hamlet is named for the team.',
    },
  },
  {
    id: 'landing-glass-scorpion',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 7,
    ground: 'desert',
    values: {
      title: 'Glass on the Barge Road',
      client: 'The Barge Masters of Kagerō Landing',
      quarry: 'a scorpion clear enough to see the sand through',
      village: 'the barge road out of Kagerō Landing',
      harm: 'A barge came in last night with two of its haulers stung and raving, and the rest won’t go out again until the road is safe.',
      going:
        'You follow the barge road out of the Landing until the haulers’ cairns stop, then turn off it into the dunes.',
      country: 'desert',
      sign: 'On the flats beyond, the drag marks of the stung barge lead back to a dune the haulers wouldn’t go near.',
      lair: 'The sand at the foot of the dune shifts, and a scorpion climbs out of it, hard to see against the light.',
      foe: 'glass-scorpion',
      second: 'dune-serpent',
      terrain: 'Hard flats under the dune, the heat coming up off them and no shade until sundown.',
      ending:
        'The barges run again the next morning, and the haulers paint a glass scorpion on the bow of the first one out.',
    },
  },
];

export const DEEP_HUNTS: readonly MissionDef[] = /*#__PURE__*/ missionsFromTemplates(
  DEEP_HUNT,
  DEEP_HUNT_FILLS,
);
