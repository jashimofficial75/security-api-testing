# Changelog

Template releases. `npm run platform -- check` says when a newer one is out;
`npm run platform -- upgrade` applies it (see `scripts/platform.mjs`).
Managed by the template: replaced on upgrade.

## 0.7.8

- **Passwords and email addresses (owner's rule).** `AGENTS.md`: never a password, in any form, or
  another person's email address anywhere in the site.
- **Every task ends with a review.** `AGENTS.md` tells the AI to run `security.md`'s "Before you say
  done" list and the `performance.md` checks after every task, fix what they find, and end its
  answer with a short report.

## 0.7.7

- **Every task starts from the current rules.** `AGENTS.md` tells the AI to re-read the platform's
  current rules and the topic doc before each task, build what the owner asked by them, and bring code
  the task touches up to a newer rule when it matters (security, data, a broken or slow page).
- **Topic docs: the current copy first.** `AGENTS.md` points the AI to the platform's current topic
  docs (the editor's docs folder, else the site's live docs address) before this repo's
  `docs/agent/`, which is only as new as the site's last upgrade.

## 0.7.6

- **Currencies from the owner's payment providers.** The dashboard offers only the currencies the
  owner's providers take; `docs/agent/payments.md` says to ask the owner which one they sell in.

## 0.7.5

- **Free trials need the buyer's email.** A price with a free trial starts on the payment
  provider's own page, and the checkout must name the buyer: send `email` (a signed-in buyer's
  is sent for you). Without it the checkout answers 422 `E_SITE_PAYMENTS_EMAIL_REQUIRED`.
  `CheckoutRequest` takes `email`; `docs/agent/payments.md` says so.

## 0.7.4

- **Real plans while you build.** `npm run platform -- plans` shows the owner's client plans
  (their own website only), and `--write` saves them to `src/content/plans.json`, so a pricing
  section's fallback holds the real plans in the Preview too. `docs/agent/plans-catalogue.md`
  says to run it first and never invent plans.

## 0.7.3

- **Price minimums.** A paid price must be at least the currency's minimum (1 USD, 10,000 IDR,
  100 JPY…) and whole in IDR and ISK. `docs/agent/payments.md` says so.

## 0.7.2

- **Every payment opens without leaving the page.** The Buy button's checkout answer always has
  `embedded`, with a `kind`: `element` (the provider's form in the dialog, Stripe), `popup` (the
  provider's popup over the page, Razorpay: closed, Pay opens the same one again) or `window` (the
  provider's page in a small payment window, Xendit and PayPal: the dialog waits, checks the
  checkout and goes to `successPath` once paid). The old redirect to `checkoutUrl` is gone.
  `Base.astro` calls `notifyPaymentOpener()` so the page loaded inside the payment window hands
  back and closes.
