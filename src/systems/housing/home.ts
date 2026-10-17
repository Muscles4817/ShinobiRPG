import { DAYS_PER_RENT_PERIOD, type Housing, type Planting } from './housing';

/**
 * Making a home: moving up the ladder, the furniture you own and where it stands, and the
 * garden. Furniture is yours and moves with you; what a spot held stays only if the new home
 * has that spot. A garden starts bare in every new home, and a guest stays only where there is
 * a guest room.
 */

/** The home moved into: its id, the room's name, what it costs and what it has. */
export interface Move {
  readonly homeId: string;
  readonly lodging: string;
  /** Rent a week; 0 for a home bought outright. */
  readonly rentPerWeek: number;
  readonly today: number;
  readonly spots: readonly string[];
  readonly beds: number;
  readonly guestRoom: boolean;
}

/** Into a new home: the first week's rent is paid as you take the keys. */
export function moveHome(housing: Housing, move: Move): Housing {
  const placed = Object.fromEntries(
    Object.entries(housing.placed).filter(([spot]) => move.spots.includes(spot)),
  );
  return {
    ...housing,
    homeId: move.homeId,
    lodging: move.lodging,
    rentPerWeek: move.rentPerWeek,
    paidThroughDay: move.today + DAYS_PER_RENT_PERIOD - 1,
    placed,
    beds: Array.from({ length: move.beds }, () => null),
    guestId: move.guestRoom ? housing.guestId : null,
  };
}

export function ownsFurniture(housing: Housing, id: string): boolean {
  return housing.furniture.includes(id);
}

export function addFurniture(housing: Housing, id: string): Housing {
  return ownsFurniture(housing, id)
    ? housing
    : { ...housing, furniture: [...housing.furniture, id] };
}

/** A piece set in a spot, putting away whatever stood there (still yours). */
export function placeFurniture(housing: Housing, spot: string, id: string): Housing {
  return { ...housing, placed: { ...housing.placed, [spot]: id } };
}

/** Whether what is in this bed is ready to pick today. */
export function isRipe(planting: Planting, days: number, today: number): boolean {
  return today - planting.plantedDay >= days;
}

export function plant(housing: Housing, bed: number, planting: Planting | null): Housing {
  return { ...housing, beds: housing.beds.map((b, i) => (i === bed ? planting : b)) };
}

export function setGuest(housing: Housing, guestId: string | null): Housing {
  return { ...housing, guestId };
}
