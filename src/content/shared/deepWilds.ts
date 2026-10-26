import type { DeepWildsDef } from '../deepWilds';

/**
 * The wild countries you can go into off the paths, for every pack: woods, mountains, marsh,
 * shore and desert. A river runs through other country, so it has no depths of its own.
 */
export const DEEP_WILDS: readonly DeepWildsDef[] = [
  {
    biome: 'woods',
    name: 'the deep woods',
    depths: {
      edge: {
        going: 'You leave the path where the foresters stop cutting and walk on under older trees.',
        back: 'The trees thin, and the stumps of the foresters’ cutting start again.',
      },
      deep: {
        going:
          'The trees here have never been cut. The light comes down green, and the ground is soft with a hundred years of needles.',
        back: 'You walk back out under the old trees, following your own marks on the trunks.',
      },
      heart: {
        going:
          'The trunks are wider than a house and the moss is up to your knees. No birds sing this far in.',
        back: 'You leave the heart behind, and somewhere behind you the birds start up again.',
      },
    },
    wayTo: {
      deep: {
        text: 'The trails give out. From here the way on is whatever you can make of the trees.',
        success: 'You find the line of an old stream bed and follow it in.',
        failure: 'You walk in a long circle before you know it, and come back to your own tracks.',
      },
      heart: {
        text: 'Every tree looks like the last, and the sun is somewhere above the canopy.',
        success: 'You keep the moss on your right and the slope under your feet, and go on in.',
        failure:
          'A branch you were sure of turns out to be another, and you fall down a bank finding the way.',
      },
    },
    out: 'You come out of the trees onto the path you left, scratched and tired.',
  },
  {
    biome: 'mountain',
    name: 'the high country',
    depths: {
      edge: {
        going: 'You leave the goat track and climb on over the first scree.',
        back: 'You come down off the scree and find the goat track again.',
      },
      deep: {
        going:
          'Above the trees there is only rock and wind, and the valleys below go blue with distance.',
        back: 'You pick your way back down the ridges, out of the wind.',
      },
      heart: {
        going:
          'The peaks here have no names. Snow lies in the gullies all year, and the air is thin enough to make you dizzy.',
        back: 'You climb down out of the nameless peaks, and the air thickens as you go.',
      },
    },
    wayTo: {
      deep: {
        text: 'The ridge splits three ways, and cloud is coming over two of them.',
        success: 'You take the ridge with the old cairns on it, and they lead you up.',
        failure: 'Your ridge ends at a drop, and you climb down a long way to find another.',
      },
      heart: {
        text: 'There are no cairns any more. Whoever built them never came this far.',
        success: 'You read the snow for where the wind has packed it hard, and cross.',
        failure: 'The snow gives under you on a slope, and you slide a long way before you stop.',
      },
    },
    out: 'You come down onto the goat track with your knees aching from the descent.',
  },
  {
    biome: 'marsh',
    name: 'the far marsh',
    depths: {
      edge: {
        going: 'You leave the dykes behind and wade on into the reeds.',
        back: 'The reeds part, and there are the dykes and the paddies again.',
      },
      deep: {
        going:
          'The reeds close over your head. The water is warm and brown, and there are islands of firm ground if you can find them.',
        back: 'You wade back out from island to island, the way you came.',
      },
      heart: {
        going:
          'The water here is black and very still, and the mist on it never lifts. No fish live in it, but now and then the surface stirs.',
        back: 'The black water turns brown again as you wade out of the heart.',
      },
    },
    wayTo: {
      deep: {
        text: 'Every channel through the reeds looks the same, and some of them end in mud to the waist.',
        success: 'You follow the channels where the water is moving and keep to firm ground.',
        failure: 'You wade into mud that won’t let go, and lose an hour and a sandal getting out.',
      },
      heart: {
        text: 'The mist is down and the islands are only shapes. The sun could be anywhere.',
        success: 'You feel for the cold where the springs come up, and they lead you in.',
        failure: 'You go in over your head in a channel you didn’t see and come up choking.',
      },
    },
    out: 'You climb out onto a dyke, wet to the chest and smelling of the marsh.',
  },
  {
    biome: 'shore',
    name: 'the wild coast',
    depths: {
      edge: {
        going: 'You leave the last fishing huts behind and walk on along the empty sand.',
        back: 'The first fishing huts come in sight round the point.',
      },
      deep: {
        going:
          'The beaches give way to cliffs and coves that nobody fishes. There are caves in the rock, and old fires in some of them.',
        back: 'You climb back round the coves at low water, the way you came.',
      },
      heart: {
        going:
          'Out at the end of the coast the rocks go out into the sea in long black fingers, and the tide comes in faster than you can walk.',
        back: 'You leave the black rocks behind with the tide coming in at your heels.',
      },
    },
    wayTo: {
      deep: {
        text: 'The next cove is round a headland, and the tide is on the turn.',
        success: 'You time the tide and get round the point dry.',
        failure: 'The tide catches you halfway round and you swim the rest, dragged on the rocks.',
      },
      heart: {
        text: 'The cliffs here go straight into the sea. The way on is over them or under them.',
        success: 'You find a path that goats or smugglers made, and follow it along the cliff.',
        failure: 'A handhold breaks on the cliff, and you fall onto the rocks below.',
      },
    },
    out: 'You walk back into the fishing village with salt dried white on your clothes.',
  },
  {
    biome: 'desert',
    name: 'the open desert',
    depths: {
      edge: {
        going: 'You leave the caravan track and walk on into the dunes.',
        back: 'You crest a dune and see the caravan track below.',
      },
      deep: {
        going:
          'The dunes go on to the edge of sight, and the wind moves them while you watch. There are stones out here that were walls once.',
        back: 'You walk back out through the dunes, counting them off the way you came.',
      },
      heart: {
        going:
          'In the heart of the desert the sand is white and the sky is white, and the only shade is your own shadow.',
        back: 'You leave the white sand behind, and the dunes turn gold again.',
      },
    },
    wayTo: {
      deep: {
        text: 'The wind has wiped out every track, yours included.',
        success: 'You wait for the stars and walk by them through the cool of the night.',
        failure: 'You walk all morning towards a ridge that never comes closer, and burn for it.',
      },
      heart: {
        text: 'Out here even the stones are gone, and the dunes all look the same.',
        success: 'You follow the ripples the wind leaves, which all run one way, and go on in.',
        failure: 'The heat gets into your head, and you walk half the day the wrong way.',
      },
    },
    out: 'You come down off the last dune onto the caravan track, with your lips cracked.',
  },
];
