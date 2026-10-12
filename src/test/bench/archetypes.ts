import type { CombatPerk, CombatTrait } from '@/systems/combat';

import {
  evenLine,
  GRADE_MIDPOINT,
  SCALE_VALUES,
  statLine,
  techniques,
  type BenchLoadout,
  type FighterSpec,
  type Scale,
  type StatProfile,
} from './fighters';

/**
 * The bench's cast. Archetypes are the reference builds from the design discussion, each
 * flavoured after a well-known fighter (named in comments only); foes are a fixed set of
 * opponents with one clear trick each. Both come at genin, chūnin and jōnin scale.
 */

interface Archetype {
  readonly label: string;
  readonly profile: StatProfile;
  readonly techniqueIds: readonly string[];
  readonly traits?: readonly CombatTrait[];
  readonly perks?: readonly CombatPerk[];
  readonly plan?: BenchLoadout;
}

export const ARCHETYPE_IDS = [
  'rusher',
  'powerhouse',
  'versatile',
  'illusionist',
  'stalker',
  'mistBlade',
] as const;
export type ArchetypeId = (typeof ARCHETYPE_IDS)[number];

const ARCHETYPES: Readonly<Record<ArchetypeId, Archetype>> = {
  // Lee: all taijutsu and speed, no ninjutsu or genjutsu to speak of.
  rusher: {
    label: 'Rusher',
    profile: {
      taijutsu: 'peak',
      speed: 'peak',
      strength: 'strong',
      stamina: 'strong',
      willpower: 'strong',
      ninjutsu: 'weak',
      genjutsu: 'weak',
      chakraControl: 'weak',
    },
    techniqueIds: ['palm-strike', 'gale-heel', 'crescent-drop'],
    traits: ['brawler', 'swift'],
    plan: {
      close: ['jutsu:crescent-drop', 'jutsu:gale-heel', 'strike'],
      mid: ['step-in', 'dodge', 'throw'],
      far: ['step-in', 'dodge', 'throw'],
    },
  },
  // Guy: the same road walked further; raw strength and endurance.
  powerhouse: {
    label: 'Powerhouse',
    profile: {
      taijutsu: 'peak',
      strength: 'peak',
      stamina: 'peak',
      speed: 'strong',
      willpower: 'strong',
      ninjutsu: 'weak',
      genjutsu: 'weak',
    },
    techniqueIds: ['palm-strike', 'gale-heel', 'crescent-drop', 'iron-gate-palm'],
    traits: ['brawler'],
  },
  // Kakashi: good at everything, sharp-eyed, short on stamina.
  versatile: {
    label: 'Versatile',
    profile: {
      ninjutsu: 'peak',
      intellect: 'peak',
      perception: 'peak',
      taijutsu: 'strong',
      genjutsu: 'strong',
      kenjutsu: 'strong',
      speed: 'strong',
      chakraControl: 'strong',
      stamina: 'weak',
    },
    techniqueIds: ['palm-strike', 'shadow-feint', 'ember-breath', 'tide-lash', 'lantern-cut'],
    perks: ['insight'],
  },
  // Itachi: illusions first, fire second, never where you strike.
  illusionist: {
    label: 'Illusionist',
    profile: {
      genjutsu: 'peak',
      chakraControl: 'peak',
      perception: 'peak',
      ninjutsu: 'strong',
      speed: 'strong',
      intellect: 'strong',
      stamina: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['lantern-mirage', 'whispering-dread', 'ember-breath'],
    traits: ['illusionist'],
    perks: ['insight'],
  },
  // Zabuza: a heavy blade out of the mist.
  stalker: {
    label: 'Stalker',
    profile: {
      kenjutsu: 'peak',
      strength: 'strong',
      speed: 'strong',
      stamina: 'strong',
      perception: 'strong',
      genjutsu: 'weak',
      chakraControl: 'weak',
    },
    techniqueIds: ['lantern-cut', 'moonfall-slash', 'tide-lash'],
    traits: ['illusionist'],
  },
  // Zabuza again, the other way: no illusion, a mist over the field and a blade inside it.
  mistBlade: {
    label: 'Mist blade',
    profile: {
      kenjutsu: 'peak',
      ninjutsu: 'strong',
      strength: 'strong',
      stamina: 'strong',
      speed: 'strong',
      genjutsu: 'weak',
    },
    techniqueIds: ['river-fog', 'lantern-cut', 'moonfall-slash', 'snuffed-wick-step'],
  },
};

export function archetype(id: ArchetypeId, scale: Scale): FighterSpec {
  const a = ARCHETYPES[id];
  return {
    name: `${a.label} (${scale})`,
    stats: statLine(scale, a.profile),
    techniques: techniques(a.techniqueIds),
    ...(a.traits ? { traits: a.traits } : {}),
    ...(a.perks ? { perks: a.perks } : {}),
    ...(a.plan ? { plan: a.plan } : {}),
  };
}

export const FOE_IDS = ['brute', 'archer', 'skirmisher', 'trickster', 'guardian'] as const;
export type FoeId = (typeof FOE_IDS)[number];

interface Foe {
  readonly label: string;
  readonly profile: StatProfile;
  readonly techniqueIds: readonly string[];
  readonly traits: readonly CombatTrait[];
}

const FOES: Readonly<Record<FoeId, Foe>> = {
  brute: {
    label: 'Brute',
    profile: { strength: 'strong', taijutsu: 'strong', stamina: 'strong', intellect: 'weak' },
    techniqueIds: ['palm-strike'],
    traits: ['brawler'],
  },
  archer: {
    label: 'Archer',
    profile: { perception: 'strong', speed: 'strong', strength: 'weak' },
    techniqueIds: [],
    traits: ['archer'],
  },
  skirmisher: {
    label: 'Skirmisher',
    profile: { speed: 'strong', taijutsu: 'strong', stamina: 'weak' },
    techniqueIds: ['palm-strike'],
    traits: ['swift', 'coward'],
  },
  trickster: {
    label: 'Trickster',
    profile: { genjutsu: 'strong', chakraControl: 'strong', strength: 'weak' },
    techniqueIds: ['shadow-feint', 'whispering-dread'],
    traits: ['illusionist'],
  },
  guardian: {
    label: 'Guardian',
    profile: { stamina: 'strong', strength: 'strong', kenjutsu: 'strong', speed: 'weak' },
    techniqueIds: ['lantern-cut'],
    traits: ['armoured'],
  },
};

export function foe(id: FoeId, scale: Scale): FighterSpec {
  const f = FOES[id];
  return {
    name: `${f.label} (${scale})`,
    stats: statLine(scale, f.profile),
    techniques: techniques(f.techniqueIds),
    traits: f.traits,
  };
}

/** A plain fighter: every stat at one value, the basic blows only, no kit. */
export function plainFighter(value: number): FighterSpec {
  return { name: `Plain ${value}`, stats: evenLine(value), techniques: [] };
}

/** A plain fighter squarely in the middle of a grade. */
export function plainAtGrade(grade: keyof typeof GRADE_MIDPOINT): FighterSpec {
  return { ...plainFighter(GRADE_MIDPOINT[grade]), name: `Plain ${grade}` };
}

/** A plain fighter at a scale's base value, the everyday opponent of that rank. */
export function plainAtScale(scale: Scale): FighterSpec {
  return { ...plainFighter(SCALE_VALUES[scale].base), name: `Plain (${scale})` };
}
