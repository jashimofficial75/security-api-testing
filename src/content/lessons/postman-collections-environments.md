---
order: 9
level: 2
week: 4
title: "Postman Collection, Environment ও ভ্যারিয়েবল: গোছানো API টেস্টিং"
description: "Postman-এ Collection, ফোল্ডার, Environment, ভ্যারিয়েবলের Scope, Pre-request Script ও রিকোয়েস্ট চেইনিং শিখুন; Stripe Test Mode-এ নিরাপদে secret কী ব্যবহারসহ।"
keywords: ["postman", "collection", "environment", "variables", "scope", "pre-request script", "baseUrl", "idempotency key", "chaining", "stripe api", "secret variable", "পোস্টম্যান", "এনভায়রনমেন্ট", "ভ্যারিয়েবল"]
minutes: 55
quiz:
  - q: "একই নামের ভ্যারিয়েবল baseUrl Collection-এ http://a.test আর সক্রিয় Environment-এ http://b.test সেট করা। রিকোয়েস্টে {{baseUrl}} কোনটি হবে?"
    options: ["http://a.test, কারণ Collection আগে তৈরি", "এরর দেবে", "দুটো জোড়া লাগবে", "http://b.test, কারণ Environment-এর Scope Collection-এর চেয়ে সংকীর্ণ এবং অগ্রাধিকার বেশি"]
    answer: 3
    explain: "Postman-এ সংকীর্ণ Scope জেতে: Local > Data > Environment > Collection > Global। তাই সক্রিয় Environment-এর মান ব্যবহার হবে।"
  - q: "টিমমেটকে Environment পাঠাতে হবে, যেখানে stripeSecretKey আছে। সবচেয়ে নিরাপদ উপায় কোনটি?"
    options: ["Export করে ইমেইলে পাঠানো", "Environment-এ কী-এর Initial/Shared value খালি রাখা, শুধু নিজের Current value-তে রাখা; টিমমেট নিজের কী নিজে বসাবে", "কী-টা Collection-এর Description-এ লিখে দেওয়া", "GitHub-এ পাবলিক রিপোতে রাখা"]
    answer: 1
    explain: "Export করা বা শেয়ার করা মান অন্যরা দেখতে পায়। কী শুধু লোকাল Current value-তে থাকলে শেয়ার হয় না, আর প্রত্যেকে নিজের Sandbox কী ব্যবহার করে।"
  - q: "Create Customer রিকোয়েস্টের রেসপন্স থেকে id পরের রিকোয়েস্টে ব্যবহার করতে চান। Post-response (Tests) স্ক্রিপ্টে কী লিখবেন?"
    options: ["pm.environment.set('customerId', pm.response.json().id)", "console.log(id)", "pm.request.url = id", "কিছুই না, Postman নিজে মনে রাখে"]
    answer: 0
    explain: "রেসপন্স JSON থেকে id নিয়ে ভ্যারিয়েবলে রাখলে পরের রিকোয়েস্টে {{customerId}} দিয়ে ব্যবহার করা যায়। একেই চেইনিং বলে।"
  - q: "প্রতিবার রিকোয়েস্ট পাঠালে নতুন Idempotency-Key দরকার। কোন Pre-request কোড সঠিক?"
    options: ["pm.environment.set('idemKey', 'abc123')", "pm.response.json().key", "pm.variables.set('idemKey', pm.variables.replaceIn('{{$guid}}'))", "pm.test('key', () => {})"]
    answer: 2
    explain: "{{$guid}} প্রতিবার নতুন UUID দেয়, আর replaceIn সেটাকে আসল মানে বদলায়। স্থির 'abc123' দিলে সব রিকোয়েস্ট একই কী পাবে, যা আলাদা পেমেন্টের জন্য ভুল।"
  - q: "local ও test দুটি Environment আছে। একই Collection দুই জায়গায় চালাতে কী বদলাবেন?"
    options: ["শুধু ওপরের ডানদিকে সক্রিয় Environment বদলাবেন, কারণ URL-এ {{baseUrl}} আছে", "প্রতিটি রিকোয়েস্টের URL হাতে বদলাবেন", "নতুন Collection বানাবেন", "Postman আবার ইনস্টল করবেন"]
    answer: 0
    explain: "URL-এ {{baseUrl}} রাখলে Environment বদলালেই সব রিকোয়েস্ট নতুন ঠিকানায় যায়। এটাই Environment-এর মূল সুবিধা।"
