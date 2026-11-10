import { craftAfterSession, type BuildJob, type OwnedPuppet, type Workshop } from './workshop';

/**
 * Building a puppet at the bench (`docs/design/retinue-plan.md`, step 5b-ii): what a build comes
 * out as, and the days of work it takes. A build is as good as the hands and the wood together:
 * your craft reaches only so far past itself (`CRAFT_LEAD`), and each grade of material only so
 * far (`MATERIAL_CAP`), so a master working pine makes a sound doll and an apprentice wastes
 * ironwood. Neither lifts a frame past what it was designed for. Every day at the bench teaches
 * craft, and you keep only so many puppets (`KEEP_LIMIT`).
 */

/** How far past your craft a build of yours reaches. */
const CRAFT_LEAD = 10;
/** The most a material of each quality can be worked up to (common, fine, rare). */
const MATERIAL_CAP: Readonly<Record<1 | 2 | 3, number>> = { 1: 20, 2: 30, 3: 44 };
/** How much tougher than its frame each quality of material makes a puppet. */
const MATERIAL_TOUGHNESS: Readonly<Record<1 | 2 | 3, number>> = { 1: 0.9, 2: 1, 3: 1.15 };
/** The least any part of a build comes out at. */
const BUILT_FLOOR = 5;
/** Puppets you keep at once. */
export const KEEP_LIMIT = 3;

/** A frame's ceiling in one stat, worked by these hands in this material. */
export function builtValue(ceiling: number, craft: number, quality: 1 | 2 | 3): number {
  const reach = Math.min(craft + CRAFT_LEAD, MATERIAL_CAP[quality]);
  return Math.max(BUILT_FLOOR, Math.min(ceiling, reach));
}

/** How much tougher than its frame a material makes a puppet. */
export function materialToughness(quality: 1 | 2 | 3): number {
  return MATERIAL_TOUGHNESS[quality];
}

/** Whether a new puppet would be one too many to keep (a rebuild never is). */
export function keepsTooMany(workshop: Workshop, puppetId: string): boolean {
  const rebuilding = workshop.puppets.some((p) => p.id === puppetId);
  return !rebuilding && workshop.puppets.length >= KEEP_LIMIT;
}

/** The id the next puppet you build will have. */
export function nextPuppetId(workshop: Workshop): string {
  return `built-${workshop.nextId}`;
}

/** Lots of a material taken from your stock, or null when you haven't that many. */
export function stockTaken(workshop: Workshop, materialId: string, lots: number): Workshop | null {
  const held = workshop.stock[materialId] ?? 0;
  if (held < lots) return null;
  return { ...workshop, stock: { ...workshop.stock, [materialId]: held - lots } };
}

/** Lots of a material added to your stock. */
export function stocked(workshop: Workshop, materialId: string, lots: number): Workshop {
  const held = workshop.stock[materialId] ?? 0;
  return { ...workshop, stock: { ...workshop.stock, [materialId]: held + lots } };
}

/** A build set on the bench; a new one takes the next id. */
export function buildStarted(workshop: Workshop, job: BuildJob): Workshop {
  const fresh = !workshop.puppets.some((p) => p.id === job.puppetId);
  return { ...workshop, build: job, nextId: fresh ? workshop.nextId + 1 : workshop.nextId };
}

function finished(workshop: Workshop, job: BuildJob, craft: number): Workshop {
  const puppet: OwnedPuppet = {
    id: job.puppetId,
    name: job.name,
    condition: 1,
    built: {
      frameId: job.frameId,
      partIds: job.partIds,
      materialId: job.materialId,
      craftAt: craft,
    },
  };
  // A rebuild keeps its place on the shelf; a new puppet goes at the end.
  const rebuilt = workshop.puppets.some((p) => p.id === job.puppetId);
  const puppets = rebuilt
    ? workshop.puppets.map((p) => (p.id === job.puppetId ? puppet : p))
    : [...workshop.puppets, puppet];
  return { ...workshop, puppets, build: null, craft };
}

/** A day's work on the build: it comes a day nearer, and done, it is yours. */
export function workedOn(workshop: Workshop, day: number): Workshop {
  const job = workshop.build;
  if (!job) return workshop;
  const craft = craftAfterSession(workshop.craft);
  const left = job.daysLeft - 1;
  if (left <= 0) return finished(workshop, job, craft);
  return { ...workshop, craft, build: { ...job, daysLeft: left, workedDay: day } };
}

/** A puppet of yours given a new name. */
export function renamed(workshop: Workshop, id: string, name: string): Workshop {
  const puppets = workshop.puppets.map((p) => (p.id === id ? { ...p, name } : p));
  return { ...workshop, puppets };
}
