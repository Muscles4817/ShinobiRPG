import type { AptitudeText } from '../types';

/** How talent shows itself. Setting-neutral, so every pack can use it. */
export const APTITUDE_TEXT: AptitudeText = {
  reads: {
    none: 'Nothing happens. However you come at it, it will not take hold in you.',
    poor: 'It fights you every step. Others seem to pick this up in half the time.',
    ordinary: 'It comes as it comes: honest work, honest progress.',
    gifted: 'It comes naturally, as if your body remembered something it was never taught.',
  },
  senses: {
    none: 'Not in you',
    poor: 'Fights you every step',
    ordinary: 'Ordinary',
    gifted: 'Comes naturally',
  },
  unknown: 'Not yet tried in earnest',
  blocked: 'You have tried. It will not take shape in you, however hard you push.',
  limits: {
    born: {
      near: 'Close to all you were born with',
      reached: 'As far as you were born to go',
    },
    frame: {
      near: 'Close to what your frame can carry',
      reached: 'All your frame will carry',
    },
    trained: {
      near: 'Close to the edge of your talent',
      reached: 'At the edge of your talent',
    },
  },
};
