---
order: 8
level: 1
week: 3
title: "পেমেন্ট বাগ রিপোর্ট: ডেভেলপার যেটা পড়ে সঙ্গে সঙ্গে ঠিক করতে পারে"
description: "পেমেন্ট বাগের জন্য পরিষ্কার রিপোর্ট লেখা শিখুন: Steps, Expected vs Actual, Severity ও Priority, Stripe request ID ও PaymentIntent ID দিয়ে প্রমাণ, আর ৫টি বাস্তব উদাহরণ।"
keywords: ["bug report", "payment bug", "severity", "priority", "steps to reproduce", "stripe request id", "paymentintent", "evidence", "redact", "বাগ রিপোর্ট", "সিভিয়ারিটি", "ডাবল চার্জ", "রিফান্ড বাগ"]
minutes: 50
quiz:
  - q: "রিপোর্টের পেজে একটি বানান ভুল, কিন্তু বড় একটি ক্লায়েন্টের ডেমো কাল সকালে। এই বাগের Severity ও Priority কেমন হতে পারে?"
    options: ["Severity Critical, Priority Low", "দুটোই Critical", "Severity Low, Priority High", "দুটোই Low, কারণ বানান ভুল কখনো জরুরি নয়"]
    answer: 2
    explain: "Severity মাপে সিস্টেমে প্রভাব কত বড়; বানান ভুলের প্রভাব কম। Priority মাপে কত দ্রুত ঠিক করতে হবে; ডেমোর কারণে এটা আগে ঠিক করা দরকার। দুটি আলাদা জিনিস।"
  - q: "পেমেন্ট সফল হয়েছে, কিন্তু অর্ডার তৈরি হয়নি। ডেভেলপারকে সবচেয়ে দ্রুত সাহায্য করবে কোন প্রমাণ?"
    options: ["PaymentIntent ID (pi_…), সময় ও সংশ্লিষ্ট webhook ইভেন্ট ID", "শুধু একটি স্ক্রিনশট যেখানে লেখা 'কিছু একটা ভুল হয়েছে'", "ব্রাউজারের ইতিহাস", "নিজের কার্ডের পুরো নম্বর"]
    answer: 0
    explain: "pi_… আর ইভেন্ট ID দিয়ে ডেভেলপার Stripe Dashboard ও সার্ভার লগে ঠিক সেই লেনদেন খুঁজে পান। শুধু স্ক্রিনশটে খোঁজার মতো কিছু থাকে না, আর আসল কার্ড নম্বর কখনো রিপোর্টে দেবেন না।"
  - q: "ডেভ-টুলস থেকে কপি করা রিকোয়েস্টে Authorization: Bearer sk_test_… হেডার আছে। রিপোর্টে কী করবেন?"
    options: ["যেমন আছে তেমন দেবেন, এটা তো টেস্ট কী", "পুরো রিকোয়েস্ট মুছে দেবেন, কোনো প্রমাণ দেবেন না", "কী-টা শিরোনামে লিখবেন যাতে সবাই দেখে", "কী-এর বেশিরভাগ অংশ ঢেকে দেবেন, যেমন sk_test_XXXX…"]
    answer: 3
    explain: "টেস্ট কী-ও গোপন: এটা দিয়ে কেউ আপনার Sandbox অ্যাকাউন্টে কাজ চালাতে পারে। প্রমাণ রাখুন, কিন্তু কী, টোকেন, পাসওয়ার্ড ও ব্যক্তিগত তথ্য ঢেকে দিন।"
  - q: "নিচের কোন বাগ শিরোনামটি সবচেয়ে ভালো?"
    options: ["পেমেন্ট কাজ করছে না!!!", "চেকআউট: Pay বাটনে ডাবল ক্লিকে একই অর্ডারে দুইবার চার্জ হয় (Test Mode)", "বাগ পাওয়া গেছে", "চেকআউট সমস্যা জরুরি দেখুন"]
    answer: 1
    explain: "ভালো শিরোনামে কোথায় (চেকআউট), কী করলে (ডাবল ক্লিক) আর কী হয় (দুইবার চার্জ) থাকে। বাকিগুলো থেকে সমস্যা বোঝা যায় না।"
  - q: "Steps to Reproduce লেখার পর আপনি নিজে আবার চেষ্টা করলেন, কিন্তু বাগটি ১০ বারে ৩ বার হয়। কী লিখবেন?"
    options: ["বাগ রিপোর্ট বাতিল করবেন", "লিখবেন 'সবসময় হয়'", "Reproducibility: ৩/১০ বার, এবং যে অবস্থায় বেশি হয় (যেমন ধীর নেটওয়ার্ক) তা উল্লেখ করবেন", "শুধু ডেভেলপারকে মুখে বলবেন"]
    answer: 2
    explain: "মাঝে মাঝে হওয়া বাগও আসল বাগ, বিশেষ করে পেমেন্টে। কতবারে কতবার হয় আর কোন অবস্থায়, সেটা সৎভাবে লিখলে ডেভেলপার কারণ খুঁজতে পারেন।"
