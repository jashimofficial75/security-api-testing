---
order: 2
level: 0
week: 1
title: "HTTP ও JSON: API-এর ভাষা, Status Code আর পেমেন্ট ডেটা পড়া"
description: "Request, Response, Method, Header, Body, Status Code আর JSON সহজ বাংলায়। curl ও ব্রাউজারের DevTools দিয়ে হাতেকলমে, পেমেন্ট টেস্টিংয়ের উদাহরণসহ।"
keywords: ["http", "json", "status code", "http method", "header", "content-type", "authorization header", "curl", "devtools", "network tab", "query params", "api basics", "স্ট্যাটাস কোড", "রিকোয়েস্ট", "রেসপন্স", "এপিআই"]
minutes: 45
quiz:
  - q: "একটি পেমেন্ট API-তে ভুল ফরম্যাটের অঙ্ক (amount: 'abc') পাঠালেন। সার্ভার 500 Internal Server Error দিল। টেস্টার হিসেবে এটা নিয়ে আপনার মত কী?"
    options: ["ঠিক আছে, এরর তো এসেছে", "বাগ, কারণ ক্লায়েন্টের ভুল ইনপুটে 400 বা 422 জাতীয় 4xx আসা উচিত", "বাগ, কারণ 200 আসা উচিত ছিল", "ঠিক আছে, 500 মানে ভ্যালিডেশন ফেইল"]
    answer: 1
    explain: "5xx মানে সার্ভার নিজে ভেঙেছে। ক্লায়েন্টের ভুল ইনপুট ধরতে পারলে সার্ভারের উচিত পরিষ্কার মেসেজসহ 4xx দেওয়া। 500 দেখায় ইনপুট ভ্যালিডেশন নেই।"
  - q: "লগইন ছাড়া একটি অর্ডারের রিফান্ড API কল করলেন। কোন Status Code সবচেয়ে প্রত্যাশিত?"
    options: ["403 Forbidden", "404 Not Found", "401 Unauthorized", "201 Created"]
    answer: 2
    explain: "পরিচয়ই দেওয়া হয়নি (কোনো টোকেন নেই), তাই 401। পরিচয় দেওয়া আছে কিন্তু অনুমতি নেই হলে 403।"
  - q: "একজন সাধারণ ইউজার অন্য ইউজারের অর্ডার /orders/1002 দেখার চেষ্টা করলেন এবং পুরো ডেটা 200 দিয়ে পেয়ে গেলেন। এটা কী?"
    options: ["নিরাপত্তা বাগ, 403 বা 404 আসা উচিত ছিল", "স্বাভাবিক আচরণ", "পারফরম্যান্স সমস্যা", "শুধু UI বাগ"]
    answer: 0
    explain: "অন্যের ডেটা দেখা যাওয়া একটি Authorization বাগ। সার্ভারের উচিত মালিকানা যাচাই করে 403 বা 404 দেওয়া।"
  - q: "নিচের কোন JSON সঠিক (valid)?"
    options: ["{amount: 2000}", "{'amount': 2000}", "{\"amount\": 2000,}", "{\"amount\": 2000, \"paid\": true}"]
    answer: 3
    explain: "JSON-এ key অবশ্যই ডাবল কোটে থাকে, সিঙ্গেল কোট চলে না, এবং শেষ আইটেমের পরে কমা দেওয়া যায় না। true ছোট হাতের অক্ষরে বুলিয়ান।"
  - q: "একটি পেমেন্ট API বারবার কল করার পর 429 Too Many Requests পেলেন। টেস্টার হিসেবে কোনটি যাচাই করা সবচেয়ে কাজের?"
    options: ["429 আসা মানেই সার্ভার ক্র্যাশ করেছে", "রেসপন্সে Retry-After জাতীয় হেডার আছে কি না এবং অ্যাপ অপেক্ষা করে পরে আবার চেষ্টা করে কি না", "সাথে সাথে আরও দ্রুত রিকোয়েস্ট পাঠানো", "429 কে 200 হিসেবে ধরা"]
    answer: 1
    explain: "429 মানে Rate limit, সার্ভার ঠিকই আছে। ভালো ক্লায়েন্ট অপেক্ষা করে আবার চেষ্টা করে, আর ইউজারকে বোধগম্য মেসেজ দেখায়।"
---

পেমেন্ট গেটওয়ে, আপনার অ্যাপের সার্ভার, মোবাইল অ্যাপ সবাই একে অপরের সাথে কথা বলে HTTP দিয়ে, আর ডেটা পাঠায় JSON ফরম্যাটে। এই দুটো না বুঝলে API টেস্টিং অন্ধকারে ঢিল ছোড়ার মতো।

