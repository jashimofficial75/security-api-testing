---
order: 18
level: 3
week: 6
title: "Webhook Signature Verification: Stripe-Signature, Raw Body ও Replay সুরক্ষা"
description: "Stripe-Signature হেডার কীভাবে কাজ করে, কেন Raw Body লাগে, Timestamp Tolerance কী, আর একটি ছোট Express সার্ভার বানিয়ে ভেরিফিকেশন টেস্ট করার পুরো পদ্ধতি।"
keywords: ["webhook signature", "stripe-signature", "hmac sha256", "raw body", "constructEvent", "express", "replay attack", "whsec", "stripe listen", "stripe trigger", "idempotent webhook", "ওয়েবহুক সিগনেচার", "রিপ্লে", "ভেরিফিকেশন"]
minutes: 60
quiz:
  - q: "আপনার টিমের Express অ্যাপে সব রুটের আগে app.use(express.json()) বসানো আছে। Stripe Webhook-এ সবসময় 'No signatures found matching the expected signature' এরর আসছে। সবচেয়ে সম্ভাব্য কারণ কী?"
    options: ["Stripe-এর সার্ভার ডাউন", "express.json() বডি পার্স করে ফেলেছে, তাই আসল Raw Body আর পাওয়া যাচ্ছে না", "টেস্ট কার্ড ভুল ব্যবহার করা হয়েছে", "Webhook URL-এ https নেই বলে"]
    answer: 1
    explain: "সিগনেচার হিসাব হয় হুবহু Raw Body-র বাইটের উপর। JSON পার্স করে আবার স্ট্রিং বানালে স্পেস বা ক্রম বদলায়, ফলে HMAC মেলে না। বাকি অপশনগুলো এই নির্দিষ্ট এররের কারণ নয়।"
  - q: "একজন অ্যাটাকার ১ ঘণ্টা আগের একটি আসল Webhook রিকোয়েস্ট (বডি ও সিগনেচার সহ) হুবহু আবার পাঠাল। ডিফল্ট সেটিংসে constructEvent কী করবে?"
    options: ["গ্রহণ করবে, কারণ সিগনেচার আসল", "Stripe-কে ইমেইল পাঠাবে", "শুধু লগে সতর্কবার্তা লিখবে", "রিজেক্ট করবে, কারণ টাইমস্ট্যাম্প ডিফল্ট ৩০০ সেকেন্ড টলারেন্সের বাইরে"]
    answer: 3
    explain: "t মান সিগনেচারের অংশ, তাই বদলানো যায় না। ডিফল্ট টলারেন্স ৩০০ সেকেন্ড (৫ মিনিট), তাই এক ঘণ্টা পুরনো রিকোয়েস্ট Replay হিসেবে বাতিল হবে।"
  - q: "ভুল সিগনেচারওয়ালা রিকোয়েস্ট এলে আপনার এন্ডপয়েন্টের সঠিক আচরণ কোনটি?"
    options: ["200 দিয়ে চুপচাপ ইগনোর করা", "500 দিয়ে Stripe-কে রিট্রাই করতে বলা", "400 রিটার্ন করা এবং কোনো ব্যবসায়িক কাজ না করা", "ইভেন্ট প্রসেস করে পরে লগ চেক করা"]
    answer: 2
    explain: "ভেরিফিকেশন ব্যর্থ মানে রিকোয়েস্টটি বিশ্বাসযোগ্য নয়: 400 দিন, কিছু প্রসেস করবেন না। 200 দিলে আসল সমস্যা লুকিয়ে যায়, আর 500 অর্থহীন রিট্রাই ডেকে আনে।"
  - q: "লোকালে stripe listen চালিয়ে টেস্ট করছেন, কিন্তু .env-এ Dashboard-এর Webhook এন্ডপয়েন্টের whsec বসানো। কী হবে?"
    options: ["সিগনেচার ভেরিফিকেশন ব্যর্থ হবে, কারণ CLI নিজের আলাদা whsec দিয়ে সাইন করে", "সব ঠিকঠাক কাজ করবে", "Stripe CLI নিজে থেকে .env ঠিক করে দেবে", "শুধু Live Mode ইভেন্ট আসবে"]
    answer: 0
    explain: "stripe listen চালু হলে যে whsec প্রিন্ট করে, ফরওয়ার্ড করা ইভেন্টগুলো সেটি দিয়েই সাইন হয়। Dashboard এন্ডপয়েন্টের সিক্রেট আলাদা, তাই মিলবে না।"
  - q: "একই event.id ওয়ালা payment_intent.succeeded ইভেন্ট দুইবার এল। Idempotent হ্যান্ডলারের সঠিক আচরণ কী?"
    options: ["দুইবারই অর্ডার কনফার্ম ও ইমেইল পাঠানো", "দ্বিতীয়বার 400 রিটার্ন করা", "দ্বিতীয়বার কোনো কাজ না করে 200 রিটার্ন করা", "দ্বিতীয়বার 500 রিটার্ন করা যাতে Stripe থামে"]
    answer: 2
    explain: "আগে প্রসেস হওয়া event.id দেখলে আবার কাজ করবেন না, তবে 200 দিন যাতে Stripe রিট্রাই বন্ধ করে। 400 বা 500 দিলে Stripe আবার পাঠাতে থাকবে।"
