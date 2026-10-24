import { NARUTO_FOE_KIT } from '../../packs/naruto/bestiaryKit';
import { NARUTO_NATURE_KIT, NARUTO_VILLAGES } from '../../packs/naruto/shinobiVillages';
import { ORIGINAL_FOE_KIT } from '../../packs/original/bestiaryKit';
import { ORIGINAL_NATURE_KIT, ORIGINAL_VILLAGES } from '../../packs/original/shinobiVillages';
import { FOREIGN_ARCHETYPE_IDS, FOREIGN_GRADES } from './archetypes';
import { foreignShinobi } from './compose';

const ORIGINAL = { kit: ORIGINAL_FOE_KIT, natures: ORIGINAL_NATURE_KIT };
const foes = foreignShinobi(ORIGINAL_VILLAGES, ORIGINAL);
const byId = (id: string) => foes.find((f) => f.id === id);

/** Two missing-nin (chūnin, jōnin) for every archetype. */
const ROGUES_PER_VILLAGE = FOREIGN_ARCHETYPE_IDS.length * 2;

describe('foreign shinobi from templates', () => {
  it('composes every village, archetype and grade, and a chūnin and jōnin missing-nin of each', () => {
    const perVillage = FOREIGN_ARCHETYPE_IDS.length * (FOREIGN_GRADES.length + 2);
    expect(foes).toHaveLength(ORIGINAL_VILLAGES.length * perVillage);
    expect(new Set(foes.map((f) => f.id)).size).toBe(foes.length);
  });

  it('names a squad shinobi for their village and grade, and sets their danger by it', () => {
    expect(byId('foe-sakyugakure-sensor-genin')).toMatchObject({
      name: 'Dune Genin Sensor',
      kind: 'Dune Genin',
      danger: 'armed',
    });
    expect(byId('foe-sakyugakure-sensor-chunin')?.danger).toBe('deadly');
    expect(byId('foe-sakyugakure-sensor-jonin')?.danger).toBe('elite');
  });

  it('gives each shinobi one of their village’s natures and its techniques for it', () => {
    for (const village of ORIGINAL_VILLAGES) {
      for (const foe of foes.filter((f) => f.id.includes(`-${village.id}-`))) {
        expect(village.natures).toContain(foe.nature);
      }
    }
    const captain = byId('foe-ashfield-captain-jonin');
    const arts = ORIGINAL_NATURE_KIT[captain!.nature!];
    expect(captain?.techniqueIds).toContain(arts.master);
  });

  it('makes a missing-nin a named step past their village’s own, with a trick of their own', () => {
    const rogue = byId('rogue-ashfield-trapper-chunin')!;
    const squad = byId('foe-ashfield-trapper-chunin')!;
    expect(rogue).toMatchObject({ name: 'Rokushō', proper: true, kind: 'Missing-nin' });
    expect(rogue.statBonuses.fuuinjutsu).toBeGreaterThan(squad.statBonuses.fuuinjutsu ?? 0);
    expect(rogue.techniqueIds.length).toBe(squad.techniqueIds.length + 1);
  });

  it('every village in every pack has a different name for each of its missing-nin', () => {
    for (const village of [...ORIGINAL_VILLAGES, ...NARUTO_VILLAGES]) {
      expect(new Set(village.rogueNames).size).toBeGreaterThanOrEqual(ROGUES_PER_VILLAGE);
    }
    const fan = foreignShinobi(NARUTO_VILLAGES, {
      kit: NARUTO_FOE_KIT,
      natures: NARUTO_NATURE_KIT,
    });
    const names = fan.filter((f) => f.proper).map((f) => f.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