- **One checkout session.** The dialog runs `CheckoutSession` (`src/lib/checkout-session.ts`,
  the same file as the app template's) over the public endpoints. The dialog markup moved to
  `src/components/CheckoutDialog.astro`.
- **A pricing section.** `<PriceList />` shows the catalogue's prices with a Buy / Subscribe
  button each, or "Coming soon" while the site can't take payments; a lone `<BuyButton>` says
  "Coming soon" too. `docs/agent/payments.md` › Selling, in three steps.
- **The visitor chooses how to pay.** With more than one way to pay that takes the price, the
  dialog asks "How do you want to pay?" (`GET …/payments/gateways?price=`) and sends the choice as
  `gateway`. A visitor who already had the free trial is asked to continue without it
  (`noTrial`).

## 0.7.1

- **The Buy button's payment form opens on the page.** When the site's gateway takes payments
  inline (Stripe, Razorpay), a click opens the form in a dialog right here
  (`src/lib/inline-checkout.ts`); paid, the buyer lands on `successPath`. A gateway that only has
  its own payment page (Xendit, PayPal) still opens that page. The page with a Buy button allows
  the form's hosts in its own CSP (`src/lib/checkout-hosts.ts`); every other page keeps
  `connect-src 'self'`. New dependency: `@stripe/stripe-js` (pinned, loaded only on a click).
  Guide: `docs/agent/payments.md`.
- **Plans that can't be bought yet show "Coming soon".** The live plans answer has
  `checkoutOpen` (and `opensLaterReason`): while it is `false`, a pricing section shows paid
  plans with a "Coming soon" state instead of a Start link; free plans keep theirs.
  `docs/agent/plans-catalogue.md` › Not open yet. Docs only: no change to your code.

## 0.7.0

- **A Buy / Subscribe button, built in.** `<BuyButton price="<key>" />`
  (`src/components/BuyButton.astro`) sends the visitor to the platform's checkout for one price
  of the owner's catalogue (by key, never an amount), from a small module on this site; same
  origin, nothing added to the CSP. Test payments until the owner connects a live gateway; in the
  Preview it says payments work on the published site. Guide: `docs/agent/payments.md`
  (memberships and member pages need the app template).

## 0.6.0

- **Client navigation.** `<ClientRouter />` (Astro) in `Base.astro`: a click swaps the next page
  in without a reload (prefetched first), focus moves and the new title is announced; every page
  is still a prerendered HTML file. A script of your own runs on `astro:page-load`
  (`docs/agent/performance.md` "JavaScript").


## 0.5.0

- **Neutral platform names.** Nothing in the site's code, variables or paths names the company
  that hosts it: the address variable is `SITE_URL` (was `EZYSTUDIO_SITE_URL`) and
  `npm run platform` reads `SITE_DIR`. Rename them in your own `.env`.

## 0.4.0

- **Instant navigation**: pages prefetch on hover (header links when they come into view) and
  change with a cross-document view transition (off with `prefers-reduced-motion`). Still zero
  JavaScript of the site's own: Astro's small prefetch module is the one allowed exception.
- JSON-LD: `WebSite` and `Organization` on every page, `BlogPosting` on posts.
- The platform variable is `SITE_URL` (was `EZY_SITE_URL`). Rename it in your own
  `.env`.

## 0.3.1

- Agent docs: the collection recipe in `AGENTS.md` says to create the data file before the
  collection (a `file()` collection added while the Preview runs, before its file exists, stays
  empty there until the dev server restarts) and that an `image()` path is relative to the data
  file. No code changes.

## 0.3.0

- SEO: `<Base>` writes a canonical URL, `og:site_name`, `og:url`, absolute `og:image` (+ alt),
  Twitter title/description/image and, on posts, `og:type=article` with published/modified
  times. The address comes from `src/lib/site-url.ts`: `SITE.url`, else `SITE_URL` (set by
  the platform during a Publish build, declared in `astro.config.mjs` `env.schema`).
- New build-time files: `/sitemap.xml` (every page found automatically, posts with `lastmod`,
  tag pages), `/robots.txt` (allow all + sitemap), `/rss.xml` (20 newest posts). `<head>` links
  the feed and the sitemap; the footer links the feed.
- Blog tags: `/blog/tags/<tag>/` pages, linked chips on posts and a topic list on `/blog/`.
- Images: covers may be files in `src/assets/` (now preferred), rendered by the new
  `src/components/Cover.astro` through `astro:assets` `<Picture>` (AVIF + WebP + JPEG, several
  widths, `sizes`, lazy except the LCP image); the welcome post ships an example cover.
  `/path` and https covers still work.
- Performance: the stylesheet is inlined (`build.inlineStylesheets: 'always'`), no
  render-blocking request; unused rules (spinner, notices, busy buttons) removed.
- Accessibility: post-card headings follow the page outline (`PostCard as="h2"` under an
  `<h1>`), the skip link moves focus to `<main>`, chips are lists of links.
- Agent docs: build-time endpoints allowed (never per request), collection and image recipes,
  a "Never" list; `seo.md`, `performance.md`, `publishing.md`, `accessibility.md` match the code.

## 0.2.0

- Topic docs for agents in `docs/agent/` (managed, replaced on upgrade): `performance.md`,
  `accessibility.md`, `seo.md`, `security.md`, `publishing.md`. `AGENTS.md` keeps the core rules
  and a summary per topic. The platform serves the same docs at
  `/api/public/site/v1/agent-docs`.
- Still a pure static site: the runtime "fetch the platform's public API" allowance is gone
  (content is built from the repo; no sign-in links or member areas).
- Template source: `template.json` `repo` is now `file:templates/astro-static` (a folder in an
  the platform checkout; no published repository yet). `npm run platform -- check|upgrade` read it
  (`$SITE_DIR`, `--from DIR`; `--base DIR` for a 3-way merge), `owner/name` GitHub repos
  still work. `docs/agent/**` joins the managed paths.
- Contact: `CONTACT.formUrl` is a form the owner hosts elsewhere.

## 0.1.0

- First release: Astro 7, every page prerendered (`output: 'static'`, no adapter).
- Home, About, Contact (`mailto:` or a hosted form link), `404.html`.
- Blog as an Astro content collection: Markdown files in `src/content/blog/`, front matter
  validated at build (`src/content.config.ts`), prerendered list and `/blog/<slug>/` pages,
  latest posts on the home page. No runtime fetch, no client JavaScript.
- Security: Astro CSP with hashes (`connect-src 'self'`), `public/_headers` (nosniff,
  Referrer-Policy, Permissions-Policy, COOP, X-Frame-Options, immutable `/_astro/*`).
- Performance: zero JavaScript, system fonts, sized lazy images.
- `AGENTS.md`: static rules, performance budgets, accessibility, SEO, security, and when to
  switch to the Astro app template.
