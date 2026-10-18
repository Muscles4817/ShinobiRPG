import type { SenseiPast } from '../../../senseiParts';

/** A famine year, a stolen sack of rice, and the hoarder who let a village starve. */
export const HUNGRY_YEAR: SenseiPast = {
  id: 'hungry-year',
  wound:
    'In the hungry year, {name} and {lost} stole rice from a hoarder’s storehouse to keep their street alive, until the night {lost} was caught.',
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
      'The hoarder’s hired blade from the hungry year, the one who caught {lost}, still guarding the same storehouses for the same family.',
    art: 'taijutsu',
    encounter: 'guarded-building',
  },
  beats: [
    {
      opener:
        '{them} sees you push away a bowl with half the rice still in it and goes very still. Then {them} pulls the bowl across and eats it, every grain, without saying a word to you.',
      choices: [
        {
          label: 'Apologise',
          tone: 'earnest',
          reply: '“Don’t apologise. Just don’t do it again, all right? I’ll tell you why one day.”',
        },
        {
          label: 'Joke that {them} must be hungry',
          tone: 'joke',
          reply: '“Always,” {them} says, and laughs, though the laugh is a moment late.',
        },
        {
          label: 'Ask why that mattered',
          tone: 'curious',
          reply:
            '“Some people never had any to leave,” {them} says. “Let’s leave it there for now.”',
        },
      ],
    },
    {
      opener:
        '{them} shows you {keepsake}. “That’s from the winter my whole street lived on stolen rice. None of it was ours, not a grain.”',
      choices: [
        {
          label: 'Ask whose it was',
          tone: 'curious',
          reply:
            '“A rice merchant’s, who was sitting on it until the price went up,” {them} says. “People died on our street while the merchant waited.”',
        },
        {
          label: 'Say it sounds like it was the right thing',
          tone: 'praise',
          reply:
            '“It was the only thing we could do,” {them} says. “I’m still not sure that makes it right.”',
        },
        {
          label: 'Ask if {them} was caught',
          tone: 'earnest',
          reply: '“Not me, no,” {them} says, and doesn’t say who was.',
        },
      ],
    },
    {
      opener:
        '“{lost} and I went in every night for a week,” {them} says. “On the last night the merchant’s guard was waiting for us, a big quiet one they called {foe}. I got over the wall and {lost} didn’t, and they sent {lost} to work in the mines. I joined the academy that spring so I’d never be that helpless again.”',
      choices: [
        {
          label: 'Ask if {lost} ever came back',
          tone: 'curious',
          reply:
            '“Once. Thin as a rake and laughing about it,” {them} says. “The cough took {lost.them} that winter.”',
        },
        {
          label: 'Tell {them} {lost} would be proud',
          tone: 'kind',
          reply:
            '“I think {lost} would laugh at the headband and then steal my lunch while I was busy being offended.”',
        },
        {
          label: 'Sit with {them} and say nothing',
          tone: 'quiet',
          reply:
            'After a while {them} starts talking about {lost}, and goes on until it’s dark, and tells you only the good things.',
        },
      ],
    },
    {
      opener:
        '“There’s a famine coming at {place},” {them} says, “and the same family is buying up the rice, into the same storehouses, with the same guard on the door. {foe} is still there. This time I want to open the storehouse with a mission order in my hand.”',
      choices: [
        {
          label: '“Let’s feed {place}.”',
          tone: 'earnest',
          reply:
            '“That’s the job,” {them} says. “Whatever else happens there, that’s the job we’re going for.”',
        },
        {
          label: '“And {foe}?”',
          tone: 'challenge',
          reply: '“We’ll see. I’d like to know whether {foe} even remembers {lost}.”',
        },
        {
          label: '“I’ll bring a bigger bowl.”',
          tone: 'joke',
          reply: '{them} laughs properly for the first time today. “Bring two, then.”',
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
      gate: '{name} has packed twice as much rice for the road as the team could eat. “For whoever we meet on the way.”',
      road: 'On the road to {place} the fields are dry, and the children who stop to watch you pass are thin.',
      check:
        'Around {place} carts go in loaded and come out empty, always at night, always the same road.',
      found:
        'Storehouses behind a high wall, rice dust hanging in the air, and a guard who never seems to sleep.',
      lost: 'You lose the carts, but {name} doesn’t. “Follow the rats. They always know where the rice is kept.”',
      camp: 'You camp by the road, and {name} gives most of the team’s food away to the first family that passes.',
      ending:
        '“We need the mission order sealed first,” {name} says. “Then we come back and open the place where everyone can see us do it.”',
      home: 'Back to the village for the order.',
    },
    settle: {
      title: 'The Storehouse Door',
      summary: 'Back to {place} with a sealed order to open the storehouses.',
      act: 'Go back with {name} and open the storehouses.',
      road: 'On the road again, {name} cooks for every hungry person you meet on it.',
      question:
        '“{foe} will be at the door,” {name} says, “the same as in the hungry year. I could break {foe} the way {foe} broke {lost}, or I could not. What do I do?”',
      mercy: {
        label: '“Let {foe} watch the rice go to the people.”',
        reply: '“Yes,” {name} says, slowly coming round to it. “Let {foe} sit and watch.”',
      },
      leave: {
        label: '“Open the door. That’s what matters.”',
        reply: '“The door. Yes, you’re right, the door is what we came for.”',
      },
      finish: {
        label: '“For {lost}.”',
        reply: '“For {lost},” {name} says, very quietly, with {name.their} eyes closed.',
      },
      appears:
        '{foe} is at the storehouse door. Older and heavier now, {foe} is as quiet as ever. When {foe} sees {name}, the eyes change. “The other one,” {foe} says. “I remember you.”',
      spared:
        '{foe} sits against the wall and watches the doors open and the people of {place} come for the rice. {name} hands {foe} a bowl, and after a while {foe} takes it.',
      ended:
        '{foe} doesn’t get up. The doors open, and the people of {place} carry the rice away by the armful. {name} fills one bowl and leaves it on the wall, for {lost}.',
      home: 'Home, the carts empty and the road full of people with full bowls.',
    },
  },
};
