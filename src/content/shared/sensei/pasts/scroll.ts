import type { SenseiPast } from '../../../senseiParts';

/** The night a forbidden scroll was stolen on their watch, and the thief who still has it. */
export const STOLEN_SCROLL: SenseiPast = {
  id: 'stolen-scroll',
  wound:
    'A forbidden scroll was stolen on {name}’s watch. {lost}, the vault keeper, took the blame and was sent away.',
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
        '{them} is reading in a corner of the archive, and closes the book a little too quickly when you come in. “Never surprise someone in a library,” {them} says. “Old rule. Mine.”',
      choices: [
        {
          label: 'Ask what {them} was reading',
          tone: 'curious',
          reply:
            '“A list of things that went missing,” {them} says. “It’s shorter than it should be.”',
        },
        {
          label: 'Apologise and make to leave',
          tone: 'kind',
          reply: '“No, stay,” {them} says. “I was being foolish. Sit.”',
        },
        {
          label: 'Tease {them} for jumping',
          tone: 'tease',
          reply: '“I have reason,” {them} says, and doesn’t say what.',
        },
      ],
    },
    {
      opener:
        '{them} turns {keepsake} over in {them.their} fingers. “I kept the most important thing in the village safe once,” {them} says. “For one night. Then I didn’t.”',
      choices: [
        {
          label: 'Ask what happened that night',
          tone: 'curious',
          reply:
            '“I looked away,” {them} says. “For as long as it takes to look away. That was enough.”',
        },
        {
          label: 'Say one mistake doesn’t make a shinobi',
          tone: 'kind',
          reply: '“No,” {them} says. “It makes someone else pay for it.”',
        },
        {
          label: 'Wait',
          tone: 'quiet',
          reply: '{them} doesn’t go on. But the next lesson, {them} teaches you how to keep watch.',
        },
      ],
    },
    {
      opener:
        '“The night the scroll was taken I was on the vault door,” {them} says. “A thief called {foe} walked past me in a borrowed face. {lost} kept the vault. The council needed someone to blame, and {lost} said it was {lost.their} fault, to spare me. {lost} was sent to the border. I let it happen.”',
      choices: [
        {
          label: 'Ask why {them} didn’t speak up',
          tone: 'challenge',
          reply:
            '“I was young,” {them} says. “And afraid. Those are reasons. They aren’t excuses.”',
        },
        {
          label: 'Ask where {lost} is now',
          tone: 'curious',
          reply:
            '“Still at the border,” {them} says. “Writes every winter. Never mentions it. That’s the worst part.”',
        },
        {
          label: 'Tell {them} {lost} chose to protect {them.them}',
          tone: 'kind',
          reply: '“Then I owe it to {lost} to be worth it,” {them} says.',
        },
      ],
    },
    {
      opener:
        '“A seal-broker at {place} is selling pages,” {them} says. “The script is from that scroll. I would know it anywhere. {foe} is there. If we bring the scroll home, {lost} can come home too.”',
      choices: [
        {
          label: '“Then let’s bring them both home.”',
          tone: 'earnest',
          reply: '“Both,” {them} says, like a promise. “Yes.”',
        },
        {
          label: '“A thief with forbidden seals. Careful.”',
          tone: 'quiet',
          reply: '“Yes,” {them} says. “This time I’ll be careful enough for all of us.”',
        },
        {
          label: '“You should tell the council the truth, too.”',
          tone: 'challenge',
          reply:
            '{them} is silent a long moment. “When we’re back,” {them} says. “I will. I promise.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The Missing Pages',
    summary:
      'Pages of a scroll stolen on {name}’s watch are being sold at {place}, and {foe} is selling them.',
    ledger: {
      found: 'Found the sealed warehouse where {foe} keeps the scroll.',
      mercy: 'Told {name} to take {foe} home to be sealed.',
      leave: 'Told {name} to take the scroll back first.',
      finish: 'Told {name} the secrets should die with {foe}.',
      spared: 'Took the scroll back, and brought {foe} home in seals.',
      ended: 'Took the scroll back, and {foe} died with its secrets.',
    },
    find: {
      title: 'Pages for Sale',
      summary: 'Find where {foe} keeps the stolen scroll near {place}.',
      act: 'Find where {foe} keeps the scroll near {place}.',
      gate: '{name} wears a plain coat and no headband. “We are buyers,” {name} says. “Look poor.”',
      road: 'The road to {place}. {name} makes you practise a borrowed face until you can hold it.',
      check:
        'At {place} a seal-broker sells strange pages from under the counter, and somebody pays the rent on a warehouse nobody uses.',
      found:
        'A warehouse with seals on every door, and a light in an upper window that never goes out.',
      lost: 'The broker sees through you. {name} has already followed the boy who runs the broker’s errands back to a sealed warehouse.',
      camp: 'You lodge in a rented room above a noodle shop. {name} sits at the window all night, watching the light.',
      ending:
        '“Those seals would kill us,” {name} says. “I need to read them first. We go home, I study, we come back.”',
      home: 'Back to the village, to study the seals.',
    },
    settle: {
      title: 'The Vault Keeper',
      summary: 'Back to {place} to take the scroll back from {foe}.',
      act: 'Go back with {name}, break the seals and take the scroll back.',
      road: 'The road again. {name} has drawn the warehouse seals from memory, and quizzes you on every one.',
      question:
        '“{foe} has read that scroll,” {name} says at the warehouse door. “Everything in it is in {foe}’s head now. We can take {foe} home for the village to deal with, or make sure the secrets go no further. Which?”',
      mercy: {
        label: '“Take {foe} home. The village can seal what {foe.they} know{foe.s}.”',
        reply:
          '“There are seals for that,” {name} says. “Cruel ones. But better than the other way.”',
      },
      leave: {
        label: '“The scroll first. Then {foe}.”',
        reply: '“The scroll first,” {name} agrees. “And {lost}.”',
      },
      finish: {
        label: '“The secrets die here.”',
        reply: '{name} nods once, and doesn’t meet your eyes.',
      },
      appears:
        'The seals on the door fall away like paper in water, and {foe} is standing behind them wearing {name}’s own face. “Hello, guard,” {foe} says. “Missed me?”',
      spared:
        '{foe} goes home bound in seals. The scroll goes back in the vault. That winter, for the first time, {lost} writes about coming home.',
      ended:
        '{foe} doesn’t get up. The scroll goes back in the vault, and {name} goes to the council the next morning and tells them the truth.',
      home: 'Home with the scroll.',
    },
  },
};
