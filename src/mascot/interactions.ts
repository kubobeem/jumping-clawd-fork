import type { MascotSettings, Point } from './types';
import type { MascotRenderer } from './renderer';
import type { MascotBehaviorManager } from './behaviors';

type InteractionCallback = {
  onPet?: () => void;
  onFeed?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
};

/** Manages mouse interactions with the mascot */
export class MascotInteractionManager {
  private renderer: MascotRenderer;
  private behaviors: MascotBehaviorManager;
  private settings: MascotSettings;
  private callbacks: InteractionCallback;

  private isDragging = false;
  private isPetting = false;
  private dragOffset: Point = { x: 0, y: 0 };
  private clickStartTime = 0;
  private lastClickTime = 0;
  private clickCount = 0;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  private boundMouseDown: (e: MouseEvent) => void;
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: (e: MouseEvent) => void;
  private boundMouseMoveGlobal: (e: MouseEvent) => void;
  private boundClick: (e: MouseEvent) => void;
  private boundDblClick: (e: MouseEvent) => void;

  constructor(
    renderer: MascotRenderer,
    behaviors: MascotBehaviorManager,
    settings: MascotSettings,
    callbacks: InteractionCallback = {},
  ) {
    this.renderer = renderer;
    this.behaviors = behaviors;
    this.settings = { ...settings };
    this.callbacks = callbacks;

    // Bind handlers
    this.boundMouseDown = this.handleMouseDown.bind(this);
    this.boundMouseMove = this.handleMouseMove.bind(this);
    this.boundMouseUp = this.handleMouseUp.bind(this);
    this.boundMouseMoveGlobal = this.handleGlobalMouseMove.bind(this);
    this.boundClick = this.handleClick.bind(this);
    this.boundDblClick = this.handleDblClick.bind(this);
  }

  /** Attach event listeners */
  attach(): void {
    const el = this.renderer.getElement();
    el.addEventListener('mousedown', this.boundMouseDown);
    el.addEventListener('click', this.boundClick);
    el.addEventListener('dblclick', this.boundDblClick);
    document.addEventListener('mousemove', this.boundMouseMoveGlobal);
  }

  /** Detach event listeners */
  detach(): void {
    const el = this.renderer.getElement();
    el.removeEventListener('mousedown', this.boundMouseDown);
    el.removeEventListener('click', this.boundClick);
    el.removeEventListener('dblclick', this.boundDblClick);
    document.removeEventListener('mousemove', this.boundMouseMoveGlobal);
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    if (this.hoverTimer) clearTimeout(this.hoverTimer);
  }

  /** Update settings */
  updateSettings(settings: MascotSettings): void {
    this.settings = { ...settings };
    this.renderer.updateClickThrough(settings.clickThrough);
  }

  private handleMouseDown(e: MouseEvent): void {
    if (this.settings.clickThrough) return;

    e.preventDefault();
    e.stopPropagation();

    this.clickStartTime = performance.now();
    this.isDragging = true;
    const rect = this.renderer.getElement().getBoundingClientRect();
    this.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    this.renderer.getContainer().classList.add('dragging');
    this.callbacks.onDragStart?.();

    // Register for drag
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
  }

  private handleMouseMove(e: MouseEvent): void {
    // Update cursor position for behaviors
    this.behaviors.updateCursorPosition({ x: e.clientX, y: e.clientY });

    // Hover detection
    if (!this.hoverTimer) {
      this.behaviors.registerInteraction();
    } else {
      clearTimeout(this.hoverTimer);
    }
    this.hoverTimer = setTimeout(() => {
      this.hoverTimer = null;
    }, 200);

    // Check if near mascot for "looking" behavior
    const rect = this.renderer.getElement().getBoundingClientRect();
    const dist = Math.hypot(
      e.clientX - (rect.left + rect.width / 2),
      e.clientY - (rect.top + rect.height / 2),
    );
    if (dist < 100) {
      this.behaviors.registerInteraction();
    }
  }

  private handleGlobalMouseMove(e: MouseEvent): void {
    this.behaviors.updateCursorPosition({ x: e.clientX, y: e.clientY });

    // Petting detection
    if (this.isDragging && !this.isPetting) {
      const elapsed = performance.now() - this.clickStartTime;
      if (elapsed > 300) {
        // Switch to petting mode after holding for 300ms
        this.isPetting = true;
      }
    }

    if (this.isPetting) {
      // Gentle pet motion
      this.behaviors.handlePet();
      this.callbacks.onPet?.();
    }
  }

  private handleMouseUp(e: MouseEvent): void {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);

    if (this.isDragging) {
      this.renderer.getContainer().classList.remove('dragging');

      if (this.isPetting) {
        this.isPetting = false;
        this.callbacks.onDragEnd?.();
      } else {
        // It was a drag, not a pet
        this.callbacks.onDragEnd?.();
      }
    }

    this.isDragging = false;
    this.isPetting = false;
  }

  private handleClick(e: MouseEvent): void {
    if (this.settings.clickThrough) return;

    e.preventDefault();
    e.stopPropagation();

    const now = performance.now();

    // Detect double-click for feeding
    if (now - this.lastClickTime < 400) {
      this.clickCount++;
    } else {
      this.clickCount = 1;
    }
    this.lastClickTime = now;

    if (this.clickCount >= 2) {
      this.clickCount = 0;
      // Double-click = feed
      this.behaviors.handleFeed();
      this.callbacks.onFeed?.();
      return;
    }

    // Single click = jump
    this.behaviors.handleClick();
  }

  private handleDblClick(e: MouseEvent): void {
    if (this.settings.clickThrough) return;
    e.preventDefault();
    e.stopPropagation();
    // Feed on double click
    this.behaviors.handleFeed();
    this.callbacks.onFeed?.();
  }
}
