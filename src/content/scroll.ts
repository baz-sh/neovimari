import type { Settings } from "../shared/settings-schema";

// ---------------------------------------------------------------------------
// Custom rAF-based smooth scroll engine
//
// The native `scrollBy({ behavior: "smooth" })` breaks when called rapidly
// (e.g. holding j/k) because each call starts a new independent animation
// that collides with the previous one, causing visible stutter/bounce.
//
// This engine instead accumulates pending scroll deltas and runs a single
// animation loop. New deltas added while an animation is in-flight simply
// extend the remaining distance, giving a seamless, Safari-arrow-key feel.
// ---------------------------------------------------------------------------

/** Ease-out cubic: fast start, gentle deceleration */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface AnimationState {
  /** Total X distance the current animation should cover */
  totalDx: number;
  /** Total Y distance the current animation should cover */
  totalDy: number;
  /** X distance already applied (scrolled) so far */
  appliedDx: number;
  /** Y distance already applied (scrolled) so far */
  appliedDy: number;
  /** Timestamp when the animation started */
  startTime: number;
  /** Duration for this animation cycle in ms */
  duration: number;
  /** rAF handle so we can cancel if needed */
  frameId: number;
}

let animation: AnimationState | null = null;

function tick(now: number): void {
  if (!animation) return;

  const elapsed = now - animation.startTime;
  const progress = Math.min(elapsed / animation.duration, 1);
  const eased = easeOutCubic(progress);

  // How much of the total should have been applied by now
  const targetDx = animation.totalDx * eased;
  const targetDy = animation.totalDy * eased;

  // Apply only the difference since last frame
  const stepDx = targetDx - animation.appliedDx;
  const stepDy = targetDy - animation.appliedDy;

  if (Math.abs(stepDx) >= 0.5 || Math.abs(stepDy) >= 0.5) {
    window.scrollBy(stepDx, stepDy);
  }

  animation.appliedDx = targetDx;
  animation.appliedDy = targetDy;

  if (progress < 1) {
    animation.frameId = requestAnimationFrame(tick);
  } else {
    animation = null;
  }
}

/**
 * Smoothly scroll by (dx, dy) pixels over `duration` ms.
 * If an animation is already running, the new delta is merged in:
 * remaining distance is recalculated and the animation restarts from the
 * current position with the combined remaining + new distance.
 */
function smoothScroll(dx: number, dy: number, duration: number): void {
  if (animation) {
    // Merge: whatever distance is left from the current animation
    // plus the new delta becomes the new total to animate.
    const remainDx = animation.totalDx - animation.appliedDx;
    const remainDy = animation.totalDy - animation.appliedDy;

    cancelAnimationFrame(animation.frameId);

    animation.totalDx = remainDx + dx;
    animation.totalDy = remainDy + dy;
    animation.appliedDx = 0;
    animation.appliedDy = 0;
    animation.startTime = performance.now();
    animation.duration = duration;
    animation.frameId = requestAnimationFrame(tick);
  } else {
    animation = {
      totalDx: dx,
      totalDy: dy,
      appliedDx: 0,
      appliedDy: 0,
      startTime: performance.now(),
      duration,
      frameId: requestAnimationFrame(tick),
    };
  }
}

// ---------------------------------------------------------------------------
// Exported scroll actions
// ---------------------------------------------------------------------------

/**
 * Step-scroll (j/k/h/l): uses the custom engine when smooth is enabled
 * so that rapid/held keys merge into one fluid animation.
 */
function stepScroll(dx: number, dy: number, settings: Settings): void {
  if (settings.smoothScroll) {
    smoothScroll(dx, dy, settings.smoothScrollDuration);
  } else {
    window.scrollBy({ left: dx, top: dy, behavior: "instant" });
  }
}

/**
 * Page-scroll (d/u/gg/G): uses native smooth scroll. These are discrete
 * actions that aren't held/repeated rapidly, so native works fine.
 */
function pageScroll(dx: number, dy: number, smooth: boolean): void {
  window.scrollBy({
    left: dx,
    top: dy,
    behavior: smooth ? "smooth" : "instant",
  });
}

export function scrollDown(settings: Settings): void {
  stepScroll(0, settings.scrollStepSize, settings);
}

export function scrollUp(settings: Settings): void {
  stepScroll(0, -settings.scrollStepSize, settings);
}

export function scrollLeft(settings: Settings): void {
  stepScroll(-settings.scrollStepSize, 0, settings);
}

export function scrollRight(settings: Settings): void {
  stepScroll(settings.scrollStepSize, 0, settings);
}

export function halfPageDown(settings: Settings): void {
  const distance = window.innerHeight * settings.halfPageScroll;
  pageScroll(0, distance, settings.smoothScroll);
}

export function halfPageUp(settings: Settings): void {
  const distance = window.innerHeight * settings.halfPageScroll;
  pageScroll(0, -distance, settings.smoothScroll);
}

export function goToTop(settings: Settings): void {
  window.scrollTo({
    left: window.scrollX,
    top: 0,
    behavior: settings.smoothScroll ? "smooth" : "instant",
  });
}

export function goToBottom(settings: Settings): void {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({
    left: window.scrollX,
    top: maxScroll,
    behavior: settings.smoothScroll ? "smooth" : "instant",
  });
}

// Exposed for testing only
export const _test = {
  getAnimation: () => animation,
  resetAnimation: () => {
    if (animation) {
      cancelAnimationFrame(animation.frameId);
      animation = null;
    }
  },
};
