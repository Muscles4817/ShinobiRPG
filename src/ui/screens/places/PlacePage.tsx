import type { PlaceKind } from '@/game';

import type { PlaceProps } from '../types';
import { AcademyPage } from './AcademyPage';
import { GearShopPage } from './GearShopPage';
import { HomePage, HospitalPage } from './HomePages';
import { InnPage } from './InnPage';
import { LibraryPage } from './LibraryPage';
import { MarketPage } from './MarketPage';
import { MissionHallPage } from './MissionHallPage';
import { TavernPage } from './TavernPage';
import { TrainingPage } from './TrainingPage';
import { WildsPage } from './WildsPage';

/** Each kind of place has its own page design. */
interface PlacePageProps extends PlaceProps {
  readonly kind: PlaceKind;
  readonly placeId: string;
}

export function PlacePage({ kind, placeId, ...props }: PlacePageProps) {
  switch (kind) {
    case 'training':
      return <TrainingPage {...props} />;
    case 'market':
      return <MarketPage {...props} />;
    case 'home':
      return <HomePage {...props} />;
    case 'hospital':
      return <HospitalPage {...props} />;
    case 'missions':
      return <MissionHallPage {...props} />;
    case 'academy':
      return <AcademyPage {...props} />;
    case 'library':
      return <LibraryPage {...props} />;
    case 'gear':
      return <GearShopPage {...props} placeId={placeId} />;
    case 'tavern':
      return <TavernPage {...props} />;
    case 'inn':
      return <InnPage {...props} />;
    case 'wilds':
      return <WildsPage {...props} placeId={placeId} />;
  }
}
