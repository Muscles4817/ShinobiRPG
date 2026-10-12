import type { MissionDef, MissionStage } from '@/systems/missions';

/**
 * Mission templates: one shape of job (a delivery that goes wrong, a haunting to lay, a camp
 * to break) written once with `{slot}` placeholders, and filled many times with a client, a
 * place, foes and lines of its own. Each fill becomes an ordinary `MissionDef`, so the board,
 * the mission flow and validation never know a job came from a template.
 *
 * A placeholder is `{name}` (letters, digits and dashes) anywhere in a template's text,
 * including enemy ids and flavour. Validation reports any placeholder a fill left empty.
 */

export interface MissionTemplate {
  readonly id: string;
  readonly rank: MissionDef['rank'];
  readonly withTeam?: boolean;
  readonly slots: number;
  readonly energyCost: number;
  readonly reward: { readonly ryo: number; readonly reputation: number };
  /** The record a fill of this template needs by default. */
  readonly minMissionsCompleted: number;
  /** What each placeholder means, so the people writing fills know what to put there. */
  readonly placeholders: Readonly<Record<string, string>>;
  readonly title: string;
  readonly client: string;
  readonly summary: string;
  readonly stages: readonly MissionStage[];
}

export interface MissionFill {
  /** The finished mission's id; unique across the pack. */
  readonly id: string;
  readonly templateId: string;
  /** A value for every placeholder the template declares. */
  readonly values: Readonly<Record<string, string>>;
  /** Overrides the template's record requirement, to spread fills across a career. */
  readonly minMissionsCompleted?: number;
  /** Overrides the template's pay, for a richer or poorer client. */
  readonly reward?: { readonly ryo: number; readonly reputation: number };
}

const PLACEHOLDER = /\{([a-zA-Z0-9-]+)\}/g;

/** Every placeholder still left in a piece of text, by name. */
export function placeholdersIn(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER)].map((m) => m[1] ?? '');
}

function fillText(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(PLACEHOLDER, (whole, name: string) => values[name] ?? whole);
}

/** Fills every string inside a stage, however deep, leaving its shape alone. */
function fillDeep<T>(value: T, values: Readonly<Record<string, string>>): T {
  if (typeof value === 'string') return fillText(value, values) as T;
  if (Array.isArray(value)) {
    const items: readonly unknown[] = value;
    return items.map((v) => fillDeep(v, values)) as T;
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]: [string, unknown]) => [
      k,
      fillDeep(v, values),
    ]);
    return Object.fromEntries(entries) as T;
  }
  return value;
}

/** One fill made into a mission. Throws on an unknown template (a programmer error). */
export function missionFromFill(template: MissionTemplate, fill: MissionFill): MissionDef {
  const { values } = fill;
  return {
    id: fill.id,
    title: fillText(template.title, values),
    rank: template.rank,
    client: fillText(template.client, values),
    summary: fillText(template.summary, values),
    slots: template.slots,
    energyCost: template.energyCost,
    reward: fill.reward ?? template.reward,
    minMissionsCompleted: fill.minMissionsCompleted ?? template.minMissionsCompleted,
    ...(template.withTeam ? { withTeam: true } : {}),
    stages: template.stages.map((s) => fillDeep(s, values)),
  };
}

/*#__NO_SIDE_EFFECTS__*/
export function missionsFromTemplates(
  templates: readonly MissionTemplate[],
  fills: readonly MissionFill[],
): MissionDef[] {
  const byId = new Map(templates.map((t) => [t.id, t]));
  return fills.map((fill) => {
    const template = byId.get(fill.templateId);
    if (!template) throw new Error(`Mission fill "${fill.id}" uses unknown template.`);
    return missionFromFill(template, fill);
  });
}
