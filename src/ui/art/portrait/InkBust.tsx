import type { Look } from '@/game';

import { Brush } from './Brush';
import { splinePath } from './brush';
import { Clothes, Headband } from './Dress';
import { Brow, Eye } from './Eyes';
import { AgeLines, Beard, SkinMark } from './Extras';
import { Ear, Mouth, Nose } from './Features';
import { HairBack, HairCap, HairFront } from './Hair';
import { CENTRE_X, CHIN_AT, CONTOURS, CROWN, FRAMES, MOUTH_DROP } from './head';
import { PAPER, PAPER_LIT, SHADE, shaded } from './ink';
import { NameTag } from './NameTag';

/**
 * A bust in ink on paper: a head turned three-quarters, brushed in lines that swell and thin,
 * with flat shadow where the brow, nose and jaw throw it, hair in layers, clothes that say the
 * person's rank and a wooden tag with a character of their name. Put together from a `Look`,
 * so everyone, authored or generated, has one.
 */

export const BUST_BOX = { width: 400, height: 480 } as const;

/** Eyes are larger on a young face. */
const EYE_SCALE = { young: 1.2, grown: 1.04, old: 0.98 } as const;
/** The far eye is narrowed by the turn of the head. */
const FAR_EYE = 0.72;
const NEAR_EYE = 0.94;
/** Clothes sit this far up under the chin. */
const COLLAR_RISE = 14;

/** Where the face is in shadow: the near side, under the hairline, beside the nose. */
const FACE_SHADOWS = [
  'M226 120C262 150 278 200 268 256C256 292 228 310 194 322C226 290 240 250 236 204C234 172 232 146 226 120Z',
  'M100 100H310V172C270 152 180 150 112 184Z',
  'M168 222C160 240 152 256 156 268C164 274 174 274 182 270C174 256 172 240 174 224Z',
];

interface NeckProps {
  readonly widen: number;
  readonly skin: string;
}

function Neck({ widen: n, skin }: NeckProps) {
  return (
    <g>
      <path
        d={`M${184 - n} 312L${186 - n} 352C204 368 240 366 ${260 + n} 344L${252 + n} 266Z`}
        fill={skin}
      />
      <path
        d={`M${184 - n} 316C206 328 236 312 ${253 + n} 276L${260 + n} 344C240 364 204 366 ${186 - n} 352Z`}
        fill={SHADE}
        opacity=".3"
      />
      <Brush
        pts={[
          [252 + n, 284],
          [254 + n, 314],
          [259 + n, 344],
        ]}
        w={3.4}
        land={0.2}
        lift={0.4}
      />
      <Brush
        pts={[
          [184 - n, 320],
          [185 - n, 338],
          [187 - n, 352],
        ]}
        w={2.6}
        land={0.2}
        lift={0.5}
      />
    </g>
  );
}

function Defs({ uid, face }: { readonly uid: string; readonly face: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-cloth`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity=".16" />
        <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity=".25" />
      </linearGradient>
      <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity=".2" />
        <stop offset="1" stopColor="#000" stopOpacity=".16" />
      </linearGradient>
      <radialGradient id={`${uid}-ground`} cx=".45" cy=".4" r=".75">
        <stop offset="0" stopColor={PAPER_LIT} />
        <stop offset="1" stopColor={PAPER} />
      </radialGradient>
      <radialGradient id={`${uid}-blush`}>
        <stop offset="0" stopColor="#d9705a" stopOpacity=".3" />
        <stop offset="1" stopColor="#d9705a" stopOpacity="0" />
      </radialGradient>
      <clipPath id={`${uid}-face`}>
        <path d={face} />
      </clipPath>
    </defs>
  );
}

interface InkBustProps {
  readonly uid: string;
  readonly look: Look;
  readonly size: number;
}

export function InkBust({ uid, look, size }: InkBustProps) {
  const { face, bearing } = look;
  const contour = CONTOURS[face.shape];
  const outline = `M${splinePath(contour)}${CROWN}`;
  const frame = FRAMES[face.figure];
  const eyes = EYE_SCALE[face.age];
  const eye = {
    shape: face.eyes,
    expression: face.expression,
    iris: look.eyeColour,
    lashes: bearing?.lashes === true,
  };
  const brow = {
    shape: face.brows,
    expression: face.expression,
    colour: shaded(look.hairColour, 0.35),
  };
  const hair = { style: look.hairStyle, colour: look.hairColour };
  const happy = face.expression === 'smile' || face.expression === 'grin';
  const span = `translate(${CENTRE_X} ${-COLLAR_RISE}) scale(${frame.span} 1) translate(${-CENTRE_X} 0)`;
  return (
    <svg
      className="portrait"
      viewBox={`0 0 ${BUST_BOX.width} ${BUST_BOX.height}`}
      width={size}
      height={(size * BUST_BOX.height) / BUST_BOX.width}
      aria-hidden="true"
    >
      <Defs uid={uid} face={outline} />
      <rect width={BUST_BOX.width} height={BUST_BOX.height} fill={`url(#${uid}-ground)`} />
      <HairBack {...hair} />
      <g transform={span}>
        <Clothes
          uid={uid}
          dress={bearing?.dress ?? 'jacket'}
          cloth={look.outfitColour}
          headband={look.headband}
        />
      </g>
      <Neck widen={frame.neck} skin={look.skinTone} />
      <Ear shape={face.ears} skin={look.skinTone} earring={face.mark === 'earrings'} />
      <path d={outline} fill={look.skinTone} />
      <g clipPath={`url(#${uid}-face)`}>
        {FACE_SHADOWS.map((d) => (
          <path key={d} d={d} fill={SHADE} opacity=".15" />
        ))}
        {happy && <ellipse cx="226" cy="258" rx="24" ry="13" fill={`url(#${uid}-blush)`} />}
        <Beard kind={face.facialHair} colour={look.hairColour} />
        <SkinMark mark={face.mark} />
      </g>
      {/* The far side lightly, then the chin and near jaw with the brush pressed down. */}
      <Brush pts={contour.slice(0, CHIN_AT + 1)} w={3.2} land={0.25} lift={0.15} />
      <Brush pts={contour.slice(CHIN_AT)} w={4.6} land={0.1} />
      <AgeLines age={face.age} />
      <Brow at={[214, 192]} dir={1} scale={NEAR_EYE} {...brow} />
      <Brow at={[150, 194]} dir={-1} scale={0.7} {...brow} />
      <Eye uid={uid} at={[215, 222]} dir={1} scale={eyes * NEAR_EYE} look={eye} />
      <Eye uid={uid} at={[149, 223]} dir={-1} scale={eyes * FAR_EYE} look={eye} />
      <Nose shape={face.nose} />
      <Mouth expression={face.expression} drop={MOUTH_DROP[face.shape]} />
      <HairCap {...hair} />
      {look.headband === 'forehead' && <Headband />}
      <HairFront {...hair} />
      {bearing?.seal && <NameTag uid={uid} seal={bearing.seal} art={bearing.art} />}
    </svg>
  );
}
