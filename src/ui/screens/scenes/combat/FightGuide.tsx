import { useState } from 'react';

import { fightGlossary } from '@/game';

import { useCloseOnEscape } from '../../../components/useCloseOnEscape';

/**
 * "How fighting works": the fight glossary as a reference sheet, opened from the plan screen.
 * Every condition, readied state, defence, action and piece of footwork, each with its rule and
 * what answers it. A drawer from the right on a desktop, a sheet from below on a phone; Esc,
 * the backdrop or Close shuts it.
 */

function GuideSheet({ onClose }: { readonly onClose: () => void }) {
  useCloseOnEscape(onClose);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet paper-sheet fight-guide"
        role="dialog"
        aria-modal="true"
        aria-label="How fighting works"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2>How fighting works</h2>
        <p className="fight-guide-lead">
          Tap a word under a fighter on the field to read it there. Each entry says what it does,
          then what answers it.
        </p>
        {fightGlossary().map((section) => (
          <section key={section.group} className="fight-guide-group" aria-label={section.title}>
            <h3>{section.title}</h3>
            <p className="fight-guide-note">{section.note}</p>
            <dl>
              {section.entries.map((e) => (
                <div key={e.id} className="fight-guide-entry">
                  <dt>{e.name}</dt>
                  <dd>{e.rule}</dd>
                  <dd className="fight-guide-answer">{e.counter}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
        <footer className="profile-actions">
          <button type="button" className="btn ghost" autoFocus onClick={onClose}>
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

/** The button that opens the sheet, and the sheet while it is open. */
export function FightGuide() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn ghost fight-guide-open"
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true);
        }}
      >
        How fighting works
      </button>
      {open && (
        <GuideSheet
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
