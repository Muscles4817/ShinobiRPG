/**
 * The fight record: the last fight kept whole as it was fought, to download for debugging.
 */
export type { FightRecord, FightStep } from './state';
export { noteFight, withFightEnd } from './record';
export { fightRecordDocument, fightRecordFile } from './export';
