import type { SenseiSpeech } from '../../senseiSpeech';

/**
 * How every sensei's week sounds (`senseiSpeech.ts`): sessions by format, sign-offs by how they
 * give feedback, and the notes the morning brings. Written to the style guide in
 * `docs/design/prose-plan.md`: sentences that run on when the moment does, no moral at the end.
 */
export const SENSEI_SPEECH: SenseiSpeech = {
  sessions: {
    drill: [
      '{name} drills you on the basics until they stop feeling like basics.',
      '{name} takes you through the same three forms over and over, fixing a wrist here and a heel there.',
      '{name} sets you a drill you learned at the academy and shows you how much of it you had wrong.',
    ],
    spar: [
      '{name} spars with you and makes every opening you leave cost you something.',
      '{name} gives you a bout at half speed and then another at full, and your ribs notice the difference.',
      '{name} spars with one hand tucked behind {name.their} back and still puts you on the ground twice.',
    ],
    'team-drill': [
      '{name} runs the team through formations until the three of you stop getting in each other’s way.',
      '{name} has the team pass a signal down the line at a run, again and again, until nobody drops it.',
      '{name} splits the team and sends you after the other two, then swaps the sides round when you catch them.',
    ],
    field: [
      '{name} takes you out past the walls to read the ground, and makes you say what passed there and when.',
      '{name} walks you along the edge of the woods pointing out tracks you would have stepped on.',
      '{name} hides a marker in the scrub outside the gate and waits, arms folded, while you look for it.',
    ],
    theory: [
      '{name} draws it in the dirt with a stick and makes you explain it back.',
      '{name} sits you down with a scroll and asks about it until you have to admit which parts you skipped.',
      '{name} talks you through a fight from years ago, stopping every so often to ask what you would have done.',
    ],
    meditation: [
      '{name} has you sit still until your chakra settles like a pond after rain.',
      '{name} sits beside you with {name.their} eyes shut, and every time your mind wanders {name.they} somehow know{name.s}.',
      '{name} has you breathe with a hand on your stomach until the chakra under it stops jumping about.',
    ],
    march: [
      '{name} marches you over the hills with a full pack and no complaining allowed.',
      '{name} sets a pace up the hill road that you can just about keep, and lifts it as soon as you can.',
      '{name} loads your pack with stones and walks beside you carrying nothing, talking about the weather.',
    ],
    review: [
      '{name} goes through your last fight with you, blow by blow.',
      '{name} has you tell the story of your last fight and then tells it back the way it really went.',
      '{name} picks one moment from your last fight and spends the whole session on it.',
    ],
  },
  signOffs: {
    blunt: [
      '“Same again tomorrow, and I want it cleaner,” {name} says, already walking off.',
      '{name} tells you that you were slow on the last few, which you were, and lets you go.',
      '“You dropped your elbow every time you got tired,” {name} says. “Fix that before I see you next.”',
      '“That’ll do for today. Go and eat before you fall over.”',
      '“Better than yesterday,” {name} says, as if that were the least anyone could ask of you.',
    ],
    warm: [
      '“You stuck with it when it got hard,” {name} says. “I saw that, you know.”',
      '{name} walks you as far as the gate, asking how you are sleeping and whether your hands still hurt.',
      '“That was good work, and I’m not saying it to be kind,” {name} says.',
      '{name} hands you water before you think to ask for it and tells you to rest your legs tonight.',
      '“You’re getting there faster than you think,” {name} says. “Be a bit patient with yourself.”',
    ],
    socratic: [
      '“Why did the last one work when the first ones didn’t?” {name} asks. “Don’t tell me now. Tomorrow.”',
      '{name} lets you go with a question about your footing that you are still turning over at dinner.',
      '“What would you change if we did it again?” {name} asks, and waits until you have an answer.',
      '“Halfway through it got easier, and you felt it,” {name} says. “What changed?”',
      '{name} asks what you think today was for, listens to the whole answer, and doesn’t say whether it was right.',
    ],
    competitive: [
      '“Not bad,” {name} says. “I had that down a year younger than you, but not bad.”',
      '{name} runs the whole set once more on the way out, faster than you managed it, so that you see.',
      '“Tomorrow I’m timing you,” {name} says, “and then we’ll find out who gets to be smug.”',
      '“Keep that up and one day you might give me a proper workout,” {name} says.',
      '{name} mentions, quite casually, that a genin on another team did that in half the time.',
    ],
    cryptic: [
      '“The river doesn’t argue with the stone,” {name} says, and leaves you to work out which one you were.',
      '{name} picks a pebble off the ground, puts it in your hand and walks away without explaining it.',
      '“Today you were heavy,” {name} says. “Tomorrow, try being light, and see what happens.”',
      '{name} watches the clouds for a while and then says you may go, as if they had told {name.them} so.',
      '“Half of you was in your feet and the other half was somewhere else,” {name} says. “Bring both tomorrow.”',
    ],
  },
  late: [
    '{name} turns up late.',
    '{name} arrives well after the time {name.they} set, and offers no excuse at all.',
    'You wait a good while before {name} comes strolling up as if {name.they} were early.',
  ],
  missed: {
    tight: [
      '{name} waited for you at {place} until dark yesterday, and from the look on {name.their} face this morning you will be hearing about it for some time.',
      'You missed {what} yesterday. {name} stood at {place} for hours, and has already told two people about it.',
      '{name} came looking for you after you missed {what} yesterday and didn’t find you, which seems to have made it worse.',
    ],
    firm: [
      '{name} waited at {place} yesterday and you didn’t come. {name.they} {name.has}n’t said anything about it, yet.',
      'You missed {what} yesterday. When you pass {name} this morning, {name.they} look{name.s} at you a moment too long.',
      '{name} gave up waiting for you at {place} yesterday and went home, and {name.they}’ll remember that.',
    ],
    loose: [
      '{name} shrugged when you didn’t turn up yesterday, but {name.they} noticed.',
      'You missed {what} yesterday. {name} didn’t make anything of it, which isn’t quite the same as not minding.',
      '{name} waited a little while at {place} yesterday, then wandered off to see to other things.',
    ],
  },
  teamAlso: [
    'Later the team went on to {ritual} without you as well.',
    'The others had {ritual} with {name.them} in the afternoon, and your place stayed empty.',
  ],
  teamMissed: [
    '{name} and the team went on to {ritual} without you yesterday.',
    'Your teammates had {ritual} with {name} yesterday, and they will tell you all about it whether you ask or not.',
  ],
  expects: [
    '{name} wants you at {place} {when}, {for}.',
    '{name} will be at {place} {when}, expecting you {for}.',
    '{name} has asked for you at {place} {when}, {for}.',
  ],
  meetingNames: {
    lesson: 'your lesson',
    drill: 'drills',
    spar: 'sparring',
    'team-drill': 'team drills',
    field: 'fieldcraft',
    theory: 'theory',
    meditation: 'meditation',
    march: 'the march',
    review: 'the review',
  },
  meetingFor: {
    lesson: 'for your lesson',
    drill: 'for drills',
    spar: 'to spar',
    'team-drill': 'for team drills',
    field: 'for fieldcraft',
    theory: 'for theory',
    meditation: 'to sit and meditate',
    march: 'for a march',
    review: 'to go over your last fight',
  },
  ritualNames: {
    meal: 'the team meal',
    challenge: 'the contest',
    tea: 'tea',
    debrief: 'the debrief',
    camp: 'the night’s camp',
  },
};
