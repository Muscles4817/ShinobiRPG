import { gradeValue, type PuppetDef, type PuppetFrameDef } from '@/content';
import {
  builtValue,
  materialToughness,
  type BuiltSheet,
  type OwnedPuppet,
} from '@/systems/puppets';
import { createStats, type Stats } from '@/systems/stats';
import type { TechniqueDef } from '@/systems/techniques';

import type { GameContext } from '../context';

/**
 * A puppet you built, as a fight sees it: its frame's ceilings worked up as far as your craft (when
 * you finished it) and its material allow, the frame's body made tougher or frailer by what it is
 * made of, and its mechanisms' techniques. Each gets an unsealing of its own, made here and never
 * written in a pack, so building one needs no content.
 */

const SCHOOL = 'Built Puppetry';
/** What an unsealing of your own costs to cast. */
const UNSEAL_COST = 8;
/** What a mind never drives on its own: the master's mind works it, so the frame's is nothing. */
const MINDLESS = 1;

function builtStats(frame: PuppetFrameDef, sheet: BuiltSheet, quality: 1 | 2 | 3): Stats {
  const worked = (grade: PuppetFrameDef['body']['speed']) =>
    builtValue(gradeValue(grade), sheet.craftAt, quality);
  const arts = Object.fromEntries(
    Object.entries(frame.arts).map(([art, grade]) => [art, worked(grade)]),
  );
  return {
    ...createStats(MINDLESS),
    strength: worked(frame.body.strength),
    speed: worked(frame.body.speed),
    stamina: worked(frame.body.stamina),
    ...arts,
  };
}

/** The id of the unsealing a built puppet of yours is called by. */
export function unsealingId(puppetId: string): string {
  return `unseal-${puppetId}`;
}

/** A puppet you built, as a pack's puppet would be written. */
export function builtDef(owned: OwnedPuppet, sheet: BuiltSheet, ctx: GameContext): PuppetDef {
  const frame = ctx.content.puppetFrames.require(sheet.frameId);
  const material = ctx.content.puppetMaterials.require(sheet.materialId);
  const techniqueIds = sheet.partIds.map((id) => ctx.content.puppetParts.require(id).techniqueId);
  return {
    id: owned.id,
    name: owned.name,
    description: `${frame.name} of ${material.name.toLowerCase()}. ${frame.description}`,
    techniqueId: unsealingId(owned.id),
    stats: builtStats(frame, sheet, material.quality),
    healthScale: frame.healthScale * materialToughness(material.quality),
    maxChakra: frame.maxChakra,
    techniqueIds,
    upkeep: frame.upkeep,
    ...(frame.traits ? { traits: frame.traits } : {}),
    ...(frame.worn ? { worn: true as const } : {}),
  };
}

/** The unsealing of a puppet you built: its own scroll, its own card. */
export function builtUnsealing(def: PuppetDef): TechniqueDef {
  return {
    id: def.techniqueId,
    name: `Unsealing: ${def.name}`,
    description: `${def.name} unfolds out of its scroll on your threads.`,
    discipline: 'ninjutsu',
    school: SCHOOL,
    effects: [{ verb: 'summon', power: 1, call: def.id }],
    chakraCost: UNSEAL_COST,
    rank: 'D',
    difficulty: 60,
  };
}
