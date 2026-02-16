import { describe, it, expect, vi } from "vitest";
import { ModeManager } from "./mode-manager";
import { MODE } from "../shared/types";

describe("ModeManager", () => {
  it("starts in normal mode", () => {
    const mm = new ModeManager();
    expect(mm.getMode()).toBe(MODE.NORMAL);
    expect(mm.isNormal()).toBe(true);
  });

  it("switches mode", () => {
    const mm = new ModeManager();
    mm.setMode(MODE.INSERT);
    expect(mm.getMode()).toBe(MODE.INSERT);
    expect(mm.isInsert()).toBe(true);
    expect(mm.isNormal()).toBe(false);
  });

  it("fires listeners on mode change", () => {
    const mm = new ModeManager();
    const listener = vi.fn();
    mm.onModeChange(listener);
    mm.setMode(MODE.HINTS);
    expect(listener).toHaveBeenCalledWith(MODE.HINTS, MODE.NORMAL);
  });

  it("does not fire listener for same mode", () => {
    const mm = new ModeManager();
    const listener = vi.fn();
    mm.onModeChange(listener);
    mm.setMode(MODE.NORMAL);
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribe removes listener", () => {
    const mm = new ModeManager();
    const listener = vi.fn();
    const unsub = mm.onModeChange(listener);
    unsub();
    mm.setMode(MODE.INSERT);
    expect(listener).not.toHaveBeenCalled();
  });

  describe("isEditable", () => {
    it("returns true for text input", () => {
      const input = document.createElement("input");
      input.type = "text";
      expect(ModeManager.isEditable(input)).toBe(true);
    });

    it("returns true for textarea", () => {
      const textarea = document.createElement("textarea");
      expect(ModeManager.isEditable(textarea)).toBe(true);
    });

    it("returns true for contenteditable", () => {
      const div = document.createElement("div");
      div.setAttribute("contenteditable", "true");
      expect(ModeManager.isEditable(div)).toBe(true);
    });

    it("returns false for checkbox", () => {
      const input = document.createElement("input");
      input.type = "checkbox";
      expect(ModeManager.isEditable(input)).toBe(false);
    });

    it("returns false for button", () => {
      const button = document.createElement("button");
      expect(ModeManager.isEditable(button)).toBe(false);
    });

    it("returns false for null", () => {
      expect(ModeManager.isEditable(null)).toBe(false);
    });
  });
});
