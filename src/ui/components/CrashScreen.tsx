import { Component, type ErrorInfo, type ReactNode } from 'react';

import type { SaveStore } from '@/game';

import { copyText } from './copyText';

interface CrashBoundaryProps {
  /** Where the save is, so it can be copied out from the crash screen. */
  readonly store: SaveStore;
  readonly children: ReactNode;
}

interface CrashBoundaryState {
  readonly error: Error | null;
  readonly said: string | null;
}

function asError(thrown: unknown): Error {
  return thrown instanceof Error ? thrown : new Error(String(thrown));
}

/**
 * Catches anything the screens throw while drawing, so a fault shows a page that says so, with
 * the save still on the device and within reach, in place of a blank window. It must be a class:
 * React offers error boundaries no other way.
 */
export class CrashBoundary extends Component<CrashBoundaryProps, CrashBoundaryState> {
  override state: CrashBoundaryState = { error: null, said: null };

  static getDerivedStateFromError(thrown: unknown): Partial<CrashBoundaryState> {
    return { error: asError(thrown) };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('The game stopped:', error, info.componentStack);
  }

  private copy(text: string | null, done: string): void {
    if (text === null) return;
    void copyText(text).then((copied) => {
      this.setState({ said: copied ? done : 'This device won’t copy for the game.' });
    });
  }

  override render(): ReactNode {
    const { error, said } = this.state;
    if (!error) return this.props.children;
    const save = this.props.store.load();
    return (
      <main className="crash-screen" role="alert">
        <h1>The game stopped</h1>
        <p>
          Something went wrong that the game didn’t expect. Your save is still on this device, as it
          was after your last move.
        </p>
        <p className="crash-what">{error.message}</p>
        <div className="row-buttons">
          <button
            type="button"
            className="btn"
            onClick={() => {
              window.location.reload();
            }}
          >
            Start the game again
          </button>
          {save !== null && (
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                this.copy(save, 'Save copied.');
              }}
            >
              Copy my save
            </button>
          )}
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              this.copy(`${error.message}\n${error.stack ?? ''}`, 'Copied what went wrong.');
            }}
          >
            Copy what went wrong
          </button>
        </div>
        {said && <p role="status">{said}</p>}
      </main>
    );
  }
}