---

টেস্ট কেস ফেইল করল। এখন আপনার কাজ হলো এমনভাবে জানানো, যাতে ডেভেলপার রিপোর্ট পড়েই বাগটা নিজের মেশিনে ঘটাতে পারেন। পেমেন্টে একটি ভালো বাগ রিপোর্ট মানে দ্রুত সমাধান, আর কম টাকার ক্ষতি।

আগের লেসনে ([পেমেন্ট টেস্ট কেস](/lessons/payment-test-cases/)) আমরা কেস লিখেছি। এবার ফেইল হওয়া কেস থেকে রিপোর্ট লিখব।

## এই লেসনে যা শিখবেন

- একটি ভালো বাগ রিপোর্টের প্রতিটি অংশ: Title, Environment, Steps, Expected vs Actual
- Severity আর Priority-র পার্থক্য, পেমেন্টের উদাহরণসহ
- কী প্রমাণ (Evidence) দেবেন: স্ক্রিনশট, ভিডিও, রিকোয়েস্ট/রেসপন্স, `req_…`, `pi_…`, লগ
- প্রমাণ থেকে গোপন তথ্য ও ব্যক্তিগত তথ্য কীভাবে ঢাকবেন
- একটি রেডি টেমপ্লেট আর ৫টি পূর্ণ বাস্তব বাগ রিপোর্ট

## একটি ভালো বাগ রিপোর্টের অংশ

### Title (শিরোনাম)

শিরোনাম পড়েই বোঝা উচিত **কোথায়, কী করলে, কী হয়**। সূত্র:

```text
[মডিউল]: [কী করলে] [কী ভুল হয়] ([পরিবেশ])
```

| খারাপ | ভালো |
|---|---|
| পেমেন্ট কাজ করছে না | চেকআউট: 4000 0000 0000 0002 কার্ডে ডিক্লাইনের পরও "পেমেন্ট সফল" দেখায় |
| রিফান্ড বাগ | অ্যাডমিন অর্ডার: Stripe-এ পূর্ণ রিফান্ডের পরও অর্ডার status "paid" থাকে |

### Environment (পরিবেশ)

বাগ কোথায় ঘটেছে: অ্যাপের URL বা বিল্ড ভার্সন, ব্রাউজার ও ভার্সন, অপারেটিং সিস্টেম বা ফোন মডেল, Stripe মোড (Test Mode), টেস্ট অ্যাকাউন্ট (ইমেইল নয়, একটি টেস্ট ইউজার আইডি)।

### Steps to Reproduce (বাগ ঘটানোর ধাপ)

সংখ্যা দিয়ে, প্রতি ধাপে একটি কাজ। এমনভাবে লিখুন যেন নতুন কেউ প্রথমবার অ্যাপ খুলছেন। টেস্ট ডেটা (কার্ড নম্বর, অ্যামাউন্ট, কুপন) ধাপের মধ্যেই লিখুন।

