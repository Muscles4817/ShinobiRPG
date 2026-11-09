import type { ComponentType } from 'react';
import { useId } from 'react';

import type { BackdropId } from '@/game';

import { BargeLanding } from './scenery/bargeLanding';
import { BroadleafForest } from './scenery/broadleafForest';
import { RiverPlain } from './scenery/riverPlain';
import { SandArch } from './scenery/sandArch';
import { MountainStair } from './scenery/mountainStair';
import { GorgeBridge } from './scenery/gorgeBridge';
import { TwinStatues } from './scenery/twinStatues';
import { Battlefield } from './scenery/battlefield';
import { BridgeCoast } from './scenery/bridgeCoast';
import { CastleTown } from './scenery/castleTown';
import { CedarForest } from './scenery/cedarForest';
import { Coast } from './scenery/coast';
import { Dunes } from './scenery/dunes';
import { HighwayTown } from './scenery/highwayTown';
import { LeafVillage } from './scenery/leafVillage';
import { SharedDefs, paint } from './scenery/lights';
import { Mist } from './scenery/mist';
import { MistVillage } from './scenery/mistVillage';
import { Mountain } from './scenery/mountain';
import { PleasureQuarter } from './scenery/pleasureQuarter';
import { PostTown } from './scenery/postTown';
import { LanternRooftops } from './scenery/rooftops';
import { SaltFlats } from './scenery/saltFlats';
import { SandVillage } from './scenery/sandVillage';
import { TideShrine } from './scenery/tideShrine';
import { ToadMountain } from './scenery/toadMountain';
import { TempleHill } from './scenery/templeHill';
import { WaterfallPool } from './scenery/waterfall';

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
  'sand-village': SandVillage,
  'barge-landing': BargeLanding,
  'cedar-forest': CedarForest,
  'post-town': PostTown,
  waterfall: WaterfallPool,
  'tide-shrine': TideShrine,
  'salt-flats': SaltFlats,
  battlefield: Battlefield,
  'castle-town': CastleTown,
  'highway-town': HighwayTown,
  'pleasure-quarter': PleasureQuarter,
  'bridge-coast': BridgeCoast,
  'temple-hill': TempleHill,
  'toad-mountain': ToadMountain,
  'broadleaf-forest': BroadleafForest,
  'river-plain': RiverPlain,
  'sand-arch': SandArch,
  'mountain-stair': MountainStair,
  'gorge-bridge': GorgeBridge,
  'twin-statues': TwinStatues,
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
