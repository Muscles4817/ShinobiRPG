import type { PlaceKind } from '@/game';

import type { PlaceProps } from '../types';
import { AcademyPage } from './AcademyPage';
import { HomePage, HospitalPage } from './HomePages';
import { MarketPage } from './MarketPage';
import { MissionHallPage } from './MissionHallPage';
import { TrainingPage } from './TrainingPage';

/** Each kind of place has its own page design. */
export function PlacePage({ kind, ...props }: PlaceProps & { readonly kind: PlaceKind }) {
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
  }
}
