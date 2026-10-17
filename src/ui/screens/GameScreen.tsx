import { useEffect, useState } from 'react';

import {
  activeScene,
  hubView,
  reportSound,
  type GameContext,
  type GameState,
  type SceneKind,
} from '@/game';

import { useSound } from '../audio/SoundProvider';

import { CueLayer } from '../components/CueLayer';
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
import { EncounterScene } from './scenes/EncounterScene';
import { ExamScene } from './scenes/ExamScene';
import { MissionScene } from './scenes/MissionScene';
import { PromotionScene } from './scenes/PromotionScene';
import { SettingsScreen } from './settings/SettingsScreen';
import { ChakraPaperScene } from './scenes/ChakraPaperScene';
import { SenseiTestScene } from './scenes/SenseiTestScene';
import { TeamScene } from './scenes/TeamScene';
import { JutsuScreen } from './YouScreens';
import { ShinobiScreen } from './ShinobiScreen';
import { TravelScreen } from './TravelScreen';
import type { ScreenProps } from './types';

interface GameScreenProps {
  readonly session: GameSession;
  readonly ctx: GameContext;
  readonly state: GameState;
  /** Back to the title menu (the game is saved after every change). */
  readonly onMenu: () => void;
}

interface Nav {
  readonly tab: DockTab;
  readonly placeId: string | null;
  /** The settings page, opened from the Shinobi tab. */
  readonly settings?: boolean;
}

interface TabContentProps extends ScreenProps {
  readonly nav: Nav;
  readonly setNav: (n: Nav) => void;
  readonly onAbandon: () => void;
  readonly onMenu: () => void;
  readonly onOpenPerson: (personId: string) => void;
}

function TabContent({ nav, setNav, onAbandon, onMenu, onOpenPerson, ...props }: TabContentProps) {
  const { play } = useSound();
  const openPlace = (placeId: string) => {
    play('page');
    setNav({ tab: 'here', placeId });
  };
  if (nav.settings) {
    return (
      <SettingsScreen
        game={props}
        onBack={() => {
          setNav({ ...nav, settings: false });
        }}
      />
    );
  }
  switch (nav.tab) {
    case 'here': {
      const hub = nav.placeId ? hubView(props.state, props.ctx) : null;
      const place = hub && [...hub.places, ...hub.inner].find((p) => p.id === nav.placeId);
      return place ? (
        <PlacePage
          {...props}
          kind={place.kind}
          placeId={place.id}
          onOpenPlace={openPlace}
          onBack={() => {
            setNav({ tab: 'here', placeId: place.parentId });
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
      return (
        <ShinobiScreen
          {...props}
          onAbandon={onAbandon}
          onMenu={onMenu}
          onSettings={() => {
            play('page');
            setNav({ ...nav, settings: true });
          }}
        />
      );
    case 'record':
      return <RecordScreen {...props} />;
  }
}

function Scene({ kind, ...props }: ScreenProps & { readonly kind: SceneKind }) {
  switch (kind) {
    case 'combat':
      return <CombatScene {...props} />;
    case 'encounter':
      return <EncounterScene {...props} />;
    case 'mission':
      return <MissionScene {...props} />;
    case 'exam':
      return <ExamScene {...props} />;
    case 'promotion':
      return <PromotionScene {...props} />;
    case 'conversation':
      return <ConversationScene {...props} />;
    case 'team':
      return <TeamScene {...props} />;
    case 'chakra-paper':
      return <ChakraPaperScene {...props} />;
    case 'sensei-test':
      return <SenseiTestScene {...props} />;
  }
}

/**
 * Routes between the three layers: scenes (fights, missions, exams, ceremonies, talks, team
 * assignment) take the whole screen; otherwise the dock tab decides, and "Here" shows the village or a place.
 * A person's sheet can open over any tab.
 */
export function GameScreen({ session, ctx, state, onMenu }: GameScreenProps) {
  const [nav, setNav] = useState<Nav>({ tab: 'here', placeId: null });
  const [personId, setPersonId] = useState<string | null>(null);
  const props: ScreenProps = { ctx, state, perform: session.perform };
  const report = state.reports[0];
  const scene = activeScene(state);
  const showReport = report && !state.combatFinale ? report : null;
  const { play } = useSound();
  useEffect(() => {
    if (showReport) play(reportSound(showReport));
  }, [showReport, play]);

  return (
    <div className="app" data-motion={state.settings.animations ? 'on' : 'off'}>
      {session.notice && <Notice text={session.notice} onDismiss={session.dismissNotice} />}
      {scene ? (
        <Scene {...props} kind={scene} />
      ) : (
        <TabContent
          {...props}
          nav={nav}
          setNav={setNav}
          onAbandon={session.abandon}
          onMenu={onMenu}
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
      {session.cue && state.settings.animations && (
        <CueLayer cue={session.cue} onDone={session.clearCue} />
      )}
      {showReport && (
        <ReportCard
          report={showReport}
          onContinue={() => {
            session.perform({ type: 'dismissReport' });
          }}
        />
      )}
    </div>
  );
}
