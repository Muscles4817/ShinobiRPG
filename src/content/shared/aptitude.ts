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
};
