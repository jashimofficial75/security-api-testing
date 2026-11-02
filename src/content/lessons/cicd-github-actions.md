---
order: 29
level: 5
week: 9
title: "CI/CD-তে টেস্ট: GitHub Actions দিয়ে Newman ও Playwright চালানো"
description: "প্রতিটি push, pull request ও প্রতি রাতে GitHub Actions-এ Newman ও Playwright টেস্ট চালান, Stripe test key রাখুন Secrets-এ, রিপোর্ট artifact হিসেবে সেভ করুন ও badge দেখান।"
keywords: ["ci/cd", "github actions", "workflow yaml", "newman", "htmlextra", "playwright", "upload-artifact", "setup-node", "cron schedule", "nightly", "github secrets", "stripe test key", "npm cache", "status badge", "pull request", "সিআই সিডি", "অটোমেশন পাইপলাইন", "রাতের টেস্ট"]
minutes: 70
quiz:
  - q: "একজন সহকর্মী workflow YAML-এ সরাসরি STRIPE_SECRET_KEY: sk_test_... লিখে commit করেছেন, যুক্তি: এটা তো test key। সঠিক প্রতিক্রিয়া কোনটি?"
    options: ["Test key, তাই সমস্যা নেই", "শুধু রিপো প্রাইভেট হলে ঠিক আছে", "YAML ফাইলের নাম বদলালেই হবে", "Key টা rotate করে GitHub repository Secrets-এ রাখা এবং YAML-এ secrets থেকে পড়া; test key-ও কোডে নয়"]
    answer: 3
    explain: "কোডে থাকা key Git history-তে চিরকাল থাকে, ফর্ক ও ক্লোনে ছড়ায়। Test key দিয়েও স্যান্ডবক্সের সব ডেটা বদলানো যায়। তাই rotate করে Secrets-এ রাখতে হবে।"
  - q: "Newman-এর ৩০টি টেস্টের ২টি ফেল করল, কিন্তু GitHub Actions-এর জব সবুজ দেখাচ্ছে। সবচেয়ে সম্ভাব্য কারণ কী?"
    options: ["কমান্ডের শেষে || true বা continue-on-error: true দেওয়া আছে, তাই ব্যর্থতা চাপা পড়ছে", "Newman ফেল হলে সবসময় সবুজ দেখায়", "htmlextra রিপোর্টার ফেল লুকায়", "cron schedule চালু থাকলে এমন হয়"]
    answer: 0
    explain: "Newman টেস্ট ফেল হলে non-zero exit code দেয়, তাতেই স্টেপ লাল হয়। কেউ || true বা continue-on-error দিলে সেই সংকেত হারিয়ে যায়, CI তখন অর্থহীন।"
  - q: "টেস্ট ফেল করলে রিপোর্টটাই সবচেয়ে দরকারি, কিন্তু আপলোড স্টেপ চলেইনি। কোন পরিবর্তনে সমাধান হবে?"
    options: ["আপলোড স্টেপ টেস্টের আগে রাখা", "টেস্ট স্টেপ মুছে দেওয়া", "আপলোড স্টেপে if: always() বা if: !cancelled() যোগ করা, যাতে আগের স্টেপ ফেল করলেও চলে", "retention-days বাড়ানো"]
    answer: 2
    explain: "ডিফল্টভাবে আগের স্টেপ ফেল করলে পরের স্টেপ চলে না। if: always() দিলে টেস্ট ফেল হলেও রিপোর্ট আপলোড হয়, ঠিক যখন সবচেয়ে বেশি দরকার।"
  - q: "আপনি চান টেস্ট প্রতি রাতে বাংলাদেশ সময় রাত ২টায় চলুক। GitHub Actions-এর cron UTC-তে চলে। কোন cron সঠিক?"
    options: ["0 2 * * *", "0 20 * * *", "0 14 * * *", "30 2 * * *"]
    answer: 1
    explain: "বাংলাদেশ UTC+6, তাই রাত ২টা মানে আগের দিনের UTC 20:00। cron-এর প্রথম ঘর মিনিট, দ্বিতীয় ঘর ঘণ্টা।"
  - q: "একজন বাইরের কন্ট্রিবিউটর ফর্ক থেকে pull request পাঠালেন। Newman স্টেপে Stripe key খালি আসছে, তাই ৪০১ এরর। এটা কেন?"
    options: ["Stripe ফর্ক ব্লক করে", "Newman ফর্কে চলে না", "ফর্ক থেকে আসা pull_request ইভেন্টে GitHub নিরাপত্তার জন্য রিপোর Secrets দেয় না; এটা প্রত্যাশিত আচরণ", "cron চালু থাকায়"]
    answer: 2
    explain: "নাহলে যে কেউ PR-এ কোড বদলে আপনার secret চুরি করতে পারত। এমন PR-এ secret-নির্ভর টেস্ট বাদ দিন বা মেইনটেইনার রিভিউর পর চালান।"
