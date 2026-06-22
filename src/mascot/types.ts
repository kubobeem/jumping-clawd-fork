/** Mascot operational mode */
export type MascotMode = 'web-page' | 'browser-ui' | 'random';

/** Current active behavior */
export type MascotBehavior =
  | 'idle'
  | 'cursor-following'
  | 'random-moving'
  | 'edge-bouncing'
  | 'exploring'
  | 'jumping';

/** Visual state of the character */
export type MascotVisualState =
  | 'walking'
  | 'bouncing'
  | 'sitting'
  | 'sleeping'
  | 'looking'
  | 'petted'
  | 'fed'
  | 'hungry';

/** Petting reaction level */
export type PetLevel = 'none' | 'happy' | 'love' | 'ecstatic';

/** Default mascot settings */
export const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  enabled: false,
  mode: 'random',
  size: 48,
  opacity: 100,
  quietMode: false,
  powerSave: true,
  clickThrough: false,
  satiety: 100,
};

export type MascotSettings = {
  enabled: boolean;
  mode: MascotMode;
  size: number;
  opacity: number;
  quietMode: boolean;
  powerSave: boolean;
  clickThrough: boolean;
  satiety: number;
};

export const MASCOT_SIZE_MIN = 16;
export const MASCOT_SIZE_MAX = 128;
export const MASCOT_SIZE_DEFAULT = 48;

// Storage keys
export const MASCOT_STORAGE_KEY = 'jumping-clawd:mascot-settings';

// Message types
export const MASCOT_OPEN_MESSAGE = 'jumping-clawd:mascot-open';
export const MASCOT_CLOSE_MESSAGE = 'jumping-clawd:mascot-close';
export const MASCOT_SETTINGS_MESSAGE = 'jumping-clawd:mascot-settings';
export const MASCOT_STATE_MESSAGE = 'jumping-clawd:mascot-state';
export const MASCOT_GET_STATE_MESSAGE = 'jumping-clawd:mascot-get-state';
export const MASCOT_PET_MESSAGE = 'jumping-clawd:mascot-pet';

export type MascotOpenMessage = {
  type: typeof MASCOT_OPEN_MESSAGE;
  settings: MascotSettings;
};

export type MascotCloseMessage = {
  type: typeof MASCOT_CLOSE_MESSAGE;
};

export type MascotSettingsMessage = {
  type: typeof MASCOT_SETTINGS_MESSAGE;
  settings: Partial<MascotSettings>;
};

export type MascotGetStateMessage = {
  type: typeof MASCOT_GET_STATE_MESSAGE;
};

export type MascotStateMessage = {
  type: typeof MASCOT_STATE_MESSAGE;
  isOpen: boolean;
  mode: MascotMode | null;
  visualState: MascotVisualState | null;
  satiety: number;
};

export type MascotPetMessage = {
  type: typeof MASCOT_PET_MESSAGE;
  action: 'pet' | 'feed' | 'drag-start' | 'drag-end';
};

export type MascotRuntimeMessage =
  | MascotOpenMessage
  | MascotCloseMessage
  | MascotSettingsMessage
  | MascotGetStateMessage;

/** Point in viewport coordinates */
export type Point = { x: number; y: number };

/** Viewport dimensions */
export type Viewport = { width: number; height: number };
