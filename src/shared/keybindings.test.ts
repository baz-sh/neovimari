import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { KeySequenceResolver } from "./keybindings";
import { DEFAULT_SETTINGS } from "./settings-schema";

describe("KeySequenceResolver", () => {
  let resolver: KeySequenceResolver;

  beforeEach(() => {
    vi.useFakeTimers();
    resolver = new KeySequenceResolver(DEFAULT_SETTINGS.keyMappings);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resolves single-key mappings immediately", () => {
    const result = resolver.feed("j");
    expect(result).toEqual({ action: "scrollDown", type: "exact" });
  });

  it("resolves multi-key sequence gg", () => {
    const first = resolver.feed("g");
    expect(first).toEqual({ type: "prefix" });

    const second = resolver.feed("g");
    expect(second).toEqual({ action: "goToTop", type: "exact" });
  });

  it("returns none for unmapped keys", () => {
    const result = resolver.feed("z");
    expect(result).toEqual({ type: "none" });
  });

  it("handles failed prefix followed by valid key", () => {
    // "g" is a prefix, "q" is not a valid continuation
    const first = resolver.feed("g");
    expect(first).toEqual({ type: "prefix" });

    // "j" after failed "gj" should resolve to scrollDown
    const second = resolver.feed("j");
    expect(second).toEqual({ action: "scrollDown", type: "exact" });
  });

  it("resets buffer on exact match", () => {
    resolver.feed("j");
    expect(resolver.getBuffer()).toBe("");
  });

  it("clears buffer after timeout", () => {
    resolver.feed("g");
    expect(resolver.getBuffer()).toBe("g");

    vi.advanceTimersByTime(501);
    expect(resolver.getBuffer()).toBe("");
  });

  it("reset clears the buffer", () => {
    resolver.feed("g");
    resolver.reset();
    expect(resolver.getBuffer()).toBe("");
  });

  it("resolves uppercase keys correctly", () => {
    const result = resolver.feed("G");
    expect(result).toEqual({ action: "goToBottom", type: "exact" });
  });

  it("resolves slash for search", () => {
    const result = resolver.feed("/");
    expect(result).toEqual({ action: "search", type: "exact" });
  });

  it("updates mappings with setMappings", () => {
    const custom = { ...DEFAULT_SETTINGS.keyMappings, scrollDown: "s" };
    resolver.setMappings(custom);

    expect(resolver.feed("j")).toEqual({ type: "none" });
    expect(resolver.feed("s")).toEqual({ action: "scrollDown", type: "exact" });
  });
});
