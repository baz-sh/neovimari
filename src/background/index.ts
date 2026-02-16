import type { ContentMessage } from "../shared/messages";
import { handleMessage } from "./messages";
import { initTabTracking } from "./tab-commands";

// Register listener synchronously — required for MV3 service worker lifecycle
browser.runtime.onMessage.addListener(
  (
    message: unknown,
    sender: browser.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ) => {
    const msg = message as ContentMessage;
    handleMessage(msg, sender).then(sendResponse);
    return true; // Keep channel open for async response
  },
);

// Initialize tab tracking for restore-tab functionality
initTabTracking();

console.log("[Neovimari] Background service worker loaded");
