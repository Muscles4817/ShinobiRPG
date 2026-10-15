import type { ToneRead } from '@/game';

/** Once you know someone's tastes: whether an hour spent this way is their kind of thing. */
export function ToneStamp({ read }: { readonly read: ToneRead }) {
  if (read === null) return null;
  return (
    <span className={`badge tone-read ${read}`}>
      {read === 'likes' ? 'Their kind of thing' : 'Not their thing'}
    </span>
  );
}
