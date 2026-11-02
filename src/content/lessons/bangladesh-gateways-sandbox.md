---
order: 33
level: 5
week: 10
title: "বাংলাদেশি গেটওয়ে স্যান্ডবক্সে টেস্টিং: SSLCommerz, bKash ও Nagad"
description: "SSLCommerz-এর session, IPN ও Validation API, bKash Tokenized Checkout-এর grant-create-execute-query ফ্লো আর Nagad-এর সাধারণ ধারণা; Stripe-এর সাথে তুলনা ও লোকাল বাগের টেস্ট কেস।"
keywords: ["sslcommerz", "bkash", "nagad", "sandbox", "ipn", "validation api", "tokenized checkout", "callback url", "bdt", "mfs", "বিকাশ", "নগদ", "এসএসএলকমার্জ", "পেমেন্ট গেটওয়ে", "স্যান্ডবক্স"]
minutes: 65
quiz:
  - q: "SSLCommerz-এ পেমেন্টের পর ইউজার success_url-এ ফিরে এলো। অ্যাপ এখনই অর্ডার “paid” করে দিচ্ছে। এখানে সমস্যা কী?"
    options: ["কোনো সমস্যা নেই, success_url মানেই সফল", "Redirect-এর ডেটা ইউজার বদলাতে পারে; সার্ভার থেকে Order Validation API দিয়ে val_id যাচাই করে, amount ও tran_id মিলিয়ে তারপর paid করতে হবে", "success_url-এ শুধু ইমেইল পাঠানো উচিত", "অর্ডার paid করতে fail_url ব্যবহার করতে হয়"]
    answer: 1
    explain: "ব্রাউজার redirect বিশ্বাসযোগ্য নয়, কেউ নিজেই URL-এ ঢুকতে পারে। মার্চেন্টকে সার্ভার-থেকে-সার্ভার validation করে স্ট্যাটাস, amount, currency ও tran_id মেলাতে হয়।"
  - q: "লোকাল মেশিনে ipn_url দিয়েছেন http://localhost:3000/ipn। পেমেন্ট সফল, কিন্তু IPN কখনো আসে না। কারণ কী?"
    options: ["SSLCommerz sandbox IPN পাঠায় না", "IPN শুধু রাতে আসে", "পোর্ট 3000 নিষিদ্ধ", "localhost শুধু আপনার মেশিনেই আছে; গেটওয়ের সার্ভার সেখানে পৌঁছাতে পারে না। একটা টানেল দিয়ে পাবলিক HTTPS URL দিতে হবে"]
    answer: 3
    explain: "IPN আসে গেটওয়ের সার্ভার থেকে, ইন্টারনেট দিয়ে। localhost বাইরে থেকে দেখা যায় না, তাই টানেল দরকার।"
  - q: "bKash Tokenized Checkout-এ callbackURL-এ status=success এসেছে। এরপর কী করতে হবে?"
    options: ["কিছু না, পেমেন্ট সম্পন্ন", "Execute Payment API কল করা; সেটার উত্তরে transactionStatus Completed ও trxID এলে তবেই সফল ধরা", "আবার Create Payment কল করা", "Grant Token মুছে ফেলা"]
    answer: 1
    explain: "Callback শুধু জানায় ইউজার অনুমোদন দিয়েছে। Execute কল না করলে পেমেন্ট সম্পন্ন হয় না; execute-এর ফলাফল বা Query দিয়ে চূড়ান্ত স্ট্যাটাস নিশ্চিত করতে হয়।"
  - q: "Stripe-এ 1250 টাকা চার্জ করতে amount 125000 পাঠাতে হয়। SSLCommerz-এর total_amount-এ একই দামের জন্য সাধারণত কী পাঠানো হয়?"
    options: ["125000", "12.50", "1250.00 (টাকায় দশমিক)", "1250000"]
    answer: 2
    explain: "Stripe smallest unit (পয়সা) নেয়, কিন্তু SSLCommerz ও bKash সাধারণত টাকায় দশমিক মান নেয়। কোড এক গেটওয়ে থেকে অন্যটায় কপি করলে এই পার্থক্য বড় বাগ তৈরি করে।"
  - q: "একই সফল পেমেন্টের জন্য IPN আর ইউজারের redirect দুটোই আপনার সার্ভারে পৌঁছাল। দুই জায়গা থেকেই validation চলে অর্ডার কনফার্ম হলো এবং গ্রাহক দুটো কনফার্মেশন SMS ও দুবার কোর্স অ্যাক্সেস পেল। কোন টেস্ট এটা ধরত?"
    options: ["Double validation / idempotent processing টেস্ট: একই tran_id দুবার এলে দ্বিতীয়বার কোনো পার্শ্বপ্রতিক্রিয়া হবে না", "Load test", "UI রঙের টেস্ট", "পাসওয়ার্ড টেস্ট"]
    answer: 0
    explain: "IPN ও redirect দুটোই আসা স্বাভাবিক। প্রসেসিং idempotent হতে হবে: অর্ডার আগেই paid হলে দ্বিতীয়বার কিছু করবে না।"
