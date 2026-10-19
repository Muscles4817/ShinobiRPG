import type { EnemyDef } from '@/content';
import { listed } from '@/core';
import type { CombatantSetup, CombatGear, CombatPerk } from '@/systems/combat';
import type { Danger } from '@/systems/missions';
import { STAT_IDS, STAT_INFO, statTier, type StatGrade, type StatGroup } from '@/systems/stats';

import type { GameContext } from '../context';
import { createNewGame } from '../creation';
import { traitNotes, type TraitNote } from '../scouting';
import type { GameState } from '../state';
import type { Discipline } from '../views/common';
import { reviseDraft } from '../creationDraft';
import { defaultDraft } from '../views/creation';
import { techniqueSheet, type TechniqueSheet } from '../views/techniqueSheet';
import { contenderOf, statsOf, versusRoster, type VersusFighter } from './roster';
import { setupOf } from './sides';

/**
 * A fighter's profile in versus, read before the bout: who they are, their stats as grades and
 * what they bring into the fight (techniques with their sheets, gear, tools, kit, perks and the
 * bodies beside them), all read from the same setup the fight would be given.
 */

/** Any fixed seed: a profile reads only content, never the sandbox's own roll. */
const PROFILE_SEED = 1;
/** The sandbox's own character is never shown; it only needs a name to be made. */
const SANDBOX_NAME = 'Reader';

export interface ProfileStat {
  readonly label: string;
  readonly group: StatGroup;
  readonly grade: StatGrade;
}

export interface ProfileTechnique {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly rank: StatGrade;
  /** At a glance, for the card: how hard it hits and where it reaches ("Heavy, close and mid"). */
  readonly glance: string;
  readonly sheet: TechniqueSheet;
}

export interface VersusProfile {
  readonly fighter: VersusFighter;
  /** Their bio, or a foe's description. */
  readonly about: string;
  /** How dangerous a foe is, in words; null for a shinobi. */
  readonly danger: string | null;
  /** Their chakra nature, when they fight with one. */
  readonly nature: string | null;
  readonly specialty: string | null;
  readonly stats: readonly ProfileStat[];
  readonly techniques: readonly ProfileTechnique[];
  readonly gear: readonly string[];
  readonly tools: readonly string[];
  readonly kit: readonly TraitNote[];
  readonly perks: readonly string[];
  /** Bodies that fight beside them, and summons they can call. */
  readonly beside: readonly string[];
}

const DANGER_WORDS: Readonly<Record<Danger, string>> = {
  petty: 'Petty: no real threat to a shinobi',
  armed: 'Armed: a fight worth taking seriously',
  deadly: 'Deadly: a match for trained shinobi',
  elite: 'Elite: among the most dangerous there are',
};

const PERK_WORDS: Readonly<Record<CombatPerk, string>> = {
  insight: 'Insight: eyes that read a fight',
  foresight: 'Foresight: sees attacks coming and adapts between rounds',
  mimicry: 'Mimicry: copies a technique it has watched',
  'water-walking': 'Walks on water',
  'tree-walking': 'Walks up trees',
};

const sandboxes = new WeakMap<GameContext, GameState>();

/** A fresh game of the pack, to read setups and sheets against; one per world. */
function sandboxOf(ctx: GameContext): GameState {
  const known = sandboxes.get(ctx);
  if (known) return known;
  const draft = reviseDraft(defaultDraft(ctx), { name: SANDBOX_NAME }, ctx);
  const made = createNewGame({ draft, seed: PROFILE_SEED }, ctx);
  sandboxes.set(ctx, made);
  return made;
}

function capital(text: string): string {
  return `${text[0]?.toUpperCase() ?? ''}${text.slice(1)}`;
}

function gearNames(gear: CombatGear | undefined): string[] {
  if (!gear) return [];
  return [gear.held, gear.thrown, gear.armour, gear.focus].flatMap((g) => (g ? [g.name] : []));
}

function glanceAt(sheet: TechniqueSheet): string {
  const bands = listed(sheet.reach.filter((r) => r.reaches).map((r) => r.band.toLowerCase()));
  const reach = bands === '' ? 'no reach' : bands;
  return capital(sheet.strength ? `${sheet.strength.word.toLowerCase()}, ${reach}` : reach);
}

function techniquesOf(setup: CombatantSetup, state: GameState, ctx: GameContext) {
  return setup.techniques.flatMap((t): ProfileTechnique[] => {
    const def = ctx.content.techniques.get(t.id);
    if (!def) return [];
    const { id, name, description, discipline, rank } = def;
    const sheet = techniqueSheet(state, ctx, def, setup);
    return [{ id, name, description, discipline, rank, glance: glanceAt(sheet), sheet }];
  });
}

function besideOf(setup: CombatantSetup, def: EnemyDef | null, ctx: GameContext): string[] {
  const retinue = (def?.retinue ?? []).flatMap((r) => {
    const unit = ctx.content.enemies.get(r.enemyId);
    return unit ? [`${unit.name}, fighting beside them`] : [];
  });
  const calls = (setup.calls ?? []).map((c) => `${c.body.name}, a summons`);
  return [...retinue, ...calls];
}

/** What they carry in: gear, the pouch, their kit and their gifts. */
function carriedBy(setup: CombatantSetup): Pick<VersusProfile, 'gear' | 'tools' | 'kit' | 'perks'> {
  return {
    gear: gearNames(setup.gear),
    tools: (setup.items ?? []).map((i) => (i.count > 1 ? `${i.name} ×${i.count}` : i.name)),
    kit: traitNotes(setup.traits ?? []),
    perks: (setup.perks ?? []).map((p) => PERK_WORDS[p]),
  };
}

/** Everything a fighter brings to a bout, or null for an id this world doesn't have. */
export function versusProfile(ctx: GameContext, id: string): VersusProfile | null {
  const contender = contenderOf(ctx, id);
  const fighter = versusRoster(ctx).find((f) => f.id === id);
  if (!contender || !fighter) return null;
  const state = sandboxOf(ctx);
  const setup = setupOf(contender, state, ctx, fighter.title);
  const enemy = contender.kind === 'enemy' ? contender.def : null;
  const person = contender.kind === 'person' ? contender.def : null;
  const stats = statsOf(contender);
  return {
    fighter,
    about: enemy?.description ?? person?.bio ?? '',
    danger: enemy ? DANGER_WORDS[enemy.danger] : null,
    nature: setup.nature ? capital(setup.nature) : null,
    specialty: person?.specialty ? STAT_INFO[person.specialty].label : null,
    stats: STAT_IDS.map((s) => ({
      label: STAT_INFO[s].label,
      group: STAT_INFO[s].group,
      grade: statTier(stats[s]).grade,
    })),
    techniques: techniquesOf(setup, state, ctx),
    ...carriedBy(setup),
    beside: besideOf(setup, enemy, ctx),
  };
}