সাথে **Reproducibility** লিখুন: সবসময় (১০/১০), নাকি মাঝে মাঝে (যেমন ৩/১০)।

### Expected vs Actual (প্রত্যাশিত বনাম আসল)

- **Expected:** টেস্ট কেস বা রিকোয়ারমেন্ট অনুযায়ী কী হওয়ার কথা।
- **Actual:** আসলে কী হলো। মতামত নয়, যা দেখেছেন তা।

দুটোই নির্দিষ্ট হতে হবে: স্ট্যাটাস, মেসেজের আসল লেখা, অ্যামাউন্ট।

### Severity বনাম Priority

**Severity** (সিস্টেম বা ব্যবসার উপর বাগের প্রভাব কত বড়) সাধারণত টেস্টার ঠিক করেন। **Priority** (কত দ্রুত ঠিক করতে হবে) সাধারণত প্রোডাক্ট ম্যানেজার বা লিড ঠিক করেন, ব্যবসার দরকার দেখে।

| Severity | মানে | পেমেন্টের উদাহরণ |
|---|---|---|
| Critical | টাকার ক্ষতি, ডেটা নষ্ট, বা মূল ফ্লো পুরো বন্ধ | ডাবল চার্জ; টাকা কাটল কিন্তু অর্ডার নেই; ভুল অ্যামাউন্ট চার্জ |
| High | মূল ফিচার ভুল কাজ করে, কিন্তু উপায় আছে | রিফান্ডের পর স্ট্যাটাস আপডেট হয় না; ডিক্লাইনে ভুল মেসেজ |
| Medium | আংশিক সমস্যা, সীমিত প্রভাব | রসিদ ইমেইল দেরিতে যায়; কুপনের এরর মেসেজ অস্পষ্ট |
| Low | দেখতে খারাপ, প্রভাব নেই | রসিদে বানান ভুল; মোবাইলে বাটনের রং একটু ভিন্ন |

Severity আর Priority সবসময় এক নয়। রসিদে কোম্পানির নাম ভুল বানানে লেখা: Severity Low, কিন্তু Priority High হতে পারে, কারণ সব গ্রাহক এটা দেখছে।

> [!TIP]
> পেমেন্টে সন্দেহ হলে প্রশ্ন করুন: "এতে কি কারও টাকা ভুলভাবে কাটছে, আটকে যাচ্ছে বা হারাচ্ছে?" উত্তর হ্যাঁ হলে Severity প্রায় নিশ্চিতভাবে Critical।

### Evidence (প্রমাণ)

| প্রমাণ | কেন দরকার | কোথায় পাবেন |
|---|---|---|
| স্ক্রিনশট | ইউজার কী দেখল | ফোন বা ব্রাউজার |
| স্ক্রিন রেকর্ডিং | ডাবল ক্লিক, টাইমিং বাগ দেখাতে | OBS Studio, ফোনের স্ক্রিন রেকর্ডার |
| Request/Response | সার্ভার কী পেল, কী দিল | DevTools Network ট্যাব, Postman |
| Stripe request ID `req_…` | Stripe-এ ঠিক সেই API কল খুঁজতে | রেসপন্স হেডার `Request-Id`, Dashboard → Developers → Logs |
| PaymentIntent ID `pi_…` | পেমেন্টটি খুঁজতে | Dashboard → Payments, API রেসপন্স |
| Event ID `evt_…` | কোন webhook ইভেন্ট | Dashboard → Developers → Events বা Webhooks |
| সার্ভার লগ | ভেতরে কী এরর হলো | ডেভেলপার বা লগ টুল (অনুমতি থাকলে) |
| সময় (টাইমজোনসহ) | লগে মিলাতে | যেমন 2026-11-02 14:05 (GMT+6) |

### প্রমাণ থেকে গোপন তথ্য ঢাকা (Redaction)

