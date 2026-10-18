import type { FlavourSet } from '@/systems/missions';

/**
 * More ways the shared encounters can read, each fitting some jobs or grounds, so the twentieth
 * bandit camp isn't the first one again. A set is drawn when an encounter begins, passing over
 * the ones the player met lately (`game/encounter/flavour.ts`); a stage's own lines still win.
 */

export const BANDIT_CAMP: readonly FlavourSet[] = [
  {
    jobs: ['escort', 'deliver'],
    flavour: {
      terrain:
        'A felled tree across the road where it dips between two banks, and room behind it for more men than you can see.',
      noticed:
        'A pebble you dislodge rattles down the bank. Behind the tree someone hisses for quiet, and the talking stops.',
      slipped:
        'You lead the way off the road and through the bracken above them, near enough to hear one of them complain about his boots, and come down again past the bend.',
      caught:
        'You are halfway along the bank when a voice calls up, almost friendly, “Lost your way, have you?”',
      parley:
        'They argue among themselves for a while, and the tree is dragged aside before they have finished arguing.',
      ambush: 'You come over the bank and into them while they are still watching the road.',
      spotted:
        'A whistle from the trees on your left, answered on your right, and they are out on the road before you can turn.',
    },
  },
  {
    jobs: ['eliminate', 'retrieve'],
    flavour: {
      terrain:
        'Lean-tos round a firepit, a stolen cart with its shafts in the air, and a path up the slope behind for whoever runs first.',
      noticed:
        'One of them gets up, stretches, and walks to the edge of the firelight to stare at your patch of dark for a long while.',
      slipped:
        'You go round the back of the lean-tos while they pass a jug, and nobody counts heads.',
      caught:
        'A man coming back from the trees with his trousers half-tied walks straight into you, and yells.',
      parley:
        'Their leader weighs it, spits in the fire, and tells the others to pack. They are gone up the slope by the time the fire dies.',
      ambush: 'You are among the lean-tos before the first of them is on his feet.',
      spotted:
        'The man you took for asleep by the cart was watching all along. He shouts, and the camp comes at you.',
    },
  },
  {
    jobs: ['patrol'],
    flavour: {
      terrain:
        'A trampled clearing off the trail, two snares set across it, and a lookout stump with a view back the way you came.',
      noticed: 'The lookout on the stump turns your way and stays turned.',
      slipped: 'You leave the trail before the clearing and pick it up again a long way past them.',
      caught: 'Your foot finds the second snare, and the whole clearing hears it go.',
      parley:
        'They decide this stretch of forest isn’t worth the trouble, and go looking for a quieter one.',
      ambush:
        'You are on the lookout before he can raise his voice, and on the rest a breath later.',
      spotted: 'They were waiting on the trail, not in the clearing, and you walked into them.',
    },
  },
  {
    grounds: ['town'],
    flavour: {
      terrain:
        'A yard behind a shuttered inn, crates stacked to the eaves, a back gate onto an alley and a ladder to the roofs.',
      noticed: 'A shutter bangs above the yard, and below it the dice stop rattling.',
      slipped:
        'You go over the roofs while they argue about the dice, and drop into the alley beyond.',
      caught: 'A dog in the next yard takes against you, and every head in theirs turns at once.',
      parley:
        'They take your word and the hint behind it, and are out of the back gate before the innkeeper comes to see what the shouting was.',
      ambush: 'You come down off the roof into the middle of their game.',
      spotted: 'Someone on the roofs saw you first. They come out from behind the crates together.',
    },
  },
];

export const BEAST: readonly FlavourSet[] = [
  {
    grounds: ['forest'],
    flavour: {
      terrain:
        'Fresh scrapes on the cedars at shoulder height, a wallow gone to mud, and a game trail it takes to water every dusk.',
      noticed:
        'Everything in the wood goes quiet, the birds first, and then you hear it stop moving too.',
      slipped:
        'You let it go down to the water and cross its trail behind it, stepping only on roots.',
      caught: 'A branch cracks under you, and it comes through the undergrowth in a straight line.',
      parley:
        'It decides you are more trouble than you are worth, and crashes off deeper into the trees.',
      ambush: 'You drop on it from the bank as it lowers its head to drink.',
      spotted: 'It has circled downwind of you. You hear it behind you only as it charges.',
    },
  },
  {
    jobs: ['patrol', 'escort'],
    flavour: {
      terrain:
        'A torn fence, sheep scattered across the hillside, and its tracks heading up into the scrub.',
      noticed: 'The sheep bolt, and up in the scrub something stops eating.',
      slipped: 'You keep to the lee of the wall and leave it to its kill.',
      caught: 'You come over the wall face to face with it, near enough to smell its breath.',
      parley: 'It drags what it killed away up the hill and doesn’t look back.',
      ambush: 'You are on it while its head is still down in the carcass.',
      spotted:
        'It was lying flat in the scrub, watching the road. It is up and running at you before you see it.',
    },
  },
];