---

প্রথম API কল পাঠানো সহজ। কিন্তু ৫০টি রিকোয়েস্ট, তিনটি সার্ভার আর একটি গোপন কী নিয়ে কাজ করতে গেলে গোছানো না থাকলে সব জট পাকিয়ে যায়। এই লেসনে Postman-এর গোছানোর হাতিয়ারগুলো শিখব।

আগে [Postman দিয়ে প্রথম API কল](/lessons/postman-first-api-call/) লেসনটি শেষ করে আসুন।

## এই লেসনে যা শিখবেন

- Collection ও ফোল্ডার দিয়ে রিকোয়েস্ট সাজানো
- Environment (local, test) বানানো আর `{{baseUrl}}` ব্যবহার
- ভ্যারিয়েবলের পাঁচ রকম Scope ও কোনটা জেতে
- secret টাইপ ভ্যারিয়েবল আর কী কখনো শেয়ার না করার নিয়ম
- Pre-request Script: টাইমস্ট্যাম্প, র‍্যান্ডম ইমেইল, Idempotency-Key
- রিকোয়েস্ট চেইনিং: একটির রেসপন্সের `id` পরেরটিতে
- Stripe Test Mode-এ Bearer auth দিয়ে পুরো একটি চেইন

## Collection ও ফোল্ডার

Collection (একসাথে রাখা সম্পর্কিত রিকোয়েস্টের সংগ্রহ) হলো Postman-এর প্রজেক্ট ফোল্ডার। এর ভেতরে ফোল্ডার দিয়ে ভাগ করা যায়।

একটি কোর্স-বিক্রির সাইটের পেমেন্ট API টেস্টের জন্য উদাহরণ গঠন:

```text
Payment QA - Stripe Sandbox (Collection)
├── 01 Customers
│   ├── Create Customer
│   └── Retrieve Customer
├── 02 PaymentIntents
│   ├── Create PaymentIntent
│   ├── Retrieve PaymentIntent
│   └── Create PaymentIntent - declined card
└── 03 Refunds
    ├── Create Full Refund
    └── Create Partial Refund
```

কিছু নিয়ম:

- **নামের আগে সংখ্যা** দিন (01, 02), যাতে রানারে ক্রম ঠিক থাকে।
- **প্রতি রিকোয়েস্টে একটি কাজ**, নাম দেখে বোঝা যায় কী করে।
- **Collection লেভেলে Auth** সেট করুন; ভেতরের রিকোয়েস্টে "Inherit auth from parent" রাখুন। কী বদলালে এক জায়গায় বদলালেই হবে।
- **Description** লিখুন: কী টেস্ট হয়, Precondition কী। এটা ডকুমেন্টেশনেরও কাজ করে।

> [!TIP]
> Collection-এর ওপর ডান-ক্লিক করে (বা তিন ডটে) Run দিলে পুরো Collection একবারে চলে। তাই ফোল্ডারের ক্রম এমন রাখুন যাতে আগের রিকোয়েস্টের ডেটা পরেরটি পায়।

## Environment ও `{{baseUrl}}`

Environment (একসাথে রাখা কিছু ভ্যারিয়েবল, যা একটি নির্দিষ্ট সার্ভার বা পরিস্থিতির জন্য) দিয়ে একই Collection বিভিন্ন জায়গায় চালানো যায়। Environment বদলালে সব রিকোয়েস্টের ঠিকানা বদলে যায়।

উদাহরণ: দুটি Environment

