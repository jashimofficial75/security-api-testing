---
order: 10
level: 2
week: 4
title: "Postman টেস্ট স্ক্রিপ্ট ও CSV দিয়ে ডেটা-ড্রিভেন টেস্টিং"
description: "pm.test ও pm.expect দিয়ে স্ট্যাটাস, হেডার, রেসপন্স টাইম, JSON বডি ও JSON Schema যাচাই শিখুন; তারপর Collection Runner আর CSV ফাইল দিয়ে এক রিকোয়েস্টে অনেক কেস চালান।"
keywords: ["postman tests", "pm.test", "pm.expect", "json schema", "assertion", "negative testing", "collection runner", "data driven", "csv", "iterationData", "stripe", "টেস্ট স্ক্রিপ্ট", "ডেটা ড্রিভেন", "অ্যাসার্শন"]
minutes: 60
quiz:
  - q: "Stripe ডিক্লাইন কার্ডের রিকোয়েস্টে রেসপন্স 402 আসছে, আর আপনার টেস্ট pm.response.to.have.status(200) বলছে। টেস্ট ফেইল। ঠিক কী করবেন?"
    options: ["Negative কেসে প্রত্যাশিত স্ট্যাটাস 402 লিখবেন এবং error.code যাচাই করবেন", "টেস্ট মুছে দেবেন", "রিকোয়েস্ট বারবার পাঠাবেন যতক্ষণ না 200 আসে", "Stripe-কে বাগ রিপোর্ট করবেন"]
    answer: 0
    explain: "ডিক্লাইন কার্ডে 402 আর card_declined আসাই সঠিক আচরণ। Negative টেস্টে প্রত্যাশা হলো সঠিক এরর, তাই টেস্টকে সেই অনুযায়ী লিখতে হয়।"
  - q: "CSV ফাইলে কলাম amount আছে। রিকোয়েস্ট বডিতে ও টেস্ট স্ক্রিপ্টে কীভাবে ব্যবহার করবেন?"
    options: ["বডিতে $amount, স্ক্রিপ্টে amount", "বডিতে amount, স্ক্রিপ্টে pm.csv.amount", "CSV শুধু Newman-এ কাজ করে", "বডিতে {{amount}}, স্ক্রিপ্টে pm.iterationData.get('amount')"]
    answer: 3
    explain: "ডেটা ফাইলের কলামগুলো Data Scope-এর ভ্যারিয়েবল হয়: রিকোয়েস্টে {{amount}}, স্ক্রিপ্টে pm.iterationData.get('amount')।"
  - q: "CSV থেকে expectedStatus = 200 পড়ে pm.response.to.have.status(pm.iterationData.get('expectedStatus')) লিখলেন, কিন্তু কিছু ক্ষেত্রে অদ্ভুত আচরণ। সম্ভাব্য কারণ ও সমাধান কী?"
    options: ["CSV-তে সংখ্যা রাখা যায় না", "Postman স্ট্যাটাস যাচাই করতে পারে না", "CSV-এর মান স্ট্রিং হিসেবে আসতে পারে; Number(...) দিয়ে সংখ্যায় রূপান্তর করুন", "ফাইলটি JSON হতে হবে"]
    answer: 2
    explain: "ডেটা ফাইলের মান টাইপ নিয়ে নিশ্চিত না থাকাই নিরাপদ। তুলনার আগে Number() দিয়ে রূপান্তর করলে স্ট্রিং বনাম সংখ্যার গোলমাল এড়ানো যায়।"
  - q: "API রেসপন্সে status ফিল্ড কখনো 'succeeded', কখনো 'Succeeded' আসছে, আর আরেকটি ফিল্ড amount কখনো স্ট্রিং। কোন টেস্ট এটা সবচেয়ে ভালো ধরবে?"
    options: ["রেসপন্স টাইম টেস্ট", "JSON Schema টেস্ট, যেখানে status-এর enum আর amount-এর type integer বলা আছে", "শুধু status 200 টেস্ট", "Content-Type হেডার টেস্ট"]
    answer: 1
    explain: "JSON Schema পুরো গঠন যাচাই করে: ফিল্ডের টাইপ, অনুমোদিত মান, আবশ্যিক ফিল্ড। শুধু স্ট্যাটাস কোড বা হেডার দেখে এই সমস্যা ধরা যায় না।"
  - q: "একটি টেস্টে লেখা আছে pm.expect(pm.response.responseTime).to.be.below(800)। এটা কী নিশ্চিত করে?"
    options: ["সার্ভার ৮০০টি রিকোয়েস্ট সামলাতে পারে", "রেসপন্স বডি ৮০০ বাইটের কম", "লোড টেস্ট পাস করেছে", "এই একটি রিকোয়েস্টের রেসপন্স ৮০০ মিলিসেকেন্ডের কম সময়ে এসেছে"]
    answer: 3
    explain: "responseTime এক রিকোয়েস্টের সময় মিলিসেকেন্ডে দেয়। এটা একটি সাধারণ সতর্কতা, লোড টেস্ট নয়; লোড টেস্টের জন্য k6-এর মতো টুল লাগে।"
