import type { SenseiPast } from '../../../senseiParts';

/** The student they pushed too hard, who broke, and left, and became something else. */
export const LOST_STUDENT: SenseiPast = {
  id: 'lost-student',
  wound:
    '{name} pushed a student, {lost}, harder than anyone should be pushed. {lost} broke, and walked out of the village.',
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
      'Once {name}’s student. Pushed until they broke, then rebuilt themself into something {name} never meant to make.',
    art: 'theirs',
    encounter: 'lone-rogue',
    isLost: true,
  },
  beats: [
    {
      opener:
        '{them} ends the session early, out of nowhere, and sends you home. “Rest,” {them} says. “That’s an order. Rest is training too.”',
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
          reply: '“Because I can see it in your shoulders,” {them} says. “I didn’t used to look.”',
        },
      ],
    },
    {
      opener:
        '{them} is reading {keepsake} when you arrive, and doesn’t hide it. “My first student,” {them} says. “Gifted. The best I ever had. Look how hard they worked.”',
      choices: [
        {
          label: 'Ask what became of them',
          tone: 'curious',
          reply: '“I made them very strong,” {them} says. “That was the trouble.”',
        },
        {
          label: 'Say you work hard too',
          tone: 'earnest',
          reply:
            '{them} closes the book gently. “I know,” {them} says. “I’m watching. I promise you I’m watching.”',
        },
        {
          label: 'Say {them} must have been proud',
          tone: 'praise',
          reply: '“Proud,” {them} says, as if tasting the word. “Yes. Too proud to see.”',
        },
      ],
    },
    {
      opener:
        '“I pushed {lost} the way I was pushed,” {them} says. “Harder. Every day. Never enough. One night {lost} broke a training post with bare hands and kept hitting it after the hands broke. I said, again. {lost} looked at me, and walked out of the gate, and never came back.”',
      choices: [
        {
          label: 'Tell {them} {lost} chose to leave',
          tone: 'kind',
          reply:
            '“I chose to say again,” {them} says. “Every day. That is what I have to live with.”',
        },
        {
          label: 'Ask if {them} pushes you that hard',
          tone: 'challenge',
          reply:
            '“No,” {them} says at once. “Never. That’s the only promise I made when I took your team.”',
        },
        {
          label: 'Just listen',
          tone: 'quiet',
          reply: '{them} talks about {lost} until it gets dark, and only the good days.',
        },
      ],
    },
    {
      opener:
        '“{lost} is at {place},” {them} says. “Running a fighting pit. Teaching children the way I taught {lost}. Harder.” {them} looks older than you have ever seen. “I have to go. I made {lost}. I have to face it.”',
      choices: [
        {
          label: '“We’ll come.”',
          tone: 'earnest',
          reply: '“Thank you,” {them} says. “I need someone there who I didn’t break.”',
        },
        {
          label: '“Maybe {lost} needs an apology, not a fight.”',
          tone: 'kind',
          reply: '{them} stares at you. “I’ve never once thought of that,” {them} says.',
        },
        {
          label: '“What about the children?”',
          tone: 'curious',
          reply:
            '“The children first,” {them} says. “Always the children first. I learned that too late.”',
        },
      ],
    },
  ],
  arc: {
    title: 'Again',
    summary:
      '{lost}, the student {name} broke, is teaching children at {place} the way {name} once taught.',
    find: {
      title: 'The Pit at {place}',
      summary: 'Find {lost}’s fighting pit near {place}.',
      act: 'Find the fighting pit near {place}.',
      gate: '{name} checks each of you for injuries before you leave, and makes you rest first if there are any.',
      road: 'The road to {place}. {name} tells you every mistake they ever made as a teacher, in order.',
      check:
        'At {place} there are children with taped hands and old eyes, all heading the same way at dusk.',
      found:
        'A pit dug in an old quarry, ringed with lanterns, and a voice from the bottom of it shouting: “Again!”',
      lost: 'You lose the children in the crowds. {name} doesn’t need them: {name} follows the shouting, which is {name}’s own voice, from years ago.',
      camp: 'You camp above the quarry. {name} doesn’t sleep, and every time the voice below says again, {name} flinches.',
      ending:
        '“Not like this,” {name} says. “Not with the children there. We come back when {lost} is alone.”',
      home: 'Back to the village.',
    },
    settle: {
      title: 'Enough',
      summary: 'Back to {place} for {name} to face {lost}.',
      act: 'Go back with {name} to face {lost}.',
      road: 'The road again. {name} practises an apology under their breath, over and over, and can’t get it right.',
      question:
        '“If it comes to a fight and I win,” {name} says, “I could bring {lost} home. Or I could finish what I started, and stop the pit for good. Tell me.”',
      mercy: {
        label: '“Bring {lost} home. And say what you came to say.”',
        reply: '{name} nods, eyes wet. “I will,” {name} says. “Whatever {lost} says back.”',
      },
      leave: {
        label: '“Tell {lost} it was enough. Let {lost} choose.”',
        reply: '“Enough,” {name} says. “I never once said it. I will now.”',
      },
      finish: {
        label: '“{lost} is hurting children. Stop it for good.”',
        reply: '“Yes,” {name} says, very low. “The children first.”',
      },
      appears:
        '{lost} is waiting in the empty pit, bare hands taped, scarred, strong. “Sensei,” {lost} says, and smiles a terrible smile. “Again?”',
      spared:
        '{lost} sits in the dirt of the pit. {name} kneels down beside them and says, “It was enough. It was always enough.” {lost} cries like a child, and {name} holds on.',
      ended:
        '{lost} doesn’t get up. {name} unwraps the tape from {lost}’s hands, one finger at a time, and sends the pit’s children home.',
      home: 'Home, with the children of the pit walking behind you.',
    },
  },
};