ভালো খবর: নিয়মগুলো সহজ, আর একবার চোখে বসে গেলে সারা জীবন কাজে লাগবে।

## এই লেসনে যা শিখবেন

- HTTP Request ও Response কী, কী দিয়ে তৈরি
- Method: GET, POST, PUT, PATCH, DELETE কখন কোনটা
- URL-এর অংশ, Query params, Header, Body
- Status Code: 2xx, 3xx, 4xx, 5xx এবং পেমেন্ট টেস্টিংয়ে এদের অর্থ
- JSON-এর নিয়ম, ডেটা টাইপ, নেস্টিং, একটি পেমেন্ট JSON পড়া
- curl আর ব্রাউজারের DevTools Network ট্যাবে হাতেকলমে কাজ

## Request আর Response: রেস্টুরেন্টের উপমা

HTTP (HyperText Transfer Protocol, ওয়েবে ক্লায়েন্ট আর সার্ভারের কথা বলার নিয়ম) একটা রেস্টুরেন্টের অর্ডারের মতো।

- আপনি (Client, যেমন ব্রাউজার বা Postman) ওয়েটারকে অর্ডার দেন: এটা **Request**।
- রান্নাঘর (Server) খাবার পাঠায়, সাথে একটা স্লিপ: এটা **Response**।

একটি Request-এ থাকে:

| অংশ | কী | উদাহরণ |
|---|---|---|
| Method | কী করতে চান | `POST` |
| URL | কোথায় | `https://api.example.com/v1/payments` |
| Header | বাড়তি তথ্য, যেমন পরিচয় ও ফরম্যাট | `Content-Type: application/json` |
| Body | পাঠানো ডেটা (সব Method-এ থাকে না) | `{"amount": 2000}` |

একটি Response-এ থাকে Status Code (ফলাফলের সংখ্যা), Header, আর Body।

```http
POST /v1/payments HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer sk_test_XXXXXXXXXXXXXXXX

{"amount": 2000, "currency": "bdt", "order_id": "ORD-1001"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "pay_123", "status": "pending", "amount": 2000}
```

## Method: কোন কাজে কোনটা

| Method | কাজ | পেমেন্ট উদাহরণ | Body থাকে? |
|---|---|---|---|
| GET | ডেটা পড়া | একটি পেমেন্টের স্ট্যাটাস দেখা | সাধারণত না |
| POST | নতুন কিছু তৈরি বা কোনো অ্যাকশন | নতুন পেমেন্ট বা রিফান্ড তৈরি | হ্যাঁ |
| PUT | পুরো রিসোর্স বদলে দেওয়া | কাস্টমারের পুরো প্রোফাইল আপডেট | হ্যাঁ |
| PATCH | কিছু অংশ বদলানো | শুধু কাস্টমারের ফোন নম্বর বদলানো | হ্যাঁ |
| DELETE | মুছে ফেলা | একটি সেভ করা কার্ড মুছে ফেলা | সাধারণত না |

> [!NOTE]
> সব API এই নিয়ম হুবহু মানে না। যেমন Stripe-এর API আপডেটের জন্যও POST ব্যবহার করে। তাই সবসময় সেই API-এর ডকুমেন্টেশন দেখুন।

GET বারবার করলে কিছু বদলায় না। কিন্তু POST বারবার করলে দুইটা পেমেন্ট হয়ে যেতে পারে। তাই পেমেন্টে Idempotency (একই রিকোয়েস্ট বারবার পাঠালেও ফল একবারই হবে) এত জরুরি। এটা নিয়ে বিস্তারিত [Idempotency লেসনে](/lessons/idempotency-testing/)।

## URL, Query params, Header আর Body

### URL-এর অংশ

```text
https://api.example.com:443/v1/orders/ORD-1001/payments?status=failed&limit=10#top
└─┬─┘   └──────┬──────┘└┬┘└──────────┬──────────────┘└──────────┬─────────┘└┬┘
scheme       host     port         path                        query     fragment
```

- **scheme:** `https` (পেমেন্টে সবসময় https)
- **host:** সার্ভারের ঠিকানা
- **path:** কোন রিসোর্স, যেমন `/v1/orders/ORD-1001/payments`
- **query params:** `?` এর পরে `key=value`, একাধিক হলে `&` দিয়ে। ফিল্টার, পেজিং, সার্চে লাগে।
- **fragment:** `#` এর পরের অংশ, সার্ভারে যায় না।

### Header

Header হলো খামের উপরে লেখা তথ্য। দুটি সবচেয়ে জরুরি:

