---
order: 12
level: 2
week: 5
title: "Stripe API সরাসরি টেস্ট: Customer, PaymentIntent ও Refund"
description: "Postman আর curl দিয়ে Stripe Sandbox-এর API সরাসরি টেস্ট করুন: Bearer অথেনটিকেশন, form-encoded বডি, PaymentIntent, Refund, Pagination আর এরর রেসপন্স পড়া।"
keywords: ["stripe api", "bearer", "curl", "postman", "paymentintent", "customer", "refund", "pagination", "starting_after", "card_error", "decline_code", "request-id", "402", "রিফান্ড", "পেমেন্ট এপিআই টেস্ট", "স্ট্রাইপ"]
minutes: 60
quiz:
  - q: "আপনি Postman-এ POST /v1/payment_intents পাঠালেন, বডি দিলেন raw JSON হিসেবে। Stripe ৪০০ এরর দিল, বলছে amount নেই। সবচেয়ে সম্ভাব্য কারণ কী?"
    options: ["amount অবশ্যই string হতে হবে", "Stripe-এর v1 API বডি নেয় application/x-www-form-urlencoded হিসেবে, JSON নয়", "Test Mode-এ PaymentIntent বানানো যায় না", "Authorization হেডার ভুল হলে এই এরর আসে"]
    answer: 1
    explain: "Stripe v1 API রিকোয়েস্ট বডি form-encoded হিসেবে পড়ে। JSON পাঠালে ফিল্ডগুলো পড়া হয় না, তাই amount 'missing' দেখায়। কী ভুল হলে আসত ৪০১, ৪০০ নয়।"
  - q: "ডলারে ১৫ ডলার ৫০ সেন্টের পেমেন্ট টেস্ট করতে amount কত পাঠাবেন?"
    options: ["15.50", "15", "1550", "155"]
    answer: 2
    explain: "Stripe amount নেয় মুদ্রার সবচেয়ে ছোট এককে। USD-র ক্ষেত্রে সেন্ট, তাই ১৫.৫০ ডলার = 1550। দশমিক পাঠালে invalid_request_error আসবে।"
  - q: "pm_card_chargeDeclined দিয়ে confirm=true করলে কোন রেসপন্স আশা করা উচিত?"
    options: ["HTTP 402, error.type = card_error, code = card_declined", "HTTP 200, status = succeeded", "HTTP 401, authentication error", "HTTP 500, api_error"]
    answer: 0
    explain: "কার্ড ডিক্লাইন হলে Stripe ৪০২ দেয়, type হয় card_error এবং code card_declined। এটা সিস্টেমের ভুল নয়, তাই ৫০০ নয়; আর কী ঠিক থাকায় ৪০১ নয়।"
  - q: "GET /v1/customers?limit=3 এর রেসপন্সে has_more: true এসেছে, শেষ আইটেমের id cus_C। পরের পেজ আনতে কী পাঠাবেন?"
    options: ["page=2", "offset=3", "limit=6", "starting_after=cus_C"]
    answer: 3
    explain: "Stripe cursor-based pagination ব্যবহার করে। আগের পেজের শেষ অবজেক্টের id starting_after-এ দিলে পরের পেজ আসে। page বা offset প্যারামিটার Stripe-এ নেই।"
  - q: "একটা রিফান্ড টেস্টে অদ্ভুত এরর এসেছে। Stripe সাপোর্ট বা ডেভেলপারকে বাগ রিপোর্টে সবচেয়ে কাজের তথ্য কোনটা?"
    options: ["শুধু স্ক্রিনশট", "আপনার sk_test কী", "রেসপন্সের Request-Id হেডার (req_...) আর পুরো error অবজেক্ট", "ব্রাউজারের নাম"]
    answer: 2
    explain: "Request-Id দিয়ে Dashboard-এর লগে ঠিক ওই রিকোয়েস্টটা খুঁজে পাওয়া যায়। error-এর type, code, param, message মিলিয়ে কারণ বোঝা সহজ হয়। Secret key কখনো বাগ রিপোর্টে দেবেন না।"