| ভ্যারিয়েবল | local | test |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | `https://jsonplaceholder.typicode.com` |
| `stripeBaseUrl` | `https://api.stripe.com` | `https://api.stripe.com` |
| `stripeSecretKey` | (secret, শুধু Current value) | (secret, শুধু Current value) |

`local` হলো আপনার নিজের মেশিনে চলা অ্যাপ। `test` এখানে অনুশীলনের জন্য ফ্রি JSONPlaceholder (ভুয়া ডেটার পাবলিক টেস্ট API)। বাস্তব প্রজেক্টে `test` হবে আপনার কোম্পানির স্টেজিং সার্ভার।

রিকোয়েস্টের URL তখন এমন:

```http
GET {{baseUrl}}/users/1
```

ওপরের ডানদিকের ড্রপডাউন থেকে Environment বদলান; একই রিকোয়েস্ট এখন অন্য সার্ভারে যাবে।

## ভ্যারিয়েবল ও Scope

Variable (একটি নামের পেছনে রাখা মান, যা `{{নাম}}` লিখে ব্যবহার হয়) Postman-এ পাঁচটি Scope (কোথায় পর্যন্ত মানটি দেখা যায়) -তে থাকে:

| Scope | কোথায় দেখা যায় | কখন ব্যবহার | স্ক্রিপ্টে |
|---|---|---|---|
| Global | পুরো Workspace | খুব সাধারণ মান, কম ব্যবহার করুন | `pm.globals.set()` |
| Collection | ওই Collection-এর সব রিকোয়েস্ট | API ভার্সন, স্থির পাথ | `pm.collectionVariables.set()` |
| Environment | সক্রিয় Environment থাকলে | `baseUrl`, কী, সার্ভার-নির্ভর মান | `pm.environment.set()` |
| Data | Collection Runner বা Newman-এ ডেটা ফাইল থেকে | CSV/JSON-এর প্রতি সারি | `pm.iterationData.get()` |
| Local | শুধু চলমান রিকোয়েস্ট বা রান | অস্থায়ী মান, যেমন একবারের Idempotency-Key | `pm.variables.set()` |

**কোনটা জেতে?** একই নাম একাধিক Scope-এ থাকলে সবচেয়ে সংকীর্ণটা জেতে:

```text
Local  >  Data  >  Environment  >  Collection  >  Global
(সবচেয়ে বেশি অগ্রাধিকার)                    (সবচেয়ে কম)
```

`pm.variables.get('নাম')` এই নিয়ম মেনে যে মান জেতে সেটাই দেয়। তাই পড়ার সময় সাধারণত এটাই ব্যবহার করুন।

### Initial value বনাম Current value

Environment-এর প্রতিটি ভ্যারিয়েবলের দুটি মান থাকে:

- **Initial value:** Workspace-এ সিঙ্ক হয়, টিমের সাথে শেয়ার হয়, Export-এ যায়। (Postman-এর কিছু নতুন ভার্সনে এটি "Shared value" নামে দেখাতে পারে।)
- **Current value:** শুধু আপনার মেশিনে থাকে, রিকোয়েস্টে এটাই ব্যবহার হয়।

গোপন মান (কী, টোকেন, পাসওয়ার্ড) **শুধু Current value-তে** রাখুন। Initial value খালি রাখুন।

### secret টাইপ

Environment-এ ভ্যারিয়েবলের Type `default` বা `secret` হতে পারে। `secret` দিলে মানটি স্ক্রিনে তারকা চিহ্ন দিয়ে ঢাকা থাকে, ফলে স্ক্রিনশেয়ার বা স্ক্রিনশটে দেখা যায় না।

কিন্তু মনে রাখুন: secret টাইপ শুধু **দেখানো** ঢাকে। মান Initial value-তে থাকলে তা এখনো সিঙ্ক ও শেয়ার হতে পারে। Postman-এর Vault (শুধু নিজের মেশিনে এনক্রিপ্ট করে রাখা গোপন মানের জায়গা) ফিচারও আছে; বিস্তারিত Postman ডকসে "Postman Vault" লিখে খুঁজুন: https://learning.postman.com/

