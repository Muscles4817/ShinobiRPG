import type { ConversationDef } from '../../../types';

/** Talk about someone’s art, from first meetings to friendship. */
export const SPECIALTY_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-specialty-0-watch',
    minStage: 0,
    about: 'specialty',
    opener: {
      blunt:
        'You find {them} at the training ground, {practice}, and {them.they} {them.does}n’t stop for you or for anyone.',
      warm: 'You find {them} hard at work, {practice}. {them.they} look{them.s} up when you come near, and the look says you’re welcome to watch.',
      wry: '{them} is at it again, {practice}, and when {them.they} see{them.s} you watching {them.they} put{them.s} a little extra into it, as if you were a crowd.',
      formal:
        'You find {them} hard at work, {practice}. {them.they} finish{them.es} the set before acknowledging you, and only then lower{them.s} {them.their} hands.',
    },
    choices: [
      {
        label: '“That’s good form.”',
        tone: 'praise',
        reply: {
          blunt: '“It’s {art}, so form is most of it,” {them} says without stopping.',
          warm: '“Thank you. With {art}, form is most of it,” {them} says, still counting under {them.their} breath.',
        },
        warm: "{them} finishes the set before {them.they} answer{them.s}, and you can tell {them.they}{them.'s} pleased. “You noticed? Most people only watch my feet.”",
        cool: '“Is it?” {them} doesn’t look round. Praise from a stranger seems to make {them.them} work harder, not softer.',
      },
      {
        label: '“Looks easy enough.”',
        tone: 'challenge',
        reply: {
          blunt: '“Then you try it.” {them} steps aside and waits.',
          warm: '“Would you like to try it?” {them} steps aside to make room for you.',
        },
        warm: '“Then you try it,” {them} says, already stepping aside, and looks delighted when you take the bait.',
        cool: '“Does it?” {them} goes back to work as if you had walked on by.',
      },
      {
        label: '“How long do you keep that up?”',
        tone: 'curious',
        reply: {
          blunt: '“Until it’s right,” {them} says, and carries on.',
          warm: '“Until it feels right, and some days that’s a long while,” {them} says, and carries on.',
        },
        warm: '“Until it’s right, and then a while longer, in case it was luck.” {them} counts the next one out loud so you can hear how far there is to go.',
        cool: '“Until people stop asking me questions,” {them} says, and carries on.',
      },
    ],
  },
  {
    id: 'talk-specialty-1-advice',
    minStage: 1,
    about: 'specialty',
    opener: {
      blunt:
        '{them} watches you train for as long as {them.they} can stand it. “You’re doing that wrong. Want me to tell you about {art}, or not?”',
      warm: '{them} watches you train, and in the end can’t help it. “Can I tell you something about {art}? Only if you want.”',
      wry: '{them} watches you train with the face of someone holding back a sneeze. “I have a thing to say about {art}. It’ll go better for both of us if I say it.”',
      formal:
        '{them} waits until you have finished the drill. “If you’ll allow me, I have a piece of advice about {art}.”',
    },
    choices: [
      {
        label: '“Please. I want to get better.”',
        tone: 'earnest',
        reply: {
          blunt:
            '“{advice}” {them.they} say{them.s} it the way it was said to {them.them}, word for word.',
          warm: '“{advice}” {them.they} say{them.s} it gently, the way someone once said it to {them.them}.',
        },
        warm: "{them} sits on the fence rail, as if this might take a while and {them.they}{them.'s} glad of it. “{advice}”",
        cool: '“You and everyone else.” {them} sounds unconvinced, but tells you anyway. “{advice}”',
      },
      {
        label: '“Is this going to take long?”',
        tone: 'tease',
        reply: {
          blunt: '“Not if you listen.” {them.they} tell{them.s} you anyway. “{advice}”',
          warm: '“Only as long as you let it.” {them.they} tell{them.s} you anyway. “{advice}”',
        },
        warm: '“It will now you’ve asked.” {them} laughs and makes you hold your stance while {them.they} say{them.s} it. “{advice}”',
        cool: '“Forget I offered, then.” {them} turns away, and only when you call after {them.them} {them.does} {them.they} give it to you, flatly. “{advice}”',
      },
      {
        label: 'Wait for it.',
        tone: 'quiet',
        reply: {
          blunt: '{them} takes your silence as a yes. “{advice}”',
          warm: '{them} smiles at your patience and takes it as a yes. “{advice}”',
        },
        warm: '{them} seems to like that you didn’t fill the gap. {them.they} lower{them.s} {them.their} voice. “{advice}”',
        cool: '“Well? Do you want to hear it or not?” {them} gives up on the pause. “{advice}”',
      },
    ],
  },
  {
    id: 'talk-specialty-1-daily',
    minStage: 1,
    about: 'specialty',
    opener: {
      blunt:
        '“People think {art} is talent,” {them} says. “It’s {practice}. Do that long enough and you stop noticing you’re doing it.”',
      warm: '“People think you need a gift for {art},” {them} says. “I think what you need is {practice}, every day, until it’s part of you.”',
      wry: '“Everyone says I’m gifted at {art},” {them} says. “My gift is {practice}. Very glamorous, as gifts go.”',
      formal:
        '“It is often said that {art} is a matter of talent,” {them} says. “In my experience it is {practice}, kept up until it becomes second nature.”',
    },
    choices: [
      {
        label: '“That explains why you’re so good.”',
        tone: 'praise',
        reply: {
          blunt: '“It explains why I’m not worse.” {them} goes back to the drill.',
          warm: '“It explains why I’m not worse, anyway.” {them} goes back to the drill, a little brighter.',
        },
        warm: '{them} tries to wave it off and fails, and stands a little straighter for the rest of the set.',
        cool: '“You don’t know if I’m good. You’ve watched me for a minute.”',
      },
      {
        label: '“Every day? Even festival days?”',
        tone: 'joke',
        reply: {
          blunt: '“Especially festival days, when nobody else is training.”',
          warm: '“Especially festival days. I have the whole ground to myself, and the stalls are still open after.”',
        },
        warm: '“Especially festival days,” {them} says, laughing. “The ground’s empty and the food stalls are open after.”',
        cool: '“Yes, I train on festival days.” It clearly isn’t funny to {them.them}.',
      },
      {
        label: '“Talent helps, though.”',
        tone: 'challenge',
        reply: {
          blunt: '“Then talent can do the drills too.”',
          warm: '“It helps you start. It doesn’t do the drills for you.”',
        },
        warm: '“Then talent can do the drills too,” {them} says, and {them.their} eyes light up at the argument. “Go on, tell me who you’re thinking of.”',
        cool: '{them} stops. “That’s what people say when they want a reason not to start.”',
      },
    ],
  },
  {
    id: 'talk-specialty-1-opinion',
    minStage: 1,
    about: 'specialty',
    opener: {
      blunt:
        '{them} scowls at two genin sparring nearby. “Look at them. Everyone who tries {art} wants the flashy part and skips the rest.”',
      warm: '{them} watches two genin sparring nearby and winces for them. “They’ll get hurt like that. People come to {art} for the flashy part and skip the rest.”',
      wry: '{them} watches two genin sparring nearby. “Ten moves in and neither of them has blocked once. That’s {art} as most people want it, all flash and no rest.”',
      formal:
        '{them} observes two genin sparring nearby. “Most who take up {art} want only the impressive part. They neglect the rest, and it shows.”',
    },
    choices: [
      {
        label: '“What’s the rest?”',
        tone: 'curious',
        reply: {
          blunt: '“The dull part, which is the part that keeps you alive.”',
          warm: '“The dull part. I’m afraid it’s also the part that keeps you alive.”',
        },
        warm: '“You really want to know?” {them} talks for a good while about patience and repetition and the hundred small habits that keep a person alive, as if nobody has asked {them.them} in years.',
        cool: '“If you have to ask, you’re one of them.”',
      },
      {
        label: '“Says the one who loves showing off.”',
        tone: 'tease',
        reply: {
          blunt: '“I’ve earned my showing off,” {them} says, unbothered.',
          warm: '“I’ve earned a little showing off, I think,” {them} says, unbothered.',
        },
        warm: '“I’ve earned my showing off.” {them} laughs and shoves your shoulder. “You’ll get yours one day.”',
        cool: '{them}’s face closes. “I don’t show off,” {them.they} say{them.s}, and watch{them.es} the spar instead of you.',
      },
      {
        label: '“I don’t want to skip anything.”',
        tone: 'earnest',
        reply: {
          blunt: '“Good, then you might actually get somewhere.”',
          warm: '“I’m glad. Then you might actually get somewhere.”',
        },
        warm: '{them} looks at you properly for the first time. “Then come by in the morning and I’ll show you the dull part.”',
        cool: '“I said that too, at first.” {them} doesn’t sound as if {them.they} believe{them.s} you.',
      },
    ],
  },
];
