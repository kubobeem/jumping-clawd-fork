import { type MascotSettings, type MascotBehavior, type MascotVisualState, type Point, type Viewport } from './types';
import type { MascotRenderer } from './renderer';

/** Smooth movement towards a target */
function lerpPoint(current: Point, target: Point, speed: number): Point {
  return {
    x: current.x + (target.x - current.x) * speed,
    y: current.y + (target.y - current.y) * speed,
  };
}

/** Distance between two points */
function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Random point within viewport with padding */
function randomViewportPoint(viewport: Viewport, padding: number): Point {
  return {
    x: padding + Math.random() * (viewport.width - padding * 2),
    y: padding + Math.random() * (viewport.height - padding * 2),
  };
}

const FOLLOW_SPEED = 0.08;
const RANDOM_MOVE_SPEED = 0.03;
const EDGE_BOUNCE_SPEED = 0.06;
const EXPLORE_SPEED = 0.04;
const CURSOR_LEASH_DISTANCE = 80;
const CURSOR_FOLLOW_RANGE = 250;
const EDGE_PADDING = 10;
const EXPLORE_RADIUS = 60;
const IDLE_BEFORE_SLEEP_MS = 30000;
const IDLE_BEFORE_SIT_MS = 5000;
const HUNGER_RATE = 1; // per second
const HUNGRY_THRESHOLD = 30;

/** Manages mascot behavior state machine */
export class MascotBehaviorManager {
  private renderer: MascotRenderer;
  private settings: MascotSettings;
  private behavior: MascotBehavior = 'idle';
  private visualState: MascotVisualState = 'walking';
  private targetPoint: Point = { x: 0, y: 0 };
  private cursorPosition: Point = { x: 0, y: 0 };
  private lastInteractionTime = performance.now();
  private lastFrameTime = performance.now();
  private animationFrameId = 0;
  private running = false;

  // Random move state
  private moveTimer = 0;
  private movePauseTimer = 0;
  private isPausing = false;

  // Explore state
  private lastExploreTarget: Point | null = null;

  // Satiety drain timer
  private lastSatietyDrain = performance.now();

  constructor(renderer: MascotRenderer, settings: MascotSettings) {
    this.renderer = renderer;
    this.settings = { ...settings };
    this.targetPoint = renderer.getPosition();
  }

  /** Start behavior loop */
  start(): void {
    this.running = true;
    this.lastFrameTime = performance.now();
    this.lastInteractionTime = performance.now();
    this.lastSatietyDrain = performance.now();
    this.tick();
  }

