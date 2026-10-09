import type { BackdropId } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import {
  DEFAULT_APPEARANCE,
  EYE_COLOURS,
  GRADE_INFO,
  GRADES,
  gradesFromQuickPick,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  POINT_BUDGET,
  PRONOUNS,
  SKIN_TONES,
  type Grade,
} from '@/systems/profile';
import { checkChance, STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Discipline, type Element } from '@/systems/techniques';

import type { GameContext } from '../context';
import { BASE_STAT, type CreationDraft } from '../creation';

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
  readonly pointBudget: number;
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

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
    natures: ELEMENTS.map((e) => ({ id: e, name: capital(e), description: NATURE_TEXT[e] })),
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
    pointBudget: POINT_BUDGET,
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
    grades: gradesFromQuickPick({
      specialty: 'taijutsu',
      strength: 'ninjutsu',
      weakness: 'genjutsu',
    }),
    nature: 'fire',
    traitIds: [first?.id, second?.id].filter((id): id is string => id !== undefined),
    talentId: content.talents.all[0]?.id ?? '',
    nindoId: content.nindos.all[0]?.id ?? '',
    breakInApproachId: content.breakIn.approaches[0]?.id ?? '',
  };
}
