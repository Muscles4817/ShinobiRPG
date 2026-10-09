import { useState } from 'react';

import { hubView, type GameContext, type GameState } from '@/game';

import { Dock, type DockTab } from '../components/Dock';
import { Notice } from '../components/Notice';
import { ReportCard } from '../components/ReportCard';
import type { GameSession } from '../useGameSession';
import { HubScreen } from './HubScreen';
import { PlacePage } from './places/PlacePage';
import { RecordScreen } from './RecordScreen';
import { CombatScene } from './scenes/CombatScene';
import { MissionScene } from './scenes/MissionScene';
import { JutsuScreen } from './YouScreens';
import { ShinobiScreen } from './ShinobiScreen';
import { TravelScreen } from './TravelScreen';
import type { ScreenProps } from './types';

interface GameScreenProps {
  readonly session: GameSession;
  readonly ctx: GameContext;
  readonly state: GameState;
}

interface Nav {
  readonly tab: DockTab;
  readonly placeId: string | null;
}

interface TabContentProps extends ScreenProps {
  readonly nav: Nav;
  readonly setNav: (n: Nav) => void;
  readonly onAbandon: () => void;
}

function TabContent({ nav, setNav, onAbandon, ...props }: TabContentProps) {
  const openPlace = (placeId: string) => {
    setNav({ tab: 'here', placeId });
  };
  switch (nav.tab) {
    case 'here': {
      const place = nav.placeId
        ? hubView(props.state, props.ctx).places.find((p) => p.id === nav.placeId)
        : null;
      return place ? (
        <PlacePage
          {...props}
          kind={place.kind}
          onBack={() => {
            setNav({ tab: 'here', placeId: null });
          }}
        />
      ) : (
        <HubScreen
          {...props}
          onOpenPlace={openPlace}
          onOpenRecord={() => {
            setNav({ tab: 'record', placeId: null });
          }}
        />
      );
    }
    case 'travel':
      return <TravelScreen {...props} />;
    case 'jutsu':
      return <JutsuScreen {...props} />;
    case 'shinobi':
      return <ShinobiScreen {...props} onAbandon={onAbandon} />;
    case 'record':
      return <RecordScreen {...props} />;
  }
}

/**
 * Routes between the three layers: scenes (missions, fights) take the whole screen;
 * otherwise the dock tab decides, and "Here" shows the village or one of its places.
 */
export function GameScreen({ session, ctx, state }: GameScreenProps) {
  const [nav, setNav] = useState<Nav>({ tab: 'here', placeId: null });
  const props: ScreenProps = { ctx, state, perform: session.perform };
  const report = state.reports[0];
  const inScene = state.combat !== null || state.mission !== null;

  return (
    <div className="app">
      {session.notice && <Notice text={session.notice} onDismiss={session.dismissNotice} />}
      {state.combat ? (
        <CombatScene {...props} />
      ) : state.mission ? (
        <MissionScene {...props} />
      ) : (
        <TabContent {...props} nav={nav} setNav={setNav} onAbandon={session.abandon} />
      )}
      {!inScene && (
        <Dock
          active={nav.tab}
          onSelect={(tab) => {
            setNav({ tab, placeId: null });
          }}
        />
      )}
      {report && (
        <ReportCard
          report={report}
          onContinue={() => {
            session.perform({ type: 'dismissReport' });
          }}
        />
      )}
    </div>
  );
}
