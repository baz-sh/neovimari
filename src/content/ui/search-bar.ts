const CONTAINER_ID = "neovimari-search";

let shadowHost: HTMLElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let inputEl: HTMLInputElement | null = null;

function getOrCreateContainer(): {
  root: ShadowRoot;
  input: HTMLInputElement;
} {
  if (shadowRoot && inputEl) return { root: shadowRoot, input: inputEl };

  shadowHost = document.createElement("div");
  shadowHost.id = CONTAINER_ID;
  shadowHost.style.cssText =
    "position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483647;";
  document.documentElement.appendChild(shadowHost);
  shadowRoot = shadowHost.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = `
    .neovimari-search-bar {
      display: flex;
      align-items: center;
      background: #1a1a2e;
      border-top: 2px solid #e94560;
      padding: 6px 12px;
      font-family: monospace;
      font-size: 14px;
    }
    .neovimari-search-label {
      color: #e94560;
      margin-right: 8px;
    }
    .neovimari-search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #eee;
      font: inherit;
      padding: 2px 0;
    }
  `;
  shadowRoot.appendChild(style);

  const bar = document.createElement("div");
  bar.className = "neovimari-search-bar";

  const label = document.createElement("span");
  label.className = "neovimari-search-label";
  label.textContent = "/";

  inputEl = document.createElement("input");
  inputEl.className = "neovimari-search-input";
  inputEl.type = "text";
  inputEl.placeholder = "Search...";

  bar.appendChild(label);
  bar.appendChild(inputEl);
  shadowRoot.appendChild(bar);

  return { root: shadowRoot, input: inputEl };
}

export function showSearchBar(): HTMLInputElement {
  const { input } = getOrCreateContainer();
  if (shadowHost) shadowHost.style.display = "";
  input.value = "";
  input.focus();
  return input;
}

export function hideSearchBar(): void {
  if (shadowHost) shadowHost.style.display = "none";
  if (inputEl) inputEl.value = "";
}

export function getSearchInput(): HTMLInputElement | null {
  return inputEl;
}
