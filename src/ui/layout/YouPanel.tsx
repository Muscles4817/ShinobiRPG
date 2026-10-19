import { hubView, rivalChallengeView, senseiWeekView } from '@/game';

import { CompanionStrip } from '../components/CompanionSheet';
import { RivalSlip } from '../screens/RivalSlip';
import { SenseiSlip } from '../screens/SenseiSlip';
import type { ScreenProps } from '../screens/types';
import { YouSummary } from './YouSummary';

interface YouPanelProps extends ScreenProps {
  readonly onOpenCompanion: () => void;
}

/**
 * The desktop layout's right-hand panel: you, the time, your purse and vitals, and what is
 * waiting on you (your sensei's week, a rival's challenge, your companion), kept in view on
 * every tab. On a phone the same pieces sit at the top of the village screen.
 */
export function YouPanel({ ctx, state, perform, onOpenCompanion }: YouPanelProps) {
  const { companion } = hubView(state, ctx);
  const week = senseiWeekView(state, ctx);
  const challenge = rivalChallengeView(state, ctx);
  return (
    <aside className="you-panel" aria-label="You">
      <YouSummary ctx={ctx} state={state} />
      {companion && <CompanionStrip strip={companion} onOpen={onOpenCompanion} />}
      {challenge && <RivalSlip view={challenge} perform={perform} />}
      {week && <SenseiSlip view={week} perform={perform} />}
    </aside>
  );
}
