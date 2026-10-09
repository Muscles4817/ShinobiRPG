interface ChipData {
  readonly label: string;
  readonly tone: string;
}

export function Chips({ chips }: { readonly chips: readonly ChipData[] }) {
  if (chips.length === 0) return null;
  return (
    <span className="chips">
      {chips.map((c) => (
        <span key={c.label} className={`chip ${c.tone}`}>
          {c.label}
        </span>
      ))}
    </span>
  );
}
