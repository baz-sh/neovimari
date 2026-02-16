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
