import type { SenseiPast } from '../../../senseiParts';

/** A fire they could not hold back as a child, and someone who uses fire on purpose. */
export const THE_FIRE: SenseiPast = {
  id: 'the-fire',
  wound:
    'As a genin, {name} lost hold of their fire and burned a farm to the ground. {lost}’s family lived there.',
  temperaments: ['scholar', 'mystic', 'quiet-blade', 'big-sibling', 'chess-player'],
  arts: ['ninjutsu'],
  nature: 'fire',
  regions: ['hill-road', 'dune-road', 'forest-track'],
  nudge: { grip: 'firm', onMissions: 'shield' },
  keepsakes: [
    'a scorched roof tile kept wrapped in cloth',
    'a burn scar across one palm, always bandaged',
    'a jar of ash, sealed with wax',
  ],
  foe: {
    epithet: 'the Kindler',
    kind: 'Arsonist',
    description:
      'Burns farms and storehouses for whoever pays, and enjoys it. Fights with fire the way {name} once feared to.',
    art: 'ninjutsu',
    encounter: 'lone-rogue',
  },
  beats: [
    {
      opener:
        '{them} puts out a cookfire you lit, carefully, completely, until not a spark is left, then lights it again for you. “Sorry,” {them} says. “Old habit.”',
      choices: [
        {
          label: 'Ask about the habit',
          tone: 'curious',
          reply: '“Fire is patient,” {them} says. “It waits for you to stop paying attention.”',
        },
        {
          label: 'Joke that it was a very small fire',
          tone: 'joke',
          reply: '“They all are,” {them} says, “to start with.” But {them} smiles.',
        },
        {
          label: 'Thank {them} and leave it there',
          tone: 'quiet',
          reply: '{them} nods, and watches the fire the whole time you eat.',
        },
      ],
    },
    {
      opener:
        '{them} catches you staring at {keepsake}. “Every fire nature user should have one of these,” {them} says. “Something to remember the cost by.”',
      choices: [
        {
          label: 'Ask what it cost {them}',
          tone: 'curious',
          reply: '“A farm,” {them} says. “And more. Not today.”',
        },
        {
          label: 'Say {them} is the most careful shinobi you know',
          tone: 'praise',
          reply: '“I had to learn,” {them} says. “Most people learn cheaper.”',
        },
        {
          label: 'Say you aren’t afraid of fire',
          tone: 'challenge',
          reply: '“Good,” {them} says. “Be afraid of yourself, then. It works better.”',
        },
      ],
    },
    {
      opener:
        '“I was twelve,” {them} says. “Angry about something I can’t even remember. The fire came out of me and wouldn’t go back in. The farm was {lost}’s family’s. They got out. Everything else burned.”',
      choices: [
        {
          label: 'Ask what happened to {lost}',
          tone: 'curious',
          reply: '“{lost} forgave me,” {them} says. “Years later. I have never understood how.”',
        },
        {
          label: 'Tell {them} a child can’t be blamed for that',
          tone: 'kind',
          reply:
            '“No,” {them} says. “But the child grew up, and the grown-up can make sure it never happens again.”',
        },
        {
          label: 'Hold out your hand, without a word',
          tone: 'quiet',
          reply: '{them} takes it, briefly, with the bandaged hand. Neither of you says anything.',
        },
      ],
    },
    {
      opener:
        '“There’s an arsonist burning farms near {place},” {them} says. “They call them {foe}. Someone who does on purpose what I did by accident. I want to stop them. And I want you to see what fire looks like when it’s used without care.”',
      choices: [
        {
          label: '“We’ll stop them.”',
          tone: 'earnest',
          reply: '“Carefully,” {them} says. “We stop them carefully.”',
        },
        {
          label: '“Are you sure you want to face that?”',
          tone: 'kind',
          reply: '“No,” {them} says. “That’s why I need to.”',
        },
        {
          label: '“Show me how you hold it back.”',
          tone: 'curious',
          reply: '“That,” {them} says, “is the only lesson I have ever wanted to teach.”',
        },
      ],
    },
  ],
  arc: {
    title: 'Ash and Embers',
    summary:
      'An arsonist called {foe} is burning farms near {place}, the way {name} once burned one by accident.',
    find: {
      title: 'Smoke at {place}',
      summary: 'Follow {foe}’s trail of burned farms near {place} to where they hide.',
      act: 'Find where {foe} hides near {place}.',
      gate: '{name} checks every water flask in the team before you leave, twice.',
      road: 'The road to {place}. You smell the burning long before you see it.',
      check: 'Around {place} the burned farms make a pattern, if you can bear to read it.',
      found:
        'A charcoal-burner’s hut far from any farm, with oil jars stacked against the back wall.',
      lost: 'The pattern defeats you. {name} reads it at a glance: “Downwind,” {name} says. “Always downwind of the next one.”',
      camp: 'You camp with no fire at all. {name} insists.',
      ending:
        '“Not tonight,” {name} says. “In the dark, in the dry, near oil, it would burn the whole valley. We come back when it rains.”',
      home: 'Back to the village, to wait for rain.',
    },
    settle: {
      title: 'When It Rains',
      summary: 'Back to {place} in the rain, to stop {foe}.',
      act: 'Go back with {name} in the rain and stop {foe}.',
      road: 'The rain comes as {name} said it would. {name} walks in it with their face turned up.',
      question:
        '“When it’s over,” {name} says, “I could take {foe} home for the village to judge. Or I could make sure no fire ever comes out of {foe} again. Tell me which.”',
      mercy: {
        label: '“Take them home. Fire isn’t the answer to fire.”',
        reply:
          '{name} lets out a breath that steams in the cold. “No,” {name} says. “It never is.”',
      },
      leave: {
        label: '“You know fire better than anyone. You decide.”',
        reply: '“I know what it costs,” {name} says. “That’s not the same as knowing what to do.”',
      },
      finish: {
        label: '“Make sure they never burn anything again.”',
        reply: '{name} looks at the bandaged hand for a long moment, and says nothing.',
      },
      appears:
        '{foe} steps out into the rain, laughing, and the rain steams off their hands. “A fire user,” {foe} says to {name}. “I can smell it on you. Let’s see whose burns hotter.”',
      spared:
        '{foe} goes home bound, hands wrapped in wet cloth. {name} walks beside them all the way, and at the gate {name} unwraps the old bandage for the first time in years.',
      ended:
        '{foe} doesn’t get up. The rain puts out the last of the fires. {name} stands in it until it stops.',
      home: 'Home in the clean rain.',
    },
  },
};