---

Stripe দিয়ে শেখা ধারণাগুলো বাংলাদেশের বাজারে কাজে লাগাতে হলে **SSLCommerz**, **bKash** আর **Nagad** চিনতে হবে। দেশের বেশিরভাগ ই-কমার্স, কোর্স-বিক্রির সাইট আর রাইড অ্যাপ এগুলোর কোনো একটা ব্যবহার করে।

ভালো খবর: মূল ধারণা একই। Session তৈরি, ইউজারকে গেটওয়েতে পাঠানো, ফিরে আসা, সার্ভারে যাচাই, আর webhook-এর মতো নোটিফিকেশন। শুধু নাম আর খুঁটিনাটি আলাদা।

## এই লেসনে যা শিখবেন

- SSLCommerz sandbox-এর পুরো ফ্লো: init → gateway → success/fail/cancel → IPN → Validation API
- bKash Tokenized Checkout: grant token → create → execute → query
- Nagad সম্পর্কে সাধারণ ধারণা ও অ্যাক্সেস পাওয়ার উপায়
- Stripe-এর ধারণার সাথে তুলনা (PaymentIntent, webhook, idempotency)
- BDT amount, মোবাইল নম্বর ও OTP/PIN ভিত্তিক ফ্লো টেস্ট করা
- সাধারণ লোকাল বাগ ও একটা টেস্ট কেস টেবিল

> [!NOTE] ডকুমেন্টেশনই শেষ কথা
> এই গেটওয়েগুলোর API ভার্সন, endpoint ও ফিল্ডের নাম সময়ের সাথে বদলায়। এখানে ধারণা ও সাধারণ ফ্লো শেখানো হচ্ছে; আসল কাজের আগে প্রতিটা গেটওয়ের সর্বশেষ অফিসিয়াল ডকুমেন্টেশন মিলিয়ে নিন। টেস্ট মোবাইল নম্বর, OTP বা PIN গেটওয়ের sandbox ডকুমেন্টেশনেই দেওয়া থাকে; এখানে আমরা কোনো নম্বর বানিয়ে দিচ্ছি না।

## SSLCommerz sandbox

