import type { ConversationTopic } from '../../../types';

/** What a person’s specialty gives templated talk: how they train it, and how they feel about it. */
export const SPECIALTY_TOPICS: readonly ConversationTopic[] = [
  {
    kind: 'specialty',
    key: 'taijutsu',
    values: {
      art: 'taijutsu',
      practice: 'a thousand kicks at the post, until the bark is worn smooth at shin height',
      pride:
        '{them.they} once held a guard stance through a whole storm while the rest of the class ran for cover.',
      doubt:
        '{them.they} {them.is} afraid {them.their} feet will always be half a step slower than {them.their} fists.',
      dream: 'a kick fast enough to put out a candle without touching the wick',
      advice: 'Breathe out when you strike. Hold your breath and you hit like a closed door.',
      keepsake: 'a roll of hand wraps, washed so often the blood has faded to brown',
    },
  },
  {
    kind: 'specialty',
    key: 'ninjutsu',
    values: {
      art: 'ninjutsu',
      practice: 'hand signs under the table at every meal, faster each day, until the cups rattle',
      pride:
        '{them.they} made a clone so steady that {them.their} own teacher handed it a scroll and walked away.',
      doubt:
        'It worries {them.them} that {them.their} reserves will run dry in the one fight where {them.they} cannot afford it.',
      dream: 'a technique made from nothing, with a name nobody has written down before',
      advice:
        'Learn the signs with your eyes shut. In a real fight you will be looking at the enemy, not your hands.',
      keepsake: 'a scorched practice tag from the first time a jutsu actually worked',
    },
  },
  {
    kind: 'specialty',
    key: 'genjutsu',
    values: {
      art: 'genjutsu',
      practice:
        'counting the breaths of strangers in the market and matching them, one by one, without being noticed',
      pride:
        '{them.they} once kept a whole patrol walking in circles for an hour, and not one of them ever found out.',
      doubt:
        '{them.they} fear{them.s} the day {them.they} meet{them.s} a mind too steady to bend, and {them.has} nothing else to fall back on.',
      dream: 'an illusion so gentle that the person inside it never wants to wake',
      advice: 'People see what they expect to see. Your job is only to find out what they expect.',
      keepsake:
        'a small brass bell {them.they} ring{them.s} to break {them.their} own illusions when practice runs late',
    },
  },
  {
    kind: 'specialty',
    key: 'kenjutsu',
    values: {
      art: 'kenjutsu',
      practice: 'the same three cuts through falling leaves, morning after morning',
      pride:
        '{them.they} split a thrown apple in mid-air at {them.their} first lesson, and the teacher made {them.them} do it again to be sure.',
      doubt:
        '{them.they} {them.is} afraid that one day the blade will be faster than {them.their} judgement of where to stop it.',
      dream: 'a draw so quick the sword is back in the sheath before anyone hears it leave',
      advice:
        'Look after the edge and the edge looks after you. Oil it every night, even when you are tired.',
      keepsake: 'a worn whetstone, dipped in the middle from years of patient strokes',
    },
  },
  {
    kind: 'specialty',
    key: 'fuuinjutsu',
    values: {
      art: 'fūinjutsu',
      practice: 'the same seal written a hundred times on cheap paper before breakfast',
      pride:
        '{them.they} sealed a runaway fire into a scroll the size of a hand, and the scroll is still warm.',
      doubt:
        '{them.they} lie{them.s} awake wondering whether a seal {them.they} wrote years ago has started, quietly, to fail.',
      dream: 'a seal that will hold for a hundred years after the hand that wrote it is gone',
      advice:
        'Never rush the last stroke. A seal is only as strong as the line you were tired of writing.',
      keepsake: 'a brush with a bamboo handle, its bristles trimmed to a fine point by hand',
    },
  },
];
