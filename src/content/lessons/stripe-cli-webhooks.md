---
order: 17
level: 3
week: 6
title: "Stripe CLI দিয়ে Webhook টেস্ট: listen, trigger ও resend"
description: "Stripe Dashboard-এ Webhook এন্ডপয়েন্ট যোগ করা, Stripe CLI ইনস্টল, stripe listen দিয়ে লোকালে ইভেন্ট ফরোয়ার্ড, stripe trigger, events resend আর logs tail — ধাপে ধাপে।"
keywords: ["stripe cli", "stripe listen", "stripe trigger", "forward-to", "events resend", "logs tail", "whsec", "signing secret", "webhook endpoint", "workbench", "localhost webhook", "স্ট্রাইপ সিএলআই", "ওয়েবহুক টেস্ট"]
minutes: 60
quiz:
  - q: "stripe listen --forward-to localhost:3000/webhook চালিয়ে যে whsec_ পেলেন, সেটা আর Dashboard-এর এন্ডপয়েন্টের whsec_ আলাদা। লোকাল টেস্টে অ্যাপে কোনটা দেবেন?"
    options: ["Dashboard এন্ডপয়েন্টের whsec_", "দুটো জোড়া লাগিয়ে", "stripe listen-এর দেখানো whsec_, কারণ CLI ফরোয়ার্ড করা ইভেন্ট সেটা দিয়েই সাইন করে", "কোনোটাই লাগে না"]
    answer: 2
    explain: "প্রতিটা এন্ডপয়েন্টের নিজস্ব signing secret থাকে। CLI-এর মাধ্যমে আসা ইভেন্ট CLI-এর whsec_ দিয়ে সাইন হয়, তাই লোকালে সেটাই দিতে হয়; Dashboard-এর সিক্রেট দিলে সিগনেচার যাচাই ব্যর্থ হবে।"
  - q: "stripe trigger payment_intent.succeeded চালালে কী ঘটে?"
    options: ["CLI Test Mode-এ আসল API কল করে প্রয়োজনীয় অবজেক্ট বানায়, ফলে সত্যিকারের টেস্ট ইভেন্ট তৈরি হয়", "শুধু আপনার টার্মিনালে একটা নকল JSON প্রিন্ট হয়, Stripe-এ কিছু হয় না", "Live Mode-এ একটা পেমেন্ট হয়", "আগের শেষ ইভেন্টটা আবার পাঠায়"]
    answer: 0
    explain: "trigger ফিক্সচার ব্যবহার করে Sandbox-এ আসল অবজেক্ট (যেমন PaymentIntent) বানায়। তাই সাথে আনুষঙ্গিক ইভেন্টও (payment_intent.created, charge.succeeded) তৈরি হয় আর Dashboard-এ দেখা যায়।"
  - q: "আপনার অ্যাপের একটা বাগ ঠিক হয়েছে। গতকালের নির্দিষ্ট evt_ ইভেন্টটা আবার পাঠিয়ে দেখতে চান। কোন কমান্ড?"
    options: ["stripe trigger evt_...", "stripe events resend evt_...", "stripe listen --replay", "stripe logs tail evt_..."]
    answer: 1
    explain: "stripe events resend একটা বিদ্যমান ইভেন্ট আবার ডেলিভারি করে। trigger নতুন অবজেক্ট ও নতুন ইভেন্ট বানায়, আর logs tail শুধু API রিকোয়েস্ট লগ দেখায়।"
  - q: "stripe listen চালু, কিন্তু সব ইভেন্টের ভিড়ে আসল দুটো ইভেন্ট খুঁজে পাচ্ছেন না। কী করবেন?"
    options: ["Dashboard-এ ইভেন্ট বন্ধ করা", "নতুন Stripe অ্যাকাউন্ট খোলা", "টার্মিনাল ছোট করা", "--events payment_intent.succeeded,checkout.session.completed দিয়ে শুধু দরকারি ইভেন্ট শোনা"]
    answer: 3
    explain: "--events ফ্ল্যাগ কমা দিয়ে আলাদা করা ইভেন্টগুলোই ফরোয়ার্ড করে। এতে টার্মিনাল পরিষ্কার থাকে আর অ্যাপ শুধু প্রাসঙ্গিক ইভেন্ট পায়।"
  - q: "stripe listen-এর আউটপুটে একটা লাইন: <-- [500] POST http://localhost:3000/webhook [evt_...]। এর মানে কী?"
    options: ["Stripe-এর সার্ভারে ৫০০ এরর হয়েছে", "আপনার লোকাল অ্যাপ ইভেন্ট পেয়ে ৫০০ রেসপন্স দিয়েছে; অ্যাপের লগ দেখতে হবে", "CLI ইনস্টল ঠিক হয়নি", "ইভেন্টটা Live Mode-এর"]
    answer: 1
    explain: "<-- লাইন দেখায় আপনার ফরোয়ার্ড-টার্গেট কী Status দিয়েছে। ৫০০ মানে অ্যাপের ভেতরে এরর, তাই অ্যাপের কনসোল বা লগে কারণ খুঁজুন।"
