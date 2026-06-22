import { browser } from 'wxt/browser';
import {
  BACKDROP_BLUR_STEP_PX,
  DEFAULT_BACKDROP_BLUR_PX,
  MAX_BACKDROP_BLUR_PX,
  MIN_BACKDROP_BLUR_PX,
  getStoredBackdropBlur,
  normalizeBackdropBlur,
  saveStoredBackdropBlur,
} from '../../src/extension/backdrop-blur';
import {
  closeGameInActiveTab,
  getGameStateInActiveTab,
  openGameInActiveTab,
} from '../../src/extension/open-game';
import {
  DEFAULT_GAME_MODE,
  type GameMode,
  SET_BACKDROP_BLUR_MESSAGE,
  isGameMode,
} from '../../src/extension/messages';
import {
  type MascotMode,
  type MascotSettings,
  DEFAULT_MASCOT_SETTINGS,
  MASCOT_SIZE_MIN,
  MASCOT_SIZE_MAX,
  MASCOT_STORAGE_KEY,
} from '../../src/mascot/types';
import {
  openMascotInActiveTab,
  closeMascotInActiveTab,
  getMascotStateInActiveTab,
  updateMascotSettingsInActiveTab,
} from '../../src/extension/open-mascot';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing popup root');
}

const t = (key: string): string =>
  (browser.i18n.getMessage as (key: string) => string | undefined)(key) || key;

