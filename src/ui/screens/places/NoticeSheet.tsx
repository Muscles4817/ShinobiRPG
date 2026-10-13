import type { GameAction, Notice } from '@/game';

import { ThreatChip } from '../../components/ThreatChip';
import { Opposition } from './Opposition';

interface NoticeSheetProps {
  readonly notice: Notice;
  readonly perform: (action: GameAction) => void;
  readonly onClose: () => void;
}

/** The chips on a notice: what it pays and costs, how long, who it pits you against, who goes. */
function NoticeChips({ notice: n }: { readonly notice: Notice }) {
  return (
    <span className="chips">
      <span className="chip gain">{n.ryo} ryo</span>
      <span className="chip gain">+{n.reputation} rep</span>
      <span className="chip cost">−{n.energyCost} energy</span>
      <span className="chip">{n.away ?? `${n.slots} slots`}</span>
      <span className="chip">{n.posted}</span>
      {n.opposition ? (
        <ThreatChip threat={n.opposition.threat} label={n.opposition.label} />
      ) : (
        n.fightLikely && <span className="chip harm">Fight likely</span>
      )}
      {n.crew && <span className="chip gain">{n.crew.line}</span>}
      {n.returning && <span className="chip gain">Asks for you by name</span>}
    </span>
  );
}

/** A notice taken down from the board to read: the job in full, and accepting it. */
export function NoticeSheet({ notice: n, perform, onClose }: NoticeSheetProps) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet paper-sheet enter"
        onClick={(e) => {
          e.stopPropagation();
        }}
        aria-label={n.title}
      >
        <span className="rank">{n.rank}</span>
        <h2>{n.title}</h2>
        <p className="client">From {n.client}</p>
        <p className="story dark">{n.summary}</p>
        <NoticeChips notice={n} />
        {n.opposition?.handicap && <p className="handicap">{n.opposition.handicap}</p>}
        {n.opposition && <Opposition opposition={n.opposition} perform={perform} />}
        {n.examClash && !n.blocker && <p className="handicap">{n.examClash}</p>}
        {n.blocker && <p className="blocker">{n.blocker}</p>}
        <button
          type="button"
          className="btn wide"
          disabled={n.blocker !== null}
          onClick={() => {
            perform(n.action);
            onClose();
          }}
        >
          Accept the job
        </button>
      </section>
    </div>
  );
}
