# UQZERA Icon Library

An original, production-ready stroke icon set for the UQZERA private messenger.
Every glyph is drawn on the same 24x24 grid with a 1.8px stroke, round caps and
round joins, and inherits color from `currentColor`.

- **91 icons** across **9 categories**
- **24x24** viewBox, transparent background
- **1.8px** stroke (bump to 2px for large display sizes)
- **currentColor** for theme-driven tinting
- Emerald accent token: `#10B981` (exposed as `var(--uqzera-accent, #10B981)`)
- No gradients, shadows, rasters, emoji or external fonts
- Optimized for legibility at **16px** and up

Open `preview/index.html` in a browser for the searchable gallery: light/dark
theme toggle, per-icon detail dialog, dark/light/emerald previews and
16/20/24/32/48 size ramps. The same folder ships `uqzera-icons.svg` (a 91-symbol
sprite) and `uqzera-icons.css` (sizing and color helpers).

---

## Brand palette

| Token | Value | Use |
| --- | --- | --- |
| Background | `#0A0D14` | App surface / preview canvas |
| Emerald | `#10B981` | Active state, accent strokes, read ticks |
| Muted grey | `#8696A0` | Inactive icons, secondary labels |
| White | `#F5F7F9` | Primary icons on dark surfaces |
| Glass border | `rgba(255,255,255,0.08)` | Cards, dividers, containers |

Icons are monochrome by default. The accent color is applied only where a glyph
has a meaningful active element, such as read receipts, the live-location pulse,
or the selected reaction in the reaction picker.

---

## Design specification

| Property | Value |
| --- | --- |
| Grid | 24 x 24 |
| ViewBox | `0 0 24 24` |
| Stroke width | `1.8` |
| Line cap | `round` |
| Line join | `round` |
| Fill | `none` |
| Color | `currentColor` |
| Safe area | 2px padding inside the viewBox |
| Corner rhythm | 2px radii, 90 degree joins, consistent optical weight |

Rules used across the set:

1. One idea per icon. No two files share the same geometry.
2. State pairs are visually distinct, not just mirrored:
   - `pin-message` vs `unpin-message` (slash)
   - `star-message` vs `unstar-message` (minus badge)
   - `pin-chat` vs `unpin-chat` (slash)
   - `mute-chat` vs `unmute-chat` (slash)
   - `single-tick-sent` vs `double-tick-read` vs `blue-ticks-delivered`
   - `passkey-fingerprint` vs `passkey-face`
   - `location` vs `live-location` (radiating pulse)
3. Details stay at or above 1.5px so they survive 16px rendering.
4. Accent elements use `#10B981` directly; everything else is `currentColor`.

---

## Folder structure

```
uqzera-icons/
  README.md
  icon-manifest.json
  uqzera-icons.svg     sprite with 91 symbols
  uqzera-icons.css     sizing and color helpers
  messages/            14 icons
  media/               16 icons
  status/              10 icons
  groups/               6 icons
  calls/                9 icons
  authentication/       5 icons
  privacy/              9 icons
  chat-management/      9 icons
  profile-settings/    13 icons
  preview/
    index.html         searchable gallery
```

### File naming

- Lowercase kebab-case: `voice-note-play.svg`
- The filename is the icon slug and matches the manifest entry
- One icon per file, flat inside its category folder
- No numeric prefixes, no variant suffixes beyond a state word

---

## Icon inventory

| Category | Count | Icons |
| --- | ---: | --- |
| `messages` | 14 | reply, forward, react-emoji, react-picker, edit-message, copy-message, delete-for-me, delete-for-everyone, pin-message, unpin-message, star-message, unstar-message, select-message, select-all-messages |
| `media` | 16 | media-image, media-video, document, attachment, voice-note, voice-note-waveform, voice-note-play, voice-note-pause, camera, gallery, location, live-location, contact-card, poll, sticker, gif |
| `status` | 10 | read-receipts-toggle, typing-indicator, online-status-dot, last-seen, blue-ticks-delivered, double-tick-read, single-tick-sent, clock-pending, failed-message, retry-message |
| `groups` | 6 | groups, group-info, group-members, add-member, remove-member, group-admin |
| `calls` | 9 | voice-call, video-call, call-history, missed-call, incoming-call, mute-call, speaker, camera-switch, end-call |
| `authentication` | 5 | passkey-fingerprint, passkey-face, multi-device, device-list, remove-device |
| `privacy` | 9 | channels, channel-broadcast, encrypted-backup, backup-restore, tor-mode, panic-wipe, show-guide-again, auto-lock-timer, disappearing-timer |
| `chat-management` | 9 | archive, archived-chats, mute-chat, unmute-chat, pin-chat, unpin-chat, mark-as-unread, search-messages, search-chats |
| `profile-settings` | 13 | settings-profile, change-pin, change-passphrase, qr-scan, qr-share, copy-id, share-id, profile-photo, edit-bio, notifications, privacy-settings, blocked-contacts, help |
| **Total** | **91** | |