- `Content-Type`: Body কোন ফরম্যাটে। JSON হলে `application/json`। Stripe-এর মতো কিছু API Body নেয় `application/x-www-form-urlencoded` ফরম্যাটে।
- `Authorization`: আপনি কে। সাধারণত `Bearer <token>` আকারে।

অন্যান্য পরিচিত হেডার: `Accept` (কোন ফরম্যাটে উত্তর চাই), `Idempotency-Key`, `Retry-After` (কতক্ষণ পরে আবার চেষ্টা করবেন)।

> [!DANGER] Authorization হেডার গোপন
> Authorization-এ থাকা টোকেন বা Secret Key কখনো স্ক্রিনশটে, বাগ রিপোর্টে, চ্যাটে বা GitHub-এ দেবেন না। রিপোর্টে সবসময় `sk_test_XXXXXXXX` এর মতো লুকিয়ে লিখুন।

### Body

POST, PUT, PATCH-এ যে ডেটা পাঠানো হয়। বেশিরভাগ আধুনিক API-তে এটা JSON।

## Status Code: সংখ্যার ভাষা

প্রথম অঙ্ক দেখেই বুঝবেন মোটামুটি কী হয়েছে:

- **2xx:** সফল
- **3xx:** অন্য জায়গায় যান (Redirect) বা ক্যাশ ব্যবহার করুন
- **4xx:** ক্লায়েন্টের ভুল (ভুল ইনপুট, পরিচয় নেই, অনুমতি নেই)
- **5xx:** সার্ভারের ভুল

| Code | নাম | অর্থ | পেমেন্ট টেস্টিংয়ে কী দেখবেন |
|---|---|---|---|
| 200 | OK | সফল, Body-তে ডেটা | স্ট্যাটাস চেক বা লিস্টে সঠিক ডেটা আসছে কি না |
| 201 | Created | নতুন কিছু তৈরি হয়েছে | পেমেন্ট বা রিফান্ড তৈরির পর আইডি ফেরত আসে কি না |
| 204 | No Content | সফল, কিন্তু Body নেই | DELETE-এর পর আসলেই মুছেছে কি না GET দিয়ে দেখুন |
| 301 | Moved Permanently | স্থায়ীভাবে নতুন ঠিকানায় | পুরোনো চেকআউট URL ঠিক জায়গায় যায় কি না |
| 302 | Found | সাময়িক রিডাইরেক্ট | গেটওয়ে থেকে success বা fail পেজে ফেরা |
| 304 | Not Modified | ক্যাশ ব্যবহার করুন | পুরোনো পেমেন্ট স্ট্যাটাস ক্যাশ থেকে দেখাচ্ছে কি না |
| 400 | Bad Request | রিকোয়েস্ট ভুল | ফাঁকা বা ভুল ফিল্ডে পরিষ্কার এরর মেসেজ |
| 401 | Unauthorized | পরিচয় নেই বা ভুল | টোকেন ছাড়া বা ভুল কী দিয়ে কল |
| 403 | Forbidden | পরিচয় আছে, অনুমতি নেই | সাধারণ ইউজার অ্যাডমিনের রিফান্ড API কল করলে |
| 404 | Not Found | রিসোর্স নেই | ভুল পেমেন্ট আইডি, বা অন্যের অর্ডার লুকানো |
| 409 | Conflict | বর্তমান অবস্থার সাথে সংঘাত | একই অর্ডারে দুইবার একসাথে পেমেন্ট |
| 422 | Unprocessable Entity | ফরম্যাট ঠিক, কিন্তু নিয়ম ভাঙে | ঋণাত্মক অঙ্ক, রিফান্ড অঙ্ক পেমেন্টের চেয়ে বেশি |
| 429 | Too Many Requests | অনেক বেশি রিকোয়েস্ট | Rate limit কাজ করে কি না, অ্যাপ অপেক্ষা করে কি না |
| 500 | Internal Server Error | সার্ভারে অপ্রত্যাশিত ভুল | ভুল ইনপুটে 500 আসা মানেই বাগ |
| 502 | Bad Gateway | মাঝের সার্ভার খারাপ উত্তর পেল | গেটওয়ে ডাউন হলে অ্যাপ কী দেখায় |
| 503 | Service Unavailable | সার্ভিস সাময়িক বন্ধ | মেইনটেন্যান্সে অর্ডার আটকে থাকে কি না |
| 504 | Gateway Timeout | মাঝের সার্ভার সময়মতো উত্তর পায়নি | টাইমআউটে টাকা কাটা হয়েছে কি না পরে মিলিয়ে দেখা |