---

আগের লেসনে টানেল দিয়ে Stripe-এর ইভেন্ট লোকালে এনেছি। কাজ করে, কিন্তু URL বদলায়, Dashboard বারবার আপডেট করতে হয়।

**Stripe CLI** (Stripe-এর অফিসিয়াল কমান্ড-লাইন টুল) এই কাজটা অনেক সহজ করে: কোনো পাবলিক URL ছাড়াই ইভেন্ট লোকালে আনে, ইচ্ছামতো ইভেন্ট তৈরি করে, পুরনো ইভেন্ট আবার পাঠায়। Webhook QA-র জন্য এটাই প্রতিদিনের হাতিয়ার।

## এই লেসনে যা শিখবেন

- Stripe Dashboard-এ Webhook এন্ডপয়েন্ট যোগ করা আর signing secret (`whsec_`) চেনা
- Stripe CLI ইনস্টল আর `stripe login`
- `stripe listen --forward-to` দিয়ে লোকালে ইভেন্ট আনা
- `stripe trigger` দিয়ে ইভেন্ট তৈরি
- `stripe events resend`, `stripe logs tail` আর `--events` ফিল্টার
- CLI-এর সিক্রেট আর Dashboard এন্ডপয়েন্টের সিক্রেটের পার্থক্য

## Dashboard-এ Webhook এন্ডপয়েন্ট যোগ করা

ডেপ্লয় করা সার্ভার (স্টেজিং) বা টানেলের পাবলিক URL-এর জন্য Dashboard-এ এন্ডপয়েন্ট যোগ করতে হয়।

1. Stripe Dashboard-এ **Test Mode / Sandbox** চালু আছে নিশ্চিত করুন।
2. **Developers** মেনু থেকে **Webhooks** খুলুন। নতুন Dashboard-এ এটা **Workbench**-এর ভেতরে থাকতে পারে, "Event destinations" নামে। মেনুর নাম সময়ের সাথে বদলায়; না পেলে Dashboard-এর সার্চে "Webhooks" লিখুন।
3. **Add endpoint** বা **Add destination** চাপুন।
4. Endpoint URL দিন, যেমন `https://staging.example.com/webhooks/stripe`। অবশ্যই HTTPS।
5. **ইভেন্ট বেছে নিন।** সব ইভেন্ট নয়, শুধু অ্যাপের যা লাগে: যেমন `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`।
6. সেভ করুন। এন্ডপয়েন্টের পেজে **Signing secret** দেখাবে (Reveal চাপতে হয়), শুরু `whsec_` দিয়ে।

> [!DANGER] whsec_ একটা সিক্রেট
> Signing secret দিয়েই অ্যাপ যাচাই করে যে ইভেন্টটা সত্যিই Stripe পাঠিয়েছে। এটা ফাঁস হলে যে কেউ নকল "পেমেন্ট সফল" ইভেন্ট বানাতে পারে। কোডে হার্ড-কোড নয়, environment variable-এ রাখুন (যেমন `STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX`), আর বাগ রিপোর্ট বা স্ক্রিনশটে কখনো দেখাবেন না। বিস্তারিত [Webhook সিগনেচার যাচাই](/lessons/webhook-signature-verification/) লেসনে।

