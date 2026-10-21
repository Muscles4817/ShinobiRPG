import type { FindableTechnique, TechniqueBrowse } from '@/game';

/** Which page of how many, and the steps between them; nothing when one page holds them all. */
export function FinderPager<T extends FindableTechnique>({
  browse,
  onPage,
}: {
  readonly browse: TechniqueBrowse<T>;
  readonly onPage: (page: number) => void;
}) {
  const { page, pages, found, pageSize } = browse;
  if (pages <= 1) return null;
  const first = page * pageSize + 1;
  const last = Math.min(found, first + pageSize - 1);
  return (
    <nav className="finder-pager" aria-label="Pages">
      <button
        type="button"
        className="btn ghost small"
        disabled={page === 0}
        onClick={() => {
          onPage(page - 1);
        }}
      >
        Previous
      </button>
      <span aria-live="polite">
        {first}–{last} of {found}, page {page + 1} of {pages}
      </span>
      <button
        type="button"
        className="btn ghost small"
        disabled={page >= pages - 1}
        onClick={() => {
          onPage(page + 1);
        }}
      >
        Next
      </button>
    </nav>
  );
}