SSLCommerz একটা **payment aggregator** (একটা ইন্টিগ্রেশনে কার্ড, মোবাইল ব্যাংকিং, ইন্টারনেট ব্যাংকিং সব একসাথে দেয়)। ডেভেলপার পোর্টাল: [developer.sslcommerz.com](https://developer.sslcommerz.com)। সেখান থেকে ফ্রিতে একটা sandbox store রেজিস্টার করা যায়; ইমেইলে `store_id` আর `store_passwd` আসে।

`store_passwd` একটা গোপন তথ্য। এটা শুধু সার্ভারের `.env`-এ থাকবে, কখনো ফ্রন্টএন্ড কোডে, Postman-এর শেয়ার করা collection-এ বা GitHub-এ নয়।

### ফ্লো ধাপে ধাপে

1. **Init session**: আপনার সার্ভার SSLCommerz-এর session API-তে POST করে: `store_id`, `store_passwd`, `total_amount`, `currency` (`BDT`), `tran_id` (আপনার ইউনিক অর্ডার/লেনদেন id), `success_url`, `fail_url`, `cancel_url`, `ipn_url`, গ্রাহক ও পণ্যের তথ্য।
2. উত্তরে `status: "SUCCESS"` আর একটা `GatewayPageURL` আসে।
3. **Redirect**: ইউজারকে সেই URL-এ পাঠান। সেখানে সে কার্ড, bKash, Nagad, ব্যাংক বেছে নেয়।
4. পেমেন্টের পর ইউজার ফিরে আসে `success_url`, `fail_url` বা `cancel_url`-এ (POST ডেটাসহ, যেমন `tran_id`, `val_id`, `status`, `amount`)।
5. **IPN (Instant Payment Notification)**: আলাদাভাবে SSLCommerz-এর সার্ভার আপনার `ipn_url`-এ লেনদেনের ফল POST করে। এটা Stripe-এর webhook-এর মতো, ইউজার ব্রাউজার বন্ধ করে দিলেও আসে।
6. **Order Validation API**: `val_id` দিয়ে আপনার সার্ভার SSLCommerz-কে জিজ্ঞেস করে, "এই লেনদেন কি সত্যিই বৈধ?" উত্তরে স্ট্যাটাস (`VALID` বা `VALIDATED`), `amount`, `currency`, `tran_id` আসে। এগুলো নিজের অর্ডারের সাথে মিলিয়ে তবেই অর্ডার paid।

ধারণাটা এমন দেখায় (sandbox হোস্ট `sandbox.sslcommerz.com`; সঠিক path ও ফিল্ড ডকুমেন্টেশনে মিলিয়ে নিন):

```bash
# ধাপ ১: session তৈরি (সার্ভার থেকে, sandbox)
curl -X POST https://sandbox.sslcommerz.com/gwprocess/v4/api.php \
  -d store_id=YOUR_SANDBOX_STORE_ID \
  -d store_passwd=XXXXXXXX \
  -d total_amount=1250.00 \
  -d currency=BDT \
  -d tran_id=ORD-1001-A1 \
  -d success_url=https://your-tunnel.example/pay/success \
  -d fail_url=https://your-tunnel.example/pay/fail \
  -d cancel_url=https://your-tunnel.example/pay/cancel \
  -d ipn_url=https://your-tunnel.example/pay/ipn \
  -d cus_name=TestUser \
  -d cus_email=test@example.com \
  -d cus_phone=01XXXXXXXXX \
  -d product_name=QA-Course \
  -d product_category=education \
  -d product_profile=non-physical-goods \
  -d shipping_method=NO
```

```bash
# ধাপ ৬: validation (val_id আসে redirect বা IPN-এ)
curl "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=VAL_ID_HERE&store_id=YOUR_SANDBOX_STORE_ID&store_passwd=XXXXXXXX&format=json"
```

`your-tunnel.example` একটা প্লেসহোল্ডার; আসলে এখানে আপনার টানেলের URL বসবে (নিচে দেখুন)। গ্রাহকের তথ্যেও শুধু নকল টেস্ট ডেটা দিন।

> [!DANGER] Redirect কখনো বিশ্বাস করবেন না
> `success_url`-এ আসা ডেটা ব্রাউজারের মাধ্যমে আসে, তাই কেউ চাইলে নিজেই ফর্ম বানিয়ে `status=VALID` পাঠাতে পারে। মার্চেন্টকে অবশ্যই সার্ভার থেকে Validation API কল করতে হবে এবং ফেরত আসা `amount`, `currency`, `tran_id` নিজের DB-র সাথে মেলাতে হবে। ১২৫০ টাকার অর্ডারে ১০ টাকার বৈধ লেনদেনের `val_id` বসিয়ে দেওয়া একটা পরিচিত লজিক বাগ ([/lessons/payment-logic-vulnerabilities/](/lessons/payment-logic-vulnerabilities/))। এই ধরনের টেস্ট শুধু নিজের sandbox store ও নিজের লোকাল অ্যাপে।

## bKash Tokenized Checkout

bKash একটা **MFS (Mobile Financial Service)**, যেখানে পেমেন্ট হয় মোবাইল নম্বর, OTP আর PIN দিয়ে। মার্চেন্ট ইন্টিগ্রেশনের জন্য bKash-এর **Tokenized Checkout** API বহুল ব্যবহৃত। ডেভেলপার পোর্টাল: [developer.bka.sh](https://developer.bka.sh)।

Sandbox credentials (`username`, `password`, `app_key`, `app_secret`) সাধারণত bKash মার্চেন্ট বা ডেভেলপারদের দেয়। অ্যাক্সেস পেতে হয়তো bKash-এর সাথে যোগাযোগ বা মার্চেন্ট হিসেবে আবেদন করতে হতে পারে; পোর্টালের সর্বশেষ নির্দেশনা দেখুন।

### ফ্লো ধাপে ধাপে

| ধাপ | API (সাধারণ নাম) | কী হয় |
|---|---|---|
| ১ | Grant Token | `app_key`, `app_secret` (বডিতে) আর `username`, `password` (হেডারে) দিয়ে একটা `id_token` পান। এটা পরের কলগুলোর Authorization। মেয়াদ সীমিত, তাই refresh token দিয়ে নবায়ন। |
| ২ | Create Payment | `amount`, `currency: "BDT"`, `intent: "sale"`, `merchantInvoiceNumber`, `payerReference`, `callbackURL` পাঠান। উত্তরে `paymentID` আর একটা `bkashURL`। |
| ৩ | ইউজার bKash পেজে | ইউজার `bkashURL`-এ গিয়ে মোবাইল নম্বর, OTP, PIN দেয় (sandbox-এ ডকুমেন্টেশনে দেওয়া টেস্ট তথ্য)। |
| ৪ | Callback | bKash ইউজারকে `callbackURL`-এ ফেরত পাঠায় `paymentID` ও `status` (`success`, `failure`, `cancel`) সহ। |
| ৫ | Execute Payment | `status=success` হলে সার্ভার `paymentID` দিয়ে Execute কল করে। উত্তরে `transactionStatus: "Completed"` আর `trxID` এলে পেমেন্ট সম্পন্ন। |
| ৬ | Query Payment | Execute-এর উত্তর না এলে (টাইমআউট) বা সন্দেহ হলে Query দিয়ে চূড়ান্ত স্ট্যাটাস জানুন। |

রিফান্ডের জন্যও আলাদা API আছে, `paymentID` ও `trxID` লাগে।

গুরুত্বপূর্ণ পার্থক্য: Stripe-এ কার্ড কনফার্ম হলে পেমেন্ট সাধারণত হয়ে যায়। bKash-এ ইউজার অনুমোদন দেওয়ার পরও **Execute** না করলে টাকা কাটে না। Execute-এর আগে অ্যাপ ক্র্যাশ করলে বা Execute টাইমআউট হলে কী হয়, সেটা গুরুত্বপূর্ণ টেস্ট কেস।

```http
POST {{bkash_base_url}}/tokenized/checkout/execute
Content-Type: application/json
Accept: application/json
Authorization: {{id_token}}
X-App-Key: {{app_key}}

{
  "paymentID": "{{paymentID}}"
}
```

এখানে `{{...}}` হলো Postman-এর environment ভেরিয়েবল; base URL আর সঠিক path bKash-এর ডকুমেন্টেশন থেকে নিন। `app_secret`, `password` আর `id_token` গোপন রাখুন, collection শেয়ার করার আগে environment থেকে মুছে ফেলুন ([/lessons/postman-collections-environments/](/lessons/postman-collections-environments/))।

## Nagad সম্পর্কে সাধারণ ধারণা

Nagad-ও একটা MFS। মার্চেন্ট ইন্টিগ্রেশনের জন্য Nagad-এ **merchant onboarding** (ব্যবসা হিসেবে আবেদন ও যাচাই) করতে হয়, তারপর ইন্টিগ্রেশন ডকুমেন্ট ও sandbox অ্যাক্সেস দেওয়া হয়। ফ্লো ধারণাগতভাবে একই রকম: পেমেন্ট শুরু (initialize), ইউজারকে Nagad-এর পেজে পাঠানো, callback, আর সার্ভার থেকে যাচাই। Nagad-এর ইন্টিগ্রেশনে রিকোয়েস্ট এনক্রিপশন ও সিগনেচার (public/private key) ব্যবহারের কথা জানা যায়; সুনির্দিষ্ট খুঁটিনাটি অনবোর্ডিংয়ের সময় পাওয়া ডকুমেন্ট থেকে নিন।

অনেক মার্চেন্ট সরাসরি Nagad ইন্টিগ্রেশন না করে SSLCommerz-এর মতো aggregator-এর মাধ্যমে Nagad অপশন দেন। তখন আপনার টেস্টিং SSLCommerz-এর ফ্লো ধরেই হয়।

## Stripe-এর সাথে তুলনা

| Stripe ধারণা | SSLCommerz | bKash Tokenized |
|---|---|---|
| PaymentIntent / Checkout Session | Session (`sessionkey`) + আপনার `tran_id` | `paymentID` + আপনার `merchantInvoiceNumber` |
| পেমেন্ট পেজ | `GatewayPageURL` | `bkashURL` |
| `return_url` / success URL | `success_url`, `fail_url`, `cancel_url` | `callbackURL` (`status` প্যারামিটারসহ) |
| Webhook | IPN (`ipn_url`) | Callback; চূড়ান্ত নিশ্চয়তার জন্য Execute/Query-র ফল |
| Webhook signature যাচাই | Validation API (সাথে `verify_sign` হ্যাশ যাচাইয়ের ব্যবস্থাও থাকে) | Execute/Query-এর সার্ভার-টু-সার্ভার উত্তর |
| PaymentIntent retrieve | Validation API / Transaction Query | Query Payment |
| Idempotency-Key হেডার | ইউনিক `tran_id`, আর আপনার দিকে idempotent প্রসেসিং | ইউনিক `merchantInvoiceNumber`, একই `paymentID` দুবার execute না করা |
| `pi_...` / `ch_...` id | `val_id`, `bank_tran_id` | `paymentID`, `trxID` |
| amount পয়সায় (`125000`) | টাকায় দশমিক (`1250.00`) | টাকায় (`"1250"` বা `"1250.00"`, string) |
| Test mode key | sandbox store_id/passwd | sandbox app_key/secret, username/password |

Stripe-এর মতো স্পষ্ট `Idempotency-Key` হেডার এখানে সবসময় থাকে না। তাই আপনার নিজের অ্যাপকে ইউনিক লেনদেন id আর "আগেই প্রসেস হয়েছে কিনা" চেক দিয়ে idempotent হতে হবে ([/lessons/idempotency-testing/](/lessons/idempotency-testing/))।

## BDT, মোবাইল নম্বর আর সাধারণ লোকাল বাগ

### টাকার অংক

- Stripe: smallest unit, অর্থাৎ ১২৫০ টাকা = `125000`।
- SSLCommerz/bKash: সাধারণত টাকায় দশমিক, অর্থাৎ `1250.00`।
- একই কোডবেসে দুই ধরনের গেটওয়ে থাকলে কনভার্শন এক জায়গায় রাখুন এবং টেস্ট করুন: `0.50` টাকা, `1.00`, `9999.99`, ভগ্নাংশ (`1250.005`), ঋণাত্মক, শূন্য।
- Floating point সাবধানতা: JavaScript-এ `0.1 + 0.2` হুবহু `0.3` হয় না। হিসাব পয়সায় integer রেখে শুধু পাঠানোর সময় টাকায় রূপান্তর করা নিরাপদ।

### মোবাইল নম্বর ও OTP/PIN

- নম্বর ফরম্যাট: `01XXXXXXXXX` (১১ ডিজিট), `+8801XXXXXXXXX`, `8801...`: অ্যাপ কোনগুলো গ্রহণ করে আর গেটওয়েতে কোনটা পাঠায়?
- ভুল OTP, মেয়াদোত্তীর্ণ OTP, ভুল PIN কয়েকবার, অপর্যাপ্ত ব্যালেন্স: sandbox ডকুমেন্টেশনে যেসব টেস্ট পরিস্থিতি দেওয়া আছে, সেগুলোই ব্যবহার করুন।
- ইউজার bKash পেজে গিয়ে কিছু না করে ট্যাব বন্ধ করলে অর্ডারের কী হয়? কতক্ষণ পর "expired"?

### লোকাল ডেভেলপমেন্টের পরিচিত বাগ

| বাগ | কেন হয় | প্রতিকার |
|---|---|---|
| IPN কখনো আসে না | `ipn_url` = `http://localhost/...`, গেটওয়ে পৌঁছাতে পারে না | টানেল (ngrok, Cloudflare Tunnel ইত্যাদি) দিয়ে পাবলিক HTTPS URL: [/lessons/webhook-debug-tools/](/lessons/webhook-debug-tools/) |
| success_url-এ এসে ৪০৪ বা CSRF এরর | গেটওয়ে POST করে ফেরত পাঠায়, অ্যাপ শুধু GET আশা করে বা CSRF টোকেন চায় | রুট POST গ্রহণ করে কিনা, CSRF ছাড় সঠিকভাবে শুধু এই রুটে কিনা দেখুন |
| Callback URL http, সাইট https | মিক্সড কনটেন্ট, কুকি হারানো, গেটওয়ে প্রত্যাখ্যান | সব URL https, টানেলের URL ব্যবহার |
| টানেল URL বদলে গেছে | ফ্রি টানেল রিস্টার্টে নতুন URL | নতুন URL দিয়ে session তৈরি করুন |
| Double validation | IPN আর redirect দুটোই প্রসেস করে দুবার কনফার্ম | `tran_id` ধরে idempotent প্রসেসিং |
| Amount ১০০ গুণ ভুল | Stripe-এর পয়সার কোড SSLCommerz-এ কপি | কনভার্শন ফাংশন ও টেস্ট |
| bKash token মেয়াদোত্তীর্ণ | `id_token` রিফ্রেশ না করা | মেয়াদ শেষে refresh, ৪০১ সামলানো |

> [!TIP] লগে কী রাখবেন
> প্রতিটা ধাপে `tran_id`/`merchantInvoiceNumber`, `val_id`/`paymentID`, `trxID` লগ করুন, কিন্তু `store_passwd`, `app_secret`, `id_token`, গ্রাহকের PIN বা OTP কখনো নয়। পরে রিকনসিলিয়েশন ও ইনসিডেন্ট তদন্তে এই id-গুলোই কাজে লাগে ([/lessons/observability-incidents/](/lessons/observability-incidents/))।

## টেস্ট কেস টেবিল

| # | পরিস্থিতি | ধাপ | প্রত্যাশিত ফল |
|---|---|---|---|
| ১ | SSLCommerz সফল পেমেন্ট | sandbox-এ টেস্ট কার্ড/মেথড দিয়ে পেমেন্ট | Validation `VALID`, অর্ডার paid, একবারই কনফার্মেশন |
| ২ | ব্যর্থ পেমেন্ট | গেটওয়েতে fail বেছে নেওয়া | `fail_url`, অর্ডার failed, আবার চেষ্টা করার অপশন |
| ৩ | ইউজার cancel | গেটওয়ে পেজে cancel | `cancel_url`, অর্ডার cancelled/pending, টাকা কাটা নেই |
| ৪ | নকল success redirect | নিজের লোকাল অ্যাপে success_url-এ বানানো POST পাঠানো | Validation ব্যর্থ, অর্ডার paid হয় না |
| ৫ | Amount মিলছে না | Validation-এ ফেরত amount অর্ডারের চেয়ে কম (নিজের টেস্ট ডেটায়) | অর্ডার paid হয় না, সতর্কতা লগ |
| ৬ | IPN আগে, redirect পরে | ব্রাউজার ধীর করে দেখা | একবারই প্রসেস, দ্বিতীয়টি নিরাপদে উপেক্ষিত |
| ৭ | ইউজার ব্রাউজার বন্ধ করল | পেমেন্টের পর redirect-এর আগে ট্যাব বন্ধ | IPN দিয়ে অর্ডার paid |
| ৮ | একই tran_id দিয়ে আবার init | একই অর্ডারে দ্বিতীয়বার Pay | নতুন ইউনিক tran_id বা পুরোনো session, কোনো ডাবল চার্জ নয় |
| ৯ | bKash সফল | create → অনুমোদন → execute | `Completed`, `trxID` সেভ, অর্ডার paid |
| ১০ | bKash cancel/failure | bKash পেজে cancel | callback `status=cancel`, execute কল হয় না |
| ১১ | Execute টাইমআউট | execute-এর সময় নেটওয়ার্ক কেটে দেওয়া (লোকালে) | Query দিয়ে স্ট্যাটাস নিশ্চিত, ডাবল execute নয় |
| ১২ | Token মেয়াদোত্তীর্ণ | পুরোনো `id_token` দিয়ে create | refresh করে আবার চেষ্টা, ইউজারকে এরর নয় |

রিফান্ড ও আংশিক রিফান্ডের কেসও যোগ করুন, আর পুরো তালিকা নিজের test plan-এ রাখুন ([/lessons/payment-test-cases/](/lessons/payment-test-cases/))।

## হাতেকলমে অনুশীলন

1. [developer.sslcommerz.com](https://developer.sslcommerz.com) থেকে একটা sandbox store রেজিস্টার করুন। ইমেইলে আসা credentials একটা পাসওয়ার্ড ম্যানেজারে রাখুন।
2. Postman-এ একটা `SSLCommerz Sandbox` environment বানান: `store_id`, `store_passwd` (type: secret), `tunnel_url`।
3. ডকুমেন্টেশন দেখে session API-তে একটা POST রিকোয়েস্ট বানান (form-data বা x-www-form-urlencoded)। উত্তরের `GatewayPageURL` ব্রাউজারে খুলুন।
4. Sandbox পেজে টেস্ট পেমেন্ট সম্পন্ন করুন (টেস্ট তথ্য ডকুমেন্টেশনে)। redirect-এর URL ও POST ডেটা Browser DevTools-এর Network ট্যাবে দেখুন।
5. প্রাপ্ত `val_id` দিয়ে Validation API কল করুন। `status`, `amount`, `currency`, `tran_id` নোট করুন।
6. একটা টানেল চালিয়ে IPN-এর জন্য webhook.site বা নিজের লোকাল সার্ভার ব্যবহার করে দেখুন IPN-এ কী আসে ([/lessons/webhook-debug-tools/](/lessons/webhook-debug-tools/))।
7. উপরের টেস্ট কেস টেবিল থেকে অন্তত ৫টা চালান এবং ফলাফল লিখুন।
8. bKash sandbox অ্যাক্সেস পেলে Grant Token → Create → Execute → Query একটা Postman collection-এ সাজান; Tests ট্যাবে `paymentID` ও `id_token` environment-এ সেভ করুন।

> [!MISTAKE] সাধারণ ভুল
> - success_url-এ এসেই অর্ডার paid করা, Validation API বাদ দেওয়া।
> - Validation-এর উত্তরে শুধু `status` দেখা, `amount` ও `tran_id` না মেলানো।
> - `ipn_url`-এ localhost দেওয়া, তারপর "IPN কাজ করে না" বলে বাগ খোলা।
> - bKash-এ callback-এ success দেখে execute না করা, বা দুবার execute করা।
> - টাকা আর পয়সা গুলিয়ে ফেলা।
> - `store_passwd`, `app_secret` ফ্রন্টএন্ডে, Postman collection-এ বা GitHub-এ রেখে দেওয়া।
> - টেস্ট নম্বর/OTP অনুমান করে বানানো; সবসময় sandbox ডকুমেন্টেশন থেকে নিন।

## সারসংক্ষেপ

- SSLCommerz: init → GatewayPageURL → success/fail/cancel → IPN → Validation API; redirect নয়, validation-ই সত্য।
- bKash Tokenized: grant token → create → (ইউজার অনুমোদন) → callback → execute → query; execute ছাড়া পেমেন্ট সম্পূর্ণ নয়।
- Nagad-এ merchant onboarding লাগে; ফ্লো ধারণাগতভাবে একই, খুঁটিনাটি তাদের ডকুমেন্টে।
- Stripe-এর PaymentIntent, webhook, idempotency-র সমতুল্য এখানে session/paymentID, IPN/callback, ইউনিক tran_id।
- অংক টাকায় দশমিক, মোবাইল নম্বর/OTP/PIN ফ্লো, আর লোকালে টানেল: এগুলোই সবচেয়ে বেশি বাগের জায়গা।

## বাড়ির কাজ

1. Stripe vs SSLCommerz vs bKash তুলনা টেবিলটা নিজের ভাষায় একটা পেজে লিখুন, সাথে প্রতিটার একটা "সবচেয়ে বিপজ্জনক ভুল"।
2. একটা Daraz-এর মতো শপের জন্য SSLCommerz IPN-এর ৫টা টেস্ট কেস লিখুন (সফল, ডুপ্লিকেট IPN, IPN আগে redirect পরে, ভুল amount, IPN কখনো আসেনি)।

<details><summary>সমাধান দেখুন</summary>

"IPN কখনো আসেনি" কেসের প্রত্যাশিত ফল: অর্ডার প্রথমে redirect-এর পর validation দিয়ে paid হতে পারে; আর redirect-ও না এলে একটা নির্দিষ্ট সময় পর ব্যাকগ্রাউন্ড জব `tran_id` দিয়ে SSLCommerz-এর transaction query API কল করে স্ট্যাটাস নিশ্চিত করবে। কোনো অবস্থাতেই অর্ডার চিরকাল "pending" থাকবে না, আর দৈনিক রিকনসিলিয়েশন এমন অর্ডার ধরবে ([/lessons/reconciliation-testing/](/lessons/reconciliation-testing/))।

</details>
