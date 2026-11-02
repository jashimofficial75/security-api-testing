---
order: 14
level: 2
week: 5
title: "Playwright দিয়ে পেমেন্টের API ও UI টেস্ট অটোমেশন"
description: "Playwright ও TypeScript দিয়ে Stripe Test Mode-এ PaymentIntent-এর API টেস্ট, Checkout পেজের UI টেস্ট, iframe-এর চ্যালেঞ্জ আর API দিয়ে যাচাই — এক লেসনে।"
keywords: ["playwright", "typescript", "api testing", "ui testing", "request fixture", "frameLocator", "iframe", "stripe checkout", "3ds", "process.env", "html report", "অটোমেশন টেস্ট", "প্লেরাইট", "এসকিউএ অটোমেশন"]
minutes: 75
quiz:
  - q: "একজন সহকর্মী টেস্ট ফাইলে লিখেছেন const key = 'sk_test_...আসল কী...'; কোডটা GitHub-এ যাবে। সঠিক পরামর্শ কোনটা?"
    options: ["Test কী তো, সমস্যা নেই", "কী-টা base64 করে রাখুন", "কী রাখুন process.env.STRIPE_SECRET_KEY-তে, .env ফাইল .gitignore-এ, CI-তে secret হিসেবে", "কী-টা কমেন্টে রাখুন"]
    answer: 2
    explain: "Test কী-ও গোপন; ফাঁস হলে অন্যরা আপনার Sandbox অ্যাকাউন্টে কল করতে পারে। base64 এনক্রিপশন নয়। কী সবসময় environment variable থেকে পড়ুন।"
  - q: "নিজের সাইটে Stripe Payment Element-এর কার্ড নম্বর ফিল্ডে page.fill('#cardNumber', ...) কাজ করছে না, এলিমেন্ট খুঁজে পাচ্ছে না। সবচেয়ে সম্ভাব্য কারণ?"
    options: ["কার্ড ফিল্ড cross-origin iframe-এর ভেতরে, তাই frameLocator লাগবে", "Playwright কার্ড নম্বর টাইপ করতে পারে না", "Test Mode-এ কার্ড ফিল্ড থাকে না", "headless মোডে iframe লোড হয় না"]
    answer: 0
    explain: "Payment Element ও Card Element-এর ইনপুট Stripe-এর ডোমেইনের iframe-এ থাকে, PCI নিরাপত্তার জন্য। মূল পেজ থেকে সরাসরি দেখা যায় না, তাই frameLocator দিয়ে ভেতরে ঢুকতে হয়।"
  - q: "UI টেস্টে success পেজ দেখা গেল, ‘ধন্যবাদ!’ লেখা এসেছে। পেমেন্ট সত্যিই হয়েছে কি না নিশ্চিত হওয়ার সবচেয়ে নির্ভরযোগ্য উপায়?"
    options: ["success পেজের স্ক্রিনশট নেওয়া", "URL-এ success শব্দ আছে কি না দেখা", "ব্রাউজার কনসোলে এরর না থাকা", "API দিয়ে Checkout Session বা PaymentIntent retrieve করে status/payment_status যাচাই"]
    answer: 3
    explain: "success পেজ শুধু রিডাইরেক্ট; কেউ সরাসরি URL খুলেও দেখতে পারে। আসল সত্য Stripe-এর অবজেক্টের স্ট্যাটাসে, তাই UI-এর পর API দিয়ে যাচাই করুন।"
  - q: "Stripe-এর হোস্টেড পেজের UI টেস্ট নিয়ে কোন কৌশলটা সবচেয়ে বাস্তবসম্মত?"
    options: ["Stripe-এর প্রতিটা UI ফিল্ড, ফন্ট আর এরর টেক্সট গভীরভাবে টেস্ট করা", "নিজের অংশের (চেকআউটে যাওয়া, success/cancel হ্যান্ডলিং) ওপর ফোকাস, Stripe UI-তে অল্প স্মোক টেস্ট, বাকিটা API লেভেলে", "UI টেস্ট বাদ দিয়ে শুধু ম্যানুয়াল টেস্ট", "লাইভ মোডে আসল কার্ড দিয়ে UI টেস্ট"]
    answer: 1
    explain: "Stripe নিজের UI নিজে টেস্ট করে আর সিলেক্টর বদলাতে পারে, হোস্টেড পেজে বট-সুরক্ষাও থাকে। আপনার দায়িত্ব নিজের ইন্টিগ্রেশন; তাই অল্প UI স্মোক টেস্ট আর বেশি API যাচাই।"
  - q: "4000 0025 0000 3155 কার্ড দিয়ে UI টেস্টে পেমেন্ট আটকে আছে, কিছু হচ্ছে না। কী মিস হয়েছে?"
    options: ["কার্ডটা অবৈধ", "Playwright-এর টাইমআউট বাড়াতে হবে শুধু", "এই কার্ড 3D Secure চায়; একটা আলাদা iframe-এ অথেনটিকেশন মডাল আসে, সেখানে Complete/Authorize চাপতে হবে", "Test Mode-এ 3DS কাজ করে না"]
    answer: 2
    explain: "3155 শেষের টেস্ট কার্ড অথেনটিকেশন চায়। Stripe একটা টেস্ট 3DS মডাল দেখায়, যা আরেকটা iframe (কখনো nested)। টেস্টকে সেই মডালে গিয়ে অনুমোদন দিতে হবে।"
