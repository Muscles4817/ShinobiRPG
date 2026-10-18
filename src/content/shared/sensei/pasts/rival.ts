import type { SenseiPast } from '../../../senseiParts';

/** The academy rival who lost to them once too often, and left the village to prove it. */
export const RIVAL: SenseiPast = {
  id: 'rival',
  wound:
    '{name} beat {lost} for the last jōnin place of their year. {lost} left the village that night.',
  temperaments: ['showboat', 'quiet-blade', 'chess-player', 'lazy-genius', 'iron-bell'],
  regions: ['hill-road', 'river-road', 'forest-track', 'coast-road'],
  nudge: { onMissions: 'watchful' },
  keepsakes: [
    'a tally carved on the inside of a bracer, every mark a bout',
    'a cracked practice sword with two names burned into it',
    'a folded challenge letter, never answered',
  ],
  foe: {
    epithet: 'who was never second',
    kind: 'Missing-nin',
    description:
      '{name}’s rival from the academy. Gone rogue to prove {foe.they} {foe.was} always the better one.',
    art: 'theirs',
    encounter: 'lone-rogue',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} watches you spar with a teammate and laughs out loud when you lose. “Sorry,” {them} says. “You looked like someone I used to fight every day.”',
      choices: [
        {
          label: 'Ask who',
          tone: 'curious',
          reply: '“My rival,” {them} says, as if that is a job title. “Everyone needs one.”',
        },
        {
          label: 'Demand a rematch with your teammate',
          tone: 'challenge',
          reply: '“Yes,” {them} says, delighted. “Exactly like that.”',
        },
        {
          label: 'Ask if {lost.they} ever won',
          tone: 'tease',
          reply: '“Half the time,” {them} says. “The other half, I said I let {lost.them}.”',
        },
      ],
    },
    {
      opener:
        '{them} shows you {keepsake}. “We kept score from the day we met,” {them} says. “It was the most important thing in either of our lives.”',
      choices: [
        {
          label: 'Ask who won in the end',
          tone: 'curious',
          reply: '{them} is quiet a moment. “I did,” {them} says. “That was the trouble.”',
        },
        {
          label: 'Say it sounds lonely',
          tone: 'kind',
          reply: '“It was the opposite,” {them} says. “That was what made it hard to lose.”',
        },
        {
          label: 'Say you’d have won',
          tone: 'joke',
          reply: '{them} laughs. “Everyone thinks that. {lost} thought that.”',
        },
      ],
    },
    {
      opener:
        '“The last jōnin place of our year came down to a bout,” {them} says. “{lost} and me. I won. That night {lost} took a headband, scratched a line through it, and walked out of the gate.”',
      choices: [
        {
          label: 'Ask if {them} blames {them.themself}',
          tone: 'earnest',
          reply:
            '“Every day,” {them} says. “And I would win again. That’s the part I can’t get past.”',
        },
        {
          label: 'Say {lost} chose to go',
          tone: 'kind',
          reply: '“{lost.they} did,” {them} says. “And I made the choice easy.”',
        },
        {
          label: 'Ask where {lost} went',
          tone: 'curious',
          reply:
            '“Wherever there was someone to beat,” {them} says. “For years. I kept the reports.”',
        },
      ],
    },
    {
      opener:
        '{them} unfolds a letter you have never seen {them} hold. “{lost} wrote,” {them} says. “The first time in all these years. A challenge, at {place}. One more bout.”',
      choices: [
        {
          label: '“Then you go, and we watch your back.”',
          tone: 'earnest',
          reply: '“I was going to ask,” {them} says. “I didn’t know how.”',
        },
        {
          label: '“It’s a trap.”',
          tone: 'challenge',
          reply: '“Probably,” {them} says. “It’s still {lost}. I still have to go.”',
        },
        {
          label: '“What happens if you win again?”',
          tone: 'quiet',
          reply:
            '{them} looks at the letter for a long time. “That’s what I’m afraid of,” {them} says.',
        },
      ],
    },
  ],
  arc: {
    title: 'One More Bout',
    summary: '{lost}, {name}’s old rival, has sent a challenge to {place}.',
    ledger: {
      found: 'Found {lost}’s practice clearing.',
      mercy: 'Told {name} to ask {lost} to come home.',
      leave: 'Told {name} to win first and decide after.',
      finish: 'Told {name} to finish it.',
      spared: 'Brought {lost} home after the last bout.',
      ended: '{lost} died in the last bout, and {name} left the score uncounted.',
    },
    find: {
      title: 'The Challenge at {place}',
      summary: '{name} wants to find where {lost} is waiting before the bout is fought.',
      act: 'Find where {lost} is waiting near {place}.',
      gate: '{name} is quieter than you have ever seen, and keeps touching the letter in a pocket.',
      road: 'The road to {place}. {name} tells you every bout with {lost}, from the first.',
      check:
        'Around {place} there are marks on trees and stones that only someone who kept score would make.',
      found:
        'A clearing worn flat by years of practice, a tally scratched into every tree around it.',
      lost: 'The marks run out. {name} finds the clearing anyway, because it is where they always fought as children.',
      camp: 'You camp a ridge away. {name} practises the old forms in the dark until late.',
      ending:
        '“Not yet,” {name} says, looking at the clearing. “When I fight {lost}, I want to be ready to lose.”',
      home: 'Back to the village, to make ready.',
    },
    settle: {
      title: 'The Last Tally',
      summary: 'Back to {place} for the bout {name} has waited years for.',
      act: 'Go back with {name} for the last bout with {lost}.',
      road: 'The road again. {name} laughs more than usual, the way people do before something hard.',
      question:
        '“If I win,” {name} says at the edge of the clearing, “what do I do with {lost}? Take {lost.them} home in chains? Let {lost.them} walk away again?”',
      mercy: {
        label: '“Ask {lost.them} to come home.”',
        reply: '{name} stares at you. “Nobody ever tried that,” {name} says slowly.',
      },
      leave: {
        label: '“Win first. Then you’ll know.”',
        reply: '“Spoken like a rival,” {name} says, and almost smiles.',
      },
      finish: {
        label: "“{lost.they}{lost.'s} a missing-nin. Finish it.”",
        reply: "“{lost.they}{lost.'s} {lost},” {name} says. “But you’re not wrong.”",
      },
      appears:
        '{lost} is waiting in the clearing, older and harder, a new mark freshly cut on the nearest tree. “You came,” {lost} says. “Good. I hate an empty tally.”',
      spared:
        '{lost} sits in the dirt, beaten, laughing. “Fine,” {lost} says. “Take me home. Someone has to keep the score honest.” {name} cries the whole way back, and pretends not to.',
      ended:
        '{lost} doesn’t get up. {name} cuts one last mark into the tree, and does not add up the score.',
      home: 'Home, with one name fewer on the tally.',
    },
  },
};
