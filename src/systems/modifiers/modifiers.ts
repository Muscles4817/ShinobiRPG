import { STAT_IDS, STAT_INFO, type StatId } from '@/systems/stats';
import { DISCIPLINES, ELEMENTS, type Discipline, type Element } from '@/systems/techniques';

/**
 * Multipliers that a character's identity (clan, talent, traits, grades, chakra nature)
 * applies to growth. Each source declares a ModifierSpec; `combine` multiplies them into
 * one Modifiers value that training, study and hunger read. Adding a source = add a spec.
 */
export interface ModifierSpec {
  /** Training growth per stat. */
  readonly growth?: Readonly<Partial<Record<StatId, number>>>;
  /** Training growth for every stat. */
  readonly training?: number;
  /** Study speed by technique discipline. */
  readonly studyDiscipline?: Readonly<Partial<Record<Discipline, number>>>;
  /** Study speed by technique element. */
  readonly studyElement?: Readonly<Partial<Record<Element, number>>>;
  /** How fast you get hungry. */
  readonly hungerRate?: number;
}

export interface Modifiers {
  readonly growth: Readonly<Record<StatId, number>>;
  readonly studyDiscipline: Readonly<Record<Discipline, number>>;
  readonly studyElement: Readonly<Record<Element, number>>;
  readonly hungerRate: number;
}

function filled<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 1])) as Record<K, number>;
}

export const NEUTRAL: Modifiers = {
  growth: filled(STAT_IDS),
  studyDiscipline: filled(DISCIPLINES),
  studyElement: filled(ELEMENTS),
  hungerRate: 1,
};

function scaleAll<K extends string>(
  base: Readonly<Record<K, number>>,
  by: Readonly<Partial<Record<K, number>>> | undefined,
  all = 1,
): Record<K, number> {
  const next: Record<K, number> = { ...base };
  for (const key of Object.keys(next) as K[]) next[key] = next[key] * (by?.[key] ?? 1) * all;
  return next;
}

export function combine(specs: readonly ModifierSpec[]): Modifiers {
  return specs.reduce<Modifiers>(
    (acc, spec) => ({
      growth: scaleAll(acc.growth, spec.growth, spec.training ?? 1),
      studyDiscipline: scaleAll(acc.studyDiscipline, spec.studyDiscipline),
      studyElement: scaleAll(acc.studyElement, spec.studyElement),
      hungerRate: acc.hungerRate * (spec.hungerRate ?? 1),
    }),
    NEUTRAL,
  );
}

/** Study speed for a technique: its discipline's multiplier, times its element's if any. */
export function studyMultiplier(
  mods: Modifiers,
  discipline: Discipline,
  element?: Element,
): number {
  return mods.studyDiscipline[discipline] * (element ? mods.studyElement[element] : 1);
}

export interface EffectLine {
  readonly label: string;
  readonly tone: 'gain' | 'cost';
}

function pct(multiplier: number): string {
  return `${Math.round(Math.abs(multiplier - 1) * 100)}%`;
}

function line(subject: string, multiplier: number, faster: string, slower: string): EffectLine {
  return multiplier > 1
    ? { label: `${subject} ${pct(multiplier)} ${faster}`, tone: 'gain' }
    : { label: `${subject} ${pct(multiplier)} ${slower}`, tone: 'cost' };
}

function capital(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Human-readable description of a spec, for chips on creation and profile screens. */
/** One line per discipline, or a single line when every discipline gets the same boost. */
function studyLines(study: Partial<Record<Discipline, number>>): EffectLine[] {
  const values = DISCIPLINES.map((d) => study[d]);
  const [first] = values;
  if (first !== undefined && values.every((v) => v === first)) {
    return [line('All techniques learned', first, 'faster', 'slower')];
  }
  return (Object.entries(study) as [Discipline, number][]).map(([d, m]) =>
    line(`${STAT_INFO[d].label} learned`, m, 'faster', 'slower'),
  );
}

export function describeSpec(spec: ModifierSpec): EffectLine[] {
  const lines: EffectLine[] = [];
  if (spec.training !== undefined)
    lines.push(line('All training', spec.training, 'faster', 'slower'));
  for (const [stat, m] of Object.entries(spec.growth ?? {}) as [StatId, number][]) {
    lines.push(line(`${STAT_INFO[stat].label} grows`, m, 'faster', 'slower'));
  }
  lines.push(...studyLines(spec.studyDiscipline ?? {}));
  for (const [e, m] of Object.entries(spec.studyElement ?? {}) as [Element, number][]) {
    lines.push(line(`${capital(e)} techniques learned`, m, 'faster', 'slower'));
  }
  if (spec.hungerRate !== undefined) {
    lines.push(
      spec.hungerRate > 1
        ? { label: `Get hungry ${pct(spec.hungerRate)} faster`, tone: 'cost' }
        : { label: `Get hungry ${pct(spec.hungerRate)} slower`, tone: 'gain' },
    );
  }
  return lines;
}
