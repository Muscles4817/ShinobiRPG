import {
  conditionRefs,
  RULE_MARKS,
  type ArcAct,
  type DecisionOption,
  type MissionDef,
  writtenOptions,
  type MissionStage,
} from '@/systems/missions';

import { TONES } from './people';
import { conditions, effectsOf } from './storyParts';
import { ledgerProblems } from './validateLedger';
import { tallyProblems } from './validateTallies';
import type { ContentPack } from './types';
import { VOICE_MOMENTS } from './voices';

/**
 * A mission's story holds together: every mark it reads is set somewhere (by its own outcomes,
 * a twist, or a road event), every thread it names is one it keeps, tones are real tones, an
 * ending stage comes last and always has an ending, camps have something to do, every region a
 * road names has events, and every trait has something to say at every moment.
 */

/** Threads a road event may name though a job doesn't keep them (they then do nothing). */
const GENERIC_THREADS = new Set(['daylight', 'charge']);

function tonesOf(stage: MissionStage): (string | undefined)[] {
  return stage.kind === 'decision' ? stage.options.map((o) => o.tone) : [];
}

function shapeProblems(m: MissionDef): string[] {
  const problems: string[] = [];
  m.stages.forEach((stage, i) => {
    if (stage.kind === 'ending') {
      // Only the road home may follow how a job ends.
      const homeward = (s: MissionStage) =>
        s.kind === 'leg' || (s.kind === 'road' && s.to === 'home');
      if (!m.stages.slice(i + 1).every(homeward)) {
        problems.push('has an ending with more than the road home after it');
      }
      if (stage.endings.at(-1)?.when !== undefined) problems.push('has no ending for every case');
    }
    if (stage.kind === 'camp' && (stage.picks < 1 || stage.picks > stage.activities.length)) {
      problems.push('has a camp with more picks than things to do, or none');
    }
    if (stage.kind === 'decision' && !stage.options.some((o) => o.when === undefined)) {
      problems.push('has a decision with no option always open');
    }
  });
  return problems;
}

function storyProblems(m: MissionDef, roadMarks: ReadonlySet<string>): string[] {
  const threads = new Set((m.threads ?? []).map((t) => t.id));
  const set = new Set([
    ...m.stages.flatMap(effectsOf).flatMap((e) => (e.kind === 'mark' ? [e.mark] : [])),
    ...(m.twists ?? []).map((t) => t.mark),
    ...roadMarks,
    ...RULE_MARKS,
  ]);
  const refs = m.stages.flatMap(conditions).map(conditionRefs);
  const named = [
    ...refs.flatMap((r) => r.threads),
    ...m.stages.flatMap(effectsOf).flatMap((e) => (e.kind === 'thread' ? [e.thread] : [])),
  ];
  const charge =
    m.charge && !threads.has(m.charge.thread) ? ['has a charge with no trust thread'] : [];
  const unseen = m.stages
    .flatMap((st) => (st.kind === 'decision' ? st.options : []))
    .filter((o) => o.unseen !== undefined && o.when === undefined)
    .map((o) => `says why "${o.label}" is closed, but it is never closed`);
  return [
    ...charge,
    ...unseen,
    ...shapeProblems(m),
    ...refs
      .flatMap((r) => r.marks)
      .filter((mark) => !set.has(mark))
      .map((mark) => `reads mark "${mark}" that nothing sets`),
    ...named
      .filter((t) => !threads.has(t) && !(t === 'charge' && m.charge))
      .map((t) => `names thread "${t}" it doesn’t keep`),
    ...m.stages
      .flatMap(tonesOf)
      .filter((t) => t !== undefined && !TONES.some((k) => k === t))
      .map((t) => `uses unknown tone "${t ?? ''}"`),
  ].map((p) => `mission "${m.id}" ${p}`);
}

function eventProblems(pack: ContentPack): string[] {
  const options: DecisionOption[] = pack.roadEvents.flatMap((e) => [...writtenOptions(e)]);
  const regions = new Set(pack.roadEvents.flatMap((e) => e.regions));
  const roads = pack.missions.flatMap((m) =>
    m.stages.flatMap((s) => (s.kind === 'leg' && s.region ? [[m.id, s.region] as const] : [])),
  );
  return [
    ...roads
      .filter(([, r]) => !regions.has(r))
      .map(([id, r]) => `mission "${id}" goes by "${r}", where nothing ever happens`),
    ...options
      .filter((o) => o.tone && !TONES.some((k) => k === o.tone))
      .map((o) => `road event option "${o.label}" uses an unknown tone`),
    ...options
      .flatMap((o) => o.effects ?? [])
      .filter((e) => e.kind === 'thread' && !GENERIC_THREADS.has(e.thread))
      .map(
        (e) =>
          `a road event moves thread "${e.kind === 'thread' ? e.thread : ''}", which no job can know`,
      ),
  ];
}

function voiceProblems(pack: ContentPack): string[] {
  return pack.traits.flatMap((trait) =>
    VOICE_MOMENTS.filter(
      (moment) =>
        !pack.voices.some((v) => v.trait === trait.id && v.moment === moment && v.lines.length > 0),
    ).map((moment) => `trait "${trait.id}" has nothing to say at "${moment}"`),
  );
}

