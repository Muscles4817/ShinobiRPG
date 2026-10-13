import type { BackdropId } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import {
  DEFAULT_APPEARANCE,
  EYE_COLOURS,
  GRADE_INFO,
  GRADES,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  CLASS_STANDINGS,
  DEFAULT_STANDING,
  PRONOUNS,
  quickGrades,
  SKIN_TONES,
  STANDING_INFO,
  type ClassStanding,
  type Grade,
  type QuickGrades,
} from '@/systems/profile';
import { checkChance, STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Discipline, type Element } from '@/systems/techniques';

import type { GameContext } from '../context';
import { BASE_STAT, type CreationDraft } from '../creation';
import { capitalise } from './common';

/** Everything the academy break-in scene offers, with effects spelled out as chips. */

export interface ProfileOption {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly effects: readonly EffectLine[];
}

export interface ClanOption extends ProfileOption {
  readonly nature: Element | null;
  readonly kekkeiGenkai: {
    readonly name: string;
    readonly description: string;
    readonly dormant: boolean;
  } | null;
  readonly techniques: readonly string[];
  readonly lodging: string | null;
}

export interface TraitOption extends ProfileOption {
  readonly opposite: string | null;
}

/** A place in the class: its grades and its talent, said as the file would say them. */
export interface StandingOption extends ProfileOption {
  readonly id: ClassStanding;
  readonly budget: number;
  readonly quick: QuickGrades;
}

export interface CreationView {
  readonly world: {
    readonly village: string;
    readonly epithet: string;
    readonly backdrop: BackdropId;
    readonly graduate: string;
  };
  readonly intro: string;
  readonly records: string;
  readonly instructor: string;
  readonly caught: string;
  readonly approaches: readonly { id: string; label: string; stat: string; chance: number }[];
  readonly clans: readonly ClanOption[];
  readonly standings: readonly StandingOption[];
  readonly talents: readonly ProfileOption[];
  readonly traits: readonly TraitOption[];
  readonly nindos: readonly ProfileOption[];
  readonly natures: readonly { id: Element; name: string; description: string }[];
  readonly disciplines: readonly { id: Discipline; name: string; starter: string }[];
  readonly grades: readonly {
    grade: Grade;
    label: string;
    statBonus: number;
    pacePct: number;
    cost: number;
  }[];
  readonly palettes: {
    readonly hairStyles: readonly string[];
    readonly hairColours: readonly string[];
    readonly eyeColours: readonly string[];
    readonly skinTones: readonly string[];
    readonly outfitColours: readonly string[];
    readonly headbandPlaces: readonly string[];
    readonly pronouns: readonly string[];
  };
}

const NATURE_TEXT: Readonly<Record<Element, string>> = {
  fire: 'Burning, relentless. Strong against wind.',
  wind: 'Cutting, sharp. Strong against lightning.',
  lightning: 'Piercing, fast. Strong against earth.',
  earth: 'Solid, patient. Strong against water.',
  water: 'Flowing, adaptable. Strong against fire.',
};

function statEffects(delta: StatDelta): EffectLine[] {
  return (Object.entries(delta) as [StatId, number][])
    .filter(([, v]) => v !== 0)
    .map(([id, v]) => ({
      label: `${STAT_INFO[id].label} ${v > 0 ? '+' : '−'}${Math.abs(v)}`,
      tone: v > 0 ? 'gain' : 'cost',
    }));
}

/** How a standing's talent roll reads on its card, never as numbers; nothing for the middle. */
function talentLines(standing: ClassStanding): EffectLine[] {
  const { scale, specialtyAtLeast } = STANDING_INFO[standing].talent;
  if (specialtyAtLeast !== undefined) {
    return [{ label: 'Gifted in your best arts, whatever the dice', tone: 'gain' }];
  }
  if (scale > 1) return [{ label: 'Talent runs high', tone: 'gain' }];
  return scale < 1 ? [{ label: 'Talent runs low', tone: 'cost' }] : [];
}

