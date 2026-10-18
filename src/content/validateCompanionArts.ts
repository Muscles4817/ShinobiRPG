import { MISSION_ROLES } from '@/systems/missions';

import type { ContentPack } from './types';

/**
 * What companions learn and who handles them: a kind's techniques are real, open at a real bond
 * stage, and any a handler must teach has a clinic that teaches it; a clinic's handling is
 * better than your own and teaches only what some kind holds; handling lore is real and sold
 * somewhere; a kind's job roles are real roles.
 */

/** The deepest bond stage. */
const MOST_STAGE = 4;

function clinics(pack: ContentPack) {
  return pack.locations.flatMap((l) => l.places).flatMap((p) => (p.kind === 'vet' ? [p] : []));
}

function kindTechniqueProblems(pack: ContentPack): string[] {
  const known = new Set(pack.techniques.map((t) => t.id));
  const taught = new Set(clinics(pack).flatMap((v) => v.handling?.teaches ?? []));
  return pack.companionKinds.flatMap((kind) =>
    (kind.techniques ?? []).flatMap((t) => {
      const at = `companion kind "${kind.id}"`;
      return [
        ...(known.has(t.techniqueId) ? [] : [`${at} knows unknown technique "${t.techniqueId}"`]),
        ...(t.stage >= 1 && t.stage <= MOST_STAGE
          ? []
          : [`${at} opens "${t.techniqueId}" at no real stage`]),
        ...(t.handler && !taught.has(t.techniqueId)
          ? [`${at} needs a handler to teach "${t.techniqueId}", and none does`]
          : []),
      ];
    }),
  );
}

function roleProblems(pack: ContentPack): string[] {
  return pack.companionKinds.flatMap((kind) =>
    (kind.roles ?? [])
      .filter((r) => !MISSION_ROLES.includes(r))
      .map((r) => `companion kind "${kind.id}" takes unknown role "${r}"`),
  );
}

function handlingProblems(pack: ContentPack): string[] {
  const held = new Set(
    pack.companionKinds.flatMap((k) => (k.techniques ?? []).map((t) => t.techniqueId)),
  );
  return clinics(pack).flatMap((vet) => {
    const handling = vet.handling;
    if (!handling) return [];
    const at = `vet "${vet.id}"`;
    return [
      ...(handling.quality > 1 ? [] : [`${at} handles no better than an owner`]),
      ...(handling.price >= 0 ? [] : [`${at} pays you to handle`]),
      ...(handling.minStage >= 0 && handling.minStage <= MOST_STAGE
        ? []
        : [`${at} handles at no real stage`]),
      ...(handling.teaches ?? [])
        .filter((id) => !held.has(id))
        .map((id) => `${at} teaches "${id}", which no kind holds`),
    ];
  });
}

function loreProblems(pack: ContentPack): string[] {
  const known = new Set(pack.companionLore.map((l) => l.id));
  const sold = pack.locations
    .flatMap((l) => l.places)
    .flatMap((p) => (p.kind === 'gear' ? (p.loreIds ?? []) : []));
  return [
    ...sold.filter((id) => !known.has(id)).map((id) => `a shop sells unknown lore "${id}"`),
    ...pack.companionLore
      .filter((l) => !sold.includes(l.id))
      .map((l) => `lore "${l.id}" is sold nowhere`),
    ...pack.companionLore
      .filter((l) => !(l.handling > 1 && l.cost > 0))
      .map((l) => `lore "${l.id}" helps nothing or costs nothing`),
  ];
}

export function validateCompanionArts(pack: ContentPack): string[] {
  return [
    ...kindTechniqueProblems(pack),
    ...roleProblems(pack),
    ...handlingProblems(pack),
    ...loreProblems(pack),
  ];
}
