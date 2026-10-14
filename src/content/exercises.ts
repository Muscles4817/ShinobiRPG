import type { StatDelta, StatGrade } from '@/systems/stats';
import type { WalkSurface } from '@/systems/travel';

/**
 * Chakra control exercises: tree-walking, water-walking. Each is learned over sessions at the
 * training places that offer it (`exerciseIds`), once your control reaches its grade; some
 * must be started by your sensei at a lesson. Mastering one is a breakthrough (it moves the
 * chakra control limit) and may open the way across a surface (`walk`).
 */
export interface ExerciseDef {
  readonly id: string;
  readonly name: string;
  /** What it is, for its card. No numbers. */
  readonly description: string;
  /** The grade of chakra control it takes to begin. */
  readonly minControl: StatGrade;
  /** Progress a session gives at the base pace, of 100 to master it. */
  readonly progressPerSession: number;
  readonly energyCost: number;
  /** `sensei`: your sensei starts it with you at a weekly lesson; until then it is closed. */
  readonly startedBy?: 'sensei';
  /** The surface it lets you walk, once mastered. */
  readonly walk?: WalkSurface;
  /** What mastering it does to your limits (a breakthrough). */
  readonly limitBonus: StatDelta;
  readonly lines: {
    /** The sensei's lesson, when they start it with you. */
    readonly start?: string;
    /** A session going well, by how far along you are: early, halfway, nearly there. */
    readonly practice: readonly [string, string, string];
    /** A session that ends in a fall. */
    readonly fall: string;
    readonly mastered: string;
  };
}
