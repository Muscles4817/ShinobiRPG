import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { sunaFighter } from './fighter';

/**
 * Shinobi of the Sand from none of its great families: Pakura of the Scorch, the village's
 * hero, whose bloodline would hang her in the Mist, and Maki, her student, with her cloth.
 */
export const VILLAGE_FIGHTERS: readonly PersonDef[] = [
  sunaFighter({
    id: 'pakura',
    name: 'Pakura',
    familyName: 'of the Scorch',
    pronouns: 'she',
    title: 'Hero of the Sand',
    rank: 'jonin',
    stats: statLine('C', {
      ninjutsu: 'A',
      chakraControl: 'A',
      speed: 'B',
      reserves: 'B',
      willpower: 'B',
    }),
    traitIds: ['focused', 'kind'],
    appearance: look(
      'long',
      { hair: '#3e6b5a', eyes: '#5f9b8a', skin: '#e8c39e', outfit: '#6b5a8a' },
      'forehead',
      { expression: 'calm', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Fire and wind made one in her, Scorch Release, a bloodline out of nowhere. The Sand calls her its hero, and the Mist has asked for her by name.',
    arsenal: {
      techniqueIds: ['scorch-steaming-murder', 'scorch-orbs', 'air-bullet'],
    },
  }),
  sunaFighter({
    id: 'maki',
    name: 'Maki',
    familyName: '',
    pronouns: 'she',
    title: 'Pakura’s Student',
    rank: 'chunin',
    stats: statLine('D', { ninjutsu: 'C', chakraControl: 'C', speed: 'C', perception: 'C' }),
    traitIds: ['diligent', 'proud'],
    appearance: look(
      'bob',
      { hair: '#7a4a2a', eyes: '#3a3632', skin: '#e2b48c', outfit: '#c9a46a' },
      'forehead',
      { expression: 'worried', age: 'young' },
    ),
    specialty: 'ninjutsu',
    bio: 'Carries a bolt of cloth and her teacher’s every word. Would follow Pakura into the Mist itself.',
    arsenal: {
      techniqueIds: ['cloth-binding', 'cloth-wing-strike', 'air-bullet'],
    },
  }),
];
