---
order: 5
level: 1
week: 2
title: "Stripe পেমেন্ট ফ্লো: Checkout, PaymentIntent আর স্ট্যাটাসের জীবনচক্র"
description: "Stripe Checkout আর PaymentIntent ও Payment Element ফ্লোর পার্থক্য, ক্লায়েন্ট ও সার্ভারের দায়িত্ব, প্রতিটি স্ট্যাটাসে টেস্টার কী দেখবেন, আর কেন অর্ডার হবে শুধু Webhook-এর পরে।"
keywords: ["stripe checkout", "paymentintent", "payment element", "checkout session", "payment_status", "requires_action", "requires_capture", "client secret", "stripe webhook", "payment lifecycle", "পেমেন্ট ফ্লো", "স্ট্রাইপ চেকআউট", "পেমেন্ট স্ট্যাটাস"]
minutes: 50
quiz:
  - q: "একটি কোর্স সাইট success_url পেজ লোড হলেই কোর্স আনলক করে। একজন ইউজার পেমেন্ট না করে সরাসরি সেই URL খুলে কোর্স পেয়ে গেলেন। সঠিক সমাধান কী?"
    options: ["success_url-এর নাম বদলে লুকিয়ে রাখা", "সার্ভারে Webhook (যেমন checkout.session.completed) পেয়ে এবং payment_status যাচাই করে তবেই আনলক করা", "success পেজে একটি লোডিং অ্যানিমেশন যোগ করা", "ব্রাউজারের localStorage-এ পেমেন্ট সফল লিখে রাখা"]
    answer: 1
    explain: "ব্রাউজারের রিডাইরেক্ট যে কেউ নকল করতে পারে। পেমেন্টের সত্য আসে Stripe থেকে সার্ভারে, Webhook-এর মাধ্যমে বা API দিয়ে স্ট্যাটাস যাচাই করে। URL লুকানো বা localStorage কোনো সুরক্ষা নয়।"
  - q: "একটি PaymentIntent-এর স্ট্যাটাস requires_action। এর মানে কী এবং টেস্টার কী দেখবেন?"
    options: ["পেমেন্ট সফল, আর কিছু দেখার নেই", "কাস্টমারকে বাড়তি যাচাই (যেমন 3D Secure) করতে হবে; UI-তে যাচাইয়ের ধাপ আসে কি না এবং সফল বা ব্যর্থ হলে ঠিক স্ট্যাটাসে যায় কি না", "সার্ভার ডাউন", "মার্চেন্টকে হাতে Capture করতে হবে"]
    answer: 1
    explain: "requires_action মানে কাস্টমারের দিক থেকে আরেকটা কাজ বাকি, সাধারণত 3D Secure। টেস্টারকে দেখতে হবে যাচাইয়ের মডাল আসে কি না এবং দুই ফলাফলেই সঠিক আচরণ হয় কি না।"
  - q: "একটি পেমেন্ট ব্যর্থ হলো (কার্ড প্রত্যাখ্যাত)। PaymentIntent এখন কোন স্ট্যাটাসে যাওয়ার কথা?"
    options: ["canceled", "succeeded", "requires_payment_method", "processing"]
    answer: 2
    explain: "ব্যর্থ চেষ্টার পর PaymentIntent আবার requires_payment_method-এ ফেরে, যাতে কাস্টমার অন্য কার্ড দিয়ে চেষ্টা করতে পারেন। canceled হয় শুধু যখন স্পষ্টভাবে বাতিল করা হয়।"
  - q: "একটি Checkout Session-এর status হলো complete, কিন্তু payment_status হলো unpaid। এটা কখন স্বাভাবিক হতে পারে?"
    options: ["কখনোই না, এটা সবসময় বাগ", "শুধু Live Mode-এ", "যখন কার্ড প্রত্যাখ্যাত হয়েছে", "দেরিতে নিশ্চিত হওয়া (asynchronous) পেমেন্ট পদ্ধতিতে, যেখানে টাকা পরে নিশ্চিত হয়; তাই অর্ডার তখনই পূরণ করা যাবে না"]
    answer: 3
    explain: "কিছু পেমেন্ট পদ্ধতিতে কাস্টমার ফ্লো শেষ করলেও টাকা পরে নিশ্চিত হয়। তখন সার্ভারকে পরের Webhook (যেমন async_payment_succeeded) পর্যন্ত অপেক্ষা করতে হবে।"
  - q: "একটি রাইড অ্যাপ PaymentIntent তৈরি করে capture_method manual দিয়ে। কার্ড অনুমোদনের পর স্ট্যাটাস কী হবে এবং কী টেস্ট করবেন?"
    options: ["requires_capture; রাইড শেষে সঠিক অঙ্ক Capture হয় কি না, আর বাতিল হলে হোল্ড ছেড়ে দেওয়া হয় কি না", "succeeded; আর কিছু দেখার নেই", "processing; শুধু অপেক্ষা", "requires_confirmation; কাস্টমারকে আবার কার্ড দিতে হবে"]
    answer: 0
    explain: "manual capture-এ অনুমোদনের পর টাকা শুধু আটকে থাকে, স্ট্যাটাস requires_capture। মার্চেন্ট পরে Capture বা Cancel করে, এবং নির্দিষ্ট সময়ের মধ্যে Capture না করলে অনুমোদন বাতিল হয়ে যেতে পারে।"
