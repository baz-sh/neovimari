# Neovimari — TODO

## Phase 1 — Core ✅

- [x] Project scaffolding & build infrastructure
- [x] Shared types, messages, settings, keybindings
- [x] Background settings management
- [x] Background tab commands
- [x] Content mode manager & keyboard input
- [x] Content scroll commands (smooth scroll with ease-out)
- [x] Content link hints (Shadow DOM overlay)
- [x] Content search (window.find with Shadow DOM search bar)
- [x] Integration & action dispatcher (all 23 actions wired)
- [x] Xcode project with companion app
- [x] Security review & fixes (broadcastSettings, innerHTML, modifier keys)
- [x] Search highlight fix (close search bar before window.find so selection renders)
- [x] Filter modifier-only keypresses (Shift/Ctrl/Alt/Meta)
- [x] Local.xcconfig for gitignored DEVELOPMENT_TEAM
- [x] README with ASCII art

## Phase 2 — Settings & Polish

- [ ] Holding j / k will cause stutter
- [x] App icons (all sizes generated from 1024x1024 source, wired into manifest + Xcode asset catalog)
- [x] Visual mode indicator (small badge showing current mode)
- [ ] Popup settings UI (key remapping, URL exclusions, scroll config)
- [ ] Smooth scrolling options in settings UI
- [ ] JSON import/export for settings

## Phase 3 — Advanced

- [ ] `:` command bar (`:open`, `:tabopen`, `:bookmarks`, `:history`)
- [ ] Marks (`m` + letter to set, `'` + letter to jump)
- [ ] Yank URL (`yy` copies current URL)
- [ ] Open clipboard URL (`p` current tab, `P` new tab)

## Phase 4 — Future

- [ ] Cross-browser support (Firefox, Chrome/Edge)
- [ ] iOS / iPadOS port

## Bugs & Improvements

- [ ] Restore tab: track tabs closed externally (not just via extension)
- [x] Consider adding `CapsLock` to modifier-only key filter

## Dev Notes

- **Build:** `npm run build` then Cmd+R in Xcode
- **Tests:** `npm run test` (65 tests, vitest + jsdom)
- **Signing:** Team ID lives in gitignored `xcode/Neovimari/Local.xcconfig`
- **Safari:** Must enable "Allow unsigned extensions" in Developer settings (resets each launch)
- **Icon source:** `src/assets/icons/icon.png` (1024x1024), sized variants generated via `sips`
