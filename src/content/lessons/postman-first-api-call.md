---
order: 4
level: 1
week: 2
title: "Postman দিয়ে প্রথম API কল: GET, POST আর Response পড়া"
description: "Postman ইনস্টল করে ফ্রি টেস্ট API-তে প্রথম GET ও POST রিকোয়েস্ট পাঠান। Status, Time, Size, Header আর Body পড়া শিখুন, রিকোয়েস্ট সেভ করুন, অনুশীলন সমাধানসহ।"
keywords: ["postman", "api testing", "postman tutorial", "get request", "post request", "jsonplaceholder", "reqres", "swagger petstore", "workspace", "collection", "response time", "পোস্টম্যান", "এপিআই টেস্টিং", "রিকোয়েস্ট পাঠানো"]
minutes: 50
quiz:
  - q: "Postman-এ একটি POST রিকোয়েস্টে JSON Body দিলেন, কিন্তু সার্ভার বলছে Body খালি বা ফরম্যাট ভুল। কোনটি সবচেয়ে সম্ভাব্য কারণ?"
    options: ["Body ট্যাবে raw বাছাই করে ধরন JSON করা হয়নি, তাই Content-Type ঠিক যায়নি", "Method GET হওয়া উচিত ছিল", "Postman-এর ইন্টারনেট স্পিড কম", "URL-এর শেষে স্ল্যাশ নেই"]
    answer: 0
    explain: "raw + JSON বাছলে Postman নিজে Content-Type: application/json হেডার যোগ করে। Text বা অন্য ধরন থাকলে সার্ভার Body ঠিকমতো পড়ে না।"
  - q: "reqres.in-এ একটি রিকোয়েস্ট পাঠিয়ে 401 পেলেন, অথচ URL আর Body ঠিক আছে। পরবর্তী ধাপ কী?"
    options: ["Method বদলে DELETE করা", "reqres.in-এর সাইটে ফ্রি API কী-এর নির্দেশনা দেখে x-api-key হেডার যোগ করা", "Postman আনইনস্টল করা", "Body থেকে সব ফিল্ড মুছে দেওয়া"]
    answer: 1
    explain: "401 মানে পরিচয় যাচাই হয়নি। reqres.in এখন রিকোয়েস্টে একটি ফ্রি API কী হেডার চাইতে পারে, তাই তাদের নির্দেশনা মেনে হেডার যোগ করতে হবে।"
  - q: "একটি পেমেন্ট স্ট্যাটাস API 200 দিল, কিন্তু Time দেখাচ্ছে 9,800 ms। টেস্টার হিসেবে কী করবেন?"
    options: ["200 এসেছে, তাই পাস", "Body না দেখেই ফেইল", "কয়েকবার চালিয়ে সময় মিলিয়ে দেখা এবং প্রত্যাশিত সময়ের চেয়ে বেশি হলে পারফরম্যান্স সমস্যা হিসেবে রিপোর্ট করা", "Postman-এর Size কলাম দেখে সিদ্ধান্ত নেওয়া"]
    answer: 2
    explain: "ফাংশন ঠিক থাকলেও প্রায় ১০ সেকেন্ড অপেক্ষা চেকআউটে কাস্টমার হারানোর কারণ। একবারের মাপ বিভ্রান্তিকর হতে পারে, তাই কয়েকবার মেপে প্রমাণসহ রিপোর্ট করুন।"
  - q: "JSONPlaceholder-এ POST /posts করে 201 আর id: 101 পেলেন। তারপর GET /posts/101 করে 404 পেলেন। এর ব্যাখ্যা কী?"
    options: ["Postman-এ বাগ আছে", "POST আসলে ব্যর্থ হয়েছিল", "GET-এর জন্য Authorization হেডার লাগে", "JSONPlaceholder একটি নকল API, এটি ডেটা আসলে সেভ করে না, শুধু সফল হওয়ার ভান করে"]
    answer: 3
    explain: "JSONPlaceholder শেখার জন্য তৈরি, এটি রিকোয়েস্টের উত্তর বানিয়ে দেয় কিন্তু কিছু সংরক্ষণ করে না। আসল সিস্টেমে এমন আচরণ হলে সেটা বড় বাগ হতো।"
  - q: "দলের সাথে কাজের জন্য একটি পোস্টম্যান রিকোয়েস্টে Stripe-এর Secret Key ব্যবহার করছেন। কোনটি সবচেয়ে নিরাপদ অভ্যাস?"
    options: ["কী সরাসরি হেডারে লিখে পাবলিক ওয়ার্কস্পেসে সেভ করা", "কী একটি ভেরিয়েবলে রেখে, শেয়ার না হওয়া মানে (current value) রাখা এবং পাবলিক ওয়ার্কস্পেস ব্যবহার না করা", "কী রিকোয়েস্টের নামের মধ্যে লিখে রাখা", "কী URL-এর query param-এ পাঠানো"]
    answer: 1
    explain: "ভেরিয়েবল ব্যবহার করলে কী এক জায়গায় থাকে এবং শেয়ারের সময় লুকানো যায়। পাবলিক ওয়ার্কস্পেসে কী রাখলে যে কেউ দেখতে পায়, আর URL-এ কী সার্ভার লগে থেকে যায়।"
