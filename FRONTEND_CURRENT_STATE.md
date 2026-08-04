# Tongs & Tongues — Current Frontend State (for redesign brief)

This documents what exists in the codebase **today**, so a design pass can start from ground truth instead of re-deriving it. This is a UI/UX and motion-design refresh — no product/feature changes and no backend changes are in scope unless noted.

---

## 1. What the app is

**Tongs & Tongues** is a Weber South Africa companion app with two features:

1. **Coaster collection** — users scan a QR code printed on a physical Weber-branded coaster to unlock it. Each coaster teaches one braai item's name in one South African language. There are 5 items × 5 languages = 25 coasters total. Collecting all 5 languages for one item ("completing a set") unlocks a 10%-off reward at a Weber retailer.
2. **Monthly Braai Challenge** — a rotating monthly theme (e.g. "post your braai with your coaster in shot"). Users submit a photo entry, the community fire-votes (🔥) entries, a live leaderboard ranks them (top 3 get medal treatment), and the month auto-closes with the top-voted entry winning a unique voucher code, revealed only to that user with a celebratory screen. A Hall of Fame archives past winners.

Items: charcoal, kettle, tongs, apron, chimney-starter.
Languages: Zulu (ZU), Xhosa (XH), Afrikaans (AF), Sesotho (SO), Setswana (TS).

---

## 2. Tech stack (keep as-is — this is a UI-layer redesign)

