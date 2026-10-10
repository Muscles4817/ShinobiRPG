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

/** How far through the current grade a value is, towards the next letter. */
export function GradeBar({ tier }: { readonly tier: TierRead }) {
  return (
    <span
      className="grade-bar"
      data-grade={tier.grade}
      aria-label={tier.next ? `Towards ${tier.next.label}` : 'Top grade'}
    >
      <i style={{ width: `${Math.round(tier.progress * 100)}%` }} />
    </span>
  );
}
