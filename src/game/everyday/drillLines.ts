import type { DailyBank } from './tell';

/**
 * How a drill went, for the journal: never the drill's own blurb, which the training board
 * already shows. A first go reads differently from the tenth, and the hour, the season, a
 * festival or an empty stomach colour the rest.
 */

export const DRILL_LINES: DailyBank = {
  name: 'drill',
  prefer: ['first', 'hungry'],
  lines: [
    {
      when: 'first',
      text: 'The first go is mostly finding out where it hurts. Everywhere, it turns out, so you slow down and learn the shape of it before you push.',
    },
    {
      when: 'first',
      text: 'You’ve watched others do this often enough to think it looked easy. By the end you know which parts you were getting wrong, and that’s a start.',
    },
    {
      when: 'first',
      text: 'You copy what you remember from the academy, get half of it wrong, and fix the worst of it before you stop.',
    },
    {
      when: 'again',
      text: 'It goes a little easier than last time, or you’ve stopped noticing the parts that hurt.',
    },
    {
      when: 'again',
      text: 'You know the routine now. Your mind wanders while your body keeps count, and twice you lose the count and start the set again.',
    },
    {
      when: 'again',
      text: 'Same as before, except you push the last set further than you did and feel it all the way home.',
    },
    {
      when: 'again',
      text: 'You find the rhythm early today and keep it to the end, which hasn’t happened before.',
    },
    {
      text: 'Halfway through you want to stop. You don’t, and the second half goes better than the first.',
    },
    {
      when: 'hungry',
      text: 'Your stomach keeps interrupting, and you give the work less than it needs.',
    },
    {
      when: 'hungry',
      text: 'It’s hard to put your back into anything on an empty stomach. You get through it, barely, and think about food the whole way.',
    },
    {
      when: 'hungry',
      text: 'You’re light-headed by the end and have to sit down for a while before you trust your legs.',
    },
    {
      when: 'morning',
      text: 'The ground is still wet when you start, and by the time you finish your clothes are too.',
    },
    {
      when: 'morning',
      text: 'You have the place to yourself for once and work through it while the village wakes up around you.',
    },
    {
      when: 'afternoon',
      text: 'The sun is high and there’s no shade worth the name, so you drink when you can and keep going.',
    },
    {
      when: 'evening',
      text: 'You keep at it until the light starts to go and you can hardly see your own feet.',
    },
    {
      when: 'night',
      text: 'It’s dark, and you work from memory more than sight, which turns out to be a lesson of its own.',
    },
    {
      when: 'festival',
      text: 'Music carries over from the festival the whole time, and you lose count twice listening to it.',
    },
    {
      when: 'winter',
      text: 'Your breath hangs in the cold air, and it takes the whole first set before your hands feel like yours.',
    },
    {
      when: 'summer',
      text: 'It’s too hot for this. You do it anyway and finish soaked through.',
    },
    {
      when: 'autumn',
      text: 'Leaves keep blowing across the ground, and before long you’re using them as targets without meaning to.',
    },
    {
      when: 'spring',
      text: 'The air smells of wet earth and new grass, and for once the work is easy to start.',
    },
  ],
};
