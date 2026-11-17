/**
 * Which half of the world a player's clock keeps, read from the device's time zone name: the
 * title's seasons turn over south of the equator, so a player in Sydney gets snow in July.
 * Nothing is asked for and nothing leaves the device; an unknown or missing zone is north.
 */

export type Hemisphere = 'north' | 'south';

/** Whole regions of zones that lie south of the equator. */
const SOUTHERN_PREFIXES: readonly string[] = ['Australia/', 'Antarctica/', 'America/Argentina/'];

/** Zones south of the equator in regions that straddle it, or lie mostly north of it. */
const SOUTHERN_ZONES: ReadonlySet<string> = new Set([
  'Pacific/Auckland',
  'Pacific/Chatham',
  'Pacific/Fiji',
  'Pacific/Noumea',
  'Pacific/Tongatapu',
  'Pacific/Apia',
  'Pacific/Efate',
  'Pacific/Port_Moresby',
  'Pacific/Norfolk',
  'Pacific/Tahiti',
  'Pacific/Rarotonga',
  'Pacific/Easter',
  'America/Sao_Paulo',
  'America/Santiago',
  'America/Punta_Arenas',
  'America/Montevideo',
  'America/Asuncion',
  'America/La_Paz',
  'America/Lima',
  'America/Bahia',
  'America/Recife',
  'America/Fortaleza',
  'America/Maceio',
  'America/Belem',
  'America/Manaus',
  'America/Cuiaba',
  'America/Campo_Grande',
  'America/Porto_Velho',
  'America/Rio_Branco',
  'America/Araguaina',
  'Atlantic/Stanley',
  'Atlantic/South_Georgia',
  'Atlantic/St_Helena',
  'Africa/Johannesburg',
  'Africa/Maputo',
  'Africa/Harare',
  'Africa/Lusaka',
  'Africa/Windhoek',
  'Africa/Gaborone',
  'Africa/Maseru',
  'Africa/Mbabane',
  'Africa/Luanda',
  'Africa/Lubumbashi',
  'Africa/Blantyre',
  'Africa/Dar_es_Salaam',
  'Africa/Bujumbura',
  'Africa/Kigali',
  'Indian/Mauritius',
  'Indian/Reunion',
  'Indian/Antananarivo',
  'Indian/Comoro',
  'Indian/Mayotte',
  'Asia/Jakarta',
  'Asia/Makassar',
  'Asia/Jayapura',
  'Asia/Dili',
]);

export function hemisphereOf(timeZone: string | undefined): Hemisphere {
  if (!timeZone) return 'north';
  const south =
    SOUTHERN_ZONES.has(timeZone) || SOUTHERN_PREFIXES.some((p) => timeZone.startsWith(p));
  return south ? 'south' : 'north';
}
