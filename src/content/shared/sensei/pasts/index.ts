import type { SenseiPast } from '../../../senseiParts';
import { DESERTER } from './deserter';
import { THE_FIRE } from './fire';
import { HUNGRY_YEAR } from './hunger';
import { LOST_TEAM } from './lostTeam';
import { WRONG_ORDER } from './order';
import { BROKEN_PROMISE } from './promise';
import { RIVAL } from './rival';
import { STOLEN_SCROLL } from './scroll';
import { SPIRIT_BARGAIN } from './spirit';
import { LOST_STUDENT } from './student';

/** What generated senseis carry from before (`senseiParts.ts`), one file each. */
export const SENSEI_PASTS: readonly SenseiPast[] = [
  LOST_TEAM,
  RIVAL,
  BROKEN_PROMISE,
  DESERTER,
  THE_FIRE,
  STOLEN_SCROLL,
  HUNGRY_YEAR,
  WRONG_ORDER,
  SPIRIT_BARGAIN,
  LOST_STUDENT,
];
