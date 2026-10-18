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
      terrain: 'A cookfire in a hollow, packs piled by the path, one way in and two ways out.',
      noticed: 'A dog barks. Voices drop, and someone kicks dirt over the fire.',
      slipped: 'You pass close enough to smell their supper. Nobody looks up.',
      caught: '“Oi! Who’s that?” A torch swings your way.',
      parley: 'They grumble and spit, but they let you by and melt back into the brush.',
      ambush: 'You drop on them before anyone reaches for a weapon.',
      spotted: 'A lookout you never saw whistles. They come at you from the brush.',
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
      terrain: 'Trampled undergrowth, a den in the roots, and a gap where it bolts when scared.',
      noticed: 'Its head comes up. It sniffs the air in your direction.',
      slipped: 'You keep the wind in your face and leave it rooting in the dirt.',
      caught: 'It wheels round with a snarl and charges.',
      parley: 'It backs away, hackles up, and slinks off.',
      ambush: 'You are on it before it can turn.',
      spotted: 'It caught your scent long ago. It bursts out of the undergrowth at you.',
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
      terrain: 'Close walls, a single lane out, and good cover for whoever moves first.',
      noticed: 'They glance over their shoulder, straight at where you were a moment ago.',
      slipped: 'You let them pass beneath you and go on your way.',
      caught: '“I see you. Come out, then.”',
      parley: 'Their shoulders drop. They hold out their wrists.',
      ambush: 'You strike before they know you are there.',
      spotted: 'They were watching you all along. They strike first.',
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
      terrain: 'A front gate, a back door, and a wall low enough to climb in the dark.',
      noticed: 'A shutter opens upstairs. Someone stares out into the dark.',
      slipped: 'You are over the wall and through before the next round.',
      caught: 'A whistle shrills. Doors bang open all over the yard.',
      parley: 'A few words, a nod, and the gate is opened for you.',
      ambush: 'You take the guard at the gate before they can shout.',
      spotted: 'A guard on the roof saw you coming. They rush you before you are ready.',
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
      terrain: 'Cold drafts, dark corners, and one place where the frost never lifts.',
      noticed: 'The air goes still. Something has turned its attention to you.',
      slipped: 'You hold your breath and walk through the cold. It does not stir.',
      caught: 'The lamps gutter and die. It knows you are here.',
      parley: 'It sighs and thins into the dark.',
      ambush: 'You strike while it is still lost in its grief.',
      spotted: 'The cold closes round you from behind. It found you first.',
    },
  },
];