---

curl দিয়ে কমান্ড লেখা শক্তিশালী, কিন্তু প্রতিদিনের API টেস্টিংয়ে বেশিরভাগ QA ব্যবহার করেন Postman। এটা দিয়ে বাটন চেপে রিকোয়েস্ট পাঠানো যায়, উত্তর সুন্দর করে দেখা যায়, আর পরে টেস্ট লেখা ও অটোমেশনও করা যায়।

এই লেসনে আমরা তিনটি ফ্রি পাবলিক API-তে প্রথম রিকোয়েস্ট পাঠাব। Stripe-এ যাব পরের লেসনগুলোতে।

## এই লেসনে যা শিখবেন

- Postman ইনস্টল করা (ডেস্কটপ বা ওয়েব) এবং ওয়ার্কস্পেস চেনা
- JSONPlaceholder, reqres.in ও Swagger Petstore-এ GET ও POST পাঠানো
- Response-এর Status, Time, Size, Headers আর Body পড়া
- রিকোয়েস্ট সেভ করে Collection-এ রাখা
- নিজে নিজে অনুশীলন, সমাধানসহ

## Postman ইনস্টল ও প্রথম চেনা

Postman-এর ফ্রি প্ল্যান একা শেখার জন্য যথেষ্ট।

1. https://www.postman.com খুলে ফ্রি অ্যাকাউন্ট খুলুন (Google দিয়েও পারেন)।
2. ডেস্কটপ অ্যাপ ডাউনলোড করুন (Windows, macOS, Linux)। অথবা ব্রাউজারেই Postman-এর ওয়েব ভার্সন ব্যবহার করুন।
3. ওয়েব ভার্সনে `localhost` বা লোকাল API কল করতে Postman Desktop Agent লাগতে পারে। পাবলিক API-র জন্য সাধারণত লাগে না।
4. লগইন করে একটি **Workspace** (কাজের জায়গা, যেখানে আপনার সব রিকোয়েস্ট ও কালেকশন থাকে) তৈরি করুন। নাম দিন “Payment QA Practice”, ধরন রাখুন **Personal** বা **Private**।

> [!DANGER] ওয়ার্কস্পেসের ধরন খেয়াল রাখুন
> Public Workspace-এ রাখা সবকিছু ইন্টারনেটে যে কেউ দেখতে পায়। অনেক কোম্পানির আসল API কী এভাবে ফাঁস হয়েছে। Stripe বা অন্য কোনো কী থাকলে কখনো Public ওয়ার্কস্পেসে নয়।

### ইন্টারফেসের মূল অংশ

স্ক্রিনশট বর্ণনা: বাম দিকে সাইডবার, যেখানে Collections, Environments, History। মাঝখানে উপরে একটি ড্রপডাউন (GET, POST…) আর তার পাশে URL বক্স, ডানে নীল **Send** বাটন। নিচে Params, Authorization, Headers, Body, Scripts ট্যাব। সবচেয়ে নিচে Response অংশ, যেখানে Status, Time, Size এবং Body, Headers ট্যাব।

| অংশ | কাজ |
|---|---|
| Method ড্রপডাউন | GET, POST, PUT, PATCH, DELETE বাছাই |
| URL বক্স | কোথায় রিকোয়েস্ট যাবে |
| Params | Query params টেবিল আকারে লেখা যায়, URL নিজে আপডেট হয় |
| Authorization | Bearer token, Basic auth, API key বসানো |
| Headers | হেডার যোগ করা; কিছু হেডার Postman নিজে যোগ করে |
| Body | POST, PUT, PATCH-এর ডেটা; JSON-এর জন্য **raw → JSON** |
| Scripts (আগে Tests নামে) | রিকোয়েস্টের আগে বা পরে চালানোর কোড; [পরের লেভেলে](/lessons/postman-tests-data-driven/) শিখব |