app.innerHTML = `
  <main class="popup" aria-label="Jumping Clawd">
    <header class="popup-header">
      <div class="mascot-mark" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 274 178" focusable="false">
          <path d="M9.23 42.62H48.9V74.28H9.23V42.62Z" fill="#DA7756" />
          <path d="M224 42.62H264.17V74.28H224V42.62Z" fill="#DA7756" />
          <path d="M40.9 8.74H232.5V136.59H40.9V8.74Z" fill="#DA7756" />
          <path d="M57.4 144.59H72.79V172.77H57.4V144.59Z" fill="#DA7756" />
          <path d="M89.29 144.59H105.05V172.77H89.29V144.59Z" fill="#DA7756" />
          <path d="M168.67 144.59H184.27V172.77H168.67V144.59Z" fill="#DA7756" />
          <path d="M200.04 144.59H215.22V172.77H200.04V144.59Z" fill="#DA7756" />
          <path d="m73.24 42.62h16.26v30.66h-16.26v-30.66z" fill="#000" />
          <path d="m183.9 42.62h16.26v30.66h-16.26v-30.66z" fill="#000" />
        </svg>
      </div>
      <div class="brand-copy">
        <h1 id="popup-title">Jumping Clawd</h1>
        <p id="popup-subtitle"></p>
      </div>
    </header>

    <section class="shortcut-panel" id="shortcut-panel">
      <div class="shortcut-row">
        <span id="shortcut-casual"></span>
        <span class="key-combo" aria-label="Ctrl comma">
          <kbd>Ctrl</kbd>
          <span class="shortcut-plus">+</span>
          <kbd>,</kbd>
        </span>
      </div>
      <div class="shortcut-row">
        <span id="shortcut-challenge"></span>
        <span class="key-combo" aria-label="Ctrl period">
          <kbd>Ctrl</kbd>
          <span class="shortcut-plus">+</span>
          <kbd>.</kbd>
        </span>
      </div>
      <div class="shortcut-row">
        <span id="shortcut-autoplay"></span>
        <span class="key-combo" aria-label="Ctrl A">
          <kbd>Ctrl</kbd>
          <span class="shortcut-plus">+</span>
          <kbd>A</kbd>
        </span>
      </div>
      <div class="shortcut-row">
        <span id="shortcut-exit"></span>
        <span class="key-combo" aria-label="Escape">
          <kbd>Esc</kbd>
        </span>
      </div>
    </section>

    <div class="game-actions" id="game-actions">
      <button
        id="start-casual-game"
        class="game-button game-button--mode"
        type="button"
        aria-pressed="false"
      ></button>
      <button
        id="start-challenge-game"
        class="game-button game-button--mode"
        type="button"
        aria-pressed="false"
      ></button>
      <button id="exit-game" class="game-button game-button--secondary game-button--exit" type="button"></button>
    </div>

    <section class="setting" aria-labelledby="backdrop-blur-label">
      <div class="setting-header">
        <label id="backdrop-blur-label" for="backdrop-blur"></label>
        <output id="backdrop-blur-value" class="setting-value" for="backdrop-blur">${DEFAULT_BACKDROP_BLUR_PX}px</output>
      </div>
      <input
        id="backdrop-blur"
        class="blur-slider"
        type="range"
        min="${MIN_BACKDROP_BLUR_PX}"
        max="${MAX_BACKDROP_BLUR_PX}"
        step="${BACKDROP_BLUR_STEP_PX}"
        value="${DEFAULT_BACKDROP_BLUR_PX}"
      />
    </section>

    <!-- Mascot Section -->
    <section class="mascot-panel" id="mascot-panel" aria-labelledby="mascot-panel-title">
      <div class="mascot-panel-header">
        <span id="mascot-panel-title"></span>
        <button id="mascot-toggle" class="mascot-toggle" type="button" aria-pressed="false"></button>
      </div>
      <div class="mascot-settings" id="mascot-settings" hidden>
        <div class="mascot-setting-row">
          <span id="mascot-mode-label"></span>
          <div class="mascot-mode-buttons" role="radiogroup" id="mascot-mode-group">
            <button class="mascot-mode-btn" data-mode="random" type="button" role="radio" aria-checked="true"></button>
            <button class="mascot-mode-btn" data-mode="web-page" type="button" role="radio" aria-checked="false"></button>
            <button class="mascot-mode-btn" data-mode="browser-ui" type="button" role="radio" aria-checked="false"></button>
          </div>
        </div>
        <div class="setting">
          <div class="setting-header">
            <label id="mascot-size-label" for="mascot-size"></label>
            <output id="mascot-size-value" class="setting-value" for="mascot-size">${DEFAULT_MASCOT_SETTINGS.size}px</output>
          </div>
          <input
            id="mascot-size"
            class="slider"
            type="range"
            min="${MASCOT_SIZE_MIN}"
            max="${MASCOT_SIZE_MAX}"
            value="${DEFAULT_MASCOT_SETTINGS.size}"
          />
        </div>
        <div class="mascot-toggles">
          <label class="mascot-toggle-row">
            <span id="mascot-quiet-label"></span>
            <input id="mascot-quiet" class="mascot-checkbox" type="checkbox" />
          </label>
          <label class="mascot-toggle-row">
            <span id="mascot-powersave-label"></span>
            <input id="mascot-powersave" class="mascot-checkbox" type="checkbox" checked />
          </label>
          <label class="mascot-toggle-row">
            <span id="mascot-clickthrough-label"></span>
            <input id="mascot-clickthrough" class="mascot-checkbox" type="checkbox" />
          </label>
        </div>
        <div class="mascot-panel-satiety">
          <span id="mascot-satiety-label"></span>
          <div class="mascot-satiety-bar" id="mascot-satiety-bar">
            <div class="mascot-satiety-fill" id="mascot-satiety-fill" style="width:100%"></div>
          </div>
          <span id="mascot-satiety-pct" class="setting-value">100%</span>
        </div>
      </div>
    </section>

    <p id="status" class="status" role="status" aria-live="polite"></p>
  </main>
`;

const casualModeButton =
  document.querySelector<HTMLButtonElement>('#start-casual-game');
const challengeModeButton =
  document.querySelector<HTMLButtonElement>('#start-challenge-game');
const exitButton = document.querySelector<HTMLButtonElement>('#exit-game');
const backdropBlurSlider =
  document.querySelector<HTMLInputElement>('#backdrop-blur');
