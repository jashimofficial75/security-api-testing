---
order: 32
level: 5
week: 10
title: "Reconciliation টেস্টিং: Stripe-এর হিসাব আর অ্যাপের ডাটাবেস মেলানো"
description: "Stripe-এর Reports, Balance transactions ও Payouts-এর সাথে অ্যাপের অর্ডার ডাটাবেস মেলানো, ফি, রিফান্ড, ডিসপিউট, টাইমজোন ও অমিলের ধরন চেনা এবং দৈনিক চেকলিস্ট।"
keywords: ["reconciliation", "stripe reports", "balance transactions", "payouts", "fees", "net amount", "refund", "dispute", "utc", "csv export", "sql", "auto-pagination", "রিকনসিলিয়েশন", "হিসাব মেলানো", "সেটেলমেন্ট"]
minutes: 60
quiz:
  - q: "অ্যাপের DB-তে একটা অর্ডার “failed”, কিন্তু Stripe-এ সেই PaymentIntent “succeeded”। এটা কোন ধরনের অমিল, আর সবচেয়ে সম্ভাব্য কারণ কী?"
    options: ["Amount mismatch; কারেন্সি ভুল", "Status mismatch; সম্ভবত payment_intent.succeeded webhook প্রসেস হয়নি বা ভুলভাবে হয়েছে", "Duplicate; ইউজার দুবার কিনেছে", "কোনো সমস্যা নয়"]
    answer: 1
    explain: "দুই জায়গায় স্ট্যাটাস আলাদা, তাই status mismatch। গ্রাহকের টাকা কাটা হয়েছে কিন্তু অর্ডার দেওয়া হয়নি, তাই এটা জরুরি; webhook লগ আগে দেখুন।"
  - q: "অর্ডার টেবিলে amount = 1250 (টাকা), আর Stripe-এ amount = 125000। কী বোঝা যায়?"
    options: ["১০০ গুণ পার্থক্য, তাই বড় বাগ", "Stripe ভুল হিসাব করেছে", "দুটো একই মান: Stripe সবচেয়ে ছোট একক (পয়সা) ব্যবহার করে, তুলনার আগে ইউনিট মেলাতে হবে", "ফি কেটে নেওয়া হয়েছে"]
    answer: 2
    explain: "Stripe amount দেয় smallest currency unit-এ। ১২৫০ টাকা = ১২৫০০০ পয়সা। তুলনার আগে একই ইউনিটে আনতে হয়, নাহলে মিথ্যা অমিল দেখাবে।"
  - q: "বাংলাদেশ সময় রাত ১টায় (১ নভেম্বর) একটা পেমেন্ট হলো। Stripe রিপোর্ট UTC-তে, আর আপনি “১ নভেম্বর” ফিল্টার করে মেলাচ্ছেন। কী ঘটতে পারে?"
    options: ["কিছুই না, সময় একই", "পেমেন্টটা Stripe-এর হিসাবে ৩১ অক্টোবর UTC-তে পড়বে, তাই দিনের হিসাবে ভুল অমিল দেখাবে", "Stripe পেমেন্টটা বাতিল করবে", "পেমেন্ট দুবার দেখাবে"]
    answer: 1
    explain: "বাংলাদেশ UTC+6। রাত ১টা BST মানে আগের দিন সন্ধ্যা ৭টা UTC। দুই পক্ষের cut-off একই টাইমজোনে না আনলে দিন-সীমানায় ভুল অমিল হয়।"
  - q: "একটা অর্ডারের বিপরীতে Stripe-এ দুটো succeeded PaymentIntent, দুটোতেই একই metadata order_id। প্রথম কাজ কী?"
    options: ["Duplicate হিসেবে চিহ্নিত করে কারণ খুঁজে বাগ রিপোর্ট করা, এবং ফাইনান্স টিমকে জানানো যাতে গ্রাহককে একটা রিফান্ড দেওয়া যায়", "একটা PaymentIntent মুছে ফেলা", "উপেক্ষা করা, টাকা তো এসেছে", "DB-তে আরেকটা অর্ডার তৈরি করা"]
    answer: 0
    explain: "এটা ডাবল চার্জ। গ্রাহককে টাকা ফেরত দেওয়ার সিদ্ধান্ত ফাইনান্স/সাপোর্ট নেয়, আর QA মূল কারণ (যেমন idempotency না থাকা) খুঁজে বাগ রিপোর্ট করে।"
  - q: "রিকনসিলিয়েশন স্ক্রিপ্টে Stripe key কীভাবে ব্যবহার করবেন?"
    options: ["স্ক্রিপ্টে সরাসরি sk_live key লিখে GitHub-এ রাখা", "Test mode-এর key এনভায়রনমেন্ট ভেরিয়েবল থেকে পড়া; সম্ভব হলে শুধু-পড়ার অনুমতির restricted key", "key টিমের চ্যাটে শেয়ার করা", "key ছাড়াই Stripe API কাজ করে"]
    answer: 1
    explain: "অনুশীলনে শুধু test mode, key কোডে নয় বরং env থেকে। রিপোর্টিং স্ক্রিপ্টের শুধু পড়ার অনুমতি দরকার, তাই restricted key সবচেয়ে নিরাপদ।"