---

এতদিন আমরা Stripe-কে দেখেছি মূলত চেকআউট পেজ আর Dashboard দিয়ে। কিন্তু একজন QA হিসেবে আসল শক্তি আসে যখন আপনি **API সরাসরি** কল করে দেখতে পারেন ভেতরে কী হচ্ছে।

এই লেসনে আমরা Postman আর curl দিয়ে Stripe Sandbox-এ Customer বানাব, পেমেন্ট নেব, লিস্ট আনব, রিফান্ড করব আর এরর রেসপন্স পড়তে শিখব।

## এই লেসনে যা শিখবেন

- Stripe API-তে অথেনটিকেশন কীভাবে কাজ করে (`Authorization: Bearer sk_test_…`)
- কেন Stripe-এর বডি JSON নয়, বরং **form-encoded**, আর nested প্যারামিটার কীভাবে লেখে
- Customer, PaymentIntent বানানো, retrieve আর list করা
- Pagination (`limit`, `starting_after`, `has_more`)
- পুরো আর আংশিক Refund
- এরর রেসপন্সের গঠন আর Status Code-গুলোর মানে
- এই সব থেকে বাস্তব টেস্ট কেস বানানো

> [!LIVE]
> এই লেসনের প্রতিটা কল শুধু **Test Mode / Sandbox** কী (`sk_test_…`) দিয়ে করবেন। ভুল করেও `sk_live_` কী Postman-এ রাখবেন না। Live কী দিয়ে চালালে সত্যিকারের টাকা কাটবে।

## অথেনটিকেশন আর রিকোয়েস্টের গঠন

Stripe API-র বেস URL হলো `https://api.stripe.com`। প্রতিটা রিকোয়েস্টে আপনার Secret Key পাঠাতে হয়। একে বলে **Bearer Authentication** (হেডারে টোকেন দেখিয়ে "আমি অনুমতিপ্রাপ্ত" প্রমাণ করা)।

```http
GET /v1/customers HTTP/1.1
Host: api.stripe.com
Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX
```

curl-এ দুইভাবে কী দেওয়া যায়। দুটোই একই কাজ করে:

```bash
# উপায় ১: Bearer হেডার
curl https://api.stripe.com/v1/customers \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX"

# উপায় ২: Basic auth, কী হলো ইউজারনেম, পাসওয়ার্ড ফাঁকা (শেষে কোলন খেয়াল করুন)
curl https://api.stripe.com/v1/customers \
  -u sk_test_XXXXXXXXXXXXXXXX:
```

Postman-এ সবচেয়ে সহজ উপায়: Collection-এর **Authorization** ট্যাবে Type = Bearer Token দিন, আর টোকেন হিসেবে `{{stripe_secret_key}}` ভেরিয়েবল ব্যবহার করুন। Environment কীভাবে বানাতে হয় তা [Postman Collection ও Environment](/lessons/postman-collections-environments/) লেসনে দেখেছেন।

> [!TIP] কী লুকিয়ে রাখুন
> Postman Environment-এ ভেরিয়েবলের টাইপ **secret** করে দিন, আর Collection শেয়ার বা এক্সপোর্ট করার আগে দেখে নিন কী-টা কোথাও হার্ড-কোড করা নেই।

### Form-encoded বডি: Stripe-এর বিশেষত্ব

বেশিরভাগ আধুনিক API JSON বডি নেয়। কিন্তু Stripe-এর v1 API নেয় `application/x-www-form-urlencoded` (HTML ফর্মের মতো `key=value&key2=value2` ফরম্যাট)। রেসপন্স অবশ্য JSON-এই আসে।

Postman-এ Body ট্যাবে **x-www-form-urlencoded** বেছে নিন। raw JSON দিলে Stripe ফিল্ডগুলো পড়তেই পারবে না।

Nested ডেটা (অবজেক্টের ভেতরে অবজেক্ট) পাঠাতে বর্গাকার বন্ধনী ব্যবহার হয়:

