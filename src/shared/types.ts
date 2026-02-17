export const MODE = {
  NORMAL: "normal",
  INSERT: "insert",
  HINTS: "hints",
  SEARCH: "search",
} as const;

export type Mode = (typeof MODE)[keyof typeof MODE];

export const ACTION_NAMES = [
  "scrollDown",
  "scrollUp",
  "scrollLeft",
  "scrollRight",
  "halfPageDown",
  "halfPageUp",
  "goToTop",
  "goToBottom",
  "linkHints",
  "linkHintsNewTab",
  "focusInput",
  "historyBack",
  "historyForward",
  "prevTab",
  "nextTab",
  "reload",
  "closeTab",
  "restoreTab",
  "newTab",
  "duplicateTab",
  "search",
  "searchNext",
  "searchPrev",
  "clearSearch",
  "insertMode",
] as const;

export type ActionName = (typeof ACTION_NAMES)[number];

/** Logical groupings of actions for the settings UI */
export const ACTION_GROUPS: Record<string, readonly ActionName[]> = {
  Scrolling: [
    "scrollDown",
    "scrollUp",
    "scrollLeft",
    "scrollRight",
    "halfPageDown",
    "halfPageUp",
    "goToTop",
    "goToBottom",
  ],
  Navigation: ["linkHints", "linkHintsNewTab", "focusInput"],
  Search: ["search", "searchNext", "searchPrev", "clearSearch"],
  Tabs: [
    "prevTab",
    "nextTab",
    "closeTab",
    "restoreTab",
    "newTab",
    "duplicateTab",
  ],
  History: ["historyBack", "historyForward"],
  Other: ["reload", "insertMode"],
} as const;

/** Human-readable labels for each action */
export const ACTION_LABELS: Record<ActionName, string> = {
  scrollDown: "Scroll down",
  scrollUp: "Scroll up",
  scrollLeft: "Scroll left",
  scrollRight: "Scroll right",
  halfPageDown: "Half page down",
  halfPageUp: "Half page up",
  goToTop: "Go to top",
  goToBottom: "Go to bottom",
  linkHints: "Link hints",
  linkHintsNewTab: "Link hints (new tab)",
  focusInput: "Focus first input",
  historyBack: "History back",
  historyForward: "History forward",
  prevTab: "Previous tab",
  nextTab: "Next tab",
  reload: "Reload page",
  closeTab: "Close tab",
  restoreTab: "Restore closed tab",
  newTab: "New tab",
  duplicateTab: "Duplicate tab",
  search: "Search",
  searchNext: "Next match",
  searchPrev: "Previous match",
  clearSearch: "Clear search",
  insertMode: "Insert mode",
};
