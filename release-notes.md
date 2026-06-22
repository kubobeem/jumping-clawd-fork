## What's New in 0.2.0

### 🦀 Clawd Browser Mascot
- **Floating popup mascot** - Clawd appears as a small popup that wanders around the browser
- **Multiple behaviors**: cursor following, random movement, edge bouncing, element exploring, click-to-jump
- **Interactive petting**: click & hold to pet (hearts + blush), drag to reposition, double-click to feed
- **Character states**: walking, bouncing, sitting, sleeping (Zzz), looking at cursor, hungry
- **Adjustable size**: 16px ~ 128px from popup settings
- **Quiet Mode / Power Save / Click-Through** toggle settings
- **Satiety system**: feed Clawd cookies, hunger drains over time
- **3 operation modes**: Auto (random mix), Web page hopping, Browser UI bouncing
- **Multi-language support**: English / 日本語 / 中文

### What's New (from 0.1.1)

- **Multi-language support** (English / 日本語 / 中文)
  - Added `public/_locales/` with en, ja, zh_CN translations
  - Language auto-detects from browser settings
- **Fixed:** Added `default_locale: en` to manifest (required for `__MSG_` syntax)
- Manifest fully localized via `__MSG_` syntax
- Game UI: controls hint, leaderboard, score, buttons all localized
- Popup UI: all text localized
- Dynamic `lang` attribute on HTML for accessibility

### Build Downloads
- `jumping-clawd-0.2.0-chrome.zip` - Chrome / Chromium
- `jumping-clawd-0.2.0-firefox.zip` - Firefox
