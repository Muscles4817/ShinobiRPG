import type { Discipline, StatGrade } from '@/game';

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
  /** The technique's rank, stamped in the corner. */
  readonly rank?: StatGrade;
  /** Learned a rank above your grade: stamped until it steadies. */
  readonly unstable?: boolean;
  /** A body move your strike plays from (your style): stamped. */
  readonly inStyle?: boolean;
}

/**
 * The card used for techniques everywhere: the Jutsu deck and the hand in fights. Its rank, an
 * unsteady technique and a move of your style show as ink stamps.
 */
export function TechniqueCard({
  name,
  detail,
  discipline,
  ghost = false,
  rank,
  unstable = false,
  inStyle = false,
}: TechniqueCardProps) {
  return (
    <span className={`tcard t-${discipline}${ghost ? ' ghost' : ''}`}>
      <span className="tname">{name}</span>
      {rank && (
        <span className="badge trank" data-grade={rank} aria-label={`Rank ${rank}`}>
          {rank}
        </span>
      )}
      <span className="tglyph" aria-hidden="true">
        {GLYPH[discipline]}
      </span>
      {unstable && <span className="badge tunstable">Unstable</span>}
      {inStyle && <span className="badge tstyle">Style</span>}
      <span className="tdetail">{detail}</span>
    </span>
  );
}
