import type { ConversationDef } from '../../../types';
import { CLAN_TALK } from './clan';
import { ROLE_TALK } from './role';
import { SPECIALTY_TALK } from './specialty';
import { SPECIALTY_DEEP_TALK } from './specialtyDeep';
import { TRAIT_TALK } from './trait';
import { TRAIT_DEEP_TALK } from './traitDeep';

/** Conversations written once for everyone, filled from the person they're `about`. */
export const TEMPLATE_CONVERSATIONS: readonly ConversationDef[] = [
  ...SPECIALTY_TALK,
  ...SPECIALTY_DEEP_TALK,
  ...TRAIT_TALK,
  ...TRAIT_DEEP_TALK,
  ...ROLE_TALK,
  ...CLAN_TALK,
];
