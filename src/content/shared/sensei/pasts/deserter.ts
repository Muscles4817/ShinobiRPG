import type { SenseiPast } from '../../../senseiParts';

/** They ran away once, with a friend; they came back, and the friend did not. */
export const DESERTER: SenseiPast = {
  id: 'deserter',
  wound:
    '{name} deserted the village once, with {lost}. A year later {name} came back alone and was forgiven, and {lost} has been gone ever since.',
  temperaments: ['lazy-genius', 'old-soldier', 'showboat', 'mystic', 'quiet-blade'],
  regions: ['dune-road', 'hill-road', 'forest-track', 'mountain-pass'],
  nudge: { grip: 'loose', onMissions: 'lets-fail' },
  keepsakes: [
    'a mercenary company’s brass token',
    'a headband with the scratch through it polished smooth',
    'a pair of dice, one of them loaded',
  ],
  foe: {
    epithet: 'of the Free Blades',
    kind: 'Mercenary',
    description:
      'The friend {name} ran away with long ago, who stayed out there and captains a sell-sword band now, and captains it well.',
    art: 'kenjutsu',
    encounter: 'bandit-camp',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} is sitting on a step, turning {keepsake} over in one hand. “Want a bet on it? No? Probably wise. I had it from a friend who never once played fair with me.”',
      choices: [
        {
          label: 'Bet anyway',
          tone: 'challenge',
          reply:
            '{them} lets you win, so plainly that you both know it, and then laughs at you for noticing.',
        },
        {
          label: 'Ask who gave them to {them}',
          tone: 'curious',
          reply:
            '“A friend. This was back when I wasn’t much of a shinobi, so not the best kind of friend either.”',
        },
        {
          label: 'Say you don’t gamble',
          tone: 'earnest',
          reply:
            '“Good. Don’t start, all right?” {them} puts it away as if you had caught {them.them} cheating.',
        },
      ],
    },
    {
      opener:
        '“Do you ever want to leave?” {them} asks, out of nowhere. “The village, I mean, all of it. Just walk out of the gate one night and keep going until nobody knows your name.”',
      choices: [
        {
          label: 'Admit you sometimes do',
          tone: 'earnest',
          reply:
            '“Most people do, at your age. I did.” {them} picks at a splinter in the step. “If you ever go, come back. That’s all I’d ask of you.”',
        },
        {
          label: 'Say never',
          tone: 'praise',
          reply:
            '“Good. Stay that way,” {them} says, in the voice of someone who doesn’t believe a word of it.',
        },
        {
          label: 'Ask if {them} ever did',
          tone: 'curious',
          reply: '“Ask me another day,” {them} says, and gets up before you can.',
        },
      ],
    },
    {
      opener:
        '“I deserted,” {them} says. “I was about your age. {lost} and I walked out one night to sell our blades to whoever paid, and a year later I walked back in on my own. They could have hanged me for it, and they gave me a second chance instead. {lost} never came to ask for one.”',
      choices: [
        {
          label: 'Ask why {them} came back',
          tone: 'curious',
          reply:
            '“Out there I found out what we were for, who paid us and what they paid us to do, and I couldn’t live with it. {lost} could, or said so.”',
        },
        {
          label: 'Say the village was right to forgive {them}',
          tone: 'kind',
          reply:
            '“Maybe. I’ve spent every year since trying to make it true, and some years I think I’ve managed.”',
        },
        {
          label: 'Ask what became of {lost}',
          tone: 'earnest',
          reply:
            '“{lost} captains the Free Blades now, and does it well. Half of what makes {lost.them} good at it I taught {lost.them}, back when we were sure we knew everything.”',
        },
      ],
    },
    {
      opener:
        '“The Free Blades have taken a contract at {place},” {them} says, “against our people. {lost} knows I’m the one the village will send, and I think that’s why {lost} took it.”',
      choices: [
        {
          label: '“Then we go with you.”',
          tone: 'earnest',
          reply:
            '“I was hoping you’d say that,” {them} says. “I didn’t think I had any right to ask you.”',
        },
        {
          label: '“Do you want to bring {lost} back, or stop {lost.them}?”',
          tone: 'challenge',
          reply:
            '“Yes,” {them} says, and then, after a while, “I don’t know. Both, if I’m allowed.”',
        },
        {
          label: '“Maybe {lost} wants to come home.”',
          tone: 'kind',
          reply:
            '{them} laughs, and the laugh cracks in the middle. “Maybe. I wanted to once myself, and it took me a year to admit it.”',
        },
      ],
    },
  ],
  arc: {
    title: 'The Free Blades',
    summary: '{lost}, who ran away with {name} long ago, has brought a sell-sword band to {place}.',
    ledger: {
      found: 'Found the Free Blades’ camp.',
      mercy: 'Told {name} to ask the village for {lost}’s second chance.',
      leave: 'Told {name} to let {lost} choose.',
      finish: 'Told {name} that {lost} had chosen long ago.',
      spared: 'Brought {lost} home to the village.',
      ended: '{lost} died, and the Free Blades scattered.',
    },
    find: {
      title: 'Old Friends at {place}',
      summary: '{name} wants to find the Free Blades’ camp near {place} before they move.',
      act: 'Find the Free Blades’ camp near {place}.',
      gate: '{name} turns up at the gate without a headband, stands there a moment, and goes back home for it.',
      road: 'On the road to {place}, {name} knows every inn by name, and which ones still owe {name.them} money from the old days.',
      check:
        'Near {place} you find the signs of a disciplined camp, its latrines dug properly and its fires hidden, the ground at the sentries’ posts worn by changing feet.',
      found:
        'The camp sits in a fold of the land and is run tighter than most villages. {name} has gone pale. “That’s {lost}’s work. I’d know it anywhere.”',
      lost: 'You find nothing, but {name} points to a hollow below the ridge anyway. “That’s where I’d camp. It’s where we always camped, the two of us.”',
      camp: 'You camp without a fire. {name} sits up rolling the dice over and over in the dark and never once looks to see how they fall.',
      ending:
        '“Not like this, not creeping up on {lost.them},” {name} says. “We go home, and I come back and face {lost} properly. I owe {lost.them} that much.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Coming Home',
      summary: 'Back to {place}, for {name} to face {lost}.',
      act: 'Go back with {name} to face {lost}.',
      road: 'On the road again {name} tells you about the year away, all of it, starting with the parts that make {name.them} look worst.',
      question:
        '“If {lost} goes down,” {name} says, “I could ask the village for the same chance it gave me. Or I could let it end there. Tell me what you’d do.”',
      mercy: {
        label: '“Ask for {lost}’s second chance.”',
        reply:
          '“Thank you,” {name} says, with {name.their} eyes shut. “I needed to hear somebody else say it.”',
      },
      leave: {
        label: '“You came back. Let {lost} choose.”',
        reply:
          '“Let {lost} choose,” {name} repeats slowly. “That’s fair. It’s what they let me do, when it was me.”',
      },
      finish: {
        label: '“{lost} made {lost.their} choice long ago.”',
        reply:
          '“Yes, {lost.they} did,” {name} says heavily. “So did I, and I chose the other way.”',
      },
      appears:
        '{lost} walks out of the camp alone with a sword across one shoulder, as cheerful as if this were a reunion. “Took you long enough. Come on, then, let’s see what the village taught you.”',
      spared:
        '{lost} is down on {lost.their} knees in the dust, laughing through the blood. “Fine, take me home, then. Somebody has to teach you to cook properly.” {name} walks beside {lost.them} the whole way back.',
      ended:
        '{lost} doesn’t get up. {name} takes the brass token off the body and leaves the loaded die in its place, and walks away without looking back.',
      home: 'The road home, with the Free Blades scattered behind you.',
    },
  },
};
