import type { PuppetFrameDef } from './puppetry';
import type { ContentPack } from './types';

/**
 * Building puppets (`ContentPack.puppetry`): every frame has a body, slots, materials and days
 * to it and some art to be built in; every mechanism fights with a real technique; every
 * material is sold somewhere, and every shop sells only real materials.
 */

function frameProblems(frame: PuppetFrameDef): string[] {
  const at = `puppet frame "${frame.id}"`;
  const sane =
    frame.healthScale > 0 &&
    frame.slots > 0 &&
    frame.lots > 0 &&
    frame.days > 0 &&
    frame.upkeep > 0;
  return [
    ...(sane ? [] : [`${at} needs a body, slots, materials, days and upkeep`]),
    ...(Object.keys(frame.arts).length > 0 ? [] : [`${at} is built for no art`]),
  ];
}

function partProblems(pack: ContentPack): string[] {
  const known = new Set(pack.techniques.map((t) => t.id));
  return pack.puppetry.parts
    .filter((p) => !known.has(p.techniqueId))
    .map((p) => `puppet part "${p.id}" fights with unknown "${p.techniqueId}"`);
}

function materialProblems(pack: ContentPack): string[] {
  const sold = pack.locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'gear' ? (p.materialIds ?? []) : [])),
  );
  const real = new Set(pack.puppetry.materials.map((m) => m.id));
  return [
    ...sold.filter((id) => !real.has(id)).map((id) => `a shop sells unknown material "${id}"`),
    ...pack.puppetry.materials
      .filter((m) => !sold.includes(m.id))
      .map((m) => `puppet material "${m.id}" is sold nowhere`),
  ];
}

export function validatePuppetry(pack: ContentPack): string[] {
  return [
    ...pack.puppetry.frames.flatMap(frameProblems),
    ...partProblems(pack),
    ...materialProblems(pack),
  ];
}
