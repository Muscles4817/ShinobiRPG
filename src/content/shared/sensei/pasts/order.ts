import type { SenseiPast } from '../../../senseiParts';

/** An order they obeyed that turned out to be a lie, and the commander who gave it. */
export const WRONG_ORDER: SenseiPast = {
  id: 'wrong-order',
  wound:
    'On a commander’s word, {name} once took a life that should not have been taken. {lost} was innocent.',
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
      'The commander who gave {name} a false order years ago, for a bribe, and fled when the truth came out.',
    art: 'genjutsu',
    encounter: 'bandit-camp',
  },
  beats: [
    {
      opener:
        '{them} won’t let you follow an instruction without saying why. “Even mine,” {them} says. “Especially mine. Tell me why you’re doing it.”',
      choices: [
        {
          label: 'Explain your reasons',
          tone: 'earnest',
          reply: '{them} listens to all of it. “Good,” {them} says. “Never stop doing that.”',
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
            '“Because one day someone will give you an order that is wrong,” {them} says. “And you’ll need the habit.”',
        },
      ],
    },
    {
      opener:
        '{them} sits with {keepsake} in their lap and doesn’t open it, the way some people sit with a letter from the dead.',
      choices: [
        {
          label: 'Ask what it is',
          tone: 'curious',
          reply: '“An order,” {them} says. “Every word of it a lie. I believed it.”',
        },
        {
          label: 'Sit beside {them}',
          tone: 'quiet',
          reply: '{them} lets you, and after a while puts it away.',
        },
        {
          label: 'Ask if {them} wants to burn it',
          tone: 'kind',
          reply: '“Every day,” {them} says. “I keep it so I don’t forget what obeying feels like.”',
        },
      ],
    },
    {
      opener:
        '“My captain said {lost} was a spy,” {them} says. “The captain had the papers. Sealed. I didn’t ask. I did what I was told. Afterwards we found out the papers were bought, and the captain ran, rich. {lost} sold paper fans in the market. That’s all {lost} ever was.”',
      choices: [
        {
          label: 'Say the blame is the captain’s',
          tone: 'kind',
          reply: '“Some of it,” {them} says. “Not the part where I didn’t ask.”',
        },
        {
          label: 'Ask what happened to the captain',
          tone: 'curious',
          reply:
            '“The captain goes by {foe} now,” {them} says. “Rich, and hiding. I know roughly where.”',
        },
        {
          label: 'Admit you would have obeyed too',
          tone: 'earnest',
          reply: '“I know,” {them} says. “That’s why I make you say why.”',
        },
      ],
    },
    {
      opener:
        '“{foe} has turned up at {place},” {them} says. “Selling the same thing as before: false papers, false orders, to whoever pays. I am going to end it. And this time, I want you to tell me if I’m wrong.”',
      choices: [
        {
          label: '“I will.”',
          tone: 'earnest',
          reply: '“Promise me,” {them} says. And you do.',
        },
        {
          label: '“Is this an order?”',
          tone: 'tease',
          reply: '{them} laughs, startled. “No,” {them} says. “It’s a request. You can say no.”',
        },
        {
          label: '“Why do you trust me to judge?”',
          tone: 'curious',
          reply: '“Because you ask why,” {them} says. “I taught you that.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The False Order',
    summary: '{foe}, who once gave {name} a false order, is selling them again at {place}.',
    find: {
      title: 'Papers at {place}',
      summary: 'Find where {foe} is working from near {place}.',
      act: 'Find where {foe} sells false orders near {place}.',
      gate: '{name} hands each of you a blank order and says to write on it why you are going. Then checks you did.',
      road: 'The road to {place}. {name} makes you question every signpost.',
      check:
        'At {place}, men with too much money and too little reason ask the way to a house in the hills.',
      found: 'A walled house with a seal-press in the cellar and guards who were soldiers once.',
      lost: 'You follow the wrong man. {name} follows the ink: a merchant sells far too much sealing wax to one address.',
      camp: 'You camp out of sight. {name} sits with the old order in their lap all night.',
      ending:
        '“I want to be sure,” {name} says. “I was sure once without looking. I won’t be again. We come back.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Why',
      summary: 'Back to {place} to face {foe}.',
      act: 'Go back with {name} and face {foe}.',
      road: 'The road again. {name} asks each of you, one by one, what you think should happen.',
      question:
        '“Tell me if I’m wrong,” {name} says at the gate of {foe}’s house. “I could take {foe} home to answer for {lost}. Or I could be what {foe} made me, one last time.”',
      mercy: {
        label: '“Take {foe} home. Let {foe} answer.”',
        reply: '{name} looks at you for a long moment. “That’s why I asked,” {name} says.',
      },
      leave: {
        label: '“You don’t need my answer. You know it.”',
        reply: '“I wanted to hear it,” {name} says. “Thank you.”',
      },
      finish: {
        label: '“{foe} has ruined more lives than {lost}’s. End it.”',
        reply:
          '{name} is quiet a long moment. “Maybe you’re right,” {name} says. “That’s what frightens me.”',
      },
      appears:
        '{foe} meets you in the courtyard with a smile and a sealed paper held up like a shield. “I have an order here,” {foe} says, “that says you should all go home.”',
      spared:
        '{foe} goes home bound. At the trial, {name} speaks for {lost}, and for the first time {lost}’s name is cleared in the village records.',
      ended:
        '{foe} doesn’t get up. {name} burns the old order in the courtyard fire, at last, and watches it go.',
      home: 'Home, with one question finally answered.',
    },
  },
};