---

আগের লেসনে আমরা Stripe CLI দিয়ে Webhook ইভেন্ট লোকালে এনেছি। কিন্তু একটা বড় প্রশ্ন থেকে যায়: আপনার সার্ভারে যে রিকোয়েস্ট এল, সেটা কি সত্যিই Stripe পাঠিয়েছে? নাকি কেউ নকল করে "পেমেন্ট সফল" বলে পাঠিয়েছে?

এই লেসনে আমরা সেই প্রশ্নের উত্তর দেব: **Webhook Signature Verification**। নিজের হাতে একটি ছোট Node.js সার্ভার বানাব, তারপর একজন QA-এর চোখে সেটিকে ভাঙার চেষ্টা করব।

## এই লেসনে যা শিখবেন

- Stripe-Signature হেডারের গঠন: `t=` আর `v1=` কী বোঝায়
- HMAC-SHA256 সিগনেচার কীভাবে হিসাব হয় এবং কেন Raw Body ছাড়া চলবে না
- Timestamp Tolerance (ডিফল্ট ৩০০ সেকেন্ড) কীভাবে Replay Attack ঠেকায়
- একটি সম্পূর্ণ ছোট Express সার্ভার: ভেরিফিকেশন, ৪০০ রেসপন্স, event.type অনুযায়ী কাজ, Idempotent প্রসেসিং
- `stripe listen`, `stripe trigger` আর নকল সিগনেচারের curl দিয়ে টেস্ট করা
- সবচেয়ে কমন বাগ: Webhook রুটের আগে `express.json()`

## কেন Signature দরকার: একটি গল্প

ধরুন আপনি একটি কোর্স বিক্রির সাইটে QA করছেন। কেউ কোর্স কিনলে Stripe একটি Webhook (একটা অ্যাপ থেকে আরেক অ্যাপে স্বয়ংক্রিয় HTTP নোটিফিকেশন) পাঠায়: `checkout.session.completed`। অ্যাপ সেটা পেয়ে কোর্স আনলক করে।

এখন Webhook URL তো পাবলিক। যেমন `https://example-course.com/webhook`। যে কেউ Postman খুলে এই URL-এ একটা JSON পাঠাতে পারে, যেখানে লেখা "পেমেন্ট সফল"। যদি অ্যাপ যাচাই না করে বিশ্বাস করে, তাহলে টাকা না দিয়েই কোর্স খুলে যাবে।

বাস্তব উপমা: bKash থেকে "আপনার অ্যাকাউন্টে ৫০০০ টাকা এসেছে" এমন SMS যে কেউ নকল নম্বর থেকে পাঠাতে পারে। বুদ্ধিমান দোকানদার SMS দেখে নয়, নিজের অ্যাপে ব্যালান্স মিলিয়ে মাল দেন। Signature Verification হলো সেই "মিলিয়ে দেখা"।

