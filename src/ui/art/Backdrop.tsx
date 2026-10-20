import type { ComponentType } from 'react';
import { useId } from 'react';

import type { BackdropId } from '@/game';

import { Coast } from './scenery/coast';
import { Dunes } from './scenery/dunes';
import { LeafVillage } from './scenery/leafVillage';
import { SharedDefs, paint } from './scenery/lights';
import { Mist } from './scenery/mist';
import { MistVillage } from './scenery/mistVillage';
import { Mountain } from './scenery/mountain';
import { LanternRooftops } from './scenery/rooftops';

/**
 * A painted scene for each kind of place, drawn in layers (sky lights, far hills, the town,
 * the street, the foreground) over a sky gradient supplied by CSS (see .sky in theme). The
 * layers take their inks from the sky's time slot (styles/scenery.css), under a scrim that
 * keeps overlaid text readable. viewBox 400×240, anchored to the bottom so short banners keep
 * the street in view.
 */

interface SceneProps {
  readonly uid: string;
}

const SCENES: Readonly<Record<BackdropId, ComponentType<SceneProps>>> = {
  'leaf-village': LeafVillage,
  'lantern-rooftops': LanternRooftops,
  dunes: Dunes,
  coast: Coast,
  mist: Mist,
  'mist-village': MistVillage,
  mountain: Mountain,
};

export function Backdrop({ id }: { readonly id: BackdropId }) {
  // Gradient ids must be unique on the page, and a page may draw the same scene many times.
  const uid = `bd${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const Scene = SCENES[id];
  return (
    <svg
      className="backdrop"
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <SharedDefs uid={uid} />
      </defs>
      <Scene uid={uid} />
      {/* Text and meters sit over the top and bottom of every backdrop: shade them. */}
      <rect width="400" height="240" fill={paint(uid, 'scrim')} />
    </svg>
  );
}
