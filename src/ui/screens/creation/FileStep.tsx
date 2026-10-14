import {
  chooseQuickPick,
  fileView,
  lowerStat,
  markGift,
  raiseStat,
  reviseDraft,
  setBloom,
  type CreationDraft,
  type Discipline,
  type FileStatLine,
  type FileView,
  type GameContext,
  type Gift,
} from '@/game';

import { GradeBadge } from '../../components/Grade';
import { OptionCard } from './OptionCard';
import type { StepProps } from './types';

interface FileStepProps extends StepProps {
  readonly ctx: GameContext;
  readonly setDraft: (draft: CreationDraft) => void;
}

const GROUP_TITLES = { body: 'Body', mind: 'Mind', discipline: 'Arts' } as const;
const GIFT_NAMES: Readonly<Record<Gift, string>> = {
  gifted: 'Gifted',
  prodigy: 'Prodigy',
  flawed: 'Flawed',
};
const DEFAULT_SPECIALTY: Discipline = 'taijutsu';

function balanceText(view: FileView): string {
  const { points, gifts, flaws } = view.balance;
  const giftWord = gifts === 1 ? 'gift' : 'gifts';
  const flawWord = flaws === 1 ? 'flaw' : 'flaws';
  return `${points} points of training left, ${gifts} ${giftWord} to give and room for ${flaws} ${flawWord}.`;
}

interface RowProps {
  readonly line: FileStatLine;
  readonly onRaise: () => void;
  readonly onLower: () => void;
  readonly onGift: () => void;
}

function StatRow({ line, onRaise, onLower, onGift }: RowProps) {
  return (
    <div className="file-stat" role="group" aria-label={line.label}>
      <GradeBadge grade={line.grade} />
      <span className="file-stat-name">
        {line.label}
        {line.focus && <small className="muted"> your upbringing’s art</small>}
      </span>
      <span className="num">{line.value}</span>
      <button
        type="button"
        className="seg"
        aria-label={`Less training in ${line.label}`}
        disabled={!line.canLower}
        onClick={onLower}
      >
        −
      </button>
      <button
        type="button"
        className="seg"
        aria-label={`More training in ${line.label}`}
        disabled={!line.canRaise}
        onClick={onRaise}
      >
        +
      </button>
      <button
        type="button"
        className={line.gift ? `gift-stamp on g-${line.gift}` : 'gift-stamp'}
        aria-label={`${line.label}: ${line.gift ? GIFT_NAMES[line.gift] : 'no gift'}`}
        onClick={onGift}
      >
        {line.gift ? GIFT_NAMES[line.gift] : 'No gift'}
      </button>
    </div>
  );
}

interface PartProps extends FileStepProps {
  readonly file: FileView;
}

function ByHand({ file, ctx, draft, setDraft }: PartProps) {
  return (
    <>
      <p className="muted small">
        Each step of training costs more the further a stat already is. Tap a stamp to mark a gift
        or a flaw; a flaw gives back {file.flawRefund} points.
      </p>
      {file.groups.map((g) => (
        <section key={g.group} className="file-group">
          <h3 className="file-group-title">{GROUP_TITLES[g.group]}</h3>
          {g.stats.map((line) => (
            <StatRow
              key={line.id}
              line={line}
              onRaise={() => {
                setDraft(raiseStat(draft, line.id, ctx));
              }}
              onLower={() => {
                setDraft(lowerStat(draft, line.id, ctx));
              }}
              onGift={() => {
                setDraft(markGift(draft, line.id, line.nextGift, ctx));
              }}
            />
          ))}
        </section>
      ))}
      <div className="swatch-row" role="group" aria-label="When you bloomed">
        <span className="label">When you bloomed</span>
        <span className="segments">
          {file.blooms.map((b) => (
            <button
              key={b.id}
              type="button"
              className={b.selected ? 'seg on' : 'seg'}
              aria-pressed={b.selected}
              title={b.description}
              onClick={() => {
                setDraft(setBloom(draft, b.id, ctx));
              }}
            >
              {b.name}
            </button>
          ))}
        </span>
      </div>
    </>
  );
}

function QuickPicks({ file, view, ctx, draft, setDraft }: PartProps) {
  const pick = draft.quickPick ?? { archetype: 'steady', specialty: DEFAULT_SPECIALTY };
  const offered = new Set(file.archetypes.filter((a) => a.offered).map((a) => a.id));
  return (
    <>
      <div className="swatch-row" role="group" aria-label="Your best art">
        <span className="label">Your best art</span>
        <span className="segments">
          {view.disciplines.map((d) => (
            <button
              key={d.id}
              type="button"
              className={`seg d-${d.id}${pick.specialty === d.id ? ' on' : ''}`}
              aria-pressed={pick.specialty === d.id}
              onClick={() => {
                setDraft(chooseQuickPick(draft, { ...pick, specialty: d.id }, ctx));
              }}
            >
              {d.name}
            </button>
          ))}
        </span>
      </div>
      <div className="opt-list">
        {view.archetypes
          .filter((a) => offered.has(a.id))
          .map((a) => (
            <OptionCard
              key={a.id}
              name={a.name}
              description={a.description}
              selected={draft.quickPick?.archetype === a.id}
              onSelect={() => {
                setDraft(chooseQuickPick(draft, { ...pick, archetype: a.id }, ctx));
              }}
            />
          ))}
      </div>
    </>
  );
}

/** The academy file: early training, gifts and flaws, by quick pick or by hand. */
export function FileStep(props: FileStepProps) {
  const { draft, ctx, setDraft } = props;
  const file = fileView(draft, ctx);
  const quick = draft.quickPick !== null;
  return (
    <div className="step">
      <div className="file-balance">
        <GradeBadge grade={file.fighting.grade} large />
        <p>
          <b>Fighting grade at graduation</b>
          <span className="muted small"> {balanceText(file)}</span>
        </p>
      </div>
      <div className="segments mode" role="group" aria-label="Filling the file">
        <button
          type="button"
          className={quick ? 'seg on' : 'seg'}
          onClick={() => {
            if (!quick) {
              setDraft(
                chooseQuickPick(draft, { archetype: 'steady', specialty: DEFAULT_SPECIALTY }, ctx),
              );
            }
          }}
        >
          Quick pick
        </button>
        <button
          type="button"
          className={quick ? 'seg' : 'seg on'}
          onClick={() => {
            setDraft(reviseDraft(draft, { quickPick: null }, ctx));
          }}
        >
          By hand
        </button>
      </div>
      {file.focusNote && <p className="muted small">{file.focusNote}</p>}
      {quick ? <QuickPicks {...props} file={file} /> : <ByHand {...props} file={file} />}
      {file.problems.length > 0 && <p className="blocker">{file.problems[0]}</p>}
      <table className="report-card">
        <caption className="label">The report card it reads as</caption>
        <tbody>
          {file.reportCard.map((r) => {
            const art = props.view.disciplines.find((d) => d.id === r.discipline);
            return (
              <tr key={r.discipline} className={`d-${r.discipline}`}>
                <th scope="row">{art?.name}</th>
                <td className={`grade g-${r.grade}`}>{r.grade}</td>
                <td className="muted small">{r.starts ? `Starts with ${art?.starter}` : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
