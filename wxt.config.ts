import { defineConfig } from 'wxt';

const extensionIcon = {
  16: 'icon/16.png',
  32: 'icon/32.png',
  48: 'icon/48.png',
  128: 'icon/128.png',
};

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    default_locale: 'en',
    name: '__MSG_extensionName__',
    short_name: '__MSG_extensionShortName__',
    description: '__MSG_extensionDescription__',
    action: {
      default_title: '__MSG_extensionDefaultTitle__',
      default_icon: extensionIcon,
    },
    permissions: ['activeTab', 'scripting', 'storage'],
    host_permissions: ['https://xletejbcfylwplhnlbjo.supabase.co/*'],
    web_accessible_resources: [
      {
        resources: ['game.html', 'mascot-content.js'],
        matches: ['<all_urls>'],
      },
    ],
    commands: {
      'jumping-clawd-open-casual-game': {
        suggested_key: {
          default: 'Ctrl+Comma',
          mac: 'MacCtrl+Comma',
        },
        description: '__MSG_commandCasualDescription__',
      },
      'jumping-clawd-open-challenge-game': {
        suggested_key: {
          default: 'Ctrl+Period',
          mac: 'MacCtrl+Period',
        },
        description: '__MSG_commandChallengeDescription__',
      },
    },
  },
});
