# Kira Haq

A single-process e-commerce and content platform for a Sunnah-inspired natural foods and
wellness brand. It sells honey, cold-pressed oils, dates and wellness gift packs, publishes a
blog, offers Hijama/Ruqyah consultation bookings, and includes a full customer account area
and a 17-tab admin dashboard.

The storefront is a React 19 + Vite single-page application. A Node.js/Express server hosts
that SPA **and** a `/api/*` backend (payment orchestration + a Gemini-backed wellness
advisor) from the **same origin**, so it can be deployed as one process.

---

## Project Overview

Kira Haq ("Pure by Nature, Guided by Sunnah") is a storefront + operations tool for a
Bangladeshi natural-products brand.

What the application actually does today:

- **Storefront** — hero/banner/featured sections, product catalogue with search, filtering,
  category browsing, product detail with gallery/video/variants/reviews, cart drawer,
  wishlist and a multi-step checkout.
- **Multi-currency pricing** — 17 currencies (`src/types.ts`) with IP/timezone-based
  auto-detection (`src/App.tsx`) and admin-managed exchange rates.
- **Customer accounts** — email/password sign-up, sign-in, email verification and password
  reset backed by **Firebase Auth**, with a profile document written to **Firestore**
  (`src/lib/firebase.ts`). Includes orders, addresses, reviews, wishlist, tickets,
  notifications and an invoice modal.
- **Admin dashboard** — 17 tabs (`src/pages/AdminDashboardPage.tsx:91`): overview, products,
  inventory, categories, orders, customers, reviews, blog, coupons, shipping, consultations,
  subscribers, reports, settings, contact, moderators, payments.
- **Payments** — a provider-abstracted payment service (`server/payment/`) with **bKash**,
  **Nagad**, **card (SSLCommerz-style hosted checkout)**, **Cash on Delivery** and a
  manual/COD fallback, plus verify, status, refund and gateway webhook routes.
- **AI wellness advisor** — `POST /api/ai-advisor` calls the **Gemini API** through
  `@google/genai`, with a built-in fallback response when no API key is configured.
- **Content** — blog (3 seeded posts), categories, testimonials, newsletter capture,
  consultation booking form, contact form, and a WhatsApp/Messenger deep-link chat launcher
  (`src/components/ChatModal.tsx`).

> Scope note, stated honestly: catalogue data is seeded from TypeScript modules in
> `src/data/`, and most admin/customer state is persisted in browser `localStorage`.
> **Firestore is currently used only for the `users` profile document** created at sign-up.
> Orders, products, reviews and admin settings are *not* server-persisted.

---

## Architecture

```
                    ┌──────────────────────────────────────────┐
   Browser  ────────▶  Single Node.js process (Express)         │
                    │                                          │
                    │  dev  : Vite in middleware mode (HMR)    │
                    │  prod : express.static("dist") + SPA      │
                    │         fallback to dist/index.html       │
                    │                                          │
                    │  /api/health                             │
                    │  /api/ai-advisor      ──▶ @google/genai  │
                    │  /api/payments/*      ──▶ PaymentService │
                    │                            ├─ BkashProvider
                    │                            ├─ NagadProvider
                    │                            ├─ CardProvider
                    │                            └─ COD / manual
                    └──────────────────────────────────────────┘
                          │ same-origin fetch("/api/...")
                          ▼
                    React 19 SPA (rendered by Vite)
                          │
                          ├── Firebase Auth   (src/lib/firebase.ts)
                          └── Firestore      (users/{uid} profile doc)
```

Key architectural facts:

- **Single process, single origin.** There is no separate API host. `server.ts` mounts the
  Vite dev middleware *inside* Express during development and serves the compiled `dist/`
  in production. The frontend therefore always calls same-origin relative URLs such as
  `/api/health` and `/api/payments/create` — there is no API base URL to configure and no
  Vite dev proxy.
- **Port** is `Number(process.env.PORT) || 3000` (`server.ts:11`), so cPanel/Passenger can
  inject `PORT` while local development falls back to `3000`.
