import type { ReactNode } from 'react';

import { headerView } from '@/game';

import { Dock, type DockTab } from '../components/Dock';
import type { ScreenProps } from '../screens/types';
import { PlaceRail } from './PlaceRail';
import { useDockKeys } from './useDockKeys';
import { YouPanel } from './YouPanel';

interface WideFrameProps extends ScreenProps {
  readonly tab: DockTab;
  readonly placeId: string | null;
  readonly onTab: (tab: DockTab) => void;
  readonly onOpenPlace: (placeId: string) => void;
  readonly onOpenCompanion: () => void;
  /** The tab's own content, for the main column. */
  readonly children: ReactNode;
}

/**
 * The desktop layout outside scenes: the dock as a wooden side rail with the village's places
 * under it, the tab's content in the middle, and the you panel on the right. It arranges the
 * same screens the phone shows; nothing here decides what you can do.
 */
export function WideFrame({
  tab,
  placeId,
  onTab,
  onOpenPlace,
  onOpenCompanion,
  children,
  ...props
}: WideFrameProps) {
  useDockKeys(true, onTab);
  const header = headerView(props.state, props.ctx);
  const onVillage = tab === 'here' && placeId === null;
  return (
    <div className="wide-frame">
      <div className="wide-rail">
        <div className="rail-title">
          <b>{header.location}</b>
          <span>{header.epithet}</span>
        </div>
        <Dock active={tab} onSelect={onTab} showKeys />
        <PlaceRail
          {...props}
          openPlaceId={tab === 'here' ? placeId : null}
          onOpenPlace={onOpenPlace}
        />
      </div>
      <div className={onVillage ? 'wide-main village' : 'wide-main'}>{children}</div>
      <YouPanel {...props} onOpenCompanion={onOpenCompanion} />
    </div>
  );
}
