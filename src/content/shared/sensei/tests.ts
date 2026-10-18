import type { SenseiTestDef } from '../../senseiTests';

/** The tests a sensei may set a new team, for every pack. */
export const SENSEI_TESTS: readonly SenseiTestDef[] = [
  {
    id: 'bells',
    title: 'The bells',
    memory: 'the bells',
    intro:
      '{sensei} ties two bells to {sensei.their} belt. “Take one by sundown, or go back to the academy. There are three of you and two bells, so think about that before you start.”',
    rounds: [
      {
        prompt: '{sensei} stands in the clearing, reading, as if you weren’t there.',
        options: [
          {
            label: 'Charge in alone',
            approach: 'alone',
            result:
              'You are on your back before you see {sensei.them} move, and the bells haven’t so much as rung.',
          },
          {
            label: 'Find {mate} and {mate2}',
            approach: 'together',
            result:
              '{mate} wants to go alone, but {mate2} listens, and between the three of you a plan starts to take shape.',
          },
          {
            label: 'Watch from the trees',
            approach: 'patient',
            result:
              'An hour of watching, and you see it: {sensei.they} always step{sensei.s} left of the post.',
          },
        ],
      },
      {
        prompt: 'The sun is going down, and you have one more chance before it sets.',
        options: [
          {
            label: 'Draw {sensei.them} off so the others can reach the bells',
            approach: 'together',
            result: 'You take the beating so that {mate}’s hand can close on a bell.',
          },
          {
            label: 'Set a snare by the post',
            approach: 'cunning',
            result:
              'The snare catches nothing, but it makes {sensei.them} step to the right, which was the whole idea.',
          },
          {
            label: 'Go for the bells yourself',
            approach: 'alone',
            result:
              'Your fingers brush a bell, close enough to hear it ring and not close enough to take it.',
          },
        ],
      },
    ],
    close:
      '“Nobody took a bell,” {sensei} says, “but I learned what I needed to about the three of you. You pass, if only just.”',
  },
  {
    id: 'survival',
    title: 'A night in the woods',
    memory: 'that first night in the woods',
    intro:
      '{sensei} walks the team out past the last lantern. “You’re here till morning. No fire unless you make it. I’ll be watching.”',
    rounds: [
      {
        prompt: 'Dark comes quickly under the trees, and the cold comes with it.',
        options: [
          {
            label: 'Split the work: water, wood, a shelter',
            approach: 'together',
            result: 'By full dark there is a fire, a lean-to and a pot of river water boiling.',
          },
          {
            label: 'Climb a tree and wait for morning',
            approach: 'patient',
            result:
              'You spend the night cold and stiff in the branches, but you see everything that moves below.',
          },
          {
            label: 'Go and find food',
            approach: 'alone',
            result:
              'You come back with a hare and scratches. {mate} looks impressed despite {mate.themself}.',
          },
        ],
      },
      {
        prompt: 'A shape is circling the camp, and you are almost sure it is {sensei}.',
        options: [
          {
            label: 'Lay false tracks away from the camp',
            approach: 'cunning',
            result: 'Whatever it was follows the tracks. You hear it curse softly, far off.',
          },
          {
            label: 'Keep watch in turns',
            approach: 'together',
            result: 'Nobody sleeps much, but then nobody is caught asleep either.',
          },
          {
            label: 'Go out and face it',
            approach: 'alone',
            result:
              'It is {sensei}, who seems pleased that you came out to face {sensei.them} and just as pleased to put you on the ground.',
          },
        ],
      },
    ],
    close:
      '“Morning,” {sensei} says, from right behind you. “You’re all still alive, and that counts as a pass.”',
  },
  {
    id: 'spar',
    title: 'Show me',
    memory: 'the first day, flat on our backs',
    intro:
      '{sensei} rolls {sensei.their} shoulders. “Hit me. All three of you. Don’t hold back, you can’t hurt me.”',
    rounds: [
      {
        prompt: '{sensei} doesn’t even raise {sensei.their} hands.',
        options: [
          {
            label: 'Go straight at {sensei.them}',
            approach: 'alone',
            result:
              'You hit air and then the ground, and you get up and go at {sensei.them} again.',
          },
          {
            label: 'Come at {sensei.them} from three sides with the others',
            approach: 'together',
            result:
              'For a moment, just a moment, {sensei.they} {sensei.has} to move {sensei.their} feet.',
          },
          {
            label: 'Feint, and see what {sensei.they} {sensei.does}',
            approach: 'cunning',
            result:
              '{sensei.they} see{sensei.s} through it, but {sensei.they} smile{sensei.s} while {sensei.they} {sensei.does}.',
          },
        ],
      },
      {
        prompt: 'You are all on the ground, and {sensei} waits to see who gets up first.',
        options: [
          {
            label: 'Get up first',
            approach: 'alone',
            result: 'You are up before the others. It hurts, and you don’t let it show.',
          },
          {
            label: 'Help {mate} up',
            approach: 'together',
            result: '{mate} takes your hand, and you see {sensei} notice.',
          },
          {
            label: 'Stay down and catch your breath',
            approach: 'patient',
            result: 'When you do get up, you are steadier on your feet than the others.',
          },
        ],
      },
    ],
    close: '“Again tomorrow,” {sensei} says, “and every day after that. You’ll do.”',
  },
  {
    id: 'interview',
    title: 'Tell me about yourselves',
    memory: 'the first day, when we had to say who we were',
    intro:
      '{sensei} sits on the steps with the three of you. “Before anything else, I want to know who I’m teaching.”',
    rounds: [
      {
        prompt: '“What do you want to be?”',
        options: [
          {
            label: 'The strongest in the village',
            approach: 'alone',
            result: '“Strong for what?” {sensei} asks, and you find you don’t have an answer yet.',
          },
          {
            label: 'Someone the others can count on',
            approach: 'together',
            result: '{mate2} glances at you. The worry goes out of {mate2.their} face.',
          },
          {
            label: 'I want to understand things first',
            approach: 'patient',
            result:
              '“Good,” {sensei} says. “Most people your age want to be something long before they understand anything.”',
          },
        ],
      },
      {
        prompt: '“What are you afraid of?”',
        options: [
          {
            label: 'Being left behind',
            approach: 'together',
            result: '{mate} says “me too” before {mate.they} can stop {mate.themself}.',
          },
          {
            label: 'Nothing',
            approach: 'alone',
            result: '{sensei} lets the lie sit there until you look away.',
          },
          {
            label: 'Ask what {sensei.they} {sensei.is} afraid of',
            approach: 'cunning',
            result: '{sensei} laughs, surprised. “Another time.”',
          },
        ],
      },
    ],
    close: '“That’ll do for today,” {sensei} says. “Tomorrow we start properly.”',
  },
];
