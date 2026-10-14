import { STAT_GRADES } from '@/systems/stats';

import { duplicateIds } from './catalog';
import type { ContentPack } from './types';

/**
 * Checks the chakra control exercises: each is practised at some training place (and those
 * places name real ones), it takes a real grade and makes progress, one exercise at most walks
 * each surface, and one your sensei starts has the lesson's words.
 */
export function validateExercises(pack: ContentPack): string[] {
  const ids = new Set(pack.exercises.map((e) => e.id));
  const offered = pack.locations.flatMap((l) =>
    l.places.flatMap((p) =>
      p.kind === 'training' ? (p.exerciseIds ?? []).map((id) => [p.id, id] as const) : [],
    ),
  );
  const surfaces = pack.exercises.flatMap((e) => (e.walk ? [e.walk] : []));
  return [
    ...duplicateIds(pack.exercises).map((id) => `duplicate exercise id "${id}"`),
    ...offered
      .filter(([, id]) => !ids.has(id))
      .map(([place, id]) => `place "${place}" offers unknown exercise "${id}"`),
    ...pack.exercises
      .filter((e) => !offered.some(([, id]) => id === e.id))
      .map((e) => `exercise "${e.id}" is not practised at any place`),
    ...pack.exercises
      .filter((e) => !STAT_GRADES.includes(e.minControl) || e.progressPerSession <= 0)
      .map((e) => `exercise "${e.id}" needs a real grade and some progress a session`),
    ...pack.exercises
      .filter((e) => e.startedBy === 'sensei' && !e.lines.start)
      .map((e) => `exercise "${e.id}" is started by the sensei but has no lesson line`),
    ...surfaces
      .filter((s, i) => surfaces.indexOf(s) !== i)
      .map((s) => `more than one exercise walks on ${s}`),
  ];
}
