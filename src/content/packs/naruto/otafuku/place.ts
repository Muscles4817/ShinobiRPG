import type { LocationDef } from '../../../types';

/**
 * Otafuku Town, the pleasure quarter two days east: teahouses, music after dark, and a
 * famous hermit's favourite street for research. An inn, a sweets market, a teahouse that
 * never closes, and the quarter's own small troubles.
 */
export const OTAFUKU_TOWN: LocationDef = {
  id: 'otafuku-town',
  name: 'Otafuku Town',
  kind: 'town',
  epithet: 'Pleasure quarter',
  map: { x: 52, y: 36.5 },
  backdrop: 'lantern-rooftops',
  places: [
    {
      id: 'smiling-mask-inn',
      kind: 'inn',
      name: 'The Smiling Mask',
      icon: 'house',
      blurb: 'Lacquered screens, soft mats and a smiling mask over every door.',
      keeper: 'Madam Kiku, who asks no questions and remembers every answer',
      roomCost: 40,
    },
    {
      id: 'lantern-row',
      kind: 'market',
      name: 'Lantern Row',
      icon: 'lantern',
      blurb: 'Sweets and skewers under red lanterns',
      stalls: [
        {
          name: 'The Manjū House',
          blurb: 'Steamed buns shaped like the town’s smiling mask',
          hours: ['afternoon', 'evening', 'night'],
          icon: 'dango',
          foodIds: ['otafuku-manju', 'hanami-dango'],
        },
        {
          name: 'Night Skewers',
          blurb: 'For the walk between teahouses',
          hours: ['evening', 'night'],
          icon: 'grill',
          foodIds: ['tavern-yakitori', 'takoyaki'],
        },
      ],
    },
    {
      id: 'willow-teahouse',
      kind: 'tavern',
      name: 'The Willow Teahouse',
      icon: 'tea',
      blurb: 'Shamisen, songs and very good sake',
      hours: ['evening', 'night'],
      keeper: 'The mistress of the house, in silk and patience',
      foodIds: ['tavern-oden', 'barley-tea', 'otafuku-manju'],
      roundCost: 60,
      cupCost: 20,
      pastimes: [
        {
          id: 'fan-toss',
          name: 'Fan-tossing',
          scene:
            'Guests kneel and toss folded fans at a butterfly perched on a little box. Kotone keeps score on her shamisen.',
        },
      ],
    },
    {
      id: 'quarter-office',
      kind: 'missions',
      name: 'The Quarter Office',
      icon: 'board',
      blurb: 'The teahouses’ association takes on help',
      missionIds: ['otafuku-hermit-research', 'otafuku-silent-shamisen', 'otafuku-gilded-debt'],
    },
  ],
};
