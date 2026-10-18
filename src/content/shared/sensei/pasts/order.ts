import type { SenseiPast } from '../../../senseiParts';

/** An order they obeyed that turned out to be a lie, and the commander who gave it. */
export const WRONG_ORDER: SenseiPast = {
  id: 'wrong-order',
  wound:
    'On a commander’s word, {name} once took a life that should never have been taken, because {lost} was innocent.',
  temperaments: ['quiet-blade', 'old-soldier', 'chess-player', 'mystic', 'scholar'],
  regions: ['mountain-pass', 'forest-track', 'coast-road'],
  nudge: { onMissions: 'lets-fail' },
  keepsakes: [
    'a sealed order, never opened again',
    'a carved fox charm that belonged to {lost}',
    'a commander’s insignia, defaced',
  ],
  foe: {
    epithet: 'the Captain',
    kind: 'Deserter',
    description:
      'The commander who sold {name} a false order years ago, for a bribe, and ran when the truth came out.',
    art: 'genjutsu',
    encounter: 'bandit-camp',
  },
  beats: [
    {
      opener:
        '{them} won’t let you follow an instruction without saying why. “Even one of mine. Especially one of mine. Go on, tell me why you’re doing it.”',
      choices: [
        {
          label: 'Explain your reasons',
          tone: 'earnest',
          reply:
            '{them} listens to all of it, and asks about one part, and then tells you never to stop doing that.',
        },
        {
          label: 'Say “because you told me to”',
          tone: 'tease',
          reply:
            '“That,” {them} says, not smiling at all, “is the most dangerous sentence a shinobi can say.”',
        },
        {
          label: 'Ask why it matters so much',
          tone: 'curious',
          reply:
            '“Because one day somebody will give you an order that’s wrong, and you’ll need the habit by then. You won’t have time to learn it.”',
        },
      ],
    },
    {
      opener:
        '{them} sits with {keepsake} in {them.their} lap and doesn’t touch it, the way some people sit with a letter from the dead.',
      choices: [
        {
          label: 'Ask what it is',
          tone: 'curious',
          reply:
            '“It’s what I kept from an order I was given once. Every word of that order was a lie, and I believed all of it.”',
        },
        {
          label: 'Sit beside {them}',
          tone: 'quiet',
          reply: '{them} lets you, and after a while puts it away.',
        },
        {
          label: 'Ask if {them} wants to burn it',
          tone: 'kind',
          reply: '“Most days, yes. I keep it so I don’t forget what it felt like to just obey.”',
        },
      ],
    },
    {
      opener:
        '“My captain said {lost} was a spy,” {them} says. “The captain had sealed papers and I didn’t ask, I did what I was told. Afterwards we found out the papers had been bought, and the captain ran off rich. {lost} sold paper fans in the market, and that was all {lost} ever was.”',
      choices: [
        {
          label: 'Say the blame is the captain’s',
          tone: 'kind',
          reply: '“Some of it is. Not the part where I didn’t ask, though. That part’s mine.”',
        },
        {
          label: 'Ask what happened to the captain',
          tone: 'curious',
          reply: '“The captain goes by {foe} now. Rich and in hiding, and I know roughly where.”',
        },
        {
          label: 'Admit you would have obeyed too',
          tone: 'earnest',
          reply: '“I know you would,” {them} says. “That’s why I make you tell me why.”',
        },
      ],
    },
    {
      opener:
        '“{foe} has turned up at {place},” {them} says, “selling the same false papers and false orders as before to whoever pays. I’m going to end it. And this time I want you to tell me if I’m wrong.”',
      choices: [
        {
          label: '“I will.”',
          tone: 'earnest',
          reply: '{them} makes you promise it out loud, and you do.',
        },
        {
          label: '“Is this an order?”',
          tone: 'tease',
          reply: '{them} laughs, startled. “No, it’s a request. You’re allowed to say no to it.”',
        },
        {
          label: '“Why do you trust me to judge?”',
          tone: 'curious',
          reply: '“Because you ask why. I should know, I’m the one who taught you to.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The False Order',
    summary: '{foe}, who once gave {name} a false order, is selling them again at {place}.',
    ledger: {
      found: 'Found {foe}’s house and the seal-press in its cellar.',
      mercy: 'Told {name} to take {foe} home to answer.',
      leave: 'Told {name} {name.they} already knew the answer.',
      finish: 'Told {name} to end it.',
      spared: 'Brought {foe} home to trial, and cleared {lost}’s name.',
      ended: '{foe} died, and {name} burned the old order at last.',
    },
    find: {
      title: 'Papers at {place}',
      summary: 'Find where {foe} is working from near {place}.',
      act: 'Find where {foe} sells false orders near {place}.',
      gate: '{name} hands each of you a blank order to write down why you are going, and then checks that you did.',
      road: 'On the road to {place}, {name} makes you question every signpost you pass.',
      check:
        'At {place}, men with too much money and too little reason ask the way to a house in the hills.',
      found: 'A walled house with a seal-press in the cellar, and guards who used to be soldiers.',
      lost: 'You follow the wrong man. {name} follows the ink instead, to a merchant selling far too much sealing wax to one address.',
      camp: 'You camp out of sight, and {name} sits up all night with the old order in {name.their} lap.',
      ending:
        '“I want to be sure,” {name} says. “I was sure once without looking, and I won’t do that again. We come back.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Why',
      summary: 'Back to {place} to face {foe}.',
      act: 'Go back with {name} and face {foe}.',
      road: 'On the road again, {name} asks each of you in turn what you think should happen.',
      question:
        '“Tell me if I’m wrong,” {name} says at the gate of {foe}’s house. “I could take {foe} home to answer for {lost}, or I could be what {foe} made me, one last time.”',
      mercy: {
        label: '“Take {foe} home. Let {foe} answer.”',
        reply: '“That’s why I asked you,” {name} says, after looking at you for some time.',
      },
      leave: {
        label: '“You don’t need my answer. You know it.”',
        reply: '“I wanted to hear it said, all the same. Thank you.”',
      },
      finish: {
        label: '“{foe} has ruined more lives than {lost}’s. End it.”',
        reply:
          '{name} is quiet for a while. “You might be right, and I don’t like how easily I agree with you.”',
      },
      appears:
        '{foe} meets you in the courtyard with a smile and a sealed paper held up like a shield. “I have an order here,” {foe} says, “that says you should all go home.”',
      spared:
        '{foe} goes home bound. At the trial {name} speaks for {lost}, and {lost}’s name is cleared in the village records at last.',
      ended:
        '{foe} doesn’t get up. {name} burns the old order in the courtyard fire, after all these years, and watches until it’s ash.',
      home: 'Home, with one question finally answered.',
    },
  },
};
