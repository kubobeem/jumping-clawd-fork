import { browser } from 'wxt/browser';
import {
  type MascotSettings,
  type MascotStateMessage,
  MASCOT_OPEN_MESSAGE,
  MASCOT_CLOSE_MESSAGE,
  MASCOT_SETTINGS_MESSAGE,
  MASCOT_GET_STATE_MESSAGE,
  DEFAULT_MASCOT_SETTINGS,
} from '../mascot/types';

// Use the same pattern as open-game.ts for WXT ScriptPublicPath
const MASCOT_CONTENT_SCRIPT_PUBLIC_FILE = '/mascot-content.js';
const MASCOT_CONTENT_SCRIPT_INJECTION_FILE =
  MASCOT_CONTENT_SCRIPT_PUBLIC_FILE.slice(1) as typeof MASCOT_CONTENT_SCRIPT_PUBLIC_FILE;

function isMissingReceiverError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Could not establish connection') ||
    message.includes('Receiving end does not exist')
  );
}

/** Send a message to the mascot content script in a tab */
async function sendMascotMessage<T>(tabId: number, message: unknown): Promise<T> {
  return browser.tabs.sendMessage(tabId, message) as Promise<T>;
}

/** Inject the mascot content script into a tab */
async function injectMascotScript(tabId: number): Promise<void> {
  if (!browser.scripting?.executeScript) {
    throw new Error('Scripting API is unavailable');
  }
  await browser.scripting.executeScript({
    target: { tabId },
    files: [MASCOT_CONTENT_SCRIPT_INJECTION_FILE],
  });
}

/** Try to send a message, injecting the script if needed */
async function trySendWithInject<T>(
  tabId: number,
  message: unknown,
  maxRetries = 2,
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await sendMascotMessage<T>(tabId, message);
    } catch (error) {
      if (!isMissingReceiverError(error) || attempt >= maxRetries - 1) {
        throw error;
      }
      await injectMascotScript(tabId);
    }
  }
  throw new Error('Failed to communicate with mascot content script');
}

/** Open mascot in a specific tab */
export async function openMascotInTab(
  tabId: number,
  settings: MascotSettings = DEFAULT_MASCOT_SETTINGS,
): Promise<MascotStateMessage> {
  return trySendWithInject<MascotStateMessage>(tabId, {
    type: MASCOT_OPEN_MESSAGE,
    settings,
  });
}

/** Close mascot in a specific tab */
export async function closeMascotInTab(tabId: number): Promise<MascotStateMessage> {
  return trySendWithInject<MascotStateMessage>(tabId, {
    type: MASCOT_CLOSE_MESSAGE,
  });
}

/** Update mascot settings in a specific tab */
export async function updateMascotSettingsInTab(
  tabId: number,
  settings: Partial<MascotSettings>,
): Promise<MascotStateMessage> {
  return trySendWithInject<MascotStateMessage>(tabId, {
    type: MASCOT_SETTINGS_MESSAGE,
    settings,
  });
}

/** Get mascot state in a specific tab */
export async function getMascotStateInTab(tabId: number): Promise<MascotStateMessage> {
  return trySendWithInject<MascotStateMessage>(tabId, {
    type: MASCOT_GET_STATE_MESSAGE,
  });
}

/** Open mascot in the active tab */
export async function openMascotInActiveTab(
  settings: MascotSettings = DEFAULT_MASCOT_SETTINGS,
): Promise<MascotStateMessage> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (activeTab?.id == null) {
    throw new Error('No active tab found');
  }
  return openMascotInTab(activeTab.id, settings);
}

/** Close mascot in the active tab */
export async function closeMascotInActiveTab(): Promise<MascotStateMessage> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (activeTab?.id == null) {
    throw new Error('No active tab found');
  }
  return closeMascotInTab(activeTab.id);
}

/** Get mascot state in the active tab */
export async function getMascotStateInActiveTab(): Promise<MascotStateMessage> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (activeTab?.id == null) {
    throw new Error('No active tab found');
  }
  return getMascotStateInTab(activeTab.id);
}

/** Update mascot settings in the active tab */
export async function updateMascotSettingsInActiveTab(
  settings: Partial<MascotSettings>,
): Promise<MascotStateMessage> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (activeTab?.id == null) {
    throw new Error('No active tab found');
  }
  return updateMascotSettingsInTab(activeTab.id, settings);
}