Redaction (রিপোর্টে দেওয়ার আগে গোপন বা ব্যক্তিগত অংশ মুছে বা ঢেকে দেওয়া)। বাগ রিপোর্ট অনেক মানুষ পড়ে, টিকিট সিস্টেমে বছরের পর বছর থাকে।

ঢাকবেন:

- API কী: `sk_test_…`, `rk_test_…`, webhook সিক্রেট `whsec_…` (লিখুন `sk_test_XXXXXXXX`)
- `Authorization` হেডার, কুকি, সেশন টোকেন, JWT
- পাসওয়ার্ড, OTP
- আসল গ্রাহকের নাম, ইমেইল, ফোন, ঠিকানা (PII, ব্যক্তিকে চেনা যায় এমন তথ্য)
- আসল কার্ড নম্বর (টেস্ট কার্ড 4242… ঠিক আছে)

রাখবেন: `pi_…`, `req_…`, `evt_…`, `ch_…`, `re_…` ID। এগুলো দিয়ে লেনদেন খোঁজা যায়, কিন্তু কী ছাড়া কিছু করা যায় না।

> [!DANGER]
> টেস্ট কী-ও গোপন। কেউ আপনার `sk_test_` কী পেলে আপনার Sandbox-এ কাস্টমার, পেমেন্ট, webhook বদলাতে পারে। স্ক্রিনশটে কী দেখা গেলে ছবিতে কালো বক্স দিন, শুধু ঝাপসা নয়। ভুলে কী শেয়ার হয়ে গেলে সঙ্গে সঙ্গে Dashboard থেকে কী রোল (Roll key) করুন।

## বাগ রিপোর্ট টেমপ্লেট

এটা কপি করে Jira, Trello, GitHub Issues বা একটি Google Doc-এ ব্যবহার করুন।

```text
Bug ID: BUG-PAY-___
Title: [মডিউল]: [কী করলে] [কী ভুল হয়] ([পরিবেশ])

Environment:
  - App: <URL / build version>
  - Browser/Device: <Chrome 1xx, Windows 11 / Android ফোন মডেল>
  - Stripe mode: Test Mode
  - Test user: <test user id, ইমেইল নয়>

Precondition:
  - <শুরুর অবস্থা>

Steps to Reproduce:
  1.
  2.
  3.

Test Data: <card, amount, currency, coupon>

Expected Result:
  -

Actual Result:
  -

Reproducibility: <১০/১০ বা ৩/১০>
Severity: <Critical / High / Medium / Low>
Priority: <P1 / P2 / P3>  (লিড ঠিক করবেন, প্রস্তাব দিন)

Evidence (সব গোপন তথ্য ঢাকা):
  - Screenshot / video:
  - PaymentIntent: pi_...
  - Stripe request: req_...
  - Event: evt_...
  - Time: YYYY-MM-DD HH:MM (GMT+6)
  - Logs / request-response excerpt:

Related test case: TC-PAY-___
Notes: <সম্ভাব্য কারণ যদি জানেন, বা অন্য তথ্য>
```

> [!NOTE]
> "Notes"-এ সম্ভাব্য কারণ লিখতে পারেন, কিন্তু অনুমানকে অনুমানই বলুন ("সম্ভবত webhook হ্যান্ডলার…")। রিপোর্টের মূল অংশ হলো তথ্য।

## পাঁচটি বাস্তব বাগ রিপোর্ট

নিচের রিপোর্টগুলো একটি কোর্স-বিক্রির টেস্ট সাইট ধরে লেখা। ID ও সময় উদাহরণ মাত্র।

### রিপোর্ট ১: পেমেন্ট সফল কিন্তু অর্ডার তৈরি হয়নি