---

Postman দিয়ে আমরা অনেক কিছু করেছি। কিন্তু SQA Automation Engineer হতে চাইলে কোড দিয়ে টেস্ট লিখতে হবে, যা প্রতিটা কমিটে নিজে থেকে চলবে।

এই লেসনে **Playwright** (Microsoft-এর ফ্রি ব্রাউজার ও API টেস্টিং ফ্রেমওয়ার্ক) আর TypeScript দিয়ে একটা পেমেন্ট ফ্লো API ও UI দুই দিক থেকেই টেস্ট করব।

## এই লেসনে যা শিখবেন

- Playwright + TypeScript প্রজেক্ট সেটআপ
- Secret Key নিরাপদে রাখা (`process.env`)
- `request` fixture দিয়ে Stripe API টেস্ট: PaymentIntent তৈরি ও যাচাই
- Stripe Checkout-এর UI টেস্ট আর **iframe** চ্যালেঞ্জ
- 3D Secure মডাল সামলানো
- API + UI + API একসাথে: পূর্ণাঙ্গ ফ্লো
- `playwright.config.ts`, টেস্ট চালানো আর HTML রিপোর্ট

## প্রজেক্ট সেটআপ

আপনার কম্পিউটারে Node.js (LTS ভার্সন) থাকতে হবে। একটা নতুন ফোল্ডারে:

```bash
mkdir payment-tests && cd payment-tests
npm init playwright@latest
```

প্রশ্নগুলোর উত্তর: TypeScript, টেস্ট ফোল্ডার `tests`, GitHub Actions workflow এখন না (পরে [CI/CD লেসনে](/lessons/cicd-github-actions/) করব), ব্রাউজার ইনস্টল হ্যাঁ।

তারপর `.env` ফাইল পড়ার জন্য dotenv:

```bash
npm install -D dotenv
```

প্রজেক্টের রুটে `.env` ফাইল:

```text
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
```

আর `.gitignore`-এ অবশ্যই যোগ করুন:

```text
.env
test-results/
playwright-report/
```

> [!DANGER] Secret Key কখনো কোডে নয়
> Test Mode কী-ও গোপন। কী টেস্ট ফাইলে হার্ড-কোড করলে তা Git হিস্টরিতে চিরকাল থেকে যায়। কী সবসময় `process.env.STRIPE_SECRET_KEY` থেকে পড়ুন। ভুল করে পুশ হলে সাথে সাথে Dashboard থেকে কী **roll** (বাতিল করে নতুন) করুন।

### playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
    },
    {
      name: 'ui-chromium',
      testMatch: /.*\.ui\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

এখানে API টেস্ট আর UI টেস্ট আলাদা project-এ রাখা হয়েছে, যাতে আলাদাভাবে চালানো যায়।

## API টেস্ট: request fixture দিয়ে PaymentIntent

Playwright-এর **request fixture** (টেস্টকে দেওয়া রেডিমেড HTTP ক্লায়েন্ট) দিয়ে ব্রাউজার ছাড়াই API কল করা যায়। Stripe form-encoded বডি নেয়, আর Playwright-এর `form` অপশন ঠিক সেটাই পাঠায়।

ফাইল `tests/payment-intent.api.spec.ts`:

```ts
import { test, expect, APIRequestContext } from '@playwright/test';

const STRIPE = 'https://api.stripe.com';
const key = process.env.STRIPE_SECRET_KEY;

test.beforeAll(() => {
  if (!key || !key.startsWith('sk_test_')) {
    throw new Error('STRIPE_SECRET_KEY must be a sk_test_ key');
  }
});

const auth = () => ({ Authorization: `Bearer ${key}` });

async function createPI(request: APIRequestContext, pm: string) {
  return request.post(`${STRIPE}/v1/payment_intents`, {
    headers: auth(),
    form: {
      amount: '2000',
      currency: 'usd',
      payment_method: pm,
      confirm: 'true',
      'automatic_payment_methods[enabled]': 'true',
      'automatic_payment_methods[allow_redirects]': 'never',
      'metadata[order_id]': `PW-${Date.now()}`,
    },
  });
}

test('successful card creates a succeeded PaymentIntent', async ({ request }) => {
  const res = await createPI(request, 'pm_card_visa');
  expect(res.status()).toBe(200);
  const pi = await res.json();
  expect(pi.livemode).toBe(false);
  expect(pi.status).toBe('succeeded');
  expect(pi.amount_received).toBe(2000);

  // Stripe-এর দিক থেকে আবার retrieve করে যাচাই
  const again = await request.get(`${STRIPE}/v1/payment_intents/${pi.id}`, { headers: auth() });
  expect((await again.json()).status).toBe('succeeded');
});

test('declined card returns 402 card_error', async ({ request }) => {
  const res = await createPI(request, 'pm_card_chargeDeclined');
  expect(res.status()).toBe(402);
  const { error } = await res.json();
  expect(error.type).toBe('card_error');
  expect(error.code).toBe('card_declined');
});

test('same Idempotency-Key returns the same PaymentIntent', async ({ request }) => {
  const idem = crypto.randomUUID();
  const send = () =>
    request.post(`${STRIPE}/v1/payment_intents`, {
      headers: { ...auth(), 'Idempotency-Key': idem },
      form: { amount: '1500', currency: 'usd' },
    });
  const first = await (await send()).json();
  const second = await send();
  expect((await second.json()).id).toBe(first.id);
  expect(second.headers()['idempotent-replayed']).toBe('true');
});
```

খেয়াল করুন:

- `beforeAll`-এ একটা **সেফটি গার্ড**: কী `sk_test_` দিয়ে শুরু না হলে টেস্টই চলবে না। এতে ভুল করে Live কী দিয়ে চালানো আটকায়।
- `metadata[order_id]`-এ টাইমস্ট্যাম্প, যাতে প্রতিটা রান আলাদা চেনা যায়।
- শেষ টেস্টটা আগের [Idempotency লেসনের](/lessons/idempotency-testing/) IDM-01 এর অটোমেটেড রূপ।
- `crypto.randomUUID()` নতুন Node.js ভার্সনে গ্লোবালি পাওয়া যায়।

> [!NOTE]
> Playwright-এর `request.post` ডিফল্টভাবে ৪xx/৫xx-এ exception দেয় না, রেসপন্স ফেরত দেয়। তাই ৪০২ এর মতো প্রত্যাশিত এরর সহজেই `expect` দিয়ে চেক করা যায়।

## UI টেস্ট আর iframe চ্যালেঞ্জ

এবার কঠিন অংশ। পেমেন্ট ফর্মের UI অটোমেট করার আগে বুঝতে হবে Stripe কার্ডের তথ্য কোথায় নেয়।

### কেন iframe?

**PCI DSS** (কার্ড ডেটা সুরক্ষার আন্তর্জাতিক মানদণ্ড) মেনে চলতে Stripe চায় না কার্ড নম্বর আপনার সাইটের কোডে আসুক। তাই Payment Element বা Card Element ব্যবহার করলে কার্ড নম্বর, মেয়াদ আর CVC ফিল্ড থাকে **Stripe-এর ডোমেইনের iframe**-এ (পেজের ভেতরে আরেকটা আলাদা ওয়েবপেজ)।

এটা **cross-origin** iframe, তাই আপনার পেজের JavaScript বা সাধারণ `page.locator()` এর ভেতর দেখতে পায় না। Playwright-এ ঢুকতে হয় `frameLocator` দিয়ে:

```ts
// নিজের ডেমো সাইটে Payment Element থাকলে (উদাহরণ; সিলেক্টর নিজে যাচাই করুন)
const stripeFrame = page.frameLocator('iframe[title*="Secure"]').first();
await stripeFrame.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
await stripeFrame.getByPlaceholder('MM / YY').fill('12 / 34');
await stripeFrame.getByPlaceholder('CVC').fill('123');
```

> [!MISTAKE] সিলেক্টর অন্ধভাবে কপি করবেন না
> Stripe-এর iframe-এর `title`, placeholder আর ইনপুটের `name` সময়ের সাথে, ভাষা আর লোকেল অনুযায়ী বদলাতে পারে। উপরের সিলেক্টর শুধু ধারণা দেওয়ার জন্য। নিজের পেজে DevTools বা `npx playwright codegen` দিয়ে আসল সিলেক্টর দেখে নিন, আর সম্ভব হলে কম ভঙ্গুর সিলেক্টর (placeholder, role) ব্যবহার করুন।

### হোস্টেড Stripe Checkout

**Stripe Checkout** (Stripe-এর নিজের ডোমেইনে হোস্ট করা পুরো পেমেন্ট পেজ) ব্যবহার করলে কাজ কিছুটা সহজ: পুরো পেজটাই Stripe-এর, তাই কার্ড ফিল্ড সাধারণত সরাসরি পেজে থাকে। প্রথমে API দিয়ে একটা Session বানাই:

```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d mode=payment \
  -d "line_items[0][price_data][currency]=usd" \
  -d "line_items[0][price_data][product_data][name]=QA Course" \
  -d "line_items[0][price_data][unit_amount]=2500" \
  -d "line_items[0][quantity]=1" \
  -d "success_url=https://example.com/success?session_id={CHECKOUT_SESSION_ID}" \
  -d "cancel_url=https://example.com/cancel"
```

রেসপন্সে `id` (`cs_test_…`) আর `url` আসে। ঐ `url` খুললে হোস্টেড Checkout পেজ।

> [!NOTE] Stripe-এর পরামর্শ
> Stripe-এর হোস্টেড পেজগুলোতে বট আর জালিয়াতি ঠেকানোর সুরক্ষা আছে, তাই বারবার অটোমেটেড ব্রাউজার চালালে টেস্ট মাঝে মাঝে আটকে যেতে পারে বা অস্থির (flaky) হতে পারে। Stripe-এর ডকুমেন্টেশনও (https://docs.stripe.com/testing দেখুন, "automated testing" খুঁজুন) সাধারণত নিজের ইন্টিগ্রেশন API লেভেলে বা mock দিয়ে টেস্ট করতে বলে। তাই Stripe-এর UI-তে গভীর টেস্ট নয়, শুধু একটা-দুটো স্মোক টেস্ট।

### কী টেস্ট করবেন, কী করবেন না

| টেস্ট করুন (আপনার দায়িত্ব) | গভীরভাবে করবেন না (Stripe-এর দায়িত্ব) |
|---|---|
| "Buy" বাটনে ক্লিকে সঠিক Checkout-এ যাচ্ছে, সঠিক দাম দেখাচ্ছে | কার্ড নম্বর ফিল্ডের ভ্যালিডেশন মেসেজের প্রতিটা শব্দ |
| success পেজে অর্ডার নম্বর আর সঠিক বার্তা | Stripe পেজের ডিজাইন, ফন্ট, লেআউট |
| cancel করলে কার্ট অক্ষত থাকে | Stripe-এর 3DS মডালের ভেতরের আচরণ |
| পেমেন্টের পর অর্ডার "Paid" হয় (Webhook-এর মাধ্যমে) | কার্ড ব্র্যান্ড শনাক্তকরণ |

### UI টেস্ট কোড

ফাইল `tests/checkout.ui.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const STRIPE = 'https://api.stripe.com';
const auth = { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` };

test('pay on hosted Checkout with 4242 and verify via API', async ({ page, request }) => {
  // ১. API দিয়ে তৈরি
  const res = await request.post(`${STRIPE}/v1/checkout/sessions`, {
    headers: auth,
    form: {
      mode: 'payment',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'QA Course',
      'line_items[0][price_data][unit_amount]': '2500',
      'line_items[0][quantity]': '1',
      success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://example.com/cancel',
    },
  });
  expect(res.ok()).toBeTruthy();
  const session = await res.json();

  // ২. UI দিয়ে পেমেন্ট (সিলেক্টর codegen দিয়ে যাচাই করে নিন)
  await page.goto(session.url);
  await expect(page.getByText('QA Course')).toBeVisible();
  await page.getByLabel('Email').fill('qa.learner@example.com');
  await page.getByPlaceholder('1234 1234 1234 1234').fill('4242424242424242');
  await page.getByPlaceholder('MM / YY').fill('12 / 34');
  await page.getByPlaceholder('CVC').fill('123');
  await page.getByLabel(/name on card|cardholder/i).fill('Test Learner');
  await page.getByRole('button', { name: /pay/i }).click();
  await page.waitForURL(/example\.com\/success/, { timeout: 30_000 });

  // ৩. API দিয়ে আসল সত্য যাচাই
  const check = await request.get(`${STRIPE}/v1/checkout/sessions/${session.id}`, { headers: auth });
  const done = await check.json();
  expect(done.status).toBe('complete');
  expect(done.payment_status).toBe('paid');
});
```

এই টেস্টের গঠনটাই আসল শিক্ষা: **API দিয়ে তৈরি → UI দিয়ে কাজ → API দিয়ে যাচাই**। UI অংশ যত ছোট, টেস্ট তত স্থিতিশীল।

ফর্মে দেশ, ZIP বা ফোনের মতো বাড়তি ফিল্ড আসতে পারে আপনার অ্যাকাউন্টের সেটিং অনুযায়ী। codegen দিয়ে দেখে সেগুলো যোগ করুন।

### 3D Secure মডাল

3DS (কার্ডধারীর অতিরিক্ত যাচাই, যেমন ব্যাংকের OTP) চায় এমন টেস্ট কার্ড `4000 0025 0000 3155`। এটা দিলে Stripe একটা **টেস্ট অথেনটিকেশন মডাল** দেখায়, যা আরেকটা iframe, কখনো iframe-এর ভেতরে iframe।

```ts
// ধারণা দেওয়ার জন্য; আসল সিলেক্টর codegen দিয়ে নিন
const challenge = page
  .frameLocator('iframe[name^="__privateStripeFrame"]').first()
  .frameLocator('iframe').first();
await challenge.getByRole('button', { name: /complete|authorize/i }).click();
```

3DS-এর বিভিন্ন কার্ড আর আচরণ [Stripe টেস্ট কার্ড](/lessons/stripe-test-cards/) লেসনে আছে। 3DS UI অটোমেশন সবচেয়ে ভঙ্গুর অংশ; একটা স্মোক টেস্ট যথেষ্ট, বাকি সিনারিও API লেভেলে (`pm_card_threeDSecure2Required` দিয়ে `status: requires_action` চেক) করুন।

## টেস্ট চালানো আর রিপোর্ট

```bash
# সব টেস্ট
npx playwright test

# শুধু API টেস্ট
npx playwright test --project=api

# UI টেস্ট ব্রাউজার দেখে দেখে
npx playwright test --project=ui-chromium --headed

# ইন্টারঅ্যাক্টিভ UI মোড (ডিবাগের জন্য দারুণ)
npx playwright test --ui

# সিলেক্টর খুঁজতে রেকর্ডার
npx playwright codegen https://example.com

# HTML রিপোর্ট খোলা
npx playwright show-report
```

প্রত্যাশিত আউটপুট (সংক্ষেপে):

```text
Running 4 tests using 2 workers
  ✓  [api] › payment-intent.api.spec.ts › successful card creates a succeeded PaymentIntent
  ✓  [api] › payment-intent.api.spec.ts › declined card returns 402 card_error
  ✓  [api] › payment-intent.api.spec.ts › same Idempotency-Key returns the same PaymentIntent
  ✓  [ui-chromium] › checkout.ui.spec.ts › pay on hosted Checkout with 4242 and verify via API
  4 passed
```

স্ক্রিনশট বর্ণনা: HTML রিপোর্টে বাঁ দিকে টেস্টের তালিকা সবুজ টিকসহ; ব্যর্থ টেস্টে ক্লিক করলে ধাপের তালিকা, এরর মেসেজ, স্ক্রিনশট আর Trace লিংক দেখা যায়। Trace Viewer-এ প্রতিটা ধাপের আগে-পরের DOM আর নেটওয়ার্ক রিকোয়েস্ট দেখা যায়।

## হাতেকলমে অনুশীলন

1. `npm init playwright@latest` দিয়ে প্রজেক্ট বানান আর `.env` + `.gitignore` সেট করুন।
2. উপরের `playwright.config.ts` বসান।
3. API টেস্ট ফাইলের ৩টা টেস্ট লিখে `--project=api` দিয়ে চালান।
4. `pm_card_chargeDeclinedInsufficientFunds` দিয়ে চতুর্থ টেস্ট যোগ করুন; `decline_code` চেক করুন।
5. Checkout Session বানিয়ে `npx playwright codegen <session url>` চালান, নিজের হাতে একবার পে করুন, রেকর্ড হওয়া সিলেক্টরগুলো দেখুন।
6. UI টেস্ট লিখে `--headed` দিয়ে চালান।
7. ইচ্ছা করে একটা `expect` ভুল করুন, টেস্ট ফেইল করান, `show-report` দিয়ে Trace দেখুন।
8. `git status` দিয়ে নিশ্চিত হন `.env` ট্র্যাক হচ্ছে না।

> [!CHECK] সফলতার চেকলিস্ট
> - API টেস্ট ব্রাউজার ছাড়াই কয়েক সেকেন্ডে পাস করে
> - UI টেস্ট শেষে API দিয়ে `payment_status: paid` যাচাই হয়
> - কোথাও কোডে কী লেখা নেই; `sk_test_` গার্ড আছে
> - HTML রিপোর্ট খুলে ব্যর্থ টেস্টের Trace দেখতে পারেন

> [!MISTAKE] সাধারণ ভুল
> - `page.waitForTimeout(5000)` দিয়ে অপেক্ষা। এর বদলে `waitForURL` বা `expect(...).toBeVisible()` ব্যবহার করুন।
> - iframe-এর ভেতরের ফিল্ড `page.locator` দিয়ে খোঁজা।
> - শুধু success পেজ দেখে পেমেন্ট সফল ধরে নেওয়া।
> - Stripe-এর হোস্টেড UI-তে শত শত টেস্ট লেখা, যা প্রতি সপ্তাহে ভাঙে।
> - `.env` ফাইল কমিট করা।

## সারসংক্ষেপ

- Playwright একসাথে API (`request` fixture) আর UI টেস্ট করতে পারে; Stripe-এর জন্য `form` অপশন form-encoded বডি পাঠায়।
- কী সবসময় `process.env` থেকে, সাথে `sk_test_` সেফটি গার্ড।
- Stripe-এর কার্ড ফিল্ড ও 3DS মডাল cross-origin iframe-এ থাকে; `frameLocator` লাগে, আর সিলেক্টর বদলাতে পারে।
- সেরা প্যাটার্ন: API দিয়ে তৈরি, UI দিয়ে ছোট কাজ, API দিয়ে যাচাই।
- `npx playwright show-report` আর Trace Viewer দিয়ে ব্যর্থতা বিশ্লেষণ করুন।

## বাড়ির কাজ

1. একটা টেস্ট লিখুন: Checkout পেজে গিয়ে cancel/back লিংকে ক্লিক করলে `cancel_url`-এ ফেরে, আর API-তে Session-এর `payment_status` তখনো `unpaid`।
2. API টেস্টে আংশিক রিফান্ড যোগ করুন: PaymentIntent বানিয়ে ৫০০ রিফান্ড, তারপর Charge-এ `amount_refunded` ৫০০ যাচাই।

<details><summary>সমাধান দেখুন</summary>

কাজ ২-এর মূল অংশ:

```ts
const refund = await request.post(`${STRIPE}/v1/refunds`, {
  headers: auth(),
  form: { payment_intent: pi.id, amount: '500' },
});
expect(refund.status()).toBe(200);
const charge = await request.get(`${STRIPE}/v1/charges/${pi.latest_charge}`, { headers: auth() });
expect((await charge.json()).amount_refunded).toBe(500);
```

</details>

পরের সপ্তাহে আমরা দেখব পেমেন্টের পর Stripe কীভাবে আপনার সার্ভারকে নিজে থেকে খবর দেয়: [Webhook বেসিক](/lessons/webhook-basics/)।
