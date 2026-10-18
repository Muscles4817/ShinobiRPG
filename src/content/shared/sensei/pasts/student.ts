import type { SenseiPast } from '../../../senseiParts';

/** The student they pushed too hard, who broke, and left, and became something else. */
export const LOST_STUDENT: SenseiPast = {
  id: 'lost-student',
  wound:
    '{name} pushed a student, {lost}, harder than anyone should be pushed, until {lost} broke and walked out of the village.',
  temperaments: ['iron-bell', 'showboat', 'chess-player', 'quiet-blade', 'cook'],
  regions: ['hill-road', 'mountain-pass', 'dune-road', 'river-road'],
  nudge: { grip: 'loose' },
  keepsakes: [
    'a student’s first headband, too small now for anyone',
    'a training log in a child’s writing, every page full',
    'a wooden practice weapon, worn through at the grip',
  ],
  foe: {
    epithet: 'the Unbroken',
    kind: 'Missing-nin',
    description:
      'Once {name}’s student, pushed until {foe.they} broke, who rebuilt {foe.themself} into a fighter {name} never meant to make.',
    art: 'theirs',
    encounter: 'lone-rogue',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} ends the session early, out of nowhere, and sends you home. “Rest. That’s an order, before you ask. Resting is training too, whatever anyone told you.”',
      choices: [
        {
          label: 'Argue that you can keep going',
          tone: 'challenge',
          reply: '“I know you can,” {them} says. “That’s exactly why you’re going home.”',
        },
        {
          label: 'Thank {them} and go',
          tone: 'kind',
          reply:
            '{them} looks relieved, as if you had passed a test you didn’t know you were sitting.',
        },
        {
          label: 'Ask why today',
          tone: 'curious',
          reply: '“I can see it in your shoulders. I didn’t used to look for that, and I do now.”',
        },
      ],
    },
    {
      opener:
        '{them} has {keepsake} out when you arrive, and doesn’t hide it. “From my first student. Gifted, the best I ever had. You should have seen how hard {lost.they} worked.”',
      choices: [
        {
          label: 'Ask what became of {lost.them}',
          tone: 'curious',
          reply: '“I made {lost.them} very strong,” {them} says, “and that was the trouble.”',
        },
        {
          label: 'Say you work hard too',
          tone: 'earnest',
          reply:
            '“I know you do. I’m watching, I promise you, and I’m watching for the right things this time.”',
        },
        {
          label: 'Say {them} must have been proud',
          tone: 'praise',
          reply:
            '“Proud,” {them} repeats, as if tasting the word. “Yes. Too proud to see what was happening.”',
        },
      ],
    },
    {
      opener:
        '“I pushed {lost} harder than I was ever pushed myself. Every day, and none of it was ever enough,” {them} says. “One night {lost} broke a training post with bare hands and kept hitting it after the hands broke, and I said again. {lost} looked at me and walked out of the gate and never came back.”',
      choices: [
        {
          label: 'Tell {them} {lost} chose to leave',
          tone: 'kind',
          reply:
            '“And I chose to say again, every day for years. That’s what I have to live with.”',
        },
        {
          label: 'Ask if {them} pushes you that hard',
          tone: 'challenge',
          reply:
            '“No,” {them} says at once. “Never. It’s the one promise I made myself when I took your team.”',
        },
        {
          label: 'Just listen',
          tone: 'quiet',
          reply: '{them} talks about {lost} until it gets dark, and only ever about the good days.',
        },
      ],
    },
    {
      opener:
        '“{lost} is at {place}, running a fighting pit,” {them} says, “and teaching children the way I taught {lost}, only harder.” {them} looks older than you have ever seen {them.them}. “I made {lost} what {lost.they} {lost.is}, so I have to go and face it.”',
      choices: [
        {
          label: '“We’ll come.”',
          tone: 'earnest',
          reply: '“Thank you. I need somebody there I didn’t break.”',
        },
        {
          label: '“Maybe {lost} needs an apology, not a fight.”',
          tone: 'kind',
          reply: '{them} stares at you. “I’ve never once thought of that,” {them} says.',
        },
        {
          label: '“What about the children?”',
          tone: 'curious',
          reply: '“The children come first, always. I learned that later than I should have.”',
        },
      ],
    },
  ],
  arc: {
    title: 'Again',
    summary:
      '{lost}, the student {name} broke, is teaching children at {place} the way {name} once taught.',
    ledger: {
      found: 'Found {lost}’s fighting pit.',
      mercy: 'Told {name} to bring {lost} home and say sorry.',
      leave: 'Told {name} to tell {lost} it was enough.',
      finish: 'Told {name} to stop the pit for good.',
      spared: 'Brought {lost} home from the pit.',
      ended: '{lost} died in the pit, and {name} sent its children home.',
    },
    find: {
      title: 'The Pit at {place}',
      summary: 'Find {lost}’s fighting pit near {place}.',
      act: 'Find the fighting pit near {place}.',
      gate: '{name} checks each of you for injuries before you leave, and makes you rest first if there are any.',
      road: 'On the road to {place}, {name} tells you every mistake {name.they} ever made as a teacher, in order.',
      check:
        'At {place} there are children with taped hands and old eyes, all heading the same way at dusk.',
      found:
        'A pit dug in an old quarry and ringed with lanterns, and a voice from the bottom of it shouting “Again!”',
      lost: 'You lose the children in the crowds, but {name} doesn’t need them and follows the shouting instead, which is {name}’s own voice from years ago.',
      camp: 'You camp above the quarry. {name} doesn’t sleep, and flinches every time the voice below says again.',
      ending:
        '“Not like this, with the children there,” {name} says. “We come back when {lost} is alone.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Enough',
      summary: 'Back to {place} for {name} to face {lost}.',
      act: 'Go back with {name} to face {lost}.',
      road: 'On the road again {name} practises an apology over and over under {name.their} breath, and can’t get it right.',
      question:
        '“If it comes to a fight and I win,” {name} says, “I could bring {lost} home. Or I could finish what I started, and stop the pit for good. Tell me.”',
      mercy: {
        label: '“Bring {lost} home. And say what you came to say.”',
        reply: '“I will,” {name} says, eyes wet, “whatever {lost} says back to me.”',
      },
      leave: {
        label: '“Tell {lost} it was enough. Let {lost} choose.”',
        reply: '“Enough. I never once said that to {lost.them}, and I will now.”',
      },
      finish: {
        label: '“{lost} is hurting children. Stop it for good.”',
        reply: '“Yes,” {name} says, very low. “The children come first.”',
      },
      appears:
        '{lost} is waiting alone in the empty pit, grown strong, {lost.their} bare hands taped and scarred. “Sensei,” {lost} says, with a smile that is hard to look at. “Again?”',
      spared:
        '{lost} sits in the dirt of the pit, and {name} kneels beside {lost.them} and says, “It was enough. It was always enough.” {lost} cries like a child, and {name} holds on.',
      ended:
        '{lost} doesn’t get up. {name} unwraps the tape from {lost}’s hands, one finger at a time, and sends the pit’s children home.',
      home: 'Home, with the children of the pit walking behind you.',
    },
  },
};
