import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Syntax banned everywhere. */
const BANNED_SYNTAX = [
  { selector: 'ExportDefaultDeclaration', message: 'Use named exports.' },
  { selector: 'TSEnumDeclaration', message: 'Use a string-literal union instead of enum.' },
];

/** Who may turn lines into events: the story's one writer, old saves and shelved engines. */
const STORY_IMPORTS = [
  {
    group: ['**/rules/narration'],
    importNames: ['toldFrom'],
    message: 'Tell lines through `say` (plan/toldPools.ts), the one writer of the story.',
  },
  {
    group: ['**/rules/narrationLegacy', '@/systems/combat'],
    importNames: ['storyOfLines'],
    message: 'Only old saves and shelved engines read lines into events.',
  },
];

/** What a fight's line carries beside its words is read only by the narration module. */
const STORY_MARKERS = [
  {
    selector: 'Literal[value=/⟦/]',
    message: 'Read a fight’s events (storyContract.ts), never markers in its words.',
  },
  {
    selector: 'TemplateElement[value.raw=/⟦/]',
    message: 'Read a fight’s events (storyContract.ts), never markers in its words.',
  },
];

export default tseslint.config(
  {
    ignores: [
      'dist',
      // Throwaway design prototypes, run on their own config (see their README).
      'prototypes',
      'dist-release',
      'electron/dist',
      'release',
      'dev-dist',
      'coverage',
      '.claude',
      '.dependency-cruiser.cjs',
      'docs/design/art-mockups',
      // The native projects Capacitor generates, with the game's build copied inside them.
      'android',
      'ios',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // Readability guard-rails. See CLAUDE.md "Code quality rules".
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      complexity: ['error', 15],
      'prefer-const': 'error',
      'no-param-reassign': ['error', { props: true }],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-syntax': ['error', ...BANNED_SYNTAX],
      // Game logic must be deterministic: use the seeded Rng from @/core.
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the seeded Rng from @/core.' },
        { object: 'Date', property: 'now', message: 'Game logic must not read wall-clock time.' },
      ],
    },
  },
  {
    // A fight is told as events (`systems/combat/storyContract.ts`): what a line carries beside
    // its words is the narration module's own business, and a reader reads the event's fields.
    files: ['src/**/*.{ts,tsx}'],
    ignores: [
      'src/systems/combat/rules/narration.ts',
      'src/systems/combat/rules/causes.ts',
      'src/systems/combat/rules/narrationLegacy.ts',
      'src/systems/combat/rules/narration*.test.ts',
      'src/game/persistence/storyMigration.test.ts',
      'src/systems/combat/engines/plan/legacyStory.test.ts',
    ],
    rules: {
      'no-restricted-syntax': ['error', ...BANNED_SYNTAX, ...STORY_MARKERS],
      'no-restricted-imports': ['error', { patterns: STORY_IMPORTS }],
    },
  },
  {
    // The one writer of the story, and those allowed to read old lines into events.
    files: [
      'src/systems/combat/engines/plan/toldPools.ts',
      'src/systems/combat/engines/plan/legacyStory.ts',
      'src/systems/combat/index.ts',
      'src/systems/combat/engines/deck/engine.ts',
      'src/systems/combat/engines/duel/engine.ts',
      'src/game/persistence/storyMigration.ts',
      // Tests read a line builder's output as the story's writer would.
      'src/test/**',
      '**/*.test.{ts,tsx}',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    // A verb runs only after its check: `dispatch` does both, and one verb running another goes
    // through `performChecked` (game/actions/compose.ts), never a bare `.perform(`.
    files: ['src/game/**/*.ts'],
    ignores: ['src/game/dispatch.ts', 'src/game/actions/compose.ts', '**/*.test.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...BANNED_SYNTAX,
        ...STORY_MARKERS,
        {
          selector: "CallExpression[callee.property.name='perform']",
          message: 'Run another verb with performChecked (game/actions/compose.ts).',
        },
      ],
    },
  },
  {
    // One writer of a fighter's health (`plan/health.ts`), so every change is recorded where it
    // is made and a hit does all a hit does (`plan/wound.ts`).
    files: ['src/systems/combat/engines/plan/**/*.ts'],
    ignores: [
      'src/systems/combat/engines/plan/health.ts',
      'src/systems/combat/engines/plan/sizing.ts',
      '**/*.test.ts',
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        ...BANNED_SYNTAX,
        ...STORY_MARKERS,
        {
          selector: "ObjectExpression:has(> SpreadElement) > Property[key.name='health']",
          message: 'Set a fighter’s health through plan/health.ts (setHealth, or wound for a hit).',
        },
      ],
    },
  },
  {
    // `withHealth` sets health without recording it: only a hit's own writer and the empower's
    // body (whose change `setHealth` then records) may use it.
    files: ['src/systems/combat/engines/plan/**/*.ts'],
    ignores: [
      'src/systems/combat/engines/plan/health.ts',
      'src/systems/combat/engines/plan/wound.ts',
      'src/systems/combat/engines/plan/empower.ts',
      'src/systems/combat/engines/plan/toldPools.ts',
      'src/systems/combat/engines/plan/legacyStory.ts',
      '**/*.test.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...STORY_IMPORTS,
            {
              group: ['./health', '**/plan/health'],
              importNames: ['withHealth'],
              message: 'Set health with setHealth (or wound), which records the change.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/**/*.{ts,tsx}', 'src/main.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      'max-lines': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['electron/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['vite.config.ts', 'capacitor.config.ts', 'eslint.config.js', 'scripts/**'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-restricted-syntax': 'off' },
  },
);
