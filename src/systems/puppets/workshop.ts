import { clamp } from '@/core';

/**
 * Your puppets between fights (`docs/design/retinue-plan.md`, step 5b): the ones you own, how
 * whole each is, and your craft, the skill of keeping them (it rises with the work, never by
 * drilling a stat). A puppet's damage carries from fight to fight; one beaten in a fight is
 * broken, never lost, and stays home until it is mended. Mending is work at a bench, a share of
 * the puppet a session, more the better your craft, paid for in materials.
 */

/** How a puppet you built was built: its frame, its mechanisms and what it is made of. */
export interface BuiltSheet {
  /** The frame (a `PuppetFrameDef` id). */
  readonly frameId: string;
  /** Its mechanisms (`PuppetPartDef` ids), one a slot. */
  readonly partIds: readonly string[];
  /** What it was made of (a `PuppetMaterialDef` id). */
  readonly materialId: string;
  /** Your craft when it was finished: a build is as good as the hands that made it. */
  readonly craftAt: number;
}

/** A puppet of yours: how whole it is, its name, and how it was built if you built it. */
export interface OwnedPuppet {
  /** Its call in a fight: a pack puppet's own id (`PuppetDef`), or one of yours (`built-n`). */
  readonly id: string;
  readonly name: string;
  /** How whole it is: 1 whole, 0 broken. */
  readonly condition: number;
  /** How you built it; absent for a pack's puppet given with its art. */
  readonly built?: BuiltSheet;
}

/** A puppet on the bench: a new build, or a rebuild of one of yours, and the days it still needs. */
export interface BuildJob {
  /** The puppet it will be (an id of yours when rebuilding one). */
  readonly puppetId: string;
  readonly name: string;
  readonly frameId: string;
  readonly partIds: readonly string[];
  readonly materialId: string;
  readonly daysLeft: number;
  /** The last day it was worked on: one session a day. */
  readonly workedDay?: number;
}

/** Everything puppet-making you keep: your puppets, your craft, materials and the bench. */
export interface Workshop {
  readonly puppets: readonly OwnedPuppet[];
  /** Your craft, on the stat scale (0–60): graded as a skill. */
  readonly craft: number;
  /** Lots of each material you keep (`PuppetMaterialDef` id). */
  readonly stock: Readonly<Record<string, number>>;
  /** The puppet on the bench, if any. */
  readonly build: BuildJob | null;
  /** The number the next puppet you build is given. */
  readonly nextId: number;
}

export const NO_WORKSHOP: Workshop = { puppets: [], craft: 0, stock: {}, build: null, nextId: 1 };

/** Share of a puppet a session at the bench mends with no craft at all… */
export const MEND_BASE = 0.25;
/** …and how much more each point of craft mends, up to `MEND_MOST`. */
const MEND_PER_CRAFT = 1 / 120;
const MEND_MOST = 0.75;
/** Ryo of materials (wood, wire, lacquer) to mend a whole human-sized puppet from broken. */
export const MEND_RYO_WHOLE = 60;
/** Craft a session at the bench teaches a beginner; it eases as craft climbs towards `CRAFT_TOP`. */
const CRAFT_PER_SESSION = 1.5;
const CRAFT_TOP = 60;

/** Whether a puppet is broken: beaten in a fight and not yet mended at all. */
export function isBroken(puppet: OwnedPuppet): boolean {
  return puppet.condition <= 0;
}

/** Whether you own this puppet (a pack puppet's id, or one of yours). */
export function owns(workshop: Workshop, id: string): boolean {
  return workshop.puppets.some((p) => p.id === id);
}

/** A pack's puppet, whole, to your workshop; one you already own isn't given twice. */
export function withPuppet(workshop: Workshop, id: string, name: string): Workshop {
  if (owns(workshop, id)) return workshop;
  return { ...workshop, puppets: [...workshop.puppets, { id, name, condition: 1 }] };
}

/** Your puppets after a fight: each one called comes home as whole as it ended it. */
export function afterFight(workshop: Workshop, shares: Readonly<Record<string, number>>): Workshop {
  const puppets = workshop.puppets.map((p) => {
    const share = shares[p.id];
    return share === undefined ? p : { ...p, condition: clamp(share, 0, 1) };
  });
  return { ...workshop, puppets };
}

/** The share of a puppet one session at the bench mends, by your craft. */
export function mendShare(craft: number): number {
  return Math.min(MEND_MOST, MEND_BASE + Math.max(0, craft) * MEND_PER_CRAFT);
}

/** What a session's materials cost for a puppet this big (its `healthScale`) and this hurt. */
export function mendCost(puppet: OwnedPuppet, scale: number, craft: number): number {
  const mended = Math.min(1 - puppet.condition, mendShare(craft));
  return Math.max(1, Math.ceil(MEND_RYO_WHOLE * scale * mended));
}

/** Craft after a session at the bench: a beginner learns most from it. */
export function craftAfterSession(craft: number): number {
  const left = Math.max(0, CRAFT_TOP - craft) / CRAFT_TOP;
  return Math.min(CRAFT_TOP, craft + CRAFT_PER_SESSION * left);
}

/** A session at the bench on one puppet: it is mended a share, and your craft grows. */
export function mended(workshop: Workshop, id: string): Workshop {
  const share = mendShare(workshop.craft);
  const puppets = workshop.puppets.map((p) =>
    p.id === id ? { ...p, condition: Math.min(1, p.condition + share) } : p,
  );
  return { ...workshop, puppets, craft: craftAfterSession(workshop.craft) };
}
