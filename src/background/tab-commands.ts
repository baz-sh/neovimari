/**
 * Safari does not support browser.sessions API.
 * We track recently closed tab URLs in an in-memory stack,
 * persisted to browser.storage.session to survive SW restarts.
 */

const CLOSED_TABS_KEY = "closedTabs";
const MAX_CLOSED_TABS = 25;

let closedTabUrls: string[] = [];

export async function initTabTracking(): Promise<void> {
  const data = await browser.storage.session.get(CLOSED_TABS_KEY);
  if (Array.isArray(data[CLOSED_TABS_KEY])) {
    closedTabUrls = data[CLOSED_TABS_KEY] as string[];
  } else {
    closedTabUrls = [];
  }

  browser.tabs.onRemoved.addListener(async (tabId) => {
    // We need to capture the URL before removal.
    // Unfortunately, onRemoved fires after the tab is gone.
    // We track via beforeRemove workaround: query all tabs periodically
    // and cache URLs. For now, use the tracked URL from closeTab().
    void tabId; // tabId is not useful after removal
  });
}

async function persistClosedTabs(): Promise<void> {
  await browser.storage.session.set({ [CLOSED_TABS_KEY]: closedTabUrls });
}

function trackClosedUrl(url: string | undefined): void {
  if (url && url !== "about:blank" && !url.startsWith("about:")) {
    closedTabUrls.push(url);
    if (closedTabUrls.length > MAX_CLOSED_TABS) {
      closedTabUrls = closedTabUrls.slice(-MAX_CLOSED_TABS);
    }
    void persistClosedTabs();
  }
}

export async function closeTab(
  sender: browser.runtime.MessageSender,
): Promise<void> {
  const tabId = sender.tab?.id;
  if (tabId == null) return;

  // Track URL before closing
  trackClosedUrl(sender.tab?.url);
  await browser.tabs.remove(tabId);
}

export async function restoreTab(): Promise<void> {
  const url = closedTabUrls.pop();
  if (url) {
    await persistClosedTabs();
    await browser.tabs.create({ url, active: true });
  }
}

export async function newTab(): Promise<void> {
  await browser.tabs.create({ active: true });
}

export async function newTabWithUrl(url: string): Promise<void> {
  await browser.tabs.create({ url, active: false });
}

export async function duplicateTab(
  sender: browser.runtime.MessageSender,
): Promise<void> {
  const tabId = sender.tab?.id;
  if (tabId == null) return;
  await browser.tabs.duplicate(tabId);
}

export async function nextTab(
  sender: browser.runtime.MessageSender,
): Promise<void> {
  if (!sender.tab) return;
  const tabs = await browser.tabs.query({ currentWindow: true });
  const currentIndex = tabs.findIndex((t) => t.id === sender.tab?.id);
  if (currentIndex === -1) return;
  const nextIndex = (currentIndex + 1) % tabs.length;
  const nextTabId = tabs[nextIndex].id;
  if (nextTabId != null) {
    await browser.tabs.update(nextTabId, { active: true });
  }
}

export async function prevTab(
  sender: browser.runtime.MessageSender,
): Promise<void> {
  if (!sender.tab) return;
  const tabs = await browser.tabs.query({ currentWindow: true });
  const currentIndex = tabs.findIndex((t) => t.id === sender.tab?.id);
  if (currentIndex === -1) return;
  const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
  const prevTabId = tabs[prevIndex].id;
  if (prevTabId != null) {
    await browser.tabs.update(prevTabId, { active: true });
  }
}