```text
Bug ID: BUG-PAY-101
Title: চেকআউট: Stripe-এ পেমেন্ট succeeded, কিন্তু অ্যাপে কোনো অর্ডার তৈরি হয় না (Test Mode)

Environment:
  - App: staging, build 2.4.1
  - Browser: Chrome 130, Windows 11
  - Stripe mode: Test Mode
  - Test user: user_test_042

Precondition:
  - কার্টে "API Testing Bootcamp" (25.00 USD)

Steps to Reproduce:
  1. Checkout পেজে যান
  2. কার্ড 4242 4242 4242 4242, মেয়াদ 12/34, CVC 123 দিন
  3. Pay চাপুন
  4. "পেমেন্ট সফল" পেজ আসার পর "আমার কোর্স" পেজে যান
  5. অ্যাডমিন প্যানেলে Orders লিস্ট দেখুন

Test Data: 4242 4242 4242 4242, amount 2500 USD cents

Expected Result:
  - অ্যাপে নতুন অর্ডার, status = paid
  - "আমার কোর্স"-এ কোর্সটি দেখায়

Actual Result:
  - Stripe Dashboard-এ PaymentIntent succeeded, amount 2500
  - অ্যাপে কোনো অর্ডার নেই; "আমার কোর্স" খালি
  - Developers -> Webhooks-এ payment_intent.succeeded ইভেন্টের ডেলিভারি 500 রেসপন্স দেখায়

Reproducibility: ১০/১০
Severity: Critical (গ্রাহকের টাকা কেটেছে, কিন্তু পণ্য পায়নি)
Priority: P1 (প্রস্তাবিত)

Evidence:
  - Screenshot: success-page.png, orders-empty.png
  - PaymentIntent: pi_3PExample0001
  - Event: evt_3PExample0001 (payment_intent.succeeded), endpoint response 500
  - Time: 2026-11-02 14:05 (GMT+6)
  - Webhook response body: {"error":"Cannot read properties of undefined (reading 'courseId')"}

Related test case: TC-PAY-001
Notes: সম্ভবত webhook হ্যান্ডলার PaymentIntent-এর metadata-তে courseId পাচ্ছে না।
```

### রিপোর্ট ২: ডাবল ক্লিকে ডাবল চার্জ

```text
Bug ID: BUG-PAY-102
Title: চেকআউট: Pay বাটনে দ্রুত দুইবার ক্লিক করলে দুটি চার্জ ও দুটি অর্ডার হয় (Test Mode)

Environment:
  - App: staging, build 2.4.1
  - Browser: Chrome 130 (Android 14, মধ্যম মানের ফোন), Fast 4G throttling
  - Stripe mode: Test Mode
  - Test user: user_test_042

Precondition:
  - কার্টে "Postman Basics" (10.00 USD)

Steps to Reproduce:
  1. Checkout পেজে কার্ড 4242 4242 4242 4242, 12/34, 123 দিন
  2. Pay বাটনে খুব দ্রুত পরপর দুইবার ট্যাপ করুন
  3. Stripe Dashboard -> Payments দেখুন
  4. অ্যাপের Orders দেখুন

Test Data: 4242 4242 4242 4242, amount 1000

Expected Result:
  - প্রথম ক্লিকের পর বাটন ডিসেবল ও "প্রসেসিং..." দেখায়
  - একটি PaymentIntent, একটি চার্জ, একটি অর্ডার

Actual Result:
  - বাটন ডিসেবল হয় না
  - দুটি PaymentIntent succeeded, প্রতিটি 1000 (মোট 20.00 USD চার্জ)
  - দুটি অর্ডার তৈরি

Reproducibility: ৭/১০ (ধীর নেটওয়ার্কে বেশি)
Severity: Critical (গ্রাহক দ্বিগুণ টাকা দেয়)
Priority: P1 (প্রস্তাবিত)

Evidence:
  - Video: double-tap.mp4 (১২ সেকেন্ড)
  - PaymentIntents: pi_3PExample0002, pi_3PExample0003 (একই সেকেন্ডে তৈরি)
  - Stripe requests: req_Example0002a, req_Example0002b (POST /v1/payment_intents, Idempotency-Key হেডার নেই)
  - Time: 2026-11-02 14:20 (GMT+6)

Related test case: TC-PAY-030
Notes: ক্লায়েন্টে বাটন ডিসেবল আর সার্ভারে Idempotency-Key দুটোই দরকার বলে মনে হয়।
```

