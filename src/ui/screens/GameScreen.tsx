import { useState } from 'react';

import { journalView, statusView } from '@/game';

import { Notice } from '../components/Notice';
import { StatusBar } from '../components/StatusBar';
import { TabBar, type Tab } from '../components/TabBar';
import { CombatPanel } from './CombatPanel';
import { MissionPanel } from './MissionPanel';
import { HomeTab, JutsuTab, MissionsTab, TrainTab } from './activityTabs';
import { JournalTab, ProfileTab } from './infoTabs';
import type { TabProps } from './types';

type TabId = 'home' | 'train' | 'missions' | 'jutsu' | 'profile' | 'journal';

const TABS: readonly Tab<TabId>[] = [
  { id: 'home', label: 'Home' },
  { id: 'train', label: 'Train' },
  { id: 'missions', label: 'Missions' },
  { id: 'jutsu', label: 'Jutsu' },
  { id: 'profile', label: 'Ninja' },
  { id: 'journal', label: 'Journal' },
];

function TabContent({ tab, ...props }: TabProps & { readonly tab: TabId }) {
  switch (tab) {
    case 'home':
      return <HomeTab {...props} />;
    case 'train':
      return <TrainTab {...props} />;
    case 'missions':
      return <MissionsTab {...props} />;
    case 'jutsu':
      return <JutsuTab {...props} />;
    case 'profile':
      return <ProfileTab {...props} />;
    case 'journal':
      return <JournalTab {...props} />;
  }
}

export function GameScreen({ ctx, state, session }: TabProps) {
  const [tab, setTab] = useState<TabId>('home');
  const latest = journalView(state)[0];
  const props = { ctx, state, session };

  const body = state.combat ? (
    <CombatPanel {...props} />
  ) : state.mission ? (
    <MissionPanel {...props} />
  ) : (
    <TabContent tab={tab} {...props} />
  );

  return (
    <div className="app">
      <StatusBar status={statusView(state)} compact={state.combat !== null} />
      <main className="screen">
        {session.notice && <Notice text={session.notice} onDismiss={session.dismissNotice} />}
        {latest && !state.combat && (
          <p className={`latest tone-${latest.tone}`} aria-live="polite">
            {latest.text}
          </p>
        )}
        {body}
      </main>
      {!state.combat && !state.mission && <TabBar tabs={TABS} active={tab} onSelect={setTab} />}
    </div>
  );
}
