export interface Tab<T extends string> {
  readonly id: T;
  readonly label: string;
}

interface TabBarProps<T extends string> {
  readonly tabs: readonly Tab<T>[];
  readonly active: T;
  readonly onSelect: (id: T) => void;
}

export function TabBar<T extends string>({ tabs, active, onSelect }: TabBarProps<T>) {
  return (
    <nav className="tabbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? 'active' : ''}
          aria-current={tab.id === active ? 'page' : undefined}
          onClick={() => {
            onSelect(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
