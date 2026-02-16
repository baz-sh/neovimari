import { MODE, type ActionName } from "../shared/types";
import { KeySequenceResolver } from "../shared/keybindings";
import {
  DEFAULT_SETTINGS,
  validateSettings,
  type Settings,
} from "../shared/settings-schema";
import type { SettingsResponse } from "../shared/messages";
import { ModeManager } from "./mode-manager";
import {
  scrollDown,
  scrollUp,
  scrollLeft,
  scrollRight,
  halfPageDown,
  halfPageUp,
  goToTop,
  goToBottom,
} from "./scroll";
import { activateHints, type HintSession } from "./hints";
import { activateSearch, searchNext, searchPrev, clearSearch, type SearchSession } from "./search";
import { updateModeIndicator } from "./ui/mode-indicator";

let settings: Settings = DEFAULT_SETTINGS;
let resolver = new KeySequenceResolver(settings.keyMappings);
let disabled = false;
let hintSession: HintSession | null = null;
let searchSession: SearchSession | null = null;

const modeManager = new ModeManager();

// --- Action dispatch ---

function sendBackground(type: string): void {
  browser.runtime.sendMessage({ type }).catch(() => {});
}

function getActions(): Record<ActionName, () => void> {
  return {
    scrollDown: () => scrollDown(settings),
    scrollUp: () => scrollUp(settings),
    scrollLeft: () => scrollLeft(settings),
    scrollRight: () => scrollRight(settings),
    halfPageDown: () => halfPageDown(settings),
    halfPageUp: () => halfPageUp(settings),
    goToTop: () => goToTop(settings),
    goToBottom: () => goToBottom(settings),
    linkHints: () => {
      hintSession = activateHints(false, settings, modeManager);
    },
    linkHintsNewTab: () => {
      hintSession = activateHints(true, settings, modeManager);
    },
    focusInput: () => {
      const input = document.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"]):not([disabled]), textarea:not([disabled]), [contenteditable="true"], [contenteditable=""]'
      );
      if (input) {
        input.focus();
      }
    },
    historyBack: () => history.back(),
    historyForward: () => history.forward(),
    prevTab: () => sendBackground("TAB_PREV"),
    nextTab: () => sendBackground("TAB_NEXT"),
    reload: () => location.reload(),
    closeTab: () => sendBackground("TAB_CLOSE"),
    restoreTab: () => sendBackground("TAB_RESTORE"),
    newTab: () => sendBackground("TAB_NEW"),
    duplicateTab: () => sendBackground("TAB_DUPLICATE"),
    search: () => {
      searchSession = activateSearch(modeManager);
    },
    searchNext: () => searchNext(),
    searchPrev: () => searchPrev(),
    clearSearch: () => clearSearch(),
    insertMode: () => modeManager.setMode(MODE.INSERT),
  };
}

const actions = getActions();

// --- URL exclusion ---

function isUrlExcluded(url: string, patterns: readonly string[]): boolean {
  for (const pattern of patterns) {
    try {
      const regex = globToRegex(pattern);
      if (regex.test(url)) return true;
    } catch {
      // Invalid pattern, skip
    }
  }
  return false;
}

function globToRegex(glob: string): RegExp {
  const escaped = glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}$`);
}

// --- Keyboard handler ---

function handleKeyDown(e: KeyboardEvent): void {
  if (disabled) return;

  // Ignore modifier combos (except Shift, which changes key character)
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  // Ignore modifier-only key presses
  if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta" || e.key === "CapsLock") return;

  const mode = modeManager.getMode();

  // In Insert mode, only intercept Escape
  if (mode === MODE.INSERT) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      modeManager.setMode(MODE.NORMAL);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
    return;
  }

  // In Hints mode, delegate keys to the hint session
  if (mode === MODE.HINTS) {
    if (hintSession) {
      e.preventDefault();
      e.stopPropagation();
      hintSession.handleKey(e.key);
      if (modeManager.getMode() !== MODE.HINTS) {
        hintSession = null;
      }
    }
    return;
  }

  // In Search mode, handle Escape to cancel search
  if (mode === MODE.SEARCH) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (searchSession) {
        searchSession.cancel();
        searchSession = null;
      }
    }
    return;
  }

  // Normal mode — resolve key sequences
  const key = e.key;
  const result = resolver.feed(key);

  if (result.type === "exact") {
    e.preventDefault();
    e.stopPropagation();
    const handler = actions[result.action];
    if (handler) {
      handler();
    }
  } else if (result.type === "prefix") {
    e.preventDefault();
    e.stopPropagation();
  }
  // "none" — let the event pass through
}

// --- Settings management ---

function applySettings(newSettings: Settings): void {
  settings = newSettings;
  resolver = new KeySequenceResolver(settings.keyMappings);
  disabled = isUrlExcluded(window.location.href, settings.excludedUrls);
}

// --- Initialization ---

async function init(): Promise<void> {
  // Fetch settings from background
  try {
    const response = (await browser.runtime.sendMessage({
      type: "SETTINGS_GET",
    })) as SettingsResponse | undefined;
    if (response?.settings) {
      applySettings(validateSettings(response.settings));
    }
  } catch {
    // Background may not be ready — use defaults
  }

  // Listen for settings updates from background
  browser.runtime.onMessage.addListener(
    (message: unknown, _sender: browser.runtime.MessageSender) => {
      const msg = message as { type: string; payload?: unknown };
      if (msg.type === "SETTINGS_UPDATED" && msg.payload) {
        applySettings(validateSettings(msg.payload));
      }
    },
  );

  // Keyboard listener on capture phase
  document.addEventListener("keydown", handleKeyDown, true);

  // Auto-insert mode on editable focus
  modeManager.attachAutoInsert();

  // Mode indicator
  modeManager.onModeChange((newMode) => updateModeIndicator(newMode));
  updateModeIndicator(modeManager.getMode());

  console.log("[Neovimari] Content script loaded");
}

init();