| যা পাঠাতে চান | form-encoded কী | মান |
|---|---|---|
| metadata.order_id | `metadata[order_id]` | `DRZ-1042` |
| metadata.source | `metadata[source]` | `mobile_app` |
| একটা লিস্টের প্রথম আইটেম | `payment_method_types[]` | `card` |
| নেস্টেড অবজেক্ট | `automatic_payment_methods[enabled]` | `true` |

curl-এ `-d` দিলে curl নিজেই form-encoded বডি আর POST মেথড বসিয়ে দেয়।

## Customer আর PaymentIntent বানানো

ধরুন আপনি একটা Daraz-এর মতো অনলাইন শপের QA। একজন নতুন ক্রেতা অর্ডার দিচ্ছে। Stripe-এর ভাষায় প্রথমে একটা **Customer** (ক্রেতার রেকর্ড), তারপর একটা **PaymentIntent** (একটা নির্দিষ্ট পেমেন্টের "ইচ্ছা" ও তার পুরো জীবনচক্র)।

### ধাপ ১: Customer তৈরি

```bash
curl https://api.stripe.com/v1/customers \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d name="Test Customer Rahim" \
  -d email="rahim.test@example.com" \
  -d "metadata[shop_user_id]=U-778"
```

রেসপন্সের মূল অংশ:

```json
{
  "id": "cus_TEST123abc",
  "object": "customer",
  "name": "Test Customer Rahim",
  "email": "rahim.test@example.com",
  "livemode": false,
  "metadata": { "shop_user_id": "U-778" }
}
```

খেয়াল করুন `livemode: false`। প্রতিটা টেস্টে এটা চেক করা অভ্যাস করুন। টেস্টে কখনো আসল মানুষের ইমেইল দেবেন না, `example.com` ডোমেইন ব্যবহার করুন।

### ধাপ ২: PaymentIntent তৈরি ও confirm

**amount** সবসময় মুদ্রার **সবচেয়ে ছোট এককে** দিতে হয়। USD হলে সেন্ট: ২০ ডলার = `2000`। দশমিক (`20.00`) দিলে এরর আসবে। কিছু মুদ্রা "zero-decimal" (যেমন JPY), সেখানে ছোট একক নেই, তাই এটাও একটা ভালো এজ কেস।

```bash
curl https://api.stripe.com/v1/payment_intents \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d amount=2000 \
  -d currency=usd \
  -d customer=cus_TEST123abc \
  -d payment_method=pm_card_visa \
  -d confirm=true \
  -d "automatic_payment_methods[enabled]=true" \
  -d "automatic_payment_methods[allow_redirects]=never" \
  -d "metadata[order_id]=DRZ-1042"
```

এখানে `pm_card_visa` হলো Stripe-এর একটা **টেস্ট PaymentMethod** (৪২৪২ কার্ডের সমতুল্য রেডিমেড টোকেন)। `confirm=true` মানে বানানোর সাথে সাথেই পেমেন্ট চেষ্টা করো।

> [!NOTE] allow_redirects কেন?
> নতুন API ভার্সনে PaymentIntent ডিফল্টভাবে Dashboard-এ চালু থাকা সব পেমেন্ট মেথড গ্রহণ করে। কিছু মেথড গ্রাহককে অন্য পেজে পাঠায়, তাই সার্ভার থেকে সরাসরি confirm করলে Stripe `return_url` চাইতে পারে। `allow_redirects=never` দিলে শুধু রিডাইরেক্ট-ছাড়া মেথড চলে। বিকল্প হিসেবে `payment_method_types[]=card` দিতে পারেন।

সফল হলে রেসপন্সে:

```json
{
  "id": "pi_TEST3Nabc",
  "object": "payment_intent",
  "amount": 2000,
  "amount_received": 2000,
  "currency": "usd",
  "status": "succeeded",
  "latest_charge": "ch_TEST3Nxyz",
  "metadata": { "order_id": "DRZ-1042" }
}
```

