import type { ReactNode } from 'react';

import type { BackdropId, TimeSlot } from '@/game';

import { Backdrop } from '../art/Backdrop';

interface BannerProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly slot: TimeSlot;
  readonly backdrop?: BackdropId;
  readonly onBack?: () => void;
  readonly backLabel?: string;
  readonly children?: ReactNode;
}

/** The header of a place page: a slice of the village sky with the place's name. */
export function Banner({
  title,
  subtitle,
  slot,
  backdrop,
  onBack,
  backLabel,
  children,
}: BannerProps) {
  return (
    <header className="banner sky" data-slot={slot} data-land={backdrop}>
      {backdrop && <Backdrop id={backdrop} />}
      {children}
      <div className="banner-in">
        {onBack && (
          <button type="button" className="back" onClick={onBack}>
            ‹ {backLabel ?? 'Back'}
          </button>
        )}
        <h1 className="banner-title">{title}</h1>
        {subtitle && <p className="banner-sub">{subtitle}</p>}
      </div>
    </header>
  );
}
