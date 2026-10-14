import type { ArcDef, MissionDef } from '@/systems/missions';

import { LIGHT_GIVEN_BACK, WHAT_UMI_SAW, WRECK_LANTERN } from './saltLanternsEnd';
import { DOWN_TO_THE_COAST, HARBOUR_LETTER } from './saltLanternsStart';

/**
 * Salt in the Lanterns: the first long story lived somewhere else. Port Shiomachi's shrine
 * lanterns go out every night; on the road down you see lights under the water; in the port
 * you raise a drowned ship's lantern from the wreck and hear from Umi who puts the lights out;
 * and what you do with the light decides how the drowned crew rest. Its middle acts are based
 * in the port: the jobs are posted at the harbour office, and going there is orders.
 */

export const SALT_LANTERNS_JOBS: readonly MissionDef[] = [
  HARBOUR_LETTER,
  DOWN_TO_THE_COAST,
  WRECK_LANTERN,
  WHAT_UMI_SAW,
  LIGHT_GIVEN_BACK,
];

/** The jobs posted at the harbour office: the acts based in the port. */
export const SALT_LANTERNS_PORT_JOBS = [WRECK_LANTERN.id, WHAT_UMI_SAW.id, LIGHT_GIVEN_BACK.id];
/** The jobs posted at the village hall. */
export const SALT_LANTERNS_VILLAGE_JOBS = [HARBOUR_LETTER.id, DOWN_TO_THE_COAST.id];

export const SALT_LANTERNS: ArcDef = {
  id: 'salt-in-the-lanterns',
  title: 'Salt in the Lanterns',
  summary: 'Port Shiomachi’s harbour lanterns go out every night, full of seawater.',
  acts: [
    {
      beats: ['you', 'need'],
      title: 'The letter',
      text: 'The harbourmaster of Port Shiomachi has written to the village. Every night the shrine lanterns go out.',
      jobs: [HARBOUR_LETTER.id],
    },
    {
      beats: ['go'],
      title: 'The coast road',
      text: 'The port is waiting. Take the coast road down and see the harbour for yourself.',
      jobs: [DOWN_TO_THE_COAST.id],
    },
    {
      beats: ['search', 'find'],
      title: 'Lights under the water',
      text: 'Something burns in the old wreck off the point, and Umi says she has seen who puts the lanterns out.',
      jobs: [WRECK_LANTERN.id, WHAT_UMI_SAW.id],
      baseLocationId: 'port-shiomachi',
    },
    {
      beats: ['take', 'return', 'change'],
      title: 'The light given back',
      text: 'The drowned crew want their light. Give it to them, one way or another, and go home.',
      jobs: [LIGHT_GIVEN_BACK.id],
      baseLocationId: 'port-shiomachi',
    },
  ],
};