---

রিকোয়েস্ট পাঠিয়ে চোখে দেখে "ঠিক আছে" বলা ম্যানুয়াল কাজ। Postman-এ ছোট টেস্ট স্ক্রিপ্ট লিখলে প্রতিবার Postman নিজেই বলে দেবে কী পাস, কী ফেইল। তারপর একটি CSV ফাইল দিয়ে একই রিকোয়েস্টে ১০টি কার্ড বা ২০টি অ্যামাউন্ট একসাথে টেস্ট করা যায়।

আগের লেসন [Postman Collection ও Environment](/lessons/postman-collections-environments/)-এর Collection-টি খুলে রাখুন; আমরা তাতেই টেস্ট যোগ করব।

## এই লেসনে যা শিখবেন

- `pm.test` আর `pm.expect` দিয়ে Assertion (একটি শর্ত যা সত্য হলে টেস্ট পাস) লেখা
- স্ট্যাটাস কোড, রেসপন্স টাইম, হেডার আর JSON বডি যাচাই
- `pm.response.to.have.jsonSchema` দিয়ে JSON Schema যাচাই
- Negative টেস্ট: সঠিক এরর আসছে কিনা
- Collection Runner দিয়ে পুরো Collection চালানো
- CSV দিয়ে ডেটা-ড্রিভেন টেস্ট এবং `pm.iterationData`

## প্রথম টেস্ট: `pm.test` ও `pm.expect`

টেস্ট লেখা হয় রিকোয়েস্টের Scripts ট্যাবের **Post-response** অংশে (পুরনো ভার্সনে "Tests" ট্যাব)। রেসপন্স আসার পর এটা চলে।

গঠন সহজ:

```js
pm.test('টেস্টের নাম, যা রিপোর্টে দেখাবে', function () {
  // এখানে এক বা একাধিক যাচাই
  pm.expect(1 + 1).to.equal(2);
});
```

- `pm.test(নাম, ফাংশন)`: একটি টেস্ট। ফাংশনের ভেতরে কোনো যাচাই ফেইল করলে টেস্টটি ফেইল।
- `pm.expect(মান)`: Chai (জনপ্রিয় JavaScript assertion লাইব্রেরি) -এর স্টাইলে যাচাই: `.to.equal()`, `.to.be.a('string')`, `.to.include()`, `.to.be.above()`।
- `pm.response.to.have.status(200)`: রেসপন্স নিয়ে সংক্ষিপ্ত যাচাই।

ফলাফল দেখবেন রেসপন্স প্যানেলের **Test Results** ট্যাবে: সবুজ PASS, লাল FAIL।

## সাধারণ যাচাইগুলো

### স্ট্যাটাস কোড ও রেসপন্স টাইম