---

এতদিন আমরা Newman আর Playwright টেস্ট নিজের ল্যাপটপে চালিয়েছি। কিন্তু কেউ মনে না করলে টেস্ট চলে না, আর "আমার মেশিনে তো চলছিল" সমস্যা থেকেই যায়।

CI/CD-তে টেস্ট বসালে প্রতিটি কোড পরিবর্তনে নিজে থেকেই টেস্ট চলবে, ফেল করলে লাল দাগ দেখাবে, রিপোর্ট সেভ থাকবে। এই লেসনে GitHub Actions দিয়ে পুরো পাইপলাইন বানাব।

## এই লেসনে যা শিখবেন

- CI ও CD কী, টেস্টারের জন্য কেন জরুরি
- GitHub Actions-এর মূল ধারণা: workflow, trigger, job, step, runner
- Newman টেস্ট চালিয়ে htmlextra রিপোর্ট artifact হিসেবে আপলোড
- Playwright টেস্ট চালিয়ে playwright-report আপলোড
- push, pull_request ও রাতের schedule (cron) trigger
- Stripe test key GitHub Secrets-এ রাখা, YAML-এ কখনো নয়
- টেস্ট ফেল হলে বিল্ড ফেল করা, npm caching, status badge

## CI/CD কী

**CI (Continuous Integration, নিয়মিত কোড একত্র করা ও প্রতিবার স্বয়ংক্রিয় যাচাই)**: ডেভেলপার কোড push করলেই একটা সার্ভারে বিল্ড ও টেস্ট চলে।

**CD (Continuous Delivery/Deployment, যাচাই পাস হলে স্বয়ংক্রিয়ভাবে রিলিজের জন্য প্রস্তুত বা রিলিজ করা)**: টেস্ট সবুজ হলে কোড স্টেজিং বা প্রোডাকশনে যায়।

উপমা: একটা রাইড অ্যাপের প্রতিটি গাড়ি রাস্তায় নামার আগে গ্যারেজে একটা চেকপয়েন্ট পেরোয়: ব্রেক, টায়ার, লাইট। চেকপয়েন্ট ফেল করলে গাড়ি বের হয় না। CI হলো সেই চেকপয়েন্ট, আর আপনার টেস্টগুলো চেকলিস্ট।

টেস্টারের লাভ:

- বাগ আসে PR পর্যায়েই, রিলিজের পরে নয়
- প্রতিটি রানের রিপোর্ট সংরক্ষিত, পরে তুলনা করা যায়
- রাতের রানে স্যান্ডবক্সের পরিবর্তন বা ফ্লেকি টেস্ট ধরা পড়ে
- পোর্টফোলিওতে দেখানোর মতো বাস্তব দক্ষতা

## GitHub Actions-এর মূল ধারণা