const backdropBlurValue =
  document.querySelector<HTMLOutputElement>('#backdrop-blur-value');
const statusText = document.querySelector<HTMLParagraphElement>('#status');

if (
  !casualModeButton ||
  !challengeModeButton ||
  !exitButton ||
  !backdropBlurSlider ||
  !backdropBlurValue ||
  !statusText
) {
  throw new Error('Missing popup controls');
}

type PendingAction = 'loading' | 'starting' | 'exiting' | 'mascot-loading' | null;

const modeButtons: Record<GameMode, HTMLButtonElement> = {
  casual: casualModeButton,
  challenge: challengeModeButton,
};

const normalizeGameMode = (value: unknown): GameMode =>
  isGameMode(value) ? value : DEFAULT_GAME_MODE;

let currentBackdropBlurPx = DEFAULT_BACKDROP_BLUR_PX;
let hasAdjustedBackdropBlur = false;
let isGameOpen = false;
let currentGameMode: GameMode | null = null;
let currentAutoPlayEnabled = false;
let pendingAction: PendingAction = 'loading';

const setStatus = (message: string) => {
  statusText.textContent = message;
};

const applyPopupTranslations = () => {
  const titleEl = document.querySelector<HTMLHeadingElement>('#popup-title');
  const subtitleEl = document.querySelector<HTMLParagraphElement>('#popup-subtitle');
  const shortcutPanel = document.querySelector<HTMLElement>('#shortcut-panel');
  const gameActions = document.querySelector<HTMLDivElement>('#game-actions');
  const blurLabel = document.querySelector<HTMLLabelElement>('#backdrop-blur-label');

  if (titleEl) titleEl.textContent = t('popupTitle');
  if (subtitleEl) subtitleEl.textContent = t('popupSubtitle');
  if (shortcutPanel) shortcutPanel.setAttribute('aria-label', t('shortcutPanelLabel'));
  if (gameActions) gameActions.setAttribute('aria-label', t('gameActionsLabel'));

  const els: Record<string, string> = {
    'shortcut-casual': 'shortcutCasual',
    'shortcut-challenge': 'shortcutChallenge',
    'shortcut-autoplay': 'shortcutAutoPlay',
    'shortcut-exit': 'shortcutExit',
    'start-casual-game': 'casualMode',
    'start-challenge-game': 'challengeMode',
    'exit-game': 'exitGame',
    'backdrop-blur-label': 'backgroundBlur',
    'mascot-panel-title': 'mascotTitle',
    'mascot-mode-label': 'mascotMode',
    'mascot-size-label': 'mascotSize',
    'mascot-quiet-label': 'mascotQuiet',
    'mascot-powersave-label': 'mascotPowerSave',
    'mascot-clickthrough-label': 'mascotClickThrough',
    'mascot-satiety-label': 'mascotSatiety',
  };

  // Mascot toggle button text
  if (mascotToggle) mascotToggle.textContent = t('mascotToggle');

  // Mascot mode buttons
  mascotModeButtons.forEach((btn) => {
    const mode = btn.dataset.mode;
    let msgKey = '';
    if (mode === 'random') msgKey = 'mascotModeRandom';
    else if (mode === 'web-page') msgKey = 'mascotModeWeb';
    else if (mode === 'browser-ui') msgKey = 'mascotModeUI';
    if (msgKey) btn.textContent = t(msgKey);
  });

  Object.entries(els).forEach(([id, msgKey]) => {
    const el = document.querySelector<HTMLElement>(`#${id}`);
    if (el) el.textContent = t(msgKey);
  });
};

const getOpenStatus = () =>
  `${t('shortcutAutoPlay')}: ${currentAutoPlayEnabled ? 'ON' : 'OFF'}`;

const renderGameControls = () => {
  const isBusy = pendingAction !== null;

  Object.entries(modeButtons).forEach(([mode, button]) => {
    const isActive = isGameOpen && currentGameMode === mode;
    button.disabled = isBusy || isActive;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  exitButton.disabled = isBusy || !isGameOpen;
};

const isMissingReceiverError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist')
  );
};

