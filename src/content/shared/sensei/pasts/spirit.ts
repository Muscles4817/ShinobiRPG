import type { SenseiPast } from '../../../senseiParts';

/** A bargain made as a child with something in the reeds, and the price still owed. */
export const SPIRIT_BARGAIN: SenseiPast = {
  id: 'spirit-bargain',
  wound:
    'As a child, {name} bargained with something in the reeds to save {lost} from a fever. It has never stopped asking to be paid.',
  temperaments: ['mystic', 'lazy-genius', 'scholar', 'cook', 'big-sibling'],
  arts: ['genjutsu', 'fuuinjutsu', 'ninjutsu'],
  regions: ['river-road', 'forest-track', 'coast-road'],
  nudge: { grip: 'firm', onMissions: 'shield' },
  keepsakes: [
    'a reed flute that is always cold',
    'a paper charm, renewed every full moon',
    'a smooth river stone that hums when held',
  ],
  foe: {
    epithet: 'the Thing in the Reeds',
    kind: 'Spirit',
    description:
      'Something old that lives where the water is still. It saved {lost} once, for a price {name} has not finished paying.',
    art: 'genjutsu',
    encounter: 'spirit',
    nameless: true,
  },
  beats: [
    {
      opener:
        '{them} won’t walk past still water without dropping a coin or a grain of rice into it. “Manners,” {them} says, when you ask. “It never hurts to have manners.”',
      choices: [
        {
          label: 'Drop something in too',
          tone: 'kind',
          reply:
            '{them} looks surprised, and then very pleased. “Good,” {them} says. “It will remember you kindly.”',
        },
        {
          label: 'Laugh at the superstition',
          tone: 'tease',
          reply: '“Laugh,” {them} says. “It doesn’t mind laughter. It minds forgetting.”',
        },
        {
          label: 'Ask who the manners are for',
          tone: 'curious',
          reply: '{them} looks at the water a moment too long. “For the neighbours,” {them} says.',
        },
      ],
    },
    {
      opener:
        '{them} plays a few notes on {keepsake} at dusk, and every frog on the riverbank goes silent at once. {them} puts it away quickly.',
      choices: [
        {
          label: 'Ask what the tune was',
          tone: 'curious',
          reply: '“A promise,” {them} says. “Set to music, so I can’t forget the words.”',
        },
        {
          label: 'Say it was beautiful',
          tone: 'praise',
          reply: '“It isn’t mine,” {them} says. “But thank you.”',
        },
        {
          label: 'Stay close until the frogs start again',
          tone: 'quiet',
          reply: 'They do, after a while. {them} breathes out, and you realise {them} was afraid.',
        },
      ],
    },
    {
      opener:
        '“{lost} had a fever when we were small,” {them} says. “The healers gave up. I went down to the reeds at night, where we were told never to go, and asked for help. Something answered. {lost} lived. It said I would pay a little every year, for as long as I lived, and I have.”',
      choices: [
        {
          label: 'Ask what it takes',
          tone: 'curious',
          reply:
            '“Memories,” {them} says. “Small ones. A birthday. A face. I keep a diary so I know what’s gone.”',
        },
        {
          label: 'Say you would have done the same',
          tone: 'kind',
          reply: '“I know,” {them} says. “That’s what frightens me about you.”',
        },
        {
          label: 'Ask if it can be stopped',
          tone: 'earnest',
          reply:
            '“I have been trying to find out since I was small,” {them} says. “I think I finally know how.”',
        },
      ],
    },
    {
      opener:
        '“It has moved to {place},” {them} says, holding {keepsake}. “Spirits do, when the water changes. Away from its home it is weaker. If I am ever going to end the bargain, it is now. I need people who will remember for me, if it takes too much.”',
      choices: [
        {
          label: '“I’ll remember everything.”',
          tone: 'earnest',
          reply: '{them} grips your hand. “Then I can’t lose,” {them} says.',
        },
        {
          label: '“What if it takes {lost} back?”',
          tone: 'quiet',
          reply: '“{lost} said the same,” {them} says. “{lost} said to go anyway.”',
        },
        {
          label: '“Teach me the tune, just in case.”',
          tone: 'curious',
          reply:
            '{them} teaches you the three notes. They are colder than they should be in your mouth.',
        },
      ],
    },
  ],
  arc: {
    title: 'The Bargain',
    summary:
      'The spirit {name} bargained with as a child has moved to {place}, where it is weaker.',
    find: {
      title: 'Still Water at {place}',
      summary: 'Find where the spirit has made its new home near {place}.',
      act: 'Find where the spirit sleeps near {place}.',
      gate: '{name} has written the whole team’s names in the diary, “so I don’t lose you,” {name} says.',
      road: 'The road to {place}. {name} drops a coin into every pond you pass.',
      check:
        'At {place}, the fish have gone from one stretch of water, and nobody fishes there any more.',
      found: 'A still black pool under willows, too quiet, where the reeds lean toward you.',
      lost: 'You find nothing. Then {name} plays the three notes, and the frogs fall silent over one pool only.',
      camp: 'You camp far from the water. {name} writes in the diary until the candle dies.',
      ending:
        '“Not at the new moon,” {name} says. “It is too strong in the dark. We come back when the moon is full.”',
      home: 'Back to the village to wait for the moon.',
    },
    settle: {
      title: 'Full Moon at {place}',
      summary: 'Back to {place} under the full moon, to end the bargain.',
      act: 'Go back with {name} under the full moon and end the bargain.',
      road: 'The road again, the moon fat and white. {name} reads the diary aloud to you, so someone else will know it.',
      question:
        '“I can break the bargain and let it go back to the deep water,” {name} says at the pool. “Or I can unmake it, so it never bargains with a frightened child again. Which?”',
      mercy: {
        label: '“Let it go home. It did save {lost}.”',
        reply: '“It did,” {name} says softly. “I always forget that part. It never lets me.”',
      },
      leave: {
        label: '“It’s your bargain. Your choice.”',
        reply: '“My bargain,” {name} says. “Yes. Then I’ll choose like a grown-up, finally.”',
      },
      finish: {
        label: '“Unmake it. No more frightened children.”',
        reply: '{name} nods slowly. “No more,” {name} says.',
      },
      appears:
        'The pool goes flat as glass, and something rises out of it that is mostly reeds and partly a face you almost remember. “Little one,” it says to {name}. “You are late with this year’s payment.”',
      spared:
        'The bargain breaks like ice in spring. The thing sinks back into the deep water with a sound like a sigh. {name} opens the diary, and finds the old pages are remembered again.',
      ended:
        'The thing in the reeds comes apart into water and weed and is gone. {name} sits by the pool till dawn, remembering things {name} thought were lost.',
      home: 'Home in the moonlight, every name in the diary still remembered.',
    },
  },
};
