import type { HomeCard } from '@/game';

type HomeRoom = HomeCard['rooms'][number];

interface HomePlanProps {
  readonly rooms: readonly HomeRoom[];
  /** A hearth: the main room is split for a living room. */
  readonly hearth: boolean;
}

const ROOM_FILL: Readonly<Record<HomeRoom, string>> = {
  garden: '#dfe8d0',
  yard: '#e8dcc2',
  guest: '#efe3c8',
};

/** A home drawn as a plan, in ink on paper: the main room, then each room it opens. */
export function HomePlan({ rooms, hearth }: HomePlanProps) {
  const extra = rooms.length;
  const mainW = extra ? 56 : 80;
  return (
    <svg className="home-plan" viewBox="0 0 96 72" aria-hidden="true">
      <rect
        x="8"
        y="8"
        width={mainW}
        height="56"
        fill="#efe3c8"
        stroke="#2a2118"
        strokeWidth="1.5"
      />
      {hearth && <path d={`M8 36h${mainW}`} stroke="#2a2118" strokeWidth="1.2" />}
      {rooms.map((room, i) => {
        const h = 56 / extra;
        return (
          <rect
            key={room}
            x={8 + mainW}
            y={8 + i * h}
            width={80 - mainW}
            height={h}
            fill={ROOM_FILL[room]}
            stroke="#2a2118"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}
