import type { EnemyDef } from '../../types';
import { bestiary } from '../../shared/bestiary';
import { foreignShinobi } from '../../shared/foreignShinobi';
import { DROWNED_SHORE_FOE } from './arcs/drownedShore';
import { LOADED_DICE_FOE } from './arcs/loadedDice';
import { SNAKE_DEN_FOE } from './arcs/snakeDen';
import { SWORD_SCHOOL_FOE } from './arcs/swordSchool';
import { TEMPLE_BELL_FOE } from './arcs/templeBell';
import { NARUTO_FOE_KIT } from './bestiaryKit';
import { CANON_FOES } from './canonFoes';
import { CHUNIN_ENEMIES } from './chuninMissions';
import { ENEMIES } from './enemies';
import { EXAM_ENEMIES } from './exam';
import { KIRI_FOES } from './kirigakure';
import { NARUTO_NATURE_KIT, NARUTO_VILLAGES } from './shinobiVillages';
import { DESERT_FOES } from './sunagakure';

/**
 * Every foe of the fan pack: its own, the canon's, the shared bestiary's and the shinobi of
 * the other great villages, composed from its kits. Called inside the pack's pure builder, so a
 * release build drops all of it with the pack.
 */
/*#__NO_SIDE_EFFECTS__*/
export function narutoFoes(): EnemyDef[] {
  return [
    ...ENEMIES,
    ...CANON_FOES,
    ...bestiary(NARUTO_FOE_KIT),
    ...foreignShinobi(NARUTO_VILLAGES, { kit: NARUTO_FOE_KIT, natures: NARUTO_NATURE_KIT }),
    ...CHUNIN_ENEMIES,
    ...EXAM_ENEMIES,
    TEMPLE_BELL_FOE,
    DROWNED_SHORE_FOE,
    ...KIRI_FOES,
    ...DESERT_FOES,
    LOADED_DICE_FOE,
    SWORD_SCHOOL_FOE,
    SNAKE_DEN_FOE,
  ];
}
