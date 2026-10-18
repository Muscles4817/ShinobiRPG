import type { SenseiPast } from '../../../senseiParts';

/** A promise to a dying teammate, to look after the child they left; and the child, taken. */
export const BROKEN_PROMISE: SenseiPast = {
  id: 'broken-promise',
  wound:
    '{name} promised {lost}, dying, to look after {lost}’s little girl. Then she was taken, and {name} wasn’t there.',
  temperaments: ['big-sibling', 'cook', 'scholar', 'iron-bell', 'old-soldier'],
  regions: ['river-road', 'coast-road', 'hill-road'],
  nudge: { onMissions: 'shield' },
  keepsakes: [
    'a child’s drawing, folded very small',
    'a wooden top painted red, the paint worn thin',
    'a hair ribbon tied round the wrist',
  ],
  foe: {
    epithet: 'the Ferryman',
    kind: 'Slaver',
    description:
      'Runs children down the river for the mines and the pleasure houses. Took the girl {name} swore to keep safe.',
    art: 'genjutsu',
    encounter: 'bandit-camp',
  },
  beats: [
    {
      opener:
        '{them} is buying sweets at the market, far more than anyone could eat. “For a friend,” {them} says, and then, seeing your face: “Have one. Go on.”',
      choices: [
        {
          label: 'Take one and thank {them}',
          tone: 'kind',
          reply:
            '{them} looks pleased out of all proportion. “She always liked the red ones,” {them} says, and doesn’t explain.',
        },
        {
          label: 'Ask who the friend is',
          tone: 'curious',
          reply: '“Someone I owe,” {them} says. “Someone I owe a great deal.”',
        },
        {
          label: 'Tease {them} for having a sweet tooth',
          tone: 'tease',
          reply: '“Guilty,” {them} says, and eats one to prove it.',
        },
      ],
    },
    {
      opener:
        '{them} shows you {keepsake}, smoothing it flat on a knee. “Her name was Hana,” {them} says. “Is. Is Hana.”',
      choices: [
        {
          label: 'Ask who Hana is',
          tone: 'curious',
          reply:
            '“A friend’s daughter,” {them} says. “My responsibility.” {them} puts it away very carefully.',
        },
        {
          label: 'Say it is a lovely keepsake',
          tone: 'kind',
          reply: '“She made it for me,” {them} says. “She was very small. She made it anyway.”',
        },
        {
          label: 'Wait for {them} to say more',
          tone: 'quiet',
          reply:
            '{them} doesn’t, today. But {them} looks at you as if deciding whether one day {them} will.',
        },
      ],
    },
    {
      opener:
        '“{lost} died in my arms,” {them} says. “The last thing {lost} asked was that I look after Hana. I said yes. A year later, men from the river took her from the village orchard. I was on a mission. I am always on a mission.”',
      choices: [
        {
          label: 'Tell {them} it wasn’t {them.their} fault',
          tone: 'kind',
          reply: '“It was my promise,” {them} says. “Promises don’t care whose fault it is.”',
        },
        {
          label: 'Ask if anyone looked for her',
          tone: 'earnest',
          reply:
            '“I did,” {them} says. “I still do. A slaver called {foe} runs the river. I have never got close.”',
        },
        {
          label: 'Promise to help find her',
          tone: 'earnest',
          reply:
            '{them} looks at you for a long time. “Be careful what you promise,” {them} says. “But thank you.”',
        },
      ],
    },
    {
      opener:
        '{them} is at your door before dawn. “A girl of the right age was seen at {place},” {them} says. “With {foe}’s people. It may not be her. I have to know.”',
      choices: [
        {
          label: '“We’ll find her.”',
          tone: 'earnest',
          reply: '“Don’t say it,” {them} says. “Just come.” But {them} grips your shoulder hard.',
        },
        {
          label: '“And if it isn’t her?”',
          tone: 'quiet',
          reply: '“Then it is someone else’s Hana,” {them} says. “We bring her home anyway.”',
        },
        {
          label: '“{lost} would be proud of you.”',
          tone: 'kind',
          reply: '{them} has to stop and breathe. “Let’s find out,” {them} says.',
        },
      ],
    },
  ],
  arc: {
    title: 'Hana',
    summary:
      'A girl like the one {name} swore to protect has been seen at {place}, with {foe}’s people.',
    ledger: {
      found: 'Found the boathouse where {foe} keeps the children.',
      mercy: 'Told {name} to bring {foe} home in chains.',
      leave: 'Told {name} to see to the children first.',
      finish: 'Told {name} to make sure {foe} took no more children.',
      spared: 'Brought the children home, and {foe} in chains.',
      ended: 'Brought the children home, and left {foe} dead at the boathouse.',
    },
    find: {
      title: 'The River Children',
      summary: 'Find where {foe} keeps the children near {place}.',
      act: 'Find where {foe} keeps the children near {place}.',
      gate: '{name} has packed far more food than a job needs. “For the way back,” {name} says.',
      road: 'The road to {place}. {name} asks every ferryman and carter you pass the same question.',
      check:
        'Near {place} there are small footprints in the mud where no village is, and a cart track going nowhere.',
      found:
        'A boathouse behind reeds, a guard dozing, and the sound of children being made to keep quiet.',
      lost: 'The tracks vanish into water. {name} follows the smell of cookfires to a boathouse behind the reeds.',
      camp: 'You camp downriver. {name} doesn’t eat, and gives you all the sweets.',
      ending:
        '“Not with so few of us,” {name} says, shaking. “If we fail they move them, and we lose them all. We come back ready.”',
      home: 'Back to the village, to come back ready.',
    },
    settle: {
      title: 'The Ferryman’s Toll',
      summary: 'Back to {place} to take the children back from {foe}.',
      act: 'Go back with {name} and bring the children home.',
      road: 'The river road. {name} tells you everything about Hana, from her first word to her favourite colour.',
      question:
        '“When this is done,” {name} says outside the boathouse, “{foe} will be on the ground in front of me. Tell me what to do, because I don’t trust myself.”',
      mercy: {
        label: '“Bring {foe} home in chains. Let {foe.them} answer for every child.”',
        reply: '“Every child,” {name} says. “Yes.”',
      },
      leave: {
        label: '“The children first. Then decide.”',
        reply: '{name} nods. “The children first,” {name} says.',
      },
      finish: {
        label: '“Make sure {foe} never takes another.”',
        reply: '“Never another,” {name} says, very quietly.',
      },
      appears:
        '{foe} comes out of the boathouse smiling, hands spread, as if this were a trade. “Jōnin,” {foe} says. “Shall we talk price?”',
      spared:
        '{foe} goes home in chains. And among the children, thin and wary and grown, is a girl who looks at {name} for a long time and says, “You came.”',
      ended:
        '{foe} doesn’t get up. Among the children is a girl who looks at {name} for a long time, and then takes {name}’s hand without a word.',
      home: 'The road home, slow, with small tired feet.',
    },
  },
};
