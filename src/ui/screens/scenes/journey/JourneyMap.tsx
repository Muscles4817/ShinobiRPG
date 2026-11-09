import { useRef, type CSSProperties, type ReactNode } from 'react';

import type { JourneyView, MapFrame, MapPoint, TimeSlot } from '@/game';

import { MapCountry } from '../../../components/MapCountry';
import { alongCurve, curvePath } from '../../../components/mapCurve';
import { fitFrame } from './fitFrame';
import { usePaneAspect } from './usePaneAspect';
import type { SealTravel } from './useSealTravel';

interface JourneyMapProps {
  readonly view: JourneyView;
  /** The date and hour, as the header gives them. */
  readonly date: string;
  readonly slot: TimeSlot;
  /** The seal walking the road (`useSealTravel`), shared with the story it holds back. */
  readonly travel: SealTravel;
  /** Laid over the whole map (the title card of the place reached). */
  readonly children?: ReactNode;
}

/** Shares closer than this count as the same place on the road. */
const SAME_PLACE = 1e-6;

/** How many legs the seal has passed where it stands now (the walk may be under way). */
export function legsPassed(view: JourneyView, shown: number): number {
  return view.legs.filter((l) => l.end <= shown + SAME_PLACE).length;
}

/** Where a map point sits in the frame, as a share of the pane. */
function placed(p: MapPoint, frame: MapFrame): CSSProperties {
  return {
    left: `${((p.x - frame.x) / frame.width) * 100}%`,
    top: `${((p.y - frame.y) / frame.height) * 100}%`,
  };
}

/**
 * The leg to name over the map: the one the seal is walking while it moves, the one just walked
 * while its road event waits, and otherwise the one ahead.
 */
function captionOf(view: JourneyView, shown: number, moving: boolean): string | null {
  const walking = view.legs.find((l) => shown >= l.start && shown < l.end);
  if (moving && walking) return walking.caption;
  if (view.waiting === 'road-event') return view.legs[view.walked - 1]?.caption ?? null;
  return view.waiting === 'road' ? (view.legs[view.walked]?.caption ?? null) : null;
}

/**
 * The journey on the map (`docs/design/journeys-plan.md` 3.1): the country framed on the road,
 * the road ahead faint and the road walked inked in red, the seal walking it when a leg is done,
 * the places on the way, the hour laid over it as a wash, the camp fire at night, the region's
 * name as a caption and the date on a stamp. A tap skips the walk.
 */
export function JourneyMap({ view, date, slot, travel, children }: JourneyMapProps) {
  const pane = useRef<HTMLElement>(null);
  const aspect = usePaneAspect(pane, view.frame.width / view.frame.height);
  const frame = fitFrame(view.frame, aspect, view.map);
  const walked = alongCurve(view.path, travel.shown);
  const caption = captionOf(view, travel.shown, travel.moving);
  const stops = new Map(view.stops.map((s) => [s.id, s.kind]));
  const zoom = { '--map-zoom': frame.width / view.map.width } as CSSProperties;
  return (
    <section
      ref={pane}
      className="journey-map map-paper"
      data-style={view.map.style}
      data-slot={slot}
      data-waiting={view.waiting}
      aria-label="The road"
      style={zoom}
    >
      <svg viewBox={`${frame.x} ${frame.y} ${frame.width} ${frame.height}`} aria-hidden="true">
        <MapCountry map={view.map} />
        {view.map.roads.map((r) => (
          <path key={r.id} d={curvePath(r.path, false)} className="map-road" />
        ))}
        <path d={curvePath(view.path, false)} className="journey-ahead" />
        <path d={walked.path} className="journey-walked" />
      </svg>
      {view.map.places.map((p) => (
        <div
          key={p.id}
          data-kind={p.kind}
          className={`map-place label-${p.label}${p.visited ? '' : ' unvisited'}${stops.has(p.id) ? ` journey-${stops.get(p.id) ?? ''}` : ''}`}
          style={placed(p, frame)}
        >
          <span className="map-seal" aria-hidden="true" />
          <span className="map-name">{p.name}</span>
        </div>
      ))}
      <div className="journey-wash" aria-hidden="true" />
      <div className="journey-you" style={placed(walked.point, frame)} aria-hidden="true">
        {view.waiting === 'camp' && !travel.moving && <span className="journey-fire" />}
        <span className="journey-seal">旅</span>
      </div>
      {caption && (
        <p key={caption} className="journey-caption">
          {caption}
        </p>
      )}
      {travel.moving && (
        <button
          type="button"
          className="journey-skip"
          aria-label="Skip to where you are"
          onClick={travel.skip}
        />
      )}
      <p className="journey-stamp">
        <strong>
          {date}, {slot}
        </strong>
        <span>{view.progress[legsPassed(view, travel.shown)]}</span>
      </p>
      {children}
    </section>
  );
}
