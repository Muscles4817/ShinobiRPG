import type { DailyBank } from './tell';

/**
 * Eating out and a night at the dice. The stall's card already describes the dish, so the
 * journal says how the meal went instead; the dice say how the cup came up.
 */

export const MEAL_LINES: DailyBank = {
  name: 'meal',
  prefer: ['first'],
  lines: [
    {
      when: 'first',
      text: 'It’s your first time trying it. You mean to take it slowly and finish it far too fast.',
    },
    {
      when: 'first',
      text: 'You order it to see what the fuss is about, and by the last mouthful you understand.',
    },
    { text: 'You eat quickly, without really tasting it, and feel better at once.' },
    { text: 'You take your time over it for once and watch the street go by.' },
    { when: 'again', text: 'It’s as good as last time, and you don’t leave a scrap.' },
    {
      when: 'again',
      text: 'The cook knows your face by now and gives you a little extra without saying anything.',
    },
    {
      when: 'hungry',
      text: 'You were hungrier than you thought, and it’s gone in a few mouthfuls.',
    },
    { when: 'morning', text: 'Breakfast out feels like a luxury, and you make it last.' },
    {
      when: 'evening',
      text: 'You eat late, with the cook already wiping down around you and in no hurry to send you off.',
    },
    {
      when: 'night',
      text: 'It’s the last serving of the night, and it tastes like it was saved for you.',
    },
    {
      when: 'festival',
      text: 'The festival crowd jostles you the whole time you eat, and you find you don’t mind.',
    },
    {
      when: 'winter',
      text: 'It warms you right through, which on a day like this is half the point.',
    },
    {
      when: 'summer',
      text: 'You eat in the shade with your sleeves rolled up, slowly, because of the heat.',
    },
  ],
};

export const DICE_WON: DailyBank = {
  name: 'dice-won',
  lines: [
    { text: 'You called it.' },
    { text: 'The dealer pushes your winnings across without looking up.' },
    { text: 'Someone at the end of the table groans. You were the only one on that side.' },
    { text: 'You’d have sworn it was going the other way, and you’re glad you didn’t say so.' },
  ],
};

export const DICE_LOST: DailyBank = {
  name: 'dice-lost',
  lines: [
    { text: 'The dealer rakes in your stake.' },
    { text: 'Wrong call. Your coins go the way of everyone else’s.' },
    { text: 'You heard it settle, or thought you did, and you were wrong.' },
    { text: 'The house takes it, as the house mostly does.' },
  ],
};
