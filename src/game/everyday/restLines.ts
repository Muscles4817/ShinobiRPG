import type { DailyBank, DailyLine } from './tell';

/**
 * Naps and nights. A nap's bank is all handler words; a night's sleep adds the setting's own
 * night sounds (`SettingText.sleepWell`) to the general lines here, and a hungry night says so.
 */

export const NAP_LINES: DailyBank = {
  name: 'nap',
  lines: [
    { text: 'You put the kettle on and doze off before it boils.' },
    {
      text: 'You lie down meaning to rest your eyes for a moment, and wake up with the light somewhere else entirely.',
    },
    { text: 'You sleep for an hour on top of the covers, still in your sandals.' },
    {
      text: 'It takes a while to stop going over the day. Once you do, you sleep hard and wake up hungry.',
    },
    {
      when: 'morning',
      text: 'You go back to bed for an hour, which feels like getting away with something, and does you good.',
    },
    {
      when: 'afternoon',
      text: 'You sleep through the hottest part of the day while the street outside goes quiet.',
    },
    {
      when: 'evening',
      text: 'You doze in your clothes while the neighbours start on their suppers, and wake to the smell of it.',
    },
    {
      when: 'night',
      text: 'You lie down in the dark for a bit and wake with no idea how late it is.',
    },
    {
      when: 'hungry',
      text: 'Hunger wakes you before you’ve rested much, though a little is better than none.',
    },
    {
      when: 'winter',
      text: 'You nap under every blanket you own, with your feet tucked up against the cold.',
    },
    {
      when: 'festival',
      text: 'The festival is loud even through the shutters, but you’re tired enough to sleep through it.',
    },
  ],
};

const NIGHT_LINES: readonly DailyLine[] = [
  { text: 'You’re asleep almost before you’ve lain down, and you don’t stir until morning.' },
  { text: 'You wake once in the night, listen to the house settle, and drift off again.' },
  { text: 'You dream about the day’s work and wake stiff in the legs but clear in the head.' },
  {
    when: 'winter',
    text: 'The cold finds every gap in the blankets, but you sleep through it in the end.',
  },
  {
    when: 'summer',
    text: 'It’s too warm to sleep at first. Some time after midnight the air cools and you finally drop off.',
  },
  { when: 'spring', text: 'Rain on the roof half the night, and you sleep the better for it.' },
  { when: 'autumn', text: 'The nights are drawing in, and you sleep long and deep.' },
  {
    when: 'festival',
    text: 'The festival goes on late outside your window, and you fall asleep to the last of it.',
  },
  { when: 'hungry', text: 'Hunger keeps you turning over half the night.' },
  {
    when: 'hungry',
    text: 'You dream about food, wake, and lie listening to your stomach until you drift off again.',
  },
];

/** A night's bank: the general lines, the setting's night sounds and its hungry line. */
export function nightLines(setting: {
  readonly sleepWell: readonly string[];
  readonly sleepHungry: string;
}): DailyBank {
  return {
    name: 'sleep',
    prefer: ['hungry'],
    lines: [
      ...NIGHT_LINES,
      ...setting.sleepWell.map((text) => ({ text })),
      { when: 'hungry', text: setting.sleepHungry },
    ],
  };
}
