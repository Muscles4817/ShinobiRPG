import { headerView, hubView, rivalChallengeView, senseiWeekView } from '@/game';

import { CompanionStrip } from '../components/CompanionSheet';
import { DayStrip, HungerNote, Vitals } from '../components/Vitals';
import { RivalSlip } from '../screens/RivalSlip';
import { SenseiSlip } from '../screens/SenseiSlip';
import type { ScreenProps } from '../screens/types';

interface YouPanelProps extends ScreenProps {
  readonly onOpenCompanion: () => void;
}

/**
 * The desktop layout's right-hand panel: you, the time, your purse and vitals, and what is
 * waiting on you (your sensei's week, a rival's challenge, your companion), kept in view on
 * every tab. On a phone the same pieces sit at the top of the village screen.
 */
export function YouPanel({ ctx, state, perform, onOpenCompanion }: YouPanelProps) {
  const header = headerView(state, ctx);
  const { companion } = hubView(state, ctx);
  const week = senseiWeekView(state, ctx);
  const challenge = rivalChallengeView(state, ctx);
  return (
    <aside className="you-panel" aria-label="You">
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
      {companion && <CompanionStrip strip={companion} onOpen={onOpenCompanion} />}
      {challenge && <RivalSlip view={challenge} perform={perform} />}
      {week && <SenseiSlip view={week} perform={perform} />}
    </aside>
  );
}
