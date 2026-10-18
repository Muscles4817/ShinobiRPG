import type { EncounterTemplate } from '@/systems/missions';

import { BANDIT_CAMP, BEAST, GUARDED_BUILDING, LONE_ROGUE, SPIRIT } from './encounterFlavours';

/**
 * Kinds of encounter every setting shares: which approaches make sense against them, how they
 * can be scouted and how alert they start. Missions pick one per encounter stage and may swap
 * any line of flavour for their own.
 */
export const ENCOUNTERS: readonly EncounterTemplate[] = [
  {
    id: 'bandit-camp',
    variants: BANDIT_CAMP,
    name: 'Bandit camp',
    approaches: [
      'head-on',
      'ambush',
      'sneak',
      'talk',
      'bribe',
      'intimidate',
      'set-ground',
      'withdraw',
    ],
    recon: [
      { id: 'observe', label: 'Watch them from cover', difficulty: 8 },
      { id: 'track', label: 'Read their tracks', difficulty: 7 },
      { id: 'sense', label: 'Feel for chakra', difficulty: 9 },
      { id: 'ask', label: 'Ask travellers on the road', difficulty: 0 },
    ],
    alertness: 'unaware',
    talkable: true,
    resolve: 9,
    flavour: {
      terrain:
        'A cookfire in a hollow below the path, packs piled beside it, one way in and two ways out.',
      noticed:
        'A dog starts barking. The voices round the fire drop, and someone kicks dirt over the flames.',
      slipped: 'You pass close enough to smell their supper, and nobody looks up from the pot.',
      caught: '“Oi! Who’s that?” A torch swings your way, and then another.',
      parley:
        'They grumble and spit and take their time about it, but in the end they let you by and melt back into the brush.',
      ambush: 'You drop on them before anyone has reached for a weapon.',
      spotted:
        'A lookout you never saw whistles from the trees, and they come at you out of the brush.',
    },
  },
  {
    id: 'beast',
    variants: BEAST,
    name: 'Beast',
    approaches: ['head-on', 'ambush', 'sneak', 'set-ground', 'withdraw'],
    recon: [
      { id: 'observe', label: 'Watch from downwind', difficulty: 7 },
      { id: 'track', label: 'Follow its spoor', difficulty: 6 },
      { id: 'sense', label: 'Feel for its heartbeat', difficulty: 8 },
      { id: 'ask', label: 'Ask the locals about it', difficulty: 0 },
    ],
    alertness: 'wary',
    talkable: false,
    resolve: 0,
    flavour: {
      terrain:
        'Trampled undergrowth, a den dug in among the roots, and a gap in the thicket where it bolts when it’s scared.',
      noticed:
        'Its head comes up from the ground, and it tests the air in your direction for a long breath.',
      slipped: 'You keep the wind in your face and leave it rooting in the dirt.',
      caught: 'It wheels round with a snarl and comes straight at you.',
      parley: 'It backs away with its hackles up, and slinks off into the thicket.',
      ambush: 'You are on it before it can turn its head.',
      spotted:
        'It caught your scent long before you found it, and it comes bursting out of the undergrowth at you.',
    },
  },
  {
    id: 'lone-rogue',
    variants: LONE_ROGUE,
    name: 'Lone rogue',
    approaches: ['head-on', 'ambush', 'sneak', 'talk', 'intimidate', 'set-ground', 'withdraw'],
    recon: [
      { id: 'observe', label: 'Watch from a rooftop', difficulty: 9 },
      { id: 'track', label: 'Trace where they’ve been', difficulty: 8 },
      { id: 'sense', label: 'Feel for their chakra', difficulty: 9 },
      { id: 'ask', label: 'Ask who has seen them', difficulty: 0 },
    ],
    alertness: 'wary',
    talkable: true,
    resolve: 10,
    flavour: {
      terrain:
        'Close walls on both sides, a single lane out, and good cover for whoever moves first.',
      noticed:
        'They glance over their shoulder, straight at the place where you were standing a moment ago.',
      slipped: 'You let them pass beneath you and go on your way when they have turned the corner.',
      caught: '“I can see you, you know. You may as well come out.”',
      parley: 'Their shoulders drop, and after a while they hold out their wrists to be tied.',
      ambush: 'You strike before they know you are anywhere near.',
      spotted: 'They were watching you all along, and they strike first.',
    },
  },
  {
    id: 'guarded-building',
    variants: GUARDED_BUILDING,
    name: 'Guarded building',
    approaches: ['head-on', 'ambush', 'sneak', 'talk', 'bribe', 'set-ground', 'withdraw'],
    recon: [
      { id: 'observe', label: 'Time the guards’ rounds', difficulty: 9 },
      { id: 'sense', label: 'Count the chakra inside', difficulty: 10 },
      { id: 'ask', label: 'Ask the neighbours', difficulty: 0 },
    ],
    alertness: 'wary',
    talkable: true,
    resolve: 10,
    flavour: {
      terrain:
        'A front gate, a back door into the kitchen yard, and a wall low enough to climb in the dark.',
      noticed: 'A shutter opens upstairs, and someone stands at it looking out into the dark.',
      slipped: 'You are over the wall and through the yard before the guards come round again.',
      caught: 'A whistle shrills, and doors bang open all round the yard.',
      parley: 'You talk to the man on the gate for a while, and in the end he opens it for you.',
      ambush: 'You take the guard on the gate before he can draw breath to shout.',
      spotted:
        'A guard on the roof saw you coming up the street, and they rush you before you are ready.',
    },
  },
  {
    id: 'spirit',
    variants: SPIRIT,
    name: 'Spirit',
    approaches: ['head-on', 'ambush', 'set-ground', 'withdraw'],
    recon: [
      { id: 'observe', label: 'Watch where the cold gathers', difficulty: 9 },
      { id: 'sense', label: 'Feel for its chakra', difficulty: 8 },
      { id: 'ask', label: 'Ask who has seen it', difficulty: 0 },
    ],
    alertness: 'unaware',
    talkable: false,
    resolve: 0,
    flavour: {
      terrain:
        'Cold drafts, corners the lamp won’t reach, and one place where the frost never lifts.',
      noticed:
        'The air goes still and heavy, the way a room does when someone turns to look at you.',
      slipped: 'You hold your breath and walk through the cold, and nothing stirs in it.',
      caught: 'The lamps gutter and go out together. It knows you are here.',
      parley: 'It lets out a long breath, and thins away into the dark.',
      ambush: 'You strike while it is still bent over whatever it is grieving.',
      spotted: 'The cold closes round you from behind, and you understand that it found you first.',
    },
  },
];