## প্রথম GET: JSONPlaceholder

JSONPlaceholder (https://jsonplaceholder.typicode.com) একটি ফ্রি নকল REST API। লগইন বা কী লাগে না।

1. **New → HTTP** (বা `+` ট্যাব) চাপুন।
2. Method রাখুন **GET**, URL দিন:

```text
https://jsonplaceholder.typicode.com/users/1
```

3. **Send** চাপুন।
4. নিচে দেখুন: Status `200 OK`, Time (যেমন 180 ms), Size (যেমন 1.2 KB)।
5. **Body** ট্যাবে **Pretty** ভিউতে JSON দেখুন। `name`, `email`, `address.city` খুঁজুন।
6. **Headers** ট্যাবে `Content-Type` খুঁজুন।

### Query params

URL লিখুন `https://jsonplaceholder.typicode.com/comments`, তারপর **Params** ট্যাবে key `postId`, value `1` দিন। URL নিজে হয়ে যাবে `...comments?postId=1`। Send করুন, শুধু ১ নম্বর পোস্টের কমেন্ট আসবে।

## Response পড়া: চারটি সংখ্যা আর দুটি ট্যাব

| জিনিস | কোথায় | কী জানায় | পেমেন্ট টেস্টিংয়ে কেন জরুরি |
|---|---|---|---|
| Status | উপরে ডানে | ফলাফল, যেমন 200, 201, 404 | প্রত্যাশিত কোড এলো কি না |
| Time | Status-এর পাশে | রিকোয়েস্ট থেকে উত্তর পর্যন্ত সময় (ms) | ধীর চেকআউট মানে কাস্টমার হারানো |
| Size | Time-এর পাশে | Response কত বড় | অপ্রয়োজনীয় বড় ডেটা, বা ভুল করে বেশি তথ্য ফাঁস |
| Headers | Response-এর ট্যাব | Content-Type, Cache, Rate limit তথ্য | ভুল Content-Type, নিরাপত্তা হেডার আছে কি না |
| Body | Response-এর ট্যাব | আসল ডেটা | স্ট্যাটাস, অঙ্ক, আইডি সব ঠিক কি না |

Time-এর উপর মাউস রাখলে বিস্তারিত দেখায়: DNS, TCP, SSL handshake, সার্ভারের প্রসেসিং (Waiting বা TTFB), ডাউনলোড। কোন ধাপে সময় যাচ্ছে বোঝা যায়।

> [!TIP]
> শুধু Status দেখে পাস দেবেন না। প্রতিবার অন্তত তিনটি জিনিস মিলিয়ে নিন: Status Code, Body-র মূল ফিল্ড (যেমন `status`, `amount`), আর Time। এই অভ্যাসটাই পরে Postman টেস্ট স্ক্রিপ্টে রূপ নেবে।

## প্রথম POST: নতুন কিছু তৈরি

### JSONPlaceholder-এ POST

1. নতুন রিকোয়েস্ট, Method **POST**, URL `https://jsonplaceholder.typicode.com/posts`।
2. **Body → raw → JSON** বাছুন।
3. লিখুন:

```json
{
  "title": "Order ORD-1001 paid",
  "body": "amount 2000 BDT via card",
  "userId": 1
}
```

4. Send করুন। Status `201 Created`, Body-তে আপনার ডেটা আর একটি নতুন `id` (সাধারণত 101) দেখবেন।
5. **Headers** ট্যাবে (রিকোয়েস্টের) “hidden” হেডার দেখুন: Postman নিজে `Content-Type: application/json` যোগ করেছে।

### reqres.in-এ POST

reqres.in (https://reqres.in) আরেকটি ফ্রি টেস্ট API, যেখানে লগইন, রেজিস্টার, ইউজার তৈরির মতো উদাহরণ আছে।

1. POST `https://reqres.in/api/users`, Body raw JSON:

```json
{
  "name": "Rina",
  "job": "QA Engineer"
}
```

2. Send করুন। 201 আর `id`, `createdAt` আসার কথা।
3. যদি 401 আসে, reqres.in-এর সাইটে ফ্রি কী-এর নির্দেশনা দেখুন। সাধারণত একটি ফ্রি কী নিয়ে হেডারে পাঠাতে হয়:

```http
x-api-key: <reqres.in সাইট থেকে পাওয়া ফ্রি কী>
```

Postman-এ **Headers** ট্যাবে key `x-api-key` আর value হিসেবে আপনার কী দিন। কীটা আসল শেয়ারযোগ্য কিনা নিশ্চিত না হলে স্ক্রিনশটে দেখাবেন না।

4. নেগেটিভ টেস্ট: POST `https://reqres.in/api/login`, Body-তে শুধু `email` দিন, `password` বাদ রাখুন। ইমেইলের মান হিসেবে reqres.in-এর ডকুমেন্টেশনে login উদাহরণে যে নমুনা ইমেইল দেওয়া আছে, সেটা কপি করুন। একটি 400 আর “Missing password” জাতীয় এরর মেসেজ আসার কথা।

### Swagger Petstore

Swagger Petstore (https://petstore.swagger.io) একটি নমুনা API, সাথে ব্রাউজারে ইন্টারঅ্যাক্টিভ ডকুমেন্টেশন। এখানে শিখবেন ডকুমেন্টেশন পড়ে রিকোয়েস্ট বানানো।

1. ব্রাউজারে https://petstore.swagger.io খুলুন। `pet`, `store`, `user` বিভাগে এন্ডপয়েন্টগুলো দেখুন।
2. `GET /pet/findByStatus` খুলুন। দেখুন এটা একটি query param `status` নেয় (available, pending, sold)।
3. Postman-এ GET পাঠান:

```text
https://petstore.swagger.io/v2/pet/findByStatus?status=available
```

4. Body-তে পোষা প্রাণীর একটি array আসবে।
5. একটি অর্ডার তৈরি করুন, POST `https://petstore.swagger.io/v2/store/order`, Body:

```json
{
  "petId": 1,
  "quantity": 1,
  "status": "placed",
  "complete": false
}
```

6. Response থেকে `id` কপি করে GET `https://petstore.swagger.io/v2/store/order/<id>` দিয়ে খুঁজে দেখুন। এটা পাবলিক ডেমো, তাই কখনো কখনো ডেটা মুছে যায় বা অন্যদের ডেটা দেখা যায়। আসল নাম, ফোন বা ব্যক্তিগত তথ্য কখনো দেবেন না।

> [!NOTE]
> এই তিনটি API সবার জন্য খোলা এবং ডেমো। সার্ভার মাঝে মাঝে ধীর বা বন্ধ থাকতে পারে, নিয়মও বদলাতে পারে। একটায় সমস্যা হলে অন্যটায় অনুশীলন চালিয়ে যান। আর কখনো এদের উপর লোড টেস্ট বা হাজার রিকোয়েস্ট পাঠাবেন না।

## রিকোয়েস্ট সেভ করা

প্রতিবার নতুন করে লেখার দরকার নেই।

1. বাম সাইডবারে **Collections → +** চেপে নতুন কালেকশন বানান: “01 Public API Practice”।
2. খোলা রিকোয়েস্টে `Ctrl + S` (Mac-এ `Cmd + S`) চাপুন।
3. অর্থবহ নাম দিন, যেমন “GET user by id - 200” বা “POST login without password - 400”।
4. কালেকশন বেছে **Save** করুন।
5. কালেকশনের ভেতরে ফোল্ডার বানাতে পারেন: “JSONPlaceholder”, “reqres”, “Petstore”।

ভালো নামে প্রত্যাশিত ফলাফল লিখে রাখলে পরে চালিয়েই বোঝা যায় কিছু ভেঙেছে কি না। Collection, Environment আর Variable বিস্তারিত শিখবেন [লেভেল ২-এ](/lessons/postman-collections-environments/)।

> [!MISTAKE]
> - Body-তে JSON লিখে ধরন **Text** রেখে দেওয়া।
> - শুধু Status দেখে পাস দেওয়া, Body না পড়া।
> - Public Workspace-এ কী বা টোকেনসহ রিকোয়েস্ট সেভ করা।
> - পাবলিক ডেমো API-তে আসল ব্যক্তিগত তথ্য পাঠানো।
> - নাম ছাড়া “New Request” রেখে সেভ করা, পরে খুঁজে না পাওয়া।

## হাতেকলমে অনুশীলন

নিচের কাজগুলো Postman-এ করুন এবং প্রতিটি রিকোয়েস্ট কালেকশনে সেভ করুন। আগে নিজে চেষ্টা করুন, তারপর সমাধান দেখুন।

### অনুশীলন ১

JSONPlaceholder থেকে ৫ নম্বর ইউজারের সব todo আনুন, শুধু যেগুলো শেষ হয়নি।

<details><summary>সমাধান দেখুন</summary>

```text
GET https://jsonplaceholder.typicode.com/todos?userId=5&completed=false
```

Params ট্যাবে দুটি key: `userId` = `5`, `completed` = `false`। Status 200, Body-তে একটি array, প্রতিটি আইটেমে `"completed": false`। একটা আইটেমেও `true` থাকলে ফিল্টার কাজ করছে না।

</details>

### অনুশীলন ২

JSONPlaceholder-এ ১ নম্বর পোস্টের শুধু `title` বদলান, পুরো পোস্ট না পাঠিয়ে।

<details><summary>সমাধান দেখুন</summary>

PATCH ব্যবহার করুন, কারণ আংশিক আপডেট।

```text
PATCH https://jsonplaceholder.typicode.com/posts/1
```

```json
{
  "title": "Updated payment note"
}
```

Status 200, Body-তে নতুন `title` আর বাকি পুরোনো ফিল্ড। PUT-এ শুধু title পাঠালে অনেক আসল API বাকি ফিল্ড মুছে দিতে পারে; এটাই PUT আর PATCH-এর পার্থক্য।

</details>

### অনুশীলন ৩

একটি না-থাকা রিসোর্স চেয়ে 404 আনুন, এবং Response-এর Time ও Size নোট করুন।

<details><summary>সমাধান দেখুন</summary>

```text
GET https://jsonplaceholder.typicode.com/posts/0
```

বা `/posts/99999`। Status 404, Body সাধারণত `{}`। Size খুব ছোট হবে। লক্ষ্য করুন: একটি ভালো API 404-এর সাথে বোধগম্য এরর মেসেজ দেয়; এখানে খালি অবজেক্ট আসে, যা আসল প্রোডাক্টে উন্নতির পরামর্শ হিসেবে রিপোর্ট করা যেত।

</details>

### অনুশীলন ৪

Swagger Petstore-এ `sold` স্ট্যাটাসের প্রাণী খুঁজুন, তারপর ভুল স্ট্যাটাস (`status=abc`) দিয়ে দেখুন কী আসে।

<details><summary>সমাধান দেখুন</summary>

```text
GET https://petstore.swagger.io/v2/pet/findByStatus?status=sold
GET https://petstore.swagger.io/v2/pet/findByStatus?status=abc
```

প্রথমটিতে 200 আর একটি array। দ্বিতীয়টিতে ডেমো সার্ভার সাধারণত 200 আর খালি array দেয়। টেস্টার হিসেবে প্রশ্ন তুলুন: অবৈধ মানে 400 দেওয়া উচিত কি না? ডকুমেন্টেশন কী বলে? এভাবেই স্পেসিফিকেশনের সাথে আচরণ মিলিয়ে বাগ খোঁজা হয়।

</details>

> [!CHECK] এই লেসন শেষে আপনি পারবেন
> - Postman-এ GET, POST, PATCH পাঠাতে
> - Params আর raw JSON Body ব্যবহার করতে
> - Status, Time, Size, Headers, Body পড়ে সিদ্ধান্ত নিতে
> - রিকোয়েস্ট অর্থবহ নামে কালেকশনে সেভ করতে

## সারসংক্ষেপ

- Postman ফ্রি; ডেস্কটপ বা ওয়েব, ওয়ার্কস্পেস রাখুন Private বা Personal।
- GET দিয়ে পড়া, POST দিয়ে তৈরি, PATCH দিয়ে আংশিক বদল; JSON Body-র জন্য raw → JSON।
- Response-এ Status, Time, Size, Headers, Body সবসময় একসাথে দেখুন।
- JSONPlaceholder, reqres.in ও Swagger Petstore শেখার জন্য দারুণ, কিন্তু ডেমো: আসল তথ্য বা লোড নয়।
- রিকোয়েস্ট প্রত্যাশিত ফলাফলসহ নাম দিয়ে কালেকশনে সেভ করুন।

## বাড়ির কাজ

1. তিনটি API মিলিয়ে অন্তত ১০টি রিকোয়েস্ট বানান: ৫টি পজিটিভ (2xx) আর ৫টি নেগেটিভ (4xx)। সবগুলো সেভ করুন।
2. প্রতিটি রিকোয়েস্টের নামে প্রত্যাশিত Status Code লিখুন, তারপর পুরো কালেকশন একবার চালিয়ে দেখুন সব মিলছে কি না।
3. পরের লেসন [Stripe পেমেন্ট ফ্লো](/lessons/stripe-payment-flow/) পড়ার আগে [Stripe Sandbox সেটআপ](/lessons/stripe-sandbox-setup/) শেষ হয়েছে কি না নিশ্চিত হোন।
