# Bloom & Bean — reservation website

A Next.js reservation site for a café, built from a Google Stitch design.
Guests fill out a form; it's validated, saved to a Google Sheet, and emailed
to the guest — all through one free Google Apps Script backend (no Google
Cloud Console, no paid email service, no domain required to get started).

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Validation**: Zod, shared between client and server
- **Backend**: a single spreadsheet-bound Google Apps Script Web App
- **Hosting**: designed to deploy on [Vercel](https://vercel.com) for free

---

## What was built

- The full Stitch design converted 1:1 into React components (`components/`), preserving layout, colors, typography, copy, and images.
- A working reservation form (`components/ReservationForm.tsx`) with client + server validation, a honeypot, duplicate-submit protection, and three distinct outcome states.
- `POST /api/reservations` (`app/api/reservations/route.ts`), which validates input, generates a reservation code, and calls the Apps Script Web App — never exposing the Web App URL or shared secret to the browser.
- `lib/site-config.ts` — every non-secret business detail (hours, address, menu, deposit amount, WhatsApp link) in one place.
- The Apps Script backend (`apps-script/`) that writes to your existing Google Sheet, emails the guest through Gmail, and creates a Calendar event when staff marks a reservation Paid.
- A floating WhatsApp button, always visible, linking to `https://wa.me/639426529501`.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the two values — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The reservation form
will show a configuration error until you complete the Apps Script setup
below and fill in `.env.local`.

### Required checks before shipping any change

```bash
npm run build
npx tsc --noEmit
npm run lint
```

All three must pass. If `eslint-config-next` and your installed ESLint
version ever drift apart, pin ESLint to the latest ESLint 9.x release rather
than silencing the error — do not use the deprecated `next lint` command.

---

## Setup wizard

### ☐ 1. Set up the Google Sheet + Apps Script backend

This is the part that makes the form actually save data and send email.
Follow **[apps-script/README.md](./apps-script/README.md)** end to end —
it's six numbered checkpoints, each with an exact click path and a success
check. Do this before deploying to Vercel, since you'll need the resulting
Web App URL and shared secret for step 3 below.

### ☐ 2. Push this project to GitHub

```bash
git init                     # only if this folder isn't already a git repo
git add .
git commit -m "Bloom & Bean reservation site"
git branch -M main
git remote add origin https://github.com/Bienvenido19/Cafe_Website.git
git push -u origin main
```

If `origin` already points somewhere else, check with `git remote -v` first
rather than overwriting it blindly.

### ☐ 3. Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the
   `Bienvenido19/Cafe_Website` GitHub repository.
2. Vercel auto-detects Next.js — leave the build settings on their defaults
   (Build Command `next build`, Output uses the Next.js preset).
3. Before the first deploy, expand **Environment Variables** and add:
   - `APPS_SCRIPT_WEB_APP_URL` — the `/exec` URL from apps-script checkpoint 5
   - `APPS_SCRIPT_SHARED_SECRET` — the same `SHARED_SECRET` value you set in Apps Script Script Properties
4. Click **Deploy**.
5. Once live, open the deployed URL, submit a real test reservation, and
   confirm the row appears in your Google Sheet and the email arrives (see
   apps-script/README.md checkpoint 6 for the full end-to-end test).

If you add or change an environment variable later, redeploy from the
Vercel dashboard (**Deployments → ⋯ → Redeploy**) so the new value takes
effect.

### ☐ 4. Confirm the WhatsApp button and remaining placeholders

- The floating WhatsApp button already opens `https://wa.me/639426529501`.
- `lib/site-config.ts` has several fields marked `// REVIEW:` — the real
  street address, phone number, and Maps/Instagram links were placeholders
  in the original Stitch design and were **not invented**. Fill in the real
  values there before launch.

---

## Environment variables

Only two variables exist, and neither is exposed to the browser:

| Variable | Where it's used | Notes |
|---|---|---|
| `APPS_SCRIPT_WEB_APP_URL` | Server only (`lib/apps-script-client.ts`) | Must end in `/exec` |
| `APPS_SCRIPT_SHARED_SECRET` | Server only | Must exactly match Apps Script's `SHARED_SECRET` property |

`.env.local` is git-ignored. Never commit it, and never prefix either
variable with `NEXT_PUBLIC_`.

---

## Project structure

```
app/
  api/reservations/route.ts   POST endpoint: validate → call Apps Script → respond
  layout.tsx, page.tsx        Root layout and page composition
  globals.css                 Design tokens ported from the Stitch export
components/                   One component per page section, plus the form
lib/
  site-config.ts              Centralized business config (non-secret)
  validation.ts                Shared Zod schema + spreadsheet-injection guard
  reservation-code.ts          BB-YYYYMMDD-XXXX code generator
  apps-script-client.ts        Server-only fetch wrapper for the Web App
apps-script/
  Code.gs                     The entire Apps Script backend
  appsscript.json             Manifest (scopes, timezone, web app config)
  README.md                   Six-checkpoint setup wizard for non-developers
```

## What remains unverified without manual testing

Automated checks (`build`, `tsc`, `lint`) cannot exercise real Google
services. The following can only be confirmed by hand, per
apps-script/README.md checkpoint 6:

- Gmail actually delivers the confirmation email with correct formatting.
- The column B "Open email" link actually finds the sent message in Gmail.
- Marking a row Paid actually creates one Calendar event and invites the guest.
- Re-marking the same row Paid does not create a duplicate event.