const setBackdropBlurControlValue = (value: unknown) => {
  currentBackdropBlurPx = normalizeBackdropBlur(value);
  backdropBlurSlider.value = String(currentBackdropBlurPx);
  backdropBlurValue.textContent = `${currentBackdropBlurPx}px`;

  return currentBackdropBlurPx;
};

const sendBackdropBlurToActiveTab = async (blurPx: number) => {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (activeTab?.id == null) {
    return;
  }

  try {
    await browser.tabs.sendMessage(activeTab.id, {
      type: SET_BACKDROP_BLUR_MESSAGE,
      blurPx,
    });
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      console.warn('Failed to update Jumping Clawd backdrop blur', error);
    }
  }
};

// ── Mascot state ──
let isMascotOpen = false;
let currentMascotMode: MascotMode = 'random';
let currentMascotSatiety = 100;
let mascotSettings: MascotSettings = { ...DEFAULT_MASCOT_SETTINGS };
const MASCOT_PENDING = 'mascot-loading' as const;

const mascotToggle = document.querySelector<HTMLButtonElement>('#mascot-toggle');
const mascotSettingsPanel = document.querySelector<HTMLDivElement>('#mascot-settings');
const mascotModeGroup = document.querySelector<HTMLDivElement>('#mascot-mode-group');
const mascotSizeSlider = document.querySelector<HTMLInputElement>('#mascot-size');
const mascotSizeValue = document.querySelector<HTMLOutputElement>('#mascot-size-value');
const mascotQuietCheck = document.querySelector<HTMLInputElement>('#mascot-quiet');
const mascotPowerSaveCheck = document.querySelector<HTMLInputElement>('#mascot-powersave');
const mascotClickThroughCheck = document.querySelector<HTMLInputElement>('#mascot-clickthrough');
const mascotSatietyFill = document.querySelector<HTMLDivElement>('#mascot-satiety-fill');
const mascotSatietyPct = document.querySelector<HTMLSpanElement>('#mascot-satiety-pct');

if (
  !mascotToggle ||
  !mascotSettingsPanel ||
  !mascotModeGroup ||
  !mascotSizeSlider ||
  !mascotSizeValue ||
  !mascotQuietCheck ||
  !mascotPowerSaveCheck ||
  !mascotClickThroughCheck ||
  !mascotSatietyFill ||
  !mascotSatietyPct
) {
  throw new Error('Missing mascot controls');
}

const mascotModeButtons = document.querySelectorAll<HTMLButtonElement>('.mascot-mode-btn');

const normalizeMascotMode = (value: unknown): MascotMode =>
  value === 'web-page' || value === 'browser-ui' || value === 'random' ? value : 'random';

const updateMascotSatietyUI = (value: number) => {
  currentMascotSatiety = value;
  const pct = Math.max(0, Math.min(100, value));
  mascotSatietyFill.style.width = `${pct}%`;
  mascotSatietyFill.style.background = pct < 30 ? '#e11d48' : pct < 60 ? '#f97316' : '#16a34a';
  mascotSatietyPct.textContent = `${pct}%`;
};

const setMascotModeUI = (mode: MascotMode) => {
  currentMascotMode = mode;
  mascotModeButtons.forEach((btn) => {
    const btnMode = btn.dataset.mode as MascotMode | undefined;
    const isActive = btnMode === mode;
    btn.setAttribute('aria-checked', String(isActive));
    btn.classList.toggle('is-active', isActive);
  });
};

const renderMascotControls = () => {
  mascotToggle.setAttribute('aria-pressed', String(isMascotOpen));
  mascotToggle.classList.toggle('is-active', isMascotOpen);
  mascotSettingsPanel.hidden = !isMascotOpen;
};