  /** Stop behavior loop */
  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.animationFrameId);
  }

  /** Update settings */
  updateSettings(settings: MascotSettings): void {
    this.settings = { ...settings };
  }

  /** Get current visual state */
  getVisualState(): MascotVisualState {
    return this.visualState;
  }

  /** Get current satiety */
  getSatiety(): number {
    return this.settings.satiety;
  }

  /** Register interaction (resets idle timer) */
  registerInteraction(): void {
    this.lastInteractionTime = performance.now();
  }

  /** Update cursor position */
  updateCursorPosition(point: Point): void {
    this.cursorPosition = point;
  }

  /** Handle mouse click on mascot -> trigger jump */
  handleClick(): void {
    this.registerInteraction();
    this.renderer.getContainer().classList.remove('jumping');
    void this.renderer.getContainer().offsetWidth;
    this.renderer.getContainer().classList.add('jumping');
    this.visualState = 'walking';
  }

  /** Handle petting */
  handlePet(): void {
    this.registerInteraction();
    this.renderer.getContainer().classList.remove('petted');
    void this.renderer.getContainer().offsetWidth;
    this.renderer.getContainer().classList.add('petted');
    this.renderer.showBlush(true);
    this.renderer.spawnHeart();
    setTimeout(() => this.renderer.showBlush(false), 800);
  }

  /** Handle feeding */
  handleFeed(): void {
    this.registerInteraction();
    this.settings.satiety = Math.min(100, this.settings.satiety + 30);
    this.renderer.updateSatiety(this.settings.satiety);
    this.renderer.playFeedAnimation();
    this.renderer.spawnHeart();
    this.visualState = 'bouncing';
    setTimeout(() => {
      if (this.visualState === 'bouncing') this.visualState = 'walking';
    }, 1500);
  }

  /** Get viewport dimensions */
  private getViewport(): Viewport {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  /** Main game loop */
  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1); // cap delta at 100ms
    this.lastFrameTime = now;

    // Power save: reduce frame rate when idle
    const idleTime = now - this.lastInteractionTime;
    if (this.settings.powerSave && idleTime > 10000) {
      if (now - this.lastFrameTime < 100) {
        this.animationFrameId = requestAnimationFrame(this.tick);
        return; // skip frame (10fps in idle)
      }
    }

    // Drain satiety
    if (now - this.lastSatietyDrain >= 1000) {
      this.lastSatietyDrain = now;
      this.settings.satiety = Math.max(0, this.settings.satiety - HUNGER_RATE);
      this.renderer.updateSatiety(this.settings.satiety);
      if (this.settings.satiety <= HUNGRY_THRESHOLD) {
        this.renderer.showHungry(true);
      } else {
        this.renderer.showHungry(false);
      }
    }

    // Determine behavior based on mode and context
    this.updateBehavior(now);

    // Execute behavior
    this.executeBehavior(now, dt);

    // Update visual state
    this.updateVisualState(now, idleTime);

    // Render visual state
    this.renderer.setVisualState(this.visualState);
    this.renderer.setPosition(
      this.renderer.clampToViewport(this.renderer.getPosition()),
    );

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  /** Choose which behavior to activate */
  private updateBehavior(now: number): void {
    const pos = this.renderer.getPosition();
    const viewport = this.getViewport();
    const cursorDist = distance(pos, this.cursorPosition);
    const edgeDist = Math.min(
      pos.x,
      viewport.width - pos.x - this.renderer.getSize().width,
      pos.y,
      viewport.height - pos.y - this.renderer.getSize().height,
    );

    // Priority: cursor following > edge bouncing > exploring > random

    if (this.settings.quietMode && this.behavior !== 'idle') {
      this.behavior = 'idle';
      return;
    }

    if (cursorDist < CURSOR_FOLLOW_RANGE) {
      this.behavior = 'cursor-following';
      return;
    }

    if (edgeDist < EDGE_PADDING) {
      this.behavior = 'edge-bouncing';
      return;
    }

    if (this.settings.mode === 'web-page' && Math.random() < 0.005) {
      this.behavior = 'exploring';
      return;
    }

    if (this.behavior === 'exploring') {
      // Finish exploring after reaching target
      const dist = distance(pos, this.targetPoint);
      if (dist < 5) {
        this.behavior = 'random-moving';
        this.isPausing = true;
        this.movePauseTimer = 2000 + Math.random() * 3000;
      }
      return;
    }

    // Default to random if currently idle or exploring finished
    if (this.behavior === 'idle' || Math.random() < 0.002) {
      this.behavior = 'random-moving';
      this.isPausing = false;
    }
  }

  /** Execute the current behavior */
  private executeBehavior(now: number, dt: number): void {
    const pos = this.renderer.getPosition();

    switch (this.behavior) {
      case 'cursor-following': {
        const cursorDist = distance(pos, this.cursorPosition);
        if (cursorDist > CURSOR_LEASH_DISTANCE) {
          // Follow with smooth lerp
          const newPos = lerpPoint(pos, this.cursorPosition, FOLLOW_SPEED);
          this.renderer.setPosition(newPos);
        }
        break;
      }

      case 'random-moving': {
        if (this.isPausing) {
          this.movePauseTimer -= dt * 1000;
          if (this.movePauseTimer <= 0) {
            this.isPausing = false;
            this.targetPoint = randomViewportPoint(this.getViewport(), 40);
          }
        } else {
          const dist = distance(pos, this.targetPoint);
          if (dist > 5) {
            const newPos = lerpPoint(pos, this.targetPoint, RANDOM_MOVE_SPEED);
            this.renderer.setPosition(newPos);
          } else {
            this.isPausing = true;
            this.movePauseTimer = 1000 + Math.random() * 3000;
          }
        }
        break;
      }

      case 'edge-bouncing': {
        const viewport = this.getViewport();
        const size = this.renderer.getSize();
        const bounce = EDGE_BOUNCE_SPEED;

        // Steer away from edges
        let dx = 0, dy = 0;
        if (pos.x < EDGE_PADDING) dx = 1;
        if (pos.x > viewport.width - size.width - EDGE_PADDING) dx = -1;
        if (pos.y < EDGE_PADDING) dy = 1;
        if (pos.y > viewport.height - size.height - EDGE_PADDING) dy = -1;

        // Move toward center
        const centerX = viewport.width / 2 - size.width / 2;
        const centerY = viewport.height / 2 - size.height / 2;
        const toCenter = distance(pos, { x: centerX, y: centerY });
        if (toCenter > 10) {
          const steerX = (centerX - pos.x) * bounce * 0.03;
          const steerY = (centerY - pos.y) * bounce * 0.03;
          dx += steerX;
          dy += steerY;
        }

        // Normalize and apply
        const len = Math.max(1, Math.abs(dx) + Math.abs(dy));
        const newPos = {
          x: pos.x + (dx / len) * bounce * 60,
          y: pos.y + (dy / len) * bounce * 60,
        };
        this.renderer.setPosition(newPos);
        break;
      }

      case 'exploring': {
        if (!this.lastExploreTarget) {
          // Look for interesting elements near current position
          const exploreTarget = this.findExploreTarget(pos);
          if (exploreTarget) {
            this.lastExploreTarget = exploreTarget;
            this.targetPoint = exploreTarget;
          } else {
            this.targetPoint = randomViewportPoint(this.getViewport(), 40);
          }
        }

        const dist = distance(pos, this.targetPoint);
        if (dist > 5) {
          const newPos = lerpPoint(pos, this.targetPoint, EXPLORE_SPEED);
          this.renderer.setPosition(newPos);
        } else {
          this.lastExploreTarget = null;
          this.behavior = 'idle';
          this.movePauseTimer = 2000 + Math.random() * 2000;
        }
        break;
      }

      case 'idle':
      default:
        // Don't move
        break;
    }
  }

  /** Find an interesting element to explore near a point */
  private findExploreTarget(origin: Point): Point | null {
    const elements = document.elementsFromPoint(origin.x, origin.y);
    for (const el of elements) {
      if (el === this.renderer.getElement()) continue;
      if (el instanceof HTMLElement || el instanceof SVGElement) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Pick a random point within this element
          return {
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * rect.height,
          };
        }
      }
    }
    return null;
  }

  /** Update visual state based on context and idle time */
  private updateVisualState(now: number, idleTime: number): void {
    if (this.visualState === 'bouncing' || this.visualState === 'petted') {
      // Don't override special states
      return;
    }

    if (idleTime > IDLE_BEFORE_SLEEP_MS) {
      this.visualState = 'sleeping';
      this.renderer.setSleepyEyes(true);
      this.renderer.showZzz(true);
    } else if (idleTime > IDLE_BEFORE_SIT_MS) {
      this.visualState = 'sitting';
      this.renderer.setSleepyEyes(false);
      this.renderer.showZzz(false);
    } else if (this.behavior === 'cursor-following') {
      this.visualState = 'looking';
      this.renderer.setSleepyEyes(false);
      this.renderer.showZzz(false);
    } else if (this.behavior === 'edge-bouncing') {
      this.visualState = 'bouncing';
      this.renderer.setSleepyEyes(false);
      this.renderer.showZzz(false);
    } else {
      this.visualState = 'walking';
      this.renderer.setSleepyEyes(false);
      this.renderer.showZzz(false);
    }

    if (this.settings.satiety <= HUNGRY_THRESHOLD && this.visualState !== 'sleeping') {
      this.visualState = 'hungry';
    }
  }
}
