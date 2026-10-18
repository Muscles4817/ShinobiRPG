import type { DailyBank } from './tell';

/**
 * A session with a scroll that didn't finish it, and a dish cooked at home. The scroll's card
 * and the recipe's card already say what they are; these say how the work went.
 */

export const STUDY_LINES: DailyBank = {
  name: 'study',
  prefer: ['first'],
  lines: [
    {
      when: 'first',
      text: 'You unroll the scroll for the first time and read it through twice before you try anything.',
    },
    {
      when: 'first',
      text: 'The first pass is all reading. You don’t try a thing until you can say every step back to yourself.',
    },
    { text: 'You unroll the scroll a little further and practise until your hands ache.' },
    {
      text: 'Most of the session goes on one small part of it, and by the end that part is right.',
    },
    {
      text: 'The writer assumed you knew things you don’t, and you work them out the slow way.',
    },
    {
      text: 'You practise the opening until it comes without thinking, then start on what follows.',
    },
    {
      when: 'night',
      text: 'You keep at it late, by whatever light there is, until the characters swim.',
    },
    {
      when: 'hungry',
      text: 'You read the same line four times over before you admit you’re too hungry to take it in.',
    },
  ],
};

export const COOKED_LINES: DailyBank = {
  name: 'cooked',
  prefer: ['first'],
  lines: [
    {
      when: 'first',
      text: 'You cook it for the first time with the recipe propped open beside the pot, checking every step.',
    },
    {
      when: 'first',
      text: 'It’s new to your hands, so you go carefully, and it comes out tasting like what it should be.',
    },
    { text: 'You cook without hurrying and eat it hot, straight from the pan.' },
    { text: 'The kitchen fills with the smell of it long before it’s ready.' },
    { when: 'again', text: 'You’ve made it often enough now that your hands know the way.' },
    { when: 'morning', text: 'A proper breakfast for once, cooked while the kettle boils.' },
    { when: 'evening', text: 'You cook supper as the street goes quiet and eat it at the window.' },
    {
      when: 'winter',
      text: 'The stove warms the whole room while you cook, which is half the reason to.',
    },
  ],
};
