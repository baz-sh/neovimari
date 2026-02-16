import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadSettings, saveSettings } from "./settings";
import { DEFAULT_SETTINGS } from "../shared/settings-schema";

describe("background/settings", () => {
  beforeEach(() => {
    vi.mocked(browser.storage.local.get).mockResolvedValue({});
    vi.mocked(browser.storage.local.set).mockResolvedValue(undefined);
    vi.mocked(browser.tabs.query).mockResolvedValue([]);
  });

  describe("loadSettings", () => {
    it("returns defaults when storage is empty", async () => {
      const settings = await loadSettings();
      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("returns stored settings", async () => {
      vi.mocked(browser.storage.local.get).mockResolvedValue({
        settings: { scrollStepSize: 120 },
      });
      const settings = await loadSettings();
      expect(settings.scrollStepSize).toBe(120);
    });
  });

  describe("saveSettings", () => {
    it("merges partial settings and persists", async () => {
      const result = await saveSettings({ scrollStepSize: 200 });
      expect(result.scrollStepSize).toBe(200);
      expect(result.smoothScroll).toBe(DEFAULT_SETTINGS.smoothScroll);
      expect(browser.storage.local.set).toHaveBeenCalledWith({
        settings: expect.objectContaining({ scrollStepSize: 200 }),
      });
    });
  });
});