### রিপোর্ট ৩: ভুল অ্যামাউন্ট (×১০০ রূপান্তর বাগ)

```text
Bug ID: BUG-PAY-103
Title: চেকআউট: দশমিক দামে চার্জ ১০০ গুণ বেশি বা কম হয় (19.99 USD -> 0.20 USD) (Test Mode)

Environment:
  - App: staging, build 2.4.2
  - Browser: Firefox 132, Ubuntu 24.04
  - Stripe mode: Test Mode
  - Test user: user_test_051

Precondition:
  - কার্টে "Webhook Masterclass" (দাম 19.99 USD)

Steps to Reproduce:
  1. Checkout পেজে মোট দাম 19.99 USD দেখুন
  2. কার্ড 4242 4242 4242 4242, 12/34, 123 দিয়ে Pay চাপুন
  3. Stripe Dashboard-এ PaymentIntent-এর amount দেখুন
  4. একই কাজ 20.00 USD কোর্সে করুন

Test Data: amount UI 19.99 USD এবং 20.00 USD

Expected Result:
  - 19.99 USD -> Stripe amount = 1999
  - 20.00 USD -> Stripe amount = 2000

Actual Result:
  - 19.99 USD -> Stripe amount = 20 (0.20 USD চার্জ হয়েছে)
  - 20.00 USD -> Stripe amount = 20 (0.20 USD)
  - সফল পেজে "19.99 USD পরিশোধ" দেখায়, কিন্তু আসল চার্জ 0.20 USD

Reproducibility: ১০/১০
Severity: Critical (প্রতিটি বিক্রিতে আয়ের প্রায় পুরোটা হারাচ্ছে)
Priority: P1 (প্রস্তাবিত)

Evidence:
  - Screenshot: checkout-1999.png, stripe-amount-20.png
  - PaymentIntent: pi_3PExample0004
  - Request body (POST /v1/payment_intents): amount=20&currency=usd
  - Time: 2026-11-02 15:02 (GMT+6)

Related test case: TC-PAY-003
Notes: মনে হচ্ছে সেন্টে রূপান্তরের বদলে ডলারকে রাউন্ড করে সরাসরি পাঠানো হচ্ছে (×100 বাদ পড়েছে)।
```

> [!TIP]
> অ্যামাউন্ট বাগ খুঁজতে সবসময় একটি দশমিক দাম (19.99) আর একটি গোল দাম (20.00) দুটোই টেস্ট করুন। শুধু গোল দাম দিলে অনেক রূপান্তর বাগ লুকিয়ে থাকে। ফ্লোটিং পয়েন্ট সমস্যাও (যেমন 19.99 × 100 = 1998.9999…) এভাবে ধরা পড়ে।

### রিপোর্ট ৪: Stripe-এ রিফান্ড হয়েছে, অ্যাপে এখনো "paid"

