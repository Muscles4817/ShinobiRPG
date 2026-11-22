import type { GameAction, Overlay } from '@/game';

import { DaySheet } from './day/DaySheet';
import { ReportCard } from './ReportCard';

interface OverlayCardProps {
  /** What the game lays over play (`overlayOnScreen`). */
  readonly overlay: Overlay;
  readonly perform: (action: GameAction) => void;
}

/** The card laid over play: a report, or the end of the day. */
export function OverlayCard({ overlay, perform }: OverlayCardProps) {
  switch (overlay.kind) {
    case 'report':
      return (
        <ReportCard
          report={overlay.report}
          onContinue={() => {
            perform({ type: 'dismissReport' });
          }}
        />
      );
    case 'day':
      return <DaySheet view={overlay.view} perform={perform} />;
  }
}