> [!NOTE]
> Signature Verification প্রমাণ করে দুইটি জিনিস: রিকোয়েস্টটি এমন কেউ পাঠিয়েছে যার কাছে আপনার এন্ডপয়েন্টের সিক্রেট আছে (অর্থাৎ Stripe), আর পথে বডির একটি অক্ষরও বদলায়নি।

## Stripe-Signature হেডার ভেতরে কী আছে

Stripe প্রতিটি Webhook রিকোয়েস্টে একটি হেডার পাঠায়, নাম `Stripe-Signature`। দেখতে এমন:

```text
Stripe-Signature: t=1730534400,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

এর দুইটি মূল অংশ:

| অংশ | মানে |
| --- | --- |
| `t` | Timestamp: Stripe কখন সাইন করেছে, Unix সেকেন্ডে |
| `v1` | Signature: HMAC-SHA256 দিয়ে বানানো হ্যাশ, হেক্স ফরম্যাটে |

কখনো একাধিক `v1` থাকতে পারে, যেমন সিক্রেট রোল (পুরনো থেকে নতুন সিক্রেটে বদল) করার সময়। লাইব্রেরি যেকোনো একটি মিললেই গ্রহণ করে।

### সিগনেচার কীভাবে বানানো হয়

HMAC-SHA256 (একটি গোপন চাবি দিয়ে বানানো হ্যাশ, চাবি ছাড়া কেউ একই হ্যাশ বানাতে পারে না) হিসাব হয় এভাবে:

```text
signed_payload = `${t}.${rawBody}`
v1 = HMAC_SHA256(key = endpoint secret (whsec_...), message = signed_payload)
```

অর্থাৎ টাইমস্ট্যাম্প, একটি ডট, তারপর হুবহু রিকোয়েস্ট বডি। চাবি হলো আপনার এন্ডপয়েন্টের Signing Secret, যা `whsec_` দিয়ে শুরু হয়।

আপনার সার্ভার একই হিসাব নিজে করে। নিজের ফল আর হেডারের `v1` মিললে রিকোয়েস্ট আসল। না মিললে নকল বা বদলানো।

### Raw Body কেন লাগে

এটাই সবচেয়ে গুরুত্বপূর্ণ পয়েন্ট। হ্যাশ হিসাব হয় **বাইট ধরে ধরে**। নিচের দুইটি JSON মানে একই, কিন্তু বাইট আলাদা:

```json
{"id":"evt_1","type":"payment_intent.succeeded"}
```

```json
{
  "id": "evt_1",
  "type": "payment_intent.succeeded"
}
```

একটা স্পেস, একটা নিউলাইন বা কি-এর ক্রম বদলালেই HMAC সম্পূর্ণ আলাদা হয়ে যায়। `express.json()` বডিকে JavaScript অবজেক্ট বানিয়ে ফেলে। পরে `JSON.stringify()` করলে আসল বাইট আর ফেরত আসে না। তাই Webhook রুটে বডি থাকতে হবে কাঁচা অবস্থায়, অর্থাৎ Buffer হিসেবে।

## Timestamp Tolerance: Replay Attack ঠেকানো

Replay Attack (একটা আসল রিকোয়েস্ট রেকর্ড করে পরে হুবহু আবার পাঠানো) কীভাবে হয়? ধরুন কেউ কোনোভাবে একটা আসল Webhook রিকোয়েস্টের কপি পেল, যেমন ভুল করে শেয়ার হওয়া লগ থেকে। সিগনেচার তো আসল, তাই সে বারবার পাঠিয়ে বারবার অর্ডার কনফার্ম করাতে চাইবে।

সমাধান: `t` মান সিগনেচারের ভেতরে ঢোকানো আছে। তাই কেউ `t` বদলালে সিগনেচার ভেঙে যাবে। আর লাইব্রেরি দেখে `t` বর্তমান সময় থেকে কত দূরে। Stripe-এর অফিসিয়াল লাইব্রেরিতে ডিফল্ট টলারেন্স **৩০০ সেকেন্ড (৫ মিনিট)**। এর চেয়ে পুরনো হলে রিজেক্ট।

> [!TIP] সার্ভারের ঘড়ি
> সার্ভারের ঘড়ি ভুল হলে আসল ইভেন্টও রিজেক্ট হতে পারে। প্রোডাকশন সার্ভারে NTP দিয়ে সময় সিঙ্ক রাখা উচিত। বাগ রিপোর্টে "timestamp outside tolerance" দেখলে ঘড়িও চেক করুন।

টলারেন্স একা সব Replay ঠেকায় না। ৫ মিনিটের ভেতরে একই রিকোয়েস্ট আবার এলে? সেজন্য দরকার Idempotent প্রসেসিং: একই `event.id` দ্বিতীয়বার এলে কাজ না করা। নিচের কোডে সেটা আছে।

## হাতেকলমে অনুশীলন: একটি ছোট Webhook সার্ভার বানান

এবার নিজের কম্পিউটারে একটি সার্ভার বানাব। দরকার Node.js 18 বা নতুন, আর আগের লেসনে সেটআপ করা Stripe CLI।

### ধাপ ১: ফোল্ডার ও package.json

```bash
mkdir stripe-webhook-lab
cd stripe-webhook-lab
npm init -y
npm install express stripe dotenv
```

এরপর `package.json` মোটামুটি এমন দেখাবে (ভার্সন নম্বর আপনার মেশিনে আলাদা হতে পারে):

```json
{
  "name": "stripe-webhook-lab",
  "version": "1.0.0",
  "private": true,
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "stripe": "^17.0.0"
  }
}
```

### ধাপ ২: .env ও .gitignore

`.env` ফাইলে শুধু প্লেসহোল্ডার রাখুন, আসল মান নিজের মেশিনে বসাবেন:

```bash
# .env  (কখনো গিটে কমিট করবেন না)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX
PORT=4242
```

`.gitignore` ফাইল:

```text
node_modules/
.env
```

> [!LIVE]
> এই ল্যাবে শুধু Test Mode-এর `sk_test_` কি ব্যবহার করুন। Live কি (`sk_live_`) কখনো লোকাল ল্যাব, স্ক্রিনশট বা বাগ রিপোর্টে আসবে না।

### ধাপ ৩: server.js

```js
// server.js
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const app = express();

