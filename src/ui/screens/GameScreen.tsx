import { useState } from 'react';

import { activeScene, hubView, type GameContext, type GameState, type SceneKind } from '@/game';

import { Dock, type DockTab } from '../components/Dock';
import { Notice } from '../components/Notice';
import { PersonSheet } from '../components/PersonSheet';
import { ReportCard } from '../components/ReportCard';
import type { GameSession } from '../useGameSession';
import { BondsScreen } from './BondsScreen';
import { HubScreen } from './HubScreen';
import { PlacePage } from './places/PlacePage';
import { RecordScreen } from './RecordScreen';
import { CombatScene } from './scenes/CombatScene';
import { ConversationScene } from './scenes/ConversationScene';
import { MissionScene } from './scenes/MissionScene';
import { TeamScene } from './scenes/TeamScene';
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
  readonly onOpenPerson: (personId: string) => void;
}

function TabContent({ nav, setNav, onAbandon, onOpenPerson, ...props }: TabContentProps) {
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
          onOpenPerson={onOpenPerson}
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
    case 'bonds':
      return <BondsScreen {...props} onOpenPerson={onOpenPerson} />;
    case 'shinobi':
      return <ShinobiScreen {...props} onAbandon={onAbandon} />;
    case 'record':
      return <RecordScreen {...props} />;
  }
}

function Scene({ kind, ...props }: ScreenProps & { readonly kind: SceneKind }) {
  switch (kind) {
    case 'combat':
      return <CombatScene {...props} />;
    case 'mission':
      return <MissionScene {...props} />;
    case 'conversation':
      return <ConversationScene {...props} />;
    case 'team':
      return <TeamScene {...props} />;
  }
}

/**
 * Routes between the three layers: scenes (fights, missions, talks, team assignment) take
 * the whole screen; otherwise the dock tab decides, and "Here" shows the village or a place.
 * A person's sheet can open over any tab.
 */
export function GameScreen({ session, ctx, state }: GameScreenProps) {
  const [nav, setNav] = useState<Nav>({ tab: 'here', placeId: null });
  const [personId, setPersonId] = useState<string | null>(null);
  const props: ScreenProps = { ctx, state, perform: session.perform };
  const report = state.reports[0];
  const scene = activeScene(state);

  return (
    <div className="app">
      {session.notice && <Notice text={session.notice} onDismiss={session.dismissNotice} />}
      {scene ? (
        <Scene {...props} kind={scene} />
      ) : (
        <TabContent
          {...props}
          nav={nav}
          setNav={setNav}
          onAbandon={session.abandon}
          onOpenPerson={setPersonId}
        />
      )}
      {!scene && (
        <Dock
          active={nav.tab}
          onSelect={(tab) => {
            setNav({ tab, placeId: null });
          }}
        />
      )}
      {personId && !scene && (
        <PersonSheet
          {...props}
          personId={personId}
          onClose={() => {
            setPersonId(null);
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
