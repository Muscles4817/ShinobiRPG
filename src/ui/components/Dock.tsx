export type DockTab = 'here' | 'travel' | 'jutsu' | 'bonds' | 'shinobi' | 'record';

const TABS: readonly { id: DockTab; kanji: string; label: string }[] = [
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
}

/** The global navigation, always at the bottom except during scenes. */
export function Dock({ active, onSelect }: DockProps) {
  return (
    <nav className="dock" aria-label="Main">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={t.id === active ? 'dk on' : 'dk'}
          aria-current={t.id === active ? 'page' : undefined}
          onClick={() => {
            onSelect(t.id);
          }}
        >
          <i aria-hidden="true">{t.kanji}</i>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
