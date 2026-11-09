import { KeyHint } from '../../layout/KeyHint';
import { useChoiceKeys } from '../../layout/useChoiceKeys';

/** The only way on is the primary one: 1 or Enter takes it. */
const ONLY_WAY = [{ primary: true }];

interface OneChoiceProps {
  readonly label: string;
  readonly onChoose: () => void;
  readonly wide: boolean;
}

/** A single way on, for the bar under the story: skipping the walk, or walking in. */
export function OneChoice({ label, onChoose, wide }: OneChoiceProps) {
  useChoiceKeys(ONLY_WAY, onChoose, wide);
  return (
    <nav className="choices" aria-label="Choices">
      <button
        type="button"
        className="choice primary"
        aria-keyshortcuts={wide ? '1' : undefined}
        onClick={onChoose}
      >
        {wide && <KeyHint index={0} />}
        <b>{label}</b>
      </button>
    </nav>
  );
}
