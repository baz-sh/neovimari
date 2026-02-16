import { MODE, type Mode } from "../shared/types";

export type ModeChangeListener = (newMode: Mode, oldMode: Mode) => void;

const EDITABLE_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="file"]):not([type="image"]):not([type="hidden"]), textarea, [contenteditable="true"], [contenteditable=""]';

export class ModeManager {
  private mode: Mode = MODE.NORMAL;
  private listeners: ModeChangeListener[] = [];

  getMode(): Mode {
    return this.mode;
  }

  setMode(newMode: Mode): void {
    if (newMode === this.mode) return;
    const oldMode = this.mode;
    this.mode = newMode;
    for (const listener of this.listeners) {
      listener(newMode, oldMode);
    }
  }

  onModeChange(listener: ModeChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  isNormal(): boolean {
    return this.mode === MODE.NORMAL;
  }

  isInsert(): boolean {
    return this.mode === MODE.INSERT;
  }

  /** Returns true if the given element is an editable field */
  static isEditable(element: Element | null): boolean {
    if (!element) return false;
    return element.matches(EDITABLE_SELECTOR);
  }

  /**
   * Attach auto-insert behavior: when an editable element gains focus,
   * switch to insert mode. When it loses focus, return to normal mode.
   */
  attachAutoInsert(): void {
    document.addEventListener(
      "focusin",
      (e) => {
        if (
          ModeManager.isEditable(e.target as Element) &&
          this.mode === MODE.NORMAL
        ) {
          this.setMode(MODE.INSERT);
        }
      },
      true,
    );

    document.addEventListener(
      "focusout",
      (e) => {
        if (
          ModeManager.isEditable(e.target as Element) &&
          this.mode === MODE.INSERT
        ) {
          // Small delay to allow focus to transfer between editable fields
          setTimeout(() => {
            if (
              !ModeManager.isEditable(document.activeElement) &&
              this.mode === MODE.INSERT
            ) {
              this.setMode(MODE.NORMAL);
            }
          }, 0);
        }
      },
      true,
    );
  }
}