- **`app.js`** is the 4-line Phusion Passenger entry point that loads `dist/server.cjs`.

### Technology

| Layer | Technology |
|---|---|
| UI | React 19, React DOM 19, TypeScript 5.8 |
| Build | Vite 6, `@vitejs/plugin-react`, Tailwind CSS 4 (`@tailwindcss/vite`) |
| Icons / media | `lucide-react`, `swiper` (product gallery) |
| Server | Node.js, Express 4, `@google/genai` |
| Auth / DB | Firebase 12 (`firebase/auth`, `firebase/firestore`) |
| Bundling | `esbuild` (server bundle), `tsx` (dev execution) |

Declared but **not currently imported anywhere in `src/`**: `@splidejs/react-splide`,
`motion`, `dotenv`. They are harmless but can be removed later.

---

## Features

Implemented and present in the source:

**Storefront**
- Responsive landing page composed of `HeroSection`, `DiscountBannerSection`,
  `CategoriesSection`, `FeaturedProducts`, `ConsultationSection`, `BlogSection`,
  `TestimonialsSection`, `ValuePropositionBar`, `Newsletter`, `Footer`.
- Product catalogue (`ProductsPage`) with search modal, category filter, offer/discount
  filters and sorting.
- Product detail (`ProductDetailPage`) with image gallery, video player, variant selector,
  size-guide modal, tabbed accordion, reviews section and sticky add-to-cart bar.
- Cart drawer with quantity management; multi-step `CheckoutPage` with coupon and
  shipping-charge application.
- Wishlist, product sharing, and `window.print()`-based invoice (`InvoiceModal`).

**Accounts (Firebase Auth + Firestore)**
- Sign-up with display-name sync, verification email, and Firestore profile write.
- Sign-in by email or registered phone number.
- Email verification handling, resend, and polling (`VerifyEmailPage`).
- Password reset via Firebase email.
- Account area: overview, orders, addresses, reviews, wishlist, tickets, notifications,
  cart, profile with password strength meter.
- A documented local "resilient mode" fallback if the Firebase Email/Password provider is
  disabled or the domain is unauthorized (`src/lib/firebase.ts:186-221`).

**Admin dashboard (17 tabs)**
Products, inventory/stock, categories, orders, customers, reviews, blog, coupons,
shipping, consultations, subscribers, reports, payments, moderators, settings, contact,
overview.

**Payments (server-side)**
- Provider abstraction with a singleton `PaymentService` (`server/payment/PaymentService.ts`).
- Method→provider mapping (`mapMethodToProvider`) covering bKash, Nagad, Visa/Mastercard/
  Amex, Cash on Delivery, and manual.
- In-memory idempotency lock (5 s) on payment creation.
- Idempotent token grant with caching for bKash; graceful degradation to a simulated
  checkout when credentials are absent or the gateway errors.
- Full callback handling for bKash, Nagad and card gateways, plus an IPN webhook and refund.

**Other**
- Gemini-backed wellness advisor with catalog-aware system prompt and product
  recommendations.
- Currency auto-detection from browser timezone then IP geolocation (`ipwho.is`, `ipapi.co`).
- Newsletter subscription and consultation/contact form capture into local storage.

---

## Project Structure

