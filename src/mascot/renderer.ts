import { type MascotSettings, type MascotVisualState, type PetLevel, type Point } from './types';
import { MASCOT_STYLES } from './styles';

/** SVG template for the Clawd character */
function createClawdSvg(settings: MascotSettings): string {
  return `
    <svg
      class="mascot-svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 274 178"
      focusable="false"
      width="${settings.size}"
      height="${Math.round(settings.size * (178 / 274))}"
    >
      <!-- Blush (hidden by default) -->
      <ellipse class="mascot-blush" cx="52" cy="82" rx="12" ry="6" fill="#fca5a5" opacity="0.5" />
      <ellipse class="mascot-blush" cx="222" cy="82" rx="12" ry="6" fill="#fca5a5" opacity="0.5" />

      <!-- Left arm -->
      <path d="M9.23 42.62H48.9V74.28H9.23V42.62Z" fill="#DA7756" />
      <!-- Right arm -->
      <path d="M224 42.62H264.17V74.28H224V42.62Z" fill="#DA7756" />
      <!-- Body -->
      <path d="M40.9 8.74H232.5V136.59H40.9V8.74Z" fill="#DA7756" />
      <!-- Feet -->
      <path d="M57.4 144.59H72.79V172.77H57.4V144.59Z" fill="#DA7756" />
      <path d="M89.29 144.59H105.05V172.77H89.29V144.59Z" fill="#DA7756" />
      <path d="M168.67 144.59H184.27V172.77H168.67V144.59Z" fill="#DA7756" />
      <path d="M200.04 144.59H215.22V172.77H200.04V144.59Z" fill="#DA7756" />
      <!-- Eyes (normal) -->
      <path class="mascot-eye" data-eye="left" d="M73.24 42.62h16.26v30.66h-16.26v-30.66z" fill="#000" />
      <path class="mascot-eye" data-eye="right" d="M183.9 42.62h16.26v30.66h-16.26v-30.66z" fill="#000" />
    </svg>
  `;
}

/** Heart particles HTML */
function createHeart(): string {
  return `<span class="mascot-heart" style="left:${Math.round(40 + Math.random() * 20)}%;top:${Math.round(30 + Math.random() * 20)}%">❤️</span>`;
}

/** Zzz indicator HTML */
function createZzz(): string {
  return `<span class="mascot-zzz" data-zzz>💤</span>`;
}

/** Food item HTML */
function createFood(): string {
  return `<span class="mascot-food" data-food>🍪</span>`;
}

/** Satiety bar HTML */
function createSatietyBar(): string {
  return `
    <div class="mascot-satiety" data-satiety>
      <div class="mascot-satiety-fill" data-satiety-fill style="width:100%"></div>
    </div>
  `;
}

/** Represents the Clawd mascot DOM */
export class MascotRenderer {
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private container: HTMLElement;
  private svg: SVGSVGElement | null = null;
  private eyes: Map<string, SVGPathElement> = new Map();
  private blush: SVGElement[] = [];
  private zzzEl: HTMLElement | null = null;
  private foodEl: HTMLElement | null = null;
  private satietyEl: HTMLElement | null = null;
  private satietyFillEl: HTMLElement | null = null;
  private currentSize: number;
  private currentOpacity: number;

  constructor(settings: MascotSettings) {
    this.currentSize = settings.size;
    this.currentOpacity = settings.opacity / 100;

    this.host = document.createElement('jumping-clawd-mascot');
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = MASCOT_STYLES;
    this.shadow.appendChild(style);

    // Container
    this.container = document.createElement('div');
    this.container.className = 'mascot-container';
    this.container.innerHTML = createClawdSvg(settings) + createZzz() + createFood() + createSatietyBar();
    this.shadow.appendChild(this.container);

    // Cache element references
    this.cacheElements();

    // Set initial size and position
    this.updateSize(settings.size);
    this.updateOpacity(settings.opacity);
    this.setPosition({ x: window.innerWidth / 2 - this.currentSize / 2, y: window.innerHeight / 2 });
    this.updateClickThrough(settings.clickThrough);

    // Append to document
    document.documentElement.appendChild(this.host);
  }

  private cacheElements(): void {
    this.svg = this.shadow.querySelector('.mascot-svg');
    const leftEye = this.shadow.querySelector('[data-eye="left"]');
    const rightEye = this.shadow.querySelector('[data-eye="right"]');
    if (leftEye instanceof SVGPathElement) this.eyes.set('left', leftEye);
    if (rightEye instanceof SVGPathElement) this.eyes.set('right', rightEye);
    this.blush = Array.from(this.shadow.querySelectorAll('.mascot-blush'));
    this.zzzEl = this.shadow.querySelector('[data-zzz]');
    this.foodEl = this.shadow.querySelector('[data-food]');
    this.satietyEl = this.shadow.querySelector('[data-satiety]');
    this.satietyFillEl = this.shadow.querySelector('[data-satiety-fill]');
  }

  /** Get the host element for positioning */
  getElement(): HTMLElement {
    return this.host;
  }

