import { useCallback, useEffect, useState } from 'react';

import {
  sceneOnScreen,
  hubView,
  overlayOnScreen,
  reportSound,
  type GameContext,
  type GameState,
} from '@/game';

import { useSound } from '../audio/SoundProvider';

import { CueLayer } from '../components/CueLayer';
import { Dock, type DockTab } from '../components/Dock';
import { Notice } from '../components/Notice';
import { PersonSheet } from '../components/PersonSheet';
import { CompanionSheet } from '../components/CompanionSheet';
import { OverlayCard } from '../components/OverlayCard';
import { KeyLayer } from '../layout/KeyLayer';
import { appClass } from '../layout/sceneLayout';
import { WideFrame } from '../layout/WideFrame';
import { useWideScreen } from '../layout/useWideScreen';
import type { GameSession } from '../useGameSession';
import { ThinkingSlip } from '../fight/ThinkingSlip';
import { BondsScreen } from './BondsScreen';
import { HubScreen } from './HubScreen';
import { PlacePage } from './places/PlacePage';
import { RecordScreen } from './RecordScreen';
import { SceneBox } from './SceneBox';
import type { SaveKeeping } from './settings/SaveData';
import { SettingsScreen } from './settings/SettingsScreen';
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
  /** The desktop layout, which shows you in its own panel rather than on the village screen. */
  readonly wide: boolean;
  readonly setNav: (n: Nav) => void;
  readonly onAbandon: () => void;
  readonly saves: SaveKeeping;
  readonly onMenu: () => void;
  readonly onOpenPerson: (personId: string) => void;
  readonly onOpenCompanion: () => void;
}

function TabContent({
  nav,
  wide,
  setNav,
  onAbandon,
  saves,
  onMenu,
  onOpenPerson,
  onOpenCompanion,
  ...props
}: TabContentProps) {
  const { play } = useSound();
  const openPlace = (placeId: string) => {
    play('page');
    setNav({ tab: 'here', placeId });
  };
  if (nav.settings) {
    return (
      <SettingsScreen
        game={props}
        saves={saves}
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
          wide={wide}
          onOpenPlace={openPlace}
          onOpenPerson={onOpenPerson}
          onOpenCompanion={onOpenCompanion}
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
      return (
        <BondsScreen {...props} onOpenPerson={onOpenPerson} onOpenCompanion={onOpenCompanion} />
      );
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

interface DrawerProps extends ScreenProps {
  /** The person whose sheet is open; otherwise it is your companion's. */
  readonly personId: string | null;
  readonly onClosePerson: () => void;
  readonly onCloseCompanion: () => void;
}

/** The sheet open from the right over a tab: a person's, or your companion's. */
function Drawer({ personId, onClosePerson, onCloseCompanion, ...props }: DrawerProps) {
  return personId ? (
    <PersonSheet {...props} personId={personId} onClose={onClosePerson} />
  ) : (
    <CompanionSheet {...props} onClose={onCloseCompanion} />
  );
}

/**
 * Routes between the three layers: scenes (fights, missions, exams, ceremonies, talks, team
 * assignment) take the whole screen; otherwise the dock tab decides, and "Here" shows the village or a place.
 * A person's sheet can open over any tab, and the game's card (`overlayOnScreen`) over
 * everything. Keys reach only what is on top: each layer under something is a `KeyLayer` that
 * isn't live.
 */
export function GameScreen({ session, ctx, state, onMenu }: GameScreenProps) {
  const [nav, setNav] = useState<Nav>({ tab: 'here', placeId: null });
  const [personId, setPersonId] = useState<string | null>(null);
  const [companionOpen, setCompanionOpen] = useState(false);
  const props: ScreenProps = { ctx, state, perform: session.perform };
  const scene = sceneOnScreen(state, ctx);
  const overlay = overlayOnScreen(state, ctx);
  const report = overlay?.kind === 'report' ? overlay.report : null;
  const drawer = !scene && (personId !== null || companionOpen);
  const { play } = useSound();
  useEffect(() => {
    if (report) play(reportSound(report));
  }, [report, play]);
  const wide = useWideScreen();
  const selectTab = useCallback((tab: DockTab) => {
    setNav({ tab, placeId: null });
  }, []);
  const openPlace = (placeId: string) => {
    play('page');
    setNav({ tab: 'here', placeId });
  };
  const openCompanion = () => {
    setCompanionOpen(true);
  };
  const tabContent = (
    <TabContent
      {...props}
      nav={nav}
      wide={wide}
      setNav={setNav}
      onAbandon={session.abandon}
      saves={session}
      onMenu={onMenu}
      onOpenPerson={setPersonId}
      onOpenCompanion={openCompanion}
    />
  );

  return (
    <div className={appClass(wide, scene)} data-motion={state.settings.animations ? 'on' : 'off'}>
      {session.notice && <Notice text={session.notice} onDismiss={session.dismissNotice} />}
      <ThinkingSlip thinking={session.thinking} />
      <KeyLayer live={overlay === null && !drawer}>
        {scene ? (
          <SceneBox {...props} kind={scene} thinking={session.thinking} />
        ) : wide ? (
          <WideFrame
            {...props}
            tab={nav.tab}
            placeId={nav.placeId}
            onTab={selectTab}
            onOpenPlace={openPlace}
            onOpenCompanion={openCompanion}
          >
            {tabContent}
          </WideFrame>
        ) : (
          <>
            {tabContent}
            <Dock active={nav.tab} onSelect={selectTab} />
          </>
        )}
      </KeyLayer>
      <KeyLayer live={overlay === null}>
        {drawer && (
          <Drawer
            {...props}
            personId={personId}
            onClosePerson={() => {
              setPersonId(null);
            }}
            onCloseCompanion={() => {
              setCompanionOpen(false);
            }}
          />
        )}
      </KeyLayer>
      {session.cue && state.settings.animations && (
        <CueLayer cue={session.cue} onDone={session.clearCue} />
      )}
      {overlay && <OverlayCard overlay={overlay} perform={session.perform} />}
    </div>
  );
}
