import type { ConversationTopic } from '../../../types';

import { ROLE_TOPICS } from './roles';
import { SPECIALTY_TOPICS } from './specialties';
import { TRAIT_TOPICS } from './traits';

/** The words for each specialty, trait and role that templated talk is filled with. */
export const SHARED_TOPICS: readonly ConversationTopic[] = [
  ...SPECIALTY_TOPICS,
  ...TRAIT_TOPICS,
  ...ROLE_TOPICS,
];
