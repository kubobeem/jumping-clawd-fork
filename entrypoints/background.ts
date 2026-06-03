import { browser } from 'wxt/browser';
import { openGameInActiveTab } from '../src/extension/open-game';
import type { GameMode } from '../src/extension/messages';

const GAME_MODE_BY_COMMAND: Record<string, GameMode> = {
  'happy-clawd-open-casual-game': 'casual',
  'happy-clawd-open-competitive-game': 'competitive',
};

export default defineBackground(() => {
  browser.commands.onCommand.addListener((command) => {
    const gameMode = GAME_MODE_BY_COMMAND[command];

    if (gameMode) {
      void openGameInActiveTab(gameMode).catch((error) => {
        console.warn('Failed to open Happy Clawd game from command', error);
      });
    }
  });
});
