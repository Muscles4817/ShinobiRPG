import type { FacePalettes, FaceParts, Look } from '@/game';

import { Portrait } from '../../art/Portrait';

import { Segments } from './Segments';

/** The rows a new character's face is put together from, each a part of `FaceParts`. */
const ROWS: readonly { readonly part: keyof FacePalettes; readonly label: string }[] = [
  { part: 'shape', label: 'Face shape' },
  { part: 'figure', label: 'Figure' },
  { part: 'eyes', label: 'Eye shape' },
  { part: 'brows', label: 'Brows' },
  { part: 'nose', label: 'Nose' },
  { part: 'ears', label: 'Ears' },
  { part: 'expression', label: 'Expression' },
  { part: 'mark', label: 'Marks' },
];

interface FacePickerProps {
  readonly palettes: FacePalettes;
  /** The whole look, so the face being put together can be seen beside its choices. */
  readonly look: Look;
  readonly onChange: (face: FaceParts) => void;
}

/** Choices for the face itself, under hair and colours on the student record. */
export function FacePicker({ palettes, look, onChange }: FacePickerProps) {
  const { face } = look;
  return (
    <>
      <div className="face-preview">
        <Portrait appearance={look} size={72} />
      </div>
      {ROWS.map(({ part, label }) => (
        <Segments<string>
          key={part}
          label={label}
          values={palettes[part]}
          value={face[part]}
          onPick={(v) => {
            onChange({ ...face, [part]: v });
          }}
        />
      ))}
    </>
  );
}
