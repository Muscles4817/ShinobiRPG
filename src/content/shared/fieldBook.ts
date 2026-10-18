import type { FieldBookRewards } from '../fieldBook';

/** What a full page of the field book leaves you, in every pack. */
export const FIELD_BOOK_REWARDS: FieldBookRewards = {
  fish: {
    furnishingId: 'gyotaku-print',
    keepsake: {
      name: 'A cork float, bitten',
      line: 'Off the line that has brought up every fish the rivers keep.',
    },
  },
  finds: {
    furnishingId: 'drying-rack',
    keepsake: {
      name: 'A forager’s knife',
      line: 'Worn smooth at the grip from gathering everything the woods and banks give.',
    },
  },
  recipes: {
    keepsake: {
      name: 'A cook’s knife, honed thin',
      line: 'Kept sharp through every dish there was to learn.',
    },
  },
  sights: {
    keepsake: {
      name: 'A paper lantern that never quite goes out',
      line: 'It has burned since the night you followed the last of the village’s sights to its end.',
    },
  },
  foes: {
    keepsake: {
      name: 'A post notched with tallies',
      line: 'A notch for every kind of foe you have beaten.',
    },
  },
};
