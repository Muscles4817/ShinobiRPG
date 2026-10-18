import type { SenseiPast } from '../../../senseiParts';

/** The academy rival who lost to them once too often, and left the village to prove it. */
export const RIVAL: SenseiPast = {
  id: 'rival',
  wound:
    '{name} beat {lost} for the last jōnin place of their year, and {lost} left the village that same night.',
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
      '{name}’s rival from the academy, gone rogue to prove {foe.they} {foe.was} always the better of the two.',
    art: 'theirs',
    encounter: 'lone-rogue',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} watches you spar with a teammate and laughs out loud when you lose. “Sorry, sorry. You looked exactly like someone I used to fight every day.”',
      choices: [
        {
          label: 'Ask who',
          tone: 'curious',
          reply:
            '“My rival,” {them} says, as if it were a rank. “Everyone ought to have one, you know. It saves a lot of time on motivation.”',
        },
        {
          label: 'Demand a rematch with your teammate',
          tone: 'challenge',
          reply: '“Yes, just like that!” {them} says, delighted. “That’s the face exactly.”',
        },
        {
          label: 'Ask if {lost.they} ever won',
          tone: 'tease',
          reply: '“Half the time. The other half I told everyone I’d let {lost.them} win.”',
        },
      ],
    },
    {
      opener:
        '{them} shows you {keepsake}. “We kept score from the day we met. For years it was the most important thing in either of our lives, if you can believe that.”',
      choices: [
        {
          label: 'Ask who won in the end',
          tone: 'curious',
          reply: '“I did,” {them} says, after a pause. “And that turned out to be the trouble.”',
        },
        {
          label: 'Say it sounds lonely',
          tone: 'kind',
          reply:
            '“It was the opposite, really. I always had somebody, and that’s what made losing {lost.them} so hard.”',
        },
        {
          label: 'Say you’d have won',
          tone: 'joke',
          reply: '{them} laughs. “Everyone thinks that. {lost} thought that too.”',
        },
      ],
    },
    {
      opener:
        '“The last jōnin place of our year came down to a bout between {lost} and me,” {them} says, “and I won it. That night {lost} took a headband, scratched a line through it and walked out of the gate.”',
      choices: [
        {
          label: 'Ask if {them} blames {them.themself}',
          tone: 'earnest',
          reply:
            '“Every day. And I’d win again, if we fought it over. I can’t get past that part.”',
        },
        {
          label: 'Say {lost} chose to go',
          tone: 'kind',
          reply: '“{lost.they} did,” {them} says. “I just made the choice very easy.”',
        },
        {
          label: 'Ask where {lost} went',
          tone: 'curious',
          reply:
            '“Wherever there was somebody worth beating, for years. I kept every report that came in about {lost.them}.”',
        },
      ],
    },
    {
      opener:
        '{them} unfolds a letter you’ve never seen {them.them} hold before. “{lost} wrote, for the first time in all these years. It’s a challenge, at {place}. One more bout.”',
      choices: [
        {
          label: '“Then you go, and we watch your back.”',
          tone: 'earnest',
          reply: '“I was going to ask you that,” {them} says. “I couldn’t work out how.”',
        },
        {
          label: '“It’s a trap.”',
          tone: 'challenge',
          reply: '“Probably. It’s still {lost}, though, so I still have to go.”',
        },
        {
          label: '“What happens if you win again?”',
          tone: 'quiet',
          reply:
            '{them} reads the letter again before answering. “That’s what I’m afraid of, if you want the truth.”',
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
      gate: '{name} is quieter than you have ever seen {name.them}, and keeps touching the letter in a pocket.',
      road: 'On the road to {place}, {name} tells you about every bout with {lost}, starting from the first.',
      check:
        'Around {place} there are marks on trees and stones that only someone who kept score would make.',
      found:
        'A clearing worn flat by years of practice, with a tally scratched into every tree around it.',
      lost: 'The marks run out, but {name} finds the clearing anyway, because it’s where the two of them always fought as children.',
      camp: 'You camp a ridge away, and {name} practises the old forms in the dark until late.',
      ending:
        '“Not yet,” {name} says, looking down at the clearing. “When I fight {lost}, I want to be ready to lose to {lost.them}.”',
      home: 'Back to the village, to make ready.',
    },
    settle: {
      title: 'The Last Tally',
      summary: 'Back to {place} for the bout {name} has waited years for.',
      act: 'Go back with {name} for the last bout with {lost}.',
      road: 'On the road again {name} laughs more than usual, the way people do when there’s a hard day ahead.',
      question:
        '“If I win,” {name} says at the edge of the clearing, “what do I do with {lost}? Take {lost.them} home in chains? Let {lost.them} walk away again?”',
      mercy: {
        label: '“Ask {lost.them} to come home.”',
        reply: '{name} stares at you. “Nobody ever tried that,” {name} says slowly.',
      },
      leave: {
        label: '“Win first. Then you’ll know.”',
        reply: '“Spoken like a rival,” {name} says, sounding rather pleased with you.',
      },
      finish: {
        label: "“{lost.they}{lost.'s} a missing-nin. Finish it.”",
        reply: "“{lost.they}{lost.'s} {lost},” {name} says. “But I can’t say you’re wrong.”",
      },
      appears:
        '{lost}, older now and harder than you pictured, is waiting in the clearing beside a new mark freshly cut in the nearest tree. “You came. Good,” {lost} says. “I hate an empty tally.”',
      spared:
        '{lost} sits beaten in the dirt, laughing. “Fine, take me home. Somebody has to keep the score honest.” {name} cries the whole way back and pretends not to.',
      ended:
        '{lost} doesn’t get up. {name} cuts one last mark into the tree and leaves the score uncounted.',
      home: 'Home, with one name fewer on the tally.',
    },
  },
};