- **Next.js App Router** + TypeScript, mostly server components fetching via Supabase, with small `"use client"` islands for interactivity.
- **Tailwind CSS v4**, tokens defined with `@theme inline` in [src/app/globals.css](src/app/globals.css).
- **shadcn/ui** primitives in [src/components/ui/](src/components/ui/) — `button`, `card`, `dialog`, `tabs`, `input`, `label`, `avatar`, `badge`, `sonner`. Built on `@base-ui/react` — the `Button` uses a `render`/`nativeButton` prop pattern (not Radix's `asChild`), e.g. `<Button render={<Link href="/scan" />} nativeButton={false}>`.
- **Supabase** (Postgres + Auth + Storage): schema in [supabase/schema.sql](supabase/schema.sql), typed queries in `src/lib/supabase/queries.ts`, generated types in `src/lib/database.types.ts`.
- **Fonts**: Oswald (`--font-heading` — used uppercase + tracked for all headings) and Inter (`--font-body`).
- **Icons**: lucide-react. **Toasts**: sonner. **Validation**: zod. **QR scanning**: html5-qrcode. **Dates**: date-fns.
- No animation library is installed — all current motion is hand-rolled CSS keyframes/transitions (see §5). `tw-animate-css` is a dependency but the bespoke keyframes in `globals.css` do the actual work.

---

## 3. Design tokens (current)

From [src/app/globals.css](src/app/globals.css):

**Brand palette**
- `--weber-black: #0c0c0c`
- `--weber-cream: #f5f3ee`
- `--weber-red: #d8291d`
- `--weber-white: #ffffff`
- `--weber-border: #e0ded6`
- `--weber-ember: #f2994a` (used only in gradients/particles, not a shadcn token)

**shadcn semantic tokens** are wired straight to the brand palette: `--background`/`--foreground` = cream/black, `--primary` = weber-red, `--secondary` = weber-black, `--muted`/`--border`/`--input` = weber-border, `--muted-foreground: #6b6860`. Full parallel `.dark` theme exists (black background, `#171717` cards, `oklch(1 0 0 / 12%)` borders) but there's no visible theme toggle in the UI — `next-themes` is a dependency but unused in `layout.tsx`.

**Radius scale**: base `--radius: 1rem`, with `--radius-sm` … `--radius-4xl` derived as multiples of it (0.6× to 2.6×). Most surfaces in practice use hardcoded `rounded-2xl` / `rounded-[20px]` / `rounded-full` rather than the token scale.

**Typography**: all headings (`h1`–`h4`) are forced `font-heading uppercase tracking-tight` globally. Body text uses Inter via `font-sans`.

---

## 4. Screens (route → what's on it)

All pages are mobile-first, single column, `mx-auto max-w-md`, with a fixed bottom nav (see §6) and `pb-24` body padding to clear it.

| Route | File | Purpose / current layout |
|---|---|---|
| `/` | [src/app/page.tsx](src/app/page.tsx) | Home. Header with wordmark + circular "TT" monogram badge. Black rounded progress panel ("Your Coasters" — count / total, animated ember-gradient progress bar). Full-width red "Scan a Coaster" CTA button. 2-column grid of 5 item tiles ("Your Rack") — circular colored monogram + item name + `n/5 languages`. If a challenge is active, a red-gradient banner links to `/feed`. |
| `/scan` | [src/app/scan/page.tsx](src/app/scan/page.tsx) + [qr-scanner.tsx](src/components/qr-scanner.tsx) | Centered header + live camera viewfinder (black rounded square, corner-bracket SVG overlay). States: starting → scanning → camera error (dark panel, icon + message) → result (dark overlay, circular coaster reveal with monogram badge, word, phonetic, drop-in animation) → "Scan Next Coaster" button. |
| `/collection` | [src/app/collection/page.tsx](src/app/collection/page.tsx) | "Coaster Rack" list — one row per item, each row is a horizontal strip of 5 small circles (52px) — filled/colored circle with language code if unlocked, dashed-outline empty circle if locked. "View →" link per item to detail. |
| `/collection/[item]` | [src/app/collection/[item]/page.tsx](src/app/collection/[item]/page.tsx) + [coaster.tsx](src/components/coaster.tsx) | Item detail. Back link, header (item name, n/5 collected). Big single **Coaster** component (224px circle): front face shows monogram + language label on a dark radial gradient with a colored rim; tap-to-flip reveals the word + phonetic on a cork-textured (diagonal repeating-gradient) back with a red rim; locked state is a dashed-outline empty circle. Small dot-pagination below to switch languages. If the set is complete: a black "Set Complete" summary panel + a one-time `Dialog` (`set-complete-modal.tsx`) celebrating it (pulsing icon badge, dashed reward panel), gated by a `localStorage` "seen" flag. |
| `/feed` | [src/app/feed/page.tsx](src/app/feed/page.tsx) | Challenge hub. Full-bleed dark gradient hero: "This Month's Challenge" label, theme text, countdown (`challenge-countdown.tsx` — days/hrs/min pill trio, days pulses) + small "Enter" button. If the current user won, a `WinnerBanner` gradient strip appears (dismissed permanently once opened, via localStorage). A sticky "Your entry: #rank · n 🔥" bar if the user has an entry. Below: leaderboard list (`leaderboard-row.tsx`) — rank/medal (🥇🥈🥉 then numeric), 52px photo thumbnail, name + caption, springy fire-vote button with optimistic count. Empty state: dashed panel + flame icon. Footer link to Hall of Fame. |
| `/feed/new` | [src/app/feed/new/page.tsx](src/app/feed/new/page.tsx) + [new-entry-form.tsx](src/components/new-entry-form.tsx) | Back link, "Your Entry" header, theme reminder chip. Tap-to-upload square photo picker (dashed border, camera-capture input), optional name + caption text inputs, full-width submit button with spinner state. |
| `/feed/winner` | [src/app/feed/winner/page.tsx](src/app/feed/winner/page.tsx) + [winner-reveal.tsx](src/components/winner-reveal.tsx) | Full celebratory reveal: rising ember particles (5 absolutely-positioned dots animating upward + fading), glowing trophy badge, "You Won!" heading, theme recap, dashed-border voucher-code panel with copy-to-clipboard button, redeem note, back-to-challenge link. Redirects to an empty state if no voucher exists. |
| `/hall-of-fame` | [src/app/hall-of-fame/page.tsx](src/app/hall-of-fame/page.tsx) | Back link + header. List of past winners: photo thumbnail, month/year, winner name, caption/theme, masked voucher (`WEBER-BRAAI-••••`). Empty state: dashed panel + trophy icon. |
| `/redeem` | [src/app/redeem/page.tsx](src/app/redeem/page.tsx) | Header. If user holds an active voucher, a black panel shows the code. Static list of 6 retailer cards (name, suburb/city, address/phone/hours with icons). |

---

## 5. Shared components

- **`bottom-nav.tsx`** — fixed, blurred/translucent bar, 5 tabs (Home, Scan, Rack, Challenge, Redeem), active tab gets a sliding underline indicator (`translateX` based on index) plus icon scale/stroke-weight change.
- **`coaster.tsx`** — the core collectible UI: circular flip card with a locked/front/back state machine, driven by local `useState`, no library.
- **`qr-scanner.tsx`** — wraps `html5-qrcode` imperatively; owns its own state machine (starting/scanning/camera_error/result); the "result" state reuses the same coaster visual language as the collection detail page but bespoke, not the shared `Coaster` component.
- **`set-complete-modal.tsx`** — shadcn `Dialog`, one-time-per-item via `localStorage` key.
- **`challenge-countdown.tsx`** — client-side `setInterval` ticking days/hrs/min, no seconds.
- **`leaderboard-row.tsx`** — optimistic vote toggle with rollback-on-error via `useTransition`.
- **`winner-banner.tsx`** / **`winner-reveal.tsx`** — banner is a dismiss-once teaser; reveal is the full-screen celebration, both keyed off the same voucher code and a `localStorage` "seen" flag.
- **`new-entry-form.tsx`** — uncontrolled file input + zod-validated text fields, uses `URL.createObjectURL` for local preview (plain `<img>`, not `next/image`, since it's a blob URL).

All "unlock/celebrate" motion is currently CSS-only:
- `animate-coaster-drop` — scale+translateY spring-in (cubic-bezier overshoot), used on coaster reveals.
- `animate-glow-pulse` — pulsing box-shadow ring, used on celebratory icon badges and the winner banner.
- `animate-ember-rise` — particles translate up + shrink + fade, looping, used on the winner-reveal screen.
- `animate-tick-pulse` — opacity pulse on the countdown's "days" digit.
- `progress-ember-fill` — animated horizontal gradient sweep, used for the home progress bar.
All keyframe animations are disabled under `prefers-reduced-motion: reduce`.

There is no shared "reveal/celebration" component abstraction — each screen (scan result, coaster flip, set-complete modal, winner reveal) reimplements similar dark-panel + colored-rim + monogram visuals independently with slightly different markup.

---

## 6. Visual character today (honest read, not aspirational)

- Warm cream/black/red Weber palette, uppercase tracked Oswald headings — brand identity is present and consistent.
- Layout is functional and clean but plain: mostly white/cream rounded rectangle cards (`rounded-2xl`, `border-border`, `shadow-sm`), a handful of black "hero" panels, circular monogram badges reused everywhere as the primary visual motif for items.
- The coaster metaphor (circular flip object, cork-texture back) is the most distinctive/tactile piece of UI; everything else (lists, forms, retailer cards) is fairly standard shadcn-style stacked cards.
- Motion exists but is limited to a handful of hand-rolled keyframes reused across screens — no shared animation/celebration system, no page-transition motion, no skeleton/shimmer loading states (pages are server-rendered so there's little client loading state to begin with).
- No dark-mode toggle is exposed even though full dark tokens exist.
- Empty states (feed, hall of fame) use a consistent dashed-border + icon + muted text pattern.
- No imagery/texture beyond CSS gradients — no product photography, no illustration, no custom iconography beyond lucide + text monograms.

---

## 7. Known constraints for a redesign pass

- Keep Supabase auth, RLS posture, and the QR scan mechanic's core logic (`qr-scanner.tsx`) intact — redesign framing/visuals only, not the scanning implementation.
- Keep shadcn/ui + the `render`/`nativeButton` button pattern; extend rather than replace the component library.
- Stay mobile-first, `max-w-md` centered, thumb-reachable (primary actions near the bottom nav).
- Note any new dependency (e.g. introducing Framer Motion for richer sequences), new DB table, or route/component rename explicitly so it's reviewable as a diff.
