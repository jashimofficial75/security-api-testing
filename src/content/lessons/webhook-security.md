---
order: 24
level: 4
week: 8
title: "Webhook সিকিউরিটি টেস্টিং: Signature Bypass, Replay ও নিরাপদ Endpoint"
description: "নিজের লোকাল Express সার্ভারে Webhook endpoint-এর নিরাপত্তা যাচাই: signature bypass চেষ্টা, replay attack, idempotent হ্যান্ডলিং, HTTPS, error leak ও rate limiting।"
keywords: ["webhook security", "stripe signature", "replay attack", "signature bypass", "idempotency", "stripe-signature", "tolerance", "rate limiting", "curl", "express", "ওয়েবহুক সিকিউরিটি", "রিপ্লে অ্যাটাক", "সিগনেচার যাচাই"]
minutes: 60
quiz:
  - q: "আপনার লোকাল সার্ভারে Stripe-Signature হেডার ছাড়াই একটি payment_intent.succeeded JSON পাঠালেন। সার্ভার 200 দিয়ে অর্ডার Paid করে দিল। এটা কী নির্দেশ করে?"
    options: ["সব ঠিক আছে, কারণ JSON সঠিক ছিল", "Signature যাচাই হচ্ছে না, যে কেউ নকল ইভেন্ট পাঠিয়ে অর্ডার Paid করতে পারবে, এটা Critical বাগ", "শুধু টেস্ট মোডে এমন হয়, লাইভে সমস্যা নেই", "Stripe CLI চালু না থাকায় এমন হয়েছে"]
    answer: 1
    explain: "হেডার না থাকলে constructEvent এরর দেওয়ার কথা এবং সার্ভার 400 ফেরত দেবে। 200 দিয়ে অর্ডার আপডেট মানে যাচাই একদম নেই; এটা মোড বা CLI-র ব্যাপার নয়।"
  - q: "একটি সঠিকভাবে সাইন করা পুরনো ইভেন্ট ১০ মিনিট পরে হুবহু আবার পাঠালেন (ডিফল্ট tolerance ৫ মিনিট)। প্রত্যাশিত ফল কী?"
    options: ["200, কারণ signature তো সঠিক", "500 Internal Server Error", "400, কারণ timestamp tolerance-এর বাইরে, তাই replay হিসেবে বাতিল", "সার্ভার ইভেন্টটা আবার প্রসেস করে দ্বিতীয়বার ইমেইল পাঠাবে"]
    answer: 2
    explain: "Signature-এর ভেতরে timestamp (t) থাকে। tolerance পেরিয়ে গেলে SDK এরর দেয়, তাই 400। পুরনো ইভেন্ট গ্রহণ করা মানেই replay দুর্বলতা।"
  - q: "একই ইভেন্ট (একই evt_ id) tolerance-এর ভেতরে দুবার এল। সঠিক আচরণ কোনটি?"
    options: ["দুবারই 200 দেবে, কিন্তু অর্ডার আপডেট ও ইমেইল একবারই হবে", "দ্বিতীয়বার 400 দিতে হবে", "দুবারই পুরো প্রসেসিং চালাতে হবে", "দ্বিতীয়টা পেলে সার্ভার বন্ধ করে দিতে হবে"]
    answer: 0
    explain: "Stripe একই ইভেন্ট একাধিকবার পাঠাতে পারে, তাই এটা স্বাভাবিক। ইভেন্ট id সেভ রেখে idempotent হ্যান্ডলিং করতে হবে, আর 2xx দিতে হবে যাতে Stripe রিট্রাই বন্ধ করে।"
  - q: "ডেভেলপার বলছেন: আমরা শুধু Stripe-এর IP থেকে রিকোয়েস্ট নিই, তাই signature যাচাই লাগবে না। টেস্টার হিসেবে আপনার মত কী?"
    options: ["ঠিক, IP allowlist যথেষ্ট", "IP allowlist বাড়তি স্তর হতে পারে, কিন্তু মূল সুরক্ষা signature যাচাই; শুধু IP-এর উপর নির্ভর করা যাবে না", "IP allowlist থাকলে HTTPS-ও লাগবে না", "Stripe কোনো IP তালিকা প্রকাশ করে না"]
    answer: 1
    explain: "Stripe তাদের IP তালিকা প্রকাশ করে, কিন্তু IP বদলাতে পারে, প্রক্সি বা ভুল কনফিগে ফাঁক থাকে। Signature-ই বলে দেয় বার্তাটা সত্যিই Stripe-এর এবং বদলানো হয়নি।"
  - q: "Webhook-এ checkout.session.completed এল, payload-এ amount_total 100। কোড সরাসরি এই সংখ্যা দেখে অর্ডারের দাম মিলিয়ে নিচ্ছে। ভালো অনুশীলন কোনটি?"
    options: ["Payload-ই যথেষ্ট, কারণ signature সঠিক", "ব্রাউজার থেকে দাম নিয়ে মেলানো", "দাম মেলানোর দরকারই নেই", "ইভেন্টের id দিয়ে Stripe API থেকে অবজেক্ট আবার ফেচ করে, নিজের ডাটাবেসের অর্ডারের দামের সাথে মেলানো"]
    answer: 3
    explain: "Signature সত্যতা নিশ্চিত করে, কিন্তু ইভেন্ট পুরনো স্টেটের হতে পারে। API থেকে সর্বশেষ অবজেক্ট এনে নিজের অর্ডারের সাথে মেলানো সবচেয়ে নিরাপদ।"