const saveMascotSettings = () => {
  void browser.storage.local.set({ [MASCOT_STORAGE_KEY]: mascotSettings }).catch((error) => {
    console.warn('Failed to save mascot settings', error);
  });
};

const syncMascotState = async () => {
  try {
    const state = await getMascotStateInActiveTab();
    isMascotOpen = state.isOpen;
    if (state.isOpen && state.mode) {
      currentMascotMode = state.mode;
      setMascotModeUI(state.mode);
      updateMascotSatietyUI(state.satiety ?? 100);
    }
  } catch {
    isMascotOpen = false;
  }
  renderMascotControls();
};

const loadMascotStoredSettings = async () => {
  try {
    const result = await browser.storage.local.get(MASCOT_STORAGE_KEY);
    const stored = result[MASCOT_STORAGE_KEY] as MascotSettings | undefined;
    if (stored) {
      mascotSettings = { ...DEFAULT_MASCOT_SETTINGS, ...stored };
      mascotSizeSlider.value = String(mascotSettings.size);
      mascotSizeValue.textContent = `${mascotSettings.size}px`;
      mascotQuietCheck.checked = mascotSettings.quietMode;
      mascotPowerSaveCheck.checked = mascotSettings.powerSave;
      mascotClickThroughCheck.checked = mascotSettings.clickThrough;
      setMascotModeUI(mascotSettings.mode);
      updateMascotSatietyUI(mascotSettings.satiety);
    }
  } catch {
    // Use defaults
  }
};

const handleMascotToggle = async () => {
  if (pendingAction !== null && pendingAction !== MASCOT_PENDING) return;
  pendingAction = MASCOT_PENDING;
  renderGameControls();

  try {
    if (isMascotOpen) {
      await closeMascotInActiveTab();
      isMascotOpen = false;
      mascotSettings.enabled = false;
      saveMascotSettings();
    } else {
      mascotSettings.enabled = true;
      const state = await openMascotInActiveTab(mascotSettings);
      isMascotOpen = state.isOpen;
      if (state.satiety !== undefined) updateMascotSatietyUI(state.satiety);
      saveMascotSettings();
    }
  } catch (error) {
    console.warn('Failed to toggle mascot', error);
    isMascotOpen = !isMascotOpen;
  } finally {
    pendingAction = null;
    renderMascotControls();
    renderGameControls();
  }
};

const handleMascotModeChange = (mode: MascotMode) => {
  setMascotModeUI(mode);
  mascotSettings.mode = mode;
  saveMascotSettings();
  if (isMascotOpen) {
    void updateMascotSettingsInActiveTab(mascotSettings).catch((error) => {
      console.warn('Failed to update mascot mode', error);
    });
  }
};

const handleMascotSizeChange = () => {
  const size = Math.max(MASCOT_SIZE_MIN, Math.min(MASCOT_SIZE_MAX, Number(mascotSizeSlider.value)));
  mascotSizeValue.textContent = `${size}px`;
  mascotSettings.size = size;
  saveMascotSettings();
  if (isMascotOpen) {
    void updateMascotSettingsInActiveTab({ size }).catch((error) => {
      console.warn('Failed to update mascot size', error);
    });
  }
};

const handleMascotSettingToggle = () => {
  mascotSettings.quietMode = mascotQuietCheck.checked;
  mascotSettings.powerSave = mascotPowerSaveCheck.checked;
  mascotSettings.clickThrough = mascotClickThroughCheck.checked;
  saveMascotSettings();
  if (isMascotOpen) {
    void updateMascotSettingsInActiveTab(mascotSettings).catch((error) => {
      console.warn('Failed to update mascot settings', error);
    });
  }
};

const handleBackdropBlurInput = () => {
  hasAdjustedBackdropBlur = true;
  const blurPx = setBackdropBlurControlValue(backdropBlurSlider.value);

  void saveStoredBackdropBlur(blurPx).catch((error) => {
    console.warn('Failed to save Jumping Clawd backdrop blur setting', error);
  });
  void sendBackdropBlurToActiveTab(blurPx);
};

