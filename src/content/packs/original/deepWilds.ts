import { deepWildsEvents } from '../../shared/road/deepWilds';
import { OWL_SPARED } from './arcs/oldOwl';

/** The depths of wild country, with the missing-nin of the pack's villages hiding in the deep. */
export const DEEP_WILDS_EVENTS = deepWildsEvents({
  missingNin: [
    ['rogue-sakyugakure-scout-chunin'],
    ['rogue-ashfield-frontliner-chunin'],
    ['rogue-arashigakure-trapper-chunin'],
    ['rogue-sakyugakure-medic-chunin'],
  ],
  gates: {
    // The owl is met in the heart only once you have followed it and let it be, and only once.
    'the-owl-on-the-pine': { needsWorldMark: OWL_SPARED, once: true },
  },
});
