---
title: "চিটশিট: পেমেন্ট, API ও Webhook টেস্টিং এক পাতায়"
description: "HTTP Status Code, Stripe টেস্ট কার্ড, PaymentIntent স্ট্যাটাস, Webhook ইভেন্ট, Stripe CLI, Postman স্ক্রিপ্ট, Newman, curl আর বাগ রিপোর্ট টেমপ্লেট: সব এক জায়গায়।"
---

কাজের সময় দ্রুত দেখে নেওয়ার জন্য এই পাতা। বিস্তারিত বুঝতে সংশ্লিষ্ট লেসনে যান। সব উদাহরণ শুধু Test Mode বা নিজের লোকাল পরিবেশের জন্য।

> [!LIVE]
> নিচের কার্ড নম্বর আর কমান্ড শুধু Stripe-এর Test Mode (Sandbox)-এ চলে। Live Mode-এ কখনো টেস্ট করবেন না, আর আসল কার্ড কখনো ব্যবহার করবেন না।

## HTTP Status Code

| কোড | নাম | পেমেন্টে সাধারণ অর্থ |
| --- | --- | --- |
| 200 | OK | রিকোয়েস্ট সফল, ডেটা ফেরত এসেছে |
| 201 | Created | নতুন রিসোর্স (যেমন অর্ডার) তৈরি হয়েছে |
| 204 | No Content | সফল, কিন্তু বডি নেই (যেমন ডিলিট) |
| 400 | Bad Request | প্যারামিটার ভুল বা অনুপস্থিত (যেমন amount নেই) |
| 401 | Unauthorized | API key নেই বা ভুল |
| 402 | Payment Required | Stripe-এ: প্যারামিটার ঠিক, কিন্তু রিকোয়েস্ট ব্যর্থ (যেমন কার্ড decline) |
| 403 | Forbidden | key আছে, কিন্তু এই কাজের অনুমতি নেই |
| 404 | Not Found | রিসোর্স নেই (ভুল ID, বা অন্য অ্যাকাউন্টের অবজেক্ট) |
| 409 | Conflict | সংঘর্ষ: যেমন একই Idempotency key একসাথে দুইবার চলছে |
| 422 | Unprocessable Entity | ফরম্যাট ঠিক, কিন্তু ডেটা নিয়ম ভাঙে (অনেক API ভ্যালিডেশনে দেয়) |
| 429 | Too Many Requests | Rate limit পার হয়েছে; একটু থেমে আবার চেষ্টা |
| 500 | Internal Server Error | সার্ভারের ভেতরের ত্রুটি |
| 502 / 503 / 504 | Bad Gateway / Unavailable / Timeout | গেটওয়ে বা সার্ভিস সাময়িক বন্ধ; retry নীতি দরকার |

## Stripe টেস্ট কার্ড

মেয়াদ: ভবিষ্যতের যেকোনো তারিখ (যেমন 12/34)। CVC: যেকোনো ৩ সংখ্যা। ZIP: যেকোনো মান।

| কার্ড নম্বর | ফলাফল |
| --- | --- |
| 4242 4242 4242 4242 | সফল পেমেন্ট (Visa) |
| 4000 0000 0000 0002 | Decline (`card_declined`, generic) |
| 4000 0000 0000 9995 | Decline: `insufficient_funds` (টাকা নেই) |
| 4000 0000 0000 0069 | Decline: `expired_card` (মেয়াদোত্তীর্ণ) |
| 4000 0000 0000 0127 | Decline: `incorrect_cvc` (ভুল CVC) |
| 4000 0000 0000 0119 | Decline: `processing_error` |
| 4000 0025 0000 3155 | 3D Secure অথেনটিকেশন লাগবে |
| 4000 0000 0000 3220 | 3D Secure 2 অথেনটিকেশন লাগবে |
| 4100 0000 0000 0019 | Radar ফ্রড হিসেবে ব্লক করে |

