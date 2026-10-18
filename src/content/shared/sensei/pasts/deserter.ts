import type { SenseiPast } from '../../../senseiParts';

/** They ran away once, with a friend; they came back, and the friend did not. */
export const DESERTER: SenseiPast = {
  id: 'deserter',
  wound:
    '{name} once deserted the village with {lost}. {name} came back and was forgiven. {lost} never came back.',
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
      'The friend {name} ran away with, long ago. Captain of a sell-sword band now, and good at it.',
    art: 'kenjutsu',
    encounter: 'bandit-camp',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} is rolling {keepsake} on a step. “Want to bet?” {them} asks. “No? Wise. They’re not honest. Neither was the friend who gave them to me.”',
      choices: [
        {
          label: 'Bet anyway',
          tone: 'challenge',
          reply: '{them} lets you win, obviously, and then laughs at you for knowing.',
        },
        {
          label: 'Ask who gave them to {them}',
          tone: 'curious',
          reply: '“A friend,” {them} says. “From when I wasn’t much of a shinobi.”',
        },
        {
          label: 'Say you don’t gamble',
          tone: 'earnest',
          reply: '“Good,” {them} says, and pockets them. “Don’t start.”',
        },
      ],
    },
    {
      opener:
        '“Do you ever want to leave?” {them} asks you, out of nowhere. “The village. All of it. Just walk out of the gate and keep going.”',
      choices: [
        {
          label: 'Admit you sometimes do',
          tone: 'earnest',
          reply: '{them} nods slowly. “Everyone does,” {them} says. “The trick is coming back.”',
        },
        {
          label: 'Say never',
          tone: 'praise',
          reply:
            '“Good,” {them} says. “Stay that way.” But {them} doesn’t look like {them} believes it.',
        },
        {
          label: 'Ask if {them} ever did',
          tone: 'curious',
          reply: '{them} smiles crookedly. “Ask me another day,” {them} says.',
        },
      ],
    },
    {
      opener:
        '“I deserted,” {them} says. “At your age, near enough. {lost} and I walked out at night to sell our blades. A year later I walked back in. They should have hanged me. Instead they gave me a second chance. {lost} didn’t ask for one.”',
      choices: [
        {
          label: 'Ask why {them} came back',
          tone: 'curious',
          reply:
            '“I found out what we were for,” {them} says. “Out there. It wasn’t anything I could live with.”',
        },
        {
          label: 'Say the village was right to forgive {them}',
          tone: 'kind',
          reply: '“Maybe,” {them} says. “I’ve spent every year since trying to make it true.”',
        },
        {
          label: 'Ask what became of {lost}',
          tone: 'earnest',
          reply:
            '“Captain of the Free Blades now,” {them} says. “Good at it. I taught {lost} half of what made {lost.them} good.”',
        },
      ],
    },
    {
      opener:
        '“The Free Blades have taken a contract at {place},” {them} says. “Against our people. {lost} knows I’m the one they’ll send. I think {lost} wants me to come.”',
      choices: [
        {
          label: '“Then we go with you.”',
          tone: 'earnest',
          reply: '“I hoped,” {them} says. “I didn’t think I had the right to ask.”',
        },
        {
          label: '“Do you want to bring {lost} back, or stop {lost.them}?”',
          tone: 'challenge',
          reply: '“Yes,” {them} says. And then: “I don’t know which.”',
        },
        {
          label: '“Maybe {lost} wants to come home.”',
          tone: 'kind',
          reply: '{them} laughs, and it cracks. “Maybe,” {them} says. “I did.”',
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
      gate: '{name} turns up at the gate without a headband, then goes back for it.',
      road: 'The road to {place}. {name} knows every inn on it, and which ones still owe {name} money.',
      check:
        'Near {place} you find the signs of a disciplined camp, its latrines dug properly and its fires hidden, the ground at the sentries’ posts worn by changing feet.',
      found:
        'A camp in a fold of the land, run tighter than most villages. {name} goes pale. “That’s {lost}’s work,” {name} says.',
      lost: 'You find nothing. {name} finds it anyway: “It’s where I’d camp,” {name} says. “It’s where we always camped.”',
      camp: 'You camp in the dark. {name} rolls the dice by the fire, over and over, and never looks at them.',
      ending:
        '“Not like this,” {name} says. “I’ll come back and face {lost} properly. I owe {lost} that much.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Coming Home',
      summary: 'Back to {place}, for {name} to face {lost}.',
      act: 'Go back with {name} to face {lost}.',
      road: 'The road again. {name} tells you about the year away, all of it, the parts that make {name} look worst first.',
      question:
        '“If {lost} goes down,” {name} says, “I could ask the village for the same chance it gave me. Or I could let it end. Tell me what you’d do.”',
      mercy: {
        label: '“Ask for {lost}’s second chance.”',
        reply:
          '{name} closes {name.their} eyes. “Thank you,” {name} says. “I needed someone else to say it.”',
      },
      leave: {
        label: '“You came back. Let {lost} choose.”',
        reply: '“Let {lost} choose,” {name} says. “That’s fair. That’s all anyone gave me.”',
      },
      finish: {
        label: '“{lost} made {lost.their} choice long ago.”',
        reply: '“Yes,” {name} says heavily. “So did I. I chose differently.”',
      },
      appears:
        '{lost} walks out of the camp alone, sword on the shoulder, grinning. “Took you long enough,” {lost} says. “Let’s see what the village taught you.”',
      spared:
        '{lost} kneels in the dust, laughing and bleeding. “Fine,” {lost} says. “Take me home. Someone has to show you how to cook properly.” {name} walks the whole way home beside {lost.them}.',
      ended:
        '{lost} doesn’t get up. {name} takes the brass token off the body and leaves the loaded die in its place, and walks away without looking back.',
      home: 'The road home, with the Free Blades scattered behind you.',
    },
  },
};