---

## Usage

### SVG sprite

`uqzera-icons.svg` bundles all 91 glyphs as `<symbol>` elements. Link the
stylesheet, then reference a symbol by id:

```html
<link rel="stylesheet" href="/icons/uqzera-icons.css">

<svg class="uqzera-icon uqzera-icon--24" aria-hidden="true">
  <use href="/icons/uqzera-icons.svg#uqzera-reply"></use>
</svg>
```

Symbol ids follow `uqzera-<slug>`, for example `uqzera-live-location` or
`uqzera-blue-ticks-delivered`. For standalone semantics, add `role="img"` and an
`aria-label` to the `<svg>`. External `<use>` works in modern browsers when the
folder is served over HTTP; inline the sprite once at the top of the document if
you need to support older engines.

### Plain HTML

Each SVG is self-contained. Inline it so `currentColor` resolves against the
surrounding text color:

```html
<span class="icon" style="color:#F5F7F9">
  <!-- paste the contents of messages/reply.svg here -->
</span>
```

Or reference the file when the icon color does not need to change:

```html
<img src="/icons/messages/reply.svg" alt="Reply" width="24" height="24">
```

`<img>` cannot inherit `currentColor`. For theme-aware coloring without inlining,
use the CSS mask technique:

```css
.icon-mask {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: currentColor;
  -webkit-mask: url("/icons/messages/reply.svg") center / contain no-repeat;
  mask: url("/icons/messages/reply.svg") center / contain no-repeat;
}
```

```html
<span class="icon-mask" aria-hidden="true"></span>
```

### CSS helper

`uqzera-icons.css` provides the base class, fixed size utilities, color
utilities and an accessible icon-button helper:

```html
<svg class="uqzera-icon uqzera-icon--20 uqzera-icon--accent" aria-hidden="true">
  <use href="/icons/uqzera-icons.svg#uqzera-live-location"></use>
</svg>
```

| Class | Effect |
| --- | --- |
| `.uqzera-icon` | Base stroke geometry, `currentColor`, 1.5em default size |
| `.uqzera-icon--16` ... `--48` | Fixed 16, 20, 24, 32 or 48px square |
| `.uqzera-icon--accent` | Applies `var(--uqzera-accent)` |
| `.uqzera-icon--muted` | Applies `var(--uqzera-muted)` |
| `.uqzera-icon--display` | 2px stroke for large display sizes |
| `.uqzera-icon-button` | 44x44 icon-only button with focus ring |

### React

Create one component per icon, or generate them from `icon-manifest.json`.
Inline SVG keeps full control over accessibility and color:

```jsx
export function ReplyIcon({ size = 24, className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      <path d="M9.5 6.5 4 12l5.5 5.5" />
      <path d="M4 12h8.2a5.3 5.3 0 0 1 5.3 5.3V19" />
    </svg>
  );
}
```

Use it inside a button that carries the accessible name:

```jsx
<button type="button" aria-label="Reply" className="icon-button">
  <ReplyIcon size={20} />
</button>
```

Color comes from CSS:

```css
.icon-button { color: #8696A0; }
.icon-button:hover { color: #F5F7F9; }
.icon-button[aria-pressed="true"] { color: var(--uqzera-accent, #10B981); }
```

### Next.js

Option A - SVGR (recommended for many icons):

```bash
npm install --save-dev @svgr/webpack
```

```js
// next.config.js
module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
```

```jsx
import Reply from "@/icons/messages/reply.svg";

export function ReplyButton() {
  return (
    <button type="button" aria-label="Reply">
      <Reply width={20} height={20} aria-hidden="true" focusable="false" />
    </button>
  );
}
```

Option B - copy the component from the React section above into
`components/icons/`. This avoids build configuration and works in Server and
Client Components alike.

Option C - serve the folder from `public/icons/` and use `<img>` or CSS masks.

### Sizing

The set is drawn for a 24px baseline and tested at these sizes:

| Size | Typical use |
| --- | --- |
| 16px | Dense lists, message status ticks, inline metadata |
| 20px | Toolbars, input actions, chat rows |
| 24px | Default navigation and menus |
| 32px | Section headers, empty states |
| 48px | Onboarding, feature cards, preview |

At 32px and above you may set `stroke-width: 2` for slightly stronger presence:

```css
.my-large-icon { stroke-width: 2; }
```