QA হিসেবে চেক করবেন: Status Code `200`, `status` = `succeeded`, `amount_received` = `amount`, আর `metadata` ঠিকঠাক ফিরে এসেছে।

### ধাপ ৩: Retrieve

একটা নির্দিষ্ট অবজেক্ট আনতে GET আর id:

```bash
curl https://api.stripe.com/v1/payment_intents/pi_TEST3Nabc \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX"
```

এটা খুব কাজের যখন আপনার অ্যাপ বলছে "পেমেন্ট সফল", আর আপনি Stripe-এর দিক থেকে যাচাই করতে চান আসলেই সফল কি না।

## List আর Pagination

একসাথে অনেক অবজেক্ট আনতে list এন্ডপয়েন্ট। Stripe একবারে সব দেয় না, পেজে পেজে দেয়। একে বলে **Pagination** (বড় তালিকা ছোট ছোট পাতায় ভাগ করা)।

```bash
curl -G https://api.stripe.com/v1/customers \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d limit=3
```

`-G` দিলে curl `-d` ডেটাকে URL-এর query string বানিয়ে GET পাঠায়। রেসপন্স:

```json
{
  "object": "list",
  "url": "/v1/customers",
  "has_more": true,
  "data": [
    { "id": "cus_A", "object": "customer" },
    { "id": "cus_B", "object": "customer" },
    { "id": "cus_C", "object": "customer" }
  ]
}
```

Stripe **cursor-based** pagination ব্যবহার করে। পরের পেজ পেতে আগের পেজের শেষ id দিন:

```bash
curl -G https://api.stripe.com/v1/customers \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d limit=3 \
  -d starting_after=cus_C
```

| প্যারামিটার | কাজ | টেস্ট আইডিয়া |
|---|---|---|
| `limit` | এক পেজে কয়টা (১ থেকে ১০০, ডিফল্ট ১০) | `limit=0` বা `limit=101` দিলে কী হয়? |
| `starting_after` | এই id-র পরের অবজেক্ট থেকে শুরু | ভুল বা অস্তিত্বহীন id দিলে কোন এরর? |
| `ending_before` | এই id-র আগের অবজেক্ট (উল্টো দিকে) | `starting_after` আর `ending_before` একসাথে দিলে? |
| `has_more` | আরও ডেটা আছে কি না | শেষ পেজে `false` আসে কি না |

> [!TIP]
> আপনার নিজের অ্যাপে "সব অর্ডার" দেখানোর ফিচার থাকলে চেক করুন ডেভেলপার `has_more` ধরে লুপ করেছে কি না। অনেক সময় শুধু প্রথম ১০টা দেখিয়ে বাকিগুলো হারিয়ে যায়। এটা একটা ক্লাসিক বাগ।

## Refund: পুরো আর আংশিক

ধরুন একটা কোর্স-বিক্রির সাইটে কেউ ২০ ডলারের কোর্স কিনে ৫ ডলারের একটা বোনাস মডিউল ফেরত চাইছে। আংশিক রিফান্ড:

```bash
curl https://api.stripe.com/v1/refunds \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d payment_intent=pi_TEST3Nabc \
  -d amount=500 \
  -d reason=requested_by_customer
```

`amount` না দিলে পুরো বাকি টাকা রিফান্ড হয়। রেসপন্সে `object: "refund"`, `status` (সাধারণত `succeeded`, কখনো `pending`), আর `amount: 500`।

রিফান্ডের পর PaymentIntent-এর `latest_charge` retrieve করলে Charge অবজেক্টে `amount_refunded` আর `refunded` (পুরো ফেরত হলে `true`) দেখতে পাবেন।

রিফান্ডের গুরুত্বপূর্ণ টেস্ট কেস:

1. পুরো রিফান্ড, তারপর আবার রিফান্ডের চেষ্টা (এরর আশা করি)
2. ৫০০ + ৫০০ + ১০০০ মিলিয়ে ধাপে ধাপে পুরো টাকা রিফান্ড
3. মূল অ্যামাউন্টের চেয়ে বেশি রিফান্ড চাওয়া (`amount=2500`) — invalid_request_error আশা করি
4. ব্যর্থ বা অসম্পূর্ণ PaymentIntent-এর রিফান্ড চাওয়া
5. `amount=0` বা ঋণাত্মক মান

