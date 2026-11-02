---
order: 31
level: 5
week: 9
title: "Contract Testing ও OpenAPI: API বদলালে ক্লায়েন্ট যেন না ভাঙে"
description: "Consumer ও Provider-এর চুক্তি, OpenAPI স্পেক লেখা, Postman-এ স্কিমা ভ্যালিডেশন, Schemathesis, Pact ও Prism mock সার্ভার দিয়ে API-র চুক্তি টেস্ট করা শিখুন।"
keywords: ["contract testing", "openapi", "swagger", "json schema", "schemathesis", "pact", "prism", "mock server", "schema drift", "breaking change", "postman", "কন্ট্রাক্ট টেস্টিং", "এপিআই চুক্তি", "স্কিমা"]
minutes: 55
quiz:
  - q: "ব্যাকএন্ড টিম /orders রেসপন্সে total_amount ফিল্ডের নাম বদলে amount করে দিল। ওয়েব ও মোবাইল অ্যাপ হঠাৎ “৳undefined” দেখাচ্ছে। এটা কোন সমস্যা?"
    options: ["Network timeout", "Schema drift: চুক্তি না মেনে API বদলে যাওয়া, যা একটা breaking change", "ব্রাউজার ক্যাশ", "Rate limiting"]
    answer: 1
    explain: "ফিল্ড রিনেম করা breaking change। Consumer পুরোনো নাম আশা করছে, তাই ভেঙে গেছে। Contract test থাকলে মার্জের আগেই ধরা পড়ত।"
  - q: "নিচের কোন পরিবর্তনটি সাধারণত non-breaking?"
    options: ["একটা required response ফিল্ড মুছে ফেলা", "রিকোয়েস্টে নতুন required ফিল্ড যোগ করা", "রেসপন্সে নতুন optional ফিল্ড যোগ করা", "status enum-এর একটা মান মুছে ফেলা"]
    answer: 2
    explain: "নতুন optional ফিল্ড যোগ করলে পুরোনো ক্লায়েন্ট সেটা উপেক্ষা করতে পারে। বাকি তিনটি পুরোনো ক্লায়েন্টকে ভাঙতে পারে।"
  - q: "ফ্রন্টএন্ড টিমের ব্যাকএন্ড এখনো তৈরি হয়নি, কিন্তু openapi.yaml তৈরি আছে। তারা আজই কাজ শুরু করতে চায়। কোনটা সবচেয়ে কাজে লাগবে?"
    options: ["Prism দিয়ে OpenAPI থেকে mock সার্ভার চালানো", "Stripe-এর Live API ব্যবহার করা", "ব্যাকএন্ড শেষ হওয়া পর্যন্ত অপেক্ষা", "k6 দিয়ে লোড টেস্ট"]
    answer: 0
    explain: "Prism স্পেক পড়ে উদাহরণভিত্তিক নকল রেসপন্স দেয়, তাই আসল সার্ভার ছাড়াই কাজ শুরু করা যায়।"
  - q: "Schemathesis কোথায় চালানো উচিত?"
    options: ["যেকোনো পাবলিক API-তে, কারণ এটা শুধু পড়ে", "Stripe-এর প্রোডাকশন API-তে", "অন্য কোম্পানির staging-এ", "নিজের API-র লোকাল বা staging এনভায়রনমেন্টে, কারণ এটা প্রচুর অদ্ভুত ইনপুট পাঠায়"]
    answer: 3
    explain: "Schemathesis property-based টেস্টে হাজারো ভিন্ন ইনপুট পাঠায়, POST করে ডেটাও তৈরি করতে পারে। তাই শুধু নিজের সিস্টেমে, অনুমতিসহ।"
  - q: "Pact-এর মতো consumer-driven contract testing-এ চুক্তিটা কে প্রথমে লেখে?"
    options: ["Provider (API বানানো টিম)", "Consumer (API ব্যবহারকারী), তারপর Provider সেটা যাচাই করে", "QA ম্যানেজার হাতে লেখে", "Stripe লিখে দেয়"]
    answer: 1
    explain: "Consumer-driven মানে consumer-এর টেস্ট থেকে প্রত্যাশা (pact ফাইল) তৈরি হয়, provider নিজের বিল্ডে সেই প্রত্যাশা পূরণ হচ্ছে কিনা যাচাই করে।"
