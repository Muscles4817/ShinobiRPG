import { useState } from 'react';

import { headerView, missionBoardView } from '@/game';

import { ExamNotice } from './ExamNotice';
import { ArcCard } from './ArcCard';
import { NoticeSheet } from './NoticeSheet';

import { Banner } from '../../components/Banner';
import { Icon } from '../../art/Icon';
import type { PlaceProps } from '../types';

const TILT = ['r1', 'r2', 'r3', 'r4'];

/** The mission hall as a notice board. Tap a notice to read it and accept. */
export function MissionHallPage({ ctx, state, perform, onBack }: PlaceProps) {
  const view = missionBoardView(state, ctx);
  const header = headerView(state, ctx);
  const [openId, setOpenId] = useState<string | null>(null);
  if (!view) return null;
  // Looked up afresh each render, so buying the report updates the open notice.
  const open = view.notices.find((n) => n.id === openId) ?? null;
  return (
    <>
      <Banner
        title={view.name}
        subtitle={`${view.completed} jobs done, ${header.meters[2]?.value ?? 0} energy left`}
        slot={header.slot}
        onBack={onBack}
        backLabel={header.location}
      />
      <main className="board">
        <ExamNotice ctx={ctx} state={state} perform={perform} />
        {view.arcs.map((arc) => (
          <ArcCard key={arc.id} arc={arc} />
        ))}
        {view.notices.length === 0 && (
          <p className="board-empty">Nothing posted today. Check back tomorrow.</p>
        )}
        {view.notices.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className={`paper ${n.standing ? 'standing ' : ''}${TILT[i % TILT.length] ?? ''}`}
            onClick={() => {
              setOpenId(n.id);
            }}
          >
            <span className="rank">{n.rank}</span>
            {n.crew && <span className="team-stamp">班 {n.crew.youLead ? 'Lead' : 'Team'}</span>}
            <b>
              {n.title}
              {n.fightLikely && (
                <span className="sword" role="img" aria-label="Fight likely">
                  <Icon id="sword" size={14} />
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
        <NoticeSheet
          notice={open}
          perform={perform}
          onClose={() => {
            setOpenId(null);
          }}
        />
      )}
    </>
  );
}
