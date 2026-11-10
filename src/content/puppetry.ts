import type { CombatTrait } from '@/systems/combat';
import type { StatGrade } from '@/systems/stats';

/**
 * Building puppets (`docs/design/retinue-plan.md`, step 5b-ii): the frames a puppeteer can build
 * on, the mechanisms that fill a frame's slots (each a technique the puppet carries), and the
 * materials a build is made of. Shared by every pack (`content/shared/puppetry.ts`); a pack's
 * named puppets (`PuppetDef`) are its own.
 */

/** The arts a frame is built to go in, besides its body. */
export const BUILT_ARTS = ['taijutsu', 'kenjutsu'] as const;
export type BuiltArt = (typeof BUILT_ARTS)[number];

/** A frame: the body a puppet is built on, and how far a build of it can go. */
export interface PuppetFrameDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Your craft's grade it takes to build one. */
  readonly craft: StatGrade;
  /** Health as a multiple of a human's, before its materials. */
  readonly healthScale: number;
  /** How strong, quick and tough the best build of it can be. */
  readonly body: {
    readonly strength: StatGrade;
    readonly speed: StatGrade;
    readonly stamina: StatGrade;
  };
  /** How far the best build of it can go in each art it is built for. */
  readonly arts: Readonly<Partial<Record<BuiltArt, StatGrade>>>;
  /** Mechanisms it holds. */
  readonly slots: number;
  /** Lots of material a build takes. */
  readonly lots: number;
  /** Days of work at the bench a build takes. */
  readonly days: number;
  readonly maxChakra: number;
  /** Chakra its maker pays every exchange to keep the threads on it. */
  readonly upkeep: number;
  readonly traits?: readonly CombatTrait[];
  /** Its maker fights from inside it (a shell). */
  readonly worn?: true;
}

/** A mechanism fitted into a frame's slot: the technique the puppet fights with. */
export interface PuppetPartDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly techniqueId: string;
  /** Ryo the parts cost, on top of the materials. */
  readonly cost: number;
}

/** How fine a material is: 1 common, 2 fine, 3 rare. */
export type MaterialQuality = 1 | 2 | 3;

/** Everything a puppeteer builds from, the same in every pack. */
export interface PuppetryKit {
  readonly frames: readonly PuppetFrameDef[];
  readonly parts: readonly PuppetPartDef[];
  readonly materials: readonly PuppetMaterialDef[];
}

/** What a build is made of, bought by the lot where a shop sells it (`materialIds`). */
export interface PuppetMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly quality: MaterialQuality;
  /** Ryo a lot. */
  readonly price: number;
}
