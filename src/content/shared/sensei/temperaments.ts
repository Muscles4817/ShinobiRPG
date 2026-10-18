import type { SenseiTemperament } from '../../senseiParts';

/**
 * How generated senseis talk and teach (`senseiParts.ts`). Each is one kind of person, written
 * so that every line could only be theirs: the style on the team card, the weekly lesson, who
 * they are before you know their past, and what they say when the work is done, or isn't, or
 * when there is only a fire to talk to. `{name}` is their given name (with every pronoun form: `{name.their}`,
 * `{name.s}`), `{art}` their specialty.
 */
export const SENSEI_TEMPERAMENTS: readonly SenseiTemperament[] = [
  {
    id: 'iron-bell',
    archetype: 'drillmaster',
    style:
      'Counts everything out loud: laps, blows, breaths. Never loses count, never lets you stop short.',
    lesson:
      '{name} counts you through the {art} forms until the count is all there is, then starts again from one.',
    bio: 'A jōnin who rings a hand bell to start the day and another to end it. The village sets its clocks by {name}.',
    favouredTraits: ['diligent', 'tireless'],
    traits: ['diligent', 'tireless'],
    quirk: 'harsh',
    haunt: 'onsen',
    voice: {
      praise: '“That was the number I asked for,” {name} says. “Not one short. Good.”',
      scold:
        '“You stopped short,” {name} says. “Everyone stops short. That is why everyone is ordinary.”',
      catchphrase: 'Again, from one.',
      fireside: [
        '{name} counts the stars over the fire under {name.their} breath, loses count, and starts again, and does not seem to mind.',
        '“I rang the bell for my own sensei every morning for a year,” {name} says. “He never once said thank you. I think that was the lesson.”',
      ],
    },
  },
  {
    id: 'quiet-blade',
    archetype: 'drillmaster',
    style: 'Says almost nothing. Shows you once, watches you do it a hundred times, nods once.',
    lesson:
      '{name} shows you the {art} form once, slowly, and then watches without a word until you have it.',
    bio: 'A jōnin of very few words, who seems to hear everything. People lower their voices around {name} without knowing why.',
    favouredTraits: ['focused', 'calm'],
    traits: ['calm', 'focused'],
    quirk: 'patient',
    haunt: 'home',
    voice: {
      praise:
        '{name} looks at your work for a long moment, and nods once. From {name}, it is a speech.',
      scold: '{name} says nothing at all, which is worse than anything {name} could have said.',
      catchphrase: 'Show me.',
      fireside: [
        '{name} sharpens a kunai by the fire until it sings, and then, without looking up, tells you the name of the smith who made it, and that the smith is dead.',
        'For a long time {name} only watches the fire. Then: “Talking is how people hide what they think.” Then nothing else all night.',
      ],
    },
  },
  {
    id: 'chess-player',
    archetype: 'strategist',
    style:
      'Answers every question with a better one. Plays three games of go at once and wins all of them.',
    lesson:
      '{name} sets out the {art} drills like pieces on a board and asks you, before every one, what you think it is for.',
    bio: 'A jōnin with a travelling go board and a habit of leaving games half-played all over the village, to be finished later, by memory.',
    favouredTraits: ['curious', 'cunning'],
    traits: ['cunning', 'calm'],
    quirk: 'natural',
    haunt: 'library',
    voice: {
      praise:
        '“You saw the move before I showed you,” {name} says. “That is the only thing I cannot teach.”',
      scold: '“You did what was easy,” {name} says. “Now tell me why it was the wrong move.”',
      catchphrase: 'What is it for?',
      fireside: [
        '{name} lays out a game of stones in the dirt by the fire and plays both sides. One side always wins. {name} says it is the side that waited.',
        '“My sensei could see ten moves ahead,” {name} says. “It didn’t save her. She forgot that the board has people on it.”',
      ],
    },
  },
  {
    id: 'big-sibling',
    archetype: 'guardian',
    style: 'Worries about you out loud. Checks your bandages, your pack and whether you ate.',
    lesson:
      '{name} works you hard at {art}, then makes you stop, drink water and show your hands before you go home.',
    bio: 'A jōnin the younger genin all run to with their scrapes. {name} always has a roll of bandages and a sweet bean bun in a pocket.',
    favouredTraits: ['kind', 'humble'],
    traits: ['kind', 'diligent'],
    quirk: 'patient',
    haunt: 'market',
    voice: {
      praise: '“Look at you,” {name} says, and ruffles your hair whether you like it or not.',
      scold:
        '“I’m not angry,” {name} says. “I just need to know you’ll be all right when I’m not there.”',
      catchphrase: 'Did you eat?',
      fireside: [
        '{name} goes round the fire making sure everyone has a blanket, and only sits down when the last one is warm.',
        '“I had a little sister,” {name} says, poking the fire. “She hated being fussed over. I did it anyway. I’m still doing it, I suppose.”',
      ],
    },
  },
  {
    id: 'cook',
    archetype: 'gourmand',
    style: 'Teaches the way a cook teaches: by feel, by taste, with a pot always on the boil.',
    lesson:
      '{name} drills you at {art} between stirring a pot, and says a technique is like a broth: you know it is right by the smell.',
    bio: 'A jōnin who runs missions with a cooking pot strapped to the pack. Clients remember {name}’s food long after they forget the job.',
    favouredTraits: ['brash', 'curious'],
    traits: ['kind', 'brash'],
    quirk: 'natural',
    haunt: 'tavern',
    voice: {
      praise:
        '“Now that,” {name} says, “is seasoned right.” And there is a second helping for you that night.',
      scold: '“Undercooked,” {name} says. “Back on the fire with you.”',
      catchphrase: 'Eat first. Then we talk.',
      fireside: [
        '{name} cooks for the whole crew over the fire and won’t let anyone help, and won’t let anyone leave a grain of rice.',
        '“The best meal I ever had was a burnt fish on a cold night with people I’d die for,” {name} says. “I’ve been trying to cook it again ever since.”',
      ],
    },
  },
  {
    id: 'showboat',
    archetype: 'prodigy',
    style: 'Brilliant, vain and loud about both. Will show you anything, mostly to show off.',
    lesson:
      '{name} shows you the {art} technique three ways, each more dazzling than the last, then dares you to do the first.',
    bio: 'A jōnin who made the rank absurdly young and has never let anyone forget it. Signs autographs nobody asked for.',
    favouredTraits: ['proud', 'brash'],
    traits: ['proud', 'brash'],
    quirk: 'natural',
    haunt: 'tavern',
    voice: {
      praise: '“Not bad,” {name} says. “I did it younger, of course. But not bad at all.”',
      scold:
        '“Boring,” {name} says. “If you’re going to fail, at least fail in a way worth watching.”',
      catchphrase: 'Watch closely. I won’t do it twice. I might do it three times.',
      fireside: [
        '{name} tells the crew about the time {name.they} beat three chūnin at once, blindfolded. The story is better every time. Nobody minds.',
        '“Everyone thinks I like being looked at,” {name} says, quieter than usual. “I just never learned what to do when nobody is.”',
      ],
    },
  },
  {
    id: 'lazy-genius',
    archetype: 'eccentric',
    style: 'Late, asleep, or both. Then, once in a while, says the one thing you needed to hear.',
    lesson:
      '{name} turns up halfway through the {art} lesson with a fishing rod, watches for a minute, and fixes the one thing that was wrong.',
    bio: 'A jōnin usually found asleep under a tree with a book over the face. The book is never about what anyone expects: beekeeping, tides, the history of spoons.',
    favouredTraits: ['curious', 'lazy'],
    traits: ['lazy', 'cunning'],
    quirk: 'distracted',
    haunt: 'wilds',
    voice: {
      praise:
        '{name} opens one eye. “Huh. You actually did it.” And then, after a while: “Well done.”',
      scold:
        '“I’m not going to tell you off,” {name} yawns. “You already know. That’s worse, isn’t it?”',
      catchphrase: 'Wake me when it matters.',
      fireside: [
        '{name} falls asleep sitting up by the fire, and wakes the instant a twig snaps in the dark, kunai already in hand. Then goes back to sleep.',
        '“I worked very hard once,” {name} says, looking at the stars. “Harder than anyone. Then I found out what it was for. I’ve been resting since.”',
      ],
    },
  },
  {
    id: 'old-soldier',
    archetype: 'old-hand',
    style:
      'Has seen a war and talks about it only sideways. Teaches you to stay alive first and win second.',
    lesson:
      '{name} runs you through {art} the way it is done when you are tired, hungry and someone is trying to kill you.',
    bio: 'A grey jōnin with a limp that comes and goes with the weather. Knows every road in the country by the places to hide on it.',
    favouredTraits: ['humble', 'tireless'],
    traits: ['calm', 'humble'],
    quirk: 'harsh',
    haunt: 'tavern',
    voice: {
      praise: '“You’d have lived,” {name} says. From {name}, there is no higher praise.',
      scold:
        '“In the war, that would have been the last thing you did,” {name} says. “Do it again.”',
      catchphrase: 'Stay alive first.',
      fireside: [
        '{name} builds the fire small and low and in a hollow, out of old habit, and tells you which way to run if anyone comes.',
        '“We sang in the war,” {name} says. “Terrible songs. You’d think you’d forget them.” {name} hums a few bars, and stops.',
      ],
    },
  },
  {
    id: 'mystic',
    archetype: 'eccentric',
    style:
      'Speaks in riddles and silences. Has you meditate under waterfalls and listen to stones.',
    lesson:
      '{name} has you sit still for an hour before any {art}, and says the technique was already in the stillness, waiting.',
    bio: 'A jōnin who talks to the shrine’s cats and is answered. The priests ask {name}’s advice and pretend they don’t.',
    favouredTraits: ['curious', 'focused'],
    traits: ['curious', 'calm'],
    quirk: 'distracted',
    haunt: 'wilds',
    voice: {
      praise: '“The river found its way,” {name} says, which seems to mean well done.',
      scold: '“You were somewhere else,” {name} says. “Come back, and we will begin.”',
      catchphrase: 'Be where your feet are.',
      fireside: [
        '{name} stares into the fire so long the crew stops talking. “Someone is thinking of us,” {name} says at last. Nobody asks who.',
        '“When I was small I could hear the trees,” {name} says. “I still can. They mostly complain about the weather.”',
      ],
    },
  },
  {
    id: 'scholar',
    archetype: 'guardian',
    style:
      'A former academy instructor who still teaches like one: patiently, thoroughly, from the very beginning.',
    lesson:
      '{name} takes the {art} technique apart into its smallest pieces and has you build it again, piece by piece, until you understand it.',
    bio: 'A jōnin who taught at the academy for years and still corrects the grammar on mission reports. Has a notebook on every genin {name.they} ever taught.',
    favouredTraits: ['diligent', 'focused'],
    traits: ['humble', 'focused'],
    quirk: 'patient',
    haunt: 'library',
    voice: {
      praise: '“That goes in the notebook,” {name} says, and writes it down in front of you.',
      scold:
        '“We’ll go back to the beginning,” {name} says, without a trace of impatience. “The beginning is where it went wrong.”',
      catchphrase: 'From the beginning.',
      fireside: [
        '{name} reads by the firelight with a pencil, making notes in the margin of a book that already has notes in every margin.',
        '“I have every one of my students in here,” {name} says, tapping the notebook. “Some of them are only in here, now.”',
      ],
    },
  },
];