---

> [!DANGER] শুধু নিজের লোকাল সার্ভারে
> এই লেসনের প্রতিটি টেস্ট শুধু আপনার নিজের কম্পিউটারে চলা Express সার্ভারে (localhost) এবং নিজের Stripe Sandbox-এ করবেন। অন্য কারো ওয়েবসাইট, কোম্পানির প্রোডাকশন বা কোনো লাইভ Webhook URL-এ নকল ইভেন্ট পাঠানো বেআইনি ও অনৈতিক। অফিসের সিস্টেমে করতে হলে আগে লিখিত অনুমতি নিন। বিস্তারিত: [নৈতিকতা ও দায়িত্বশীল প্রকাশ](/lessons/ethics-responsible-disclosure/)।

Webhook (একটা সার্ভার অন্য সার্ভারকে ঘটনা ঘটলে নিজে থেকে HTTP রিকোয়েস্ট পাঠায়) হলো পেমেন্ট সিস্টেমের সবচেয়ে সংবেদনশীল দরজাগুলোর একটা। এই দরজা দিয়েই "পেমেন্ট সফল" খবর আসে, আর সেই খবরে অর্ডার Paid হয়, কোর্স আনলক হয়, রাইড বুক হয়।

কেউ যদি নকল খবর ঢুকিয়ে দিতে পারে, তাহলে টাকা না দিয়েই পণ্য পেয়ে যাবে। তাই এই লেসনে আমরা আক্রমণকারীর চোখে নিজের Webhook endpoint পরীক্ষা করব, কিন্তু শুধু নিজের সার্ভারে।

## এই লেসনে যা শিখবেন

- Webhook endpoint কেন পাবলিক, আর তাহলে সুরক্ষা আসে কোথা থেকে
- Signature bypass-এর ৫টি চেষ্টা: হেডার নেই, খালি হেডার, ভুল secret, বডি বদলানো, শুধু v0 scheme
- Replay attack (পুরনো সঠিক বার্তা আবার পাঠানো) ও tolerance window
- Duplicate ইভেন্টে idempotent হ্যান্ডলিং যাচাই
- HTTPS, IP allowlist, payload বিশ্বাস না করা, error response-এ তথ্য ফাঁস, rate limiting
- একটি পূর্ণ টেস্ট টেবিল ও curl উদাহরণ

## Webhook endpoint পাবলিক, পাহারা দেয় Signature

ধরুন আপনার কোর্স বিক্রির সাইটের endpoint `https://example.com/webhook`। Stripe-কে এখানে রিকোয়েস্ট পাঠাতে হবে, তাই এটা লগইন ছাড়া ইন্টারনেট থেকে খোলা থাকতেই হবে। মানে **যে কেউ** এখানে POST পাঠাতে পারে। এটা ডিজাইনের অংশ, বাগ নয়।