void getStoredBackdropBlur()
  .then((blurPx) => {
    if (!hasAdjustedBackdropBlur) {
      setBackdropBlurControlValue(blurPx);
    }
  })
  .catch((error) => {
    console.warn('Failed to load Jumping Clawd backdrop blur setting', error);
  });

const syncGameState = async () => {
  pendingAction = 'loading';
  renderGameControls();

  try {
    const state = await getGameStateInActiveTab();
    isGameOpen = state.isOpen;
    currentGameMode = isGameOpen ? normalizeGameMode(state.mode) : null;
    currentAutoPlayEnabled = isGameOpen ? state.autoPlay === true : false;
    setStatus(isGameOpen ? getOpenStatus() : '');
  } catch (error) {
    console.warn('Failed to read Jumping Clawd game state', error);
    isGameOpen = false;
    currentGameMode = null;
    currentAutoPlayEnabled = false;
    setStatus(t('statusCantRead'));
  } finally {
    pendingAction = null;
    renderGameControls();
  }
};

const handleStartGame = async (mode: GameMode) => {
  if (pendingAction !== null || (isGameOpen && currentGameMode === mode)) {
    return;
  }

  pendingAction = 'starting';
  renderGameControls();
  setStatus(isGameOpen ? t('statusSwitching') : t('statusOpening'));

  try {
    const state = await openGameInActiveTab(mode);
    isGameOpen = true;
    currentGameMode = normalizeGameMode(state.mode ?? mode);
    currentAutoPlayEnabled = state.autoPlay === true;
    await sendBackdropBlurToActiveTab(currentBackdropBlurPx);
    setStatus(getOpenStatus());
    window.close();
  } catch (error) {
    console.warn('Failed to open Jumping Clawd game', error);
    isGameOpen = false;
    currentGameMode = null;
    currentAutoPlayEnabled = false;
    setStatus(t('statusCantOpen'));
  } finally {
    pendingAction = null;
    renderGameControls();
  }
};

const handleExitGame = async () => {
  if (pendingAction !== null || !isGameOpen) {
    return;
  }

  pendingAction = 'exiting';
  renderGameControls();
  setStatus(t('statusClosing'));

  try {
    const state = await closeGameInActiveTab();
    isGameOpen = state.isOpen;
    currentGameMode = state.isOpen ? normalizeGameMode(state.mode) : null;
    currentAutoPlayEnabled = state.isOpen ? state.autoPlay === true : false;
    setStatus(state.state === 'already-closed' ? t('statusNotOpen') : t('statusExited'));
  } catch (error) {
    console.warn('Failed to close Jumping Clawd game', error);
    setStatus(t('statusCantExit'));
  } finally {
    pendingAction = null;
    renderGameControls();
  }
};

Object.entries(modeButtons).forEach(([mode, button]) => {
  button.addEventListener('click', () => {
    void handleStartGame(normalizeGameMode(mode));
  });
});

exitButton.addEventListener('click', () => {
  void handleExitGame();
});

backdropBlurSlider.addEventListener('input', handleBackdropBlurInput);

// Mascot event listeners
mascotToggle.addEventListener('click', () => {
  void handleMascotToggle();
});

mascotModeButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = normalizeMascotMode(btn.dataset.mode);
    if (mode !== currentMascotMode) {
      handleMascotModeChange(mode);
    }
  });
});

mascotSizeSlider.addEventListener('input', handleMascotSizeChange);

mascotQuietCheck.addEventListener('change', handleMascotSettingToggle);
mascotPowerSaveCheck.addEventListener('change', handleMascotSettingToggle);
mascotClickThroughCheck.addEventListener('change', handleMascotSettingToggle);

document.documentElement.lang = browser.i18n.getUILanguage();
applyPopupTranslations();
renderGameControls();
renderMascotControls();
void syncGameState();
void syncMascotState();
void loadMascotStoredSettings();