```text
Bug ID: BUG-PAY-104
Title: অ্যাডমিন অর্ডার: Stripe Dashboard থেকে পূর্ণ রিফান্ডের পরও অর্ডার status "paid" ও কোর্স অ্যাক্সেস চালু থাকে (Test Mode)

Environment:
  - App: staging, build 2.4.2
  - Browser: Chrome 130, macOS 15
  - Stripe mode: Test Mode
  - Test user: user_test_060

Precondition:
  - user_test_060-এর একটি paid অর্ডার, 15.00 USD, PaymentIntent pi_3PExample0005

Steps to Reproduce:
  1. Stripe Dashboard (Test Mode) -> Payments -> pi_3PExample0005 খুলুন
  2. Refund -> Full refund (15.00 USD) করুন
  3. ৫ মিনিট অপেক্ষা করুন
  4. অ্যাপের অ্যাডমিন প্যানেলে অর্ডারটি খুলুন
  5. user_test_060 হিসেবে "আমার কোর্স" দেখুন

Test Data: full refund 1500

Expected Result:
  - অর্ডার status = refunded
  - কোর্স অ্যাক্সেস বন্ধ

Actual Result:
  - Stripe-এ Refund succeeded, charge.refunded ইভেন্ট পাঠানো হয়েছে
  - অ্যাপে অর্ডার status এখনো paid
  - ইউজার কোর্স দেখতে পারছে

Reproducibility: ১০/১০ (Dashboard থেকে রিফান্ডে; অ্যাপের ভেতরের রিফান্ড বাটনে ঠিক কাজ করে)
Severity: High (টাকা ফেরত গেছে, কিন্তু পণ্য এখনো দেওয়া হচ্ছে; হিসাব মিলছে না)
Priority: P1 (প্রস্তাবিত)

Evidence:
  - Screenshot: stripe-refunded.png, app-order-paid.png
  - Refund: re_3PExample0005
  - Event: evt_3PExample0006 (charge.refunded), endpoint response 200
  - Time: 2026-11-02 16:10 (GMT+6)

Related test case: TC-PAY-007
Notes: endpoint 200 দিচ্ছে, তাই সম্ভবত হ্যান্ডলার charge.refunded ইভেন্টটি উপেক্ষা করছে।
```

### রিপোর্ট ৫: ডিক্লাইন কার্ডে "সফল" মেসেজ

```text
Bug ID: BUG-PAY-105
Title: চেকআউট: ডিক্লাইন কার্ড 4000 0000 0000 0002-এ "পেমেন্ট সফল" মেসেজ দেখায়, অর্ডার paid হয় না (Test Mode)

Environment:
  - App: staging, build 2.4.3
  - Browser: Safari, iPhone (iOS 18)
  - Stripe mode: Test Mode
  - Test user: user_test_073

Precondition:
  - কার্টে "HTTP & JSON" (5.00 USD)

Steps to Reproduce:
  1. Checkout পেজে কার্ড 4000 0000 0000 0002, 12/34, 123 দিন
  2. Pay চাপুন
  3. পেজের মেসেজ পড়ুন
  4. Stripe Dashboard ও অ্যাপের অর্ডার দেখুন

Test Data: 4000 0000 0000 0002 (generic decline), amount 500

Expected Result:
  - "আপনার কার্ড ডিক্লাইন হয়েছে, অন্য কার্ড দিয়ে চেষ্টা করুন" ধরনের মেসেজ
  - Pay বাটন আবার সক্রিয়
  - অর্ডার unpaid

Actual Result:
  - সবুজ বক্সে "পেমেন্ট সফল! ধন্যবাদ" দেখায়
  - Stripe-এ PaymentIntent status requires_payment_method, last_payment_error.code = card_declined
  - অ্যাপে অর্ডার pending, কোর্স অ্যাক্সেস নেই

Reproducibility: ১০/১০
Severity: High (টাকা কাটেনি, কিন্তু গ্রাহক ভুল তথ্য পেয়ে বিভ্রান্ত; সাপোর্ট টিকিট বাড়বে)
Priority: P1 (প্রস্তাবিত)

Evidence:
  - Screenshot: decline-success-message.png
  - PaymentIntent: pi_3PExample0007
  - Network: confirm রিকোয়েস্টের রেসপন্সে error.code = card_declined, কিন্তু UI সেটা পড়ছে না
  - Time: 2026-11-02 17:30 (GMT+6)

Related test case: TC-PAY-009
Notes: UI সম্ভবত শুধু রিকোয়েস্ট শেষ হলো কিনা দেখছে, ফলাফলের error অংশ নয়।
```

## হাতেকলমে অনুশীলন