  /** Get the container for CSS class management */
  getContainer(): HTMLElement {
    return this.container;
  }

  /** Get SVG element */
  getSvg(): SVGSVGElement | null {
    return this.svg;
  }

  /** Set position (left/top) */
  setPosition(point: Point): void {
    this.host.style.left = `${Math.round(point.x)}px`;
    this.host.style.top = `${Math.round(point.y)}px`;
  }

  /** Get current position */
  getPosition(): Point {
    const left = Number.parseFloat(this.host.style.left) || 0;
    const top = Number.parseFloat(this.host.style.top) || 0;
    return { x: left, y: top };
  }

  /** Get mascot dimensions */
  getSize(): { width: number; height: number } {
    return {
      width: this.currentSize,
      height: Math.round(this.currentSize * (178 / 274)),
    };
  }

  /** Update display size */
  updateSize(size: number): void {
    this.currentSize = size;
    const height = Math.round(size * (178 / 274));
    this.host.style.width = `${size}px`;
    this.host.style.height = `${height}px`;
    if (this.svg) {
      this.svg.setAttribute('width', String(size));
      this.svg.setAttribute('height', String(height));
    }
  }

  /** Update opacity */
  updateOpacity(opacity: number): void {
    this.currentOpacity = opacity / 100;
    this.host.style.opacity = String(this.currentOpacity);
  }

  /** Update click-through mode */
  updateClickThrough(clickThrough: boolean): void {
    this.host.dataset.clickThrough = String(clickThrough);
  }

  /** Set visual state CSS class */
  setVisualState(state: MascotVisualState): void {
    this.container.className = 'mascot-container';
    if (state !== 'walking') {
      this.container.classList.add(state);
    } else {
      this.container.classList.add('walking');
    }
  }

  /** Update eye expression */
  setExpression(level: PetLevel): void {
    const leftEye = this.eyes.get('left');
    const rightEye = this.eyes.get('right');

    if (!leftEye || !rightEye) return;

    const clear = () => {
      leftEye.classList.remove('happy', 'love', 'closed', 'sleepy', 'wide');
      rightEye.classList.remove('happy', 'love', 'closed', 'sleepy', 'wide');
    };

    clear();

    switch (level) {
      case 'happy':
        leftEye.classList.add('happy');
        rightEye.classList.add('happy');
        break;
      case 'love':
        leftEye.classList.add('love');
        rightEye.classList.add('love');
        break;
      case 'ecstatic':
        leftEye.classList.add('wide');
        rightEye.classList.add('wide');
        break;
    }
  }

  /** Set sleepy eyes */
  setSleepyEyes(sleepy: boolean): void {
    const leftEye = this.eyes.get('left');
    const rightEye = this.eyes.get('right');
    if (!leftEye || !rightEye) return;
    leftEye.classList.toggle('sleepy', sleepy);
    rightEye.classList.toggle('sleepy', sleepy);
  }

  /** Show/hide blush */
  showBlush(show: boolean): void {
    this.blush.forEach((el) => el.classList.toggle('visible', show));
  }

  /** Show/hide Zzz */
  showZzz(show: boolean): void {
    if (this.zzzEl) {
      this.zzzEl.classList.toggle('visible', show);
    }
  }

  /** Play feed animation */
  playFeedAnimation(): void {
    if (!this.foodEl) return;
    this.foodEl.classList.remove('eating');
    // Force reflow
    void this.foodEl.offsetWidth;
    this.foodEl.classList.add('eating');
  }

  /** Spawn a heart particle */
  spawnHeart(): void {
    const heart = document.createElement('span');
    heart.className = 'mascot-heart';
    heart.textContent = '❤️';
    heart.style.left = `${30 + Math.random() * 40}%`;
    heart.style.top = `${20 + Math.random() * 30}%`;
    this.container.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  /** Update satiety bar */
  updateSatiety(value: number): void {
    if (!this.satietyEl || !this.satietyFillEl) return;
    const pct = Math.max(0, Math.min(100, value));
    this.satietyFillEl.style.width = `${pct}%`;
    this.satietyEl.classList.toggle('visible', pct < 100);
    if (this.satietyFillEl) {
      this.satietyFillEl.style.background = pct < 30 ? '#e11d48' : pct < 60 ? '#f97316' : '#16a34a';
    }
  }

  /** Show hungry indicator */
  showHungry(show: boolean): void {
    // Eyes get a bit bigger when hungry
    const leftEye = this.eyes.get('left');
    const rightEye = this.eyes.get('right');
    if (!leftEye || !rightEye) return;
    leftEye.classList.toggle('wide', show);
    rightEye.classList.toggle('wide', show);
  }

  /** Clamp position to viewport */
  clampToViewport(point: Point): Point {
    const size = this.getSize();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      x: Math.max(0, Math.min(point.x, vw - size.width)),
      y: Math.max(0, Math.min(point.y, vh - size.height)),
    };
  }

  /** Destroy the mascot element */
  destroy(): void {
    this.host.remove();
  }
}
