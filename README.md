![Jumping Clawd](https://img.laosunwendao.com/skill-uploads/e70a2316aaa24c0e972fe920e89e260c.png)

# Jumping Clawd

Jumping Clawd is a browser extension mini-game built with [WXT](https://wxt.dev/). It can launch as an overlay on any web page, or open as a standalone game in a blank tab.

## 🌐 Multi-language Support

Jumping Clawd supports **English**, **日本語 (Japanese)**, and **中文 (Chinese)**. The language is automatically selected based on your browser's language settings.

Translations are stored in `public/_locales/`:
| Directory | Language |
|-----------|----------|
| `_locales/en/` | English |
| `_locales/ja/` | 日本語 |
| `_locales/zh_CN/` | 中文（简体） |

To add a new language, create a new directory under `public/_locales/` (e.g., `ko/` for Korean) with a `messages.json` file containing all message keys. The keys must match those in the existing locale files.

## Prerequisites

- Node.js `>=20.12.0` (required by WXT `0.20.26`)
- npm (uses `package-lock.json` for dependency locking)
- Chromium-based browser or Firefox (for loading the development extension)

Install dependencies:

```bash
npm install
```

After installation, WXT automatically generates `.wxt/` type definitions and runtime files via `postinstall`. This directory is a local build artifact and should not be committed.

## Local Development

Start Chrome/Chromium dev mode:

```bash
npm run dev
```

Start Firefox dev mode:

```bash
npm run dev:firefox
```

Common check & build commands:

```bash
npm run compile
npm run build
npm run build:firefox
npm run zip
npm run zip:firefox
```

During development, use `npm run dev`. Before publishing, run type checking, build, and packaging.

## Project Structure

| Path | Purpose |
| --- | --- |
| `wxt.config.ts` | Extension manifest config (permissions, icons, shortcuts, web-accessible resources) |
| `entrypoints/background.ts` | Background script - handles extension shortcuts to open the game |
| `entrypoints/popup/` | Extension popup UI - start/exit game and backdrop blur settings |
| `entrypoints/page-game-overlay.ts` | Injected page overlay script - creates iframe, message passing, game close, page background handling |
| `entrypoints/game.html` | Game page HTML - used for both standalone pages and overlay iframes |
| `src/extension/` | Extension-side common logic - open game, message types, backdrop blur storage |
| `src/game/` | Game logic, animation, leaderboard, DOM references, styles, and config |
| `public/icon/` | Extension icon assets |
| `public/_locales/` | Multi-language translation files |

### Game Development

Start with these files when working on gameplay:

- `src/game/config.js` — Adjust platform distances, jump timing, character size, spikes, charge meter, and challenge mode parameters
- `src/game/clawd-motion.js` — Adjust Clawd's jump pose, stretch, smear, and arm animations
- `src/game/app.js` — Game state machine, input handling, collision, scoring, respawn, leaderboard popup
- `src/game/styles.css` — Stage, character, platform, spike, and game-over panel styles

### Extension Development

Start with these files when working on extension features:

- `src/extension/open-game.ts` — Strategy for opening standalone pages or overlay mode
- `entrypoints/page-game-overlay.ts` — Page injection, overlay behavior, shortcuts, iframe communication, page background handling
- `entrypoints/popup/main.ts` — Popup buttons, state, and settings
- `wxt.config.ts` — Add permissions, host permissions, shortcuts, or extension resources

### Leaderboard

Leaderboard logic is in `src/game/leaderboard.js`. It uses a Supabase publishable key to access the REST API directly from the browser. If you change the Supabase project or table structure, update:

- The REST URL, publishable key, and table fields in `src/game/leaderboard.js`
- `host_permissions` in `wxt.config.ts`
- Supabase RLS/permissions policies to ensure public clients can only perform expected read/write operations

## Git & Generated Files

Files to commit (source code and environment config):

- `package.json`, `package-lock.json`
- `wxt.config.ts`, `tsconfig.json`
- `entrypoints/`, `src/`, `public/`, `assets/`, `components/`
- `AGENTS.md`

Files to NOT commit (local build artifacts — already in `.gitignore`):

- `node_modules/`
- `.wxt/`
- `.output/`
- `out/`
- `.env*`
- `.DS_Store`
- Local editor config
