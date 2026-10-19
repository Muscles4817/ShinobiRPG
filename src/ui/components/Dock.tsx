export type DockTab = 'here' | 'travel' | 'jutsu' | 'bonds' | 'shinobi' | 'record';

/** The tabs in dock order; on a keyboard, tab n is the number key n. */
export const DOCK_TABS: readonly { id: DockTab; kanji: string; label: string }[] = [
  { id: 'here', kanji: '里', label: 'Here' },
  { id: 'travel', kanji: '旅', label: 'Travel' },
  { id: 'jutsu', kanji: '術', label: 'Jutsu' },
  { id: 'bonds', kanji: '縁', label: 'Bonds' },
  { id: 'shinobi', kanji: '忍', label: 'Shinobi' },
  { id: 'record', kanji: '記', label: 'Record' },
];

interface DockProps {
  readonly active: DockTab;
  readonly onSelect: (tab: DockTab) => void;
  /** Show each tab's number key (the desktop rail, where a keyboard is likely). */
  readonly showKeys?: boolean;
}

/** The global navigation: at the bottom on a phone, down the side rail on a wide screen. */
export function Dock({ active, onSelect, showKeys = false }: DockProps) {
  return (
    <nav className="dock" aria-label="Main">
      {DOCK_TABS.map((t, i) => (
        <button
          key={t.id}
          type="button"
          className={t.id === active ? 'dk on' : 'dk'}
          aria-current={t.id === active ? 'page' : undefined}
          aria-keyshortcuts={showKeys ? String(i + 1) : undefined}
          onClick={() => {
            onSelect(t.id);
          }}
        >
          <i aria-hidden="true">{t.kanji}</i>
          {t.label}
          {showKeys && <kbd aria-hidden="true">{i + 1}</kbd>}
        </button>
      ))}
    </nav>
  );
}
