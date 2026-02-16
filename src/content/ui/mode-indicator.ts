import type { Mode } from "../../shared/types";
import { MODE } from "../../shared/types";

let host: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let indicatorEl: HTMLElement | null = null;

const VISIBLE_MODES: Partial<Record<Mode, { label: string; color: string }>> = {
  [MODE.INSERT]: { label: "INSERT", color: "#22c55e" },
};

function createIndicator(): { root: ShadowRoot; indicator: HTMLElement } {
  host = document.createElement("div");
  host.id = "neovimari-mode-indicator";
  host.style.cssText = "position: fixed; bottom: 10px; left: 10px; z-index: 2147483647; transition: bottom 0.15s ease;";
  document.documentElement.appendChild(host);

  const root = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .mode-indicator {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      color: white;
      opacity: 0.9;
      transition: background-color 0.15s ease, opacity 0.15s ease;
      user-select: none;
      pointer-events: none;
    }
  `;
  root.appendChild(style);

  const indicator = document.createElement("div");
  indicator.className = "mode-indicator";
  root.appendChild(indicator);

  return { root, indicator };
}

export function updateModeIndicator(mode: Mode): void {
  const modeInfo = VISIBLE_MODES[mode];

  if (!modeInfo) {
    hideModeIndicator();
    return;
  }

  if (!shadowRoot || !indicatorEl) {
    const created = createIndicator();
    shadowRoot = created.root;
    indicatorEl = created.indicator;
  }

  indicatorEl.textContent = `-- ${modeInfo.label} --`;
  indicatorEl.style.backgroundColor = modeInfo.color;
  showModeIndicator();
}

export function hideModeIndicator(): void {
  if (indicatorEl) {
    indicatorEl.style.opacity = "0";
  }
}

export function showModeIndicator(): void {
  if (indicatorEl) {
    indicatorEl.style.opacity = "0.9";
  }
}
