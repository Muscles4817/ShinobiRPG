import type { HiveShare } from '@/systems/hives';
import type { AcademyFile, ClassStanding, Look, Pronouns, QuickPick } from '@/systems/profile';
import type { Sex } from '@/systems/stats';

import { bornFor } from './born';
import type { StudentProfile } from './student';

/** The character a creation draft describes, as the academy break-in scene collects it. */

export interface CreationDraft {
  readonly name: string;
  /** Used only when clanless; clan members take the clan's name. */
  readonly familyName: string;
  readonly pronouns: Pronouns;
  /** Their body's sex, which shapes how it was drawn; never read from pronouns. */
  readonly sex: Sex;
  /**
   * The seed their body and mind were drawn from (`game/born.ts`), set by the creation scene; null
   * is the middle of the class.
   */
  readonly bornSeed: number | null;
  readonly appearance: Look;
  readonly clanId: string;
  /** Where they stood in their class; with fate, what the file turned out to say. */
  readonly standing: ClassStanding;
  /** The player let fate decide the standing (the file revealed it). */
  readonly fated?: boolean;
  /** How they were raised (`UpbringingDef`): their early training. */
  readonly upbringingId: string;
  /** Their frame (`BuildDef`). */
  readonly buildId: string;
  /** Early training, known gifts and flaws, and when they bloomed. */
  readonly file: AcademyFile;
  /** The kind of student the file was filled for, or null when it was written by hand. */
  readonly quickPick: QuickPick | null;
  readonly traitIds: readonly string[];
  readonly talentIds: readonly string[];
  readonly quirkIds: readonly string[];
  readonly nindoId: string;
  readonly breakInApproachId: string;
  /** How much of their chakra a child of a hive clan gave the hive at birth. */
  readonly hiveShare?: HiveShare;
  /**
   * The techniques chosen on the file beyond the basics (`creationTechniques.ts`); unset, the
   * academy's starters in their best arts.
   */
  readonly techniqueIds?: readonly string[];
}

/** The draft as the student it describes. */
export function profileOf(draft: CreationDraft): StudentProfile {
  return {
    clanId: draft.clanId,
    talentIds: draft.talentIds,
    buildId: draft.buildId,
    upbringingId: draft.upbringingId,
    standing: draft.standing,
    file: draft.file,
    born: bornFor(draft.bornSeed, draft.sex),
  };
}
