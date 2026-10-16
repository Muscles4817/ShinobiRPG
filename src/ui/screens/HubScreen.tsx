import { examFinalsView, headerView, hubView, senseiWeekView, villageView } from '@/game';

import { Backdrop } from '../art/Backdrop';
import { Icon } from '../art/Icon';
import { Chips } from '../components/Chips';
import { Avatar, Faces } from '../components/Faces';
import { DayStrip, HungerNote, Vitals } from '../components/Vitals';
import type { ScreenProps } from './types';
import { ExamFinals } from './ExamFinals';
import { SenseiSlip } from './SenseiSlip';
import { VillageLife } from './VillageLife';

interface HubScreenProps extends ScreenProps {
  readonly onOpenPlace: (placeId: string) => void;
  readonly onOpenPerson: (personId: string) => void;
  readonly onOpenRecord: () => void;
}

/** "Here": the village you're in, its sky and backdrop, and the places you can go. */
export function HubScreen({
  ctx,
  state,
  perform,
  onOpenPlace,
  onOpenPerson,
  onOpenRecord,
}: HubScreenProps) {
  const header = headerView(state, ctx);
  const hub = hubView(state, ctx);
  const village = villageView(state, ctx);
  const week = senseiWeekView(state, ctx);
  const finals = examFinalsView(state, ctx);
  const around = hub.places.flatMap((p) => p.people);
  return (
    <>
      <header className="hub-hero sky" data-slot={header.slot} data-land={header.backdrop}>
        <Backdrop id={header.backdrop} />
        <div className="hub-top">
          <div className="hub-row">
            <b>{header.name}</b>
            <span>
              {header.rank}
              {header.visiting ? ' (visiting)' : ''}
            </span>
            <span className="ryo num">{header.ryo} ryo</span>
          </div>
          <div className="hub-row">
            <span className="when">
              {header.slot}, {header.date}
            </span>
            <DayStrip slotIndex={header.slotIndex} />
            {header.warnings.map((w) => (
              <span key={w} className="warn-chip">
                {w}
              </span>
            ))}
          </div>
          <h1 className="hub-place">{header.location}</h1>
          <p className="hub-epithet">{header.epithet}</p>
        </div>
        <Vitals meters={header.meters} />
      </header>
      <HungerNote note={header.hunger} />
      {around.length > 0 && (
        <section className="around" aria-label="Who’s here">
          <span className="label">Who’s here</span>
          <div className="around-row">
            {around.map((f) => (
              <button
                key={f.id}
                type="button"
                className="around-face"
                onClick={() => {
                  onOpenPerson(f.id);
                }}
              >
                <Avatar face={f} size={40} />
                <small>{f.name}</small>
              </button>
            ))}
          </div>
        </section>
      )}
      {week && <SenseiSlip view={week} perform={perform} />}
      {finals && <ExamFinals view={finals} perform={perform} />}
      <VillageLife view={village} perform={perform} />
      <main className="street" aria-label="Places">
        {hub.places.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`stop${p.suggested ? ' suggested' : ''}${p.closed ? ' closed' : ''}`}
            disabled={p.closed !== null}
            onClick={() => {
              onOpenPlace(p.id);
            }}
          >
            <span className="lantern" aria-hidden="true">
              <Icon id={p.icon} />
            </span>
            <span className="stop-text">
              <b>
                {p.name}
                {p.badge && <span className="place-badge">{p.badge}</span>}
              </b>
              <small>{p.closed ?? p.line}</small>
            </span>
            <Faces faces={p.people} />
          </button>
        ))}
      </main>
      {hub.latest && (
        <button type="button" className="ticker" onClick={onOpenRecord}>
          <b>{hub.latest.heading}</b>
          <Chips chips={hub.latest.chips} />
          <span className="more">Record ›</span>
        </button>
      )}
    </>
  );
}