> [!DANGER]
> কখনো এমন Environment Export করে শেয়ার করবেন না (ইমেইল, Slack, GitHub) যেখানে কী আছে। Export ফাইলে মান সাধারণ লেখা হিসেবে থাকে। টেস্ট কী-ও গোপন: `sk_test_` দিয়ে কেউ আপনার Sandbox-এ কাস্টমার, পেমেন্ট ও webhook বদলাতে পারে। ভুলে শেয়ার হলে Stripe Dashboard থেকে কী রোল করুন। Live কী (`sk_live_`) কখনো Postman-এ রাখবেন না।

## Pre-request Script

Pre-request Script (রিকোয়েস্ট পাঠানোর ঠিক আগে চলা ছোট JavaScript) দিয়ে প্রতিবার নতুন ডেটা বানানো যায়। Scripts ট্যাবে "Pre-request" অংশে লিখুন। এটা রিকোয়েস্ট, ফোল্ডার বা Collection লেভেলে বসানো যায়।

### টাইমস্ট্যাম্প ও র‍্যান্ডম ইমেইল

```js
// এখনকার সময় (মিলিসেকেন্ড) আর ISO তারিখ
const now = Date.now();
pm.variables.set('timestamp', now);
pm.variables.set('isoDate', new Date(now).toISOString());

// প্রতিবার আলাদা টেস্ট ইমেইল, যাতে "ইমেইল আগে থেকে আছে" এরর না আসে
const email = `qa+${now}@example.com`;
pm.environment.set('testEmail', email);
console.log('Using email:', email);
```

`example.com` ডোমেইন শুধু উদাহরণের জন্য সংরক্ষিত, তাই এতে কোনো আসল মানুষের ইমেইল যায় না। Postman-এর বিল্ট-ইন ডাইনামিক ভ্যারিয়েবলও আছে, যেমন `{{$randomEmail}}`, `{{$timestamp}}`, `{{$guid}}`।

### Idempotency-Key বানানো

Idempotency-Key (একটি অনন্য কী, যাতে একই রিকোয়েস্ট বারবার গেলেও সার্ভার কাজটি একবারই করে)। Stripe-এ POST রিকোয়েস্টে `Idempotency-Key` হেডার দিলে একই কী-তে দ্বিতীয় রিকোয়েস্ট নতুন পেমেন্ট বানায় না, আগের ফলাফলই ফেরত দেয়।

```js
// নির্ভরযোগ্য উপায়: Postman-এর বিল্ট-ইন {{$guid}}
let key = pm.variables.replaceIn('{{$guid}}');

// Postman-এর নতুন স্যান্ডবক্সে crypto.randomUUID থাকলে সেটাও চলে
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
  key = crypto.randomUUID();
}

pm.variables.set('idempotencyKey', key);
```

তারপর Headers ট্যাবে:

```text
Idempotency-Key: {{idempotencyKey}}
```

Idempotency নিয়ে গভীর টেস্ট (একই কী আবার পাঠানো, ভিন্ন বডিতে একই কী) [Idempotency টেস্টিং](/lessons/idempotency-testing/) লেসনে করব।

## রিকোয়েস্ট চেইনিং

Chaining (একটি রিকোয়েস্টের রেসপন্স থেকে মান নিয়ে পরের রিকোয়েস্টে ব্যবহার করা)। বাস্তব ফ্লো এমনই: আগে Customer, তারপর তার PaymentIntent, তারপর রিফান্ড।

রেসপন্স থেকে মান রাখার কোড Scripts ট্যাবের "Post-response" অংশে (পুরনো ভার্সনে "Tests" ট্যাবে) লিখুন:

```js
const body = pm.response.json();

if (pm.response.code === 200 && body.id) {
  pm.environment.set('customerId', body.id);
  console.log('Saved customerId:', body.id);
} else {
  console.warn('customerId সেভ হয়নি, রেসপন্স দেখুন');
}
```

