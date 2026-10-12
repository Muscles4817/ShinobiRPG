import type { ExamDef, ExamStageDef, MindStageDef, TournamentStageDef } from '@/systems/exams';
import { RANK_FOR_MISSION, type MissionDef } from '@/systems/missions';
import { DAYS_PER_SEASON, SEASONS } from '@/systems/time';

import type { ContentPack } from './types';

/**
 * Exams are sat twice a year on real days, every stage makes sense (a pass mark that can be
 * reached, rivals that get stronger, a forest that is a team mission only the exam runs), every
 * exam-only mission belongs to an exam, and the pack has a chūnin exam and jobs for chūnin
 * (what a promotion opens on the board).
 */
export function validateExams(pack: ContentPack): string[] {
  const missions = new Map(pack.missions.map((m) => [m.id, m]));
  const used = new Set(
    pack.exams.flatMap((e) =>
      e.stages.flatMap((s) => (s.kind === 'survival' ? [s.missionId] : [])),
    ),
  );
  const chuninJobs = pack.missions.some(
    (m) => !m.examOnly && RANK_FOR_MISSION[m.rank] === 'chunin',
  );
  return [
    ...(pack.exams.length > 0 ? [] : ['pack needs a chūnin exam']),
    ...(chuninJobs ? [] : ['pack needs jobs for chūnin (B- or A-rank)']),
    ...pack.exams.flatMap((e) => examProblems(e, missions)),
    ...pack.missions
      .filter((m) => m.examOnly && !used.has(m.id))
      .map((m) => `exam-only mission "${m.id}" is not run by any exam`),
  ];
}

function examProblems(exam: ExamDef, missions: ReadonlyMap<string, MissionDef>): string[] {
  const problems: string[] = [];
  const days = new Set(exam.dates.map((d) => `${d.season}/${d.day}`));
  if (exam.dates.length !== 2 || days.size !== 2) problems.push('must fall on two dates a year');
  if (exam.dates.some((d) => d.season < 0 || d.season >= SEASONS.length)) {
    problems.push('falls in a season that doesn’t exist');
  }
  if (exam.dates.some((d) => d.day < 1 || d.day > DAYS_PER_SEASON)) {
    problems.push('falls on a day that doesn’t exist');
  }
  if (exam.stages.length === 0) problems.push('has no stages');
  problems.push(...exam.stages.flatMap((s) => stageProblems(s, missions)));
  return problems.map((p) => `exam "${exam.id}" ${p}`);
}

function stageProblems(stage: ExamStageDef, missions: ReadonlyMap<string, MissionDef>): string[] {
  switch (stage.kind) {
    case 'mind':
      return mindProblems(stage);
    case 'survival': {
      const mission = missions.get(stage.missionId);
      if (!mission) return [`survival references unknown mission "${stage.missionId}"`];
      return mission.examOnly && mission.withTeam
        ? []
        : [`survival mission "${stage.missionId}" must be an exam-only team mission`];
    }
    case 'tournament':
      return tournamentProblems(stage);
  }
}

function mindProblems(stage: MindStageDef): string[] {
  const problems: string[] = [];
  if (stage.questions.length === 0) problems.push('has a written test with no questions');
  if (stage.passMark < 1 || stage.passMark > stage.questions.length) {
    problems.push('has a pass mark nobody can reach');
  }
  if (stage.vigilance <= 0 || stage.questions.some((q) => q.difficulty <= 0)) {
    problems.push('has a written test with non-positive numbers');
  }
  return problems;
}

function tournamentProblems(stage: TournamentStageDef): string[] {
  const problems: string[] = [];
  if (stage.rivals.length === 0) problems.push('has a tournament with no rounds');
  if (stage.rivalBase <= 0 || stage.rivals.some((r) => r <= 0)) {
    problems.push('has a tournament with non-positive rivals');
  }
  if (stage.rivals.some((r, i) => i > 0 && r < (stage.rivals[i - 1] ?? 0))) {
    problems.push('has rivals who get weaker round by round');
  }
  return problems;
}