---

দিনশেষে দোকানদার ক্যাশবাক্সের টাকা গুনে খাতার সাথে মেলান। অনলাইন পেমেন্টেও একই কাজ করতে হয়: পেমেন্ট গেটওয়ের হিসাব আর আপনার অ্যাপের ডাটাবেস কি একই কথা বলছে?

এই মেলানোকে বলে **Reconciliation** (দুটো আলাদা উৎসের হিসাব মিলিয়ে অমিল খুঁজে বের করা)। এটা ফাইনান্স টিমের কাজ মনে হলেও, অমিলের পেছনে প্রায় সবসময় একটা সফটওয়্যার বাগ থাকে। তাই QA-র জন্য এটা দারুণ বাগ খোঁজার জায়গা।

## এই লেসনে যা শিখবেন

- Reconciliation কী, কেন পেমেন্ট QA-র জন্য জরুরি
- Stripe Dashboard-এর Balance, Payouts, Balance transactions ও Reports থেকে CSV এক্সপোর্ট
- কী দিয়ে মেলাবেন: PaymentIntent id, metadata order_id, amount, currency, fee, net
- রিফান্ড, আংশিক রিফান্ড, ডিসপিউট, টাইমজোন ও cut-off সামলানো
- অমিলের ৫টা ধরন
- একটা SQL query আর একটা Node.js স্ক্রিপ্টের ধারণা
- দৈনিক রিকনসিলিয়েশন চেকলিস্ট, আর SSLCommerz/bKash-এ একই পদ্ধতি

## কেন হিসাব না মেলে

একটা কোর্স-বিক্রির সাইট ভাবুন। গ্রাহক কার্ডে পেমেন্ট করল, Stripe টাকা নিল, তারপর webhook এসে অ্যাপকে বলল "পেমেন্ট সফল"। এই চেইনের যেকোনো জায়গায় ফাটল থাকলে দুই হিসাব আলাদা হয়ে যায়:

- Webhook এলো না বা প্রসেসিং-এ এরর হলো, অর্ডার "pending"-এ আটকে থাকল
- ইউজার দুবার "Pay" চাপল, idempotency ছিল না, দুটো চার্জ হলো
- ডেভেলপার টাকা আর পয়সা গুলিয়ে ফেলল
- Dashboard থেকে ম্যানুয়ালি রিফান্ড হলো, অ্যাপ জানলই না
- গ্রাহক ব্যাংকে ডিসপিউট (chargeback) করল, টাকা কেটে গেল, অ্যাপে অর্ডার এখনো "paid"

প্রতিটাই আসলে একটা বাগ বা প্রসেসের ফাঁক। রিকনসিলিয়েশন সেগুলো টাকার অংকে দৃশ্যমান করে।

## Stripe-এর দিকে কোথায় কী আছে

সব অনুশীলন Test Mode / Sandbox-এ করবেন। Stripe Dashboard-এ মূল জায়গাগুলো (মেনুর নাম সময়ের সাথে একটু বদলাতে পারে):