The CSS helper exposes the same adjustment as `.uqzera-icon--display`.

Do not go below 16px. At 14px the 1.8px stroke and fine details begin to merge.

### Accent color

Accent strokes are hard-coded to `#10B981` where the state must stay emerald.
To let a host app retheme them, define the variable:

```css
:root { --uqzera-accent: #10B981; }
```

If you need fully themeable accent strokes, replace `#10B981` with
`var(--uqzera-accent, #10B981)` in the SVG files during your build, or use the
`.uqzera-icon--accent` helper class with the sprite.

---

## Accessibility

- Every file ships with `role="img"` and an `aria-label` naming the icon.
- When an icon is **decorative** (paired with visible text or a labeled button),
  set `aria-hidden="true"` and remove `role`/`aria-label` in your component.
- When an icon is **standalone and interactive**, put the accessible name on the
  control (`<button aria-label="...">`), not only on the SVG.
- Icons are purely presentational; never use color alone to convey state. Pair
  read ticks, mute slashes and selection marks with text or `aria-pressed`.
- Minimum target size for icon-only buttons should be 44x44 CSS pixels even when
  the glyph renders at 20px or 24px.

---

## Manifest

`icon-manifest.json` describes the full set for tooling, search and codegen.

```json
{
  "name": "UQZERA Icon Library",
  "version": "1.1.0",
  "grid": 24,
  "strokeWidth": 1.8,
  "color": "currentColor",
  "accent": "#10B981",
  "sprite": "uqzera-icons.svg",
  "stylesheet": "uqzera-icons.css",
  "preview": "preview/index.html",
  "total": 91,
  "categories": [
    {
      "id": "messages",
      "title": "Message Actions",
      "count": 14,
      "icons": [
        {
          "slug": "reply",
          "name": "Reply",
          "file": "messages/reply.svg",
          "tags": ["message", "respond", "quote", "arrow"],
          "description": "Left-turning reply arrow with a message tail."
        }
      ]
    }
  ]
}
```

Top-level fields point at the sprite, stylesheet and preview so tooling can
resolve the companion files without guessing paths.

Each icon entry provides:

| Field | Meaning |
| --- | --- |
| `slug` | Stable kebab-case identifier, matches the filename |
| `name` | Human-readable label for menus and tooltips |
| `file` | Path relative to the library root |
| `tags` | Search synonyms used by the preview |
| `description` | One-line visual description for docs and alt text |

---

## Preview

`preview/index.html` is a standalone, dependency-free gallery:

- Light/dark gallery theme toggle, remembered in `localStorage`
- Search by name, slug, tag or description, synced to `?q=`
- Category filter chips with live counts, synced to `?cat=`
- Dark, light and emerald rendering of every icon
- 16/20/24/32/48 size ramp per card, plus 16/20/24/32/48/64 in the detail view
- Click any card or its expand button for a detail dialog with tags, copy SVG,
  copy JSX and download SVG
- Click-to-copy production SVG on every card, with a confirmation toast
- Keyboard: `/` focuses search, `Esc` clears it, `Esc` closes the dialog
- Responsive glassmorphism layout with reduced-motion support
- Deep links: `preview/index.html?cat=calls` or `?cat=status&q=tick`

No server or build step is required. Open the file directly, or serve the folder:

```bash
npx serve uqzera-icons
```

Note: clipboard access and external sprite `<use>` are most reliable when the
folder is served over HTTP rather than opened as `file://`.

---

## Quality checks

The set was validated before delivery:

- 91 SVG files present, 91 manifest entries, no missing or extra slugs
- Every file parses as well-formed XML
- All filenames are unique kebab-case and match their manifest `slug`
- No duplicate icon geometry across files
- Consistent `viewBox`, stroke width, caps and joins
- Reviewed at 96px for detail quality and at 16px for legibility
- Sprite contains all 91 symbols with unique `uqzera-<slug>` ids
- Preview search, category filters, theme toggle, detail dialog and size ramps
  tested in a real browser
- Three glyphs were redrawn after the first visual review
  (`passkey-fingerprint`, `end-call`, `read-receipts-toggle`)

---

## Adding an icon

1. Draw on the 24x24 grid with 2px padding and a 1.8px stroke.
2. Save as `<category>/<kebab-slug>.svg` using the standard `<svg>` attributes.
3. Add an entry to `icon-manifest.json` with name, tags and description.
4. Regenerate `uqzera-icons.svg` so the sprite includes the new symbol.
5. Open `preview/index.html` and confirm search, color and size rendering.
6. Check the glyph at 16px before committing.

---

## License

Original artwork created for UQZERA. Free to use, modify and redistribute within
UQZERA products and documentation. Do not resell the set as a standalone icon
pack.
