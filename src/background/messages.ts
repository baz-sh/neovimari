import type { ContentMessage } from "../shared/messages";
import type { Settings } from "../shared/settings-schema";
import { loadSettings, saveSettings, broadcastSettings } from "./settings";
import {
  closeTab,
  restoreTab,
  newTab,
  newTabWithUrl,
  duplicateTab,
  nextTab,
  prevTab,
} from "./tab-commands";

export async function handleMessage(
  message: ContentMessage,
  sender: browser.runtime.MessageSender,
): Promise<unknown> {
  switch (message.type) {
    case "SETTINGS_GET": {
      const settings = await loadSettings();
      return { settings };
    }
    case "SETTINGS_SET": {
      const settings = await saveSettings(
        message.payload as Partial<Settings>,
      );
      await broadcastSettings(settings);
      return { settings };
    }
    case "TAB_CLOSE":
      await closeTab(sender);
      return undefined;
    case "TAB_RESTORE":
      await restoreTab();
      return undefined;
    case "TAB_NEW":
      await newTab();
      return undefined;
    case "TAB_NEW_URL":
      await newTabWithUrl(message.url);
      return undefined;
    case "TAB_DUPLICATE":
      await duplicateTab(sender);
      return undefined;
    case "TAB_NEXT":
      await nextTab(sender);
      return undefined;
    case "TAB_PREV":
      await prevTab(sender);
      return undefined;
  }
}
