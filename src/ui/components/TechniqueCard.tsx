import type { Discipline } from '@/game';

/** One kanji per discipline, printed faintly on each card. */
const GLYPH: Readonly<Record<Discipline | 'basic', string>> = {
  taijutsu: '体',
  ninjutsu: '忍',
  genjutsu: '幻',
  kenjutsu: '剣',
  fuuinjutsu: '封',
  basic: '基',
};

interface TechniqueCardProps {
  readonly name: string;
  readonly detail: string;
  readonly discipline: Discipline | 'basic';
  readonly ghost?: boolean;
}

/** The card used for techniques everywhere: the Jutsu deck and the hand in fights. */
export function TechniqueCard({ name, detail, discipline, ghost = false }: TechniqueCardProps) {
  return (
    <span className={`tcard t-${discipline}${ghost ? ' ghost' : ''}`}>
      <span className="tname">{name}</span>
      <span className="tglyph" aria-hidden="true">
        {GLYPH[discipline]}
      </span>
      <span className="tdetail">{detail}</span>
    </span>
  );
}
