# Tongs & Tongues

A mobile-first companion app for the Tongs & Tongues braai campaign. People scan QR codes on physical coasters to collect braai phrases in Zulu, Xhosa and Afrikaans, then enter a monthly braai challenge.

**[View the live demo](https://armand1711.github.io/Tongs-Tongues-Companion-App/)**

## About the demo

The demo has no login or backend, so anyone can try it straight away.

- The people, entries, stores and voucher codes are sample content.
- Visitor activity, including added photos, is saved only in their browser's `localStorage`.
- The Scan tab works with a camera or with built-in sample scans. The printable QR codes are in [`qr-codes/`](qr-codes/).

## Features

- **Coaster collection:** scan coasters, flip them to see the phrase and its meaning, and complete a language set to unlock a reward.
- **Monthly challenge:** enter a photo, vote on a live-ranked leaderboard and comment on entries.
- **Rewards:** the winner gets a voucher and a place in the Hall of Fame, with a list of stores for redeeming it.

## Tech stack

Next.js (static export), React, TypeScript and Tailwind CSS, deployed to GitHub Pages with GitHub Actions.

The full version used Supabase for accounts, the database and photo storage. Its database design is still in [`supabase/schema.sql`](supabase/schema.sql), and the sample data layer that replaces it is in [`src/lib/demo/`](src/lib/demo/).

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.