পরের রিকোয়েস্টে `{{customerId}}` লিখলেই হবে।

> [!NOTE]
> চেইনের মাঝের রিকোয়েস্ট ফেইল করলে পুরনো `customerId` থেকে যেতে পারে, আর পরের রিকোয়েস্ট ভুল ডেটায় চলবে। তাই ওপরের মতো শর্ত দিয়ে সেভ করুন, অথবা শুরুতে `pm.environment.unset('customerId')` দিন।

## Stripe উদাহরণ: Bearer auth দিয়ে পুরো চেইন

Stripe API Bearer auth (হেডারে `Authorization: Bearer <secret key>` পাঠানো) ব্যবহার করে, আর বডি `x-www-form-urlencoded` ফরম্যাটে নেয়।

### ধাপ ১: Collection-এ Auth

Collection খুলুন → Authorization ট্যাব → Type: **Bearer Token** → Token: `{{stripeSecretKey}}`। ভেতরের সব রিকোয়েস্টে Auth "Inherit auth from parent"।

Environment-এ `stripeSecretKey`-এর Current value-তে আপনার নিজের Sandbox কী বসান (দেখতে `sk_test_XXXXXXXXXXXXXXXX`-এর মতো)। Type দিন `secret`।

### ধাপ ২: Create Customer

```http
POST {{stripeBaseUrl}}/v1/customers
Content-Type: application/x-www-form-urlencoded
Idempotency-Key: {{idempotencyKey}}

email={{testEmail}}&name=QA Test Customer&description=Created from Postman
```

Postman-এ Body → `x-www-form-urlencoded` বেছে নিয়ে key-value হিসেবে দিন। Pre-request-এ আগের টাইমস্ট্যাম্প-ইমেইল আর Idempotency-Key কোড রাখুন। Post-response-এ `customerId` সেভ করুন।

### ধাপ ৩: Create PaymentIntent

```http
POST {{stripeBaseUrl}}/v1/payment_intents
Content-Type: application/x-www-form-urlencoded
Idempotency-Key: {{idempotencyKey}}

amount=2000&currency=usd&customer={{customerId}}&payment_method_types[]=card&payment_method=pm_card_visa&confirm=true
```

`pm_card_visa` হলো Stripe-এর টেস্ট PaymentMethod, যা 4242 কার্ডের মতো সফল হয়। Post-response-এ:

```js
const pi = pm.response.json();
pm.environment.set('paymentIntentId', pi.id);
console.log(pi.id, pi.status, pi.amount);
```

রেসপন্সে `status` হওয়া উচিত `succeeded`, `amount` 2000।

### ধাপ ৪: Partial Refund

```http
POST {{stripeBaseUrl}}/v1/refunds
Content-Type: application/x-www-form-urlencoded
Idempotency-Key: {{idempotencyKey}}

payment_intent={{paymentIntentId}}&amount=500
```

রেসপন্সে Refund-এর `status` সাধারণত `succeeded` আর `amount` 500। Stripe Dashboard (Test Mode) -এ পেমেন্টটি খুললে আংশিক রিফান্ড দেখাবে।

> [!LIVE]
> এই চেইন শুধু Test Mode কী দিয়ে চালান। Live কী দিয়ে চালালে সত্যিকারের Customer আর চার্জ তৈরি হতে পারে। রিকোয়েস্ট পাঠানোর আগে Environment-এ কী `sk_test_` দিয়ে শুরু কিনা দেখে নিন।

## হাতেকলমে অনুশীলন

