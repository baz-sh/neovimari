import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  closeTab,
  restoreTab,
  newTab,
  duplicateTab,
  nextTab,
  prevTab,
  initTabTracking,
} from "./tab-commands";

describe("tab-commands", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.mocked(browser.storage.session.get).mockResolvedValue({});
    vi.mocked(browser.storage.session.set).mockResolvedValue(undefined);
    vi.mocked(browser.tabs.remove).mockResolvedValue(undefined);
    vi.mocked(browser.tabs.create).mockResolvedValue({
      id: 99,
      index: 0,
      windowId: 1,
    });
    vi.mocked(browser.tabs.duplicate).mockResolvedValue({
      id: 100,
      index: 1,
      windowId: 1,
    });
    vi.mocked(browser.tabs.update).mockResolvedValue({
      id: 1,
      index: 0,
      windowId: 1,
    });
    vi.mocked(browser.tabs.query).mockResolvedValue([]);
    // Re-initialize to reset the in-memory closed tabs stack
    await initTabTracking();
  });

  describe("closeTab", () => {
    it("removes the sender tab", async () => {
      await closeTab({
        tab: { id: 5, url: "https://example.com", index: 0, windowId: 1 },
      });
      expect(browser.tabs.remove).toHaveBeenCalledWith(5);
    });

    it("does nothing if sender has no tab", async () => {
      await closeTab({});
      expect(browser.tabs.remove).not.toHaveBeenCalled();
    });
  });

  describe("restoreTab", () => {
    it("opens last closed URL", async () => {
      await closeTab({
        tab: { id: 5, url: "https://example.com", index: 0, windowId: 1 },
      });
      await restoreTab();
      expect(browser.tabs.create).toHaveBeenCalledWith({
        url: "https://example.com",
        active: true,
      });
    });

    it("does nothing when no closed tabs", async () => {
      vi.mocked(browser.tabs.create).mockClear();
      await restoreTab();
      expect(browser.tabs.create).not.toHaveBeenCalled();
    });
  });

  describe("newTab", () => {
    it("creates a new active tab", async () => {
      await newTab();
      expect(browser.tabs.create).toHaveBeenCalledWith({ active: true });
    });
  });

  describe("duplicateTab", () => {
    it("duplicates the sender tab", async () => {
      await duplicateTab({
        tab: { id: 7, index: 0, windowId: 1 },
      });
      expect(browser.tabs.duplicate).toHaveBeenCalledWith(7);
    });
  });

  describe("nextTab", () => {
    it("activates the next tab wrapping around", async () => {
      vi.mocked(browser.tabs.query).mockResolvedValue([
        { id: 1, index: 0, windowId: 1 },
        { id: 2, index: 1, windowId: 1 },
        { id: 3, index: 2, windowId: 1 },
      ]);
      await nextTab({ tab: { id: 2, index: 1, windowId: 1 } });
      expect(browser.tabs.update).toHaveBeenCalledWith(3, { active: true });
    });

    it("wraps to first tab", async () => {
      vi.mocked(browser.tabs.query).mockResolvedValue([
        { id: 1, index: 0, windowId: 1 },
        { id: 2, index: 1, windowId: 1 },
      ]);
      await nextTab({ tab: { id: 2, index: 1, windowId: 1 } });
      expect(browser.tabs.update).toHaveBeenCalledWith(1, { active: true });
    });
  });

  describe("prevTab", () => {
    it("activates the previous tab", async () => {
      vi.mocked(browser.tabs.query).mockResolvedValue([
        { id: 1, index: 0, windowId: 1 },
        { id: 2, index: 1, windowId: 1 },
        { id: 3, index: 2, windowId: 1 },
      ]);
      await prevTab({ tab: { id: 2, index: 1, windowId: 1 } });
      expect(browser.tabs.update).toHaveBeenCalledWith(1, { active: true });
    });

    it("wraps to last tab", async () => {
      vi.mocked(browser.tabs.query).mockResolvedValue([
        { id: 1, index: 0, windowId: 1 },
        { id: 2, index: 1, windowId: 1 },
      ]);
      await prevTab({ tab: { id: 1, index: 0, windowId: 1 } });
      expect(browser.tabs.update).toHaveBeenCalledWith(2, { active: true });
    });
  });
});