## এরর রেসপন্স পড়তে শিখুন

ভালো QA শুধু সফল রেসপন্স দেখে না, এরর রেসপন্সও যত্ন করে পড়ে। Stripe-এর এরর সবসময় একটা `error` অবজেক্টে আসে।

একটা ডিক্লাইন কার্ড দিয়ে চেষ্টা করুন:

```bash
curl https://api.stripe.com/v1/payment_intents \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX" \
  -d amount=2000 \
  -d currency=usd \
  -d payment_method=pm_card_chargeDeclined \
  -d confirm=true \
  -d "automatic_payment_methods[enabled]=true" \
  -d "automatic_payment_methods[allow_redirects]=never"
```

রেসপন্স (সংক্ষেপে), Status Code `402`:

```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "decline_code": "generic_decline",
    "message": "Your card was declined.",
    "payment_intent": { "id": "pi_TEST...", "status": "requires_payment_method" }
  }
}
```

### error অবজেক্টের ফিল্ড

| ফিল্ড | মানে |
|---|---|
| `type` | এররের বড় শ্রেণি (নিচের টেবিল) |
| `code` | নির্দিষ্ট কারণ, যেমন `card_declined`, `parameter_missing`, `resource_missing` |
| `decline_code` | কার্ড ডিক্লাইনের ব্যাংক-পর্যায়ের কারণ, যেমন `insufficient_funds`, `lost_card` |
| `param` | কোন প্যারামিটারে সমস্যা, যেমন `amount` |
| `message` | মানুষের পড়ার মতো ব্যাখ্যা |

### error type

| type | কখন আসে |
|---|---|
| `card_error` | কার্ড ডিক্লাইন, ভুল CVC, মেয়াদোত্তীর্ণ কার্ড। সবচেয়ে সাধারণ। |
| `invalid_request_error` | ভুল বা অনুপস্থিত প্যারামিটার, অস্তিত্বহীন id, ভুল কী |
| `api_error` | Stripe-এর দিকে সমস্যা (বিরল) |
| `idempotency_error` | একই Idempotency Key ভিন্ন প্যারামিটারে (পরের লেসন) |
| authentication error | ভুল বা বাতিল কী। HTTP ৪০১; SDK-তে `AuthenticationError` নামে ধরা হয়, কাঁচা JSON-এ type সাধারণত `invalid_request_error` আর message "Invalid API Key provided" |

### Status Code

| Code | মানে | কীভাবে ঘটাবেন (Sandbox-এ) |
|---|---|---|
| 200 | সফল | স্বাভাবিক কল |
| 400 | Bad Request: প্যারামিটার ভুল | `amount` বাদ দিন বা `amount=20.5` দিন |
| 401 | Unauthorized: কী ভুল | কী-এর শেষ অক্ষর বদলে দিন |
| 402 | Request Failed: প্যারামিটার ঠিক, কিন্তু পেমেন্ট ব্যর্থ | `pm_card_chargeDeclined` |
| 404 | Not Found | `pi_doesnotexist` retrieve করুন |
| 429 | Too Many Requests: রেট লিমিট | ইচ্ছা করে ঘটাবেন না; কোডে retry-with-backoff আছে কি না রিভিউ করুন |
| 5xx | Stripe-এর সার্ভার সমস্যা | ঘটানো যায় না; অ্যাপ কীভাবে সামলায় তা mock দিয়ে টেস্ট করুন |

> [!DANGER] রেট লিমিট নিয়ে খেলবেন না
> ৪২৯ দেখার জন্য লুপ চালিয়ে Stripe-এ হাজার হাজার রিকোয়েস্ট পাঠাবেন না। Sandbox-এরও রেট লিমিট আছে, আর এটা Stripe-এর নীতির বিরুদ্ধে। অ্যাপের ৪২৯ হ্যান্ডলিং mock সার্ভার দিয়ে টেস্ট করুন।

