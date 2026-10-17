/** Progress towards something as ink dots ("●●○"), never a number in the story. */
export function ProgressDots({ done, of }: { readonly done: number; readonly of: number }) {
  return (
    <span className="progress-dots" role="img" aria-label={`${done} of ${of}`}>
      {Array.from({ length: of }, (_, i) => (i < done ? '●' : '○')).join('')}
    </span>
  );
}
