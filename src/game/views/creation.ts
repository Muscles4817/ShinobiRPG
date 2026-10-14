import { DEFAULT_BUILD_ID, type BackdropId } from '@/content';
import { describeSpec, type EffectLine } from '@/systems/modifiers';
import {
  ARCHETYPE_IDS,
  ARCHETYPES,
  BLANK_FILE,
  DEFAULT_APPEARANCE,
  EYE_COLOURS,
  HAIR_COLOURS,
  HAIR_STYLES,
  HEADBAND_PLACES,
  OUTFIT_COLOURS,
  CLASS_STANDINGS,
  DEFAULT_STANDING,
  PRONOUNS,
  SKIN_TONES,
  STANDING_INFO,
  type ArchetypeId,
  type ClassStanding,
} from '@/systems/profile';
import { checkChance, STAT_INFO, type StatDelta, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Discipline, type Element } from '@/systems/techniques';

import type { GameContext } from '../context';
import type { CreationDraft } from '../creation';
import { filledFile } from '../creationDraft';
import { BASE_STAT } from '../student';
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

/** A place in the class: its early training and its talent, said as the file would say them. */
export interface StandingOption extends ProfileOption {
  readonly id: ClassStanding;
}

/** How a child was raised; offered to clan children or to everyone else. */
export interface UpbringingOption extends ProfileOption {
  readonly family: 'clan' | 'clanless';
}

/** A kind of student a quick pick fills the file as. */
export interface ArchetypeOption {
  readonly id: ArchetypeId;
  readonly name: string;
  readonly description: string;
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
  readonly upbringings: readonly UpbringingOption[];
  readonly builds: readonly ProfileOption[];
  readonly archetypes: readonly ArchetypeOption[];
  readonly talents: readonly ProfileOption[];
  readonly traits: readonly TraitOption[];
  readonly nindos: readonly ProfileOption[];
  readonly natures: readonly { id: Element; name: string; description: string }[];
  readonly disciplines: readonly { id: Discipline; name: string; starter: string }[];
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
  const { scale } = STANDING_INFO[standing].talent;
  if (scale > 1) return [{ label: 'Talent runs high', tone: 'gain' }];
  return scale < 1 ? [{ label: 'Talent runs low', tone: 'cost' }] : [];
}

function highLabel(count: number): string {
  return count === 1 ? 'One stat may graduate at C' : `Up to ${count} stats may graduate at C`;
}

/** Early training and gifts, against the middle of the class. */
function fileLines(standing: ClassStanding): EffectLine[] {
  const { development, gifts } = STANDING_INFO[standing];
  const middle = STANDING_INFO[DEFAULT_STANDING];
  const points = development.points - middle.development.points;
  const training: EffectLine = {
    label: `${development.points} points of early training`,
    tone: points >= 0 ? 'gain' : 'cost',
  };
  const reach: EffectLine[] =
    development.highStats > 0 ? [{ label: highLabel(development.highStats), tone: 'gain' }] : [];
  const known: EffectLine = {
    label:
      gifts.gifts === 0
        ? 'No gifts on your file'
        : `${gifts.gifts} known ${gifts.gifts === 1 ? 'gift' : 'gifts'}`,
    tone: gifts.gifts >= middle.gifts.gifts ? 'gain' : 'cost',
  };
  const prodigy: EffectLine[] = gifts.prodigy ? [{ label: 'A prodigy’s gift', tone: 'gain' }] : [];
  return [training, ...reach, known, ...prodigy];
}

function standingOption(standing: ClassStanding): StandingOption {
  const info = STANDING_INFO[standing];
  return {
    id: standing,
    name: info.label,
    description: info.note,
    effects: [...fileLines(standing), ...talentLines(standing), ...describeSpec(info.modifiers)],
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
    upbringings: content.upbringings.all.map((u) => ({
      id: u.id,
      name: u.name,
      description: u.description,
      family: u.family,
      effects: [
        ...(u.earlyTraining > 0
          ? [{ label: `${u.earlyTraining} more points of early training`, tone: 'gain' as const }]
          : []),
        ...describeSpec(u.modifiers),
      ],
    })),
    builds: content.builds.all.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      effects: [...statEffects(b.statBonuses), ...describeSpec(b.modifiers)],
    })),
    archetypes: ARCHETYPE_IDS.map((id) => ({
      id,
      name: ARCHETYPES[id].label,
      description: ARCHETYPES[id].note,
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
    natures: ELEMENTS.map((e) => ({ id: e, name: capitalise(e), description: NATURE_TEXT[e] })),
    disciplines: DISCIPLINES.map((d) => ({
      id: d,
      name: STAT_INFO[d].label,
      starter: content.techniques.require(content.disciplineStarters[d]).name,
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

/** The quick pick a new draft starts from. */
const FIRST_PICK = { archetype: 'steady', specialty: 'taijutsu' } as const;

/** A sensible starting draft for the creation screens. */
export function defaultDraft(ctx: GameContext): CreationDraft {
  const { content } = ctx;
  const [first] = content.traits.all;
  const second = content.traits.all.find((t) => t.id !== first?.id && t.id !== first?.opposite);
  const blank: CreationDraft = {
    name: '',
    familyName: '',
    pronouns: 'they',
    appearance: DEFAULT_APPEARANCE,
    clanId: 'none',
    standing: DEFAULT_STANDING,
    upbringingId: content.upbringings.all.find((u) => u.family === 'clanless')?.id ?? '',
    buildId: content.builds.all.find((b) => b.id === DEFAULT_BUILD_ID)?.id ?? '',
    file: BLANK_FILE,
    quickPick: FIRST_PICK,
    nature: 'fire',
    traitIds: [first?.id, second?.id].filter((id): id is string => id !== undefined),
    talentId: content.talents.all[0]?.id ?? '',
    nindoId: content.nindos.all[0]?.id ?? '',
    breakInApproachId: content.breakIn.approaches[0]?.id ?? '',
  };
  return { ...blank, file: filledFile(blank, FIRST_PICK, ctx) };
}