// ডেমোর জন্য মেমোরিতে রাখা। প্রোডাকশনে DB টেবিল + UNIQUE(event_id) লাগবে।
const processedEventIds = new Set();

// ১) Webhook রুট: express.raw() দিয়ে বডি Buffer হিসেবে রাখা হচ্ছে
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ২) Idempotency: একই event.id আগে প্রসেস হলে আর কাজ নয়
  if (processedEventIds.has(event.id)) {
    console.log(`Duplicate event ${event.id}, skipping`);
    return res.status(200).json({ received: true, duplicate: true });
  }

  // ৩) event.type অনুযায়ী কাজ
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      console.log(`PaymentIntent ${pi.id} succeeded: ${pi.amount} ${pi.currency}`);
      // এখানে অর্ডার 'paid' করা হবে (দ্রুত কাজ, ভারী কাজ কিউতে)
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      console.log(`PaymentIntent ${pi.id} failed`);
      break;
    }
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log(`Checkout ${session.id} completed`);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  processedEventIds.add(event.id);

  // ৪) দ্রুত 200 ফেরত দিন
  res.status(200).json({ received: true });
});

// ৫) বাকি রুটের জন্য JSON পার্সার: Webhook রুটের পরে
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4242;
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
```

কোডের গুরুত্বপূর্ণ সিদ্ধান্তগুলো:

- **`express.raw({type: 'application/json'})`** শুধু Webhook রুটে। ফলে `req.body` একটা Buffer, হুবহু আসল বাইট।
- **`constructEvent(req.body, sig, secret)`** তিনটি কাজ একসাথে করে: হেডার পার্স, HMAC মেলানো, টাইমস্ট্যাম্প টলারেন্স চেক। ব্যর্থ হলে Exception ছোড়ে।
- **৪০০** ব্যর্থ ভেরিফিকেশনে। কোনো ব্যবসায়িক কাজ হয় না।
- **দ্রুত ২০০**: Stripe কিছু সেকেন্ডের মধ্যে উত্তর না পেলে টাইমআউট ধরে রিট্রাই করে। ইমেইল পাঠানো, PDF বানানোর মতো ভারী কাজ কিউতে দিন।
- **`processedEventIds`**: ডেমোর জন্য মেমোরিতে। সার্ভার রিস্টার্ট হলে মুছে যায়। প্রোডাকশনে ডাটাবেস টেবিলে `event_id`-তে UNIQUE constraint দিন।

> [!NOTE]
> উপরের কোডে আইডি যোগ হচ্ছে প্রসেস শেষ হওয়ার পর। প্রসেস মাঝপথে ক্র্যাশ করলে আইডি যোগ হয় না, তাই Stripe রিট্রাই করলে আবার চেষ্টা হবে। আসল সিস্টেমে "রেকর্ড ইনসার্ট + কাজ" একটি ট্রানজ্যাকশনে করাই নিরাপদ।

### ধাপ ৪: stripe listen দিয়ে চালান

একটি টার্মিনালে:

```bash
stripe listen --forward-to localhost:4242/webhook
```

আউটপুটে এমন লাইন আসবে:

```text
> Ready! Your webhook signing secret is whsec_XXXXXXXX (^C to quit)
```

এই `whsec_` মানটি কপি করে `.env`-এর `STRIPE_WEBHOOK_SECRET`-এ বসান। তারপর দ্বিতীয় টার্মিনালে সার্ভার চালান:

```bash
npm start
```

### ধাপ ৫: stripe trigger দিয়ে আসল টেস্ট ইভেন্ট

তৃতীয় টার্মিনালে:

```bash
stripe trigger payment_intent.succeeded
```

প্রত্যাশিত ফল:

- `stripe listen` টার্মিনালে প্রতিটি ইভেন্টের পাশে `[200]` দেখাবে
- সার্ভার লগে `PaymentIntent pi_... succeeded` লেখা আসবে
- `stripe trigger` একাধিক ইভেন্ট তৈরি করতে পারে (যেমন `payment_intent.created`, `charge.succeeded`), তাদের জন্য `Unhandled event type` লগ আসা স্বাভাবিক

### ধাপ ৬: নকল সিগনেচার দিয়ে নেগেটিভ টেস্ট

এবার QA-এর আসল কাজ। নকল হেডার দিয়ে curl পাঠান:

```bash
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1730534400,v1=0000000000000000000000000000000000000000000000000000000000000000" \
  -d '{"id":"evt_fake_001","type":"payment_intent.succeeded","data":{"object":{"id":"pi_fake","amount":500000,"currency":"usd"}}}'
