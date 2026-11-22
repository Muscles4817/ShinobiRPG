/** The two sides of a fight: the player's and their foes'. Shared by every part of the contract. */
export type CombatSide = 'player' | 'enemy';

/** How far apart the two sides stand. Engines decide what each band allows. */
export type RangeBand = 'close' | 'mid' | 'far';
