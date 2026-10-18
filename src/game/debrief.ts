import { checkChance, STAT_INFO } from '@/systems/stats';
import { stageFoes, type LedgerLine, type MissionDef, type MissionRun } from '@/systems/missions';

import type { GameContext } from './context';
import { requirePerson } from './people/cast';
import type { DebriefCrew, DebriefLine, JobGrade } from './reports';
import { traitNotes } from './scouting';
import type { GameState } from './state';

/**
 * The debrief, read from what the job remembered: the ledger line by line (with the pay each
 * moved), how much closer you came to each person who went, how cleanly it went, and on a
 * failure what would have helped.
 */

/** Lost more than this share of the pay, and the job was botched. */
export const BOTCHED_BELOW = 0.75;
/** This many setbacks, and the job was botched whatever the pay. */
export const BOTCHED_SETBACKS = 3;

function payChip(share: number | undefined): string | null {
  if (share === undefined || share === 0) return null;
  return `${share > 0 ? '+' : '−'}${Math.round(Math.abs(share) * 100)}% pay`;
}

export function debriefLines(ledger: readonly LedgerLine[]): DebriefLine[] {
  return ledger.map((l) => ({
    text: l.text,
    tone: l.tone,
    pay: payChip(l.pay),
    ...(l.noted ? { noted: true as const } : {}),
  }));
}

/** The share of the posted pay the job came to. */
function payShare(run: MissionRun): number {
  return run.rewardMultiplier * (run.pay?.ryo ?? 1);
}

export function gradeOf(run: MissionRun): JobGrade {
  const setbacks = run.ledger.filter((l) => l.tone === 'cost').length;
  if (payShare(run) < BOTCHED_BELOW || setbacks >= BOTCHED_SETBACKS) return 'botched';
  return setbacks === 0 && payShare(run) >= 1 ? 'clean' : 'rough';
}

/** Each person who went: bond gained since the start, and the last thing they said. */
export function crewDebrief(state: GameState, ctx: GameContext, run: MissionRun): DebriefCrew[] {
  const start = run.bondsAtStart;
  if (!start) return [];
  return run.crew.memberIds.map((id) => {
    const person = requirePerson(state, ctx, id);
    const said = run.notes.findLast((n) => n.kind === 'voice' && n.speaker === person.name);
    return {
      name: person.name,
      bond: (state.people.bonds[id]?.points ?? 0) - (start[id] ?? 0),
      quote: said?.kind === 'voice' ? said.text : null,
    };
  });
}

/** The bond with each crew member now, kept when a job begins. */
export function bondsNow(state: GameState, ids: readonly string[]): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, state.people.bonds[id]?.points ?? 0]));
}

/** On a failed fight: the trick of theirs that beat you, and its counter. */
function foeAdvice(ctx: GameContext, def: MissionDef, run: MissionRun): string | null {
  const stage = def.stages[run.stageIndex];
  const foes = stage ? stageFoes(stage).map((id) => ctx.content.enemies.require(id)) : [];
  for (const foe of foes) {
    const [note] = traitNotes(foe.traits ?? []);
    if (note) return `${foe.name}: ${note.label}. ${note.counter}`;
  }
  return foes.length > 0
    ? 'Reading them first, from cover or from the clerk’s report, would have shown what you faced.'
    : null;
}

/** On a failed check: the approach that was your best chance. */
function checkAdvice(state: GameState, def: MissionDef, run: MissionRun): string | null {
  const stage = def.stages[run.stageIndex];
  if (stage?.kind !== 'check') return null;
  const odds = (a: (typeof stage.approaches)[number]) =>
    checkChance(state.character.stats[a.stat], a.difficulty);
  const best = [...stage.approaches].sort((a, b) => odds(b) - odds(a))[0];
  return best
    ? `${best.label} was your best chance: it leans on ${STAT_INFO[best.stat].label.toLowerCase()}.`
    : null;
}

/** What would have helped a job that failed, read from where it failed. */
export function helpedOf(state: GameState, ctx: GameContext, def: MissionDef): string | null {
  const run = state.mission;
  if (!run) return null;
  return checkAdvice(state, def, run) ?? foeAdvice(ctx, def, run);
}
