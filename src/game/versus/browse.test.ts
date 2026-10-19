import { contextForPack } from '../context';
import {
  browseRoster,
  filterRoster,
  OPEN_FILTER,
  versusFacets,
  withGroup,
  type VersusFilter,
} from './filter';
import { versusProfile } from './profile';
import { versusRoster } from './roster';

/** Finding a fighter in versus: the roster's filters, and a fighter's profile before the bout. */

const naruto = contextForPack('naruto')!;
const roster = versusRoster(naruto);

describe('versus filters', () => {
  it('narrows by rank, and offers only facets that still find someone', () => {
    const jonin = { ...OPEN_FILTER, group: 'Jōnin' as const };
    const found = filterRoster(roster, jonin);
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((f) => f.group === 'Jōnin')).toBe(true);
    const facets = versusFacets(roster, jonin);
    expect(facets.kinds).toEqual([]);
    expect(facets.clans.every((c) => c.count > 0)).toBe(true);
    expect(facets.groups.find((g) => g.value === 'Foes')?.count).toBeGreaterThan(0);
  });

  it('reads villages and clans for shinobi and kinds for foes', () => {
    const kakashi = roster.find((f) => f.id === 'person:kakashi');
    expect(kakashi?.village).toBe(naruto.content.locations.require('konohagakure').name);
    expect(roster.find((f) => f.id === 'person:sasuke')?.clan).toBe('Uchiha');
    const foe = roster.find((f) => f.group === 'Foes');
    expect(foe?.kind).toBeTruthy();
    expect(foe?.village).toBeNull();
  });

  it('matches typed names with or without macrons', () => {
    const found = filterRoster(roster, { ...OPEN_FILTER, query: 'jonin kakashi' });
    expect(found.map((f) => f.id)).toEqual(['person:kakashi']);
  });

  it('lets go of a shinobi’s facets on turning to foes', () => {
    const narrowed = { ...OPEN_FILTER, clan: 'Uchiha', village: 'x' };
    expect(withGroup(narrowed, 'Foes')).toMatchObject({ clan: null, village: null });
    expect(withGroup({ ...OPEN_FILTER, kind: 'Bandit' }, 'Genin').kind).toBeNull();
  });
});

describe('versus profiles', () => {
  it('shows what a shinobi brings into the fight', () => {
    const profile = versusProfile(naruto, 'person:kakashi')!;
    expect(profile.fighter.name).toBe('Kakashi Hatake');
    expect(profile.about).not.toBe('');
    expect(profile.stats).toHaveLength(13);
    expect(profile.techniques.length).toBeGreaterThan(0);
    expect(profile.danger).toBeNull();
  });

  it('shows a foe’s danger and kit', () => {
    const foe = roster.find((f) => f.group === 'Foes')!;
    const profile = versusProfile(naruto, foe.id)!;
    expect(profile.danger).toBeTruthy();
    expect(profile.about).not.toBe('');
  });

  it('knows nobody the world doesn’t have', () => {
    expect(versusProfile(naruto, 'person:nobody')).toBeNull();
  });
});

describe('versus sorting', () => {
  const powers = (sort: VersusFilter['sort']) =>
    browseRoster(roster, { ...OPEN_FILTER, sort }).found.map((f) => f.power);

  it('lists by rank by default, as the roster is built', () => {
    expect(browseRoster(roster, OPEN_FILTER).found).toEqual(roster);
  });

  it('orders everyone by fighting power either way', () => {
    expect(powers('strongest')).toEqual([...powers('strongest')].sort((a, b) => b - a));
    expect(powers('weakest')).toEqual([...powers('weakest')].sort((a, b) => a - b));
  });

  it('orders by name, and keeps the order through a filter', () => {
    const names = browseRoster(roster, { ...OPEN_FILTER, group: 'Genin', sort: 'name' }).found;
    const sorted = [...names].sort((a, b) => a.name.localeCompare(b.name));
    expect(names.map((f) => f.id)).toEqual(sorted.map((f) => f.id));
  });

  it('is not a filter: it never makes the list clearable', () => {
    expect(browseRoster(roster, { ...OPEN_FILTER, sort: 'name' }).filtered).toBe(false);
  });
});
