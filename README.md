```
 ███╗   ██╗ ███████╗  ██████╗  ██╗   ██╗ ██╗ ███╗   ███╗  █████╗  ██████╗  ██╗
 ████╗  ██║ ██╔════╝ ██╔═══██╗ ██║   ██║ ██║ ████╗ ████║ ██╔══██╗ ██╔══██╗ ██║
 ██╔██╗ ██║ █████╗   ██║   ██║ ██║   ██║ ██║ ██╔████╔██║ ███████║ ██████╔╝ ██║
 ██║╚██╗██║ ██╔══╝   ██║   ██║ ╚██╗ ██╔╝ ██║ ██║╚██╔╝██║ ██╔══██║ ██╔══██╗ ██║
 ██║ ╚████║ ███████╗ ╚██████╔╝  ╚████╔╝  ██║ ██║ ╚═╝ ██║ ██║  ██║ ██║  ██║ ██║
 ╚═╝  ╚═══╝ ╚══════╝  ╚═════╝    ╚═══╝   ╚═╝ ╚═╝     ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝
```

**Vim-style keyboard navigation for Safari.**

A Safari Web Extension that brings Vim keybindings to your browser — scroll, navigate, manage tabs, search, and follow links, all from the keyboard.

## Keybindings

| Key             | Action                                |
| --------------- | ------------------------------------- |
| `h` `j` `k` `l` | Scroll left / down / up / right       |
| `d` / `u`       | Half-page down / up                   |
| `gg` / `G`      | Top / bottom of page                  |
| `f` / `F`       | Link hints (current tab / new tab)    |
| `/`             | Search page                           |
| `n` / `N`       | Next / previous search match          |
| `H` / `L`       | History back / forward                |
| `J` / `K`       | Previous / next tab                   |
| `r`             | Reload page                           |
| `x` / `X`       | Close tab / restore closed tab        |
| `t` / `T`       | New tab / duplicate tab               |
| `gi`            | Focus first input                     |
| `i`             | Enter insert mode (pass keys to page) |
| `Escape`        | Return to normal mode                 |

All keybindings are fully configurable and can be individually enabled/disabled via the settings popup.

## Settings

Click the Neovimari icon in the Safari toolbar to open the settings popup.

- **Enable/disable actions** — toggle individual actions or entire groups (Scrolling, Navigation, Search, Tabs, History, Other)
- **Remap keybindings** — click any key badge and press the new key sequence
- **General settings** — scroll step size, smooth scroll, half-page fraction, scroll duration, hint characters
- **Excluded URLs** — add glob patterns (e.g. `*mail.google.com*`) to disable Neovimari on specific sites
- **Reset to defaults** — restore all settings to their original values

The popup automatically adapts to your system light/dark mode.

## Setup

### Prerequisites

- Node.js 20+
- Xcode 15+
- Safari 17+ with developer mode enabled

### Build

```bash
npm install
npm run build
```

### Run in Safari

1. Open `xcode/Neovimari/Neovimari.xcodeproj` in Xcode
2. Create `xcode/Neovimari/Local.xcconfig` with your team ID:
   ```
   DEVELOPMENT_TEAM = YOUR_TEAM_ID
   ```
3. Build & Run (Cmd+R)
4. In Safari → Settings → Extensions → enable Neovimari
5. Allow permissions when prompted

> **Note:** Enable **Safari → Settings → Developer → Allow unsigned extensions** (resets each Safari launch).

### Development

```bash
npm run dev       # Watch mode (rebuilds on change)
npm run check     # TypeScript type check
npm run test      # Run tests
npm run lint      # ESLint
```

After rebuilding, hit Cmd+R in Xcode and reload the page in Safari.

## Architecture

- **Content script** — injected into every page; captures keyboard input, manages modal state, renders link hints and search UI via Shadow DOM
- **Background service worker** — handles tab management and persists settings via `browser.storage.local`
- **Popup** — settings UI for configuring keybindings, toggling actions, and managing excluded URLs
- **Swift companion app** — minimal macOS wrapper required by Apple to host the Safari Web Extension

## Inspired by

- [Vimari](https://github.com/televator-apps/vimari) — the original Vim keybindings for Safari
- [Vimium](https://github.com/philc/vimium) — Vim keybindings for Chrome

## License

[MIT](LICENSE)

---

🤖 Built in collaboration with [Claude](https://claude.ai).
