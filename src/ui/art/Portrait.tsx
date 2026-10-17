import { memo, useId } from 'react';

import type { Look } from '@/game';

import { Body, Headband } from './portrait/body';
import { EYE_MOODS, Eye } from './portrait/eyes';
import { AgeLines, Beard, SkinMark } from './portrait/extras';
import { Ears, Mouth, Nose } from './portrait/features';
import { CX, facePath, layoutOf, r1 } from './portrait/geometry';
import { HAIR, hairFit } from './portrait/hair';
import { INK, RIM, lit, shaded } from './portrait/ink';

/**
 * A bust portrait drawn from a Look, in the manner of a woodblock print: flat colour held by an
 * ink outline, with a cel shadow on the far side and lantern light along its edge. The face is
 * put together from parts (shape, figure, eyes, brows, nose, ears, expression, age, facial hair,
 * a mark), so no two people need share one. Used for the player and everyone they meet.
 */

/** A bust shows the shoulders; a face is cropped square to the head, for avatars. */
const FRAMES = {
  bust: { viewBox: '14 13 92 110', aspect: 110 / 92 },
  face: { viewBox: '27 28 66 66', aspect: 1 },
} as const;

/** How far apart the eyes sit from the centre line. */
const EYE_SPACING = 9;

interface PortraitProps {
  readonly appearance: Look;
  readonly size?: number;
  readonly framing?: keyof typeof FRAMES;
}

function PortraitDrawing({ appearance: a, size = 80, framing = 'bust' }: PortraitProps) {
  const uid = `pt${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { face } = a;
  const frame = FRAMES[framing];
  const g = layoutOf(face.shape);
  const outline = facePath(g);
  const shade = shaded(a.skinTone);
  const brow = shaded(a.hairColour, 0.25);
  const hair = HAIR[a.hairStyle];
  const fit = hairFit(g.cw);
  const eye = {
    uid,
    shape: face.eyes,
    brows: face.brows,
    mood: EYE_MOODS[face.expression],
    colours: { iris: a.eyeColour, skin: a.skinTone, brow },
  };
  return (
    <svg
      className="portrait"
      viewBox={frame.viewBox}
      width={size}
      height={size * frame.aspect}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${uid}-iris`} cx=".5" cy=".75" r=".75">
          <stop offset="0" stopColor={lit(a.eyeColour, 0.45)} />
          <stop offset="1" stopColor={a.eyeColour} />
        </radialGradient>
        <clipPath id={`${uid}-face`}>
          <path d={outline} />
        </clipPath>
        <clipPath id={`${uid}-far`}>
          <rect x="64" width="60" height="150" />
        </clipPath>
      </defs>
      <g transform={fit}>
        {hair.crown?.(a.hairColour)}
        {hair.back && (
          <>
            <path
              d={hair.back}
              fill={a.hairColour}
              stroke={INK}
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path d={hair.back} fill="#000" opacity=".3" clipPath={`url(#${uid}-far)`} />
          </>
        )}
      </g>
      <Body
        uid={uid}
        figure={face.figure}
        layout={g}
        colours={{ skin: a.skinTone, shade, outfit: a.outfitColour }}
        headband={a.headband}
        shoulders={framing === 'bust'}
      />
      <Ears
        shape={face.ears}
        layout={g}
        skin={a.skinTone}
        shade={shade}
        earrings={face.mark === 'earrings'}
      />
      <path d={outline} fill={a.skinTone} stroke={INK} strokeWidth="1.1" strokeLinejoin="round" />
      <g clipPath={`url(#${uid}-face)`}>
        <path
          d={`M${r1(CX + g.cw * 0.62)} 26Q${r1(CX + g.cw * 1.02)} 58 ${r1(CX + g.cw * 0.12)} ${g.chinY + 4}H100V26Z`}
          fill={shade}
          opacity=".45"
        />
        <path d={hair.front} transform={`${fit} translate(1.4 3.4)`} fill={shade} opacity=".7" />
        <SkinMark mark={face.mark} layout={g} shade={shade} />
      </g>
      <path
        d={`M${r1(CX + g.cw * 0.97)} 50C${CX + g.cw} 54 ${CX + g.cw} 57 ${CX + g.cw} 60C${CX + g.cw} 68 ${CX + g.jw + 2} ${g.jawY - 6} ${CX + g.jw} ${g.jawY}`}
        stroke={RIM}
        strokeOpacity=".7"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      {(face.expression === 'smile' || face.expression === 'grin') && (
        <g fill="#ff8a8a" opacity=".3">
          <ellipse cx={CX - 12} cy={r1(g.eyeY + 10)} rx="4" ry="1.8" />
          <ellipse cx={CX + 12} cy={r1(g.eyeY + 10)} rx="4" ry="1.8" />
        </g>
      )}
      <AgeLines age={face.age} layout={g} shade={shade} />
      <g transform={`translate(${CX - EYE_SPACING} ${g.eyeY})`}>
        <Eye {...eye} side="l" />
      </g>
      <g transform={`translate(${CX + EYE_SPACING} ${g.eyeY}) scale(-1 1)`}>
        <Eye {...eye} side="r" />
      </g>
      <Nose shape={face.nose} layout={g} shade={shade} />
      <Beard kind={face.facialHair} layout={g} colour={a.hairColour} />
      <Mouth expression={face.expression} layout={g} shade={shade} />
      <path
        d={hair.front}
        transform={fit}
        fill={a.hairColour}
        stroke={INK}
        strokeWidth="1.1"
        strokeLinejoin="round"
        opacity={hair.faint ? 0.55 : 1}
      />
      {a.headband === 'forehead' && <Headband layout={g} />}
    </svg>
  );
}

/** A look is rebuilt by every view, so compare what it says, not which object it is. */
function sameDrawing(a: PortraitProps, b: PortraitProps): boolean {
  return (
    a.size === b.size &&
    a.framing === b.framing &&
    JSON.stringify(a.appearance) === JSON.stringify(b.appearance)
  );
}

export const Portrait = memo(PortraitDrawing, sameDrawing);
