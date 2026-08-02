# Redesign Brief — Tongs & Tongues (Weber South Africa)

Paste this whole document into Claude (claude.ai, or a fresh Claude Code session pointed at this repo) as your prompt. It has everything an agent needs to redesign the UI and ship the two product changes below without re-deriving context from scratch.

---

## 1. What this app is

**Tongs & Tongues** is a Weber South Africa companion app (Next.js App Router + Tailwind v4 + shadcn/ui + Supabase). Two features exist today:

1. **Collectible cards** — users scan a QR code printed on a physical item (charcoal, kettle, tongs, apron, chimney starter) to "unlock" a card that teaches that item's name in 5 South African languages (Zulu, Xhosa, Afrikaans, Sesotho, Setswana). Collecting all 5 languages for one item unlocks a 10%-off reward at a Weber retailer.
2. **Braai feed** — users post a photo of their braai with an optional caption, other users "fire-vote" (🔥) posts, and a tab lets you filter by Today / This Week / This Month / All Time.

Tech stack (keep this — don't rewrite the architecture, just the UI/UX layer and the two features described below):
- Next.js App Router, TypeScript, Tailwind CSS v4 (`@theme inline` tokens in `src/app/globals.css`)
- shadcn/ui primitives in `src/components/ui/` (button, card, dialog, tabs, input, label, avatar, sonner) — base-ui driven, uses the `render`/`nativeButton` prop pattern, not `asChild`
- Supabase (Postgres + Auth + Storage) — schema in `supabase/schema.sql`, typed queries in `src/lib/supabase/queries.ts`, generated types in `src/lib/database.types.ts`
- Fonts: Oswald (`--font-heading`, used uppercase/tracked for all headings) + Inter (`--font-body`)
- Icons: lucide-react. Toasts: sonner. Validation: zod.
- Brand palette (`src/app/globals.css`): `--weber-black #0c0c0c`, `--weber-cream #f5f3ee`, `--weber-red #d8291d`, `--weber-white #ffffff`, `--weber-border #e0ded6`, full light/dark theme already wired through shadcn tokens (`--primary`, `--card`, `--muted`, etc). Base radius is `1rem` with `--radius-sm` … `--radius-4xl` scale already defined.
- Mobile-first single column, `max-w-md` centered, fixed bottom nav (`src/components/bottom-nav.tsx`) with 5 tabs.

Current screens: `/` (home/progress), `/scan` (QR scanner), `/collection` and `/collection/[item]` (grid + per-item language cards), `/feed` and `/feed/new` (photo feed + composer), `/redeem` (retailer list). Key components: `language-card.tsx`, `post-card.tsx`, `set-complete-modal.tsx`, `qr-scanner.tsx`, `feed-tabs.tsx`.

The current UI is functional but plain: flat cards, no motion, default shadcn styling. **We want it to feel like a premium, tactile, fire-and-smoke braai brand app** — not a generic CRUD UI.

---

## 2. Product change #1 — Cards become Coasters

We're moving from "scan a QR code on the product" to **physical Weber-branded coasters**. Users collect coasters (each one printed with a QR code + a South African language word for a braai item) instead of scanning the item itself. Rework the concept and all user-facing copy/visuals accordingly:

- Rename the collectible unit from **"card" → "coaster"** everywhere in UI copy, route labels, and component names (`language-card.tsx` → something like `coaster.tsx`; `/collection` stays but its contents present as a coaster set/rack, not a card binder).
- Visual form factor: **redesign the collectible as a circular/coaster-shaped object**, not a rectangular card. Think cork/wood-grain texture on the back, Weber-red rim, item icon + language name embossed on the front, a satisfying "flip" or "place down" reveal animation when unlocked (coaster physically drops/lands with a subtle bounce + sound-free thud feel via scale/shadow animation).
- "Scan a Card" → **"Scan a Coaster"**. The scan flow/QR mechanic itself doesn't change technically — just the object being scanned and all associated language/imagery.
- Collection view becomes a **coaster rack / coaster stack** metaphor: e.g. a grid of coaster slots per item, locked slots show a faint embossed outline, unlocked ones show the full coaster design. Consider a "flip coaster" interaction to see word + phonetic on the back.
- Update `set-complete-modal.tsx` copy and visuals ("Set Complete" reward) to reference the completed **coaster set**, with a more celebratory animation (confetti/ember particles, scale-in, glow pulse on the reward panel).
- Update `README.md`, `layout.tsx` metadata description, and any "card" strings in `src/lib/constants.ts` comments/DB seed labels that face the user (DB schema/table names like `cards`/`user_collections` can stay as-is internally — this is a UI/copy rename, not necessarily a DB rename, unless you choose to formally rename the schema too; if you do rename the schema, provide a migration).

---

## 3. Product change #2 — Feed becomes a Monthly Braai Challenge

Replace the plain "post whatever, vote with fire" feed with a **monthly challenge** format:

- Each month has one rotating **theme/prompt**, e.g. *"Post your braai with your [Kettle] coaster in the shot"* or *"Show us your coaster in action at your braai."* The theme is set by the app (admin-defined; design the UI to display whatever the current theme text is, plus a countdown to month-end).
- Users submit a photo entry (reuses the existing upload flow at `/feed/new`, but the entry is now explicitly tied to the current month's challenge).
- Community **fire-votes** rank entries live, same voting mechanic as today (`toggleVote`), but now framed as a **leaderboard** — e.g. top 3 entries highlighted (gold/silver/bronze braai-tong badges), with rank number and vote count prominent.
- **Winner determination:** fully automatic — whichever entry has the most votes when the month closes wins. No manual judging step needed.
- **Prize:** the winner receives a **Weber discount voucher**. The app auto-generates a unique voucher code (e.g. `WEBER-BRAAI-XXXX` format) at month-close and reveals it **only to the winning user**, in-app, with a celebratory "You Won!" screen — big reveal animation (confetti/embers, scale + glow), the voucher code shown in a copyable, redeemable-looking card (dashed border, perforated-ticket styling fits the existing dashed reward panel language already used in `set-complete-modal.tsx`). Include a copy-to-clipboard action and a note on how/where to redeem (ties into the existing `/redeem` retailer list).
- Add a **Hall of Fame / past winners** view — small archive of previous months' winning posts + which voucher they won, so the challenge feels ongoing and aspirational.
- Non-winning users should still see the leaderboard and their own entry's rank/vote count clearly (e.g. a sticky "Your entry: #7, 12 🔥" summary).
- Screens/states to design: challenge hero banner (theme + countdown) at top of `/feed`, leaderboard list (replaces the plain feed list — reuse `post-card.tsx` but add rank treatment), submission flow reusing `/feed/new` with the active theme shown as context, winner-reveal screen/modal, past-winners archive.
- This is additive to the existing `posts`/`votes` tables — the agent should design whatever minimal schema extension is needed (e.g. a `challenges` table for theme + month window, a `winners`/`vouchers` table for the generated code) but the **focus of this prompt is the UI/UX and motion design**, not the backend — treat backend as "assume these tables/queries exist, design against them."

---

## 4. Visual & motion direction

Keep the Weber brand palette (cream/black/red) — don't reskin the brand, **elevate** it:

- **Mood**: warm ember glow, charcoal smoke, tactile materials (cork, kraft paper, matte metal), confident bold uppercase Oswald headings (already established), generous whitespace, high-contrast red accents used sparingly for emphasis (CTAs, active states, fire votes, streaks).
- **Motion language**: purposeful, physical, quick (150–300ms), spring/ease-out based, never gratuitous. Examples to include:
  - Page/route transitions with subtle fade + slight upward slide
  - Progress bar on home screen fills with an animated ember/gradient sweep, not a flat fill
  - Coaster unlock: flip/drop-in reveal with scale + shadow bounce
  - Set-complete & challenge-winner moments: full celebratory animation (confetti or ember particles), haptic-feeling scale pulse
  - Fire-vote button: springy scale + flame flicker/glow on tap, optimistic UI already exists in `post-card.tsx` — animate around it
  - Countdown timer on the challenge banner: smooth tick, subtle pulse as it nears zero
  - Skeleton/shimmer loading states instead of blank flashes
  - Bottom nav: active tab indicator that slides/morphs between icons rather than just changing color
  - Leaderboard rank changes: subtle reorder animation when votes update
- Use CSS/Tailwind transitions + `tw-animate-css` (already a dependency) as the default toolkit; introduce Framer Motion (`motion` package) only if needed for the richer sequences (coaster reveal, confetti, leaderboard reorder) — call out explicitly in your plan if you add a new dependency.
- Respect `prefers-reduced-motion` throughout.
- Everything is mobile-first, `max-w-md` centered, thumb-reachable — keep primary actions within easy thumb range of the bottom nav.

---

## 5. What NOT to change

- Don't rip out Supabase auth, the existing RLS posture, or the QR scan mechanic's core logic (`qr-scanner.tsx`) — just its framing/copy/visuals.
- Don't abandon shadcn/ui primitives or the `render`/`nativeButton` button pattern — extend them, don't replace the component library wholesale.
- Keep the app installable/usable as a lightweight mobile web app (no heavy new frameworks).

---

## 6. Deliverable

Redesign screen-by-screen (Home, Scan, Collection, Coaster detail, Feed/Challenge, New Entry, Winner reveal, Hall of Fame, Redeem, Bottom nav), component by component, in TypeScript, matching the existing file/folder conventions. Call out anywhere you're introducing a new dependency, a new DB table, or renaming an existing route/component, so it's easy to review as a diff.
