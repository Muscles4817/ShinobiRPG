import type { FieldBookRewards } from '../fieldBook';

/** What a full page of the field book leaves you, in every pack. */
export const FIELD_BOOK_REWARDS: FieldBookRewards = {
  fish: {
    furnishingId: 'gyotaku-print',
    keepsake: {
      name: 'A cork float, bitten',
      line: 'Every fish the rivers keep, caught at least once.',
    },
  },
  finds: {
    furnishingId: 'drying-rack',
    keepsake: {
      name: 'A forager’s knife',
      line: 'Every wild thing the woods and banks give, gathered by your own hand.',
    },
  },
  recipes: {
    keepsake: {
      name: 'A cook’s knife, honed thin',
      line: 'Every dish there is to learn, learned.',
    },
  },
  sights: {
    keepsake: {
      name: 'A paper lantern that never quite goes out',
      line: 'Every sight that walks the village at night, followed to its end.',
    },
  },
  foes: {
    keepsake: {
      name: 'A post notched with tallies',
      line: 'A notch for every kind of foe you have beaten.',
    },
  },
};