### Request-Id হেডার

প্রতিটা রেসপন্সে একটা `Request-Id` হেডার থাকে, যেমন `req_TEST8xYz`। curl-এ দেখতে `-i` দিন:

```bash
curl -i https://api.stripe.com/v1/payment_intents/pi_doesnotexist \
  -H "Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX"
```

```text
HTTP/2 404
content-type: application/json
request-id: req_TEST8xYz
...
```

Dashboard-এর **Workbench / Logs** অংশে এই id দিয়ে খুঁজলে পুরো রিকোয়েস্ট-রেসপন্স পাবেন। বাগ রিপোর্টে ([পেমেন্ট বাগ রিপোর্ট](/lessons/payment-bug-reports/)) সবসময় Request-Id দিন, কিন্তু কখনো Secret Key নয়।

## হাতেকলমে অনুশীলন

Postman-এ একটা নতুন Collection বানান: **Stripe API Practice**।

1. Environment-এ `base_url = https://api.stripe.com` আর `stripe_secret_key` (টাইপ secret) রাখুন।
2. Collection-এর Authorization ট্যাবে Bearer Token = `{{stripe_secret_key}}`।
3. রিকোয়েস্ট **Create Customer**: POST `{{base_url}}/v1/customers`, Body x-www-form-urlencoded-এ `name`, `email`, `metadata[shop_user_id]`। Tests-এ `customer_id` সেভ করুন:

```js
pm.test("Status 200", () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.test("Test mode", () => pm.expect(body.livemode).to.eql(false));
pm.collectionVariables.set("customer_id", body.id);
```

4. রিকোয়েস্ট **Create PaymentIntent**: `customer={{customer_id}}`, `payment_method=pm_card_visa`, `confirm=true` ইত্যাদি। Tests-এ `status === "succeeded"` চেক আর `pi_id` সেভ।
5. রিকোয়েস্ট **Retrieve PaymentIntent**: GET `{{base_url}}/v1/payment_intents/{{pi_id}}`।
6. রিকোয়েস্ট **Partial Refund**: `payment_intent={{pi_id}}`, `amount=500`। চেক করুন রেসপন্সের `amount` ৫০০।
7. রিকোয়েস্ট **Declined Payment**: `pm_card_chargeDeclined` দিয়ে। Tests-এ চেক করুন Status ৪০২ আর `error.code === "card_declined"`।
8. রিকোয়েস্ট **List Customers**: `limit=2`, তারপর `starting_after` দিয়ে দ্বিতীয় পেজ।
9. পুরো Collection Runner-এ চালান, তারপর [Newman](/lessons/newman-cli-reports/) দিয়েও চালিয়ে দেখুন।

স্ক্রিনশট বর্ণনা: Postman-এর Body ট্যাবে x-www-form-urlencoded রেডিও বাটন সিলেক্ট করা, নিচে Key কলামে `amount`, `currency`, `metadata[order_id]` আর Value কলামে `2000`, `usd`, `DRZ-1042`।

> [!CHECK] সফলতার চেকলিস্ট
> - সব সফল রিকোয়েস্টে `livemode: false`
> - ডিক্লাইন রিকোয়েস্টে ৪০২ আর `card_error`
> - রিফান্ডের পর Charge-এ `amount_refunded` = ৫০০
> - দ্বিতীয় পেজের প্রথম Customer প্রথম পেজের কোনোটার সাথে মেলে না

## টেস্ট কেস আইডিয়া

