import type { MissionDef } from '@/systems/missions';

import { missionsFromTemplates } from '../../missionTemplates';
import { DEEP_HUNT } from '../../shared/jobs/deepHunt';

/**
 * The fan pack's hunts for beasts changed by chakra (`docs/design/chakra-beasts-plan.md`): off the
 * roads of the Land of Fire into the Great Forest, the hills behind the Leaf and the marsh past
 * the paddies, and out to the edge of the Land of Wind. The boar is fought among the trees and
 * the scorpion on the sand; the serpent's fight is on the firm ground between channels.
 */
export const DEEP_HUNTS: readonly MissionDef[] = /*#__PURE__*/ missionsFromTemplates(DEEP_HUNT, [
  {
    id: 'boar-of-the-great-forest',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 5,
    ground: 'forest',
    values: {
      title: 'The Boar of the Great Forest',
      client: 'The Woodcutters of the Coast Road',
      quarry: 'a boar whose tusks smoke in the rain',
      village: 'the woodcutters’ hamlet on the road through the Great Forest',
      harm: 'The hamlet’s woodpile burned down in the night, and the tracks round the ashes are a boar’s, each one as wide as a hand.',
      going:
        'You leave the coast road where the woodcutters stop cutting and go in under oaks nobody has felled.',
      country: 'woods',
      sign: 'Deeper in, the bark is burned off the oaks at shoulder height, and the scorch marks all lead one way.',
      lair: 'A boar the size of a cart gets up out of a burned hollow, and steam comes off its back where the rain hits it.',
      foe: 'ember-tusk-boar',
      second: 'mist-fox',
      terrain:
        'A hollow of black ferns between two fallen oaks, wet moss underfoot and a stream on the low side.',
      ending:
        'The woodcutters rebuild the woodpile and keep a bucket of water beside it. They send the team home with a cart of seasoned oak for the Leaf’s bathhouses.',
    },
  },
  {
    id: 'the-kite-over-the-hills',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Kite over the Hills',
      client: 'The Hill Farms North of the Leaf',
      quarry: 'a bird that comes down with the lightning',
      village: 'the hill farms behind the Hokage Rock',
      harm: 'Lightning has struck the same terraced field four storms running, and the last bolt killed an ox. The farmers say they saw wings in it.',
      going:
        'You climb past the last terrace, where the farm track gives out, and on up the bare slope.',
      country: 'mountain',
      sign: 'High above the farms, every rock on the ridge is split and blackened on its top side.',
      lair: 'A kite with wings as wide as a door circles over the peak, and your hair stands up before it dives.',
      foe: 'thunder-kite',
      second: 'stone-serow',
      terrain:
        'A bare ridge above the tree line, loose stone underfoot and nothing taller than you for a mile.',
      ending:
        'The storms pass over the hill farms now. The farmers send the team home with a sack of new rice and a feather as long as an arm.',
    },
  },
  {
    id: 'the-serpent-past-the-paddies',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 6,
    values: {
      title: 'The Serpent past the Paddies',
      client: 'The Rice Farmers by the East Gate',
      quarry: 'a serpent as long as a fishing boat',
      village: 'the rice paddies outside the Leaf’s east gate',
      harm: 'The water in the outer paddies drained away overnight through a hole in the dyke wide enough to row through.',
      going:
        'You walk out past the last paddy and on into the reed beds, where the farmers never go.',
      country: 'marsh',
      sign: 'Far out in the reeds, a channel has been pushed through them as wide as a boat, and the water in it is still cloudy.',
      lair: 'The black water swells, and a green head as broad as a door rises out of it to look at you.',
      foe: 'marsh-serpent',
      second: 'lightning-eel',
      terrain:
        'Black channels between banks of firm mud, mist lying on the water, and reeds over your head.',
      ending:
        'The farmers mend the dyke and flood the paddies again. They send the team home with a bale of rice straw and a scale the size of a plate.',
    },
  },
  {
    id: 'the-glass-in-the-outer-sands',
    templateId: 'c-team-deep-hunt',
    minMissionsCompleted: 7,
    ground: 'desert',
    values: {
      title: 'The Glass in the Outer Sands',
      client: 'The Waystation on the Road to the Sand',
      quarry: 'scorpions you can see through',
      village: 'the waystation well at the edge of the Land of Wind',
      harm: 'Two of the waystation’s keepers are laid up with swollen legs, and the caravans have started going round by the long road.',
      going: 'You leave the caravan road at the last marker stone and walk on into the dunes.',
      country: 'desert',
      sign: 'Out on the white sand, small tracks like beads pressed into it all lead the same way.',
      lair: 'A scorpion as long as your arm stands up on the white sand, clear as a bottle, with its tail already raised.',
      foe: 'glass-scorpion',
      second: 'dune-serpent',
      terrain:
        'White sand as far as you can see, one spine of rock, and the sun straight overhead.',
      ending:
        'The caravans come back to the short road. The keepers fill the team’s flasks from the deep well and won’t take payment for the water.',
    },
  },
]);