---

Stripe দিয়ে টাকা নেওয়ার কয়েকটি পথ আছে। সবচেয়ে বেশি দেখবেন দুটি: Stripe-এর বানানো পেমেন্ট পেজ (Checkout), আর নিজের পেজে বসানো ফর্ম (PaymentIntent ও Payment Element)।

টেস্টার হিসেবে আপনাকে জানতে হবে কোন ফ্লো ব্যবহার হচ্ছে, কারণ টেস্ট কেস, স্ট্যাটাস আর ঝুঁকি দুটোতে আলাদা।

## এই লেসনে যা শিখবেন

- Stripe Checkout আর PaymentIntent ও Payment Element ফ্লোর পার্থক্য
- ক্লায়েন্ট (ব্রাউজার বা অ্যাপ) আর সার্ভারের দায়িত্ব কোথায় আলাদা
- PaymentIntent-এর প্রতিটি স্ট্যাটাস, আর প্রতিটিতে টেস্টার কী দেখবেন
- Checkout Session-এর status আর payment_status
- কেন মার্চেন্টের অর্ডার তৈরি হবে শুধু Webhook দিয়ে নিশ্চিত হওয়ার পর

## দুই ফ্লো: Checkout বনাম PaymentIntent

### Stripe Checkout

Checkout হলো Stripe-এর তৈরি করা পেমেন্ট পেজ। মার্চেন্টের সার্ভার একটি **Checkout Session** (একটি নির্দিষ্ট কেনাকাটার পেমেন্ট সেশন) তৈরি করে, কাস্টমারকে Stripe-এর পেজে পাঠায় (বা নিজের পেজে এমবেড করে), পেমেন্ট শেষে কাস্টমার ফেরে `success_url`-এ।

উপমা: Daraz-এর মতো শপ যেন কাস্টমারকে ব্যাংকের কাউন্টারে পাঠিয়ে দিল। কাউন্টার সব সামলায়, শপ শুধু ফলাফল জানে।

### PaymentIntent ও Payment Element

**PaymentIntent** (একটি পেমেন্টের শুরু থেকে শেষ পর্যন্ত ট্র্যাক রাখার অবজেক্ট) মার্চেন্টের সার্ভার তৈরি করে। তারপর মার্চেন্টের নিজের চেকআউট পেজে **Payment Element** (Stripe.js-এর একটি তৈরি UI কম্পোনেন্ট, যেখানে কার্ড ও অন্যান্য পদ্ধতি দেখায়) বসানো হয়। কার্ডের তথ্য সরাসরি Stripe-এ যায়, মার্চেন্টের সার্ভারে নয়।

উপমা: শপ নিজের দোকানেই ব্যাংকের একটা নিরাপদ বুথ বসিয়েছে।

| বিষয় | Checkout | PaymentIntent + Payment Element |
|---|---|---|
| পেমেন্ট পেজ | Stripe-এর হোস্টেড বা এমবেডেড পেজ | মার্চেন্টের নিজের পেজ |
| কোড কম না বেশি | কম | বেশি, বেশি নিয়ন্ত্রণ |
| মূল অবজেক্ট | Checkout Session (ভেতরে PaymentIntent তৈরি হয়) | PaymentIntent |
| ফলাফল জানা | `success_url` রিডাইরেক্ট + Webhook | `stripe.confirmPayment` এর ফল + `return_url` + Webhook |
| মূল Webhook | `checkout.session.completed` | `payment_intent.succeeded`, `payment_intent.payment_failed` |
| QA-এর বিশেষ নজর | success ও cancel URL, সেশনের মেয়াদ, লাইন আইটেম ও অঙ্ক | UI এরর মেসেজ, 3D Secure, ডাবল সাবমিট, client secret-এর ব্যবহার |