1. Postman খুলে নতুন Collection বানান: `Payment QA - Practice`। ভেতরে দুটি ফোল্ডার: `01 JSONPlaceholder`, `02 Stripe Sandbox`।
2. দুটি Environment বানান: `local` আর `test`, ওপরের টেবিলের মতো ভ্যারিয়েবলসহ। `stripeSecretKey`-এর Type `secret`, শুধু Current value-তে নিজের টেস্ট কী।
3. `01 JSONPlaceholder`-এ `GET {{baseUrl}}/users/1` বানান। `test` Environment সক্রিয় করে পাঠান; ২০০ রেসপন্স দেখুন।
4. একই ফোল্ডারে `POST {{baseUrl}}/posts` বানান, Body raw JSON: `{"title": "QA {{timestamp}}", "body": "practice", "userId": 1}`। Pre-request-এ `timestamp` সেট করুন। Post-response-এ রেসপন্সের `id` `postId` নামে সেভ করুন।
5. `GET {{baseUrl}}/posts/1` বানান, আর Console (নিচের বাম কোণে) খুলে দেখুন আপনার `console.log` কী দেখাচ্ছে।
6. `02 Stripe Sandbox`-এ ওপরের ৩টি রিকোয়েস্ট (Customer → PaymentIntent → Refund) বানান এবং ক্রমে চালান। Stripe Dashboard-এ তিনটিই মিলিয়ে দেখুন।
7. Environment-এর চোখের আইকনে (Quick Look) ক্লিক করে দেখুন কোন ভ্যারিয়েবল কোন মান পেয়েছে।

<details><summary>সমাধান দেখুন: ধাপ ৪-এর Post-response স্ক্রিপ্ট</summary>

```js
const body = pm.response.json();
// JSONPlaceholder নতুন post-এর জন্য 201 দেয় এবং id সাধারণত 101
if (pm.response.code === 201) {
  pm.environment.set('postId', body.id);
}
console.log('postId =', pm.environment.get('postId'));
```

মনে রাখুন: JSONPlaceholder আসলে কিছু সেভ করে না, তাই `GET /posts/101` করলে পাবেন না। এটা শুধু অনুশীলনের জন্য।

</details>

> [!MISTAKE]
> - প্রতিটি রিকোয়েস্টে পুরো URL হার্ডকোড করা, `{{baseUrl}}` না ব্যবহার করা।
> - কী Initial value-তে রাখা, তারপর Workspace শেয়ার বা Export করা।
> - সব কিছু Global-এ রাখা; পরে কোন মান কোথা থেকে আসছে বোঝা যায় না।
> - ভুল Environment সক্রিয় রেখে রিকোয়েস্ট পাঠানো (ওপরের ডানদিকে সবসময় দেখে নিন)।
> - Stripe-এ JSON বডি পাঠানো; Stripe `x-www-form-urlencoded` চায়।
> - সব রিকোয়েস্টে একই স্থির Idempotency-Key রাখা।

## সারসংক্ষেপ

- Collection ও নম্বরযুক্ত ফোল্ডার দিয়ে রিকোয়েস্ট সাজান; Auth Collection লেভেলে।
- Environment আর `{{baseUrl}}` দিয়ে একই Collection local ও test-এ চালান।
- Scope-এর অগ্রাধিকার: Local > Data > Environment > Collection > Global।
- গোপন মান শুধু Current value-তে, Type `secret`; কী-সহ Environment কখনো শেয়ার নয়।
- Pre-request Script দিয়ে টাইমস্ট্যাম্প, র‍্যান্ডম ইমেইল, Idempotency-Key; Post-response দিয়ে `id` সেভ করে চেইন।

## বাড়ির কাজ

1. Stripe ফোল্ডারে `Retrieve PaymentIntent` যোগ করুন: `GET {{stripeBaseUrl}}/v1/payment_intents/{{paymentIntentId}}`। রিফান্ডের পর এর রেসপন্সে কী বদলায় লিখে রাখুন।
2. `pm_card_chargeDeclined` দিয়ে একটি ডিক্লাইন PaymentIntent রিকোয়েস্ট বানান এবং রেসপন্সের `error.code` দেখুন।
3. পরের লেসন [Postman টেস্ট ও ডেটা-ড্রিভেন টেস্টিং](/lessons/postman-tests-data-driven/)-এ এই Collection-এই টেস্ট যোগ করব, তাই এটি রেখে দিন।
