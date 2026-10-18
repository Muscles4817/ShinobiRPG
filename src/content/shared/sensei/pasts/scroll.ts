import type { SenseiPast } from '../../../senseiParts';

/** The night a forbidden scroll was stolen on their watch, and the thief who still has it. */
export const STOLEN_SCROLL: SenseiPast = {
  id: 'stolen-scroll',
  wound:
    'A forbidden scroll was stolen on {name}’s watch, and {lost}, who kept the vault, took the blame for it and was sent away.',
  temperaments: ['chess-player', 'scholar', 'lazy-genius', 'old-soldier', 'mystic'],
  arts: ['fuuinjutsu', 'genjutsu', 'ninjutsu'],
  regions: ['river-road', 'coast-road', 'mountain-pass'],
  nudge: { grip: 'firm', onMissions: 'watchful' },
  keepsakes: [
    'the vault key, which opens nothing now',
    'a scrap of the stolen scroll’s wrapping',
    'a guard’s duty roster, one night circled in red',
  ],
  foe: {
    epithet: 'Silk-Hand',
    kind: 'Thief',
    description:
      'The thief who lifted a forbidden scroll from under {name}’s nose, and has been selling its secrets ever since.',
    art: 'fuuinjutsu',
    encounter: 'guarded-building',
  },
  beats: [
    {
      opener:
        '{them} is reading in a corner of the archive and shuts the book a little too quickly when you come in. “Never creep up on someone in a library. That’s an old rule of mine, and a good one.”',
      choices: [
        {
          label: 'Ask what {them} was reading',
          tone: 'curious',
          reply:
            '“A list of things that have gone missing from the vault over the years. It’s shorter than it ought to be.”',
        },
        {
          label: 'Apologise and make to leave',
          tone: 'kind',
          reply: '“No, stay, I was being foolish. Sit down.”',
        },
        {
          label: 'Tease {them} for jumping',
          tone: 'tease',
          reply: '“I have my reasons,” {them} says, and doesn’t tell you what they are.',
        },
      ],
    },
    {
      opener:
        '{them} turns {keepsake} over in {them.their} fingers. “I kept the most important thing in this village safe once, for exactly one night. And then I didn’t.”',
      choices: [
        {
          label: 'Ask what happened that night',
          tone: 'curious',
          reply:
            '“I looked away for about as long as it takes to look away,” {them} says, “and that was long enough.”',
        },
        {
          label: 'Say one mistake doesn’t make a shinobi',
          tone: 'kind',
          reply: '“No. It just makes somebody else pay for it, in my experience.”',
        },
        {
          label: 'Wait',
          tone: 'quiet',
          reply:
            '{them} doesn’t go on, but at the next lesson {them} spends the whole hour teaching you how to keep watch.',
        },
      ],
    },
    {
      opener:
        '“The night the scroll was taken I was on the vault door,” {them} says, “and a thief called {foe} walked right past me in a borrowed face. {lost} kept the vault. The council needed someone to blame, and {lost} said it was {lost.their} fault to spare me, and was sent to the border for it. I let that happen.”',
      choices: [
        {
          label: 'Ask why {them} didn’t speak up',
          tone: 'challenge',
          reply:
            '“I was young and I was afraid. Those are reasons, I suppose, but I’ve never let myself call them excuses.”',
        },
        {
          label: 'Ask where {lost} is now',
          tone: 'curious',
          reply:
            '“Still at the border. {lost} writes every winter and never once mentions it, which is worse than if {lost.they} did.”',
        },
        {
          label: 'Tell {them} {lost} chose to protect {them.them}',
          tone: 'kind',
          reply: '“Then I owe it to {lost} to have been worth protecting,” {them} says.',
        },
      ],
    },
    {
      opener:
        '“A seal-broker at {place} is selling pages,” {them} says, “in the script from that scroll. I’d know it anywhere. {foe} is there, and if we bring the scroll home, {lost} can come home too.”',
      choices: [
        {
          label: '“Then let’s bring them both home.”',
          tone: 'earnest',
          reply: '“Both of them,” {them} says, as if it were a promise. “Yes.”',
        },
        {
          label: '“A thief with forbidden seals. Careful.”',
          tone: 'quiet',
          reply: '“I know. This time I’ll be careful enough for all of us.”',
        },
        {
          label: '“You should tell the council the truth, too.”',
          tone: 'challenge',
          reply:
            '{them} doesn’t answer straight away. “When we’re back, I will. I promise you that.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The Missing Pages',
    summary:
      'Pages of a scroll stolen on {name}’s watch are being sold at {place}, and {foe} is selling them.',
    find: {
      title: 'Pages for Sale',
      summary: 'Find where {foe} keeps the stolen scroll near {place}.',
      act: 'Find where {foe} keeps the scroll near {place}.',
      gate: '{name} wears a plain coat and no headband. “We’re buyers, today. Try to look poor.”',
      road: 'On the road to {place}, {name} makes you practise a borrowed face until you can hold it for a mile.',
      check:
        'At {place} a seal-broker sells strange pages from under the counter, and somebody pays the rent on a warehouse nobody uses.',
      found:
        'A warehouse with seals on every door, and a lamp in an upper window that never goes out.',
      lost: 'The broker sees through you, but by then {name} has followed the boy who runs the broker’s errands back to a sealed warehouse.',
      camp: 'You lodge in a rented room above a noodle shop, and {name} sits at the window all night watching the lamp.',
      ending:
        '“Those seals would kill us,” {name} says. “I need to read them properly first, so we go home and I study them, and then we come back.”',
      home: 'Back to the village, to study the seals.',
    },
    settle: {
      title: 'The Vault Keeper',
      summary: 'Back to {place} to take the scroll back from {foe}.',
      act: 'Go back with {name}, break the seals and take the scroll back.',
      road: 'On the road again {name} has drawn the warehouse seals from memory, and quizzes you on every one of them.',
      question:
        '“{foe} has read that scroll,” {name} says at the warehouse door. “Everything in it is in {foe}’s head now. We can take {foe} home for the village to deal with, or make sure the secrets go no further. Which?”',
      mercy: {
        label: '“Take {foe} home. The village can seal what {foe.they} know{foe.s}.”',
        reply:
          '“There are seals for that,” {name} says. “Cruel ones, but better than the other way.”',
      },
      leave: {
        label: '“The scroll first. Then {foe}.”',
        reply: '“The scroll first,” {name} agrees, “and then {lost}.”',
      },
      finish: {
        label: '“The secrets die here.”',
        reply: '{name} agrees with you without once looking you in the eye.',
      },
      appears:
        'The seals on the door fall away like paper in water, and {foe} is standing behind them wearing {name}’s own face. “Hello, guard,” {foe} says. “Did you miss me?”',
      spared:
        '{foe} goes home bound in seals, and the scroll goes back in the vault. That winter, for the first time, {lost} writes about coming home.',
      ended:
        '{foe} doesn’t get up. The scroll goes back in the vault, and the next morning {name} goes to the council and tells them the truth.',
      home: 'Home with the scroll.',
    },
  },
};
