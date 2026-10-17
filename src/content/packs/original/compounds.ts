import type { PlaceDef } from '../../types';

/** Tōrōgakure’s clan quarter and the compounds of the four lantern clans. */
export const TOROGAKURE_COMPOUNDS: readonly PlaceDef[] = [
  {
    id: 'clan-quarter',
    kind: 'quarter',
    name: 'Clan Quarter',
    icon: 'torii',
    blurb: 'Where the four lantern clans live',
    compoundIds: ['hibana-compound', 'tokaku-compound', 'kurogane-compound', 'shimenawa-compound'],
  },
  {
    id: 'hibana-compound',
    kind: 'compound',
    name: 'Hibana Compound',
    icon: 'house',
    blurb: 'Braziers burning in the courtyard',
    clanId: 'hibana',
    headId: 'enji',
  },
  {
    id: 'tokaku-compound',
    kind: 'compound',
    name: 'Tōkaku Compound',
    icon: 'house',
    blurb: 'Pale lanterns that never go out',
    clanId: 'tokaku',
    headId: 'sayo',
  },
  {
    id: 'kurogane-compound',
    kind: 'compound',
    name: 'Kurogane Compound',
    icon: 'house',
    blurb: 'The ring of hammers behind the forge',
    clanId: 'kurogane',
    headId: 'daigo',
  },
  {
    id: 'shimenawa-compound',
    kind: 'compound',
    name: 'Shimenawa Compound',
    icon: 'house',
    blurb: 'Rope-hung gates and a hush inside',
    clanId: 'shimenawa',
    headId: 'kazane',
  },
  {
    id: 'animal-clinic',
    kind: 'vet',
    name: 'Kiyose Animal Clinic',
    icon: 'heal',
    blurb: 'Paws, hooves and wings mended',
    keeperId: 'kaori',
    treatmentCost: 40,
    medicineCost: 15,
  },
];
