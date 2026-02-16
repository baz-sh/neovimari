import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  scrollDown,
  scrollUp,
  scrollLeft,
  scrollRight,
  halfPageDown,
  halfPageUp,
  goToTop,
  goToBottom,
  _test,
} from "./scroll";
import { DEFAULT_SETTINGS } from "../shared/settings-schema";

describe("scroll", () => {
  beforeEach(() => {
    vi.spyOn(window, "scrollBy").mockImplementation(() => {});
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    _test.resetAnimation();
  });

  afterEach(() => {
    _test.resetAnimation();
  });

  const instantSettings = {
    ...DEFAULT_SETTINGS,
    smoothScroll: false,
  };

  // -----------------------------------------------------------------------
  // Instant scroll (smoothScroll: false) — uses window.scrollBy directly
  // -----------------------------------------------------------------------

  it("scrollDown scrolls by scrollStepSize (instant)", () => {
    scrollDown(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: DEFAULT_SETTINGS.scrollStepSize,
      behavior: "instant",
    });
  });

  it("scrollUp scrolls by negative scrollStepSize (instant)", () => {
    scrollUp(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: -DEFAULT_SETTINGS.scrollStepSize,
      behavior: "instant",
    });
  });

  it("scrollLeft scrolls by negative scrollStepSize (instant)", () => {
    scrollLeft(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: -DEFAULT_SETTINGS.scrollStepSize,
      top: 0,
      behavior: "instant",
    });
  });

  it("scrollRight scrolls by scrollStepSize (instant)", () => {
    scrollRight(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: DEFAULT_SETTINGS.scrollStepSize,
      top: 0,
      behavior: "instant",
    });
  });

  it("respects custom scrollStepSize (instant)", () => {
    const custom = { ...instantSettings, scrollStepSize: 120 };
    scrollDown(custom);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: 120,
      behavior: "instant",
    });
  });

  // -----------------------------------------------------------------------
  // Smooth scroll (smoothScroll: true) — uses custom rAF engine
  // -----------------------------------------------------------------------

  it("scrollDown uses rAF engine when smoothScroll is true", () => {
    scrollDown(DEFAULT_SETTINGS);
    // Should NOT call window.scrollBy synchronously with behavior:"smooth"
    // Instead, it starts a rAF animation
    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    expect(anim!.totalDy).toBe(DEFAULT_SETTINGS.scrollStepSize);
    expect(anim!.totalDx).toBe(0);
  });

  it("scrollUp uses rAF engine when smoothScroll is true", () => {
    scrollUp(DEFAULT_SETTINGS);
    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    expect(anim!.totalDy).toBe(-DEFAULT_SETTINGS.scrollStepSize);
  });

  it("scrollLeft uses rAF engine when smoothScroll is true", () => {
    scrollLeft(DEFAULT_SETTINGS);
    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    expect(anim!.totalDx).toBe(-DEFAULT_SETTINGS.scrollStepSize);
    expect(anim!.totalDy).toBe(0);
  });

  it("scrollRight uses rAF engine when smoothScroll is true", () => {
    scrollRight(DEFAULT_SETTINGS);
    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    expect(anim!.totalDx).toBe(DEFAULT_SETTINGS.scrollStepSize);
  });

  it("rapid scroll calls merge deltas in rAF engine", () => {
    // Simulate holding j — multiple scrollDown calls before animation finishes
    scrollDown(DEFAULT_SETTINGS);
    scrollDown(DEFAULT_SETTINGS);
    scrollDown(DEFAULT_SETTINGS);

    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    // The animation should have merged: remaining from first two + third
    // Since no frames have run, appliedDy is 0 for each merge cycle,
    // so total accumulates as stepSize * 3
    expect(anim!.totalDy).toBe(DEFAULT_SETTINGS.scrollStepSize * 3);
  });

  it("uses smoothScrollDuration setting for animation duration", () => {
    const custom = { ...DEFAULT_SETTINGS, smoothScrollDuration: 300 };
    scrollDown(custom);
    const anim = _test.getAnimation();
    expect(anim).not.toBeNull();
    expect(anim!.duration).toBe(300);
  });

  // -----------------------------------------------------------------------
  // Half-page scroll — always uses native scrollBy (not the rAF engine)
  // -----------------------------------------------------------------------

  it("halfPageDown scrolls by half viewport", () => {
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
    halfPageDown(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: 400,
      behavior: "instant",
    });
  });

  it("halfPageUp scrolls by negative half viewport", () => {
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
    halfPageUp(instantSettings);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: -400,
      behavior: "instant",
    });
  });

  it("halfPage uses smooth behavior when smoothScroll is true", () => {
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
    halfPageDown(DEFAULT_SETTINGS);
    expect(window.scrollBy).toHaveBeenCalledWith({
      left: 0,
      top: 400,
      behavior: "smooth",
    });
  });

  // -----------------------------------------------------------------------
  // goToTop / goToBottom — always uses native scrollTo
  // -----------------------------------------------------------------------

  it("goToTop scrolls to y=0", () => {
    Object.defineProperty(window, "scrollX", { value: 0, writable: true });
    Object.defineProperty(window, "scrollY", { value: 500, writable: true });
    goToTop(instantSettings);
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 0,
      behavior: "instant",
    });
  });

  it("goToBottom scrolls to max scroll", () => {
    Object.defineProperty(window, "scrollX", { value: 0, writable: true });
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 3000,
      writable: true,
      configurable: true,
    });
    goToBottom(instantSettings);
    expect(window.scrollTo).toHaveBeenCalledWith({
      left: 0,
      top: 2200,
      behavior: "instant",
    });
  });
});