```

প্রত্যাশিত: `HTTP/1.1 400 Bad Request` এবং বডিতে `Webhook Error: ...`। সার্ভার লগে কোনো "succeeded" লাইন আসবে না।

আরও কয়েকটি নেগেটিভ টেস্ট:

```bash
# হেডার একদমই নেই
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -d '{"id":"evt_fake_002","type":"payment_intent.succeeded"}'
```

```bash
# ফাঁকা বডি
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1,v1=abc"
```

দুই ক্ষেত্রেই প্রত্যাশিত ৪০০।

### ধাপ ৭ (ঐচ্ছিক): নিজে সঠিক সিগনেচার বানিয়ে বোঝা

ধারণাটা পাকা করতে নিজের লোকাল সিক্রেট দিয়ে সিগনেচার বানিয়ে দেখুন। এটি শুধু নিজের ল্যাব সার্ভারে করবেন:

```bash
SECRET="whsec_XXXXXXXX"   # আপনার .env-এ যেটা আছে
T=$(date +%s)
BODY='{"id":"evt_local_001","type":"payment_intent.succeeded","data":{"object":{"id":"pi_local","amount":1000,"currency":"usd"}}}'
SIG=$(printf '%s' "${T}.${BODY}" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.*= //')
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=${T},v1=${SIG}" \
  --data-raw "$BODY"
```

প্রত্যাশিত ২০০। এবার একই কমান্ডে `BODY`-তে amount `1000` থেকে `9999` করুন, কিন্তু SIG আগেরটাই রাখুন: ৪০০ আসবে। এটাই প্রমাণ করে বডির এক অক্ষর বদলালেও সিগনেচার ভাঙে।

আবার পুরো কমান্ড একই `evt_local_001` দিয়ে দ্বিতীয়বার চালান: ২০০ আসবে কিন্তু বডিতে `"duplicate":true`। আর `T=$(( $(date +%s) - 600 ))` দিয়ে ১০ মিনিট পুরনো টাইমস্ট্যাম্প বানালে টলারেন্সের কারণে ৪০০।

> [!CHECK] ল্যাব সফল হলে
> - `stripe trigger` ইভেন্টে `[200]` দেখছেন
> - নকল বা অনুপস্থিত সিগনেচারে ৪০০ পাচ্ছেন
> - বডি বদলালে ৪০০ পাচ্ছেন
> - একই event.id দুইবার পাঠালে দ্বিতীয়বার কাজ হচ্ছে না, কিন্তু ২০০ আসছে
> - ১০ মিনিট পুরনো টাইমস্ট্যাম্পে ৪০০ পাচ্ছেন

## সবচেয়ে কমন বাগ: express.json() আগে বসানো

অনেক প্রজেক্টে `app.js`-এর শুরুতেই লেখা থাকে:

```js
const app = express();
app.use(express.json()); // সব রুটের আগে
app.post('/webhook', (req, res) => {
  const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], secret);
  // ...
});
```

এখানে `express.json()` প্রথমেই বডি পার্স করে অবজেক্ট বানিয়ে ফেলে। `constructEvent` তখন Raw Body পায় না, তাই প্রতিটি আসল ইভেন্টই ব্যর্থ হয়। এরর মেসেজে সাধারণত থাকে "No signatures found matching the expected signature for payload" বা payload স্ট্রিং/Buffer হওয়া দরকার এমন কথা।

সমাধান দুইটি পথে হতে পারে:

1. Webhook রুট `express.json()`-এর আগে ডিক্লেয়ার করা, ঠিক উপরের `server.js`-এর মতো
2. অথবা `express.json()`-কে এমনভাবে লাগানো যাতে `/webhook` পাথ বাদ যায়

QA হিসেবে কীভাবে ধরবেন? `stripe listen` আউটপুটে প্রতিটি ইভেন্টে `[400]` দেখলে আর সার্ভার লগে signature error দেখলে প্রথমেই মিডলওয়্যারের ক্রম দেখার পরামর্শ দিন।

> [!MISTAKE] সাধারণ ভুলগুলো
> - Webhook রুটের আগে `express.json()` বা অন্য কোনো বডি পার্সার বসানো
> - `stripe listen`-এর whsec না বসিয়ে Dashboard এন্ডপয়েন্টের whsec ব্যবহার করা, বা উল্টোটা
> - ভেরিফিকেশন ব্যর্থ হলেও ২০০ দেওয়া ("পরে দেখব"), ফলে নকল ইভেন্ট প্রসেস হয়
> - `try/catch` ছাড়া `constructEvent` ডাকা, ফলে সার্ভার ৫০০ দেয় আর Stripe অকারণে রিট্রাই করে
> - ভারী কাজ শেষ করে তারপর ২০০ দেওয়া, ফলে টাইমআউট ও ডুপ্লিকেট ডেলিভারি
> - সিক্রেট কোডে হার্ডকোড করা বা `.env` গিটে কমিট করা

## QA চেকলিস্ট: সিগনেচার সংক্রান্ত টেস্ট কেস

| # | টেস্ট | ইনপুট | প্রত্যাশিত ফল |
| --- | --- | --- | --- |
| 1 | আসল ইভেন্ট | `stripe trigger payment_intent.succeeded` | 200, অর্ডার আপডেট |
| 2 | নকল v1 | curl, ভুল হেক্স | 400, কোনো কাজ নয় |
| 3 | হেডার নেই | curl, Stripe-Signature ছাড়া | 400 |
| 4 | বডি বদলানো | আসল সিগনেচার, amount বদলানো | 400 |
| 5 | পুরনো টাইমস্ট্যাম্প | t = এখন − 600 সেকেন্ড | 400 |
| 6 | ডুপ্লিকেট event.id | একই ইভেন্ট দুইবার | দ্বিতীয়বার 200, কোনো কাজ নয় |
| 7 | ভুল সিক্রেট | .env-এ অন্য whsec | সব ইভেন্টে 400 (কনফিগ বাগ) |
| 8 | অজানা event.type | `stripe trigger customer.created` | 200, ইগনোর |

এই টেবিল নিজের টেস্ট কেস শিটে কপি করে নিন। পরের লেসন [Webhook টেস্ট কেস](/lessons/webhook-test-cases/)-এ আমরা এর চেয়ে বড় তালিকা বানাব। নিরাপত্তার দিক থেকে আরও গভীরে যাব [Webhook Security](/lessons/webhook-security/) লেসনে।

অফিসিয়াল রেফারেন্স: [Stripe Docs: Webhooks](https://docs.stripe.com/webhooks)। সেখানে "Verify webhook signatures" অংশটি পড়ুন।

## সারসংক্ষেপ

- `Stripe-Signature` হেডারে থাকে `t` (টাইমস্ট্যাম্প) আর `v1` (`${t}.${rawBody}`-এর HMAC-SHA256, চাবি whsec)
- বডির একটা বাইট বদলালেও সিগনেচার মেলে না, তাই Webhook রুটে Raw Body (`express.raw`) লাগবে
- ডিফল্ট ৩০০ সেকেন্ড টলারেন্স পুরনো রিকোয়েস্ট Replay ঠেকায়; বাকিটা ঠেকায় event.id দিয়ে Idempotency
- ব্যর্থ ভেরিফিকেশনে ৪০০, সফল হলে দ্রুত ২০০, ভারী কাজ কিউতে
- `stripe listen`-এর whsec আর Dashboard-এর whsec আলাদা
- সবচেয়ে কমন বাগ: Webhook রুটের আগে `express.json()`

## বাড়ির কাজ

1. উপরের সার্ভার বানিয়ে টেবিলের ৮টি টেস্ট কেস চালান। প্রতিটির Actual Result লিখে একটি CSV ফাইল বানান।
2. ইচ্ছা করে `app.use(express.json())` রুটের আগে বসিয়ে বাগটি রিপ্রোডিউস করুন। তারপর [বাগ রিপোর্ট লেসনের](/lessons/payment-bug-reports/) ফরম্যাটে একটি রিপোর্ট লিখুন।
3. `processedEventIds` সেট-এর বদলে একটি JSON ফাইলে আইডি সেভ করুন, যাতে সার্ভার রিস্টার্টের পরেও ডুপ্লিকেট ধরা পড়ে।

<details><summary>সমাধান দেখুন</summary>

কাজ ২-এর রিপোর্টের মূল অংশ এমন হতে পারে:

- **Title:** Webhook signature verification fails for all valid Stripe events (400)
- **Steps:** `stripe listen --forward-to localhost:4242/webhook` → `stripe trigger payment_intent.succeeded`
- **Expected:** 200, order marked paid
- **Actual:** 400, log: "No signatures found matching the expected signature for payload"
- **Probable cause:** `express.json()` registered before the webhook route, so the raw body is lost
- **Severity:** Critical: কোনো পেমেন্টই অ্যাপে কনফার্ম হচ্ছে না

</details>