/** Every world mark a job or a rumour waits for is one some job can leave behind. */
/** Every world mark some job's outcomes, or a reply in conversation, can leave behind. */
export function worldMarksLeft(pack: ContentPack): Set<string> {
  return new Set([
    ...pack.missions
      .flatMap((m) => m.stages.flatMap(effectsOf))
      .flatMap((e) => (e.kind === 'world' ? [e.mark] : [])),
    // A sensei's story can open their arc.
    ...pack.conversations.flatMap((c) => c.choices.flatMap((choice) => choice.worldMark ?? [])),
  ]);
}

function worldProblems(pack: ContentPack): string[] {
  const left = worldMarksLeft(pack);
  const remembered = pack.missions.flatMap((m) =>
    m.stages
      .flatMap(conditions)
      .flatMap((c) => conditionRefs(c).world)
      .map((mark) => [m.id, mark] as const),
  );
  return [
    ...remembered
      .filter(([, mark]) => !left.has(mark))
      .map(([id, mark]) => `mission "${id}" remembers "${mark}", which no job leaves behind`),
    ...pack.missions
      .filter((m) => m.needsWorldMark !== undefined && !left.has(m.needsWorldMark))
      .map(
        (m) =>
          `mission "${m.id}" waits for "${m.needsWorldMark ?? ''}", which no job leaves behind`,
      ),
    ...pack.missions
      .filter((m) => m.closedBy !== undefined && !left.has(m.closedBy))
      .map(
        (m) => `mission "${m.id}" is closed by "${m.closedBy ?? ''}", which no job leaves behind`,
      ),
    ...pack.roadEvents.flatMap((e) =>
      [e.needsWorldMark, e.closedBy]
        .filter((mark): mark is string => mark !== undefined && !left.has(mark))
        .map((mark) => `road event "${e.id}" waits on "${mark}", which no job leaves behind`),
    ),
    ...pack.village.rumours
      .filter((r) => r.worldMark !== undefined && !left.has(r.worldMark))
      .map((r) => `rumour "${r.id}" waits for "${r.worldMark ?? ''}", which no job leaves behind`),
  ];
}

/** Every arc's acts have jobs that exist, and no job belongs to two arcs. */
function arcProblems(pack: ContentPack): string[] {
  const ids = new Set(pack.missions.map((m) => m.id));
  const jobs = pack.arcs.flatMap((a) =>
    a.acts.flatMap((act) => act.jobs.map((id) => [a.id, id] as const)),
  );
  const seen = new Map<string, number>();
  jobs.forEach(([, id]) => seen.set(id, (seen.get(id) ?? 0) + 1));
  return [
    ...pack.arcs
      .filter(
        (a) =>
          a.acts.length === 0 ||
          a.acts.some((act) => act.jobs.length === 0 || act.beats.length === 0),
      )
      .map((a) => `arc "${a.id}" has an act with no jobs or no place in the story circle`),
    ...jobs
      .filter(([, id]) => !ids.has(id))
      .map(([arc, id]) => `arc "${arc}" names unknown mission "${id}"`),
    ...[...seen]
      .filter(([, n]) => n > 1)
      .map(([id]) => `mission "${id}" belongs to more than one arc`),
    ...pack.arcs.flatMap((a) => a.acts.flatMap((act) => baseProblems(pack, a.id, act))),
    ...recommendationProblems(pack),
  ];
}

/** Whoever puts a genin forward at an arc's end is someone the pack has. */
function recommendationProblems(pack: ContentPack): string[] {
  const people = new Set(pack.people.map((p) => p.id));
  return pack.arcs
    .filter((a) => a.recommends !== undefined && !people.has(a.recommends.personId))
    .map((a) => `arc "${a.id}" is recommended by unknown person "${a.recommends?.personId}"`);
}

/** An act based in a town has its jobs posted at an office there. */
function baseProblems(pack: ContentPack, arcId: string, act: ArcAct): string[] {
  if (act.baseLocationId === undefined) return [];
  const base = pack.locations.find((l) => l.id === act.baseLocationId);
  if (!base) return [`arc "${arcId}" is based at unknown location "${act.baseLocationId}"`];
  const posted = new Set(base.places.flatMap((p) => (p.kind === 'missions' ? p.missionIds : [])));
  return act.jobs
    .filter((id) => !posted.has(id))
    .map((id) => `arc "${arcId}" job "${id}" isn’t posted at its base, ${base.name}`);
}

export function validateStory(pack: ContentPack): string[] {
  const roadMarks = new Set(
    pack.roadEvents
      .flatMap((e) => writtenOptions(e).flatMap((o) => o.effects ?? []))
      .flatMap((e) => (e.kind === 'mark' ? [e.mark] : [])),
  );
  return [
    ...pack.missions.flatMap((m) => storyProblems(m, roadMarks)),
    ...eventProblems(pack),
    ...voiceProblems(pack),
    ...worldProblems(pack),
    ...tallyProblems(pack),
    ...ledgerProblems(pack),
    ...arcProblems(pack),
  ];
}
