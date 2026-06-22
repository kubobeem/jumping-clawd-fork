import { browser } from 'wxt/browser';
import {
  type MascotSettings,
  type MascotRuntimeMessage,
  type MascotStateMessage,
  MASCOT_OPEN_MESSAGE,
  MASCOT_CLOSE_MESSAGE,
  MASCOT_SETTINGS_MESSAGE,
  MASCOT_STATE_MESSAGE,
  DEFAULT_MASCOT_SETTINGS,
  MASCOT_STORAGE_KEY,
} from '../src/mascot/types';
import { MascotRenderer } from '../src/mascot/renderer';
import { MascotBehaviorManager } from '../src/mascot/behaviors';
import { MascotInteractionManager } from '../src/mascot/interactions';

let renderer: MascotRenderer | null = null;
let behaviors: MascotBehaviorManager | null = null;
let interactions: MascotInteractionManager | null = null;
let currentSettings: MascotSettings = { ...DEFAULT_MASCOT_SETTINGS };

/** Normalize settings from storage or message */
function normalizeSettings(value: unknown): MascotSettings {
  if (!value || typeof value !== 'object') return { ...DEFAULT_MASCOT_SETTINGS };
  const s = value as Record<string, unknown>;
  return {
    enabled: typeof s.enabled === 'boolean' ? s.enabled : DEFAULT_MASCOT_SETTINGS.enabled,
    mode: (s.mode === 'web-page' || s.mode === 'browser-ui' || s.mode === 'random')
      ? s.mode : DEFAULT_MASCOT_SETTINGS.mode,
    size: typeof s.size === 'number' ? Math.max(16, Math.min(128, Math.round(s.size))) : DEFAULT_MASCOT_SETTINGS.size,
    opacity: typeof s.opacity === 'number' ? Math.max(0, Math.min(100, s.opacity)) : DEFAULT_MASCOT_SETTINGS.opacity,
    quietMode: typeof s.quietMode === 'boolean' ? s.quietMode : DEFAULT_MASCOT_SETTINGS.quietMode,
    powerSave: typeof s.powerSave === 'boolean' ? s.powerSave : DEFAULT_MASCOT_SETTINGS.powerSave,
    clickThrough: typeof s.clickThrough === 'boolean' ? s.clickThrough : DEFAULT_MASCOT_SETTINGS.clickThrough,
    satiety: typeof s.satiety === 'number' ? Math.max(0, Math.min(100, s.satiety)) : DEFAULT_MASCOT_SETTINGS.satiety,
  };
}

/** Start the mascot */
function startMascot(settings: MascotSettings): void {
  if (renderer) stopMascot();

  currentSettings = { ...settings };
  renderer = new MascotRenderer(currentSettings);
  behaviors = new MascotBehaviorManager(renderer, currentSettings);
  interactions = new MascotInteractionManager(renderer, behaviors, currentSettings, {
    onPet: () => {
      // Handle pet callback
    },
    onFeed: () => {
      saveSatiety(currentSettings.satiety);
    },
    onDragStart: () => {
      if (behaviors) behaviors.registerInteraction();
    },
    onDragEnd: () => {
      if (behaviors) behaviors.registerInteraction();
    },
  });

  behaviors.start();
  interactions.attach();
}

/** Stop the mascot */
function stopMascot(): void {
  if (interactions) {
    interactions.detach();
    interactions = null;
  }
  if (behaviors) {
    behaviors.stop();
    behaviors = null;
  }
  if (renderer) {
    renderer.destroy();
    renderer = null;
  }
}

/** Update mascot settings live */
function updateMascotSettings(partial: Partial<MascotSettings>): void {
  currentSettings = { ...currentSettings, ...partial };

  if (renderer) {
    if (partial.size !== undefined) renderer.updateSize(partial.size);
    if (partial.opacity !== undefined) renderer.updateOpacity(partial.opacity);
    if (partial.clickThrough !== undefined) renderer.updateClickThrough(partial.clickThrough);
  }
  if (behaviors) behaviors.updateSettings(currentSettings);
  if (interactions) interactions.updateSettings(currentSettings);

  // Save to storage
  void browser.storage.local.set({ [MASCOT_STORAGE_KEY]: currentSettings });
}

/** Save satiety to storage */
function saveSatiety(value: number): void {
  currentSettings.satiety = value;
  void browser.storage.local.set({ [MASCOT_STORAGE_KEY]: currentSettings });
}

/** Get current mascot state for popup */
function getMascotState(): MascotStateMessage {
  return {
    type: MASCOT_STATE_MESSAGE,
    isOpen: renderer !== null,
    mode: renderer ? currentSettings.mode : null,
    visualState: behaviors ? behaviors.getVisualState() : null,
    satiety: currentSettings.satiety,
  };
}

/** Handle runtime messages from popup */
function handleRuntimeMessage(message: unknown): Promise<MascotStateMessage> | undefined {
  const msg = message as MascotRuntimeMessage;

  if (msg.type === MASCOT_OPEN_MESSAGE) {
    const settings = normalizeSettings(msg.settings);
    startMascot(settings);
    void browser.storage.local.set({ [MASCOT_STORAGE_KEY]: currentSettings });
    return Promise.resolve(getMascotState());
  }

  if (msg.type === MASCOT_CLOSE_MESSAGE) {
    stopMascot();
    currentSettings.enabled = false;
    void browser.storage.local.set({ [MASCOT_STORAGE_KEY]: currentSettings });
    return Promise.resolve(getMascotState());
  }

  if (msg.type === MASCOT_SETTINGS_MESSAGE && msg.settings) {
    updateMascotSettings(msg.settings);
    return Promise.resolve(getMascotState());
  }

  if ((message as Record<string, unknown>)?.type === 'jumping-clawd:mascot-get-state') {
    return Promise.resolve(getMascotState());
  }

  return undefined;
}

export default defineUnlistedScript(() => {
  // Check if mascot should auto-start
  void browser.storage.local.get(MASCOT_STORAGE_KEY).then((result) => {
    const stored = result[MASCOT_STORAGE_KEY] as MascotSettings | undefined;
    const settings = normalizeSettings(stored);

    if (settings.enabled) {
      startMascot(settings);
    }
  });

  // Listen for messages from popup
  browser.runtime.onMessage.addListener(handleRuntimeMessage);

  // Return cleanup function
  return () => {
    stopMascot();
    browser.runtime.onMessage.removeListener(handleRuntimeMessage);
  };
});