তাহলে পাহারাদার কে? উত্তর: **Signature**। প্রতিটি ইভেন্টের সাথে Stripe একটি `Stripe-Signature` হেডার পাঠায়। এর ভেতরে থাকে:

- `t=` একটি Unix timestamp (কখন সাইন করা হয়েছে)
- `v1=` HMAC-SHA256 (একটি গোপন চাবি দিয়ে বানানো ডিজিটাল সিল) সিগনেচার, যা `t` এবং পুরো raw বডি মিলিয়ে বানানো হয়
- টেস্ট মোডে কখনো `v0=` নামে আরেকটি মান, যা যাচাইয়ে ব্যবহার করা যাবে না

সিলটা বানানো হয় `whsec_XXXXXXXX` ধরনের Webhook signing secret দিয়ে, যা শুধু আপনার সার্ভার আর Stripe জানে। বিকাশের OTP-র মতো ভাবুন: নম্বর সবাই জানে, কিন্তু OTP শুধু আপনার কাছে আসে।

> [!NOTE]
> Signature যাচাইয়ের পুরো কোড আমরা আগের লেসনে লিখেছি: [Webhook Signature Verification](/lessons/webhook-signature-verification/)। এই লেসনে সেই Express সার্ভারটাই চালু রেখে তাকে আক্রমণ করব।

### আমাদের টেস্ট টার্গেট: লোকাল Express সার্ভার

মনে করিয়ে দিই, সার্ভারটা মোটামুটি এমন:

```js
// server.js (শুধু লোকাল টেস্টের জন্য)
const express = require('express');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // sk_test_XXXXXXXXXXXXXXXX
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;  // whsec_XXXXXXXX
const app = express();
const seen = new Set(); // ডেমো; আসল প্রজেক্টে ডাটাবেস টেবিল

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], endpointSecret);
  } catch (err) {
    console.error('Signature failed:', err.message); // বিস্তারিত শুধু লগে
    return res.status(400).send('Invalid signature');  // বাইরে ছোট বার্তা
  }
  if (seen.has(event.id)) return res.status(200).send('Already processed');
  seen.add(event.id);
  // ...অর্ডার আপডেট
  res.status(200).send('ok');
});

app.listen(4242, () => console.log('Listening on 4242'));
```

`constructEvent` ডিফল্টভাবে ৩০০ সেকেন্ড (৫ মিনিট) tolerance ব্যবহার করে। এটা মনে রাখুন, replay টেস্টে লাগবে।

## Signature Bypass চেষ্টা: ৫টি টেস্ট

প্রথমে একটা নমুনা বডি ফাইল বানান:

```bash
cat > fake-event.json <<'EOF'
{"id":"evt_test_fake_001","type":"payment_intent.succeeded","data":{"object":{"id":"pi_test_fake","amount":50000,"currency":"bdt","metadata":{"order_id":"1001"}}}}
EOF
```

### টেস্ট ১: হেডার একদম নেই

```bash
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  --data-binary @fake-event.json
```

প্রত্যাশা: `400` এবং অর্ডার 1001 আগের স্টেটেই থাকবে। যদি 200 আসে আর অর্ডার Paid হয়, এটা **Critical** বাগ।

### টেস্ট ২: খালি হেডার

```bash
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: " \
  --data-binary @fake-event.json
```

প্রত্যাশা: `400`। কিছু কোড শুধু চেক করে "হেডার আছে কি না", মান খালি কি না দেখে না। এই টেস্ট সেই ফাঁক ধরে।

### টেস্ট ৩: ভুল secret দিয়ে সাইন করা

আক্রমণকারী আসল secret জানে না, তাই নিজের বানানো secret দিয়ে সাইন করবে। আমরা Node দিয়ে একই কাজ করি:

```bash
TS=$(date +%s)
SIG=$(node -e "const c=require('crypto');const b=require('fs').readFileSync('fake-event.json','utf8');console.log(c.createHmac('sha256','whsec_WRONGWRONG').update(process.argv[1]+'.'+b).digest('hex'))" "$TS")
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=$TS,v1=$SIG" \
  --data-binary @fake-event.json
```

প্রত্যাশা: `400`। ফরম্যাট ঠিক, timestamp নতুন, কিন্তু সিল ভুল চাবির।

