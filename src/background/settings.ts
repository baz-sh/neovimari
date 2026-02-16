import {
  validateSettings,
  DEFAULT_SETTINGS,
  type Settings,
} from "../shared/settings-schema";

const STORAGE_KEY = "settings";

export async function loadSettings(): Promise<Settings> {
  const data = await browser.storage.local.get(STORAGE_KEY);
  return validateSettings(data[STORAGE_KEY]);
}

export async function saveSettings(
  partial: Partial<Settings>,
): Promise<Settings> {
  const current = await loadSettings();
  const merged = { ...current, ...partial };
  const validated = validateSettings(merged);
  await browser.storage.local.set({ [STORAGE_KEY]: validated });
  return validated;
}

export async function broadcastSettings(settings: Settings): Promise<void> {
  const tabs = await browser.tabs.query({});
  for (const tab of tabs) {
    if (tab.id != null) {
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: "SETTINGS_UPDATED" as const,
          payload: settings,
        });
      } catch {
        // Tab may not have content script loaded — ignore
      }
    }
  }
}

export { DEFAULT_SETTINGS };