এন্ডপয়েন্টের পেজে প্রতিটা ডেলিভারির চেষ্টা, Status Code আর রেসপন্স বডি দেখা যায়। এখান থেকে ব্যর্থ ইভেন্ট আবার পাঠানোর (Resend) বাটনও আছে।

## Stripe CLI ইনস্টল

অফিসিয়াল নির্দেশনা: https://docs.stripe.com/stripe-cli

| অপারেটিং সিস্টেম | উপায় |
|---|---|
| macOS | Homebrew: `brew install stripe/stripe-cli/stripe` |
| Windows | Scoop: `scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git` তারপর `scoop install stripe` |
| Linux (Debian/Ubuntu) | Stripe-এর apt রিপোজিটরি যোগ করে `sudo apt install stripe` (রিপো যোগের কমান্ড অফিসিয়াল ডকে দেখুন) |
| যেকোনো OS | GitHub releases থেকে ডাউনলোড: https://github.com/stripe/stripe-cli/releases , আনজিপ করে `stripe` ফাইলটা PATH-এ রাখুন |
| Docker | `docker run --rm -it stripe/stripe-cli` (বিস্তারিত ডকে) |

ইনস্টল হয়েছে কি না দেখুন:

```bash
stripe --version
```

```text
stripe version 1.x.x
```

### stripe login

```bash
stripe login
```

প্রত্যাশিত আউটপুট (সংক্ষেপে):

```text
Your pairing code is: humble-brave-quiet-tiger
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser or visit https://dashboard.stripe.com/stripecli/confirm_auth?t=XXXXXXXX (^C to quit)
```

Enter চাপলে ব্রাউজার খুলবে। দেখুন ব্রাউজারের pairing code আর টার্মিনালের code একই কি না, তারপর **Allow access** দিন। টার্মিনালে "Done! The Stripe CLI is configured…" ধরনের বার্তা আসবে।

> [!NOTE]
> `stripe login` CLI-কে Test Mode-এর জন্য সীমিত মেয়াদি কী দেয়। মেয়াদ শেষ হলে আবার `stripe login` চালাতে হয়। একাধিক Stripe অ্যাকাউন্ট থাকলে লগইনের সময় সঠিক অ্যাকাউন্ট/Sandbox বেছে নিন।

## stripe listen: ইভেন্ট লোকালে আনা

আগের লেসনের `receiver.js` (পোর্ট ৩০০০) চালু রাখুন। নতুন টার্মিনালে:

```bash
stripe listen --forward-to localhost:3000/webhook
```

প্রত্যাশিত আউটপুট:

```text
> Ready! You are using Stripe API Version [2024-06-20]. Your webhook signing secret is whsec_XXXXXXXXXXXXXXXX (^C to quit)
```

এই `whsec_`-টা **CLI-এর নিজস্ব** signing secret। লোকাল অ্যাপের `.env`-এ এটাই বসাবেন। শুধু সিক্রেটটা প্রিন্ট করতে:

```bash
stripe listen --print-secret
```

এখন Stripe Sandbox-এ যা ইভেন্ট ঘটবে, CLI সেগুলো Stripe থেকে টেনে এনে আপনার `localhost:3000/webhook`-এ POST করবে। কোনো পাবলিক URL লাগে না, কারণ সংযোগটা CLI নিজেই Stripe-এর দিকে খোলে।

### শুধু দরকারি ইভেন্ট: --events

```bash
stripe listen \
  --events payment_intent.succeeded,payment_intent.payment_failed,checkout.session.completed \
  --forward-to localhost:3000/webhook
```

কমা দিয়ে আলাদা করুন, মাঝে স্পেস দেবেন না।

## stripe trigger: ইভেন্ট তৈরি

