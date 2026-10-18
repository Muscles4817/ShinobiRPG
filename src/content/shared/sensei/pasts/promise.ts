import type { SenseiPast } from '../../../senseiParts';

/** A promise to a dying teammate, to look after the child they left; and the child, taken. */
export const BROKEN_PROMISE: SenseiPast = {
  id: 'broken-promise',
  wound:
    '{name} promised {lost}, dying, to look after {lost}’s little girl, and then she was taken on a day {name} wasn’t there.',
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
      'Runs children down the river to the mines and the pleasure houses, and took the girl {name} swore to keep safe.',
    art: 'genjutsu',
    encounter: 'bandit-camp',
  },
  beats: [
    {
      opener:
        '{them} is buying sweets at the market, far more than anyone could eat. “They’re for a friend,” {them} says, and then, seeing your face, “Oh, go on. Have one.”',
      choices: [
        {
          label: 'Take one and thank {them}',
          tone: 'kind',
          reply:
            '{them} looks more pleased than a sweet deserves. “She always liked the red ones,” {them} says, and leaves it at that.',
        },
        {
          label: 'Ask who the friend is',
          tone: 'curious',
          reply: '“Someone I owe. Someone I owe a great deal, as it happens.”',
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
        '{them} shows you {keepsake}, handling it as if it might come apart. “Her name was Hana,” {them} says. “Is, I mean. Her name is Hana.”',
      choices: [
        {
          label: 'Ask who Hana is',
          tone: 'curious',
          reply:
            '“A friend’s daughter, and my responsibility,” {them} says, putting it away very carefully.',
        },
        {
          label: 'Say it is a lovely keepsake',
          tone: 'kind',
          reply:
            '“She gave it to me when she was very small, far too small to know what it would mean to me.”',
        },
        {
          label: 'Wait for {them} to say more',
          tone: 'quiet',
          reply:
            '{them} doesn’t, today, though you can see {them.them} deciding whether one day {them.they} will.',
        },
      ],
    },
    {
      opener:
        '“{lost} died in my arms,” {them} says, “and the last thing {lost} asked was that I look after Hana. I said yes. A year later men from the river took her out of the village orchard, and I was away on a mission. I’m always away on a mission.”',
      choices: [
        {
          label: 'Tell {them} it wasn’t {them.their} fault',
          tone: 'kind',
          reply:
            '“It was my promise, though. A promise doesn’t much care whose fault anything was.”',
        },
        {
          label: 'Ask if anyone looked for her',
          tone: 'earnest',
          reply:
            '“I did, and I still do. A slaver called {foe} runs that river, and in all these years I’ve never got close.”',
        },
        {
          label: 'Promise to help find her',
          tone: 'earnest',
          reply: '“Be careful what you promise people,” {them} says. “But thank you. I mean that.”',
        },
      ],
    },
    {
      opener:
        '{them} is at your door before dawn. “A girl of about the right age was seen at {place} with {foe}’s people. It might not be her, but I have to know.”',
      choices: [
        {
          label: '“We’ll find her.”',
          tone: 'earnest',
          reply:
            '“Don’t say that. Just come,” {them} says, and grips your shoulder hard enough to hurt.',
        },
        {
          label: '“And if it isn’t her?”',
          tone: 'quiet',
          reply: '“Then she’s someone else’s Hana, and we bring her home anyway, don’t we?”',
        },
        {
          label: '“{lost} would be proud of you.”',
          tone: 'kind',
          reply: '{them} has to stop and breathe. “Let’s go and find out if that’s true.”',
        },
      ],
    },
  ],
  arc: {
    title: 'Hana',
    summary:
      'A girl like the one {name} swore to protect has been seen at {place}, with {foe}’s people.',
    find: {
      title: 'The River Children',
      summary: 'Find where {foe} keeps the children near {place}.',
      act: 'Find where {foe} keeps the children near {place}.',
      gate: '{name} has packed far more food than a job needs, for the way back, {name.they} say{name.s}.',
      road: 'On the road to {place}, {name} asks every ferryman and carter you pass the same question.',
      check:
        'Near {place} there are small footprints in the mud where no village is, and a cart track going nowhere.',
      found:
        'A boathouse behind the reeds, a guard dozing at the door, and the sound of children being made to keep quiet.',
      lost: 'The tracks vanish into the water, but {name} follows the smell of cookfires to a boathouse behind the reeds.',
      camp: 'You camp downriver. {name} won’t eat, and gives you all the sweets instead.',
      ending:
        '“Not with so few of us,” {name} says, shaking. “If we fail they’ll move them, and then we lose them all. We come back ready.”',
      home: 'Back to the village, to come back ready.',
    },
    settle: {
      title: 'The Ferryman’s Toll',
      summary: 'Back to {place} to take the children back from {foe}.',
      act: 'Go back with {name} and bring the children home.',
      road: 'On the river road {name} tells you everything about Hana, from her first word to her favourite colour.',
      question:
        '“When this is done,” {name} says outside the boathouse, “{foe} will be on the ground in front of me. Tell me what to do, because I don’t trust myself.”',
      mercy: {
        label: '“Bring {foe} home in chains. Let {foe.them} answer for every child.”',
        reply: '“For every one of them,” {name} says. “Yes, all right. Chains.”',
      },
      leave: {
        label: '“The children first. Then decide.”',
        reply: '“The children first,” {name} agrees, and turns back to the boathouse.',
      },
      finish: {
        label: '“Make sure {foe} never takes another.”',
        reply: '“Never another one,” {name} says, very quietly.',
      },
      appears:
        '{foe} comes out of the boathouse with a smile and both hands spread, as if this were a trade. “A jōnin, is it? Shall we talk price?”',
      spared:
        '{foe} goes home in chains. Among the children is a thin, wary girl, nearly grown, who searches {name}’s face before she says, “You came.”',
      ended:
        '{foe} doesn’t get up. Among the children is a girl who searches {name}’s face, and then takes {name.their} hand.',
      home: 'The road home, slow, with small tired feet.',
    },
  },
};