> [!TIP] সঠিক secret দিয়ে পজিটিভ টেস্ট
> একই কমান্ডে `whsec_WRONGWRONG`-এর জায়গায় আপনার আসল টেস্ট secret (`stripe listen` যেটা দেখায়) বসালে 200 আসা উচিত। নেগেটিভ টেস্টের পাশে একটা পজিটিভ টেস্ট রাখুন, নাহলে বোঝা যাবে না সার্ভার সব কিছুই বাতিল করছে কি না।

### টেস্ট ৪: সাইন করার পর বডি বদলানো

এটাই সবচেয়ে বাস্তব আক্রমণ। একটা সঠিক সাইন করা ইভেন্ট ধরে তার `amount` বা `order_id` বদলে দেওয়া।

1. আসল secret দিয়ে উপরের মতো সঠিক `SIG` বানান।
2. এবার `fake-event.json`-এ `"amount":50000` বদলে `"amount":100` করুন, কিন্তু পুরনো `SIG`-ই পাঠান।

প্রত্যাশা: `400`। HMAC বডির একটা অক্ষর বদলালেও পুরো বদলে যায়।

এখানে একটা সূক্ষ্ম বাগ প্রায়ই পাওয়া যায়: সার্ভার যদি `express.json()` দিয়ে বডি আগে পার্স করে আবার `JSON.stringify` করে, তাহলে সঠিক ইভেন্টও ফেল করে। ডেভেলপার তখন "বিরক্ত হয়ে" যাচাই বন্ধ করে দেন। তাই raw বডি ব্যবহার হচ্ছে কি না কোড রিভিউতে দেখুন।

### টেস্ট ৫: শুধু v0 scheme

Stripe-এর ডকুমেন্টেশন বলে, downgrade attack (দুর্বল পদ্ধতিতে নামিয়ে আনা) ঠেকাতে `v1` ছাড়া অন্য সব scheme উপেক্ষা করতে হবে।

```bash
curl -i -X POST http://localhost:4242/webhook \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=$TS,v0=$SIG" \
  --data-binary @fake-event.json
```

প্রত্যাশা: `400`। অফিসিয়াল SDK এটা নিজেই করে। কিন্তু কেউ নিজে হাতে যাচাই লিখলে (যেমন PHP বা Python-এ কাস্টম কোড) ভুল হতে পারে। তখন এই টেস্ট খুব কাজের।

## Replay Attack ও Duplicate ইভেন্ট

Replay attack মানে একটা পুরনো, সত্যিকারের সাইন করা বার্তা কপি করে পরে আবার পাঠানো। সিল তো আসল, তাই শুধু HMAC চেক এটা ধরবে না। এজন্যই `t` টাইমস্ট্যাম্প সিলের ভেতরে রাখা হয়।

### Tolerance-এর বাইরে Replay

1. `stripe listen --forward-to localhost:4242/webhook` চালান।
2. অন্য টার্মিনালে `stripe trigger payment_intent.succeeded` দিন।
3. সার্ভার লগে ইভেন্ট পৌঁছানোর পর, আপনার নিজের টেস্ট কোডে raw বডি ও `Stripe-Signature` হেডার একটা ফাইলে সেভ করুন (শুধু লোকাল ডিবাগ মোডে)।
4. ৬ মিনিট অপেক্ষা করুন।
5. সেই হেডার ও বডি হুবহু curl দিয়ে আবার পাঠান।

প্রত্যাশা: `400`, লগে timestamp tolerance-এর বাইরে থাকার বার্তা। ঠিক একই জিনিস নিজে বানাতে চাইলে পুরনো `TS` (যেমন `$(( $(date +%s) - 600 ))`) দিয়ে আসল secret-এ সাইন করুন।

> [!NOTE]
> Tolerance শূন্য বা খুব বড় (যেমন কয়েক ঘণ্টা) করা থাকলে সেটা রিপোর্ট করার মতো দুর্বলতা। আবার সার্ভারের ঘড়ি ভুল থাকলে সঠিক ইভেন্টও বাতিল হতে পারে। তাই সার্ভারে NTP দিয়ে সময় ঠিক রাখা জরুরি।

