import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleMessage } from "./messages";
import { DEFAULT_SETTINGS } from "../shared/settings-schema";

describe("background/messages", () => {
  const sender: browser.runtime.MessageSender = {};

  beforeEach(() => {
    vi.mocked(browser.storage.local.get).mockResolvedValue({});
    vi.mocked(browser.storage.local.set).mockResolvedValue(undefined);
    vi.mocked(browser.tabs.query).mockResolvedValue([]);
    vi.mocked(browser.runtime.sendMessage).mockResolvedValue(undefined);
  });

  it("handles SETTINGS_GET", async () => {
    const result = await handleMessage({ type: "SETTINGS_GET" }, sender);
    expect(result).toEqual({ settings: DEFAULT_SETTINGS });
  });

  it("handles SETTINGS_SET", async () => {
    const result = await handleMessage(
      { type: "SETTINGS_SET", payload: { scrollStepSize: 100 } },
      sender,
    );
    expect(result).toEqual({
      settings: expect.objectContaining({ scrollStepSize: 100 }),
    });
  });

  it("returns undefined for unknown message types", async () => {
    const result = await handleMessage(
      { type: "TAB_CLOSE" } as never,
      sender,
    );
    expect(result).toBeUndefined();
  });
});