পূর্ণ ও সর্বশেষ তালিকা: [Stripe Testing ডক](https://docs.stripe.com/testing)। আরও জানতে: [Stripe টেস্ট কার্ড লেসন](/lessons/stripe-test-cards/)।

## PaymentIntent স্ট্যাটাস

| স্ট্যাটাস | অর্থ |
| --- | --- |
| `requires_payment_method` | পেমেন্ট মেথড দরকার (নতুন, বা আগের চেষ্টা ব্যর্থ) |
| `requires_confirmation` | মেথড আছে, confirm করা বাকি |
| `requires_action` | গ্রাহকের কাজ দরকার, যেমন 3D Secure |
| `processing` | প্রসেস হচ্ছে (কিছু মেথডে সময় লাগে) |
| `requires_capture` | অনুমোদিত, কিন্তু টাকা capture বাকি (manual capture) |
| `succeeded` | সফল; অর্ডার পূরণ করা যায় |
| `canceled` | বাতিল |

## সাধারণ Stripe Webhook ইভেন্ট

| ইভেন্ট | কখন আসে |
| --- | --- |
| `payment_intent.succeeded` | পেমেন্ট সফল |
| `payment_intent.payment_failed` | পেমেন্টের চেষ্টা ব্যর্থ |
| `payment_intent.requires_action` | 3DS-এর মতো অতিরিক্ত ধাপ দরকার |
| `payment_intent.canceled` | PaymentIntent বাতিল |
| `checkout.session.completed` | Checkout সেশন সম্পন্ন |
| `checkout.session.expired` | Checkout সেশনের মেয়াদ শেষ |
| `charge.refunded` | রিফান্ড হয়েছে |
| `charge.dispute.created` | গ্রাহক dispute (chargeback) খুলেছে |
| `invoice.paid` / `invoice.payment_failed` | সাবস্ক্রিপশনের ইনভয়েস সফল / ব্যর্থ |
| `customer.subscription.deleted` | সাবস্ক্রিপশন শেষ |

## Stripe CLI কমান্ড

```bash
stripe login                                   # ব্রাউজারে অনুমতি দিয়ে লগইন
stripe listen --forward-to localhost:4242/webhook   # ইভেন্ট লোকাল সার্ভারে পাঠান
stripe listen --events payment_intent.succeeded,checkout.session.completed --forward-to localhost:4242/webhook
stripe trigger payment_intent.succeeded        # টেস্ট ইভেন্ট তৈরি করুন
stripe trigger payment_intent.payment_failed
stripe events resend evt_XXXXXXXX              # একটি ইভেন্ট আবার পাঠান
stripe logs tail                               # API রিকোয়েস্টের লগ লাইভ দেখুন
stripe payment_intents create --amount=2000 --currency=usd
stripe customers list --limit=3
```

`stripe listen` চালু হলে টার্মিনালে একটি `whsec_XXXXXXXX` signing secret দেখায়। এটি শুধু লোকাল `.env`-এ রাখুন, কখনো কমিট বা স্ক্রিনশট নয়।

## Postman স্ক্রিপ্ট

স্ট্যাটাস কোড ও রেসপন্স টাইম:

```js
pm.test("Status 200", () => {
  pm.response.to.have.status(200);
});

pm.test("রেসপন্স ১ সেকেন্ডের কম", () => {
  pm.expect(pm.response.responseTime).to.be.below(1000);
});
```

JSON-এর মান যাচাই:

```js
const body = pm.response.json();
pm.test("PaymentIntent সফল", () => {
  pm.expect(body.status).to.eql("succeeded");
  pm.expect(body.amount).to.eql(2000);
  pm.expect(body.currency).to.eql("usd");
});
```

Schema যাচাই:

```js
const schema = {
  type: "object",
  required: ["id", "amount", "status"],
  properties: {
    id: { type: "string" },
    amount: { type: "integer" },
    status: { type: "string" }
  }
};
pm.test("Schema ঠিক আছে", () => {
  pm.response.to.have.jsonSchema(schema);
});
```

ভেরিয়েবল সেট ও পড়া:

```js
pm.environment.set("base_url", "https://api.stripe.com/v1");
pm.collectionVariables.set("currency", "usd");
const url = pm.environment.get("base_url");
const anyVar = pm.variables.get("currency"); // সব স্কোপ খুঁজে দেখে
```

চেইনিং (একটি রিকোয়েস্টের ID পরেরটায় ব্যবহার):

```js
// "Create PaymentIntent"-এর Tests ট্যাবে
const pi = pm.response.json();
pm.collectionVariables.set("pi_id", pi.id);
// পরের রিকোয়েস্টের URL: {{base_url}}/payment_intents/{{pi_id}}
```

Idempotency key (Pre-request Script-এ):

```js
// প্রতিবার নতুন UUID; Header: Idempotency-Key: {{idem_key}}
pm.collectionVariables.set("idem_key", pm.variables.replaceIn("{{$guid}}"));
```

## Newman কমান্ড

```bash
npm install -g newman newman-reporter-htmlextra
newman run collection.json -e test.postman_environment.json
newman run collection.json -e env.json -d data.csv          # ডেটা-ড্রিভেন
newman run collection.json -e env.json -n 3                 # ৩ বার চালান
newman run collection.json -e env.json --bail               # প্রথম ব্যর্থতায় থামুন
newman run collection.json -e env.json --env-var "secret_key=$STRIPE_TEST_KEY"
newman run collection.json -e env.json -r cli,htmlextra --reporter-htmlextra-export reports/report.html
```

## curl বেসিক

```bash
# GET
curl https://jsonplaceholder.typicode.com/posts/1

# POST JSON
curl -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"test","body":"hello","userId":1}'

# Stripe (Test Mode): key এর পরে কোলন, পাসওয়ার্ড খালি
curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_XXXXXXXXXXXXXXXX: \
  -H "Idempotency-Key: order-1001-try-1" \
  -d amount=2000 \
  -d currency=usd

# হেডারসহ পুরো রেসপন্স দেখুন
curl -i https://jsonplaceholder.typicode.com/posts/1
```

## বাগ রিপোর্ট টেমপ্লেট

```text
শিরোনাম: [Checkout] 4000 0000 0000 9995 কার্ডে decline হলেও অর্ডার "Paid" দেখায়
পরিবেশ: Staging, Stripe Test Mode, Chrome 130, Windows 11
বিল্ড/ভার্সন: v1.4.2
Severity: Critical      Priority: P1

ধাপ:
1. কার্টে ১টি পণ্য যোগ করুন
2. Checkout-এ কার্ড 4000 0000 0000 9995, মেয়াদ 12/34, CVC 123 দিন
3. Pay চাপুন

প্রত্যাশিত ফল: "টাকা পর্যাপ্ত নয়" বার্তা, অর্ডার "Payment failed"
আসল ফল: বার্তা ঠিক আসে, কিন্তু অর্ডার তালিকায় স্ট্যাটাস "Paid"

প্রমাণ: স্ক্রিনশট (key ও ব্যক্তিগত তথ্য ঢাকা), PaymentIntent ID pi_XXXXXXXX, সার্ভার লগের অংশ
নোট: payment_intent.payment_failed webhook আসার পরেও স্ট্যাটাস বদলায় না
```

## টেস্ট কেস টেমপ্লেট

| ফিল্ড | উদাহরণ |
| --- | --- |
| ID | TC-PAY-012 |
| শিরোনাম | insufficient funds কার্ডে পেমেন্ট ব্যর্থ হয় |
| পূর্বশর্ত | Test Mode চালু, কার্টে ১টি পণ্য |
| টেস্ট ডেটা | 4000 0000 0000 9995, 12/34, 123 |
| ধাপ | Checkout খুলুন → কার্ড দিন → Pay |
| প্রত্যাশিত ফল | ত্রুটি বার্তা, অর্ডার “Payment failed”, কোনো ইমেইল রসিদ নয় |
| প্রায়োরিটি | High |
| ধরন | Negative, Functional |
| আসল ফল / স্ট্যাটাস | Pass / Fail / Blocked |

## সিকিউরিটি কুইক চেকলিস্ট

শুধু নিজের অ্যাপ, নিজের Sandbox বা ইচ্ছাকৃতভাবে দুর্বল ল্যাবে। বিস্তারিত: [নৈতিকতা লেসন](/lessons/ethics-responsible-disclosure/)।

- দাম, পরিমাণ, কারেন্সি সার্ভার নিজে হিসাব করে; ক্লায়েন্টের পাঠানো দাম বিশ্বাস করে না
- অন্য ইউজারের অর্ডার/ইনভয়েস ID বদলে দেখলে 403 বা 404 আসে (BOLA নেই)
- Webhook-এর signature যাচাই হয়; সই ছাড়া বা পুরোনো ইভেন্ট বাতিল হয়
- একই ইভেন্ট দুইবার এলে অর্ডার দুইবার পূরণ হয় না
- Secret key (`sk_test_`/`sk_live_`) ফ্রন্টএন্ড, Git বা লগে নেই
- কার্ডের পূর্ণ নম্বর, CVC কোথাও সংরক্ষণ বা লগ হয় না
- Rate limit আছে: লগইন, কুপন, পেমেন্ট চেষ্টায়
- ত্রুটি বার্তায় stack trace বা ভেতরের তথ্য দেখায় না
- HTTPS সব জায়গায়; কুকিতে `Secure`, `HttpOnly`, `SameSite`
- রিফান্ড শুধু অনুমতিপ্রাপ্ত ভূমিকা করতে পারে, আর মূল অঙ্কের বেশি নয়