`stripe listen` চালু রেখে তৃতীয় টার্মিনালে:

```bash
stripe trigger payment_intent.succeeded
```

```text
Setting up fixture for: payment_intent
Running fixture for: payment_intent
Trigger succeeded! Check dashboard for event details.
```

`stripe listen`-এর টার্মিনালে দেখবেন:

```text
2026-11-02 10:15:01   --> payment_intent.created [evt_TESTaaa111]
2026-11-02 10:15:01  <--  [200] POST http://localhost:3000/webhook [evt_TESTaaa111]
2026-11-02 10:15:02   --> charge.succeeded [evt_TESTbbb222]
2026-11-02 10:15:02  <--  [200] POST http://localhost:3000/webhook [evt_TESTbbb222]
2026-11-02 10:15:02   --> payment_intent.succeeded [evt_TESTccc333]
2026-11-02 10:15:02  <--  [200] POST http://localhost:3000/webhook [evt_TESTccc333]
```

- `-->` মানে Stripe থেকে ইভেন্ট এসেছে।
- `<--  [200]` মানে আপনার অ্যাপ সেটা পেয়ে ২০০ দিয়েছে। `[500]` হলে অ্যাপে এরর; `connect: connection refused` ধরনের বার্তা হলে অ্যাপ চলছেই না বা পোর্ট ভুল।

খেয়াল করুন: একটা trigger থেকে **কয়েকটা** ইভেন্ট এসেছে। কারণ `trigger` সত্যিই Sandbox-এ API কল করে PaymentIntent বানায় আর confirm করে। তাই এগুলো Dashboard-এর Events-এও দেখা যায়।

আরও কয়েকটা দরকারি trigger:

```bash
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed
stripe trigger charge.refunded
stripe trigger charge.dispute.created
```

কোন কোন ইভেন্ট trigger করা যায় দেখতে:

```bash
stripe trigger --help
```

> [!TIP] ফিক্সচারের ডেটা বদলানো
> trigger-এর তৈরি অবজেক্টের কিছু প্যারামিটার বদলানো যায় `--override` ফ্ল্যাগ দিয়ে, যেমন metadata-তে order_id বসানো, যাতে অ্যাপ সঠিক অর্ডার খুঁজে পায়। সিনট্যাক্স ভার্সন অনুযায়ী বদলাতে পারে, তাই `stripe trigger --help` আর অফিসিয়াল ডক দেখে নিন।

## stripe events resend: পুরনো ইভেন্ট আবার পাঠানো

ধরুন একটা ইভেন্টে অ্যাপ ৫০০ দিয়েছিল, ডেভেলপার বাগ ঠিক করেছেন। ঠিক **সেই** ইভেন্টটা আবার পাঠিয়ে যাচাই করতে চান:

```bash
stripe events resend evt_TESTccc333
```

একটা নির্দিষ্ট Dashboard এন্ডপয়েন্টে পাঠাতে চাইলে তার id (`we_` দিয়ে শুরু) দিন:

```bash
stripe events resend evt_TESTccc333 --webhook-endpoint=we_XXXXXXXX
```

`trigger` বনাম `resend`:

| কমান্ড | কী করে | কখন |
|---|---|---|
| `stripe trigger <type>` | নতুন অবজেক্ট, নতুন `evt_` id | নতুন সিনারিও টেস্ট |
| `stripe events resend <evt_id>` | একই ইভেন্ট, একই `evt_` id আবার ডেলিভারি | বাগ ফিক্স যাচাই, **ডুপ্লিকেট ইভেন্ট** হ্যান্ডলিং টেস্ট |

`resend` দিয়ে একই ইভেন্ট দুবার পাঠিয়ে দেখুন অ্যাপ কি দ্বিতীয়বার রসিদ ইমেইল পাঠায় বা স্টক আবার কমায়। এটা [Webhook টেস্ট কেস](/lessons/webhook-test-cases/) লেসনের অন্যতম গুরুত্বপূর্ণ কেস।