/** The quick pick's grades, as a gain above the middle of the class and a cost below it. */
function gradesLines(standing: ClassStanding): EffectLine[] {
  const { quick, budget } = STANDING_INFO[standing];
  const middle = STANDING_INFO[DEFAULT_STANDING].budget;
  if (budget === middle) return [];
  const label = `Grades ${quick.specialty}, ${quick.strength} and ${quick.weakness}, the rest ${quick.rest}`;
  return [{ label, tone: budget > middle ? 'gain' : 'cost' }];
}

function standingOption(standing: ClassStanding): StandingOption {
  const info = STANDING_INFO[standing];
  return {
    id: standing,
    name: info.label,
    description: info.note,
    effects: [...gradesLines(standing), ...talentLines(standing), ...describeSpec(info.modifiers)],
    budget: info.budget,
    quick: info.quick,
  };
}

export function creationView(ctx: GameContext): CreationView {
  const { content } = ctx;
  const { breakIn } = content;
  const village = content.locations.require(content.startLocationId);
  return {
    world: {
      village: village.name,
      epithet: village.epithet,
      backdrop: village.backdrop,
      graduate: content.text.graduate,
    },
    intro: breakIn.intro,
    records: breakIn.records,
    instructor: breakIn.instructor,
    caught: breakIn.caught,
    approaches: breakIn.approaches.map((a) => ({
      id: a.id,
      label: a.label,
      stat: STAT_INFO[a.stat].label,
      chance: Math.round(checkChance(BASE_STAT, a.difficulty) * 100),
    })),
    clans: content.clans.all.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      effects: [...statEffects(c.statBonuses), ...describeSpec(c.modifiers)],
      nature: c.nature ?? null,
      kekkeiGenkai: c.kekkeiGenkai ?? null,
      techniques: c.startingTechniqueIds.map((id) => content.techniques.require(id).name),
      lodging: c.lodging ?? null,
    })),
    standings: CLASS_STANDINGS.map(standingOption),
    talents: content.talents.all.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      effects: [...statEffects(t.statBonuses), ...describeSpec(t.modifiers)],
    })),
    traits: content.traits.all.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.note,
      effects: describeSpec(t.modifiers),
      opposite: t.opposite ?? null,
    })),
    nindos: content.nindos.all.map((n) => ({
      id: n.id,
      name: n.name,
      description: n.essay,
      effects: [],
    })),
    natures: ELEMENTS.map((e) => ({ id: e, name: capitalise(e), description: NATURE_TEXT[e] })),
    disciplines: DISCIPLINES.map((d) => ({
      id: d,
      name: STAT_INFO[d].label,
      starter: content.techniques.require(content.disciplineStarters[d]).name,
    })),
    grades: GRADES.map((g) => ({
      grade: g,
      label: GRADE_INFO[g].label,
      statBonus: GRADE_INFO[g].statBonus,
      pacePct: Math.round((GRADE_INFO[g].pace - 1) * 100),
      cost: GRADE_INFO[g].cost,
    })),
    palettes: {
      hairStyles: HAIR_STYLES,
      hairColours: HAIR_COLOURS,
      eyeColours: EYE_COLOURS,
      skinTones: SKIN_TONES,
      outfitColours: OUTFIT_COLOURS,
      headbandPlaces: HEADBAND_PLACES,
      pronouns: PRONOUNS,
    },
  };
}

/** A sensible starting draft for the creation screens. */
export function defaultDraft(ctx: GameContext): CreationDraft {
  const { content } = ctx;
  const [first] = content.traits.all;
  const second = content.traits.all.find((t) => t.id !== first?.id && t.id !== first?.opposite);
  return {
    name: '',
    familyName: '',
    pronouns: 'they',
    appearance: DEFAULT_APPEARANCE,
    clanId: 'none',
    standing: DEFAULT_STANDING,
    grades: quickGrades(
      { specialty: 'taijutsu', strength: 'ninjutsu', weakness: 'genjutsu' },
      DEFAULT_STANDING,
    ),
    nature: 'fire',
    traitIds: [first?.id, second?.id].filter((id): id is string => id !== undefined),
    talentId: content.talents.all[0]?.id ?? '',
    nindoId: content.nindos.all[0]?.id ?? '',
    breakInApproachId: content.breakIn.approaches[0]?.id ?? '',
  };
}
