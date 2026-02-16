import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchNext, searchPrev, findOnPage } from "./search";

describe("search", () => {
  beforeEach(() => {
    // Mock window.find
    (window as unknown as Record<string, unknown>).find = vi.fn(() => true);
  });

  describe("findOnPage", () => {
    it("calls window.find with correct args for forward search", () => {
      findOnPage("test", true);
      expect(
        (window as unknown as { find: ReturnType<typeof vi.fn> }).find,
      ).toHaveBeenCalledWith("test", false, false, true);
    });

    it("calls window.find with backwards=true for backward search", () => {
      findOnPage("test", false);
      expect(
        (window as unknown as { find: ReturnType<typeof vi.fn> }).find,
      ).toHaveBeenCalledWith("test", false, true, true);
    });
  });

  describe("searchNext / searchPrev", () => {
    it("does nothing when no last query", () => {
      // searchNext/searchPrev rely on lastQuery being set by activateSearch
      // Since we haven't called activateSearch, they should not call find
      const findMock = vi.fn();
      (window as unknown as Record<string, unknown>).find = findMock;
      searchNext();
      searchPrev();
      // No calls because lastQuery is empty
      expect(findMock).not.toHaveBeenCalled();
    });
  });
});