```js
pm.test('Status 200 OK', function () {
  pm.response.to.have.status(200);
});

pm.test('রেসপন্স ১০০০ms-এর কম সময়ে', function () {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

রেসপন্স টাইমের সীমা বাস্তবসম্মত রাখুন। ইন্টারনেটের গতি বদলায়, তাই খুব কড়া সীমা (যেমন ২০০ms) অকারণে টেস্ট ফেইল করাবে।

### হেডার যাচাই

```js
pm.test('JSON রেসপন্স', function () {
  pm.response.to.have.header('Content-Type');
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

// Stripe প্রতিটি রেসপন্সে Request-Id হেডার দেয় (req_...), বাগ রিপোর্টে কাজে লাগে
pm.test('Stripe Request-Id আছে', function () {
  const reqId = pm.response.headers.get('Request-Id');
  pm.expect(reqId).to.match(/^req_/);
  console.log('Stripe request:', reqId);
});
```

### JSON বডি যাচাই

ধরুন [আগের লেসনের](/lessons/postman-collections-environments/) Create PaymentIntent রিকোয়েস্ট (`amount=2000`, `currency=usd`, `pm_card_visa`, `confirm=true`)।

```js
const pi = pm.response.json();

pm.test('PaymentIntent তৈরি ও সফল', function () {
  pm.response.to.have.status(200);
  pm.expect(pi.object).to.equal('payment_intent');
  pm.expect(pi.id).to.match(/^pi_/);
  pm.expect(pi.status).to.equal('succeeded');
});

pm.test('অ্যামাউন্ট ও কারেন্সি সঠিক', function () {
  pm.expect(pi.amount).to.equal(2000);          // 20.00 USD = 2000 সেন্ট
  pm.expect(pi.amount).to.be.a('number');
  pm.expect(pi.currency).to.equal('usd');
});

pm.test('সঠিক Customer-এর সাথে যুক্ত', function () {
  pm.expect(pi.customer).to.equal(pm.environment.get('customerId'));
});

// পরের রিকোয়েস্টের জন্য সেভ
pm.environment.set('paymentIntentId', pi.id);
```

> [!TIP]
> এক `pm.test`-এ সম্পর্কিত কয়েকটি যাচাই রাখুন, কিন্তু নাম স্পষ্ট দিন। রিপোর্টে "Test 1 failed" নয়, "অ্যামাউন্ট ও কারেন্সি সঠিক failed" দেখলে সঙ্গে সঙ্গে বোঝা যায় সমস্যা কোথায়।

## JSON Schema যাচাই

JSON Schema (একটি JSON-এর গঠন কেমন হবে তার নিয়ম: কোন ফিল্ড আবশ্যিক, কোনটার টাইপ কী, কী কী মান চলে)। এক টেস্টে পুরো রেসপন্সের গঠন যাচাই হয়। API-তে কেউ ফিল্ডের নাম বা টাইপ বদলে দিলে সঙ্গে সঙ্গে ধরা পড়ে।

```js
const paymentIntentSchema = {
  type: 'object',
  required: ['id', 'object', 'amount', 'currency', 'status'],
  properties: {
    id: { type: 'string', pattern: '^pi_' },
    object: { type: 'string', enum: ['payment_intent'] },
    amount: { type: 'integer', minimum: 1 },
    currency: { type: 'string', minLength: 3, maxLength: 3 },
    status: {
      type: 'string',
      enum: [
        'requires_payment_method', 'requires_confirmation', 'requires_action',
        'processing', 'requires_capture', 'canceled', 'succeeded'
      ]
    },
    customer: { type: ['string', 'null'] }
  }
};

pm.test('PaymentIntent-এর গঠন Schema অনুযায়ী', function () {
  pm.response.to.have.jsonSchema(paymentIntentSchema);
});
```

ফেইল হলে Test Results-এ কোন ফিল্ডে সমস্যা তা মেসেজে দেখায়। Schema নিয়ে আরও গভীরে যাব [Contract Testing ও OpenAPI](/lessons/contract-testing-openapi/) লেসনে।

### একই টেস্ট সব রিকোয়েস্টে: Collection লেভেলের স্ক্রিপ্ট

কিছু যাচাই প্রায় সব রিকোয়েস্টে লাগে: রেসপন্স JSON কিনা, সময় যুক্তিসঙ্গত কিনা। প্রতিটি রিকোয়েস্টে কপি না করে Collection খুলে তার Scripts ট্যাবের Post-response অংশে লিখুন। তখন ভেতরের প্রতিটি রিকোয়েস্টের পর এটা চলবে।

```js
// Collection লেভেল: প্রতিটি রিকোয়েস্টের পর চলে
pm.test('[common] রেসপন্স ৩ সেকেন্ডের কম', function () {
  pm.expect(pm.response.responseTime).to.be.below(3000);
});

pm.test('[common] রেসপন্স JSON', function () {
  pm.expect(pm.response.headers.get('Content-Type') || '').to.include('application/json');
});
```

নামের আগে `[common]` রাখলে রিপোর্টে আলাদা করে চেনা যায় কোনটা সাধারণ টেস্ট আর কোনটা রিকোয়েস্টের নিজের।

## Negative টেস্ট

Negative টেস্টে আমরা প্রমাণ করি যে ভুল ইনপুটে API **সঠিক এরর** দেয়। শুধু "ফেইল হলো" নয়; সঠিক স্ট্যাটাস, সঠিক এরর টাইপ, আর কোনো পেমেন্ট সফল হয়নি।

### ডিক্লাইন কার্ড

রিকোয়েস্ট: আগের মতোই, কিন্তু `payment_method=pm_card_chargeDeclined`।

```js
const res = pm.response.json();

pm.test('ডিক্লাইন কার্ডে 402', function () {
  pm.response.to.have.status(402);
});

pm.test('সঠিক এরর টাইপ ও কোড', function () {
  pm.expect(res.error).to.be.an('object');
  pm.expect(res.error.type).to.equal('card_error');
  pm.expect(res.error.code).to.equal('card_declined');
});

pm.test('PaymentIntent সফল হয়নি', function () {
  // কার্ড এররে Stripe সাধারণত error.payment_intent-এ PaymentIntent দেয়
  const pi = res.error.payment_intent;
  if (pi) {
    pm.expect(pi.status).to.not.equal('succeeded');
  }
});
```

### অবৈধ অ্যামাউন্ট

`amount=49` আর `currency=usd` (ন্যূনতম 0.50 USD-র নিচে):

```js
const res = pm.response.json();

pm.test('ন্যূনতমের নিচে অ্যামাউন্ট রিজেক্ট', function () {
  pm.response.to.have.status(400);
  pm.expect(res.error.type).to.equal('invalid_request_error');
  console.log('error code:', res.error.code, '|', res.error.message);
});
```

এখানে আমরা ইচ্ছা করে `error.code`-এর নির্দিষ্ট মান যাচাই করছি না, শুধু লগ করছি। প্রথমবার চালিয়ে আসল কোড দেখে নিন, তারপর চাইলে সেটাও যাচাই যোগ করুন। অনুমানে কোড লিখবেন না।

> [!NOTE]
> Stripe-এর এরর কোডের পূর্ণ তালিকা অফিসিয়াল ডকসে আছে: https://docs.stripe.com/error-codes । ডিক্লাইনের বিস্তারিত কারণ `error.decline_code`-এ আসে, যেমন `insufficient_funds`।

## Collection Runner

Collection Runner (পুরো Collection বা ফোল্ডারের সব রিকোয়েস্ট ক্রমে চালিয়ে সব টেস্টের ফলাফল এক জায়গায় দেখানোর টুল)।

চালানোর ধাপ:

1. Collection-এর ওপর তিন ডট বা ডান-ক্লিক → **Run collection**।
2. কোন রিকোয়েস্ট চলবে টিক দিন, ক্রম টেনে বদলাতে পারেন।
3. **Iterations** (কতবার পুরো সেট চলবে) আর **Delay** (প্রতি রিকোয়েস্টের মাঝে বিরতি, ms) দিন।
4. ঠিক Environment সক্রিয় আছে কিনা দেখুন।
5. **Run** চাপুন। প্রতিটি রিকোয়েস্টের পাশে পাস/ফেইল সংখ্যা দেখাবে।

স্ক্রিনশট বর্ণনা: Runner-এর ফলাফল পেজে বাম দিকে রিকোয়েস্টের তালিকা, প্রতিটির নিচে সবুজ "PASS" বা লাল "FAIL" ট্যাগসহ টেস্টের নাম; ওপরে মোট পাস ও ফেইল সংখ্যা।

> [!NOTE]
> Postman-এর ফ্রি প্ল্যানে Collection Runner-এর ব্যবহারে মাসিক সীমা থাকতে পারে, যা সময়ে সময়ে বদলায়। সীমায় পৌঁছালে একই কাজ Newman দিয়ে কমান্ড লাইনে সীমাহীনভাবে করা যায়, পরের লেসনে ([Newman CLI ও রিপোর্ট](/lessons/newman-cli-reports/)) দেখাব।

## CSV দিয়ে ডেটা-ড্রিভেন টেস্টিং

Data-driven Testing (একই রিকোয়েস্ট ও টেস্ট রেখে শুধু ইনপুট ডেটা বদলে অনেক কেস চালানো)। ১০টি কার্ডের জন্য ১০টি রিকোয়েস্ট না বানিয়ে, একটি রিকোয়েস্ট আর একটি CSV ফাইল।

### CSV ফাইল

`payment-cases.csv` নামে সেভ করুন। প্রথম সারি কলামের নাম:

```csv
caseId,paymentMethod,amount,currency,expectedStatus,expectedPiStatus,expectedErrorCode
TC-PAY-001,pm_card_visa,2000,usd,200,succeeded,
TC-PAY-002,pm_card_mastercard,1999,usd,200,succeeded,
TC-PAY-009,pm_card_chargeDeclined,2000,usd,402,,card_declined
TC-PAY-010,pm_card_chargeDeclinedInsufficientFunds,2000,usd,402,,card_declined
TC-PAY-011,pm_card_chargeDeclinedExpiredCard,2000,usd,402,,expired_card
TC-PAY-012,pm_card_chargeDeclinedIncorrectCvc,2000,usd,402,,incorrect_cvc
TC-PAY-022,pm_card_visa,50,usd,200,succeeded,
```

প্রতিটি সারি একটি Iteration (একবার চলা)। কলামের নাম এমন দিন যা অন্য কোনো ভ্যারিয়েবলের সাথে মেলে না।

### রিকোয়েস্টে `{{column}}`

কলামগুলো Data Scope-এর ভ্যারিয়েবল হয়ে যায়। রিকোয়েস্ট বডি (`x-www-form-urlencoded`):

```text
amount            {{amount}}
currency          {{currency}}
payment_method    {{paymentMethod}}
payment_method_types[]   card
confirm           true
```

রানের সময় প্রতি Iteration-এ `{{amount}}` CSV-এর সেই সারির মান নেবে।

### স্ক্রিপ্টে `pm.iterationData`

Post-response স্ক্রিপ্ট, যা সব সারির জন্য কাজ করে:

```js
const data = pm.iterationData;
const caseId = data.get('caseId');
const expectedStatus = Number(data.get('expectedStatus'));
const expectedPiStatus = data.get('expectedPiStatus');
const expectedErrorCode = data.get('expectedErrorCode');
const res = pm.response.json();

pm.test(`${caseId}: স্ট্যাটাস ${expectedStatus}`, function () {
  pm.response.to.have.status(expectedStatus);
});

if (expectedStatus === 200) {
  pm.test(`${caseId}: PaymentIntent ${expectedPiStatus}, সঠিক অ্যামাউন্ট`, function () {
    pm.expect(res.status).to.equal(expectedPiStatus);
    pm.expect(res.amount).to.equal(Number(data.get('amount')));
    pm.expect(res.currency).to.equal(data.get('currency'));
  });
} else {
  pm.test(`${caseId}: এরর কোড ${expectedErrorCode}`, function () {
    pm.expect(res.error).to.be.an('object');
    pm.expect(res.error.code).to.equal(expectedErrorCode);
  });
}
```

টেস্টের নামে `caseId` রাখায় রিপোর্টে সরাসরি দেখা যাবে কোন টেস্ট কেস ফেইল করেছে, যা আগের লেসনের ([পেমেন্ট টেস্ট কেস](/lessons/payment-test-cases/)) ID-র সাথে মেলে।

### Runner-এ CSV দেওয়া

Run collection স্ক্রিনে **Data** অংশে **Select File** দিয়ে CSV বেছে নিন। Postman Iterations সংখ্যা নিজে সারির সংখ্যা অনুযায়ী বসাবে। **Preview** দিয়ে ডেটা ঠিক পড়ছে কিনা দেখুন, তারপর Run।

> [!LIVE]
> ডেটা-ড্রিভেন রান মানে অল্প সময়ে অনেক API কল। শুধু Test Mode কী দিয়ে চালান, আর Runner-এ ১০০–৩০০ms Delay দিন। Stripe-এর API-তে রেট লিমিট আছে; সীমা পেরোলে 429 রেসপন্স আসে। Stripe-এর ওপর লোড টেস্ট কখনো করবেন না।

## হাতেকলমে অনুশীলন

1. JSONPlaceholder দিয়ে শুরু করুন: `GET https://jsonplaceholder.typicode.com/users/1`-এ তিনটি টেস্ট লিখুন: স্ট্যাটাস ২০০, Content-Type-এ `application/json`, আর `email` ফিল্ডে `@` আছে।
2. একই রিকোয়েস্টে একটি JSON Schema টেস্ট লিখুন: `id` integer, `name` ও `email` string, তিনটিই required।
3. `GET https://jsonplaceholder.typicode.com/users/9999`-এ একটি Negative টেস্ট লিখুন: স্ট্যাটাস ৪০৪।
4. Stripe ফোল্ডারে Create PaymentIntent-এ ওপরের JSON বডি ও Schema টেস্ট যোগ করুন, পাঠিয়ে Test Results দেখুন।
5. ওপরের CSV ফাইল বানিয়ে একটি নতুন রিকোয়েস্ট `Create PaymentIntent - data driven` তৈরি করুন, বডিতে `{{column}}` ভ্যারিয়েবল দিন।
6. Collection Runner-এ শুধু এই রিকোয়েস্ট বেছে, CSV দিয়ে, ২০০ms Delay-তে চালান। ৭টি Iteration-এর ফলাফল দেখুন।
7. CSV-তে ইচ্ছা করে একটি ভুল প্রত্যাশা দিন (যেমন TC-PAY-009-এ expectedStatus 200)। আবার চালিয়ে দেখুন ফেইল রিপোর্ট কেমন দেখায়।

<details><summary>সমাধান দেখুন: ধাপ ১–৩-এর স্ক্রিপ্ট</summary>

```js
// GET /users/1
const user = pm.response.json();

pm.test('Status 200', () => pm.response.to.have.status(200));

pm.test('JSON Content-Type', () => {
  pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');
});

pm.test('email বৈধ দেখতে', () => {
  pm.expect(user.email).to.include('@');
});

pm.test('User schema', () => {
  pm.response.to.have.jsonSchema({
    type: 'object',
    required: ['id', 'name', 'email'],
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      email: { type: 'string' }
    }
  });
});
```

```js
// GET /users/9999
pm.test('না থাকা ইউজারে 404', () => pm.response.to.have.status(404));
```

</details>

> [!MISTAKE]
> - শুধু স্ট্যাটাস ২০০ যাচাই করা; ২০০ রেসপন্সেও ভুল অ্যামাউন্ট বা ভুল স্ট্যাটাস থাকতে পারে।
> - Negative কেসে ২০০ আশা করা, বা উল্টো, শুধু "ফেইল হয়েছে" দেখে খুশি হওয়া, সঠিক এরর কোড না দেখা।
> - CSV-এর মান সংখ্যা ভেবে সরাসরি তুলনা করা; `Number()` দিয়ে রূপান্তর করুন।
> - CSV-তে কলামের নামে স্পেস বা ভুল বানান; তখন `{{amount}}` খালি থেকে যায়।
> - Delay ছাড়া Stripe-এ বড় ডেটা ফাইল চালানো।
> - টেস্টের নাম অস্পষ্ট রাখা ("test1")।

## সারসংক্ষেপ

- `pm.test` একটি টেস্ট, `pm.expect` ভেতরের যাচাই; ফলাফল Test Results-এ।
- স্ট্যাটাস, রেসপন্স টাইম, হেডার, বডির মান আর JSON Schema; পাঁচটিই যাচাই করুন।
- Negative টেস্টে সঠিক স্ট্যাটাস (যেমন 402, 400) আর সঠিক `error.code` প্রমাণ করুন।
- Collection Runner পুরো Collection চালায়; CSV দিলে প্রতি সারি একটি Iteration।
- CSV কলাম রিকোয়েস্টে `{{column}}`, স্ক্রিপ্টে `pm.iterationData.get('column')`।

## বাড়ির কাজ

1. CSV-তে আরও ৩টি সারি যোগ করুন: একটি Boundary (`amount` 49), একটি অবৈধ কারেন্সি, একটি `pm_card_amex`। প্রয়োজনে স্ক্রিপ্ট বদলান যাতে ৪০০ কেসও সামলায়।
2. Refund রিকোয়েস্টে টেস্ট লিখুন: Refund-এর `amount` রিকোয়েস্টের সমান, `status` succeeded বা pending, আর `payment_intent` আপনার সেভ করা ID-র সমান।
3. Collection আর Environment Export করে রাখুন। সাধারণত Export-এ শুধু Initial value যায়, তবু ফাইলটি টেক্সট এডিটরে খুলে নিশ্চিত হোন কোথাও `sk_test_` কী নেই। পরের লেসনে [Newman](/lessons/newman-cli-reports/) দিয়ে চালাব।
