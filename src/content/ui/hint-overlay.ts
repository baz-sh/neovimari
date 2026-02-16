const CONTAINER_ID = "neovimari-hints";

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;

function getOrCreateContainer(): ShadowRoot {
  if (shadowRoot) return shadowRoot;

  shadowHost = document.createElement("div");
  shadowHost.id = CONTAINER_ID;
  shadowHost.style.cssText =
    "position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647; pointer-events: none;";
  document.documentElement.appendChild(shadowHost);
  shadowRoot = shadowHost.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .neovimari-hint {
      position: fixed;
      z-index: 2147483647;
      background: #f0e130;
      color: #000;
      font: bold 12px/1 monospace;
      padding: 2px 4px;
      border-radius: 3px;
      border: 1px solid #c0a820;
      pointer-events: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      text-transform: uppercase;
    }
    .neovimari-hint-typed {
      opacity: 0.5;
    }
  `;
  shadowRoot.appendChild(style);

  return shadowRoot;
}

export interface HintLabel {
  element: Element;
  label: string;
  labelEl: HTMLElement;
}

export function showHints(
  elements: Element[],
  labels: string[],
): HintLabel[] {
  const container = getOrCreateContainer();

  // Clear previous hints
  const existing = container.querySelectorAll(".neovimari-hint");
  existing.forEach((el) => el.remove());

  const hints: HintLabel[] = [];

  for (let i = 0; i < elements.length && i < labels.length; i++) {
    const el = elements[i];
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;

    const labelEl = document.createElement("span");
    labelEl.className = "neovimari-hint";
    labelEl.textContent = labels[i];
    labelEl.style.left = `${Math.max(0, rect.left)}px`;
    labelEl.style.top = `${Math.max(0, rect.top)}px`;

    container.appendChild(labelEl);
    hints.push({ element: el, label: labels[i], labelEl });
  }

  return hints;
}

export function updateHintHighlight(
  hints: HintLabel[],
  typed: string,
): void {
  for (const hint of hints) {
    if (hint.label.startsWith(typed)) {
      hint.labelEl.style.display = "";
      // Highlight typed portion using DOM nodes instead of innerHTML
      hint.labelEl.textContent = "";
      const typedSpan = document.createElement("span");
      typedSpan.className = "neovimari-hint-typed";
      typedSpan.textContent = typed;
      hint.labelEl.appendChild(typedSpan);
      hint.labelEl.appendChild(
        document.createTextNode(hint.label.slice(typed.length)),
      );
    } else {
      hint.labelEl.style.display = "none";
    }
  }
}

export function hideHints(): void {
  if (shadowRoot) {
    const hints = shadowRoot.querySelectorAll(".neovimari-hint");
    hints.forEach((el) => el.remove());
  }
}
