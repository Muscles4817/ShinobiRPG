/**
 * What the crew say on a job, by moment and by trait: after a check, when a decision lands well
 * or badly with them, and by the fire. Lines are the speaker's own words, with no numbers.
 */
export const VOICE_MOMENTS = [
  'check-passed',
  'check-failed',
  'approve',
  'disapprove',
  'camp',
] as const;
export type VoiceMoment = (typeof VOICE_MOMENTS)[number];

export interface VoiceDef {
  readonly moment: VoiceMoment;
  /** The trait whose holders say these (a trait id). */
  readonly trait: string;
  readonly lines: readonly string[];
}