export const LONE_ROGUE: readonly FlavourSet[] = [
  {
    grounds: ['forest', 'arena'],
    flavour: {
      terrain:
        'A cold camp in a fold of the hill, a bedroll that hasn’t been slept in, and three ways down that all look the same.',
      noticed:
        'They kick earth over a fire that was already out, and settle with their back to a tree.',
      slipped: 'You go wide round the fold and come back to the path below it, unseen.',
      caught:
        'A thread strung across the path snaps against your shin, and a little bell rings in the camp.',
      parley:
        'They hear you out without once looking away from your hands, then shoulder their pack and go down the far side of the hill.',
      ambush: 'You come out of the trees at their back while they are lacing a sandal.',
      spotted:
        'The bell on the path rang an hour ago and you never heard it. They are waiting for you.',
    },
  },
  {
    jobs: ['retrieve', 'deliver'],
    flavour: {
      terrain:
        'A rented room above a noodle stall, one window onto the street, one onto a drop to the canal.',
      noticed: 'The lamp in the window goes out, and stays out.',
      slipped: 'You pass beneath the window with the crowd, and the shutter never twitches.',
      caught:
        'The stallholder downstairs, paid to watch, calls up a warning as you reach the stair.',
      parley:
        'They come down the stair with their hands where you can see them, and sit at the stall to wait for whoever you send.',
      ambush: 'You come in through the canal window while they are watching the door.',
      spotted: 'They saw you from the window long before you looked up at it.',
    },
  },
];

export const GUARDED_BUILDING: readonly FlavourSet[] = [
  {
    jobs: ['retrieve', 'deliver'],
    flavour: {
      terrain:
        'A warehouse on the quay, a watchman with a lantern at the main door, and a loading hatch a floor up on the river side.',
      noticed: 'The watchman lifts his lantern and swings it slowly along the quay towards you.',
      slipped:
        'You go up the river side to the loading hatch and in, while the watchman counts the boats.',
      caught:
        'A loose board on the quay clatters underfoot, and the watchman’s whistle answers it.',
      parley:
        'A name, a coin and a promise, and the watchman remembers an errand at the far end of the quay.',
      ambush: 'You put the watchman down before his lantern hits the boards.',
      spotted: 'There was a second watchman on the roof. The doors open all at once.',
    },
  },
  {
    grounds: ['forest', 'arena'],
    flavour: {
      terrain:
        'A stockade of sharpened logs in a clearing, a gate with a bar across it, and a ditch round the back that nobody has cleared.',
      noticed: 'A head comes up over the stockade, and a moment later another.',
      slipped: 'You go in by the ditch at the back and over the logs where they lean.',
      caught: 'The ditch is full of dry leaves. By the third step everyone inside knows.',
      parley:
        'After some shouting back and forth the bar comes off the gate, and they let you in to talk.',
      ambush: 'You are over the stockade and on the gate guard before the bar is lifted.',
      spotted:
        'They had a watcher in the trees outside the stockade. The gate opens and they pour out.',
    },
  },
];

export const SPIRIT: readonly FlavourSet[] = [
  {
    grounds: ['room', 'town'],
    flavour: {
      terrain:
        'Frost on the inside of the shutters, a tatami worn through in one place, and a corner the lamplight will not reach.',
      noticed: 'The frost on the shutters creeps an inch further while you watch.',
      slipped:
        'You cross the room along the wall, breathing through your sleeve, and it never turns from its corner.',
      caught: 'The tatami creaks where it is worn, and the cold in the corner turns towards you.',
      parley: 'It lets go of whatever kept it here, and the frost runs down the shutters as water.',
      ambush: 'You strike at the corner while it is still bent over whatever it is mourning.',
      spotted: 'The cold was already behind you when you came in.',
    },
  },
  {
    grounds: ['forest', 'lake', 'arena'],
    flavour: {
      terrain:
        'Mist lying on the ground in a ring that the wind doesn’t move, and in the middle of it a stone nobody has tended.',
      noticed: 'The mist draws in on itself, as if listening.',
      slipped: 'You walk round the ring of mist without crossing it, and nothing inside it stirs.',
      caught: 'You put a foot into the mist and it closes round your ankle like a hand.',
      parley: 'The mist thins and goes, and there is only an old stone in the grass.',
      ambush: 'You strike into the mist while it is turned towards the stone.',
      spotted: 'The mist was round your feet long before you saw the ring.',
    },
  },
];
