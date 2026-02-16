import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateLabels, activateHints } from "./hints";
import { ModeManager } from "./mode-manager";
import { DEFAULT_SETTINGS } from "../shared/settings-schema";
import { MODE } from "../shared/types";

describe("generateLabels", () => {
  it("generates single-char labels when count fits charset", () => {
    const labels = generateLabels(3, "abcd");
    expect(labels).toEqual(["a", "b", "c"]);
  });

  it("generates exact charset-length labels", () => {
    const labels = generateLabels(4, "abcd");
    expect(labels).toEqual(["a", "b", "c", "d"]);
  });

  it("generates two-char labels when count exceeds charset", () => {
    const labels = generateLabels(10, "ab");
    expect(labels.length).toBe(4); // aa, ab, ba, bb
    expect(labels[0]).toBe("aa");
    expect(labels[1]).toBe("ab");
    expect(labels[2]).toBe("ba");
    expect(labels[3]).toBe("bb");
  });

  it("generates correct number of single-char labels", () => {
    const labels = generateLabels(3, "sad");
    expect(labels).toEqual(["s", "a", "d"]);
  });
});

describe("activateHints", () => {
  let modeManager: ModeManager;

  beforeEach(() => {
    modeManager = new ModeManager();
    // Clean up any shadow DOM from previous tests
    const existing = document.getElementById("neovimari-hints");
    if (existing) existing.remove();
  });

  it("sets mode to hints", () => {
    // Create a visible clickable element
    const link = document.createElement("a");
    link.href = "https://example.com";
    link.textContent = "Test";
    document.body.appendChild(link);

    // Mock getBoundingClientRect
    vi.spyOn(link, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 20,
      top: 50,
      left: 50,
      bottom: 70,
      right: 150,
      x: 50,
      y: 50,
      toJSON: () => {},
    });

    const session = activateHints(false, DEFAULT_SETTINGS, modeManager);
    expect(modeManager.getMode()).toBe(MODE.HINTS);
    session.cancel();
    link.remove();
  });

  it("cancel returns to normal mode", () => {
    const session = activateHints(false, DEFAULT_SETTINGS, modeManager);
    session.cancel();
    expect(modeManager.getMode()).toBe(MODE.NORMAL);
  });

  it("handleKey with Escape cancels", () => {
    const session = activateHints(false, DEFAULT_SETTINGS, modeManager);
    const handled = session.handleKey("Escape");
    expect(handled).toBe(true);
    expect(modeManager.getMode()).toBe(MODE.NORMAL);
  });
});
