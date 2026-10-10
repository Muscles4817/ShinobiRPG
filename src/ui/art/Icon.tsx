import type { ReactNode } from 'react';

import type { IconId } from '@/game';

/** 32×32 line drawings, stroked in currentColor so they take the surrounding colour. */
const PATHS: Readonly<Record<IconId, ReactNode>> = {
  post: <path d="M11 29V9M21 29V9M7 9h18l-2-4H9zM7 15h18M7 21h18" />,
  bowl: (
    <>
      <path d="M4 16h24a12 9 0 0 1-24 0z" />
      <path d="M11 27h10M20 3l-5 10M25 4l-6 9M9 11c-1-2 1-3 0-5" />
    </>
  ),
  board: (
    <>
      <rect x="4" y="5" width="24" height="18" rx="2" />
      <path d="M9 10h7M9 14h11M9 18h5M8 23l-2 6M24 23l2 6" />
    </>
  ),
  scroll: <path d="M9 6h14v20H9zM6 6h6M20 6h6M6 26h6M20 26h6M13 11h6M13 15h6M13 19h4" />,
  house: <path d="M3 15L16 5l13 10M7 13v14h18V13M13 27v-7h6v7" />,
  heal: <path d="M13 5h6v8h8v6h-8v8h-6v-8H5v-6h8z" />,
  torii: <path d="M3 8c9 2.5 17 2.5 26 0M6 13h20M10 9v20M22 9v20" />,
  lantern: (
    <>
      <rect x="9" y="6" width="14" height="19" rx="6" />
      <path d="M16 2v4M9 12h14M9 19h14M13 25v4h6v-4" />
    </>
  ),
  fish: (
    <>
      <path d="M3 16c6-7 15-7 20 0-5 7-14 7-20 0zM23 16l6-5v10z" />
      <circle cx="9" cy="15" r="1" />
    </>
  ),
  rice: <path d="M16 4l12 22H4zM10 26v-7h12v7" />,
  pill: (
    <>
      <rect x="5" y="11" width="22" height="10" rx="5" />
      <path d="M16 11v10" />
    </>
  ),
  tea: (
    <path d="M6 12h17v6a8.5 8.5 0 0 1-17 0zM23 14h3a3 3 0 0 1 0 6h-3M11 8c-1-2 1-3 0-5M16 8c-1-2 1-3 0-5" />
  ),
  wind: <path d="M3 12h17a4 4 0 1 0-4-4M3 18h21a4 4 0 1 1-4 4M3 24h9" />,
  cart: (
    <>
      <circle cx="10" cy="25" r="3" />
      <circle cx="23" cy="25" r="3" />
      <path d="M3 19h26l-3-9H6zM16 10V4" />
    </>
  ),
  fist: (
    <path d="M8 14V10a2 2 0 0 1 4 0v3M12 12V8a2 2 0 0 1 4 0v4M16 12V9a2 2 0 0 1 4 0v4M20 13v-1a2 2 0 0 1 4 0v6a9 9 0 0 1-9 9h-1a7 7 0 0 1-7-7v-4a2 2 0 0 1 4 0" />
  ),
  wave: <path d="M3 12c4-4 7-4 10 0s6 4 10 0 5-3 6-2M3 20c4-4 7-4 10 0s6 4 10 0 5-3 6-2" />,
  eye: (
    <>
      <path d="M3 16c4-7 9-10 13-10s9 3 13 10c-4 7-9 10-13 10S7 23 3 16z" />
      <circle cx="16" cy="16" r="4" />
    </>
  ),
  leaf: <path d="M6 26C6 12 14 6 27 5c0 13-6 21-21 21zM6 26L18 14" />,
  tree: <path d="M16 29V17M16 3l9 11h-5l6 8H6l6-8H7z" />,
  dango: (
    <>
      <path d="M8 28L26 4" />
      <circle cx="21" cy="10" r="4" />
      <circle cx="16" cy="16" r="4" />
      <circle cx="11" cy="22" r="4" />
    </>
  ),
  sword: <path d="M24 3l5 5-17 17-5-5zM7 20l5 5M4 28l5-5M9 18l5 5" />,
  seal: (
    <>
      <rect x="7" y="4" width="18" height="24" rx="2" />
      <path d="M12 10h8M16 10v12M12 16h8M12 22h8" />
    </>
  ),
  grill: (
    <path d="M5 13h22a11 9 0 0 1-22 0zM9 26l-2 4M23 26l2 4M10 9c-1-2 1-3 0-5M16 9c-1-2 1-3 0-5M22 9c-1-2 1-3 0-5" />
  ),
  anvil: <path d="M4 10h20c0 4 2 6 5 6v3H18l2 7H9l2-7H4zM9 26h11M14 6l2-3M19 7l3-2" />,
  vest: <path d="M11 4l5 4 5-4 6 4-2 6v14H7V14L5 8zM16 8v20M11 18h3M18 18h3" />,
  charm: (
    <>
      <circle cx="16" cy="19" r="8" />
      <path d="M16 3v8M13 7h6M16 15v8M12 19h8" />
    </>
  ),
  pot: (
    <path d="M5 13h22v7a8 7 0 0 1-8 7h-6a8 7 0 0 1-8-7zM3 13h26M10 9c-1-2 1-3 0-5M16 9c-1-2 1-3 0-5M22 9c-1-2 1-3 0-5" />
  ),
  veg: (
    <path d="M16 28c-6-3-9-9-7-15 3 0 6 2 7 5 1-3 4-5 7-5 2 6-1 12-7 15zM16 13V4M12 6l4 3 4-3" />
  ),
  sake: <path d="M11 4h4v5c3 2 4 5 4 9v10H7V18c0-4 1-7 4-9zM7 18h12M22 20h6l-1 8h-4z" />,
};

interface IconProps {
  readonly id: IconId;
  readonly size?: number;
}

export function Icon({ id, size = 22 }: IconProps) {
  return (
    <svg
      className="icon"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  );
}