---

একটা কোর্স-বিক্রির সাইটে ওয়েব অ্যাপ, অ্যান্ড্রয়েড অ্যাপ আর অ্যাডমিন প্যানেল তিনটাই একই পেমেন্ট API ব্যবহার করে। ব্যাকএন্ডে একটা ছোট ফিল্ডের নাম বদলালেই তিন জায়গায় একসাথে বাগ।

এই সমস্যা আটকানোর উপায় **Contract Testing** আর তার ভিত্তি **OpenAPI** স্পেক। চলুন শিখি।

## এই লেসনে যা শিখবেন

- Contract testing কী, consumer ও provider কে
- Schema drift কীভাবে ক্লায়েন্ট ভাঙে
- OpenAPI/Swagger স্পেকের মূল অংশ: paths, schemas, responses
- `/orders` ও `/payments` API-র একটা ছোট OpenAPI উদাহরণ
- Postman-এ OpenAPI ইমপোর্ট এবং `pm.response.to.have.jsonSchema` দিয়ে যাচাই
- Schemathesis, Pact আর Prism mock সার্ভারের ধারণা ও ব্যবহার
- Breaking বনাম non-breaking পরিবর্তন চেনা

## Contract Testing কী

**Contract** (চুক্তি) মানে দুই পক্ষের মধ্যে একটা লিখিত প্রতিশ্রুতি: "এই রিকোয়েস্ট পাঠালে এই আকারের রেসপন্স পাবে।"

- **Provider**: যে API সরবরাহ করে (যেমন পেমেন্ট ব্যাকএন্ড)
- **Consumer**: যে API ব্যবহার করে (ওয়েব অ্যাপ, মোবাইল অ্যাপ, অন্য মাইক্রোসার্ভিস)

একটা উপমা: পাঠাও কুরিয়ার আর একটা অনলাইন শপের মধ্যে চুক্তি আছে, পার্সেলের লেবেলে নাম, ফোন, ঠিকানা কোথায় থাকবে। শপ হঠাৎ লেবেলের ফরম্যাট বদলালে কুরিয়ারের স্ক্যানার আর পড়তে পারবে না। কেউ খারাপ কিছু করেনি, শুধু চুক্তি ভেঙেছে।

### Schema drift: চুপচাপ ভাঙন

**Schema drift** (ডকুমেন্টে যা লেখা আর API আসলে যা দেয়, তার মধ্যে ধীরে ধীরে পার্থক্য তৈরি হওয়া) পেমেন্ট সিস্টেমে খুব সাধারণ। উদাহরণ:

| আগে | পরে | ফল |
|---|---|---|
| `"amount": 125000` (পয়সা, integer) | `"amount": "1250.00"` (টাকা, string) | মোবাইল অ্যাপ ১০০ গুণ কম বা ভুল দাম দেখায় |
| `"status": "paid"` | `"status": "succeeded"` | অ্যাপের `if (status === 'paid')` আর কাজ করে না, অর্ডার কনফার্ম হয় না |
| `customer_email` সবসময় থাকত | এখন কখনো `null` | রিসিট পাঠানোর কোড ক্র্যাশ |

সাধারণ ফাংশনাল টেস্ট অনেক সময় এগুলো ধরে না, কারণ status code তখনো `200`। Contract test রেসপন্সের **আকার** যাচাই করে।

## OpenAPI স্পেকের মূল কথা

