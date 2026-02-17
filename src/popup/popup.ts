import { ACTION_GROUPS, ACTION_LABELS, type ActionName } from "../shared/types";
import {
  DEFAULT_SETTINGS,
  validateSettings,
  type Settings,
} from "../shared/settings-schema";
import type { SettingsResponse } from "../shared/messages";

// --- State ---

let settings: Settings = { ...DEFAULT_SETTINGS };

// Track which key badge is currently being edited
let editingAction: ActionName | null = null;
let editingBuffer = "";
let editingTimerId: ReturnType<typeof setTimeout> | null = null;
const EDIT_SEQUENCE_TIMEOUT = 800;

// --- Settings I/O ---

async function loadSettings(): Promise<Settings> {
  try {
    const response = (await browser.runtime.sendMessage({
      type: "SETTINGS_GET",
    })) as SettingsResponse | undefined;
    if (response?.settings) {
      return validateSettings(response.settings);
    }
  } catch {
    // Background may not be ready
  }
  return { ...DEFAULT_SETTINGS };
}

async function saveSettings(partial: Partial<Settings>): Promise<void> {
  try {
    await browser.runtime.sendMessage({
      type: "SETTINGS_SET",
      payload: partial,
    });
    // Re-load to get the validated merged result
    settings = await loadSettings();
  } catch {
    // Ignore errors
  }
}

// --- Toggle Helpers ---

function isActionDisabled(action: ActionName): boolean {
  return settings.disabledActions.includes(action);
}

function setActionDisabled(action: ActionName, disabled: boolean): void {
  const current = new Set(settings.disabledActions);
  if (disabled) {
    current.add(action);
  } else {
    current.delete(action);
  }
  const disabledActions = [...current];
  settings = { ...settings, disabledActions };
  saveSettings({ disabledActions });
}

function getGroupState(
  actions: readonly ActionName[],
): "all" | "none" | "partial" {
  const disabledCount = actions.filter((a) => isActionDisabled(a)).length;
  if (disabledCount === 0) return "all";
  if (disabledCount === actions.length) return "none";
  return "partial";
}

function setGroupDisabled(
  actions: readonly ActionName[],
  disabled: boolean,
): void {
  const current = new Set(settings.disabledActions);
  for (const action of actions) {
    if (disabled) {
      current.add(action);
    } else {
      current.delete(action);
    }
  }
  const disabledActions = [...current];
  settings = { ...settings, disabledActions };
  saveSettings({ disabledActions });
}

// --- Key Editing ---

function startEditing(action: ActionName, badgeEl: HTMLElement): void {
  // Cancel any previous edit
  cancelEditing();

  editingAction = action;
  editingBuffer = "";
  badgeEl.classList.add("editing");
  badgeEl.textContent = "...";

  // Listen for keydown on the document
  document.addEventListener("keydown", handleEditKeyDown, true);
}

function cancelEditing(): void {
  if (editingTimerId !== null) {
    clearTimeout(editingTimerId);
    editingTimerId = null;
  }
  editingAction = null;
  editingBuffer = "";
  document.removeEventListener("keydown", handleEditKeyDown, true);

  // Remove editing class from all badges
  document.querySelectorAll(".key-badge.editing").forEach((el) => {
    el.classList.remove("editing");
  });
}

function commitEdit(): void {
  if (!editingAction || !editingBuffer) {
    cancelEditing();
    return;
  }

  const newMappings = { ...settings.keyMappings };
  (newMappings as Record<string, string>)[editingAction] = editingBuffer;
  settings = { ...settings, keyMappings: newMappings };
  saveSettings({ keyMappings: newMappings });

  cancelEditing();
  renderGroups();
}

function handleEditKeyDown(e: KeyboardEvent): void {
  e.preventDefault();
  e.stopPropagation();

  if (e.key === "Escape") {
    cancelEditing();
    renderGroups();
    return;
  }

  // Ignore modifier-only presses
  if (["Shift", "Control", "Alt", "Meta", "CapsLock"].includes(e.key)) {
    return;
  }

  // Clear previous timer
  if (editingTimerId !== null) {
    clearTimeout(editingTimerId);
    editingTimerId = null;
  }

  editingBuffer += e.key;

  // Update the badge to show what's been typed so far
  const badge = document.querySelector(".key-badge.editing");
  if (badge) {
    badge.textContent = editingBuffer;
  }

  // Set a timeout — if no more keys come, commit the edit
  editingTimerId = setTimeout(() => {
    commitEdit();
  }, EDIT_SEQUENCE_TIMEOUT);
}

// --- Rendering ---

function createToggle(
  checked: boolean,
  onChange: (checked: boolean) => void,
  indeterminate = false,
): HTMLElement {
  const label = document.createElement("label");
  label.className = "toggle";

  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.indeterminate = indeterminate;
  input.addEventListener("change", () => {
    onChange(input.checked);
  });

  const slider = document.createElement("span");
  slider.className = "toggle-slider";

  label.appendChild(input);
  label.appendChild(slider);
  return label;
}

