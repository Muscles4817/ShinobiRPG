/**
 * Architecture rules. These are the module boundaries described in CLAUDE.md.
 * A violation fails `npm run arch` (and CI).
 *
 * Layers (an arrow means "may import"):
 *
 *   ui ──► game ──► content ──► systems ──► core
 *    └──────► core     └──────────► systems
 *
 * - core:     generic, game-agnostic utilities (rng, result, math).
 * - systems:  self-contained domain modules (time, stats, combat, …).
 * - content:  static game data (techniques, missions, enemies, …).
 * - game:     composes systems + content into GameState and player actions.
 * - ui:       React. Talks to the game only through `@/game`'s public API.
 * - platform: browser adapters (storage). Implements interfaces from `@/game`.
 */
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular imports make modules impossible to reason about or replace.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'core-is-standalone',
      severity: 'error',
      comment: 'core must not know about the game.',
      from: { path: '^src/core/' },
      to: { path: '^src/(?!core/)' },
    },
    {
      name: 'systems-only-use-core-and-systems',
      severity: 'error',
      comment: 'Systems are pure domain logic: no content, game, ui or platform imports.',
      from: { path: '^src/systems/' },
      to: { path: '^src/(content|game|ui|platform)/' },
    },
    {
      name: 'systems-use-public-api-of-other-systems',
      severity: 'error',
      comment:
        'A system may only import another system through its index.ts. Internals are private, ' +
        'which is what lets a system (e.g. the combat engine) be rewritten in isolation.',
      from: { path: '^src/systems/([^/]+)/' },
      to: {
        path: '^src/systems/',
        pathNot: ['^src/systems/$1/', '^src/systems/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'content-is-data',
      severity: 'error',
      comment: 'Content is plain data typed by systems; it must not depend on game/ui.',
      from: { path: '^src/content/' },
      to: { path: '^src/(game|ui|platform)/' },
    },
    {
      name: 'content-uses-system-public-api',
      severity: 'error',
      from: { path: '^src/content/' },
      to: { path: '^src/systems/[^/]+/(?!index\\.ts$)' },
    },
    {
      name: 'game-uses-system-public-api',
      severity: 'error',
      comment: 'The game layer composes systems through their public index.ts only.',
      from: { path: '^src/game/' },
      to: { path: '^src/systems/[^/]+/(?!index\\.ts$)' },
    },
    {
      name: 'game-is-headless',
      severity: 'error',
      comment: 'The game layer must run without a browser or React (tests, future CLI, etc).',
      from: { path: '^src/game/' },
      to: { path: '^src/(ui|platform)/|^node_modules/react' },
    },
    {
      name: 'ui-goes-through-game',
      severity: 'error',
      comment: 'UI talks to the game through `@/game` only — never to systems or content directly.',
      from: { path: '^src/ui/' },
      to: { path: '^src/(systems|content)/|^src/game/(?!index\\.ts$)' },
    },
    {
      name: 'platform-is-thin',
      severity: 'error',
      from: { path: '^src/platform/' },
      to: { path: '^src/(systems|content|ui)/|^src/game/(?!index\\.ts$)' },
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: 'Dead modules rot. Delete them or wire them in.',
      from: {
        orphan: true,
        pathNot: [
          '\\.d\\.ts$',
          '\\.test\\.tsx?$',
          '^src/test/',
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts)$',
        ],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.test\\.tsx?$|^src/test/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.app.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      extensions: ['.ts', '.tsx', '.js'],
    },
  },
};
