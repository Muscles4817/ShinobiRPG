import { CANON_KITS_1 } from './kits1';
import { CANON_KITS_2 } from './kits2';

/** Technique ids added to each fighter (by person id), after what they fight with now. */
export const CANON_KITS: Readonly<Record<string, readonly string[]>> = {
  ...CANON_KITS_1,
  ...CANON_KITS_2,
};
