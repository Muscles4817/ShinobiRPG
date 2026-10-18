import type { SenseiPast } from '../../../senseiParts';

/** A fire they could not hold back as a child, and someone who uses fire on purpose. */
export const THE_FIRE: SenseiPast = {
  id: 'the-fire',
  wound:
    'As a genin, {name} lost hold of {name.their} fire and burned down the farm where {lost}’s family lived.',
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
      'Burns farms and storehouses for whoever pays, and enjoys the work, using fire the way {name} was once afraid to.',
    art: 'ninjutsu',
    encounter: 'lone-rogue',
  },
  beats: [
    {
      opener:
        '{them} puts out a cookfire you lit so thoroughly that there isn’t a spark left in the ash, and then lights it again for you. “Sorry. Old habit, I don’t even notice I’m doing it.”',
      choices: [
        {
          label: 'Ask about the habit',
          tone: 'curious',
          reply:
            '“Fire is patient,” {them} says. “It waits for you to stop paying attention, and then it doesn’t wait at all.”',
        },
        {
          label: 'Joke that it was a very small fire',
          tone: 'joke',
          reply: '“They all start small,” {them} says, but it comes out more amused than stern.',
        },
        {
          label: 'Thank {them} and leave it there',
          tone: 'quiet',
          reply: 'You eat, and {them} watches the fire the whole time you do.',
        },
      ],
    },
    {
      opener:
        '{them} catches you looking at {keepsake}. “Anyone with a fire nature ought to keep one of these, I think. A reminder of what it costs when you get it wrong.”',
      choices: [
        {
          label: 'Ask what it cost {them}',
          tone: 'curious',
          reply: '“A farm, and more than a farm. Not today, though. Ask me again.”',
        },
        {
          label: 'Say {them} is the most careful shinobi you know',
          tone: 'praise',
          reply:
            '“I had to learn to be,” {them} says. “Most people manage it for less than I paid.”',
        },
        {
          label: 'Say you aren’t afraid of fire',
          tone: 'challenge',
          reply:
            '“Good,” {them} says. “Then be afraid of yourself instead. In my experience it works better.”',
        },
      ],
    },
    {
      opener:
        '“I was twelve,” {them} says, “and angry about I can’t remember what any more. The fire came out of me and wouldn’t go back in. It was {lost}’s family’s farm. They all got out, and everything else they had burned.”',
      choices: [
        {
          label: 'Ask what happened to {lost}',
          tone: 'curious',
          reply: '“{lost} forgave me, years later. I’ve never understood how anyone could.”',
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
          reply:
            '{them} takes it for a moment with the bandaged hand, and lets go before either of you has to speak.',
        },
      ],
    },
    {
      opener:
        '“There’s an arsonist burning farms near {place},” {them} says. “People call {foe.them} {foe}, and {foe.they} do{foe.es} on purpose what I did by accident. I want to stop {foe.them}, and I want you to see what fire looks like when nobody holds it back.”',
      choices: [
        {
          label: '“We’ll stop {foe.them}.”',
          tone: 'earnest',
          reply: '“Carefully,” {them} says. “Whatever else happens, we stop {foe.them} carefully.”',
        },
        {
          label: '“Are you sure you want to face that?”',
          tone: 'kind',
          reply: '“No, I’m not sure at all. I think that’s why I have to.”',
        },
        {
          label: '“Show me how you hold it back.”',
          tone: 'curious',
          reply:
            '“That’s the one lesson I’ve ever really wanted to teach anybody,” {them} says. “Yes. I’ll show you.”',
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
      summary: 'Follow {foe}’s trail of burned farms near {place} to where {foe.they} hide{foe.s}.',
      act: 'Find where {foe} hides near {place}.',
      gate: '{name} checks every water flask in the team before you leave, and then checks them again.',
      road: 'On the road to {place} you smell the burning a long while before you see any of it.',
      check: 'Around {place} the burned farms make a pattern, if you can bear to read it.',
      found:
        'A charcoal-burner’s hut far from any farm, with oil jars stacked against the back wall.',
      lost: 'The pattern beats you, but {name} reads it at a glance. “Downwind. {foe} always lives downwind of the next one.”',
      camp: 'You camp without a fire at all, because {name} won’t hear of one.',
      ending:
        '“Not tonight,” {name} says. “In the dark and the dry, with oil stacked up like that, it would burn the whole valley. We come back when it rains.”',
      home: 'Back to the village, to wait for rain.',
    },
    settle: {
      title: 'When It Rains',
      summary: 'Back to {place} in the rain, to stop {foe}.',
      act: 'Go back with {name} in the rain and stop {foe}.',
      road: 'The rain comes as {name} said it would, and {name} walks in it with {name.their} face turned up to it.',
      question:
        '“When it’s over,” {name} says, “I could take {foe} home for the village to judge. Or I could make sure no fire ever comes out of {foe} again. Tell me which.”',
      mercy: {
        label: '“Take {foe.them} home. Fire isn’t the answer to fire.”',
        reply:
          '{name} lets out a breath that steams in the cold. “No, it never has been. Home, then.”',
      },
      leave: {
        label: '“You know fire better than anyone. You decide.”',
        reply:
          '“I know what it costs,” {name} says, “which isn’t the same as knowing what to do with it.”',
      },
      finish: {
        label: '“Make sure {foe.they} never burn{foe.s} anything again.”',
        reply:
          '{name} looks down at the bandaged hand and doesn’t answer you, not then nor on the road home.',
      },
      appears:
        '{foe} steps out into the rain laughing, with the rain steaming off {foe.their} hands. “Another fire user. I can smell it on you,” {foe} says to {name}. “Let’s see whose burns hotter.”',
      spared:
        '{foe} goes home bound, hands wrapped in wet cloth. {name} walks beside {foe.them} all the way, and at the gate {name} unwraps the old bandage for the first time in years.',
      ended:
        '{foe} doesn’t get up. The rain puts out the last of the fires, and {name} stands in it until it stops.',
      home: 'Home in the clean rain.',
    },
  },
};
