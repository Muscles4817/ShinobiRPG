import { useState } from 'react';

import {
  benchView,
  blockerFor,
  type BenchJob,
  type BenchSeal,
  type BenchView,
  type BuildOrder,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

/** A puppet of yours to rebuild: its id and name, and how it is built now. */
export interface Rebuilding {
  readonly puppetId: string;
  readonly name: string;
  readonly frameId: string;
  readonly partIds: readonly string[];
  readonly materialId: string;
  readonly seals: readonly string[];
}

interface Props {
  readonly ctx: GameContext;
  readonly state: GameState;
  readonly perform: (action: GameAction) => void;
  readonly rebuilding: Rebuilding | null;
  readonly onDone: () => void;
}

/** What is on the bench, and a day's work on it. */
function JobOnBench({
  job,
  perform,
}: {
  readonly job: BenchJob;
  readonly perform: Props['perform'];
}) {
  return (
    <div className="bench">
      <h3>On the bench: {job.name}</h3>
      <p className="muted small">
        {job.daysLeft === 1 ? 'One more day of work.' : `${job.daysLeft} more days of work.`}
      </p>
      <button
        type="button"
        className="btn ghost"
        disabled={job.work.blocker !== null}
        onClick={() => {
          perform(job.work.action);
        }}
      >
        Work at the bench
      </button>
      {job.work.blocker && <p className="muted small">{job.work.blocker}</p>}
    </div>
  );
}

interface Picks {
  readonly frameId: string;
  readonly partIds: readonly string[];
  readonly seals: readonly string[];
  readonly materialId: string;
  readonly name: string;
}

function startPicks(view: BenchView, rebuilding: Rebuilding | null): Picks {
  if (rebuilding) return { ...rebuilding };
  return {
    frameId: view.frames[0]?.id ?? '',
    partIds: [],
    seals: [],
    materialId: view.materials[0]?.id ?? '',
    name: '',
  };
}

function orderOf(picks: Picks, rebuilding: Rebuilding | null): BuildOrder {
  return rebuilding ? { ...picks, puppetId: rebuilding.puppetId } : picks;
}

/** What a build of these picks takes, in words. */
function needsLine(view: BenchView, picks: Picks, rebuild: boolean): string | null {
  const frame = view.frames.find((f) => f.id === picks.frameId);
  if (!frame) return null;
  const needs = rebuild ? frame.rebuild : frame;
  const ryo =
    view.parts.filter((p) => picks.partIds.includes(p.id)).reduce((sum, p) => sum + p.cost, 0) +
    picks.seals.length * view.sealRyo;
  return `Takes ${needs.lots} lots, ${ryo} ryo of mechanisms and seals and ${needs.days} days at the bench.`;
}

/** One id in or out of a list. */
function flipped(list: readonly string[], id: string): readonly string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** Your techniques a seal could carry into a slot, and why any can't yet. */
function SealPicker({
  seals,
  picked,
  ryo,
  onToggle,
}: {
  readonly seals: readonly BenchSeal[];
  readonly picked: readonly string[];
  readonly ryo: number;
  readonly onToggle: (id: string) => void;
}) {
  if (seals.length === 0) return null;
  return (
    <fieldset>
      <legend>Seals</legend>
      <p className="muted small">
        A ninjutsu or genjutsu technique of yours, sealed into a slot ({ryo} ryo of inks). It works
        in the puppet a grade below your fūinjutsu.
      </p>
      {seals.map((t) => (
        <label key={t.id} className={t.blocker ? 'muted' : ''}>
          <input
            type="checkbox"
            disabled={t.blocker !== null && !picked.includes(t.id)}
            checked={picked.includes(t.id)}
            onChange={() => {
              onToggle(t.id);
            }}
          />{' '}
          {t.name}, {t.rank}-rank {t.discipline}.{' '}
          {t.blocker && <span className="muted">{t.blocker}</span>}
        </label>
      ))}
    </fieldset>
  );
}

/** The frame, mechanisms and material of a new build or a rebuild, and its name. */
function BuildForm({
  ctx,
  state,
  perform,
  rebuilding,
  onDone,
  view,
}: Props & { readonly view: BenchView }) {
  const [picks, setPicks] = useState<Picks>(() => startPicks(view, rebuilding));
  const pick = (change: Partial<Picks>) => {
    setPicks((now) => ({ ...now, ...change }));
  };
  const toggle = (id: string) => {
    pick({ partIds: flipped(picks.partIds, id) });
  };
  const start: GameAction = { type: 'startBuild', order: orderOf(picks, rebuilding) };
  const blocker = blockerFor(state, start, ctx);
  return (
    <div className="bench">
      <h3>{rebuilding ? `Rebuild ${rebuilding.name}` : 'Build a puppet'}</h3>
      <p className="muted small">
        {view.where} You keep {view.kept} of the {view.room} puppets your home has room for.
      </p>
      <fieldset>
        <legend>Frame</legend>
        {view.frames.map((f) => (
          <label key={f.id} className={f.beyond ? 'muted' : ''}>
            <input
              type="radio"
              name="frame"
              checked={picks.frameId === f.id}
              onChange={() => {
                pick({ frameId: f.id });
              }}
            />{' '}
            <b>{f.name}</b>, {f.slots} slots. {f.beyond ?? f.description}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Mechanisms</legend>
        {view.parts.map((p) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={picks.partIds.includes(p.id)}
              onChange={() => {
                toggle(p.id);
              }}
            />{' '}
            {p.name} ({p.cost} ryo). <span className="muted">{p.description}</span>
          </label>
        ))}
      </fieldset>
      <SealPicker
        seals={view.seals}
        picked={picks.seals}
        ryo={view.sealRyo}
        onToggle={(id) => {
          pick({ seals: flipped(picks.seals, id) });
        }}
      />
      <label className="bench-field">
        Material
        <select
          value={picks.materialId}
          onChange={(e) => {
            pick({ materialId: e.target.value });
          }}
        >
          {view.materials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}, {m.grade.toLowerCase()} (you keep {m.held})
            </option>
          ))}
        </select>
      </label>
      {!rebuilding && (
        <label className="bench-field">
          Name
          <input
            value={picks.name}
            maxLength={view.nameMax}
            onChange={(e) => {
              pick({ name: e.target.value });
            }}
          />
        </label>
      )}
      <p className="muted small">{needsLine(view, picks, rebuilding !== null)}</p>
      <button
        type="button"
        className="btn"
        disabled={blocker !== null}
        onClick={() => {
          perform(start);
          onDone();
        }}
      >
        Set it on the bench
      </button>
      {blocker && <p className="muted small">{blocker}</p>}
      {rebuilding && (
        <button type="button" className="btn ghost" onClick={onDone}>
          Keep it as it is
        </button>
      )}
    </div>
  );
}

/**
 * The bench: a day's work on what is on it, or a new build (or a rebuild) chosen from the frames,
 * mechanisms and materials, with what it takes and why it can't start yet.
 */
export function BenchPanel(props: Props) {
  const view = benchView(props.state, props.ctx);
  if (!view) return null;
  if (view.job) return <JobOnBench job={view.job} perform={props.perform} />;
  return <BuildForm {...props} view={view} />;
}
