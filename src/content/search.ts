import type { ModeManager } from "./mode-manager";
import { MODE } from "../shared/types";
import { showSearchBar, hideSearchBar } from "./ui/search-bar";

let lastQuery = "";
let highlightEl: HTMLElement | null = null;

export interface SearchSession {
  cancel(): void;
}

function createHighlight(): HTMLElement {
  const el = document.createElement("div");
  el.style.cssText = `
    position: absolute;
    background-color: rgba(255, 200, 0, 0.4);
    border: 2px solid #f59e0b;
    border-radius: 2px;
    pointer-events: none;
    z-index: 2147483646;
    transition: opacity 0.1s ease;
  `;
  document.body.appendChild(el);
  return el;
}

function highlightSelection(): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    removeHighlight();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  if (rect.width === 0 || rect.height === 0) {
    removeHighlight();
    return;
  }

  if (!highlightEl) {
    highlightEl = createHighlight();
  }

  highlightEl.style.left = `${rect.left + window.scrollX - 2}px`;
  highlightEl.style.top = `${rect.top + window.scrollY - 2}px`;
  highlightEl.style.width = `${rect.width + 4}px`;
  highlightEl.style.height = `${rect.height + 4}px`;
  highlightEl.style.opacity = "1";
}

function removeHighlight(): void {
  if (highlightEl) {
    highlightEl.style.opacity = "0";
  }
}

export function activateSearch(modeManager: ModeManager): SearchSession {
  modeManager.setMode(MODE.SEARCH);
  const input = showSearchBar();

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cancel();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      lastQuery = input.value;
      // Close the search bar and return focus to the page BEFORE
      // calling find — window.find() selection highlight is only
      // visible when focus is on the main document, not the Shadow DOM input.
      cancel();
      if (lastQuery) {
        findOnPage(lastQuery, true);
      }
      return;
    }
  }

  input.addEventListener("keydown", onKeyDown);

  function cancel(): void {
    input.removeEventListener("keydown", onKeyDown);
    hideSearchBar();
    modeManager.setMode(MODE.NORMAL);
  }

  return { cancel };
}

/**
 * Uses window.find() — non-standard but supported in Safari and all major browsers.
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/find
 */
export function findOnPage(query: string, forward: boolean): boolean {
  // window.find(searchString, caseSensitive, backwards, wrapAround)
  const found = (window as unknown as { find: (...args: unknown[]) => boolean }).find(
    query,
    false,
    !forward,
    true,
  );
  if (found) {
    highlightSelection();
  } else {
    removeHighlight();
  }
  return found;
}

export function searchNext(): void {
  if (lastQuery) {
    findOnPage(lastQuery, true);
  }
}

export function searchPrev(): void {
  if (lastQuery) {
    findOnPage(lastQuery, false);
  }
}

export function clearSearch(): void {
  lastQuery = "";
  removeHighlight();
  window.getSelection()?.removeAllRanges();
}
