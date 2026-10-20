import type { SaveSummary } from '@/game';

/** The title menu's choices, shared by the phone's column and the desktop's list. */

export interface MainMenuProps {
  /** The saved game, when there is one. */
  readonly save: SaveSummary | null;
  readonly notice: string | null;
  readonly onDismissNotice: () => void;
  readonly onContinue: () => void;
  readonly onNewGame: () => void;
  readonly onVersus: () => void;
  readonly onEditor: () => void;
  readonly onSettings: () => void;
}

export interface MenuOption {
  readonly id: 'continue' | 'new-game' | 'versus' | 'editor' | 'settings';
  readonly glyph: string;
  readonly title: string;
  readonly line: string;
  readonly primary: boolean;
  readonly pick: () => void;
}

/**
 * The menu's choices in order: carry on (when there is a save), begin again, versus, the editor,
 * settings.
 */
export function menuOptions(props: MainMenuProps, askToStartOver: () => void): MenuOption[] {
  const { save } = props;
  const resume: MenuOption[] = save
    ? [
        {
          id: 'continue',
          glyph: '続',
          title: 'Continue',
          line: `${save.name}, ${save.line}`,
          primary: true,
          pick: props.onContinue,
        },
      ]
    : [];
  return [
    ...resume,
    {
      id: 'new-game',
      glyph: '新',
      title: 'New game',
      line: 'Break into the academy and graduate as a new genin.',
      primary: !save,
      pick: save ? askToStartOver : props.onNewGame,
    },
    {
      id: 'versus',
      glyph: '対',
      title: 'Versus',
      line: 'Any two fighters, head to head. Nothing is saved.',
      primary: false,
      pick: props.onVersus,
    },
    {
      id: 'editor',
      glyph: '編',
      title: 'Editor',
      line: 'Change how fighters are written, for versus and new games.',
      primary: false,
      pick: props.onEditor,
    },
    {
      id: 'settings',
      glyph: '設',
      title: 'Settings',
      line: 'Sound and music.',
      primary: false,
      pick: props.onSettings,
    },
  ];
}
