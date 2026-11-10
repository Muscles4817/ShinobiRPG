import { clamp } from '@/core';

/**
 * Your puppets between fights (`docs/design/retinue-plan.md`, step 5b): the ones you own, how
 * whole each is, and your craft, the skill of keeping them (it rises with the work, never by
 * drilling a stat). A puppet's damage carries from fight to fight; one beaten in a fight is
 * broken, never lost, and stays home until it is mended. Mending is work at a bench, a share of
 * the puppet a session, more the better your craft, paid for in materials.
 */

/** A puppet of yours: a frame of the pack's (`PuppetDef`), how whole it is and its name. */
export interface OwnedPuppet {
  /** The frame it was built as (a `PuppetDef` id); also its call in a fight. */
  readonly frameId: string;
  readonly name: string;
  /** How whole it is: 1 whole, 0 broken. */
  readonly condition: number;
}

/** Everything puppet-making you keep: your puppets and your craft. */
export interface Workshop {
  readonly puppets: readonly OwnedPuppet[];
  /** Your craft, on the stat scale (0–60): graded as a skill. */
  readonly craft: number;
}

export const NO_WORKSHOP: Workshop = { puppets: [], craft: 0 };

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

/** Whether you own a puppet of this frame. */
export function ownsFrame(workshop: Workshop, frameId: string): boolean {
  return workshop.puppets.some((p) => p.frameId === frameId);
}

/** A new puppet, whole, to your workshop; a frame you already own isn't given twice. */
export function withPuppet(workshop: Workshop, frameId: string, name: string): Workshop {
  if (ownsFrame(workshop, frameId)) return workshop;
  return { ...workshop, puppets: [...workshop.puppets, { frameId, name, condition: 1 }] };
}

/** Your puppets after a fight: each one called comes home as whole as it ended it. */
export function afterFight(workshop: Workshop, shares: Readonly<Record<string, number>>): Workshop {
  const puppets = workshop.puppets.map((p) => {
    const share = shares[p.frameId];
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
export function mended(workshop: Workshop, frameId: string): Workshop {
  const share = mendShare(workshop.craft);
  const puppets = workshop.puppets.map((p) =>
    p.frameId === frameId ? { ...p, condition: Math.min(1, p.condition + share) } : p,
  );
  return { puppets, craft: craftAfterSession(workshop.craft) };
}
