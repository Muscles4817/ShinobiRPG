import { isRestKind, type PlaceKind, type RestKind } from '@/game';

import type { PlaceProps } from '../types';
import { AcademyPage } from './AcademyPage';
import { CompoundPage, QuarterPage } from './CompoundPages';
import { GearShopPage } from './GearShopPage';
import { HomePage, HospitalPage } from './HomePages';
import { HousePage } from './HousePage';
import { InnPage } from './InnPage';
import { LibraryPage } from './LibraryPage';
import { MarketPage } from './MarketPage';
import { MissionHallPage } from './MissionHallPage';
import { OnsenPage } from './OnsenPage';
import { TavernPage } from './TavernPage';
import { TrainingPage } from './TrainingPage';
import { WildsPage } from './WildsPage';

/** Each kind of place has its own page design. */
interface PlacePageProps extends PlaceProps {
  readonly kind: PlaceKind;
  readonly placeId: string;
  /** Opens another place from this one (a compound from the clans' quarter). */
  readonly onOpenPlace: (placeId: string) => void;
}

/** Places to rest, eat and sleep. */
function RestPage({ kind, ...props }: PlaceProps & { readonly kind: RestKind }) {
  switch (kind) {
    case 'home':
      return <HomePage {...props} />;
    case 'hospital':
      return <HospitalPage {...props} />;
    case 'tavern':
      return <TavernPage {...props} />;
    case 'onsen':
      return <OnsenPage {...props} />;
    case 'inn':
      return <InnPage {...props} />;
    case 'house':
      return <HousePage {...props} />;
  }
}

export function PlacePage({ kind, placeId, onOpenPlace, ...props }: PlacePageProps) {
  if (isRestKind(kind)) return <RestPage {...props} kind={kind} />;
  switch (kind) {
    case 'training':
      return <TrainingPage {...props} />;
    case 'market':
      return <MarketPage {...props} />;
    case 'missions':
      return <MissionHallPage {...props} />;
    case 'academy':
      return <AcademyPage {...props} />;
    case 'library':
      return <LibraryPage {...props} />;
    case 'gear':
      return <GearShopPage {...props} placeId={placeId} />;
    case 'wilds':
      return <WildsPage {...props} placeId={placeId} />;
    case 'quarter':
      return <QuarterPage {...props} onOpenPlace={onOpenPlace} />;
    case 'compound':
      return <CompoundPage {...props} placeId={placeId} />;
  }
}
