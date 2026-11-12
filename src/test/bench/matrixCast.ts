import type { CombatPerk, CombatTechnique, CombatTrait } from '@/systems/combat';
import { withCalls } from '@/game/combatants';
import { personDust } from '@/game/dust/dust';
import { foeHive } from '@/game/hives/hive';
import { withPuppets } from '@/game/puppets';
import { ctx } from '@/test/gameFixtures';

import { ARCHETYPE_IDS, archetype, type ArchetypeId } from './archetypes';
import { statLine, techniques, type FighterSpec, type Scale, type StatProfile } from './fighters';

/**
 * The matrix cast (`matrix.test.ts`): the bench's archetypes and one build for every other way
 * a shinobi fights, so each approach meets each other at an equal grade. Every build spends the
 * same budget as the archetypes: two peak stats, three strong, two weak, the rest the scale's
 * base, and every build has a way to wound. Built from the original
 * pack where it has the techniques; the ladder and the killing set-up have none there yet, so
 * they bring bench-only techniques of their own (named here, never in content).
 */

interface Build {
  readonly label: string;
  readonly profile: StatProfile;
  readonly techniqueIds: readonly string[];
  readonly own?: readonly CombatTechnique[];
  readonly traits?: readonly CombatTrait[];
  readonly perks?: readonly CombatPerk[];
  readonly extend?: FighterSpec['extend'];
}

/** A bench-only gate: an empower that opens a step of a ladder, as the Eight Gates do. */
const gate = (id: string, step: number): CombatTechnique => ({
  id,
  name: `Bench gate ${step}`,
  discipline: 'taijutsu',
  effects: [
    { verb: 'empower', power: 10, boosts: ['strength', 'speed'], opens: { ladder: 'gates', step } },
  ],
  chakraCost: 8,
});

/** A bench-only killing blow: through a guard on a target who can't see it or can't move. */
const killingBlow: CombatTechnique = {
  id: 'bench-killing-blow',
  name: 'Bench killing blow',
  discipline: 'ninjutsu',
  lethal: true,
  reach: ['close'],
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 20,
};

