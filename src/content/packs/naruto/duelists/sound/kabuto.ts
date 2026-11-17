import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Kabuto Yakushi as he fought Tsunade and Naruto at Tanzaku (the end of Part 1): a medical
 * ninja who cuts with the scalpel and mends himself between blows, with the sleeping feathers
 * he cast over the stadium at the invasion. Every move is one the pack already has.
 */
export const KABUTO: PersonDef = soundFighter({
  id: 'kabuto',
  name: 'Kabuto',
  familyName: 'Yakushi',
  pronouns: 'he',
  title: 'Orochimaru’s right hand',
  // Officially a genin of the Leaf who never passed the exam; ranked by what he can do.
  rank: 'jonin',
  // His medical ninjutsu near Tsunade's own, and a spy's eye for everything else.
  stats: statLine(18, {
    strength: 14,
    speed: 24,
    stamina: 22,
    reserves: 26,
    chakraControl: 38,
    intellect: 36,
    perception: 30,
    willpower: 26,
    taijutsu: 24,
    ninjutsu: 32,
    genjutsu: 24,
    kenjutsu: 12,
    fuuinjutsu: 14,
  }),
  traitIds: ['cunning', 'calm'],
  appearance: look(
    'ponytail',
    { hair: '#e8e0d0', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#5a3a6e' },
    'forehead',
    { shape: 'oval', expression: 'smile', age: 'young' },
  ),
  specialty: 'ninjutsu',
  bio: 'A spy since boyhood, for everyone in turn, until he found Orochimaru. Polite and helpful, and always one step further along than he lets on.',
  arsenal: {
    techniqueIds: ['chakra-scalpel', 'mystical-palm', 'temple-of-nirvana', 'body-flicker'],
    tools: { 'soldier-pill': 2 },
  },
});
