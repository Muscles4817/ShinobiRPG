import { STAT_IDS, STAT_INFO, type SoloFloor, type SoloFloors, type StatId } from '@/systems/stats';
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
  /** Hard work: solo training in these stats keeps at least this efficiency up to a grade. */
  readonly soloEfficiencyFloor?: Readonly<Partial<Record<StatId, SoloFloor>>>;
  /** Energy that hard work (drills, study, sparring, lessons) costs. */
  readonly energyCost?: number;
  /** Health a night's sleep heals, and chakra it refills while you are exhausted. */
  readonly sleepHealing?: number;
  /** Extra days a night's sleep takes off every injury (adds up, not multiplied). */
  readonly injuryNights?: number;
  /** Bond gained from time with people (talk, dinner, training together, a round). */
  readonly bondGain?: number;
  /** Your stat when you take a check on a job, per stat. */
  readonly checks?: Readonly<Partial<Record<StatId, number>>>;
}

export interface Modifiers {
  readonly growth: Readonly<Record<StatId, number>>;
  readonly studyDiscipline: Readonly<Record<Discipline, number>>;
  readonly studyElement: Readonly<Record<Element, number>>;
  readonly hungerRate: number;
  /** Every hard-work floor on each stat's solo efficiency (the best one that applies wins). */
  readonly soloFloors: SoloFloors;
  readonly energyCost: number;
  readonly sleepHealing: number;
  readonly injuryNights: number;
  readonly bondGain: number;
  readonly checks: Readonly<Record<StatId, number>>;
}

function filled<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 1])) as Record<K, number>;
}

export const NEUTRAL: Modifiers = {
  growth: filled(STAT_IDS),
  studyDiscipline: filled(DISCIPLINES),
  studyElement: filled(ELEMENTS),
  hungerRate: 1,
  soloFloors: {},
  energyCost: 1,
  sleepHealing: 1,
  injuryNights: 0,
  bondGain: 1,
  checks: filled(STAT_IDS),
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

function withFloors(floors: SoloFloors, added: ModifierSpec['soloEfficiencyFloor']): SoloFloors {
  const next: Partial<Record<StatId, readonly SoloFloor[]>> = { ...floors };
  for (const [stat, floor] of Object.entries(added ?? {}) as [StatId, SoloFloor][]) {
    next[stat] = [...(floors[stat] ?? []), floor];
  }
  return next;
}

export function combine(specs: readonly ModifierSpec[]): Modifiers {
  return specs.reduce<Modifiers>(
    (acc, spec) => ({
      growth: scaleAll(acc.growth, spec.growth, spec.training ?? 1),
      studyDiscipline: scaleAll(acc.studyDiscipline, spec.studyDiscipline),
      studyElement: scaleAll(acc.studyElement, spec.studyElement),
      hungerRate: acc.hungerRate * (spec.hungerRate ?? 1),
      soloFloors: withFloors(acc.soloFloors, spec.soloEfficiencyFloor),
      energyCost: acc.energyCost * (spec.energyCost ?? 1),
      sleepHealing: acc.sleepHealing * (spec.sleepHealing ?? 1),
      injuryNights: acc.injuryNights + (spec.injuryNights ?? 0),
      bondGain: acc.bondGain * (spec.bondGain ?? 1),
      checks: scaleAll(acc.checks, spec.checks),
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

/** A floor at least this high keeps solo training paying; a lower one only helps a little. */
const STRONG_FLOOR = 0.3;

/** One line per hard-work floor (its grade and strength), naming the stats it holds up. */
function floorLines(floors: Partial<Record<StatId, SoloFloor>>): EffectLine[] {
  const byFloor = new Map<string, { floor: SoloFloor; labels: string[] }>();
  for (const [stat, floor] of Object.entries(floors) as [StatId, SoloFloor][]) {
    const key = `${floor.throughGrade}|${floor.floor >= STRONG_FLOOR}`;
    const entry = byFloor.get(key) ?? { floor, labels: [] };
    byFloor.set(key, { ...entry, labels: [...entry.labels, STAT_INFO[stat].label] });
  }
  return [...byFloor.values()].map(({ floor, labels }) => {
    const pays = floor.floor >= STRONG_FLOOR ? 'keeps paying off' : 'pays off a little longer';
    const which = labels.length === STAT_IDS.length ? 'every stat' : listed(labels);
    return {
      label: `Training alone ${pays} up to grade ${floor.throughGrade} in ${which}`,
      tone: 'gain',
    };
  });
}

function listed(labels: readonly string[]): string {
  const last = labels.at(-1) ?? '';
  return labels.length > 1 ? `${labels.slice(0, -1).join(', ')} and ${last}` : last;
}

/** Lines for the effects of a day's food and rest: hard work, sleep, injuries, bonds, checks. */
function dayLines(spec: ModifierSpec): EffectLine[] {
  const lines: EffectLine[] = [];
  if (spec.energyCost !== undefined) {
    lines.push(line('Hard work tires you', 2 - spec.energyCost, 'less', 'more'));
  }
  if (spec.sleepHealing !== undefined) {
    lines.push(line('Sleep heals', spec.sleepHealing, 'more', 'less'));
  }
  const nights = spec.injuryNights ?? 0;
  if (nights > 0) {
    const days = nights === 1 ? 'a day' : `${nights} days`;
    lines.push({ label: `Tonight's sleep heals injuries ${days} sooner`, tone: 'gain' });
  }
  if (spec.bondGain !== undefined) {
    lines.push(line('Time with people counts', spec.bondGain, 'more', 'less'));
  }
  for (const [stat, m] of Object.entries(spec.checks ?? {}) as [StatId, number][]) {
    lines.push(line(`${STAT_INFO[stat].label} in job checks`, m, 'sharper', 'duller'));
  }
  return lines;
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
  lines.push(...floorLines(spec.soloEfficiencyFloor ?? {}));
  if (spec.hungerRate !== undefined) {
    lines.push(
      spec.hungerRate > 1
        ? { label: `Get hungry ${pct(spec.hungerRate)} faster`, tone: 'cost' }
        : { label: `Get hungry ${pct(spec.hungerRate)} slower`, tone: 'gain' },
    );
  }
  lines.push(...dayLines(spec));
  return lines;
}
