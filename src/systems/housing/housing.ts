/**
 * Where the character lives and whether the rent is paid. Rent is paid a week at a time;
 * once the paid-through day has passed, the landlord locks the door until you pay.
 */
export const DAYS_PER_RENT_PERIOD = 7;

export interface Housing {
  /** The home place (in the home location) this tenancy is for. */
  readonly placeId: string;
  readonly rentPerWeek: number;
  /** Last day covered by rent already paid. */
  readonly paidThroughDay: number;
}

export function newTenancy(placeId: string, rentPerWeek: number, today: number): Housing {
  // The first week comes paid as part of graduating.
  return { placeId, rentPerWeek, paidThroughDay: today + DAYS_PER_RENT_PERIOD - 1 };
}

export function isRentOverdue(housing: Housing, today: number): boolean {
  return today > housing.paidThroughDay;
}

/** Days until rent runs out; 0 means it runs out at the end of today, negative = overdue. */
export function daysOfRentLeft(housing: Housing, today: number): number {
  return housing.paidThroughDay - today;
}

export function payWeek(housing: Housing): Housing {
  return { ...housing, paidThroughDay: housing.paidThroughDay + DAYS_PER_RENT_PERIOD };
}