```
kirahaq/
├── app.js                     # Passenger / cPanel startup entry (loads dist/server.cjs)
├── server.ts                  # Express app: API routes + Vite middleware / static dist
├── index.html                 # Vite HTML entry (contains the SPA mount + console filter)
├── package.json               # scripts + dependencies
├── package-lock.json          # npm lockfile (committed for reproducible installs)
├── bun.lock                   # original bun lockfile (legacy, kept as-is)
├── vite.config.ts             # React + Tailwind plugins, '@' alias, DISABLE_HMR support
├── tsconfig.json              # strict-less TS config, bundler resolution, noEmit
├── metadata.json              # AI Studio applet metadata
├── firebase-applet-config.json# Firebase web app config (public client values)
├── firebase-blueprint.json    # Firestore entity/collection definitions
├── firestore.rules            # Firestore security rules
├── .env.example               # documented environment variables (placeholders only)
├── .gitignore
│
├── server/                    # ── Backend payment module ──
│   └── payment/
│       ├── PaymentService.ts  # singleton orchestration, idempotency, in-memory store
│       ├── routes.ts          # Express router mounted at /api/payments
│       ├── types.ts           # provider interface + transaction types
│       └── providers/
│           ├── BkashProvider.ts
│           ├── NagadProvider.ts
│           └── CardProvider.ts
│
├── src/                       # ── Frontend ──
│   ├── main.tsx               # React root
│   ├── App.tsx                # shell, routing state, currency detection, sections
│   ├── index.css              # Tailwind entry
│   ├── types.ts               # shared types + seeded admin/manager accounts
│   ├── data/                  # products.ts, blogs.ts, testimonials.ts
│   ├── lib/
│   │   ├── firebase.ts        # Auth + Firestore, resilient-mode fallback
│   │   ├── checkout.ts        # checkout helpers
│   │   └── meta-capi.ts       # Meta Conversions API sender (currently uncalled)
│   ├── utils/videoUtils.ts
│   ├── services/paymentApi.ts # typed fetch wrappers for /api/payments/*
│   ├── pages/                 # 10 page components incl. AccountPage, AdminDashboardPage
│   └── components/
│       ├── …                  # ~24 storefront/modal components
│       ├── product/           # gallery, video, variants, tabs, reviews, sticky cart
│       ├── user/              # 11 account-area components
│       └── admin/             # 17 admin tab components
│
└── dist/                      # BUILD OUTPUT — git-ignored, generated by `npm run build`
    ├── index.html
    ├── assets/index-*.css, index-*.js
    ├── server.cjs             # bundled Express server (production entry)
    └── server.cjs.map
```

There is **no `public/` directory**; Vite's `publicDir` is simply unused.

---

## Installation

**Prerequisites:** Node.js **18 or newer** (18+ is required because the payment providers use
the global `fetch` API). Node 20 or 22 is recommended.

```bash
git clone https://github.com/mohaiminulislamazim-tech/kirahaq.com.git
cd kirahaq.com
npm install
```

`dist/server.cjs` externalizes only three packages — `express`, `@google/genai` and `vite` —
all of which are correctly listed in `dependencies`.

## Development

One command starts the **whole** environment (Express API + Vite frontend with HMR on a
single origin):

```bash
npm run dev
```

Then open <http://localhost:3000>. Vite's standalone dev server (port 5173) is never used.

Environment variables for local development are read from the **shell environment**. Note
that `server.ts` does **not** load `.env` files (`dotenv` is installed but never imported),
so export variables in your shell:

```bash
export GEMINI_API_KEY="your-key"
export APP_URL="http://localhost:3000"
npm run dev
```

| Script | Purpose |
|---|---|
| `npm run dev` | Express + Vite middleware, HMR, single origin |
| `npm run lint` | `tsc --noEmit` type check |
| `npm run build` | Production build → `dist/` |
| `npm start` | Runs the already-built `dist/server.cjs` |
| `npm run preview` | Vite's standalone static preview (no API) |
| `npm run clean` | Remove `dist/` and `server.js` |

## Production Build

```bash
npm run lint     # must pass before building
npm run build
```

`npm run build` runs two steps:

1. `vite build` → compiles the React SPA into `dist/index.html` and `dist/assets/`
   (hashed JS/CSS filenames).
