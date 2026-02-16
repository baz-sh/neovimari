import { describe, it, expect } from "vitest";
import {
  validateSettings,
  DEFAULT_SETTINGS,
} from "./settings-schema";

describe("validateSettings", () => {
  it("returns defaults for null input", () => {
    expect(validateSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults for non-object input", () => {
    expect(validateSettings("string")).toEqual(DEFAULT_SETTINGS);
    expect(validateSettings(42)).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults for empty object", () => {
    expect(validateSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it("accepts valid overrides", () => {
    const result = validateSettings({
      scrollStepSize: 120,
      smoothScroll: false,
    });
    expect(result.scrollStepSize).toBe(120);
    expect(result.smoothScroll).toBe(false);
    expect(result.halfPageScroll).toBe(DEFAULT_SETTINGS.halfPageScroll);
  });

  it("rejects invalid scrollStepSize", () => {
    expect(validateSettings({ scrollStepSize: -10 }).scrollStepSize).toBe(
      DEFAULT_SETTINGS.scrollStepSize,
    );
    expect(validateSettings({ scrollStepSize: 0 }).scrollStepSize).toBe(
      DEFAULT_SETTINGS.scrollStepSize,
    );
    expect(
      validateSettings({ scrollStepSize: "not a number" }).scrollStepSize,
    ).toBe(DEFAULT_SETTINGS.scrollStepSize);
  });

  it("rejects invalid halfPageScroll", () => {
    expect(validateSettings({ halfPageScroll: 0 }).halfPageScroll).toBe(
      DEFAULT_SETTINGS.halfPageScroll,
    );
    expect(validateSettings({ halfPageScroll: 1.5 }).halfPageScroll).toBe(
      DEFAULT_SETTINGS.halfPageScroll,
    );
  });

  it("merges partial keyMappings", () => {
    const result = validateSettings({
      keyMappings: { scrollDown: "s" },
    });
    expect(result.keyMappings.scrollDown).toBe("s");
    expect(result.keyMappings.scrollUp).toBe("k");
  });

  it("filters non-string excludedUrls", () => {
    const result = validateSettings({
      excludedUrls: ["https://example.com", 42, null, "https://test.com"],
    });
    expect(result.excludedUrls).toEqual([
      "https://example.com",
      "https://test.com",
    ]);
  });

  it("rejects hintCharacters with fewer than 2 chars", () => {
    expect(validateSettings({ hintCharacters: "a" }).hintCharacters).toBe(
      DEFAULT_SETTINGS.hintCharacters,
    );
    expect(validateSettings({ hintCharacters: "" }).hintCharacters).toBe(
      DEFAULT_SETTINGS.hintCharacters,
    );
  });
});