> [!TIP]
> 504 পেমেন্টে সবচেয়ে বিপজ্জনক। ক্লায়েন্ট উত্তর পায়নি, কিন্তু ব্যাংকে টাকা কাটা হয়ে থাকতে পারে। তাই টাইমআউটের পর সিস্টেম কীভাবে আসল স্ট্যাটাস জেনে নেয় (Webhook বা স্ট্যাটাস চেক), সেটা অবশ্যই টেস্ট করুন।

Status Code মুখস্থ করার দরকার নেই। দরকার হলে [MDN-এর HTTP status তালিকা](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) দেখুন। আমাদের [চিটশিটেও](/cheatsheet/) আছে।

## JSON: ডেটার ভাষা

JSON (JavaScript Object Notation, ডেটা লেখার একটি সহজ টেক্সট ফরম্যাট) দেখতে অনেকটা তালিকার মতো।

### নিয়ম

- Object থাকে `{ }` এর ভেতরে, `"key": value` জোড়ায়।
- Array থাকে `[ ]` এর ভেতরে।
- Key সবসময় ডাবল কোটে।
- শেষ আইটেমের পরে কমা নয়।
- কমেন্ট লেখা যায় না।

### ডেটা টাইপ

| টাইপ | উদাহরণ | খেয়াল রাখুন |
|---|---|---|
| string | `"bdt"` | ডাবল কোটে |
| number | `2000`, `19.99` | কোট ছাড়া; `"2000"` হলে সেটা string |
| boolean | `true`, `false` | ছোট হাতের অক্ষরে |
| null | `null` | “কোনো মান নেই” |
| object | `{"city": "Dhaka"}` | ভেতরে আরও key-value |
| array | `["card", "bkash"]` | একাধিক মান |

### একটি পেমেন্ট JSON

```json
{
  "id": "pay_9xK2LmQ",
  "object": "payment",
  "amount": 200000,
  "currency": "bdt",
  "status": "succeeded",
  "paid": true,
  "refunded": false,
  "failure_reason": null,
  "customer": {
    "id": "cus_77Ab",
    "name": "Rina Akter",
    "city": "Dhaka"
  },
  "payment_methods": ["card", "bkash"],
  "metadata": {
    "order_id": "ORD-1001",
    "course": "payment-qa"
  },
  "created": 1767225600
}
```

পড়ার কৌশল:

- `amount` 200000 কেন, যখন কোর্সের দাম ২,০০০ টাকা? অনেক গেটওয়ে অঙ্ক রাখে সবচেয়ে ছোট এককে (পয়সা বা সেন্ট)। ২,০০০ × ১০০ = 200000। এটা না জানলে ১০০ গুণ ভুল ধরতে পারবেন না।
- `customer` একটি নেস্টেড অবজেক্ট। এর নাম পড়তে হয় `customer.name`।
- `payment_methods[0]` মানে প্রথম আইটেম, `"card"`।
- `created` একটি Unix timestamp (১৯৭০ সাল থেকে কত সেকেন্ড)।

> [!NOTE]
> কোন মুদ্রা কোন এককে যায়, তা গেটওয়েভেদে আলাদা। Stripe-এ কিছু মুদ্রা “zero-decimal” (ভগ্নাংশ ছাড়া)। নিশ্চিত হতে সবসময় সেই গেটওয়ের ডকুমেন্টেশন দেখুন।

## হাতেকলমে অনুশীলন

### অংশ ক: curl দিয়ে

curl একটি কমান্ড-লাইন টুল। Windows 10 ও 11, macOS ও Linux-এ সাধারণত আগে থেকেই থাকে। আমরা ফ্রি টেস্ট API JSONPlaceholder ব্যবহার করব।

1. টার্মিনাল (Windows-এ Command Prompt বা PowerShell) খুলুন।
2. একটি GET রিকোয়েস্ট পাঠান, `-i` দিয়ে হেডারও দেখুন:

```bash
curl -i https://jsonplaceholder.typicode.com/posts/1
```

3. প্রথম লাইনে Status Code (200) আর `Content-Type: application/json` খুঁজুন।
4. এবার একটি POST:

```bash
curl -i -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "test payment", "body": "amount 2000", "userId": 1}'
```

5. Status Code 201 আর Body-তে নতুন `id` দেখুন। (এই API আসলে কিছু সেভ করে না, শুধু শেখার জন্য।)
6. একটি না-থাকা রিসোর্স চেয়ে 404 দেখুন:

```bash
curl -i https://jsonplaceholder.typicode.com/posts/99999
```

7. Query params দিয়ে ফিল্টার করুন:

```bash
curl "https://jsonplaceholder.typicode.com/comments?postId=1"
```