### Tolerance-এর ভেতরে Duplicate

Stripe নিজেই বলে, একই ইভেন্ট একাধিকবার আসতে পারে। নেটওয়ার্ক টাইমআউট হলে Stripe রিট্রাই করে, লাইভ মোডে কয়েক দিন পর্যন্ত। তাই duplicate আসা আক্রমণ না হলেও স্বাভাবিক ঘটনা।

টেস্ট:

1. Stripe Dashboard → Workbench বা Events-এ একটা ইভেন্ট খুঁজে নিন, অথবা CLI-তে `stripe events resend evt_XXXX` দিন।
2. একই ইভেন্ট দুবার পাঠান।

প্রত্যাশা: দুবারই `200`, কিন্তু অর্ডার একবারই Paid, ইমেইল একবারই গেছে, কোর্স অ্যাক্সেস একবারই দেওয়া হয়েছে। দ্বিতীয়বার 4xx/5xx দিলে Stripe আবার রিট্রাই করবে, যা আরও ঝামেলা তৈরি করে। Idempotency (একই কাজ বারবার করলেও ফল একবারই) নিয়ে বিস্তারিত: [Idempotency টেস্টিং](/lessons/idempotency-testing/)।

## আরও ঝুঁকি: HTTPS, IP, Payload, Error ও Rate Limit

### HTTPS বাধ্যতামূলক

লাইভ মোডে Stripe শুধু HTTPS endpoint-এ ইভেন্ট পাঠায়, আর সার্টিফিকেট বৈধ হতে হয়। লোকালে HTTP চলে কারণ `stripe listen` আপনার মেশিনে ফরোয়ার্ড করে। টেস্টার হিসেবে স্টেজিং ও প্রোডাকশনের endpoint URL `https://` দিয়ে শুরু কি না, আর সার্টিফিকেটের মেয়াদ ঠিক আছে কি না দেখুন।

### IP allowlist: বাড়তি স্তর, একমাত্র স্তর নয়

