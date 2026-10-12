import type { StatGrade, TierRead } from '@/game';

/** A stat grade as a seal-like letter, coloured by how rare it is. */
export function GradeBadge({
  grade,
  large = false,
}: {
  readonly grade: StatGrade;
  readonly large?: boolean;
}) {
  return (
    <span className={large ? 'grade-badge large' : 'grade-badge'} data-grade={grade}>
      {grade}
    </span>
  );
}

/** Where in the grade's band a value sat, 0–100 (0 when it was below the grade). */
function percentAt(tier: TierRead, value: number): number {
  if (!tier.next) return 100;
  const share = (value - tier.min) / (tier.next.at - tier.min);
  return Math.round(Math.min(1, Math.max(0, share)) * 100);
}

/**
 * How far through the current grade a value is, towards the next letter. With `from` (the
 * value before a tick), the stretch just gained is drawn in with a quick ink stroke.
 */
export function GradeBar({
  tier,
  from = null,
}: {
  readonly tier: TierRead;
  readonly from?: number | null;
}) {
  const to = Math.round(tier.progress * 100);
  const start = from === null ? to : Math.min(to, percentAt(tier, from));
  return (
    <span
      className="grade-bar"
      data-grade={tier.grade}
      aria-label={tier.next ? `Towards ${tier.next.label}` : 'Top grade'}
    >
      <i style={{ width: `${to}%` }} />
      {start < to && (
        <b className="ink-stroke" style={{ left: `${start}%`, width: `${to - start}%` }} />
      )}
    </span>
  );
}