> [!NOTE]
> Windows PowerShell-এ `curl` কখনো কখনো আলাদা কমান্ডের নাম হিসেবে কাজ করে। সমস্যা হলে `curl.exe` লিখুন। আর `\` দিয়ে লাইন ভাঙা কাজ না করলে পুরো কমান্ড এক লাইনে লিখুন।

### অংশ খ: ব্রাউজারের DevTools

1. Chrome বা Firefox-এ https://jsonplaceholder.typicode.com খুলুন।
2. `F12` (Mac-এ `Cmd + Option + I`) চেপে DevTools খুলুন, **Network** ট্যাবে যান।
3. পেজ রিফ্রেশ করুন। প্রতিটি সারি একটি Request।
4. ফিল্টারে **Fetch/XHR** বাছুন, পেজের “Run script” জাতীয় উদাহরণ বাটন থাকলে চাপুন, বা নতুন ট্যাবে https://jsonplaceholder.typicode.com/users খুলুন।
5. একটি সারিতে ক্লিক করুন। **Headers** ট্যাবে Method, Status Code, Request ও Response Headers দেখুন। **Response** বা **Preview** ট্যাবে JSON দেখুন।
6. **Timing** ট্যাবে দেখুন রিকোয়েস্টে কত সময় লাগল।

স্ক্রিনশট বর্ণনা: Network ট্যাবে বাম দিকে রিকোয়েস্টের তালিকা, প্রতিটির পাশে Status (200), Type (fetch বা document), Size ও Time কলাম। একটি সারিতে ক্লিক করলে ডানে Headers, Payload, Preview, Response ট্যাব খোলে।

### অংশ গ: নিজে যাচাই করুন

উপরের পেমেন্ট JSON থেকে নিচের প্রশ্নগুলোর উত্তর দিন।

1. কাস্টমারের শহর কোন পাথে পাবেন?
2. পেমেন্ট সফল কি না, কোন দুটি ফিল্ড থেকে বোঝা যায়?
3. অর্ডার নম্বর কোথায়?

<details><summary>সমাধান দেখুন</summary>

1. `customer.city`, মান `"Dhaka"`।
2. `status` (`"succeeded"`) আর `paid` (`true`)। দুটো মিলিয়ে দেখা ভালো অভ্যাস।
3. `metadata.order_id`, মান `"ORD-1001"`। মার্চেন্ট সাধারণত নিজের অর্ডারের সাথে পেমেন্ট মেলাতে metadata ব্যবহার করে।

</details>

> [!MISTAKE]
> - শুধু Status Code দেখে পাস দেওয়া। 200 এসেছে কিন্তু Body-তে `"status": "failed"` থাকতে পারে।
> - `"2000"` (string) আর `2000` (number) এক ভাবা।
> - অঙ্ক পয়সায় না টাকায়, তা না দেখে টেস্ট পাস করা।
> - Authorization হেডারসহ পুরো curl কমান্ড চ্যাটে বা বাগ রিপোর্টে পেস্ট করা।

## সারসংক্ষেপ

- Request-এ থাকে Method, URL, Header, Body; Response-এ থাকে Status Code, Header, Body।
- GET পড়ে, POST তৈরি করে, PUT বা PATCH বদলায়, DELETE মোছে; তবে API ডকুমেন্টেশনই শেষ কথা।
- 2xx সফল, 3xx রিডাইরেক্ট, 4xx ক্লায়েন্টের ভুল, 5xx সার্ভারের ভুল; ভুল ইনপুটে 5xx মানে বাগ।
- JSON-এ key ডাবল কোটে, শেষে কমা নয়, টাইপ খেয়াল রাখতে হয়।
- `Content-Type` আর `Authorization` হেডার সবচেয়ে জরুরি; টোকেন কখনো শেয়ার নয়।
- curl আর DevTools Network ট্যাব আপনার প্রথম দুটি API টেস্টিং টুল।

## বাড়ির কাজ

1. https://jsonplaceholder.typicode.com/users/1 থেকে ইউজারের `address.geo.lat` বের করুন, curl আর ব্রাউজার দুটো দিয়েই।
2. যেকোনো একটি ই-কমার্স সাইট খুলে Network ট্যাবে কার্টে পণ্য যোগ করার সময় কোন Request যায় দেখুন (শুধু দেখুন, কিছু বদলাবেন না)। Method আর Status Code নোট করুন।
3. উপরের Status Code টেবিল থেকে পাঁচটি কোড বেছে প্রতিটির জন্য একটি করে পেমেন্ট টেস্ট কেস লিখুন। পরের লেসন: [Stripe Sandbox সেটআপ](/lessons/stripe-sandbox-setup/)।
