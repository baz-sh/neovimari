import type { Settings } from "./settings-schema";

/** Messages sent from content script to background */
export type ContentMessage =
  | { type: "TAB_CLOSE" }
  | { type: "TAB_RESTORE" }
  | { type: "TAB_NEW" }
  | { type: "TAB_NEW_URL"; url: string }
  | { type: "TAB_DUPLICATE" }
  | { type: "TAB_NEXT" }
  | { type: "TAB_PREV" }
  | { type: "SETTINGS_GET" }
  | { type: "SETTINGS_SET"; payload: Partial<Settings> };

/** Messages sent from background to content script */
export type BackgroundMessage = { type: "SETTINGS_UPDATED"; payload: Settings };

/** Response to SETTINGS_GET */
export type SettingsResponse = { settings: Settings };
