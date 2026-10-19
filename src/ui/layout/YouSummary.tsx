import { headerView, type GameContext, type GameState } from '@/game';

import { DayStrip, HungerNote, Vitals } from '../components/Vitals';

/**
 * You at a glance, on the desktop layout: your name and rank, the time and your purse, your
 * vitals and what hunger costs you. The you panel opens with it, and so does the panel beside
 * the scenes that are about you.
 */
export function YouSummary({
  ctx,
  state,
}: {
  readonly ctx: GameContext;
  readonly state: GameState;
}) {
  const header = headerView(state, ctx);
  return (
    <>
      <div className="you-head">
        <b>{header.name}</b>
        <span>
          {header.rank}
          {header.visiting ? `, visiting ${header.location}` : ''}
        </span>
      </div>
      <div className="you-when">
        <span className="when">
          {header.slot}, {header.date}
        </span>
        <span className="ryo num">{header.ryo} ryo</span>
        <DayStrip slotIndex={header.slotIndex} />
        {header.warnings.map((w) => (
          <span key={w} className="warn-chip">
            {w}
          </span>
        ))}
      </div>
      <Vitals meters={header.meters} />
      <HungerNote note={header.hunger} />
    </>
  );
}