const BUILDS = {
  areaCaster: {
    label: 'Area caster',
    profile: {
      ninjutsu: 'peak',
      chakraControl: 'peak',
      reserves: 'strong',
      perception: 'strong',
      intellect: 'strong',
      taijutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['lantern-scatter', 'ember-rain', 'great-gale'],
  },
  sealer: {
    label: 'Sealer',
    profile: {
      fuuinjutsu: 'peak',
      chakraControl: 'peak',
      intellect: 'strong',
      kenjutsu: 'strong',
      speed: 'strong',
      genjutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['binding-ward', 'ink-chain-seal', 'cut-the-wick', 'lantern-cut'],
  },
  trapper: {
    label: 'Trapper',
    profile: {
      fuuinjutsu: 'peak',
      perception: 'peak',
      intellect: 'strong',
      kenjutsu: 'strong',
      speed: 'strong',
      genjutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['snare-ward', 'kiln-mine', 'blast-ring', 'lantern-cut'],
  },
  medic: {
    label: 'Medic',
    profile: {
      ninjutsu: 'strong',
      chakraControl: 'peak',
      taijutsu: 'peak',
      speed: 'strong',
      stamina: 'strong',
      genjutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['mending-glow', 'moss-mend', 'palm-strike', 'gale-heel'],
  },
  sensor: {
    label: 'Sensor',
    profile: {
      perception: 'peak',
      ninjutsu: 'peak',
      speed: 'strong',
      taijutsu: 'strong',
      chakraControl: 'strong',
      genjutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['wick-sense', 'cedar-hush', 'tide-lash', 'palm-strike'],
  },
  cloner: {
    label: 'Cloner',
    profile: {
      ninjutsu: 'strong',
      taijutsu: 'peak',
      reserves: 'peak',
      speed: 'strong',
      stamina: 'strong',
      genjutsu: 'weak',
      fuuinjutsu: 'weak',
    },
    techniqueIds: ['lantern-shades', 'palm-strike', 'gale-heel'],
  },
  counterer: {
    label: 'Counter-fighter',
    profile: {
      kenjutsu: 'peak',
      perception: 'peak',
      speed: 'strong',
      strength: 'strong',
      stamina: 'strong',
      ninjutsu: 'weak',
      genjutsu: 'weak',
    },
    techniqueIds: ['still-water', 'return-current', 'lantern-cut'],
  },
  shrouded: {
    label: 'Shrouded',
    profile: {
      ninjutsu: 'strong',
      taijutsu: 'peak',
      stamina: 'peak',
      strength: 'strong',
      speed: 'strong',
      genjutsu: 'weak',
      fuuinjutsu: 'weak',
    },
    techniqueIds: ['lantern-skin', 'palm-strike', 'gale-heel', 'crescent-drop'],
  },
  summoner: {
    label: 'Summoner',
    profile: {
      ninjutsu: 'peak',
      reserves: 'peak',
      chakraControl: 'strong',
      perception: 'strong',
      intellect: 'strong',
      taijutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['lantern-scatter', 'ember-breath', 'palm-strike'],
    extend: (s) =>
      withCalls(
        s,
        ['kiln-newt', 'ember-salamander'].map((id) => ctx.content.summons.require(id)),
        ctx,
      ),
  },
  puppeteer: {
    label: 'Puppeteer',
    profile: {
      chakraControl: 'peak',
      intellect: 'peak',
      perception: 'strong',
      ninjutsu: 'strong',
      speed: 'strong',
      taijutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['palm-strike', 'tide-lash'],
    extend: (s) => withPuppets(s, ['lantern-doll'], ctx),
  },
  hive: {
    label: 'Hive host',
    profile: {
      ninjutsu: 'peak',
      genjutsu: 'peak',
      reserves: 'strong',
      chakraControl: 'strong',
      perception: 'strong',
      taijutsu: 'weak',
      strength: 'weak',
    },
    techniqueIds: ['toga-moth-dust', 'toga-scale-blind', 'toga-moth-veil', 'toga-lantern-swarm'],
    extend: (s) => {
      const swarm = foeHive('lantern-moth', statLine('chunin', {}), ctx);
      return swarm ? { ...s, swarm } : s;
    },
  },
  dust: {
    label: 'Dust user',
    profile: {
      ninjutsu: 'peak',
      chakraControl: 'peak',
      stamina: 'strong',
      reserves: 'strong',
      perception: 'strong',
      speed: 'weak',
      genjutsu: 'weak',
    },
    techniqueIds: ['haibara-ash-puff', 'haibara-cinder-bind', 'haibara-kiln-storm'],
    extend: (s) => {
      const dust = personDust({ clan: undefined, dustId: 'ash', vessel: undefined }, ctx);
      return dust ? { ...s, dust } : s;
    },
  },
  gates: {
    label: 'Gate opener',
    profile: {
      taijutsu: 'peak',
      stamina: 'peak',
      strength: 'strong',
      speed: 'strong',
      willpower: 'strong',
      ninjutsu: 'weak',
      genjutsu: 'weak',
    },
    techniqueIds: ['palm-strike', 'gale-heel', 'crescent-drop'],
    own: [gate('bench-gate-1', 1), gate('bench-gate-2', 2), gate('bench-gate-3', 3)],
    traits: ['brawler'],
  },
  assassin: {
    label: 'Set-up killer',
    profile: {
      ninjutsu: 'peak',
      intellect: 'peak',
      genjutsu: 'strong',
      speed: 'strong',
      fuuinjutsu: 'strong',
      strength: 'weak',
      stamina: 'weak',
    },
    techniqueIds: ['paper-veil', 'binding-ward', 'lantern-cut'],
    own: [killingBlow],
  },
  foresight: {
    label: 'Foreseer',
    profile: {
      taijutsu: 'peak',
      perception: 'peak',
      ninjutsu: 'strong',
      speed: 'strong',
      intellect: 'strong',
      genjutsu: 'weak',
      fuuinjutsu: 'weak',
    },
    techniqueIds: ['palm-strike', 'ember-breath', 'gale-heel'],
    perks: ['insight', 'foresight'],
  },
  mimic: {
    label: 'Mimic',
    profile: {
      taijutsu: 'peak',
      perception: 'peak',
      ninjutsu: 'strong',
      speed: 'strong',
      intellect: 'strong',
      genjutsu: 'weak',
      fuuinjutsu: 'weak',
    },
    techniqueIds: ['palm-strike', 'ember-breath', 'gale-heel'],
    perks: ['insight', 'foresight', 'mimicry'],
  },
} satisfies Record<string, Build>;

export type BuildId = keyof typeof BUILDS;
export const BUILD_IDS = Object.keys(BUILDS) as BuildId[];

function build(id: BuildId, scale: Scale): FighterSpec {
  const b: Build = BUILDS[id];
  return {
    name: `${b.label} (${scale})`,
    stats: statLine(scale, b.profile),
    techniques: [...techniques(b.techniqueIds), ...(b.own ?? [])],
    ...(b.traits ? { traits: b.traits } : {}),
    ...(b.perks ? { perks: b.perks } : {}),
    ...(b.extend ? { extend: b.extend } : {}),
  };
}

export type CastId = ArchetypeId | BuildId;
export const CAST_IDS: readonly CastId[] = [...ARCHETYPE_IDS, ...BUILD_IDS];

/** A member of the matrix cast at a scale. */
export function castMember(id: CastId, scale: Scale): FighterSpec {
  return (ARCHETYPE_IDS as readonly string[]).includes(id)
    ? archetype(id as ArchetypeId, scale)
    : build(id as BuildId, scale);
}