> [!NOTE]
> Stripe-এর এই প্রোডাক্টগুলো নিয়মিত নতুন অপশন পায় (যেমন এমবেডেড Checkout, নতুন UI মোড)। মূল ধারণা একই থাকে। বর্তমান বিস্তারিত দেখুন [Stripe Docs](https://docs.stripe.com)-এ “Checkout” আর “Payment Intents” সার্চ করে।

## ক্লায়েন্ট আর সার্ভারের দায়িত্ব

সবচেয়ে জরুরি নিয়ম: **অঙ্ক ঠিক করবে সার্ভার, ক্লায়েন্ট নয়।**

| কাজ | কে করে | কেন |
|---|---|---|
| অঙ্ক ও মুদ্রা ঠিক করা | সার্ভার | ব্রাউজারের ডেটা ইউজার বদলাতে পারে |
| PaymentIntent বা Checkout Session তৈরি | সার্ভার (Secret Key দিয়ে) | Secret Key শুধু সার্ভারে থাকে |
| কার্ড তথ্য নেওয়া | ক্লায়েন্ট, Stripe.js দিয়ে, Publishable Key | কার্ড তথ্য মার্চেন্টের সার্ভার ছোঁয় না |
| পেমেন্ট confirm করা | সাধারণত ক্লায়েন্ট (Payment Element) | 3D Secure-এর মতো কাস্টমারের কাজ ব্রাউজারে হয় |
| পেমেন্ট সফল ধরে অর্ডার পূরণ | সার্ভার, Webhook পেয়ে | রিডাইরেক্ট নকল হতে পারে, ট্যাব বন্ধ হতে পারে |

PaymentIntent তৈরি হলে একটি **client secret** আসে। সেটা ব্রাউজারে পাঠানো হয় যাতে Payment Element ওই নির্দিষ্ট পেমেন্টটি confirm করতে পারে। এটা Secret Key নয়, কিন্তু তবুও লগে বা URL-এ ফেলে রাখা উচিত নয়।

> [!DANGER] অঙ্ক ক্লায়েন্ট থেকে নেওয়া
> যদি চেকআউট পেজ থেকে `amount: 2000` সার্ভারে যায় এবং সার্ভার সেটাই PaymentIntent-এ বসায়, তাহলে কেউ DevTools বা প্রক্সি দিয়ে অঙ্ক 10 করে দিতে পারে। এটা নিজের লোকাল অ্যাপে বা Sandbox-এ যাচাই করুন, কখনো অন্যের সাইটে নয়। বিস্তারিত [পেমেন্ট লজিক দুর্বলতা লেসনে](/lessons/payment-logic-vulnerabilities/)।

## PaymentIntent-এর জীবনচক্র

একটি PaymentIntent এক স্ট্যাটাস থেকে আরেক স্ট্যাটাসে যায়। প্রতিটি স্ট্যাটাস একটা প্রশ্নের উত্তর: “এখন কার কাজ বাকি?”

| স্ট্যাটাস | মানে | টেস্টার কী দেখবেন |
|---|---|---|
| `requires_payment_method` | পেমেন্ট পদ্ধতি দরকার। নতুন তৈরি হলে বা আগের চেষ্টা ব্যর্থ হলে এখানে থাকে | ফর্ম দেখায় কি না; কার্ড প্রত্যাখ্যানের পর আবার চেষ্টা করা যায় কি না; এরর মেসেজ বোধগম্য কি না |
| `requires_confirmation` | পদ্ধতি যুক্ত, কিন্তু confirm বাকি (সার্ভার-সাইড confirm ফ্লোতে দেখা যায়) | confirm না করলে অর্ডার তৈরি হচ্ছে না তো |
| `requires_action` | কাস্টমারের বাড়তি কাজ বাকি, সাধারণত 3D Secure | যাচাইয়ের মডাল আসে কি না; পাস ও ফেইল দুটোতেই সঠিক পরিণতি |
| `processing` | Stripe প্রসেস করছে; কিছু পদ্ধতিতে সময় লাগে | “প্রসেসিং” বার্তা দেখায় কি না; এ অবস্থায় অর্ডার পূরণ বা দ্বিতীয় পেমেন্ট হয় না তো |
| `requires_capture` | অনুমোদিত, টাকা হোল্ডে; `capture_method: manual` হলে | সঠিক অঙ্ক Capture হয় কি না; বাতিল হলে হোল্ড ছেড়ে দেওয়া হয় কি না; সময়সীমা পেরোলে কী হয় |
| `succeeded` | সফল, টাকা নেওয়া হয়েছে | অর্ডার একবারই Paid; ইমেইল একবার; অঙ্ক মেলে; Webhook পেয়ে তবেই পূরণ |
| `canceled` | বাতিল, আর ব্যবহার হবে না | বাতিলের পর confirm করলে এরর; অর্ডার বাতিল দেখায়; হোল্ড থাকলে ছাড়া হয় |

সাধারণ পথটা টেক্সট ফ্লো আকারে:

```text
1. requires_payment_method   (নতুন, বা আগের চেষ্টা ব্যর্থ হয়ে ফেরত এসেছে)
2. requires_confirmation     (পদ্ধতি যুক্ত, confirm বাকি)
3. requires_action           (দরকার হলে 3D Secure; ফেইল করলে আবার ১ নম্বরে)
4. processing                (কিছু পদ্ধতিতে কিছুক্ষণ থাকে)
5. ফলাফল:
   - succeeded               (সাধারণ automatic capture)
   - requires_capture        (manual capture হলে; পরে Capture → succeeded, বা Cancel → canceled)
   - requires_payment_method (প্রত্যাখ্যাত হলে)
যেকোনো অসমাপ্ত অবস্থা থেকে মার্চেন্ট Cancel করলে → canceled
```

Payment Element-এ ক্লায়েন্ট সাধারণত পদ্ধতি দেওয়া আর confirm একসাথে করে, তাই `requires_confirmation` চোখে নাও পড়তে পারে। সব PaymentIntent প্রতিটি ধাপ দিয়ে যায় না।

> [!TIP]
> Dashboard-এ একটি পেমেন্ট খুলে তার Events দেখুন। প্রতিটি স্ট্যাটাস বদলের সাথে ইভেন্ট তৈরি হয়, যেমন `payment_intent.created`, `payment_intent.requires_action`, `payment_intent.succeeded`। বাগ রিপোর্টে এই টাইমলাইন যোগ করলে ডেভেলপার দ্রুত বোঝেন।

## Checkout Session: status আর payment_status

Checkout Session-এর দুটি আলাদা ফিল্ড আছে। দুটো গুলিয়ে ফেলা খুব সাধারণ ভুল।

| ফিল্ড | মান | মানে |
|---|---|---|
| `status` | `open` | সেশন চালু, কাস্টমার এখনো শেষ করেননি |
| `status` | `complete` | কাস্টমার ফ্লো শেষ করেছেন |
| `status` | `expired` | মেয়াদ শেষ (ডিফল্টে সাধারণত তৈরির ২৪ ঘণ্টা পর) বা মার্চেন্ট নিজে expire করেছে |
| `payment_status` | `paid` | টাকা নিশ্চিত, অর্ডার পূরণ করা যায় |
| `payment_status` | `unpaid` | টাকা এখনো নিশ্চিত নয় |
| `payment_status` | `no_payment_required` | টাকা লাগছে না (যেমন পুরো ডিসকাউন্ট বা ফ্রি ট্রায়াল) |

`complete` মানেই টাকা পাওয়া গেছে নয়। কিছু পেমেন্ট পদ্ধতিতে টাকা পরে নিশ্চিত হয়। তখন সেশন `complete`, কিন্তু `payment_status` `unpaid`, এবং পরে আসে `checkout.session.async_payment_succeeded` বা `checkout.session.async_payment_failed` Webhook।

QA হিসেবে Checkout-এ যা দেখবেন:

- কাস্টমার পেজে **Back** বা cancel চাপলে `cancel_url`-এ ফেরে এবং অর্ডার Paid হয় না।
- সেশন expire হলে পুরোনো লিংকে কী দেখায়, কার্টের অবস্থা কী।
- লাইন আইটেম, পরিমাণ, অঙ্ক, মুদ্রা Stripe পেজে ঠিক দেখায় কি না।
- একই কার্ট থেকে দুই ট্যাবে দুটি সেশন খুললে দুইবার চার্জ হয় কি না।

## পুরো ক্রম: একটি কোর্স কেনা (PaymentIntent ফ্লো)

1. কাস্টমার “Buy course” চাপেন। ব্রাউজার সার্ভারকে শুধু কোর্সের আইডি পাঠায়, অঙ্ক নয়।
2. সার্ভার ডেটাবেস থেকে দাম নেয়, নিজের অর্ডার তৈরি করে স্ট্যাটাস `pending` রাখে।
3. সার্ভার Secret Key দিয়ে Stripe-এ PaymentIntent তৈরি করে, `metadata`-তে অর্ডার আইডি দেয়।
4. Stripe `client_secret` ফেরত দেয়, সার্ভার সেটা ব্রাউজারে পাঠায়।
5. ব্রাউজারে Payment Element দেখায়, কাস্টমার কার্ড দেন।
6. ব্রাউজার `stripe.confirmPayment` চালায়। দরকার হলে 3D Secure মডাল আসে।
7. Stripe কার্ড নেটওয়ার্ক ও ব্যাংক থেকে উত্তর নেয়, PaymentIntent আপডেট করে।
8. কাস্টমারকে `return_url`-এ পাঠানো হয়। এই পেজ শুধু “আমরা নিশ্চিত করছি” বা স্ট্যাটাস দেখায়, অর্ডার পূরণ করে না।
9. Stripe সার্ভারে `payment_intent.succeeded` Webhook পাঠায়।
10. সার্ভার Webhook-এর স্বাক্ষর যাচাই করে, `metadata` থেকে অর্ডার খুঁজে, অঙ্ক মিলিয়ে, অর্ডার `paid` করে এবং কোর্স আনলক করে। একই ইভেন্ট দুইবার এলেও দ্বিতীয়বার কিছু করে না।
11. সার্ভার Stripe-কে 2xx উত্তর দেয়, যাতে Stripe রিট্রাই না করে।

## মার্চেন্টের দিকে যা অবশ্যই যাচাই করবেন

- **অর্ডার Paid হয় শুধু Webhook-এর পরে**, `success_url` বা `return_url` লোড হওয়ায় নয়।
- **Webhook-এর স্বাক্ষর যাচাই হয়** (Stripe-Signature হেডার আর `whsec_XXXXXXXX` সিক্রেট দিয়ে)। নকল Webhook গ্রহণ করা বিশাল ঝুঁকি। বিস্তারিত [Webhook Signature লেসনে](/lessons/webhook-signature-verification/)।
- **অঙ্ক ও মুদ্রা মেলানো**: Webhook-এর `amount_received` আর অর্ডারের দাম এক কি না।
- **একবারই পূরণ**: একই ইভেন্ট আবার এলে কোর্স দুইবার যোগ, ইমেইল দুইবার, বা স্টক দুইবার কমে না।
- **দেরিতে Webhook**: কাস্টমার success পেজে অপেক্ষা করলে কী দেখেন; কয়েক সেকেন্ড পর স্ট্যাটাস আপডেট হয় কি না।
- **ব্যর্থতায়**: `payment_intent.payment_failed` এলে অর্ডার `pending` বা `failed` থাকে, কোর্স আনলক হয় না।

> [!MISTAKE]
> - `success_url` লোড হলেই অর্ডার Paid ধরা।
> - Checkout Session-এর `status: complete` দেখেই টাকা পাওয়া গেছে ধরা, `payment_status` না দেখা।
> - ব্রাউজার থেকে আসা অঙ্ক বিশ্বাস করা।
> - শুধু `succeeded` টেস্ট করা; `requires_action`, ব্যর্থতা, বাতিল, `processing` বাদ দেওয়া।
> - ধরে নেওয়া যে Webhook একবারই আসবে এবং ক্রমানুসারে আসবে।

## হাতেকলমে অনুশীলন

আমরা Dashboard আর curl দিয়ে কোড ছাড়াই PaymentIntent-এর জীবনচক্র দেখব। নিজের Test Mode বা Sandbox-এর Secret Key ব্যবহার করুন, কোথাও শেয়ার করবেন না।

1. একটি PaymentIntent তৈরি করুন (অঙ্ক ছোটতম এককে, যেমন 2000 মানে usd-তে ২০ ডলার):

```bash
curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_XXXXXXXXXXXXXXXX: \
  -d amount=2000 \
  -d currency=usd \
  -d "payment_method_types[]=card" \
  -d "metadata[order_id]=ORD-1001"
```

2. Response-এ `id` (`pi_` দিয়ে শুরু) আর `status` দেখুন। হওয়ার কথা `requires_payment_method`।
3. Stripe-এর টেস্ট পেমেন্ট মেথড `pm_card_visa` দিয়ে confirm করুন:

```bash
curl https://api.stripe.com/v1/payment_intents/pi_XXXXXXXX/confirm \
  -u sk_test_XXXXXXXXXXXXXXXX: \
  -d payment_method=pm_card_visa
```

4. এবার `status` দেখুন। হওয়ার কথা `succeeded`।
5. আরেকটি PaymentIntent তৈরি করুন `-d capture_method=manual` যোগ করে, তারপর একইভাবে confirm করুন। স্ট্যাটাস দেখুন।
6. সেটির জন্য Capture চালান:

```bash
curl -X POST https://api.stripe.com/v1/payment_intents/pi_XXXXXXXX/capture \
  -u sk_test_XXXXXXXXXXXXXXXX:
```

7. তৃতীয় একটি PaymentIntent তৈরি করে confirm না করে বাতিল করুন (`/cancel` এন্ডপয়েন্ট)। তারপর সেটা confirm করার চেষ্টা করুন।
8. Dashboard → Payments আর Developers → Events-এ এই তিনটির টাইমলাইন মিলিয়ে দেখুন।

<details><summary>সমাধান দেখুন</summary>

- ধাপ ২: `requires_payment_method`, কারণ এখনো কোনো পদ্ধতি যুক্ত হয়নি।
- ধাপ ৪: `succeeded`। Events-এ `payment_intent.created` আর `payment_intent.succeeded` দেখবেন।
- ধাপ ৫: `requires_capture`। Dashboard-এ পেমেন্টটি “Uncaptured” জাতীয় লেবেলে দেখায়।
- ধাপ ৬: Capture-এর পর `succeeded`। চাইলে `-d amount_to_capture=1500` দিয়ে কম অঙ্ক Capture করে দেখুন বাকিটা ছেড়ে দেওয়া হয় কি না।
- ধাপ ৭: বাতিলের পর `canceled`। confirm চাইলে 400 জাতীয় এরর আসবে, মেসেজে বলবে এই স্ট্যাটাসে confirm করা যায় না। এটাই প্রত্যাশিত।
- `pm_card_visa` হলো Stripe-এর টেস্ট পেমেন্ট মেথড আইডি। বর্তমান তালিকা দেখুন https://docs.stripe.com/testing পেজে।

</details>

## সারসংক্ষেপ

- Checkout হলো Stripe-এর তৈরি পেজ; PaymentIntent আর Payment Element মার্চেন্টের নিজের পেজে বেশি নিয়ন্ত্রণ দেয়।
- অঙ্ক ঠিক করে সার্ভার; কার্ড তথ্য যায় সরাসরি Stripe-এ; Secret Key শুধু সার্ভারে।
- PaymentIntent চলে `requires_payment_method` থেকে `succeeded` বা `canceled`; প্রতিটি ধাপে আলাদা টেস্ট।
- Checkout Session-এ `status` আর `payment_status` আলাদা; `complete` মানেই `paid` নয়।
- অর্ডার পূরণ শুধু যাচাই করা Webhook পেয়ে, একবারই, অঙ্ক মিলিয়ে।

## বাড়ির কাজ

1. PaymentIntent স্ট্যাটাস টেবিলের প্রতিটি সারির জন্য একটি করে টেস্ট কেস লিখুন (মোট ৭টি)।
2. Checkout ফ্লোর জন্য ৫টি নেগেটিভ টেস্ট কেস লিখুন: cancel, expire, দুই ট্যাব, success_url সরাসরি খোলা, Webhook দেরিতে আসা।
3. পরের লেসনে [Stripe টেস্ট কার্ড](/lessons/stripe-test-cards/) দিয়ে এই স্ট্যাটাসগুলো নিজের চোখে ঘটাব।
