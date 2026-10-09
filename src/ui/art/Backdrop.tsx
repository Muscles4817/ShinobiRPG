import type { ReactNode } from 'react';

import type { BackdropId } from '@/game';

/**
 * Layered silhouettes for each kind of place, drawn over a sky gradient supplied by CSS
 * (see .sky in theme). viewBox 300×210, anchored to the bottom so the skyline always shows.
 */

const lamps = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => (
    <rect key={`${x}-${y}`} className="lamp" x={x} y={y} width="7" height="10" rx="3" />
  ));

const SCENES: Readonly<Record<BackdropId, ReactNode>> = {
  'leaf-village': (
    <>
      <path
        d="M150 210V96c10-10 22-14 40-12 14-8 34-8 48 0 16-4 30 2 40 12 10 2 18 8 22 16V210Z"
        fill="#3c3442"
      />
      <g fill="#2e2834">
        <ellipse cx="176" cy="104" rx="10" ry="13" />
        <ellipse cx="206" cy="98" rx="10" ry="13" />
        <ellipse cx="236" cy="100" rx="10" ry="13" />
        <ellipse cx="266" cy="106" rx="10" ry="13" />
      </g>
      <path d="M0 160c20-22 40-22 56-6 14-20 40-22 56-2 18-14 40-12 54 4V210H0Z" fill="#143021" />
      <path
        d="M0 210V176h18l12-10 12 10h16v-8l-6-4h34l-6 4v8h18l14-12 14 12h12v-10l-8-5h40l-8 5v10h20l12-9 12 9h22v-8l-7-5h36l-7 5v8h20V210Z"
        fill="#0d0b12"
      />
      <g fill="#7a2a1c">
        <rect x="64" y="170" width="20" height="4" />
        <rect x="186" y="172" width="20" height="4" />
      </g>
      {lamps([
        [44, 156],
        [130, 160],
        [232, 158],
      ])}
    </>
  ),
  'lantern-rooftops': (
    <>
      <circle cx="232" cy="58" r="14" fill="#ffe9c2" opacity=".75" />
      <path
        d="M0 150 L45 122 L95 140 L150 112 L205 136 L255 118 L300 140 V210 H0Z"
        fill="#100d1d"
        opacity=".55"
      />
      <path
        d="M0 210V168h16l12-11 12 11h12v-9l-7-5h36l-7 5v9h14l15-15 15 15h9v-14l-9-6h44l-9 6v8h18l12-10 12 10h18v-10l-7-6h38l-7 6v10h22V210Z"
        fill="#0b0912"
      />
      <path d="M0 92 Q75 124 150 96 T300 100" stroke="#5a3a3a" strokeWidth="1.2" fill="none" />
      {lamps([
        [34, 100],
        [78, 110],
        [122, 104],
        [170, 96],
        [214, 98],
        [262, 102],
      ])}
    </>
  ),
  dunes: (
    <>
      <circle cx="226" cy="74" r="30" fill="#ffd98a" opacity=".9" />
      <path d="M0 150 C60 126 112 130 160 142 S262 126 300 134 V210H0Z" fill="#c98648" />
      <g fill="#8a5330">
        <rect x="34" y="138" width="40" height="40" />
        <path d="M34 138a20 20 0 0 1 40 0z" />
        <rect x="84" y="122" width="16" height="56" />
        <path d="M82 122h20l-10-14z" />
        <rect x="108" y="146" width="30" height="32" />
        <path d="M108 146a15 15 0 0 1 30 0z" />
        <rect x="196" y="140" width="46" height="38" />
        <path d="M196 140a23 23 0 0 1 46 0z" />
      </g>
      <path d="M0 176 C70 160 150 188 300 166 V210H0Z" fill="#6b3d22" />
    </>
  ),
  coast: (
    <>
      <path d="M0 140 C50 132 100 148 150 140 S250 132 300 142 V210 H0Z" fill="#1d4a6e" />
      <path d="M0 162 C60 154 120 170 180 160 S260 154 300 164 V210 H0Z" fill="#163a58" />
      <g fill="#2a1f1a">
        <rect x="190" y="112" width="60" height="30" />
        <path d="M184 112h72l-12-14h-48z" />
      </g>
      <rect x="214" y="126" width="12" height="16" fill="#ffb45e" />
      <path d="M40 140 l18 -40 l4 40z" fill="#e9e0cc" opacity=".8" />
    </>
  ),
  mist: (
    <>
      <g fill="#3a4a5a">
        <rect x="40" y="110" width="40" height="70" />
        <path d="M36 110a24 18 0 0 1 48 0z" />
        <rect x="170" y="98" width="50" height="82" />
        <path d="M164 98a31 22 0 0 1 62 0z" />
      </g>
      <path d="M0 170 C60 160 140 178 300 164 V210 H0Z" fill="#22303c" />
      <g fill="#c9d6e0">
        <rect x="0" y="130" width="300" height="16" opacity=".18" />
        <rect x="0" y="152" width="300" height="20" opacity=".22" />
      </g>
    </>
  ),
  mountain: (
    <>
      <path d="M0 180 L80 70 L130 130 L180 60 L300 180 V210 H0Z" fill="#2a3346" />
      <path d="M160 86 L180 60 L196 82 L186 80 L178 90 L170 82Z" fill="#e9eef6" opacity=".8" />
      <g stroke="#c0392b" strokeWidth="4">
        <path d="M120 150h40M126 150v28M154 150v28" />
      </g>
      <circle cx="60" cy="58" r="10" fill="#8de6da" opacity=".5" />
    </>
  ),
};

export function Backdrop({ id }: { readonly id: BackdropId }) {
  return (
    <svg
      className="backdrop"
      viewBox="0 0 300 210"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {SCENES[id]}
    </svg>
  );
}