| শব্দ | মানে |
|---|---|
| Workflow | `.github/workflows/` ফোল্ডারে একটা YAML ফাইল; পুরো পাইপলাইন |
| Trigger (`on`) | কখন চলবে: `push`, `pull_request`, `schedule`, `workflow_dispatch` (হাতে চালানো) |
| Job | একটা আলাদা মেশিনে চলা কাজের গুচ্ছ; একাধিক job সমান্তরালে চলে |
| Step | job-এর ভেতরে একটা কমান্ড বা একটা তৈরি action |
| Runner | যে ভার্চুয়াল মেশিনে চলে, যেমন `ubuntu-latest` |
| Action | পুনরায় ব্যবহারযোগ্য স্টেপ, যেমন `actions/checkout@v4` |
| Artifact | রান শেষে সেভ করা ফাইল, যেমন HTML রিপোর্ট |
| Secret | এনক্রিপ্ট করা গোপন মান, লগে `***` দেখায় |

পাবলিক রিপোতে GitHub-হোস্টেড runner-এ Actions ফ্রি; প্রাইভেট রিপোতে প্রতি মাসে নির্দিষ্ট ফ্রি মিনিট থাকে। সর্বশেষ সীমা দেখুন [docs.github.com](https://docs.github.com)-এ "GitHub Actions billing" সার্চ করে।

## প্রজেক্টের গঠন

ধরে নিচ্ছি আপনার রিপোতে আগের লেসনগুলোর কাজ আছে: [Newman CLI ও রিপোর্ট](/lessons/newman-cli-reports/) এবং [Playwright API ও UI টেস্টিং](/lessons/playwright-api-ui-testing/)।

```text
payment-qa-tests/
├── .github/
│   └── workflows/
│       ├── api-tests.yml
│       └── e2e-tests.yml
├── postman/
│   ├── stripe-sandbox.postman_collection.json
│   └── ci.postman_environment.json
├── tests/
│   └── checkout.spec.ts
├── playwright.config.ts
├── package.json
└── package-lock.json
```

`package.json`-এ টুলগুলো devDependency হিসেবে রাখুন, যাতে লোকাল আর CI-তে একই ভার্সন চলে:

```json
{
  "name": "payment-qa-tests",
  "private": true,
  "scripts": {
    "test:api": "newman run postman/stripe-sandbox.postman_collection.json -e postman/ci.postman_environment.json --env-var secretKey=$STRIPE_SECRET_KEY -r cli,htmlextra --reporter-htmlextra-export reports/newman-report.html",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "newman": "^6.2.1",
    "newman-reporter-htmlextra": "^1.23.1"
  }
}
```

> [!NOTE]
> ভার্সন নম্বরগুলো উদাহরণ। নিজের প্রজেক্টে `npm install -D newman newman-reporter-htmlextra @playwright/test` চালালে সর্বশেষ ভার্সন বসবে এবং `package-lock.json` তৈরি হবে। CI-তে `npm ci` এই lock ফাইল থেকেই হুবহু একই ভার্সন বসায়।

Environment ফাইলে `secretKey`-এর মান খালি রাখুন। আসল মান CI-তে `--env-var` দিয়ে ঢুকবে:

```json
{
  "name": "ci",
  "values": [
    { "key": "baseUrl", "value": "https://api.stripe.com", "enabled": true },
    { "key": "secretKey", "value": "", "type": "secret", "enabled": true }
  ]
}
```

## Stripe Test Key: শুধু GitHub Secrets-এ

1. GitHub-এ রিপো → **Settings** → **Secrets and variables** → **Actions**।
2. **New repository secret** চাপুন।
3. Name: `STRIPE_TEST_SECRET_KEY`, Secret: আপনার Stripe Sandbox-এর test secret key (`sk_test_` দিয়ে শুরু)।
4. **Add secret**।

স্ক্রিনশট বর্ণনা: "Actions secrets and variables" পেজে Secrets ট্যাবের নিচে "Repository secrets" তালিকায় `STRIPE_TEST_SECRET_KEY` নাম ও "Updated just now" লেখা; মানটা কোথাও দেখা যায় না, শুধু Update ও Remove বোতাম।

> [!LIVE] লাইভ key কখনো CI-তে নয়
> CI টেস্টের জন্য শুধু Sandbox/test mode-এর key। সম্ভব হলে restricted key (`rk_test_XXXX`) বানিয়ে শুধু প্রয়োজনীয় অনুমতি দিন। `sk_live_` key CI-তে রাখলে একটা ভুল টেস্টেই আসল গ্রাহকের টাকা রিফান্ড হয়ে যেতে পারে।

## Workflow ১: Newman API টেস্ট

`.github/workflows/api-tests.yml`:

```yaml
name: API Tests (Newman)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 20 * * *'   # প্রতিদিন 20:00 UTC = বাংলাদেশ সময় রাত ২টা
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: api-tests-${{ github.ref }}
  cancel-in-progress: true

jobs:
  newman:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js with npm cache
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Newman collection
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
        run: |
          mkdir -p reports
          npx newman run postman/stripe-sandbox.postman_collection.json \
            -e postman/ci.postman_environment.json \
            --env-var "secretKey=$STRIPE_SECRET_KEY" \
            -r cli,htmlextra \
            --reporter-htmlextra-export reports/newman-report.html

      - name: Upload Newman HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: newman-report
          path: reports/newman-report.html
          retention-days: 14
```

লাইন ধরে বুঝি:

- `on`: চারটি trigger। `push` ও `pull_request` main ব্রাঞ্চে, `schedule` প্রতি রাতে, `workflow_dispatch` দিয়ে Actions ট্যাব থেকে হাতে চালানো যায়।
- `permissions: contents: read`: workflow-কে শুধু কোড পড়ার অনুমতি, সবচেয়ে কম অনুমতির নীতি।
- `concurrency`: একই ব্রাঞ্চে নতুন push এলে পুরনো রান বাতিল, মিনিট বাঁচে।
- `cache: 'npm'`: `setup-node` lock ফাইল দেখে npm-এর ডাউনলোড ক্যাশ রাখে, পরের রানে `npm ci` দ্রুত হয়।
- `env` থেকে key আসে, কমান্ডে `$STRIPE_SECRET_KEY` হিসেবে। লগে GitHub মানটা `***` দিয়ে ঢেকে দেয়।
- `if: always()`: টেস্ট ফেল করলেও রিপোর্ট আপলোড হবে।

### টেস্ট ফেল মানে বিল্ড ফেল

Newman কোনো assertion ফেল করলে non-zero exit code দিয়ে বের হয়। GitHub Actions সেটা দেখে স্টেপ লাল করে, পুরো job ফেল হয়, আর PR-এ লাল ক্রস দেখায়। এটাই আমরা চাই।

তাই কখনো এমন করবেন না:

```yaml
      # ভুল: ব্যর্থতা চাপা পড়ে যায়
      - run: npx newman run collection.json || true
        continue-on-error: true
```

রিপোর ব্রাঞ্চ সুরক্ষায় (Settings → Branches বা Rules) এই চেককে "required" করলে লাল থাকা অবস্থায় PR merge-ই করা যাবে না।

## Workflow ২: Playwright টেস্ট

`.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests (Playwright)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '30 20 * * *'  # API টেস্টের ৩০ মিনিট পরে
  workflow_dispatch:

permissions:
  contents: read

jobs:
  playwright:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js with npm cache
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
          CI: true
        run: npx playwright test

      - name: Upload Playwright report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

কিছু ব্যাখ্যা:

- `npx playwright install --with-deps`: ব্রাউজার (Chromium, Firefox, WebKit) এবং Linux-এ সেগুলো চালাতে যেসব সিস্টেম লাইব্রেরি লাগে, সব বসায়। শুধু Chromium লাগলে `npx playwright install --with-deps chromium` দিয়ে সময় বাঁচান।
- `if: ${{ !cancelled() }}`: রান হাতে বাতিল না হলে, টেস্ট পাস বা ফেল যা-ই হোক, রিপোর্ট আপলোড হবে।
- `CI: true`: Playwright-এর ডিফল্ট config এটা দেখে `retries` ও `forbidOnly` চালু করে।

`playwright.config.ts`-এ CI-এর জন্য দরকারি অংশ:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,          // ভুলে test.only রেখে দিলে CI ফেল
  retries: process.env.CI ? 2 : 0,       // ফ্লেকি টেস্টে ২ বার আবার চেষ্টা
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',             // রিট্রাইয়ে trace সেভ, ডিবাগে কাজের
    screenshot: 'only-on-failure',
  },
});
```

> [!TIP] রিপোর্ট দেখা
> রান শেষে Actions ট্যাবে রানটা খুলুন, নিচে "Artifacts" অংশে `newman-report` ও `playwright-report` পাবেন। ZIP নামিয়ে খুলুন। Playwright রিপোর্ট লোকালে দেখতে ফোল্ডারে গিয়ে `npx playwright show-report playwright-report` চালান।

## ফর্ক, PR ও Secrets

ফর্ক থেকে আসা `pull_request` রানে GitHub রিপোর Secrets দেয় না। নাহলে যে কেউ PR-এ workflow বদলে আপনার key চুরি করত। তাই:

- নিজের টিমের ব্রাঞ্চ থেকে PR হলে Secrets পাবে, টেস্ট চলবে।
- বাইরের ফর্কের PR-এ secret-নির্ভর টেস্ট স্কিপ করুন, অথবা মেইনটেইনার রিভিউর পর চালান।
- `pull_request_target` দিয়ে এই সুরক্ষা এড়ানোর পরামর্শ ইন্টারনেটে পাবেন; এটা ঝুঁকিপূর্ণ, না বুঝে ব্যবহার করবেন না।

একটা সহজ স্কিপ শর্ত:

```yaml
      - name: Run Newman collection
        if: ${{ github.event_name != 'pull_request' || github.event.pull_request.head.repo.full_name == github.repository }}
        env:
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
        run: npm run test:api
```

## Status Badge

README-তে একটা ছোট badge সবাইকে দেখায় টেস্ট এখন সবুজ না লাল। এটা পোর্টফোলিওতেও ভালো দেখায়। README.md-তে এই লাইন যোগ করুন (`OWNER` ও `REPO` নিজের নাম দিয়ে বদলান):

```text
![API Tests](https://github.com/OWNER/REPO/actions/workflows/api-tests.yml/badge.svg)
![E2E Tests](https://github.com/OWNER/REPO/actions/workflows/e2e-tests.yml/badge.svg)
```

Actions ট্যাবে workflow খুলে ডান দিকের `...` মেনু থেকে "Create status badge" দিয়েও তৈরি Markdown কপি করা যায়।

## হাতেকলমে অনুশীলন

1. GitHub-এ `payment-qa-tests` নামে নতুন রিপো বানান, আগের লেসনের Postman collection ও Playwright টেস্ট সেখানে রাখুন।
2. `npm install -D newman newman-reporter-htmlextra @playwright/test` চালিয়ে `package-lock.json` commit করুন।
3. Environment ফাইলে `secretKey` খালি রাখুন; `git grep sk_test_` চালিয়ে নিশ্চিত হোন কোথাও key নেই।
4. রিপো Settings-এ `STRIPE_TEST_SECRET_KEY` Secret যোগ করুন।
5. উপরের দুটো workflow ফাইল বসিয়ে push করুন। Actions ট্যাবে দুটো রান সবুজ হচ্ছে কি না দেখুন।
6. ইচ্ছে করে একটা Postman টেস্টের প্রত্যাশিত Status Code `200`-এর বদলে `201` করে নতুন ব্রাঞ্চে PR খুলুন। PR-এ লাল ক্রস ও Artifacts-এ রিপোর্ট দেখুন, তারপর ঠিক করুন।
7. `workflow_dispatch` দিয়ে Actions ট্যাব থেকে হাতে একবার চালান।
8. README-তে দুটো badge যোগ করুন।

> [!MISTAKE] সাধারণ ভুল
> - YAML-এ বা environment ফাইলে key লিখে commit করা।
> - `|| true` বা `continue-on-error` দিয়ে ফেল চাপা দেওয়া।
> - আপলোড স্টেপে `if: always()` না দেওয়া, ফলে ফেল হলে রিপোর্টই নেই।
> - cron UTC-তে চলে ভুলে যাওয়া; আর সময়ের কাঁটায় শুরু হবে ভাবা। ব্যস্ত সময়ে schedule কিছু মিনিট দেরিতে শুরু হতে পারে।
> - YAML-এ ট্যাব ব্যবহার বা ভুল ইন্ডেন্টেশন; YAML শুধু স্পেস চেনে।
> - প্রতি push-এ শত শত Stripe কল করা টেস্ট চালানো; Stripe-এর test mode-এও rate limit আছে।

> [!CHECK] সফলতার চেকলিস্ট
> - push, PR, রাতের schedule ও হাতে, চারভাবেই workflow চলে
> - Key শুধু Secrets-এ, লগে `***` দেখা যায়
> - একটা টেস্ট ফেল করলে job লাল হয়
> - দুটো রিপোর্টই Artifacts থেকে নামানো যায়
> - README-তে badge দেখা যায়

## সারসংক্ষেপ

- CI প্রতিটি পরিবর্তনে স্বয়ংক্রিয় টেস্ট চালায়; CD পাস হলে রিলিজের পথ খোলে।
- Workflow-এ trigger: `push`, `pull_request`, `schedule` (UTC cron), `workflow_dispatch`।
- `actions/setup-node@v4` দিয়ে Node ও npm cache, `npm ci` দিয়ে নির্দিষ্ট ভার্সন।
- Newman-এর htmlextra ও Playwright-এর HTML রিপোর্ট `actions/upload-artifact@v4` দিয়ে, `if: always()` সহ।
- Stripe test key শুধু `secrets.STRIPE_TEST_SECRET_KEY`-এ; ফেল হলে বিল্ড ফেল, badge দিয়ে সবাইকে জানানো।

## বাড়ির কাজ

1. দুটো workflow এক ফাইলে দুটো job হিসেবে লিখুন, আর `needs:` দিয়ে Playwright job শুধু Newman পাস করলে চালান।
2. রাতের রান ফেল করলে কীভাবে টিম জানবে? GitHub-এর নোটিফিকেশন সেটিং দেখে ৩ লাইনে লিখুন।
3. ভাবুন: আপনার bKash-এর মতো ওয়ালেট অ্যাপের জন্য CI-তে কোন টেস্ট প্রতিটি PR-এ চলবে আর কোনগুলো শুধু রাতে? একটা ছোট টেবিল বানান।

<details><summary>সমাধান দেখুন</summary>

১ নম্বরের কাঠামো:

```yaml
jobs:
  newman:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ...Newman স্টেপগুলো
  playwright:
    needs: newman
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ...Playwright স্টেপগুলো
```

৩ নম্বরের ইঙ্গিত: দ্রুত ও গুরুত্বপূর্ণ টেস্ট (লগইন, পেমেন্ট সফল, রিফান্ড, webhook signature) প্রতিটি PR-এ; ধীর বা বড় টেস্ট (পুরো রিগ্রেশন, সব ব্রাউজারে E2E, রিকনসিলিয়েশন) রাতে।

</details>