## stripe logs tail: API রিকোয়েস্ট লাইভ দেখা

```bash
stripe logs tail
```

এটা আপনার অ্যাকাউন্টে আসা **API রিকোয়েস্টগুলো** রিয়েল টাইমে দেখায়, যেমন:

```text
2026-11-02 10:20:11 [200] POST /v1/payment_intents [req_TESTxyz111]
2026-11-02 10:20:14 [402] POST /v1/payment_intents [req_TESTxyz222]
2026-11-02 10:20:20 [400] POST /v1/refunds [req_TESTxyz333]
```

অ্যাপের UI-তে কিছু চাপলে পেছনে কোন API কল যাচ্ছে, কোনটা ফেইল করছে, এক নজরে দেখা যায়। ফিল্টারও আছে, যেমন শুধু এরর দেখতে (ফ্ল্যাগের নাম `stripe logs tail --help` দিয়ে দেখে নিন)। মনে রাখুন: `listen` দেখায় **ইভেন্ট**, `logs tail` দেখায় **API রিকোয়েস্ট**।

## CLI সিক্রেট বনাম Dashboard এন্ডপয়েন্ট সিক্রেট

| বিষয় | `stripe listen`-এর whsec_ | Dashboard এন্ডপয়েন্টের whsec_ |
|---|---|---|
| কোথায় পাবেন | `stripe listen` শুরুতে বা `--print-secret` | এন্ডপয়েন্টের পেজে Reveal |
| কার জন্য | CLI-এর মাধ্যমে ফরোয়ার্ড হওয়া ইভেন্ট | Stripe সরাসরি ঐ URL-এ যা পাঠায় |
| কোথায় ব্যবহার | লোকাল ডেভেলপমেন্ট `.env` | স্টেজিং / প্রোডাকশন সার্ভারের environment |
| বদলায় কখন | সাধারণত একই থাকে, কিন্তু অন্য ডিভাইস বা নতুন লগইনে আলাদা হতে পারে | প্রতিটা এন্ডপয়েন্টের আলাদা; Roll করলে বদলায় |

সবচেয়ে সাধারণ বাগ: লোকালে Dashboard-এর সিক্রেট বসানো, বা স্টেজিংয়ে CLI-এর সিক্রেট বসানো। ফল: সব ইভেন্টে সিগনেচার যাচাই ব্যর্থ, অ্যাপ ৪০০ দেয়, কোনো অর্ডার Paid হয় না।

> [!LIVE]
> Stripe CLI ডিফল্টভাবে Test Mode-এ কাজ করে। কিছু কমান্ডে `--live` ফ্ল্যাগ আছে; শেখার সময় **কখনো** `--live` ব্যবহার করবেন না, আর `stripe trigger` কখনো Live অ্যাকাউন্টে চালাবেন না।

## হাতেকলমে অনুশীলন

1. Stripe CLI ইনস্টল করে `stripe --version` চালান।
2. `stripe login` দিয়ে Sandbox অ্যাকাউন্টে যুক্ত হন।
3. টার্মিনাল ১: `node receiver.js` ([আগের লেসন](/lessons/webhook-debug-tools/) থেকে)।
4. টার্মিনাল ২: `stripe listen --forward-to localhost:3000/webhook`। দেখানো `whsec_` কোথাও নোট করুন (শুধু নিজের লোকাল `.env`-এ)।
5. টার্মিনাল ৩: `stripe trigger payment_intent.succeeded`। তিন টার্মিনালের আউটপুট মিলিয়ে দেখুন। `receiver.js`-এ `stripe-signature` হেডার এসেছে কি না দেখুন।
6. `stripe trigger checkout.session.completed` চালান। কয়টা ইভেন্ট এল, তালিকা করুন।
7. `receiver.js`-এর পোর্ট বদলে ৩০০১ করে রিস্টার্ট করুন, আবার trigger করুন। `listen`-এ কী এরর দেখায়? তারপর আগের মতো ঠিক করুন।
8. একটা `evt_` id নিয়ে `stripe events resend` দিন। `receiver.js`-এ একই id দুবার এসেছে দেখুন।
9. `stripe listen`-কে `--events payment_intent.succeeded` দিয়ে রিস্টার্ট করে আবার `checkout.session.completed` trigger করুন। এবার কয়টা ইভেন্ট ফরোয়ার্ড হলো?
10. চতুর্থ টার্মিনালে `stripe logs tail` চালিয়ে Postman থেকে একটা ডিক্লাইন পেমেন্ট পাঠান; ৪০২ লাইনটা খুঁজুন।