**OpenAPI** (আগের নাম Swagger) হলো API বর্ণনা করার একটা স্ট্যান্ডার্ড ফরম্যাট, YAML বা JSON-এ লেখা। একটা ফাইলে থাকে কোন URL আছে, কোন মেথড, কী ইনপুট লাগে, কী আউটপুট আসে। অফিসিয়াল সাইট: [OpenAPI Initiative](https://www.openapis.org) এবং গাইড [learn.openapis.org](https://learn.openapis.org)।

মূল অংশগুলো:

| অংশ | কাজ |
|---|---|
| `openapi` | স্পেকের ভার্সন, যেমন `3.0.3` |
| `info` | API-র নাম, ভার্সন |
| `servers` | বেস URL (লোকাল, staging) |
| `paths` | প্রতিটা endpoint ও মেথড |
| `components/schemas` | বারবার ব্যবহৃত ডেটার আকার (Order, Payment) |
| `responses` | প্রতিটা status code-এ কী আসবে |

### একটা ছোট উদাহরণ: অর্ডার ও পেমেন্ট API

```yaml
openapi: 3.0.3
info:
  title: Shop Payments API
  version: 1.0.0
servers:
  - url: http://localhost:3000
paths:
  /orders:
    post:
      summary: Create an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewOrder'
      responses:
        '201':
          description: Order created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '400':
          description: Invalid input
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
  /orders/{orderId}:
    get:
      summary: Get one order
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: The order
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        '404':
          description: Not found
  /payments:
    post:
      summary: Start a payment for an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [orderId]
              properties:
                orderId:
                  type: string
      responses:
        '200':
          description: Payment started
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Payment'
components:
  schemas:
    NewOrder:
      type: object
      required: [items, currency]
      properties:
        items:
          type: array
          minItems: 1
          items:
            type: object
            required: [sku, qty]
            properties:
              sku: { type: string }
              qty: { type: integer, minimum: 1 }
        currency:
          type: string
          enum: [bdt, usd]
    Order:
      type: object
      required: [id, amount, currency, status]
      properties:
        id: { type: string, example: ord_1001 }
        amount:
          type: integer
          description: Smallest currency unit (poisha for BDT)
          example: 125000
        currency: { type: string, example: bdt }
        status:
          type: string
          enum: [pending, paid, failed, refunded]
    Payment:
      type: object
      required: [paymentIntentId, clientSecret, status]
      properties:
        paymentIntentId: { type: string, example: pi_XXXXXXXX }
        clientSecret: { type: string, example: pi_XXXXXXXX_secret_XXXXXXXX }
        status: { type: string, example: requires_payment_method }
    Error:
      type: object
      required: [message]
      properties:
        message: { type: string }
```

খেয়াল করুন: `amount` integer এবং বর্ণনায় লেখা "smallest currency unit"। এই এক লাইনই উপরের "পয়সা বনাম টাকা" বাগটা আটকাতে পারে, যদি টেস্ট এটা যাচাই করে।

> [!NOTE] Stripe-ও OpenAPI স্পেক প্রকাশ করে
> Stripe তাদের পুরো API-র OpenAPI স্পেক GitHub-এ পাবলিক রাখে: [github.com/stripe/openapi](https://github.com/stripe/openapi)। বড় ফাইল, কিন্তু খুলে দেখুন বাস্তব জগতে `PaymentIntent`-এর স্কিমা কেমন লেখা হয়। এটা পড়ার ও শেখার জন্য; Stripe-এর API-তে কোনো ফাজিং বা অটো-জেনারেটেড টেস্ট চালাবেন না।

## OpenAPI থেকে টেস্ট: Postman ও JSON Schema

### Postman-এ OpenAPI ইমপোর্ট

Postman-এ **Import** বাটনে `openapi.yaml` ফাইলটা দিলে Postman একটা collection বানিয়ে দেয়, প্রতিটা path ও মেথডের জন্য একটা রিকোয়েস্ট, উদাহরণ বডিসহ। বিস্তারিত Postman ডকুমেন্টেশনে "Import an API specification" লিখে খুঁজুন: [learning.postman.com](https://learning.postman.com)।

স্ক্রিনশট বর্ণনা: Import ডায়ালগে ফাইল দেওয়ার পর "OpenAPI 3.0 with 3 paths" ধরনের লেখা আসে, নিচে "Import" চাপলে বাঁদিকের Collections প্যানেলে "Shop Payments API" ফোল্ডার তৈরি হয়।

Collection ও environment-এর ব্যবহার আগে শিখেছেন: [/lessons/postman-collections-environments/](/lessons/postman-collections-environments/)।

### pm.response.to.have.jsonSchema দিয়ে স্কিমা যাচাই

Postman-এর টেস্ট স্ক্রিপ্টে JSON Schema দিয়ে রেসপন্সের আকার যাচাই করা যায়:

```js
const orderSchema = {
  type: 'object',
  required: ['id', 'amount', 'currency', 'status'],
  properties: {
    id: { type: 'string' },
    amount: { type: 'integer', minimum: 1 },
    currency: { type: 'string', enum: ['bdt', 'usd'] },
    status: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
  },
};

pm.test('Status is 201', () => {
  pm.response.to.have.status(201);
});

pm.test('Order matches the contract', () => {
  pm.response.to.have.jsonSchema(orderSchema);
});
```

এখন কেউ `amount`-কে string বানালে বা `status`-এ `"succeeded"` পাঠালে টেস্ট লাল হবে। Newman দিয়ে CI-তে চালালে মার্জের আগেই ধরা পড়বে ([/lessons/newman-cli-reports/](/lessons/newman-cli-reports/))।

> [!TIP] স্কিমা একবার লিখুন
> স্কিমাটা প্রতিটা রিকোয়েস্টে কপি না করে collection-এর Pre-request বা একটা collection variable-এ রাখুন, তারপর `JSON.parse(pm.collectionVariables.get('orderSchema'))` দিয়ে পড়ুন। স্পেক বদলালে এক জায়গায় আপডেট করলেই হয়।

## অটোমেটেড টুল: Schemathesis, Pact, Prism

### Schemathesis: স্পেক থেকে হাজারো টেস্ট

**Schemathesis** একটা ওপেন সোর্স টুল যা আপনার OpenAPI স্পেক পড়ে **property-based testing** (হাতে লেখা কয়েকটা কেস নয়, স্পেক মেনে বা ভেঙে অনেক ধরনের ইনপুট স্বয়ংক্রিয়ভাবে বানিয়ে পাঠানো) করে। যেমন `qty`-তে `0`, `-1`, বিশাল সংখ্যা, খালি `items` অ্যারে। তারপর দেখে সার্ভার `500` দিচ্ছে কিনা বা রেসপন্স স্পেকের সাথে মিলছে কিনা।

সাধারণ ব্যবহার (Python লাগে):

```bash
pip install schemathesis

# আপনার API যদি নিজের স্পেক একটা URL-এ দেয়
schemathesis run http://localhost:3000/openapi.json
```

স্পেক ফাইল আলাদা থাকলে বেস URL দিতে একটা অপশন লাগে; এর নাম ভার্সন ভেদে আলাদা (`--url` বা পুরোনো ভার্সনে `--base-url`), তাই `schemathesis run --help` দেখে নিন। ডকুমেন্টেশন: [schemathesis.readthedocs.io](https://schemathesis.readthedocs.io)।

> [!DANGER] শুধু নিজের API-তে
> Schemathesis প্রচুর অদ্ভুত রিকোয়েস্ট পাঠায় এবং POST করে আসল ডেটা তৈরি করতে পারে। এটা চালাবেন শুধু নিজের লোকাল বা staging API-তে, যেখানে Stripe কল Test Mode বা mock-এ। Stripe, bKash বা অন্য কারো API-তে কখনো নয়।

### Pact: consumer-driven contract testing

**Pact** একটু ভিন্ন দর্শন। এখানে চুক্তি লেখে **consumer**:

1. মোবাইল অ্যাপের টেস্টে লেখা হয়: "আমি `GET /orders/ord_1001` চাইলে `id`, `amount` (integer), `status` আশা করি।"
2. এই প্রত্যাশা থেকে একটা **pact ফাইল** (JSON চুক্তি) তৈরি হয়।
3. Provider (ব্যাকএন্ড) নিজের CI-তে সেই pact ফাইল চালিয়ে যাচাই করে যে সে প্রতিশ্রুতি রাখছে।
4. ব্যাকএন্ড কোনো ফিল্ড মুছলে যেটা মোবাইল অ্যাপ ব্যবহার করে, ব্যাকএন্ডের বিল্ডই ফেল করে।

লাভ: provider জানে কোন consumer আসলে কোন ফিল্ড ব্যবহার করে, তাই অব্যবহৃত ফিল্ড নির্ভয়ে বদলাতে পারে। বিস্তারিত: [docs.pact.io](https://docs.pact.io)। জুনিয়র QA হিসেবে ধারণাটা বুঝলেই যথেষ্ট; সেটআপ সাধারণত ডেভেলপারদের সাথে মিলে হয়।

### Prism: স্পেক থেকে mock সার্ভার

**Prism** (Stoplight-এর ওপেন সোর্স টুল) আপনার `openapi.yaml` পড়ে একটা নকল সার্ভার চালায়, যা স্পেকের `example` থেকে রেসপন্স দেয়:

```bash
npx @stoplight/prism-cli mock openapi.yaml
```

ডিফল্টভাবে এটা `http://127.0.0.1:4010`-এ চলে। এখন:

```bash
curl -X POST http://127.0.0.1:4010/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sku":"COURSE-QA","qty":1}],"currency":"bdt"}'
```

উত্তরে স্পেকের উদাহরণ অনুযায়ী `ord_1001`, `125000` ইত্যাদি আসবে। বডিতে `items` বাদ দিলে Prism রিকোয়েস্ট ভ্যালিডেট করে এরর দেয়।

কাজে লাগে যখন:

- ব্যাকএন্ড তৈরি হয়নি, কিন্তু ফ্রন্টএন্ড বা QA কাজ শুরু করতে চায়
- লোড টেস্ট বা UI টেস্টে বাইরের পেমেন্ট সার্ভিসের জায়গায় একটা স্থির mock দরকার ([/lessons/k6-load-testing/](/lessons/k6-load-testing/))
- Postman collection-এর টেস্টগুলো আগে mock-এ চালিয়ে দেখতে চান

## Breaking বনাম non-breaking পরিবর্তন

রিভিউতে কোনো API পরিবর্তন দেখলে এই টেবিল মিলিয়ে নিন:

| পরিবর্তন | ধরন | কেন |
|---|---|---|
| রেসপন্সে নতুন optional ফিল্ড যোগ | Non-breaking | পুরোনো ক্লায়েন্ট উপেক্ষা করে |
| নতুন endpoint যোগ | Non-breaking | কেউ এখনো ব্যবহার করে না |
| রিকোয়েস্টে নতুন optional প্যারামিটার | Non-breaking | না পাঠালেও চলে |
| রেসপন্স থেকে ফিল্ড মুছে ফেলা | Breaking | consumer সেটা পড়ছিল |
| ফিল্ডের নাম বদলানো | Breaking | মুছে নতুন যোগ করার সমান |
| ফিল্ডের type বদলানো (integer → string) | Breaking | হিসাব ও পার্সিং ভাঙে |
| রিকোয়েস্টে নতুন required ফিল্ড | Breaking | পুরোনো ক্লায়েন্ট পাঠায় না, ৪০০ পায় |
| enum-এ নতুন মান যোগ (রেসপন্সে) | সাবধান | কঠোর ক্লায়েন্ট অচেনা মানে ক্র্যাশ করতে পারে |
| enum থেকে মান মুছে ফেলা | Breaking | পুরোনো লজিক আর মেলে না |
| endpoint মুছে ফেলা বা URL বদলানো | Breaking | ৪০৪ |

Breaking change দরকার হলে সাধারণ সমাধান হলো **versioning** (যেমন `/v2/orders`) বা কিছুদিন পুরোনো ও নতুন দুটো ফিল্ডই পাঠানো। Stripe নিজেও API ভার্সনিং ব্যবহার করে, প্রতিটা অ্যাকাউন্ট একটা নির্দিষ্ট API version-এ থাকে।

## হাতেকলমে অনুশীলন

1. উপরের YAML কপি করে `openapi.yaml` নামে সেভ করুন।
2. ব্রাউজারে [editor.swagger.io](https://editor.swagger.io) খুলে YAML পেস্ট করুন। ডানদিকে সুন্দর ডকুমেন্টেশন দেখবেন; কোনো এরর থাকলে উপরে লাল লেখা আসবে।
3. Node.js ইনস্টল থাকলে `npx @stoplight/prism-cli mock openapi.yaml` চালান।
4. Postman-এ `openapi.yaml` ইমপোর্ট করুন। collection-এর `baseUrl` ভেরিয়েবল `http://127.0.0.1:4010` করুন।
5. `POST /orders` রিকোয়েস্টে উপরের `jsonSchema` টেস্ট যোগ করে চালান। সবুজ হওয়া উচিত।
6. এবার স্কিমায় `amount`-এর type `string` করে দিন এবং আবার চালান। টেস্ট লাল হলো তো? এভাবেই schema drift ধরা পড়ে।
7. বডি থেকে `currency` বাদ দিয়ে পাঠান এবং Prism কী এরর দেয় দেখুন।
8. Prism বন্ধ করতে টার্মিনালে `Ctrl + C`।

> [!MISTAKE] সাধারণ ভুল
> - স্পেক একবার লিখে আর আপডেট না করা। পুরোনো স্পেক মিথ্যা নিরাপত্তা দেয়।
> - শুধু status code চেক করে ধরে নেওয়া রেসপন্স ঠিক আছে।
> - স্কিমায় `required` না লেখা, ফলে ফিল্ড হারিয়ে গেলেও টেস্ট পাস।
> - Schemathesis-এর মতো টুল অন্যের API বা Stripe-এ চালানো।
> - স্পেকের `example`-এ আসল API key, ইমেইল বা ফোন নম্বর রাখা। সবসময় `pk_test_XXXXXXXX` ধরনের প্লেসহোল্ডার।
> - "শুধু একটা ফিল্ডের নাম বদলেছি" ভেবে রিভিউ ছাড়া মার্জ করা।

## সারসংক্ষেপ

- Contract testing যাচাই করে provider আর consumer একই চুক্তি মানছে কিনা; schema drift এর প্রধান শত্রু।
- OpenAPI স্পেকে paths, schemas, responses এক জায়গায় থাকে; এটাই চুক্তির লিখিত রূপ।
- Postman OpenAPI থেকে collection বানায়, আর `pm.response.to.have.jsonSchema` রেসপন্সের আকার যাচাই করে।
- Schemathesis স্পেক থেকে স্বয়ংক্রিয় ইনপুট বানিয়ে টেস্ট করে, শুধু নিজের API-তে।
- Pact consumer-এর প্রত্যাশা থেকে চুক্তি বানায়; Prism স্পেক থেকে mock সার্ভার চালায়।
- ফিল্ড মোছা, রিনেম, type বদল, নতুন required ইনপুট: এগুলো breaking change।

## বাড়ির কাজ

1. উপরের স্পেকে `POST /refunds` endpoint যোগ করুন: ইনপুট `orderId` ও `amount` (integer, ঐচ্ছিক, না দিলে পুরো রিফান্ড), রেসপন্স `refundId`, `status`। Swagger Editor-এ এরর ছাড়া দেখান।
2. নিচের ৩টা পরিবর্তন breaking নাকি non-breaking, কারণসহ লিখুন: (ক) `Order`-এ `paidAt` optional ফিল্ড যোগ, (খ) `currency` enum থেকে `usd` মুছে ফেলা, (গ) `POST /payments`-এ `returnUrl` required করা।

<details><summary>সমাধান দেখুন</summary>

(ক) Non-breaking: নতুন optional ফিল্ড, পুরোনো ক্লায়েন্ট উপেক্ষা করবে। (খ) Breaking: যেসব ক্লায়েন্ট `usd` পাঠায় তারা এখন ৪০০ পাবে, আর পুরোনো `usd` অর্ডার পড়তে গেলে স্কিমা মিলবে না। (গ) Breaking: পুরোনো অ্যাপ `returnUrl` পাঠায় না, তাই সব পেমেন্ট শুরু হওয়াই বন্ধ হয়ে যাবে। নিরাপদ পথ: প্রথমে optional করে ডিফল্ট মান দিন, সব ক্লায়েন্ট আপডেট হলে তারপর required করুন।

</details>
