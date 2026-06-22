/** CSS styles injected into the mascot Shadow DOM */
export const MASCOT_STYLES = `
  :host {
    all: initial;
    position: fixed;
    z-index: 2147483646;
    pointer-events: auto;
    transition: opacity 0.3s ease;
    will-change: left, top, transform;
  }

  :host([hidden]) {
    display: none;
  }

  :host([data-click-through="true"]) {
    pointer-events: none;
  }

  .mascot-container {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: grab;
    user-select: none;
    touch-action: none;
  }

  .mascot-container:active {
    cursor: grabbing;
  }

  .mascot-svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  /* Eye expressions */
  .mascot-eye {
    transition: d 0.15s ease, transform 0.15s ease;
  }

.mascot-eye.happy {
    display: none;
  }

  .mascot-eye.love {
    fill: #e11d48 !important;
  }

  .mascot-eye.closed {
    display: none;
  }

  .mascot-eye.sleepy {
    display: none;
  }

  .mascot-eye.wide {
    transform: scale(1.25);
    transform-origin: center;
  }

  /* Blush effect when petted */
  .mascot-blush {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .mascot-blush.visible {
    opacity: 1;
  }

  /* Zzz sleep indicator */
  .mascot-zzz {
    position: absolute;
    top: -20px;
    right: -10px;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    opacity: 0;
    animation: zzz-float 2s ease-in-out infinite;
    pointer-events: none;
  }

  .mascot-zzz.visible {
    opacity: 1;
  }

  /* Food item */
  .mascot-food {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s ease;
  }

  .mascot-food.eating {
    opacity: 1;
    transform: translateX(-50%) translateY(-10px);
    animation: food-eat 0.6s ease-in-out;
  }

  /* Heart particles */
  .mascot-heart {
    position: absolute;
    font-size: 12px;
    pointer-events: none;
    animation: heart-float 1s ease-out forwards;
    opacity: 0;
  }

  /* Satiety bar */
  .mascot-satiety {
    position: absolute;
    bottom: -6px;
    left: 10%;
    width: 80%;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .mascot-satiety.visible {
    opacity: 1;
  }

  .mascot-satiety-fill {
    height: 100%;
    background: #16a34a;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* Animations */
  @keyframes zzz-float {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
    50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
  }

  @keyframes food-eat {
    0% { transform: translateX(-50%) translateY(0) scale(0.5); opacity: 0; }
    30% { opacity: 1; transform: translateX(-50%) translateY(-10px) scale(1); }
    70% { opacity: 1; transform: translateX(-50%) translateY(-12px) scale(0.9); }
    100% { transform: translateX(-50%) translateY(-20px) scale(0.3); opacity: 0; }
  }

  @keyframes heart-float {
    0% { transform: translateY(0) scale(0.5); opacity: 0; }
    20% { opacity: 1; transform: translateY(-5px) scale(1); }
    100% { transform: translateY(-30px) scale(0.3); opacity: 0; }
  }

  /* Walk animation wiggle */
  @keyframes walk-wiggle {
    0%, 100% { transform: rotate(-2deg); }
    50% { transform: rotate(2deg); }
  }

  @keyframes bounce-up {
    0% { transform: translateY(0) scaleY(1); }
    30% { transform: translateY(-8px) scaleY(0.95); }
    50% { transform: translateY(-10px) scaleY(1); }
    80% { transform: translateY(-3px); }
    100% { transform: translateY(0); }
  }

  .mascot-container.walking .mascot-svg {
    animation: walk-wiggle 0.4s ease-in-out infinite;
  }

  .mascot-container.bouncing .mascot-svg {
    animation: bounce-up 0.5s ease-in-out infinite;
  }

  /* Sleep breathing */
  @keyframes sleep-breathe {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.04); }
  }

  .mascot-container.sleeping .mascot-svg {
    animation: sleep-breathe 3s ease-in-out infinite;
  }

  /* Sit idle */
  .mascot-container.sitting .mascot-svg {
    transform: scaleY(0.92);
    transition: transform 0.3s ease;
  }

  /* Looking - slight tilt toward cursor */
  .mascot-container.looking .mascot-svg {
    transition: transform 0.2s ease;
  }

  /* Pet squash effect */
  .mascot-container.petted .mascot-svg {
    animation: pet-squish 0.3s ease;
  }

  @keyframes pet-squish {
    0% { transform: scaleX(1) scaleY(1); }
    30% { transform: scaleX(1.06) scaleY(0.92); }
    60% { transform: scaleX(0.97) scaleY(1.04); }
    100% { transform: scaleX(1) scaleY(1); }
  }

  /* Jump on click */
  .mascot-container.jumping .mascot-svg {
    animation: jump-up 0.4s ease-out;
  }

  @keyframes jump-up {
    0% { transform: translateY(0) scaleY(1); }
    20% { transform: translateY(0) scaleX(1.08) scaleY(0.88); }
    50% { transform: translateY(-20px) scaleY(1.05); }
    80% { transform: translateY(-5px); }
    100% { transform: translateY(0); }
  }
`;