| # | সিনারিও | প্রত্যাশিত ফল |
|---|---|---|
| ১ | `pm_card_visa`, confirm=true | 200, `succeeded` |
| ২ | `amount` বাদ | 400, `parameter_missing`, `param: amount` |
| ৩ | `amount=-100` | 400, invalid_request_error |
| ৪ | `currency=xyz` | 400, invalid_request_error |
| ৫ | `pm_card_chargeDeclinedInsufficientFunds` | 402, `decline_code: insufficient_funds` |
| ৬ | ভুল Secret Key | 401 |
| ৭ | অস্তিত্বহীন PaymentIntent retrieve | 404, `resource_missing` |
| ৮ | আংশিক রিফান্ড ২ বার, যোগফল মূলের সমান | দুটোই সফল, Charge `refunded: true` |
| ৯ | মূলের চেয়ে বেশি রিফান্ড | 400 এরর |
| ১০ | metadata-তে ৫০টির বেশি কী | 400 এরর (Stripe metadata-র সীমা) |
| ১১ | Publishable Key (`pk_test_`) দিয়ে Customer তৈরি | এরর: এই কাজে Secret Key লাগে |

আরও টেস্ট কার্ড পাবেন [Stripe টেস্ট কার্ড](/lessons/stripe-test-cards/) লেসনে আর Stripe-এর অফিসিয়াল টেস্টিং ডক https://docs.stripe.com/testing পাতায়। API রেফারেন্স: https://docs.stripe.com/api

> [!MISTAKE] সাধারণ ভুল
> - Postman-এ raw JSON বডি পাঠানো। Stripe v1 শুধু form-encoded বোঝে।
> - `amount=20.00` লেখা। সবসময় ছোট এককে পূর্ণসংখ্যা: `2000`।
> - Basic auth-এ কী-এর শেষে কোলন (`:`) ভুলে যাওয়া, তখন curl পাসওয়ার্ড চায়।
> - ৪০২-কে "সার্ভার বাগ" ভেবে রিপোর্ট করা। ৪০২ মানে ডিক্লাইন, এটা প্রত্যাশিত আচরণ হতে পারে।
> - Collection এক্সপোর্ট করে GitHub-এ দেওয়ার সময় Secret Key সহ দিয়ে দেওয়া।

## সারসংক্ষেপ

- Stripe API-তে `Authorization: Bearer sk_test_…` লাগে; শুধু Test Mode কী ব্যবহার করুন।
- v1 API-র বডি form-encoded; nested ফিল্ড `metadata[order_id]` স্টাইলে লেখা হয়।
- amount সবসময় মুদ্রার ছোট এককে, পূর্ণসংখ্যায়।
- List এন্ডপয়েন্টে `limit`, `starting_after` আর `has_more` দিয়ে পেজ চলে।
- এরর পড়ুন `type`, `code`, `decline_code`, `param`, `message` দেখে; Status Code ৪০০/৪০১/৪০২/৪০৪/৪২৯-এর পার্থক্য বুঝুন।
- বাগ রিপোর্টে `Request-Id` দিন, কী কখনো নয়।

## বাড়ির কাজ

1. উপরের ১১টা টেস্ট কেসের অন্তত ৮টা Postman-এ চালিয়ে একটা ছোট টেবিলে আসল ফল লিখুন।
2. ৫টা Customer বানিয়ে `limit=2` দিয়ে পুরো লিস্ট ৩ পেজে আনুন। কোন পেজে `has_more: false` এল?
3. একটা ব্যর্থ রিকোয়েস্টের Request-Id দিয়ে Dashboard-এর লগে সেটা খুঁজে বের করুন।

<details><summary>সমাধান দেখুন</summary>

কাজ ২-এ ৫টা Customer আর `limit=2` হলে পেজ হবে ২ + ২ + ১। তৃতীয় পেজে `has_more: false` আসবে। মনে রাখবেন, Sandbox-এ আগে থেকে অন্য Customer থাকলে সংখ্যা বেশি হতে পারে; তখন `email` দিয়ে ফিল্টার করতে `-d email=...` দিয়ে list করে দেখুন।

</details>

পরের লেসনে দেখব একই রিকোয়েস্ট দুবার চলে গেলে কী হয়, আর কীভাবে **Idempotency** টাকা দুবার কাটা আটকায়: [Idempotency টেস্টিং](/lessons/idempotency-testing/)।
