import type { DailyBank, DailyLine } from './tell';

/** Foraging and fishing: how the search went, and how the water was. */

const FORAGE_SEASONS: readonly DailyLine[] = [
  {
    when: 'spring',
    text: 'Everything is coming up green at once, and the trick is telling what’s good to eat from what only looks it.',
  },
  {
    when: 'autumn',
    text: 'The ground is deep in fallen leaves, and you turn over a great many of them before you find anything.',
  },
  {
    when: 'winter',
    text: 'Most things have died back or gone under, and what you find you have to dig for.',
  },
  {
    when: 'summer',
    text: 'The undergrowth is thick and buzzing, and you come out scratched to the elbows.',
  },
];

export const FORAGE_SHARP: DailyBank = {
  name: 'forage-sharp',
  lines: [
    {
      text: 'You go slowly and look closely, and the ground gives up more than most would see.',
    },
    {
      text: 'You notice what grows near what, follow it, and find a second patch nobody has picked.',
    },
    { text: 'Under the first lot there’s more, half hidden, and you take that too.' },
    ...FORAGE_SEASONS,
  ],
};

export const FORAGE_PLAIN: DailyBank = {
  name: 'forage-plain',
  lines: [
    { text: 'You search until your knees are muddy and come back with a handful.' },
    { text: 'Someone has been through before you, and you have to work for what’s left.' },
    { text: 'You find enough, though it takes longer than you’d like.' },
    ...FORAGE_SEASONS,
  ],
};

export const FISH_BITE: DailyBank = {
  name: 'fish-bite',
  lines: [
    {
      text: 'You sit still long enough for the water to forget you, and the line goes tight.',
    },
    {
      text: 'The float twitches, goes under, and you’re on your feet before you’ve thought about it.',
    },
    {
      text: 'It takes a long time. Just as you’re thinking of packing up, the rod bends and you nearly drop it.',
    },
    {
      when: 'morning',
      text: 'Mist lies flat on the water when you cast, and the first bite comes before it lifts.',
    },
    {
      when: 'evening',
      text: 'The fish start rising as the light goes, and one of them is careless.',
    },
    {
      when: 'night',
      text: 'You fish by feel in the dark, and the tug on the line is the first you know of it.',
    },
  ],
};

export const FISH_NOTHING: DailyBank = {
  name: 'fish-nothing',
  lines: [
    { text: 'You fidget, the float never dips, and you go home with wet feet.' },
    { text: 'A fish nibbles twice and is gone. After that, nothing at all.' },
    { text: 'You watch the float until your eyes ache, and the fish stay wherever they are.' },
    {
      when: 'morning',
      text: 'Mist lies flat on the water and takes a long while lifting. Nothing bites while it’s there, or after.',
    },
    {
      when: 'evening',
      text: 'The fish rise all evening, just out of reach, and not one of them looks at your hook.',
    },
    { when: 'night', text: 'You fish by feel in the dark and feel nothing but the cold.' },
  ],
};