| জায়গা | কী পাবেন |
|---|---|
| Payments | প্রতিটা পেমেন্ট, তার PaymentIntent id, স্ট্যাটাস, metadata |
| Balance | এখন কত টাকা available, কত pending |
| Payouts | কবে কত টাকা আপনার ব্যাংকে পাঠানো হয়েছে |
| Balance transactions | ব্যালেন্সে প্রতিটা নড়াচড়া: charge, refund, fee, dispute, payout; প্রতিটার amount, fee, net |
| Reports | Balance report, Payout reconciliation report ইত্যাদি; itemized (প্রতিটা লেনদেন আলাদা লাইনে) CSV ডাউনলোড |

বিস্তারিত পড়ুন: [Stripe Reports](https://docs.stripe.com/reports) এবং [Balance transactions API](https://docs.stripe.com/api/balance_transactions)।

### একটা Balance transaction-এর মূল ফিল্ড

| ফিল্ড | মানে |
|---|---|
| `amount` | মোট লেনদেন, smallest currency unit-এ (পয়সা/সেন্ট) |
| `fee` | Stripe-এর ফি |
| `net` | `amount - fee`, আপনার হাতে যা আসে |
| `currency` | ব্যালেন্সের কারেন্সি (presentment currency থেকে আলাদা হতে পারে) |
| `type` | `charge`, `refund`, `adjustment`, `payout` ইত্যাদি |
| `reporting_category` | রিপোর্টে কোন শ্রেণিতে পড়বে |
| `source` | কোন charge/refund থেকে এসেছে |
| `created`, `available_on` | কখন তৈরি, কখন টাকা available হবে (Unix timestamp, UTC) |

> [!NOTE] Amount, currency আর ইউনিট
> Stripe-এ `amount: 125000` আর `currency: bdt` মানে ১২৫০.০০ টাকা। আপনার DB যদি টাকায় দশমিক রাখে (`1250.00`), তুলনার আগে একটাকে অন্যটার ইউনিটে আনুন। আরেকটা ফাঁদ: গ্রাহক যে কারেন্সিতে দিল আর আপনার ব্যালেন্স যে কারেন্সিতে জমা হলো, দুটো আলাদা হলে balance transaction-এ রূপান্তরিত অংক আসে। কারেন্সি সবসময় আলাদা কলামে মেলান।

## কী দিয়ে মেলাবেন: matching key

দুই তালিকা মেলাতে একটা কমন চাবি দরকার। ভালো ডিজাইনে দুটো থাকে:

1. **PaymentIntent id** (`pi_...`): অ্যাপ PaymentIntent তৈরি করে DB-তে id সেভ করে রাখে।
2. **metadata.order_id**: PaymentIntent তৈরির সময় `metadata: { order_id: 'ord_1001' }` দেওয়া থাকে, তাই Stripe-এর দিক থেকেও অর্ডার খুঁজে পাওয়া যায়।

দুটোই থাকলে উভয় দিক থেকে খোঁজা যায়। যদি অ্যাপ id সেভ না করে, তাহলে সেটাই প্রথম বাগ রিপোর্ট।

### রিফান্ড, আংশিক রিফান্ড আর ডিসপিউট

- **পূর্ণ রিফান্ড**: Stripe-এ একটা `refund` balance transaction (ঋণাত্মক amount)। DB-তে অর্ডার `refunded` হওয়া উচিত।
- **আংশিক রিফান্ড**: ১২৫০ টাকার কোর্সে ৫০০ টাকা ফেরত। DB-তে `refunded_amount = 50000` (পয়সা) বা আলাদা refunds টেবিল থাকা উচিত। শুধু "refunded: true" রাখলে হিসাব মেলানো অসম্ভব।
- **ফি**: অনেক ক্ষেত্রে রিফান্ডে মূল ফি ফেরত আসে না। তাই net হিসাব করার সময় রিফান্ডের পরও ফি থেকে যেতে পারে। নিজের অ্যাকাউন্টের নিয়ম Stripe ডকুমেন্টেশনে মিলিয়ে নিন, অনুমান করবেন না।
- **ডিসপিউট**: গ্রাহক ব্যাংকে অভিযোগ করলে টাকা (সাথে প্রায়ই একটা dispute fee) ব্যালেন্স থেকে কেটে যায়। Test mode-এ বিশেষ টেস্ট কার্ড দিয়ে ডিসপিউট তৈরি করা যায়: [/lessons/stripe-test-cards/](/lessons/stripe-test-cards/)।

### টাইমজোন ও cut-off

Stripe-এর timestamp আর রিপোর্ট সাধারণত **UTC**-তে (রিপোর্ট বানানোর সময় টাইমজোন বেছে নেওয়ার সুযোগ থাকতে পারে)। বাংলাদেশ সময় UTC+6।

উদাহরণ: ১ নভেম্বর রাত ১২:৩০-এ (BST) একটা পেমেন্ট। UTC-তে সেটা ৩১ অক্টোবর সন্ধ্যা ৬:৩০। আপনার অ্যাপ যদি BST-তে "১ নভেম্বরের অর্ডার" গোনে আর Stripe রিপোর্ট UTC-তে, তাহলে প্রতিদিন রাত ১২টা থেকে ভোর ৬টার পেমেন্টগুলো ভুল দিনে পড়বে এবং মিথ্যা অমিল দেখাবে।

সমাধান: DB-তে সময় UTC-তে রাখুন, রিকনসিলিয়েশনের দিন-সীমা (cut-off) দুই দিকেই একই টাইমজোনে নির্ধারণ করুন। আর সীমানার কাছের লেনদেন পরের দিনের রানে আবার দেখুন।

## অমিলের ধরন

| ধরন | মানে | সাধারণ কারণ | গুরুত্ব |
|---|---|---|---|
| Missing in DB | Stripe-এ সফল পেমেন্ট আছে, DB-তে অর্ডার নেই | webhook হারিয়েছে, অর্ডার সেভের আগে ক্র্যাশ | খুব উচ্চ: গ্রাহক টাকা দিয়ে কিছু পায়নি |
| Missing in Stripe | DB-তে "paid" অর্ডার, Stripe-এ কোনো পেমেন্ট নেই | redirect দেখেই paid করা, স্ট্যাটাস যাচাই না করা, টেস্ট ডেটা মিশে যাওয়া | খুব উচ্চ: বিনা পয়সায় পণ্য |
| Amount mismatch | দুই জায়গায় অংক আলাদা | পয়সা/টাকা গোলমাল, কুপন দুবার, আংশিক রিফান্ড না ধরা | উচ্চ |
| Status mismatch | DB `failed`/`pending`, Stripe `succeeded` (বা উল্টো) | webhook প্রসেসিং বাগ, ম্যানুয়াল রিফান্ড অ্যাপ জানে না | উচ্চ |
| Duplicate | এক অর্ডারে একাধিক সফল চার্জ | idempotency নেই, ডাবল ক্লিক, retry | উচ্চ: ডাবল চার্জ |

প্রতিটা অমিল একটা বাগ রিপোর্টে পরিণত হতে পারে। ফরম্যাট মনে করুন: [/lessons/payment-bug-reports/](/lessons/payment-bug-reports/)।

> [!LIVE] আসল টাকা মানে আলাদা দায়িত্ব
> লাইভ ডেটার রিকনসিলিয়েশন সাধারণত ফাইনান্স টিমের অনুমতিতে, শুধু-পড়ার অ্যাক্সেস দিয়ে হয়। QA হিসেবে কখনো নিজে থেকে লাইভে রিফান্ড দেবেন না বা পেমেন্ট বদলাবেন না। অমিল পেলে রিপোর্ট করুন, সিদ্ধান্ত নেবে দায়িত্বপ্রাপ্ত টিম। এই লেসনের সব অনুশীলন Test Mode-এ।

## SQL ও স্ক্রিপ্ট দিয়ে মেলানো

### DB দিক: একটা সহজ SQL query

ধরুন `orders` টেবিলে `id`, `payment_intent_id`, `amount_poisha`, `currency`, `status`, `created_at` (UTC) আছে। ৩১ অক্টোবর (UTC) দিনের paid অর্ডার:

```sql
SELECT id AS order_id,
       payment_intent_id,
       amount_poisha,
       currency,
       status
FROM orders
WHERE status IN ('paid', 'refunded', 'partially_refunded')
  AND created_at >= '2026-10-31 00:00:00+00'
  AND created_at <  '2026-11-01 00:00:00+00'
ORDER BY created_at;
```

একই অর্ডারে একাধিক PaymentIntent আছে কিনা (duplicate সন্দেহ), যদি আলাদা `payments` টেবিল থাকে:

```sql
SELECT order_id, COUNT(*) AS succeeded_count
FROM payments
WHERE status = 'succeeded'
GROUP BY order_id
HAVING COUNT(*) > 1;
```

এই ফলাফল CSV হিসেবে এক্সপোর্ট করুন, যেমন `orders.csv`:

```csv
order_id,payment_intent_id,amount_poisha,currency,status
ord_1001,pi_XXXXXXXXXXXX01,125000,bdt,paid
ord_1002,pi_XXXXXXXXXXXX02,49900,bdt,paid
ord_1003,pi_XXXXXXXXXXXX03,125000,bdt,failed
```

### Stripe দিক: Node.js স্ক্রিপ্টের ধারণা

Stripe-এর অফিসিয়াল Node.js লাইব্রেরি list কলে **auto-pagination** (একবারে ১০০টা করে পেজ নিয়ে স্বয়ংক্রিয়ভাবে পরের পেজে যাওয়া) সমর্থন করে, `for await` দিয়ে। নিচের স্ক্রিপ্ট শুধু Test Mode-এর জন্য, key আসে এনভায়রনমেন্ট থেকে:

```js
// reconcile.mjs   চালানো: STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX node reconcile.mjs
import Stripe from 'stripe';
import { readFileSync } from 'node:fs';

const key = process.env.STRIPE_SECRET_KEY;
if (!key || !key.startsWith('sk_test_') && !key.startsWith('rk_test_')) {
  throw new Error('শুধু test mode key ব্যবহার করুন (env থেকে)');
}
const stripe = new Stripe(key);

// ১. DB থেকে এক্সপোর্ট করা CSV পড়া (সহজ পার্সার, কমা-বিহীন ডেটার জন্য)
const [header, ...rows] = readFileSync('orders.csv', 'utf8').trim().split('\n');
const cols = header.split(',');
const orders = new Map(rows.map((line) => {
  const v = line.split(',');
  const o = Object.fromEntries(cols.map((c, i) => [c, v[i]]));
  return [o.payment_intent_id, o];
}));

// ২. দিনের সীমা UTC-তে (Unix seconds)
const gte = Math.floor(Date.parse('2026-10-31T00:00:00Z') / 1000);
const lt = Math.floor(Date.parse('2026-11-01T00:00:00Z') / 1000);

const issues = [];
const seenOrderIds = new Map();

// ৩. সব PaymentIntent আনা, auto-pagination দিয়ে
for await (const pi of stripe.paymentIntents.list({ created: { gte, lt }, limit: 100 })) {
  if (pi.status !== 'succeeded') continue;
  const orderId = pi.metadata?.order_id;
  const db = orders.get(pi.id);

  if (orderId) {
    seenOrderIds.set(orderId, (seenOrderIds.get(orderId) || 0) + 1);
  }
  if (!db) { issues.push(['MISSING_IN_DB', pi.id, orderId]); continue; }
  if (Number(db.amount_poisha) !== pi.amount_received) issues.push(['AMOUNT_MISMATCH', pi.id, db.amount_poisha, pi.amount_received]);
  if (db.currency !== pi.currency) issues.push(['CURRENCY_MISMATCH', pi.id, db.currency, pi.currency]);
  if (db.status !== 'paid' && db.status !== 'refunded') issues.push(['STATUS_MISMATCH', pi.id, db.status, pi.status]);
  orders.delete(pi.id);
}

// ৪. DB-তে paid কিন্তু Stripe-এ সফল পাওয়া যায়নি
for (const [piId, o] of orders) {
  if (o.status === 'paid') issues.push(['MISSING_IN_STRIPE', piId, o.order_id]);
}
// ৫. এক order_id-তে একাধিক সফল PaymentIntent
for (const [orderId, n] of seenOrderIds) {
  if (n > 1) issues.push(['DUPLICATE', orderId, n]);
}

console.table(issues);
```

কয়েকটা নোট:

- `amount_received` হলো আসলে যত টাকা নেওয়া হয়েছে; রিফান্ডের তথ্য আলাদা (charge/refund অবজেক্ট বা balance transactions থেকে)।
- পূর্ণ সমাধানে রিফান্ড ও ডিসপিউটের জন্য balance transactions-ও আনতে হয়। শুরু করার জন্য এটুকুই যথেষ্ট।
- আসল প্রজেক্টে CSV পড়তে একটা ঠিকঠাক CSV লাইব্রেরি ব্যবহার করুন; এখানে সহজ রাখতে `split` ব্যবহার করা হয়েছে।
- রিপোর্টিংয়ের জন্য শুধু পড়ার অনুমতিসহ একটা **restricted key** (`rk_test_XXXX`) বানানো সবচেয়ে নিরাপদ। API key সম্পর্কে আরও: [/lessons/sensitive-data-exposure/](/lessons/sensitive-data-exposure/)।

> [!TIP] টেস্ট ডেটা নিজেই বানান
> অমিল খোঁজার স্ক্রিপ্ট টেস্ট করতে ইচ্ছা করে অমিল তৈরি করুন: CSV থেকে একটা লাইন মুছুন (Missing in DB), একটা amount বদলে দিন, একটা failed অর্ডারকে paid লিখুন। স্ক্রিপ্ট প্রতিটা ধরতে পারছে কিনা দেখুন। টেস্টিং টুলকেও টেস্ট করতে হয়।

## বাংলাদেশের প্রেক্ষাপট: SSLCommerz ও bKash

একই পদ্ধতি লোকাল গেটওয়েতেও খাটে। SSLCommerz-এর মার্চেন্ট প্যানেল এবং bKash-এর মার্চেন্ট পোর্টাল লেনদেন ও **settlement** (গেটওয়ে কবে কত টাকা আপনার ব্যাংকে পাঠাল) রিপোর্ট দেয়, সাধারণত ডাউনলোড করা যায়।

- matching key: SSLCommerz-এ আপনার পাঠানো `tran_id` আর তাদের `val_id`/ব্যাংক ট্রানজ্যাকশন id; bKash-এ `paymentID`, `trxID` আর আপনার `merchantInvoiceNumber`
- অংক সাধারণত টাকায় দশমিক আকারে (যেমন `1250.00`), Stripe-এর মতো পয়সায় নয়; ইউনিট মিলিয়ে নিন
- গেটওয়ে চার্জ (MDR) কেটে settlement আসে, তাই gross আর net আলাদা কলামে মেলান
- সময় সাধারণত বাংলাদেশ সময়ে; Stripe-এর সাথে মিশিয়ে রিপোর্ট করলে টাইমজোন এক করুন

বিস্তারিত গেটওয়ে টেস্টিং: [/lessons/bangladesh-gateways-sandbox/](/lessons/bangladesh-gateways-sandbox/)।

## হাতেকলমে অনুশীলন

1. Stripe Test Mode-এ ৫টা পেমেন্ট তৈরি করুন (Dashboard বা Postman দিয়ে), প্রতিটায় `metadata[order_id]` দিন: [/lessons/stripe-api-testing/](/lessons/stripe-api-testing/)।
2. একটায় পূর্ণ রিফান্ড আর একটায় আংশিক রিফান্ড দিন।
3. একটা পেমেন্ট ডিসপিউট টেস্ট কার্ড দিয়ে করুন।
4. Dashboard-এর Balance transactions বা Reports থেকে CSV এক্সপোর্ট করুন। প্রতিটা লাইনের `type`, `amount`, `fee`, `net` পড়ে বুঝুন।
5. হাতে একটা `orders.csv` বানান, যেখানে ইচ্ছা করে ২টা অমিল রাখবেন (একটা amount ভুল, একটা লাইন বাদ)।
6. স্প্রেডশিটে (Google Sheets বা LibreOffice) দুটো ফাইল `payment_intent_id` দিয়ে মেলান (`VLOOKUP` বা `XLOOKUP`)। অমিলগুলো টেবিলের ধরন অনুযায়ী চিহ্নিত করুন।
7. Node.js জানলে উপরের স্ক্রিপ্টটা test key দিয়ে চালান এবং ফলাফল স্প্রেডশিটের সাথে মেলান।
8. পাওয়া প্রতিটা অমিলের জন্য একটা ছোট বাগ রিপোর্ট খসড়া লিখুন।

### দৈনিক রিকনসিলিয়েশন চেকলিস্ট

> [!CHECK] প্রতিদিনের চেকলিস্ট
> - আগের দিনের cut-off (UTC বা নির্দিষ্ট টাইমজোন) দুই পক্ষে একই
> - Stripe-এ সফল পেমেন্টের সংখ্যা = DB-তে paid অর্ডারের সংখ্যা
> - মোট gross amount, মোট fee, মোট net মিলছে
> - রিফান্ড ও আংশিক রিফান্ডের যোগফল মিলছে
> - নতুন ডিসপিউট আছে কিনা, অ্যাপে অর্ডার চিহ্নিত হয়েছে কিনা
> - ২৪ ঘণ্টার বেশি "pending" অর্ডার নেই
> - কোনো duplicate চার্জ নেই
> - Payout-এর অংক = ওই সময়ের balance transactions-এর net যোগফল
> - প্রতিটা অমিলের টিকিট খোলা হয়েছে, মালিক নির্ধারিত

> [!MISTAKE] সাধারণ ভুল
> - পয়সা আর টাকা গুলিয়ে ১০০ গুণ "অমিল" রিপোর্ট করা।
> - টাইমজোন না মিলিয়ে দিন-সীমানার লেনদেনকে অমিল ধরা।
> - শুধু মোট অংক মেলানো: দুটো ভুল একে অপরকে কাটাকাটি করলে মোট মিলে যায়, কিন্তু আসলে দুটো বাগ।
> - আংশিক রিফান্ডকে পূর্ণ রিফান্ড ধরে নেওয়া।
> - স্ক্রিপ্টে live key রাখা বা commit করা।
> - অমিল পেয়ে নিজে DB "ঠিক" করে দেওয়া; আগে কারণ খুঁজুন, নাহলে বাগ থেকেই যায়।

## সারসংক্ষেপ

- Reconciliation মানে গেটওয়ের হিসাব আর অ্যাপের DB মেলানো; প্রায় প্রতিটা অমিলের পেছনে একটা বাগ।
- মেলানোর চাবি: PaymentIntent id আর metadata order_id; amount smallest unit-এ, currency আলাদা কলামে।
- Fee, net, রিফান্ড, আংশিক রিফান্ড, ডিসপিউট আর UTC cut-off হিসাবে রাখতে হয়।
- অমিলের ৫ ধরন: missing in DB, missing in Stripe, amount, status, duplicate।
- auto-pagination দিয়ে PaymentIntent তালিকা আনা যায়; key সবসময় env থেকে, শুধু test mode।
- SSLCommerz ও bKash-এর settlement রিপোর্টও একই পদ্ধতিতে মেলানো যায়।

## বাড়ির কাজ

1. নিজের Test Mode ডেটা দিয়ে একটা রিকনসিলিয়েশন রিপোর্ট বানান: মোট পেমেন্ট, মোট fee, মোট net, পাওয়া অমিলের তালিকা।
2. প্রশ্নের উত্তর লিখুন: Stripe-এ ১০টা সফল পেমেন্ট, DB-তে ১০টা paid অর্ডার, মোট অংকও সমান। তবুও কি নিশ্চিত হওয়া যায় যে সব ঠিক আছে?

<details><summary>সমাধান দেখুন</summary>

না। সংখ্যা ও মোট অংক মিলে গেলেও হতে পারে একটা অর্ডারে দুটো চার্জ (duplicate) আর অন্য একটা অর্ডার paid দেখাচ্ছে কিন্তু Stripe-এ নেই (missing in Stripe), অংকও কাকতালীয়ভাবে সমান। তাই প্রতিটা লেনদেন id ধরে লাইন-বাই-লাইন মেলাতে হয়, শুধু মোট দেখে নয়।

</details>
