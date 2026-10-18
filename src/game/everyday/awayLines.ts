import type { DailyBank } from './tell';

/**
 * A soak in hot water and a night in a rented room: by the hour and the season, so the baths
 * in winter don't read like the baths in summer. `{them}` is whoever soaks beside you.
 */

export const SOAK_ALONE: DailyBank = {
  name: 'soak',
  lines: [
    { text: 'You sink into the water up to your chin and let the day go out of your shoulders.' },
    { text: 'You find a corner to yourself and stay in until your fingers wrinkle.' },
    {
      text: 'An old man at the far end hums the same few bars over and over, and after a while you stop minding.',
    },
    {
      when: 'winter',
      text: 'Snow settles on the rocks around the pool and melts the moment it touches the water.',
    },
    {
      when: 'summer',
      text: 'It’s almost too hot for it, and you spend as long sitting on the edge as in the water.',
    },
    {
      when: 'autumn',
      text: 'A maple leaf drifts down onto the water and turns slowly in front of you the whole time.',
    },
    { when: 'spring', text: 'Rain patters on the water, and you don’t care in the least.' },
    {
      when: 'evening',
      text: 'The light goes while you soak, and someone comes round to hang the lamps.',
    },
  ],
};

export const SOAK_WITH: DailyBank = {
  name: 'soak-with',
  lines: [
    {
      text: 'You sink into the water beside {them}. Steam, the drip from the eaves, and now and then a word between you.',
    },
    {
      text: '{them} sighs as {them.they} settle{them.s} in, and for a long while neither of you bothers to talk.',
    },
    {
      text: 'You and {them} trade a few words about the week and then let the water do the rest.',
    },
    {
      when: 'winter',
      text: 'Snow falls on your heads while the rest of you stays warm, and {them} laughs at the look of you.',
    },
    {
      when: 'evening',
      text: 'You and {them} stay in until the lamps are lit, talking about nothing much.',
    },
  ],
};

export const INN_NIGHTS: DailyBank = {
  name: 'inn',
  prefer: ['hungry'],
  lines: [
    { text: 'You sleep in a rented room, to the creaks and voices of a strange house.' },
    {
      text: 'The bed is narrower than yours and the pillow harder, but you sleep well enough.',
    },
    {
      text: 'Someone in the next room snores until the small hours. You sleep in spite of them.',
    },
    { when: 'winter', text: 'The innkeeper has left an extra quilt, and you’re glad of it.' },
    {
      when: 'summer',
      text: 'You leave the shutter open for the air and fall asleep to strangers talking in the street.',
    },
    {
      when: 'hungry',
      text: 'You lie awake a while in a rented room, your stomach complaining.',
    },
    {
      when: 'hungry',
      text: 'The smell of the kitchen comes up through the floor and keeps you awake, hungry as you are.',
    },
  ],
};
