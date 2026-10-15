import type { SenseiTestDef } from '../../senseiTests';

/** The tests a sensei may set a new team, for every pack. */
export const SENSEI_TESTS: readonly SenseiTestDef[] = [
  {
    id: 'bells',
    title: 'The bells',
    intro:
      '{sensei} ties two bells to their belt. “Take one by sundown, or go back to the academy. There are three of you. Think about that.”',
    rounds: [
      {
        prompt: '{sensei} stands in the clearing, reading, as if you weren’t there.',
        options: [
          {
            label: 'Charge in alone',
            approach: 'alone',
            result: 'You are on your back before you see them move. The bells don’t even ring.',
          },
          {
            label: 'Find {mate} and {mate2}',
            approach: 'together',
            result: '{mate} wants to go alone. {mate2} listens. Between you, a plan takes shape.',
          },
          {
            label: 'Watch from the trees',
            approach: 'patient',
            result: 'An hour of watching, and you see it: they always step left of the post.',
          },
        ],
      },
      {
        prompt: 'The sun is going down. One chance left.',
        options: [
          {
            label: 'Draw them off so the others can reach the bells',
            approach: 'together',
            result: 'You take the beating. {mate}’s hand closes on a bell.',
          },
          {
            label: 'Set a snare by the post',
            approach: 'cunning',
            result: 'The snare catches nothing, but it makes them step right. That was the point.',
          },
          {
            label: 'Go for the bells yourself',
            approach: 'alone',
            result: 'Your fingers brush a bell. It is not enough, but it is close.',
          },
        ],
      },
    ],
    close:
      '“Nobody took a bell,” {sensei} says. “But I learned what I needed to. You pass. Barely.”',
  },
  {
    id: 'survival',
    title: 'A night in the woods',
    intro:
      '{sensei} walks the team out past the last lantern. “You’re here till morning. No fire unless you make it. I’ll be watching.”',
    rounds: [
      {
        prompt: 'Dark comes quickly under the trees.',
        options: [
          {
            label: 'Split the work: water, wood, a shelter',
            approach: 'together',
            result: 'By full dark there is a fire, a lean-to and a pot of river water boiling.',
          },
          {
            label: 'Climb a tree and wait for morning',
            approach: 'patient',
            result: 'Cold and stiff, but you see everything that moves below.',
          },
          {
            label: 'Go and find something to eat',
            approach: 'alone',
            result:
              'You come back with a hare and scratches. {mate} looks impressed despite themself.',
          },
        ],
      },
      {
        prompt: 'Something is circling the camp. {sensei}, probably. Probably.',
        options: [
          {
            label: 'Lay false tracks away from the camp',
            approach: 'cunning',
            result: 'Whatever it was follows the tracks. You hear it curse softly, far off.',
          },
          {
            label: 'Keep watch in turns',
            approach: 'together',
            result: 'Nobody sleeps much, but nobody is caught asleep either.',
          },
          {
            label: 'Go out and face it',
            approach: 'alone',
            result: 'It is {sensei}. They seem pleased you came. They seem pleased you lost.',
          },
        ],
      },
    ],
    close: '“Morning,” {sensei} says, from right behind you. “You’re all alive. That’s a pass.”',
  },
  {
    id: 'spar',
    title: 'Show me',
    intro:
      '{sensei} rolls their shoulders. “Hit me. All three of you. Don’t hold back, you can’t hurt me.”',
    rounds: [
      {
        prompt: '{sensei} doesn’t even raise their hands.',
        options: [
          {
            label: 'Go straight at them',
            approach: 'alone',
            result: 'You hit air, then the ground. You get up. You go again.',
          },
          {
            label: 'Come at them from three sides with the others',
            approach: 'together',
            result: 'For a moment, just a moment, they have to move their feet.',
          },
          {
            label: 'Feint, and see what they do',
            approach: 'cunning',
            result: 'They see through it, but they smile while they do.',
          },
        ],
      },
      {
        prompt: 'You are all on the ground. {sensei} waits.',
        options: [
          {
            label: 'Get up first',
            approach: 'alone',
            result: 'You are up before the others. It hurts. You don’t show it.',
          },
          {
            label: 'Help {mate} up',
            approach: 'together',
            result: '{mate} takes your hand. {sensei} notices.',
          },
          {
            label: 'Stay down and catch your breath',
            approach: 'patient',
            result: 'When you rise, you are steadier than the others.',
          },
        ],
      },
    ],
    close: '“Again tomorrow,” {sensei} says. “And every day after. You’ll do.”',
  },
  {
    id: 'interview',
    title: 'Tell me about yourselves',
    intro:
      '{sensei} sits on the steps with the three of you. “Before anything else, I want to know who I’m teaching.”',
    rounds: [
      {
        prompt: '“What do you want to be?”',
        options: [
          {
            label: 'The strongest in the village',
            approach: 'alone',
            result: '{sensei} nods slowly. “Strong for what?” You don’t have an answer yet.',
          },
          {
            label: 'Someone the others can count on',
            approach: 'together',
            result: '{mate2} glances at you. Something in their face eases.',
          },
          {
            label: 'I want to understand things first',
            approach: 'patient',
            result: '“Good,” {sensei} says. “Most don’t.”',
          },
        ],
      },
      {
        prompt: '“What are you afraid of?”',
        options: [
          {
            label: 'Being left behind',
            approach: 'together',
            result: '{mate} says “me too” before they can stop themself.',
          },
          {
            label: 'Nothing',
            approach: 'alone',
            result: '{sensei} lets the lie sit there until you look away.',
          },
          {
            label: 'Ask what they are afraid of',
            approach: 'cunning',
            result: '{sensei} laughs, surprised. “Another time.”',
          },
        ],
      },
    ],
    close: '“That’ll do,” {sensei} says. “Tomorrow, we start.”',
  },
];
