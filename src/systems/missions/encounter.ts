/**
 * Encounters: a mission stage where foes stand between you and the job, played in three beats
 * (recon, approach, and the fight if there is one). This module owns the shapes (templates,
 * the stage's own state) and the pure rules on that state: what you know, how alert they are,
 * what you have already tried. Which stat a beat tests, what it costs and what a fight opens
 * with belong to the game layer, which knows the character.
 */

/** How ready the foes are for you. Careless recon raises it; it never falls. */
export const ALERTNESS = ['unaware', 'wary', 'alert'] as const;
export type Alertness = (typeof ALERTNESS)[number];

/** Ways of learning about the foes before choosing how to go in. */
export const RECONS = ['observe', 'track', 'sense', 'ask'] as const;
export type ReconId = (typeof RECONS)[number];

/** Ways of going in. Head-on and withdraw are always open. */
export const APPROACHES = [
  'head-on',
  'ambush',
  'sneak',
  'talk',
  'bribe',
  'intimidate',
  'set-ground',
  'withdraw',
] as const;
export type ApproachId = (typeof APPROACHES)[number];

/** Open at every encounter, whatever its template or stage says. */
export const ALWAYS_OPEN: readonly ApproachId[] = ['head-on', 'withdraw'];
/** Approaches that only work on foes who would listen. */
export const TALK_APPROACHES: readonly ApproachId[] = ['talk', 'bribe', 'intimidate'];

/** What recon can tell you. */
export const ENCOUNTER_FACTS = ['count', 'identity', 'kit', 'terrain', 'awareness'] as const;
export type EncounterFact = (typeof ENCOUNTER_FACTS)[number];

/** What each kind of recon reveals when it works. */
export const RECON_REVEALS: Readonly<Record<ReconId, readonly EncounterFact[]>> = {
  observe: ['count', 'terrain', 'awareness'],
  track: ['count', 'identity'],
  sense: ['count', 'kit', 'awareness'],
  ask: ['identity', 'kit'],
};

/** Recon actions an encounter allows in all, before the chance to go unseen is gone. */
export const MAX_RECON = 3;

/**
 * What the job is, which decides how the ways of getting past the foes pay
 * (`encounterPay.ts`): an escort is paid for arriving safely, an elimination only when the
 * foes are dealt with.
 */
export const JOB_KINDS = ['escort', 'deliver', 'eliminate', 'retrieve', 'patrol'] as const;
export type JobKind = (typeof JOB_KINDS)[number];

export interface ReconOption {
  readonly id: ReconId;
  /** What doing it looks like here ("Watch the camp from the ridge"). No numbers. */
  readonly label: string;
  /** How hard the ground makes it, against the stat the recon tests. */
  readonly difficulty: number;
}

/** Lines a template words its moments with; a stage may swap any of them for its own. */
export interface EncounterFlavour {
  /** The lie of the land, once observed. */
  readonly terrain: string;
  /** Recon went wrong and they heard something. */
  readonly noticed: string;
  /** You slipped past unseen. */
  readonly slipped: string;
  /** A sneak went wrong and they caught you. */
  readonly caught: string;
  /** Talked, paid or frightened off. */
  readonly parley: string;
  /** The first moment of your ambush. */
  readonly ambush: string;
}

/**
 * A kind of encounter (a bandit camp, a beast, a lone rogue, a guarded building, a spirit): the
 * approaches that make sense against it, its recon options, how alert it starts and how it is
 * worded. Templates are shared content; missions pick one per encounter stage.
 */
export interface EncounterTemplate {
  readonly id: string;
  readonly name: string;
  readonly approaches: readonly ApproachId[];
  readonly recon: readonly ReconOption[];
  readonly alertness: Alertness;
  /** Whether they would listen to talk, coin or threats at all. */
  readonly talkable: boolean;
  /** How hard they are to talk round or frighten off, before alertness. */
  readonly resolve: number;
  readonly flavour: EncounterFlavour;
}

/** The encounter stage as a mission writes it. */
export interface EncounterStage {
  readonly kind: 'encounter';
  readonly text: string;
  /** An `EncounterTemplate` id (validated). */
  readonly template: string;
  readonly enemyIds: readonly string[];
  readonly canFlee: boolean;
  readonly job: JobKind;
  /** Replaces the template's approaches for this stage. */
  readonly approaches?: readonly ApproachId[];
  /** Overrides the template: whether these foes would listen. */
  readonly talkable?: boolean;
  /** False when there is no getting past them (no sneaking). */
  readonly bypassable?: boolean;
  readonly flavour?: Partial<EncounterFlavour>;
}

/** The encounter in progress: kept on the mission run while you size the foes up. */
export interface EncounterRun {
  readonly alertness: Alertness;
  readonly known: readonly EncounterFact[];
  /** Recon actions taken so far. */
  readonly recons: number;
  /** Approaches that failed and can't be tried again (talk, sneak, set the ground…). */
  readonly tried: readonly ApproachId[];
  /** Where in the mission's notes the encounter began, so its scene shows only its own lines. */
  readonly notesFrom: number;
}

/** The approaches a stage offers: its own list or the template's, as the foes allow. */
export function encounterApproaches(
  stage: EncounterStage,
  template: EncounterTemplate,
): ApproachId[] {
  const listed = new Set([...(stage.approaches ?? template.approaches), ...ALWAYS_OPEN]);
  const talkable = stage.talkable ?? template.talkable;
  return APPROACHES.filter(
    (a) =>
      listed.has(a) &&
      (talkable || !TALK_APPROACHES.includes(a)) &&
      (stage.bypassable !== false || a !== 'sneak'),
  );
}

/** The template's words with the stage's own swapped in. */
export function encounterFlavour(
  stage: EncounterStage,
  template: EncounterTemplate,
): EncounterFlavour {
  return { ...template.flavour, ...stage.flavour };
}

export function startEncounter(
  template: EncounterTemplate,
  known: readonly EncounterFact[],
  notesFrom: number,
): EncounterRun {
  return { alertness: template.alertness, known: [...known], recons: 0, tried: [], notesFrom };
}

/** One step more alert: unaware → wary → alert. */
export function raiseAlertness(alertness: Alertness): Alertness {
  return ALERTNESS[Math.min(ALERTNESS.length - 1, ALERTNESS.indexOf(alertness) + 1)] ?? 'alert';
}

/** Facts the recon would still reveal (empty: nothing more to learn that way). */
export function stillHidden(run: EncounterRun, recon: ReconId): EncounterFact[] {
  return RECON_REVEALS[recon].filter((f) => !run.known.includes(f));
}

/** A recon taken: success reveals its facts, failure puts the foes more on guard. */
export function afterRecon(run: EncounterRun, recon: ReconId, success: boolean): EncounterRun {
  const recons = run.recons + 1;
  if (!success) return { ...run, recons, alertness: raiseAlertness(run.alertness) };
  return { ...run, recons, known: [...run.known, ...stillHidden(run, recon)] };
}

/** An approach that failed without starting a fight: it can't be tried again, and they stir. */
export function afterFailedApproach(
  run: EncounterRun,
  approach: ApproachId,
  alertness: Alertness,
): EncounterRun {
  return { ...run, alertness, tried: [...run.tried, approach] };
}
