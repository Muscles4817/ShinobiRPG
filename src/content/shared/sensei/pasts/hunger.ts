import type { SenseiPast } from '../../../senseiParts';

/** A famine year, a stolen sack of rice, and the hoarder who let a village starve. */
export const HUNGRY_YEAR: SenseiPast = {
  id: 'hungry-year',
  wound:
    'In the hungry year, {name} and {lost} stole rice from a hoarder’s storehouse to keep their street alive. {lost} was caught.',
  temperaments: ['cook', 'old-soldier', 'big-sibling', 'showboat', 'lazy-genius'],
  regions: ['river-road', 'hill-road', 'dune-road'],
  nudge: { grip: 'loose' },
  keepsakes: [
    'a rice sack with a merchant’s crest cut out of it',
    'a wooden bowl, always scrubbed clean',
    'a coin with a hole bored through it, on a string',
  ],
  foe: {
    epithet: 'the Granary Dog',
    kind: 'Enforcer',
    description:
      'The hoarder’s hired blade from the hungry year, who caught {lost}. Still guards the same storehouses, for the same family.',
    art: 'taijutsu',
    encounter: 'guarded-building',
  },
  beats: [
    {
      opener:
        '{them} watches you leave half a bowl of rice and goes very still. Then {them} eats it, every grain, without a word.',
      choices: [
        {
          label: 'Apologise',
          tone: 'earnest',
          reply:
            '“Don’t apologise,” {them} says. “Just don’t do it again. I’ll tell you why one day.”',
        },
        {
          label: 'Joke that {them} must be hungry',
          tone: 'joke',
          reply: '“Always,” {them} says, and laughs, but it takes a moment.',
        },
        {
          label: 'Ask why that mattered',
          tone: 'curious',
          reply: '“Some people never had any to leave,” {them} says. “Leave it there.”',
        },
      ],
    },
    {
      opener:
        '{them} shows you {keepsake}. “The street I grew up on ate for a whole winter on what was in this,” {them} says. “It wasn’t ours.”',
      choices: [
        {
          label: 'Ask whose it was',
          tone: 'curious',
          reply:
            '“A rice merchant waiting for the price to go up,” {them} says. “People died while the merchant waited.”',
        },
        {
          label: 'Say it sounds like it was the right thing',
          tone: 'praise',
          reply: '“It was the only thing,” {them} says. “That isn’t the same.”',
        },
        {
          label: 'Ask if {them} was caught',
          tone: 'earnest',
          reply: '{them} shakes their head slowly. “Not me,” {them} says.',
        },
      ],
    },
    {
      opener:
        '“{lost} and I went in every night for a week,” {them} says. “The last night, the merchant’s guard was waiting. A big quiet guard they called {foe}. I got over the wall. {lost} didn’t. They put {lost} to work in the mines. I joined the academy the next spring so I would never be that helpless again.”',
      choices: [
        {
          label: 'Ask if {lost} ever came back',
          tone: 'curious',
          reply:
            '“Once,” {them} says. “Thin as a rake, laughing. And then the cough took {lost} that winter.”',
        },
        {
          label: 'Tell {them} {lost} would be proud',
          tone: 'kind',
          reply: '“{lost} would laugh at the headband,” {them} says. “And then steal my lunch.”',
        },
        {
          label: 'Sit with {them} and say nothing',
          tone: 'quiet',
          reply: '{them} talks for a long time about {lost}, and only the good things.',
        },
      ],
    },
    {
      opener:
        '“There’s a famine coming at {place},” {them} says. “And the same family is buying up the rice. Same storehouses. Same guard. {foe} is still there. I want to open the storehouse this time. With a mission order.”',
      choices: [
        {
          label: '“Let’s feed {place}.”',
          tone: 'earnest',
          reply:
            '“That’s the job,” {them} says. “Everything else is just what happens on the way.”',
        },
        {
          label: '“And {foe}?”',
          tone: 'challenge',
          reply: '“We’ll see,” {them} says. “I’d like to know if {foe} remembers {lost}.”',
        },
        {
          label: '“I’ll bring a bigger bowl.”',
          tone: 'joke',
          reply: '{them} laughs properly for the first time today. “Bring two,” {them} says.',
        },
      ],
    },
  ],
  arc: {
    title: 'The Hungry Year',
    summary: 'The family that hoarded rice in {name}’s hungry year is doing it again at {place}.',
    find: {
      title: 'Rice at {place}',
      summary: 'Find the storehouses where the rice is being held near {place}.',
      act: 'Find the hoarded rice near {place}.',
      gate: '{name} has packed rice for the road, and twice as much as you need. “For whoever we meet,” {name} says.',
      road: 'The road to {place}. The fields are dry, and the children by the road are thin.',
      check:
        'Around {place} carts go in loaded and come out empty, always at night, always the same road.',
      found: 'Storehouses behind a high wall, rice dust in the air, and a guard who never sleeps.',
      lost: 'You lose the carts. {name} doesn’t: “Follow the rats,” {name} says. “They always know where the rice is.”',
      camp: 'You camp by the road. {name} gives away most of the team’s food to the first family that passes.',
      ending:
        '“We need the mission order sealed,” {name} says. “Then we come back and open it for everyone to see.”',
      home: 'Back to the village for the order.',
    },
    settle: {
      title: 'The Storehouse Door',
      summary: 'Back to {place} with a sealed order to open the storehouses.',
      act: 'Go back with {name} and open the storehouses.',
      road: 'The road again, and {name} cooks for every hungry face on it.',
      question:
        '“{foe} will be at the door,” {name} says. “The same as in the hungry year. I could break {foe} the way {foe} broke {lost}. Or not. What do I do?”',
      mercy: {
        label: '“Let {foe} watch the rice go to the people.”',
        reply: '{name} smiles slowly. “Yes,” {name} says. “Let {foe} watch.”',
      },
      leave: {
        label: '“Open the door. That’s what matters.”',
        reply: '“The door,” {name} says. “Yes. The door is what matters.”',
      },
      finish: {
        label: '“For {lost}.”',
        reply: '{name} closes their eyes. “For {lost},” {name} says, very quietly.',
      },
      appears:
        '{foe} is at the storehouse door, older, bigger, as quiet as ever. {foe} looks at {name} and something moves behind the eyes. “The other one,” {foe} says. “I remember.”',
      spared:
        '{foe} sits against the wall and watches the storehouse doors open and the people of {place} come for the rice. {name} hands {foe} a bowl. After a long while, {foe} takes it.',
      ended:
        '{foe} doesn’t get up. The doors open, and the people of {place} carry the rice away by the armful. {name} fills one bowl and leaves it on the wall, for {lost}.',
      home: 'Home, the carts empty and the road full of people with full bowls.',
    },
  },
};