> [!CHECK] সফলতার চেকলিস্ট
> - `-->` আর `<--` লাইনের মানে বলতে পারছেন
> - trigger আর resend-এর পার্থক্য হাতেকলমে দেখেছেন
> - `--events` দিয়ে ফিল্টার করেছেন
> - বলতে পারছেন লোকালে কোন `whsec_` আর স্টেজিংয়ে কোনটা

> [!MISTAKE] সাধারণ ভুল
> - লোকালে Dashboard এন্ডপয়েন্টের `whsec_` ব্যবহার করে "সিগনেচার সবসময় ফেইল" নিয়ে ঘণ্টার পর ঘণ্টা খোঁজা।
> - `stripe listen` বন্ধ রেখে trigger চালিয়ে ভাবা Webhook কাজ করছে না।
> - `--events` তালিকায় কমার পরে স্পেস দেওয়া।
> - `resend` আর `trigger` গুলিয়ে ফেলা: ডুপ্লিকেট টেস্টে `trigger` দিলে নতুন ইভেন্ট আসে, ডুপ্লিকেট নয়।
> - `--forward-to`-তে ভুল পাথ (`/webhooks` বনাম `/webhook`), ফলে ৪০৪।

## সারসংক্ষেপ

- Dashboard-এ এন্ডপয়েন্ট যোগ করে শুধু দরকারি ইভেন্ট বেছে নিন; প্রতিটা এন্ডপয়েন্টের নিজস্ব `whsec_` আছে।
- `stripe login` তারপর `stripe listen --forward-to localhost:3000/webhook`: পাবলিক URL ছাড়াই লোকালে ইভেন্ট।
- `stripe trigger` Sandbox-এ আসল অবজেক্ট বানিয়ে নতুন ইভেন্ট তৈরি করে; `stripe events resend` একই ইভেন্ট আবার পাঠায়।
- `--events` দিয়ে ফিল্টার, `stripe logs tail` দিয়ে API রিকোয়েস্ট লাইভ দেখা।
- লোকালে CLI-এর সিক্রেট, সার্ভারে Dashboard এন্ডপয়েন্টের সিক্রেট।

## বাড়ির কাজ

1. ৫টা ইভেন্ট (`payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `charge.refunded`, `charge.dispute.created`) trigger করে প্রতিটার সাথে আর কোন কোন ইভেন্ট এল, একটা টেবিলে লিখুন।
2. `receiver.js` বদলে এমন করুন যে একই `evt_` id দ্বিতীয়বার এলে কনসোলে "DUPLICATE" প্রিন্ট করে আর তবুও ২০০ দেয়। `resend` দিয়ে যাচাই করুন।

<details><summary>সমাধান দেখুন</summary>

কাজ ২-এর একটা সহজ রূপ (শুধু মেমরিতে রাখছে, শেখার জন্য যথেষ্ট; আসল অ্যাপে ডেটাবেসে রাখতে হয়):

```js
const seen = new Set();
// req.on('end', ...) এর ভেতরে:
let id = null;
try { id = JSON.parse(body).id; } catch {}
if (id && seen.has(id)) console.log('DUPLICATE', id);
if (id) seen.add(id);
res.writeHead(200);
res.end('ok');
```

</details>

পরের লেসনে শিখব এই `whsec_` দিয়ে কীভাবে প্রমাণ হয় ইভেন্টটা আসল: [Webhook সিগনেচার যাচাই](/lessons/webhook-signature-verification/)।