function renderGroups(): void {
  const container = document.getElementById("groups")!;
  container.innerHTML = "";

  for (const [groupName, actions] of Object.entries(ACTION_GROUPS)) {
    const section = document.createElement("section");
    section.className = "section";

    // Group header
    const header = document.createElement("div");
    header.className = "group-header";

    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.innerHTML = "&#9656;";

    const title = document.createElement("span");
    title.className = "section-title";
    title.textContent = groupName;

    // Group toggle
    const groupState = getGroupState(actions);
    const groupToggle = createToggle(
      groupState !== "none",
      (checked) => {
        setGroupDisabled(actions, !checked);
        renderGroups();
      },
      groupState === "partial",
    );
    groupToggle.classList.add("group-toggle");

    header.appendChild(chevron);
    header.appendChild(title);
    header.appendChild(groupToggle);

    // Group body (individual actions)
    const body = document.createElement("div");
    body.className = "section-body";
    body.hidden = true;

    for (const action of actions) {
      const row = document.createElement("div");
      row.className = "action-row";
      const actionDisabled = isActionDisabled(action);
      if (actionDisabled) {
        row.classList.add("disabled");
      }

      // Key badge
      const badge = document.createElement("span");
      badge.className = "key-badge";
      badge.textContent = settings.keyMappings[action] || "--";
      badge.title = "Click to edit keybinding";
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditing(action, badge);
      });

      // Label
      const label = document.createElement("span");
      label.className = "action-label";
      label.textContent = ACTION_LABELS[action];

      // Toggle
      const toggle = createToggle(!actionDisabled, (checked) => {
        setActionDisabled(action, !checked);
        renderGroups();
      });

      row.appendChild(badge);
      row.appendChild(label);
      row.appendChild(toggle);
      body.appendChild(row);
    }

    // Click header to expand/collapse
    header.addEventListener("click", (e) => {
      // Don't toggle section when clicking the group toggle
      if ((e.target as HTMLElement).closest(".toggle")) return;
      body.hidden = !body.hidden;
      header.classList.toggle("open", !body.hidden);
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);
  }
}

function renderGeneralSettings(): void {
  const scrollStepInput = document.getElementById(
    "scrollStepSize",
  ) as HTMLInputElement;
  const halfPageInput = document.getElementById(
    "halfPageScroll",
  ) as HTMLInputElement;
  const smoothScrollInput = document.getElementById(
    "smoothScroll",
  ) as HTMLInputElement;
  const smoothDurationInput = document.getElementById(
    "smoothScrollDuration",
  ) as HTMLInputElement;
  const hintCharsInput = document.getElementById(
    "hintCharacters",
  ) as HTMLInputElement;

  scrollStepInput.value = String(settings.scrollStepSize);
  halfPageInput.value = String(settings.halfPageScroll);
  smoothScrollInput.checked = settings.smoothScroll;
  smoothDurationInput.value = String(settings.smoothScrollDuration);
  hintCharsInput.value = settings.hintCharacters;

  // Event listeners (debounced save)
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const debouncedSave = (partial: Partial<Settings>) => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSettings(partial), 300);
  };

  scrollStepInput.addEventListener("input", () => {
    const val = parseInt(scrollStepInput.value, 10);
    if (val > 0) debouncedSave({ scrollStepSize: val });
  });

  halfPageInput.addEventListener("input", () => {
    const val = parseFloat(halfPageInput.value);
    if (val > 0 && val <= 1) debouncedSave({ halfPageScroll: val });
  });

  smoothScrollInput.addEventListener("change", () => {
    saveSettings({ smoothScroll: smoothScrollInput.checked });
  });

  smoothDurationInput.addEventListener("input", () => {
    const val = parseInt(smoothDurationInput.value, 10);
    if (val >= 0) debouncedSave({ smoothScrollDuration: val });
  });

  hintCharsInput.addEventListener("input", () => {
    const val = hintCharsInput.value;
    if (val.length >= 2) debouncedSave({ hintCharacters: val });
  });
}

function renderExcludedUrls(): void {
  const container = document.getElementById("excludedUrlsList")!;
  container.innerHTML = "";

  for (let i = 0; i < settings.excludedUrls.length; i++) {
    const url = settings.excludedUrls[i];
    const row = document.createElement("div");
    row.className = "url-row";

    const pattern = document.createElement("span");
    pattern.className = "url-pattern";
    pattern.textContent = url;
    pattern.title = url;

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Remove";
    removeBtn.addEventListener("click", () => {
      const newUrls = settings.excludedUrls.filter((_, idx) => idx !== i);
      settings = { ...settings, excludedUrls: newUrls };
      saveSettings({ excludedUrls: newUrls });
      renderExcludedUrls();
    });

    row.appendChild(pattern);
    row.appendChild(removeBtn);
    container.appendChild(row);
  }
}

function setupExcludedUrlsAdd(): void {
  const input = document.getElementById("newUrlPattern") as HTMLInputElement;
  const btn = document.getElementById("addUrlBtn")!;

  const addUrl = () => {
    const val = input.value.trim();
    if (!val) return;
    const newUrls = [...settings.excludedUrls, val];
    settings = { ...settings, excludedUrls: newUrls };
    saveSettings({ excludedUrls: newUrls });
    input.value = "";
    renderExcludedUrls();
  };

  btn.addEventListener("click", addUrl);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addUrl();
  });
}

function setupCollapsibleSections(): void {
  document
    .querySelectorAll<HTMLElement>(".section-header[data-section]")
    .forEach((header) => {
      const sectionId = header.dataset.section!;
      const body = document.querySelector<HTMLElement>(
        `[data-section-body="${sectionId}"]`,
      );
      if (!body) return;

      header.addEventListener("click", () => {
        body.hidden = !body.hidden;
        header.classList.toggle("open", !body.hidden);
      });
    });
}

function setupResetButton(): void {
  const btn = document.getElementById("resetBtn")!;
  btn.addEventListener("click", async () => {
    if (!confirm("Reset all settings to defaults?")) return;
    settings = { ...DEFAULT_SETTINGS };
    await saveSettings(DEFAULT_SETTINGS);
    renderGroups();
    renderGeneralSettings();
    renderExcludedUrls();
  });
}

// --- Init ---

async function init(): Promise<void> {
  settings = await loadSettings();

  renderGroups();
  renderGeneralSettings();
  renderExcludedUrls();
  setupExcludedUrlsAdd();
  setupCollapsibleSections();
  setupResetButton();
}

init();
