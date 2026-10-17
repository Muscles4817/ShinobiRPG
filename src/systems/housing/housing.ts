/**
 * Where the character lives, whether the rent is paid, and the houses they own elsewhere. Rent is paid a week at a time;
 * once the paid-through day has passed, the landlord locks the door until you pay.
 */
export const DAYS_PER_RENT_PERIOD = 7;

/** Where a home is: the home place, and the village (a location id) it is in. */
export interface HomeRef {
  /** Absent: the pack's start village (every save made before there was another). */
  readonly villageId?: string;
  readonly placeId: string;
}

export interface Housing extends HomeRef {
  readonly rentPerWeek: number;
  /** Last day covered by rent already paid. */
  readonly paidThroughDay: number;
  /** Where you actually live, when it isn't the home place's own lodging (e.g. a clan compound). */
  readonly lodging?: string;
  /** Houses you own in towns (place ids): bought outright, no rent. */
  readonly owned: readonly string[];
  /** The home you moved into up the ladder (`HomeDef`), or null for the one you started in. */
  readonly homeId: string | null;
  /** Furniture you own (`FurnishingDef` ids): it moves house with you. */
  readonly furniture: readonly string[];
  /** What stands in each spot of the home (spot → furnishing id). */
  readonly placed: Readonly<Record<string, string>>;
  /** The garden's beds, empty or planted. */
  readonly beds: readonly (Planting | null)[];
  /** A friend staying in your guest room. */
  readonly guestId: string | null;
}

/** A bed planted with something that comes up as an ingredient. */
export interface Planting {
  readonly ingredientId: string;
  readonly plantedDay: number;
}

/** A start with no furniture, no garden and nobody staying. */
export const UNFURNISHED = {
  homeId: null,
  furniture: [],
  placed: {},
  beds: [],
  guestId: null,
} as const satisfies Partial<Housing>;

export function newTenancy(home: HomeRef, rentPerWeek: number, today: number): Housing {
  // The first week comes paid as part of graduating.
  return {
    ...home,
    rentPerWeek,
    paidThroughDay: today + DAYS_PER_RENT_PERIOD - 1,
    owned: [],
    ...UNFURNISHED,
  };
}

/** Rent-free lodging, such as a room in your clan's compound. */
export function freeLodging(home: HomeRef, lodging: string, today: number): Housing {
  return { ...home, rentPerWeek: 0, paidThroughDay: today, lodging, owned: [], ...UNFURNISHED };
}

export function isRentFree(housing: Housing): boolean {
  return housing.rentPerWeek === 0;
}

export function isRentOverdue(housing: Housing, today: number): boolean {
  return !isRentFree(housing) && today > housing.paidThroughDay;
}

/** Days until rent runs out; 0 means it runs out at the end of today, negative = overdue. */
export function daysOfRentLeft(housing: Housing, today: number): number {
  return housing.paidThroughDay - today;
}

export function payWeek(housing: Housing): Housing {
  return { ...housing, paidThroughDay: housing.paidThroughDay + DAYS_PER_RENT_PERIOD };
}

export function ownsHouse(housing: Housing, placeId: string): boolean {
  return housing.owned.includes(placeId);
}

/** A house bought: it is yours from now on. */
export function buyHouse(housing: Housing, placeId: string): Housing {
  return ownsHouse(housing, placeId) ? housing : { ...housing, owned: [...housing.owned, placeId] };
}
