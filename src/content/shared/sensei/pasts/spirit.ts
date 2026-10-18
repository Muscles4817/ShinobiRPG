import type { SenseiPast } from '../../../senseiParts';

/** A bargain made as a child with something in the reeds, and the price still owed. */
export const SPIRIT_BARGAIN: SenseiPast = {
  id: 'spirit-bargain',
  wound:
    'As a child, {name} bargained with a thing in the reeds to save {lost} from a fever, and it has been asking to be paid ever since.',
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
      'An old spirit of still water that saved {lost} once, for a price {name} has not finished paying.',
    art: 'genjutsu',
    encounter: 'spirit',
    nameless: true,
  },
  beats: [
    {
      opener:
        '{them} won’t walk past still water without dropping a coin or a grain of rice into it. “Manners,” {them} says when you ask. “Having manners never hurt anybody.”',
      choices: [
        {
          label: 'Drop a coin in too',
          tone: 'kind',
          reply:
            '{them} looks surprised, and then very pleased. “Good. It’ll remember you kindly for that.”',
        },
        {
          label: 'Laugh at the superstition',
          tone: 'tease',
          reply:
            '“Go on, laugh. It doesn’t mind being laughed at, as far as I know. It minds being forgotten.”',
        },
        {
          label: 'Ask who the manners are for',
          tone: 'curious',
          reply: '{them} watches the water a moment too long. “For the neighbours, let’s say.”',
        },
      ],
    },
    {
      opener:
        'At dusk {them} hums three notes with {keepsake} in {them.their} hand, and every frog on the riverbank goes quiet at once. {them} puts it away quickly.',
      choices: [
        {
          label: 'Ask what the tune was',
          tone: 'curious',
          reply: '“A promise, set to music, so I can’t forget how the words go.”',
        },
        {
          label: 'Say it was beautiful',
          tone: 'praise',
          reply: '“It isn’t mine to be proud of,” {them} says. “But thank you.”',
        },
        {
          label: 'Stay close until the frogs start again',
          tone: 'quiet',
          reply:
            'They start again after a while, and when {them} lets out a breath you realise {them} was afraid.',
        },
      ],
    },
    {
      opener:
        '“{lost} had a fever when we were small,” {them} says, “and the healers gave up. I went down to the reeds at night, where we’d been told never to go, and asked for help, and a voice answered me. {lost} lived. It said I’d pay a little every year for as long as I lived, and I have.”',
      choices: [
        {
          label: 'Ask what it takes',
          tone: 'curious',
          reply:
            '“Memories. Small ones, a birthday, a face. I keep a diary so I know which ones are gone.”',
        },
        {
          label: 'Say you would have done the same',
          tone: 'kind',
          reply: '“I know you would,” {them} says. “That’s what frightens me about you.”',
        },
        {
          label: 'Ask if it can be stopped',
          tone: 'earnest',
          reply:
            '“I’ve been trying to find out since I was small, and I think I finally know how.”',
        },
      ],
    },
    {
      opener:
        '“It has moved to {place},” {them} says, holding {keepsake}. “Spirits do, when the water changes, and away from home it’s weaker. If I’m ever going to end the bargain, it has to be now, and I need people who’ll remember for me if it takes too much.”',
      choices: [
        {
          label: '“I’ll remember everything.”',
          tone: 'earnest',
          reply: '{them} grips your hand. “Then I can’t lose, can I? Not with you keeping count.”',
        },
        {
          label: '“What if it takes {lost} back?”',
          tone: 'quiet',
          reply: '“{lost} asked me the same thing, and then told me to go anyway.”',
        },
        {
          label: '“Teach me the tune, just in case.”',
          tone: 'curious',
          reply:
            '{them} teaches you the three notes, and they feel colder in your mouth than any sound should.',
        },
      ],
    },
  ],
  arc: {
    title: 'The Bargain',
    summary:
      'The spirit {name} bargained with as a child has moved to {place}, where it is weaker.',
    ledger: {
      found: 'Found the spirit’s pool under the willows.',
      mercy: 'Told {name} to let the spirit go home.',
      leave: 'Left the bargain to {name}.',
      finish: 'Told {name} to unmake the spirit.',
      spared: 'Broke the bargain, and let the spirit sink home.',
      ended: 'Saw the spirit unmade in the reeds.',
    },
    find: {
      title: 'Still Water at {place}',
      summary: 'Find where the spirit has made its new home near {place}.',
      act: 'Find where the spirit sleeps near {place}.',
      gate: '{name} has written the whole team’s names in the diary, “so I don’t lose you,” {name.they} say{name.s}.',
      road: 'On the road to {place}, {name} drops a coin into every pond you pass.',
      check:
        'At {place}, the fish have gone from one stretch of water, and nobody fishes there any more.',
      found: 'A still black pool under willows, too quiet, where the reeds lean toward you.',
      lost: 'You find nothing, until {name} hums the three notes and the frogs fall silent over one pool only.',
      camp: 'You camp far from the water, and {name} writes in the diary until the candle burns out.',
      ending:
        '“Not at the new moon,” {name} says. “It’s too strong in the dark. We come back when the moon is full.”',
      home: 'Back to the village to wait for the moon.',
    },
    settle: {
      title: 'Full Moon at {place}',
      summary: 'Back to {place} under the full moon, to end the bargain.',
      act: 'Go back with {name} under the full moon and end the bargain.',
      road: 'On the road again, under a fat white moon, {name} reads you the diary aloud so that somebody else will know it.',
      question:
        '“I can break the bargain and let it go back to the deep water,” {name} says at the pool. “Or I can unmake it, so it never bargains with a frightened child again. Which?”',
      mercy: {
        label: '“Let it go home. It did save {lost}.”',
        reply:
          '“It did,” {name} says softly. “I always forget that part, and it never lets me forget the rest.”',
      },
      leave: {
        label: '“It’s your bargain. Your choice.”',
        reply: '“My bargain, yes. Then I’ll choose like a grown-up for once.”',
      },
      finish: {
        label: '“Unmake it. No more frightened children.”',
        reply: '“No more of them,” {name} agrees, slowly.',
      },
      appears:
        'The pool goes flat as glass, and up out of it rises a shape that is mostly reeds and partly a face you almost remember. “Little one,” it says to {name}. “You are late with this year’s payment.”',
      spared:
        'The bargain breaks like ice in spring, and the thing sinks back into the deep water with a sound like a breath let go. When {name} opens the diary, the old pages are remembered again.',
      ended:
        'The thing in the reeds comes apart into water and weed and is gone. {name} sits by the pool till dawn, remembering things {name} thought were lost.',
      home: 'Home under the full moon, every name in the diary still remembered.',
    },
  },
};