Stripe তাদের webhook পাঠানোর IP তালিকা প্রকাশ করে ([docs.stripe.com/ips](https://docs.stripe.com/ips))। কেউ চাইলে ফায়ারওয়ালে শুধু সেই IP খোলা রাখতে পারেন। এটা ভালো বাড়তি সুরক্ষা। কিন্তু:

- IP তালিকা সময়ের সাথে বদলায়, আপডেট না করলে আসল ইভেন্ট আটকে যাবে
- লোড ব্যালান্সার বা প্রক্সির পেছনে ভুল হেডার (যেমন `X-Forwarded-For`) বিশ্বাস করলে IP নকল করা যায়
- IP চেক বার্তার বডি বদলানো হয়েছে কি না বলতে পারে না

তাই রিপোর্টে লিখুন: "IP allowlist থাকলেও signature যাচাই বাধ্যতামূলক।"

### Payload অন্ধভাবে বিশ্বাস করবেন না

Signature বলে বার্তা Stripe-এর। কিন্তু ইভেন্ট দেরিতে বা উল্টো ক্রমে আসতে পারে। ধরুন `payment_intent.succeeded` আসার আগেই রিফান্ড হয়ে গেছে। ভালো প্যাটার্ন:

```js
const pi = await stripe.paymentIntents.retrieve(event.data.object.id);
if (pi.status === 'succeeded' && pi.amount === order.amountInPaisa && pi.currency === order.currency) {
  // তবেই অর্ডার Paid
}
```

টেস্টার হিসেবে দেখুন: অর্ডারের দাম ৫০০ টাকা, কিন্তু পেমেন্ট ১ টাকার হলে সিস্টেম কি অর্ডার Paid করে? এটা [পেমেন্ট লজিক দুর্বলতা](/lessons/payment-logic-vulnerabilities/)-র সাথে সরাসরি যুক্ত।

### Error response-এ তথ্য ফাঁস

ভুল signature পাঠালে রেসপন্সে কী আসে দেখুন। খারাপ উদাহরণ:

```text
HTTP/1.1 500 Internal Server Error
Error: No signatures found matching the expected signature for payload.
    at Object.verifyHeader (/app/node_modules/stripe/cjs/Webhooks.js:...)
    secret used: whsec_XXXXXXXX
```

এখানে stack trace, ফাইলের পাথ, এমনকি secret-এর অংশ বাইরে চলে গেছে। ভালো রেসপন্স শুধু `400 Invalid signature`, বিস্তারিত শুধু সার্ভার লগে। আরও জানতে: [সংবেদনশীল তথ্য ফাঁস](/lessons/sensitive-data-exposure/)।

### Rate limiting

Endpoint পাবলিক, তাই কেউ হাজারো নকল রিকোয়েস্ট পাঠিয়ে সার্ভার ব্যস্ত রাখতে পারে। Signature যাচাই সস্তা কাজ, তবুও একটা যুক্তিসঙ্গত সীমা রাখা ভালো, আর সীমাটা যেন Stripe-এর আসল ট্রাফিক আটকে না দেয়। টেস্টার হিসেবে নিজের লোকালে কয়েকবার হাতে রিকোয়েস্ট পাঠিয়ে দেখুন কোনো সীমা আছে কি না, এবং কনফিগ থাকলে `429` আসে কি না। লোড টেস্ট বা ফ্লাড স্ক্রিপ্ট চালাবেন না। বিস্তারিত: [ইনপুট ভ্যালিডেশন ও Rate Limiting](/lessons/input-validation-rate-limiting/)।

## টেস্ট টেবিল: প্রত্যাশিত ফলসহ

| # | টেস্ট | পাঠানো জিনিস | প্রত্যাশিত Status | প্রত্যাশিত সাইড ইফেক্ট | ব্যর্থ হলে Severity |
|---|---|---|---|---|---|
| WS-01 | হেডার নেই | বডি, `Stripe-Signature` ছাড়া | 400 | অর্ডার অপরিবর্তিত | Critical |
| WS-02 | খালি হেডার | `Stripe-Signature: ` | 400 | অর্ডার অপরিবর্তিত | Critical |
| WS-03 | ভুল secret | নতুন `t`, ভুল চাবির `v1` | 400 | অর্ডার অপরিবর্তিত | Critical |
| WS-04 | বডি বদলানো | সঠিক `v1`, বদলানো amount | 400 | অর্ডার অপরিবর্তিত | Critical |
| WS-05 | শুধু v0 | `t=...,v0=...` | 400 | অর্ডার অপরিবর্তিত | High |
| WS-06 | পুরনো replay | ৬ মিনিট পুরনো সঠিক ইভেন্ট | 400 | কিছু হবে না | High |
| WS-07 | Duplicate | একই `evt_` দুবার | 200, 200 | কাজ একবারই | High |
| WS-08 | সঠিক ইভেন্ট | `stripe trigger` | 200 | অর্ডার Paid | Blocker (পজিটিভ) |
| WS-09 | Error leak | ভুল signature | 400, ছোট বার্তা | stack trace নেই | Medium |
| WS-10 | HTTPS | স্টেজিং/লাইভ URL | `https://` | বৈধ সার্টিফিকেট | High |
| WS-11 | Payload বিশ্বাস | কম amount-এর পেমেন্ট | 200 | অর্ডার Paid হবে না | Critical |
| WS-12 | Rate limit | কয়েকটি দ্রুত হাতে রিকোয়েস্ট | সীমা পেরোলে 429 | সার্ভার সচল | Low/Medium |

## হাতেকলমে অনুশীলন

1. [Webhook Signature Verification](/lessons/webhook-signature-verification/) লেসনের Express সার্ভার চালু করুন: `node server.js`।
2. নতুন টার্মিনালে `stripe listen --forward-to localhost:4242/webhook` দিন, দেখানো `whsec_` secret এনভায়রনমেন্টে রাখুন।
3. `stripe trigger payment_intent.succeeded` দিয়ে পজিটিভ টেস্ট (WS-08) পাস করান।
4. উপরের curl দিয়ে WS-01 থেকে WS-05 চালান। প্রতিটির Status ও সার্ভার লগ একটা স্প্রেডশিটে লিখুন।
5. পুরনো timestamp দিয়ে WS-06 চালান।
6. `stripe events resend` দিয়ে WS-07 চালান, তারপর দেখুন `seen` সেটে বা ডাটাবেসে কতবার রেকর্ড হলো।
7. ইচ্ছে করে কোডে বাগ ঢোকান: `try/catch`-এর ক্যাচে `return`-এর বদলে শুধু লগ করুন। আবার WS-01 চালিয়ে দেখুন টেস্ট এখন বাগ ধরে কি না। তারপর কোড ঠিক করে দিন।
8. একটা [বাগ রিপোর্ট](/lessons/payment-bug-reports/) লিখুন, যেন সত্যিকারের প্রজেক্টে পাওয়া গেছে।

> [!MISTAKE] সাধারণ ভুল
> - শুধু পজিটিভ টেস্ট করা: "ইভেন্ট এসেছে, অর্ডার Paid হয়েছে, পাস।" নেগেটিভ টেস্ট ছাড়া সিকিউরিটি যাচাই হয় না।
> - Duplicate ইভেন্টে 400 বা 500 দেওয়াকে "নিরাপদ" ভাবা। এতে Stripe রিট্রাই চালিয়েই যায়।
> - টেস্টের জন্য বানানো "signature skip" ফ্ল্যাগ প্রোডাকশনে চালু রেখে দেওয়া।
> - আসল `whsec_` secret স্ক্রিনশট, বাগ রিপোর্ট বা Git-এ রেখে দেওয়া।
> - অন্যের সাইটের webhook URL খুঁজে সেখানে "শুধু একটা" টেস্ট পাঠানো। এটা অনুমতিহীন আক্রমণ।

> [!CHECK] সফলতার চেকলিস্ট
> - WS-01 থেকে WS-06 সব 400, অর্ডার অপরিবর্তিত
> - WS-07-এ কাজ একবারই হয়েছে
> - Error রেসপন্সে stack trace বা secret নেই
> - Endpoint কোড API থেকে অবজেক্ট আবার ফেচ করে মেলায়

## সারসংক্ষেপ

- Webhook endpoint ডিজাইন অনুযায়ী পাবলিক; সুরক্ষা আসে `Stripe-Signature` যাচাই থেকে, raw বডি দিয়ে।
- হেডার নেই, খালি, ভুল secret, বদলানো বডি, শুধু v0: সব ক্ষেত্রে 400 এবং কোনো সাইড ইফেক্ট নয়।
- Timestamp tolerance (ডিফল্ট ৫ মিনিট) replay ঠেকায়; tolerance-এর ভেতরের duplicate idempotent ভাবে সামলাতে হয়।
- IP allowlist বাড়তি স্তর মাত্র; লাইভে HTTPS বাধ্যতামূলক।
- Payload অন্ধভাবে বিশ্বাস না করে API থেকে আবার ফেচ করে মেলান; error-এ তথ্য ফাঁস করবেন না।

## বাড়ির কাজ

1. উপরের ১২টি টেস্ট আপনার নিজের লোকাল সার্ভারে চালিয়ে একটা CSV টেস্ট রিপোর্ট বানান (ID, ফল, প্রমাণ)।
2. সার্ভারের `seen` সেটটা একটা ফাইল বা SQLite টেবিলে সরান, যাতে সার্ভার রিস্টার্টের পরও duplicate ধরা পড়ে। তারপর রিস্টার্ট করে WS-07 আবার চালান।
3. ভাবুন: আপনার Daraz-এর মতো দোকানে `charge.refunded` ইভেন্ট নকল করা গেলে কী ক্ষতি হতো? ৩ লাইনে লিখুন।

<details><summary>সমাধান দেখুন</summary>

৩ নম্বরের সম্ভাব্য উত্তর: নকল রিফান্ড ইভেন্ট দিয়ে আক্রমণকারী সিস্টেমকে বিশ্বাস করাতে পারত যে টাকা ফেরত গেছে। এতে স্টক ও হিসাব গোলমাল হতো, গ্রাহককে ভুল ইমেইল যেত, আর সাপোর্ট টিম ভুল তথ্যে সিদ্ধান্ত নিত। সমাধান একই: signature যাচাই এবং API থেকে রিফান্ড অবজেক্ট আবার ফেচ করা।

</details>
