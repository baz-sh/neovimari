import { ACTION_NAMES, type ActionName } from "./types";

export interface Settings {
  readonly scrollStepSize: number;
  readonly halfPageScroll: number;
  readonly smoothScroll: boolean;
  readonly smoothScrollDuration: number;
  readonly hintCharacters: string;
  readonly keyMappings: Readonly<Record<ActionName, string>>;
  readonly excludedUrls: readonly string[];
  readonly disabledActions: readonly ActionName[];
}

export const DEFAULT_SETTINGS: Settings = {
  scrollStepSize: 150,
  halfPageScroll: 0.5,
  smoothScroll: true,
  smoothScrollDuration: 150,
  hintCharacters: "sadfjklewcmpgh",
  keyMappings: {
    scrollDown: "j",
    scrollUp: "k",
    scrollLeft: "h",
    scrollRight: "l",
    halfPageDown: "d",
    halfPageUp: "u",
    goToTop: "gg",
    goToBottom: "G",
    linkHints: "f",
    linkHintsNewTab: "F",
    focusInput: "gi",
    historyBack: "H",
    historyForward: "L",
    prevTab: "J",
    nextTab: "K",
    reload: "r",
    closeTab: "x",
    restoreTab: "X",
    newTab: "t",
    duplicateTab: "T",
    search: "/",
    searchNext: "n",
    searchPrev: "N",
    clearSearch: "Escape",
    insertMode: "i",
  },
  excludedUrls: [],
  disabledActions: [],
};

export function validateSettings(raw: unknown): Settings {
  if (typeof raw !== "object" || raw === null) {
    return { ...DEFAULT_SETTINGS };
  }

  const obj = raw as Record<string, unknown>;

  const scrollStepSize =
    typeof obj.scrollStepSize === "number" && obj.scrollStepSize > 0
      ? obj.scrollStepSize
      : DEFAULT_SETTINGS.scrollStepSize;

  const halfPageScroll =
    typeof obj.halfPageScroll === "number" &&
    obj.halfPageScroll > 0 &&
    obj.halfPageScroll <= 1
      ? obj.halfPageScroll
      : DEFAULT_SETTINGS.halfPageScroll;

  const smoothScroll =
    typeof obj.smoothScroll === "boolean"
      ? obj.smoothScroll
      : DEFAULT_SETTINGS.smoothScroll;

  const smoothScrollDuration =
    typeof obj.smoothScrollDuration === "number" &&
    obj.smoothScrollDuration >= 0
      ? obj.smoothScrollDuration
      : DEFAULT_SETTINGS.smoothScrollDuration;

  const hintCharacters =
    typeof obj.hintCharacters === "string" && obj.hintCharacters.length >= 2
      ? obj.hintCharacters
      : DEFAULT_SETTINGS.hintCharacters;

  let keyMappings: Record<ActionName, string>;
  if (
    typeof obj.keyMappings === "object" &&
    obj.keyMappings !== null &&
    !Array.isArray(obj.keyMappings)
  ) {
    const merged = { ...DEFAULT_SETTINGS.keyMappings };
    const km = obj.keyMappings as Record<string, unknown>;
    for (const key of Object.keys(DEFAULT_SETTINGS.keyMappings)) {
      const actionKey = key as ActionName;
      if (typeof km[actionKey] === "string") {
        merged[actionKey] = km[actionKey] as string;
      }
    }
    keyMappings = merged;
  } else {
    keyMappings = { ...DEFAULT_SETTINGS.keyMappings };
  }

  const excludedUrls = Array.isArray(obj.excludedUrls)
    ? obj.excludedUrls.filter((u): u is string => typeof u === "string")
    : [...DEFAULT_SETTINGS.excludedUrls];

  const actionNameSet = new Set<string>(ACTION_NAMES);
  const disabledActions = Array.isArray(obj.disabledActions)
    ? (obj.disabledActions.filter(
        (a): a is ActionName => typeof a === "string" && actionNameSet.has(a),
      ) as ActionName[])
    : [...DEFAULT_SETTINGS.disabledActions];

  return {
    scrollStepSize,
    halfPageScroll,
    smoothScroll,
    smoothScrollDuration,
    hintCharacters,
    keyMappings,
    excludedUrls,
    disabledActions,
  };
}
