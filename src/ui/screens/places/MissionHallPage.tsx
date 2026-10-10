import { useState } from 'react';

import { headerView, missionBoardView, type Notice } from '@/game';

import { Banner } from '../../components/Banner';
import { ThreatChip } from '../../components/ThreatChip';
import type { PlaceProps } from '../types';

const TILT = ['r1', 'r2', 'r3', 'r4'];

/** The mission hall as a notice board. Tap a notice to read it and accept. */
export function MissionHallPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = missionBoardView(state, ctx);
  const header = headerView(state, ctx);
  const [open, setOpen] = useState<Notice | null>(null);
  if (!view) return null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`${view.completed} completed · energy ${header.meters[2]?.value ?? 0}`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="board">
        {view.notices.length === 0 && (
          <p className="board-empty">Nothing posted today. Check back tomorrow.</p>
        )}
        {view.notices.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className={`paper ${n.standing ? 'standing ' : ''}${TILT[i % TILT.length] ?? ''}`}
            onClick={() => {
              setOpen(n);
            }}
          >
            <span className="rank">{n.rank}</span>
            {n.withTeam && <span className="team-stamp">班 Team</span>}
            <b>
              {n.title}
              {n.fightLikely && (
                <span className="sword" aria-label="Fight likely">
                  {' '}
                  ⚔
                </span>
              )}
            </b>
            <span className="client">{n.client}</span>
            <span className="paper-foot num">
              <span>{n.ryo} ryo</span>
              <span>{n.posted}</span>
            </span>
          </button>
        ))}
      </main>
      {open && (
        <div
          className="sheet-backdrop"
          onClick={() => {
            setOpen(null);
          }}
        >
          <section
            className="sheet paper-sheet enter"
            onClick={(e) => {
              e.stopPropagation();
            }}
            aria-label={open.title}
          >
            <span className="rank">{open.rank}</span>
            <h2>{open.title}</h2>
            <p className="client">From {open.client}</p>
            <p className="story dark">{open.summary}</p>
            <span className="chips">
              <span className="chip gain">{open.ryo} ryo</span>
              <span className="chip gain">+{open.reputation} rep</span>
              <span className="chip cost">−{open.energyCost} energy</span>
              <span className="chip">{open.slots} slots</span>
              <span className="chip">{open.posted}</span>
              {open.opposition ? (
                <>
                  <ThreatChip threat={open.opposition.threat} label={open.opposition.label} />
                  {open.opposition.traits.map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </>
              ) : (
                open.fightLikely && <span className="chip harm">Fight likely</span>
              )}
              {open.withTeam && <span className="chip gain">With your team</span>}
            </span>
            {open.blocker && <p className="blocker">{open.blocker}</p>}
            <button
              type="button"
              className="btn wide"
              disabled={open.blocker !== null}
              onClick={() => {
                perform(open.action);
                setOpen(null);
              }}
            >
              Accept the job
            </button>
          </section>
        </div>
      )}
    </>
  );
}
