import type { Settings } from "../shared/settings-schema";
import type { ModeManager } from "./mode-manager";
import { MODE } from "../shared/types";
import {
  showHints,
  updateHintHighlight,
  hideHints,
  type HintLabel,
} from "./ui/hint-overlay";

const CLICKABLE_SELECTOR = [
  "a[href]",
  "button",
  "input:not([type=hidden])",
  "textarea",
  "select",
  "[role=button]",
  "[role=link]",
  "[role=tab]",
  "[onclick]",
  "[tabindex]",
  "summary",
  "details",
  "[contenteditable]",
].join(", ");

function isVisible(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  if (rect.bottom < 0 || rect.top > window.innerHeight) return false;
  if (rect.right < 0 || rect.left > window.innerWidth) return false;
  const style = window.getComputedStyle(el);
  if (style.visibility === "hidden" || style.display === "none") return false;
  if (parseFloat(style.opacity) === 0) return false;
  return true;
}

export function generateLabels(count: number, chars: string): string[] {
  const labels: string[] = [];
  const len = chars.length;

  if (count <= len) {
    for (let i = 0; i < count; i++) {
      labels.push(chars[i]);
    }
  } else {
    // Two-character labels
    const needed = count;
    for (let i = 0; i < len && labels.length < needed; i++) {
      for (let j = 0; j < len && labels.length < needed; j++) {
        labels.push(chars[i] + chars[j]);
      }
    }
  }

  return labels;
}

export interface HintSession {
  handleKey(key: string): boolean;
  cancel(): void;
}

export function activateHints(
  openInNewTab: boolean,
  settings: Settings,
  modeManager: ModeManager,
): HintSession {
  const elements = Array.from(
    document.querySelectorAll(CLICKABLE_SELECTOR),
  ).filter(isVisible);

  const labels = generateLabels(elements.length, settings.hintCharacters);
  let hints: HintLabel[] = showHints(elements, labels);
  let typed = "";

  modeManager.setMode(MODE.HINTS);

  function cancel(): void {
    hideHints();
    typed = "";
    hints = [];
    modeManager.setMode(MODE.NORMAL);
  }

  function handleKey(key: string): boolean {
    if (key === "Escape") {
      cancel();
      return true;
    }

    typed += key.toLowerCase();
    updateHintHighlight(hints, typed);

    // Check for exact match
    const match = hints.find((h) => h.label === typed);
    if (match) {
      hideHints();
      activateElement(match.element, openInNewTab);
      modeManager.setMode(MODE.NORMAL);
      return true;
    }

    // Check if any hints still match
    const remaining = hints.filter((h) => h.label.startsWith(typed));
    if (remaining.length === 0) {
      cancel();
      return true;
    }

    return true;
  }

  return { handleKey, cancel };
}

function activateElement(el: Element, newTab: boolean): void {
  if (el instanceof HTMLElement) {
    if (newTab && el instanceof HTMLAnchorElement && el.href) {
      browser.runtime.sendMessage({ type: "TAB_NEW_URL", url: el.href }).catch(() => {});
    } else {
      el.click();
    }
  }
}
