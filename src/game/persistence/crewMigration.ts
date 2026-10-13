/**
 * Migrations for what a job under way remembers.
 *
 * v27 → v28: a job remembers who went on it (`MissionRun.crew`). A job already under way goes
 * on with the people who would have gone before crews: the exam's team in an exam, otherwise
 * your genin team if you have one (their sensei stays home), otherwise nobody.
 */
type RawState = Record<string, unknown>;

function asRecord(value: unknown): RawState {
  return typeof value === 'object' && value !== null ? (value as RawState) : {};
}

function ids(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

function crewFor(state: RawState): RawState {
  const examTeam = ids(asRecord(asRecord(state.exams).run).teamIds);
  if (examTeam.length > 0) return { kind: 'exam-team', leaderId: null, memberIds: examTeam };
  const team = ids(asRecord(asRecord(state.people).team).teammateIds);
  if (team.length > 0) return { kind: 'old-team', leaderId: null, memberIds: team };
  return { kind: 'solo', leaderId: null, memberIds: [] };
}

export function v27ToV28(state: RawState): RawState {
  if (state.mission === null || state.mission === undefined) return state;
  return { ...state, mission: { ...asRecord(state.mission), crew: crewFor(state) } };
}

/**
 * v28 → v29: a job remembers its story (marks, threads, a ledger). A job under way starts with
 * none: the jobs written before had nothing to remember.
 */
export function v28ToV29(state: RawState): RawState {
  if (state.mission === null || state.mission === undefined) return state;
  return { ...state, mission: { marks: [], threads: {}, ledger: [], ...asRecord(state.mission) } };
}