2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external
   --sourcemap --outfile=dist/server.cjs` → bundles the Express server and all of
   `server/payment/**` into a single CommonJS file.

Produced artifacts:

| File | Purpose |
|---|---|
| `dist/index.html` | SPA entry document |
| `dist/assets/index-*.js` | Compiled React bundle |
| `dist/assets/index-*.css` | Compiled Tailwind stylesheet |
| `dist/server.cjs` | Production Express server (the file Passenger loads) |
| `dist/server.cjs.map` | Source map for the server bundle |

## Production Start

Locally:

```bash
npm run build
NODE_ENV=production npm start          # → http://localhost:3000
```

On cPanel the equivalent entry point is the root `app.js`.

`NODE_ENV` selects the serving mode (`server.ts:74-86`):

- `NODE_ENV !== "production"` → Vite dev middleware is mounted (development).
- `NODE_ENV === "production"` → `express.static("dist")` plus a `GET *` SPA fallback to
  `dist/index.html`.

---

## Environment Variables

Copy `.env.example` for reference. **Real values belong in cPanel → Setup Node.js App →
Environment Variables, or in your shell — never in committed files.**

### Required

| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Selects static `dist` serving. cPanel's *Application mode: Production* usually sets this — verify it. |
| `APP_URL` | `https://yourdomain.com` | Public origin, **no trailing slash**. Used to build every payment gateway callback/webhook URL. If empty, callbacks become relative and gateways will reject them. |

### Provided by the host

| Variable | Notes |
|---|---|
| `PORT` | Injected by cPanel / CloudLinux Passenger. **Do not set it.** Falls back to `3000` locally. Verified that `PORT=8199` is honoured. |

### Optional — AI

| Variable | Notes |
|---|---|
| `GEMINI_API_KEY` | Enables live Gemini responses in `/api/ai-advisor`. Without it the endpoint returns a built-in fallback answer instead of erroring. |

### Optional — Payments

Leave these empty to keep the built-in **simulated/sandbox checkout** behaviour; the API
still returns valid `200` responses with `metadata.simulated: true`.

| Variable | Notes |
|---|---|
| `BKASH_BASE_URL` | Defaults to the bKash sandbox. |
| `BKASH_APP_KEY` / `BKASH_APP_SECRET` / `BKASH_USERNAME` / `BKASH_PASSWORD` | bKash merchant credentials. All four are required before real gateway calls are attempted. |
| `NAGAD_BASE_URL` | Defaults to the Nagad sandbox. |
| `NAGAD_MERCHANT_ID` / `NAGAD_PUBLIC_KEY` / `NAGAD_PRIVATE_KEY` | Nagad credentials. |
| `CARD_GATEWAY_URL` | Defaults to the SSLCommerz sandbox. |
| `CARD_GATEWAY_STORE_ID` / `CARD_GATEWAY_SECRET_KEY` | Card gateway credentials. |
| `CARD_GATEWAY_MODE` | `sandbox` (default) or `live`. |

**Not environment variables:** the Firebase web config in `src/lib/firebase.ts` and
`firebase-applet-config.json` is **intentionally public client configuration**. Firebase web
API keys are designed to be shipped to browsers; access is governed by Firestore security
rules and by the Authorized Domains list, not by hiding the key.

---

## Namecheap / cPanel Deployment

Target stack: cPanel → **Setup Node.js App** (CloudLinux + Phusion Passenger) → `app.js` →
`dist/server.cjs` → Express (SPA + `/api/*`).

### 1. Build locally

```bash
npm run lint && npm run build
```

### 2. Create the application

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
|---|---|
| Node.js version | **22.x** (20.x also fine; 18+ required) |
| Application mode | **Production** |
| Application root | `/home/<user>/nodejs/kirahaq` |
| Application URL | `yourdomain.com` |
| Application startup file | **`app.js`** |

The application root must be the folder that contains `app.js`, `package.json` and `dist/`
— **not** `public_html` and **not** `dist`.

### 3. Upload files

Upload to the application root, via cPanel File Manager or SFTP:

- `package.json`
- `app.js`
- `dist/` (the whole folder)

`src/`, `server/`, `server.ts`, `tsconfig.json` and `vite.config.ts` are **not needed at
runtime**.

**Do not upload `node_modules/`.** It contains macOS-native binaries and will not work on
the server. Use cPanel's installer instead (next step). If you prefer a Git-based workflow,
clone on the server and run the build there.

### 4. Install production dependencies

Preferred: click **Run NPM Install** in the Setup Node.js App dashboard.

If that fails (the usual cause is `esbuild`/`tsx` native postinstall scripts), use
**cPanel → Terminal**:

```bash
cd /home/<user>/nodejs/kirahaq
source /home/<user>/nodejsvenv/<app>/<version>/bin/activate   # exact path shown in cPanel
npm install --omit=dev
```

`--omit=dev` is correct here because `dist/server.cjs` is prebuilt — only `dependencies`
(`express`, `@google/genai`, `vite`) are needed at runtime.

### 5. Configure environment variables

In the app dashboard → **Add Variable** for each required entry:

```
NODE_ENV     = production
APP_URL      = https://yourdomain.com
GEMINI_API_KEY = (optional)
...plus any live payment credentials
```

Do **not** add `PORT`.

### 6. Fix the generated `.htaccess`

In the `public_html/<your-app-url>/` folder Passenger creates, ensure this is present:

```
RewriteEngine off
```

### 7. Restart the application

Click **Restart** in the Actions column. Environment variable changes require a restart.

### 8. Verify

```bash
curl https://yourdomain.com/api/health
# expected: {"status":"ok","brand":"Kira Haq"}
```

Then load the site in a browser and confirm the React app renders and that a checkout can
reach `/api/payments/create`.

**If you get `503`:** the application root or startup file name is wrong, or the app was not
restarted after configuration. Passenger logs are visible from the app dashboard.

---

## Firebase Production Setup

`src/lib/firebase.ts` hard-codes the Firebase web configuration for project `kira-haq`, so no
build-time wiring is needed. However, Firebase Auth rejects requests from unregistered
origins.

**You must add your production domain manually — this is not automatic.**

1. Open the [Firebase Console](https://console.firebase.google.com/) → project `kira-haq`.
2. **Authentication → Settings → Authorized domains**.
3. Add `yourdomain.com` and `www.yourdomain.com`.

Also confirm the **Email/Password** sign-in provider is enabled under
**Authentication → Sign-in method**.

> **Why this matters:** `src/lib/firebase.ts:186-221` catches `auth/operation-not-allowed`
> **and** `auth/unauthorized-domain`, then silently switches to a local "resilient mode"
> backed by `localStorage`. If your domain is not authorized, users will appear to register
> successfully while their accounts are never written to Firestore. This failure is silent.

Firestore rules (`firestore.rules`) are deployed and were confirmed active: an
unauthenticated read of `/users` returns HTTP **403**.

---

## Payment Configuration

### Providers implemented

| Provider | Class | Environment |
|---|---|---|
| bKash | `server/payment/providers/BkashProvider.ts` | Tokenized Checkout v1.2 |
| Nagad | `server/payment/providers/NagadProvider.ts` | Remote Payment Gateway DFS |
| Card (SSLCommerz-style hosted page) | `server/payment/providers/CardProvider.ts` | Hosted session + validation API + IPN |
| Cash on Delivery / manual | handled in `PaymentService.createPayment` | No credentials needed |

### Sandbox vs live

Every provider defaults to a **sandbox** base URL and to a **simulated** checkout when its
credentials are missing (`isConfigured()` returns false). In simulated mode:

- `create` returns `200` with `metadata.simulated: true` and a generated transaction id.
- `verify` returns `200` with `status: "SUCCESS"`.
- `refund` returns `200` with `refundStatus: "REFUNDED"`.

To go live you must supply real credentials **and** switch `CARD_GATEWAY_MODE=live` (bKash and
Nagad live endpoints are set by changing `BKASH_BASE_URL` / `NAGAD_BASE_URL`).

### Callbacks

All callback URLs are derived from `APP_URL`; **no localhost URL is hard-coded**:

| Provider | URL built at | Result |
|---|---|---|
| bKash | `BkashProvider.ts:92` | `${APP_URL}/api/payments/bkash/callback` |
| Card success/fail/cancel | `CardProvider.ts:41-43` | `${APP_URL}/api/payments/card/callback` |
| Card IPN | `CardProvider.ts:44` | `${APP_URL}/api/payments/card/webhook` |
| Card (client override) | `src/pages/CheckoutPage.tsx:296-297` | `window.location.origin` + `/api/payments/card/callback` |

`APP_URL` must therefore be the **public HTTPS origin with no trailing slash**, and the
gateway account's allowed callback list must include those exact URLs. Enable SSL in cPanel
(AutoSSL) so gateways can reach the callbacks over HTTPS.

### Persistence caveat

`PaymentService` keeps all transactions in an **in-memory `Map`**
(`server/payment/PaymentService.ts:19`). Transactions do **not** survive a process restart,
and are not shared between processes. A database is required before real money flows.

---

## API

All routes are same-origin under `/api`. There is **no authentication or authorization on
any endpoint** — see [Security](#security).

### Core

#### `GET /api/health`
Health check. No parameters.
```json
{ "status": "ok", "brand": "Kira Haq" }
```

#### `POST /api/ai-advisor`
Gemini-backed Sunnah/wellness advisor.

| | |
|---|---|
| Body | `{ "query": string }` (required) |
| `400` | when `query` is missing or not a string |
| `200` | `{ "response": string }` with a live key, or `{ "response": string, "recommendations": string[] }` from the built-in fallback |
| `500` | on an unexpected Gemini error; includes `details` |

### Payments — `server/payment/routes.ts`, mounted at `/api/payments`

#### `POST /api/payments/create`
| | |
|---|---|
| Body | `orderId` (string, **required**), `amount` (number > 0, **required**), `currency` (default `BDT`), `method` (default `"Cash on Delivery"`), `customerName`, `customerPhone`, `customerEmail`, `callbackUrl`, `cancelUrl`, `idempotencyKey` |
| `400` | missing `orderId` or invalid `amount` |
| `200` | `{ success, paymentId, status, redirectUrl?, paymentUrl?, providerPaymentId?, transactionId?, instructions?, metadata? }` |
| `500` | on failure, with `details` |

#### `POST /api/payments/verify`
| | |
|---|---|
| Body | `paymentId` **or** `orderId` (at least one required); optional `provider`, `transactionId`, `providerPaymentId`, `payload` |
| `400` | neither `paymentId` nor `orderId` supplied |
| `200` | `{ success, status, transactionId?, providerPaymentId?, amount?, currency?, paidAt? }` |

#### `GET /api/payments/status/:orderId`
`200` with the transaction record, or `404` `{ error: "No payment transaction found for this order" }`.

#### `POST /api/payments/refund`
Body: `orderId` **or** `paymentId`, optional `amount`, `reason`.
`400` when both identifiers are missing. `200` with `{ success, refundStatus, refundTransactionId?, refundAmount?, message? }`.

#### `GET /api/payments/transactions`
`200` with `{ transactions: [...], count: number }`, newest first. **Intended as an admin
listing but exposed publicly.**

#### Gateway callbacks

| Method | Path | Behaviour |
|---|---|---|
| `ALL` | `/api/payments/bkash/callback` | Reads `paymentID`/`status`; verifies on success, otherwise redirects to `/?payment_status=success\|cancelled\|failed\|error` |
| `ALL` | `/api/payments/nagad/callback` | Reads `payment_ref_id`/`status`; same redirect behaviour |
| `ALL` | `/api/payments/card/callback` | Reads `val_id`/`tran_id`/`status`; same redirect behaviour |
| `POST` | `/api/payments/card/webhook` | SSLCommerz IPN. `200 { "received": true }`, or `500` on error |

These are registered with `.all()`, so both `GET` and `POST` work.

---

## Security

**This application is not hardened for handling real money.** The following are accurate
observations from the current source. They are documented rather than hidden.

### 1. Payment API has no authentication — critical

`/api/payments/create`, `/verify`, `/refund` and `/transactions` are reachable by anyone who
can reach the URL. There is no token check, no session check and no role check
(`server/payment/routes.ts`). Combined with the in-memory transaction store, **any visitor
can call `POST /api/payments/refund` and enumerate `GET /api/payments/transactions`.**
Before enabling live gateways, put authentication and an authorization check in front of the
router. This was intentionally not changed here because the admin UI calls
`POST /api/payments/refund` with no credentials and would break.

### 2. Hard-coded admin credentials in client code — critical

`src/pages/AdminDashboardPage.tsx:180` grants Super Admin for a fixed
email + **password literal in the source**, and line 201 accepts that same literal as a
**universal password for every admin and moderator account**. The admin dashboard
authentication is entirely client-side (`localStorage` / `sessionStorage`), with no server
involvement, and seeded moderator PINs live in `src/types.ts`. Consequences:

- Anyone can read the credentials in the shipped JavaScript bundle.
- Because the check is an OR against the master literal, that one value unlocks *any*
  admin/moderator account.

Rotate and remove these before going live, and move admin authentication server-side.

### 3. Firebase "resilient mode" masks configuration failures

`src/lib/firebase.ts` falls back to `localStorage`-backed fake accounts when the
Email/Password provider is disabled or the origin is unauthorized. Users believe they
registered; nothing reaches Firestore. Ensure the production domain is an Authorized Domain
so this path is never taken.

### 4. Secrets exposure

- No server-side secret is committed. `.env*` is git-ignored (with `!.env.example`), and all
  gateway credentials, the Gemini key and `APP_URL` are read from `process.env`.
- The Firebase web config in `src/lib/firebase.ts` and `firebase-applet-config.json` is
  public client configuration by design. It is safe to commit; it is not a server secret.
- Verified that no gateway secret name/value pattern (`store_passwd`, `app_secret`, …) is
  present in the compiled client bundle.
- `src/lib/meta-capi.ts` accepts a Meta `accessToken` as a parameter and is currently never
  called. If wired up, that token would execute in the browser.

### 5. CORS

No CORS middleware is configured. That is **correct** for this architecture, because the
frontend and API share an origin. Do not add a wildcard `Access-Control-Allow-Origin`; it
would widen the attack surface without any benefit.

### 6. Cookies, sessions, TLS

The server sets no cookies and manages no sessions; Firebase Auth persists tokens in the
browser. HTTPS is terminated by Apache/Passenger in front of Node — the app correctly listens
on plain HTTP and relies on the proxy. `trust proxy` is **not** enabled, which is currently
harmless because `req.ip`, `req.secure` and secure cookies are unused. Payment redirects use
relative paths, so they follow the HTTPS scheme automatically.

### 7. Error responses and logging

`/api/ai-advisor` and several payment routes echo `error.message` back to the client, which
can leak internal detail. Server logs contain no credentials — the payment providers log only
error messages, never keys or tokens.

### 8. Other

- **No rate limiting** on any route, including `/api/ai-advisor` (a billable Gemini call) and
  the payment routes. Consider adding it.
- **No CSRF protection**; currently mitigated only by the same-origin/no-cookie design.
- **Unmatched `/api/*` GET requests return `index.html` with HTTP 200** rather than a JSON
  404, because the SPA catch-all is registered after the API routes.
- **`/favicon.ico` returns 404**; no favicon is present in the repository.
- **Bundle size**: the JS bundle is ~1.87 MB (431 KB gzipped). Vite emits a chunk-size
  warning. Consider route-level code splitting.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `sh: tsx: command not found` | Dependencies were never installed. Run `npm install`. |
| `Error: Cannot find module './dist/server.cjs'` | `dist/` does not exist. Run `npm run build` first. |
| `EADDRINUSE` | Another process holds the port. Either stop it, or set `PORT` to a free port (local only). |
| Site loads but the API 404s | `NODE_ENV` is not `production`, so Vite dev middleware is mounted instead of `dist`. Set `NODE_ENV=production`. |
| HTTP **503** from Namecheap | Wrong *Application root* or *Application startup file*, or the app was not restarted after a config change. Check the Passenger log in the cPanel dashboard. |
| `/api/payments/*` returns simulated data | Gateway credentials are empty. Expected until real credentials are added. |
| Payment gateway rejects the callback URL | `APP_URL` is empty or wrong. It must be the public HTTPS origin with **no trailing slash**, and it must match the gateway's allowed list. |
| Callback URL is relative (`/api/payments/...`) | `APP_URL` is not set. |
| AI advisor returns a generic canned answer | `GEMINI_API_KEY` is not set. This is a fallback, not an error. |
| **Firebase sign-in silently "succeeds" but nothing persists** | The production domain is not an Authorized Domain, or Email/Password is disabled — the app has fallen back to local "resilient mode". Add the domain in Firebase Console. |
| Firestore reads/writes denied (403) | Expected for unauthenticated access. Firestore rules require `request.auth != null`. |
| `npm install` fails on the server | `esbuild`/`tsx` native postinstall. Use `npm install --omit=dev`. |
| Changes to env vars have no effect | You must click **Restart** in the cPanel app dashboard. |
| Page loads blank / assets 404 | `dist/` was not uploaded, or `NODE_ENV` is wrong. |
| Local `.env.local` has no effect | `server.ts` does not load `.env` files; `dotenv` is installed but never imported. Export variables in your shell instead. |
| Very slow first request | Vite is being started in production (missing `NODE_ENV=production`). |

---

## Deployment Status

Verified on macOS with Node.js v22.22.3 / npm 10.9.8:

| Item | Status |
|---|---|
| `npm install` | **Verified** — 286 packages |
| `npm run lint` (`tsc --noEmit`) | **Verified** — 0 errors |
| `npm run build` | **Verified** — `dist/index.html`, `dist/assets/index-*.js`, `dist/assets/index-*.css`, `dist/server.cjs`, `dist/server.cjs.map` all produced |
| `GET /api/health` in production mode | **Verified** — returns exactly `{"status":"ok","brand":"Kira Haq"}` |
| `NODE_ENV=production npm start` | **Verified** — serves the SPA and API from one origin |
| `process.env.PORT` support | **Verified** — `PORT=8199` bound to 8199; unset falls back to 3000 |
| `app.js` Passenger entry point | **Verified** — boots the bundled server and serves `/api/health` |
| SPA fallback | **Verified** — `/`, `/account`, `/admin`, `/products`, `/blog`, `/checkout` and unknown deep paths all return `200 text/html` |
| Static assets | **Verified** — hashed JS (1.87 MB) and CSS (134 KB) served with `200` |
| `POST /api/ai-advisor` | **Verified** — `200`, `400` on missing query |
| Payment routes | **Verified** — create / verify / status / refund / transactions / 3 callbacks / webhook all respond; `status/:unknownId` returns `404` |
| Production bundle in a real browser | **Verified** — React mounts on every route with 0 console errors and 0 uncaught exceptions |
| Firestore security rules active | **Verified** — unauthenticated read of `/users` returns `403` |
| Firebase Email/Password provider | **Verified** enabled (probe returns `INVALID_LOGIN_CREDENTIALS`, not `OPERATION_NOT_ALLOWED`) |
| Namecheap/cPanel configuration | **Prepared** — `app.js` entry point, `PORT` support, env-var surface and deployment steps are in place |
| Live deployment on Namecheap | **Not yet performed** — requires the cPanel account |

**Not verified / known outstanding:** live payment gateway transactions, live domain
registration, Firebase Authorized Domains for the production domain, and the security items
listed under [Security](#security).

---

## License

**This project has no license file.** No license has been assigned, so the repository is
all-rights-reserved by default. Add a `LICENSE` file (MIT, Apache-2.0, or your preferred
terms) before distributing the code, and keep the Firebase project credentials private.