1. [Stripe Sandbox সেটআপ](/lessons/stripe-sandbox-setup/) লেসনের টেস্ট অ্যাকাউন্টে লগইন করুন (Test Mode চালু আছে কিনা দেখুন)।
2. Dashboard-এ Payments খুলে যেকোনো টেস্ট পেমেন্টের `pi_…` ID কপি করুন।
3. Developers → Logs খুলুন। একটি রিকোয়েস্ট খুলে `req_…` ID খুঁজে বের করুন।
4. [Postman দিয়ে প্রথম API কল](/lessons/postman-first-api-call/) লেসনের মতো একটি ভুল রিকোয়েস্ট পাঠান (যেমন `amount` ছাড়া PaymentIntent)। রেসপন্স হেডারে `Request-Id` দেখুন।
5. ওপরের টেমপ্লেট দিয়ে এই ভুল রিকোয়েস্টের জন্য একটি অনুশীলন রিপোর্ট লিখুন। Authorization হেডার ঢেকে দিন।
6. রিপোর্টটি একজন বন্ধুকে দিন। সে শুধু রিপোর্ট পড়ে ধাপগুলো চালাতে পারল কিনা জিজ্ঞেস করুন।

<details><summary>সমাধান দেখুন: ঢাকা Request অংশ দেখতে যেমন হবে</summary>

```http
POST https://api.stripe.com/v1/payment_intents
Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX
Content-Type: application/x-www-form-urlencoded

currency=usd
```

রেসপন্স: `400`, `error.type = invalid_request_error`, মেসেজে বলা থাকে `amount` প্যারামিটার নেই। রিপোর্টে `req_…` ID আর সময় যোগ করুন।

</details>

> [!MISTAKE]
> - শিরোনামে শুধু "পেমেন্ট কাজ করে না" লেখা।
> - Steps-এ টেস্ট ডেটা না দেওয়া ("একটা কার্ড দিন")।
> - Expected আর Actual গুলিয়ে ফেলা, বা Actual-এ মতামত লেখা ("খুব বাজে")।
> - সব বাগকে Critical বলা; তাহলে আসল Critical-এর গুরুত্ব হারিয়ে যায়।
> - স্ক্রিনশটে `sk_test_` কী, কুকি বা গ্রাহকের ইমেইল দেখা যাওয়া।
> - একটি রিপোর্টে একাধিক বাগ লেখা। প্রতিটি বাগের আলাদা রিপোর্ট দিন।

## সারসংক্ষেপ

- শিরোনামে কোথায়, কী করলে, কী হয়; Steps সংখ্যা দিয়ে, টেস্ট ডেটাসহ।
- Severity প্রভাব মাপে, Priority জরুরিতা মাপে; পেমেন্টে টাকার ক্ষতি মানে প্রায় সবসময় Critical।
- সেরা প্রমাণ: `pi_…`, `req_…`, `evt_…` ID, সময়, আর রিকোয়েস্ট/রেসপন্সের অংশ।
- কী, টোকেন, পাসওয়ার্ড আর ব্যক্তিগত তথ্য সবসময় ঢেকে দিন।
- মাঝে মাঝে হওয়া বাগের Reproducibility সৎভাবে লিখুন।

## বাড়ির কাজ

1. আগের লেসনের TC-PAY-020 (চার্জের বেশি রিফান্ড) ধরে নিন ফেইল করেছে এবং রিফান্ড হয়ে গেছে। এর জন্য একটি পূর্ণ রিপোর্ট লিখুন, Severity ও Priority-র কারণসহ।
2. নিচের তিনটির Severity ঠিক করুন: (ক) রসিদে কারেন্সি চিহ্ন নেই, (খ) কুপন দুইবার প্রয়োগ হয়ে দাম শূন্য হয়, (গ) মোবাইলে Pay বাটন কীবোর্ডের নিচে ঢাকা পড়ে।
3. পরের লেসন [Postman Collection ও Environment](/lessons/postman-collections-environments/) শুরু করার আগে Postman খুলে রাখুন।
