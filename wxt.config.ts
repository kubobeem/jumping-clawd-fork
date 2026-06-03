import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Happy Clawd',
    description: 'Play Happy Clawd on the current page.',
    permissions: ['activeTab', 'scripting', 'storage'],
    web_accessible_resources: [
      {
        resources: ['game.html'],
        matches: ['<all_urls>'],
      },
    ],
    commands: {
      'happy-clawd-open-casual-game': {
        suggested_key: {
          default: 'Ctrl+Comma',
          mac: 'MacCtrl+Comma',
        },
        description: 'Start Happy Clawd casual mode on the current page',
      },
      'happy-clawd-open-competitive-game': {
        suggested_key: {
          default: 'Ctrl+Period',
          mac: 'MacCtrl+Period',
        },
        description: 'Start Happy Clawd competitive mode on the current page',
      },
    },
  },
});
