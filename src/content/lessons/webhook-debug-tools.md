---
order: 16
level: 3
week: 6
title: "Webhook ডিবাগ টুলস: webhook.site, Beeceptor, ngrok ও Cloudflare Tunnel"
description: "ফ্রি টুল দিয়ে Webhook রিকোয়েস্ট ধরুন ও পরীক্ষা করুন: webhook.site, Beeceptor, ngrok আর Cloudflare Tunnel-এর তুলনা, ধাপে ধাপে ব্যবহার আর প্রাইভেসি সতর্কতা।"
keywords: ["webhook.site", "beeceptor", "ngrok", "cloudflare tunnel", "cloudflared", "trycloudflare", "localhost", "tunnel", "webhook debug", "request inspector", "curl post", "ওয়েবহুক ডিবাগ", "টানেল"]
minutes: 50
quiz:
  - q: "আপনার Webhook কোড ল্যাপটপে localhost:3000-এ চলছে। Stripe কেন সরাসরি http://localhost:3000/webhook-এ ইভেন্ট পাঠাতে পারবে না?"
    options: ["Stripe শুধু HTTPS পোর্ট ৮০৮০ সাপোর্ট করে", "localhost মানে ‘এই কম্পিউটার’; ইন্টারনেট থেকে Stripe-এর সার্ভার আপনার ল্যাপটপে পৌঁছাতে পারে না, তাই টানেল বা CLI লাগে", "localhost-এ JSON পার্স হয় না", "Test Mode-এ Webhook কাজ করে না"]
    answer: 1
    explain: "localhost প্রতিটা কম্পিউটারের নিজের ঠিকানা। Stripe-এর সার্ভারের কাছে localhost মানে Stripe-এর নিজের মেশিন। তাই ngrok/Cloudflare Tunnel-এর মতো পাবলিক URL বা Stripe CLI-এর ফরোয়ার্ডিং লাগে।"
  - q: "শুধু দেখতে চান Stripe ঠিক কোন হেডার আর বডি পাঠায়, কোনো কোড লিখতে চান না। সবচেয়ে দ্রুত টুল কোনটা?"
    options: ["webhook.site-এর একটা ইউনিক URL", "নিজের সার্ভার ডেপ্লয় করা", "ngrok-এর পেইড প্ল্যান", "Burp Suite"]
    answer: 0
    explain: "webhook.site খুললেই একটা ইউনিক URL পান, আর সেখানে আসা প্রতিটা রিকোয়েস্টের হেডার ও বডি ব্রাউজারে দেখা যায়। কোড বা ইনস্টল লাগে না।"
  - q: "একজন টেস্টার প্রোডাকশন ডেটাবেসের আসল গ্রাহকদের তথ্যসহ Webhook webhook.site-এ পাঠাচ্ছেন। কী সমস্যা?"
    options: ["কোনো সমস্যা নেই, URL তো গোপন", "শুধু ধীর হবে", "এই সার্ভিসগুলোর URL পাবলিক/তৃতীয় পক্ষের; আসল গ্রাহকের তথ্য বা সিক্রেট সেখানে পাঠানো ডেটা ফাঁসের ঝুঁকি", "webhook.site JSON নেয় না"]
    answer: 2
    explain: "যার কাছে URL আছে সে ডেটা দেখতে পারে, আর ডেটা তৃতীয় পক্ষের সার্ভারে জমা থাকে। এসব টুলে শুধু Test Mode-এর নকল ডেটা পাঠান।"
  - q: "cloudflared tunnel --url http://localhost:3000 চালানোর পর কী পাবেন?"
    options: ["একটা স্থায়ী কাস্টম ডোমেইন", "Stripe-এর whsec_ সিক্রেট", "শুধু লোকাল নেটওয়ার্কে কাজ করে এমন একটা IP", "একটা অস্থায়ী https://...trycloudflare.com URL, যা লোকাল পোর্ট ৩০০০-এ ফরোয়ার্ড করে"]
    answer: 3
    explain: "এটা Cloudflare-এর quick tunnel: অ্যাকাউন্ট ছাড়াই একটা র‍্যান্ডম trycloudflare.com URL দেয়, যা বন্ধ করলে চলে যায়। স্থায়ী ডোমেইনের জন্য অ্যাকাউন্টসহ named tunnel লাগে।"
  - q: "ngrok দিয়ে টেস্টের সময় Stripe-এর ডেলিভারি ব্যর্থ, কিন্তু আপনি নিশ্চিত নন রিকোয়েস্ট আপনার অ্যাপে পৌঁছেছে কি না। প্রথমে কোথায় দেখবেন?"
    options: ["ngrok-এর লোকাল ইন্সপেক্টর http://localhost:4040, যেখানে আসা রিকোয়েস্ট আর আপনার অ্যাপের রেসপন্স দেখা যায়", "Stripe-এর Customer তালিকা", "ব্রাউজারের ইতিহাস", "Postman Console"]
    answer: 0
    explain: "ngrok চলার সময় localhost:4040-এ একটা ওয়েব ইন্সপেক্টর থাকে। সেখানে দেখা যায় রিকোয়েস্ট এসেছে কি না আর অ্যাপ কোন Status Code দিয়েছে; চাইলে replay-ও করা যায়।"
---

Webhook টেস্টের সবচেয়ে বড় সমস্যা: রিকোয়েস্টটা **চোখে দেখা যায় না**। Stripe কোথাও একটা POST পাঠায়, আর আপনি শুধু ফলাফল দেখেন: অর্ডার আপডেট হলো, নাকি হলো না।

এই লেসনে ৪টা ফ্রি টুল শিখব, যা দিয়ে Webhook রিকোয়েস্ট ধরা, পড়া আর নিজের ল্যাপটপে আনা যায়।

## এই লেসনে যা শিখবেন

- কেন Webhook ডিবাগ করতে বিশেষ টুল লাগে
- **webhook.site** আর **Beeceptor**: রিকোয়েস্ট ধরে দেখানো (request inspector)
- **ngrok** আর **Cloudflare Tunnel**: লোকাল অ্যাপকে ইন্টারনেটে পৌঁছানো (tunnel)
- কোন কাজে কোন টুল: তুলনা টেবিল
- curl দিয়ে টেস্ট POST পাঠানো, হেডার আর বডি পরীক্ষা
- প্রাইভেসি আর নিরাপত্তার নিয়ম

## সমস্যাটা কোথায়

[Webhook বেসিক](/lessons/webhook-basics/) লেসনে দেখেছি, Stripe একটা পাবলিক URL-এ POST পাঠায়। কিন্তু শেখার সময় আপনার কোড চলে ল্যাপটপে, `localhost:3000`-এ।

**localhost** (আপনার নিজের কম্পিউটারের ঠিকানা) শুধু আপনার কম্পিউটারের ভেতর থেকে পৌঁছানো যায়। ইন্টারনেটে থাকা Stripe-এর সার্ভার সেখানে পৌঁছাতে পারে না। ঠিক যেমন বাসার ভেতরের "পাশের রুম" ঠিকানা কুরিয়ার বুঝবে না।

সমাধান দুই ধরনের:

1. **Request Inspector:** তৃতীয় পক্ষ একটা পাবলিক URL দেয় আর যা আসে তা দেখায়। কোড লাগে না, কিন্তু আপনার অ্যাপ রিকোয়েস্ট পায় না।
2. **Tunnel** (ইন্টারনেট থেকে আপনার লোকাল পোর্ট পর্যন্ত একটা নিরাপদ সুড়ঙ্গ): একটা পাবলিক URL আপনার `localhost`-এ ফরোয়ার্ড হয়। আপনার আসল কোড রিকোয়েস্ট পায়।

পরের লেসনে **Stripe CLI** দেখব, যা Stripe-এর জন্য তৃতীয় এবং সবচেয়ে সুবিধাজনক উপায়।

## টুলগুলোর তুলনা

| টুল | ধরন | অ্যাকাউন্ট লাগে? | সবচেয়ে ভালো কাজ | সীমাবদ্ধতা |
|---|---|---|---|---|
| webhook.site | Request Inspector | না (বেসিকের জন্য) | এক সেকেন্ডে URL, হেডার/বডি দেখা | ফ্রি URL অস্থায়ী, রিকোয়েস্ট সংখ্যায় সীমা; ডেটা তৃতীয় পক্ষের কাছে |
| Beeceptor | Request Inspector + Mock | না (বেসিকের জন্য) | রিকোয়েস্ট দেখা, সাথে নকল রেসপন্স (যেমন ৫০০) সেট করা | ফ্রি প্ল্যানে দৈনিক রিকোয়েস্ট সীমা |
| ngrok | Tunnel | হ্যাঁ (ফ্রি, authtoken লাগে) | লোকাল অ্যাপে আসল রিকোয়েস্ট, সাথে লোকাল ইন্সপেক্টর ও replay | ফ্রি প্ল্যানে সীমা আছে; শর্ত সময়ের সাথে বদলায় |
| Cloudflare Tunnel (quick tunnel) | Tunnel | না (quick tunnel-এর জন্য) | এক কমান্ডে অস্থায়ী HTTPS URL | প্রতিবার নতুন র‍্যান্ডম URL; ইন্সপেক্টর নেই; শুধু টেস্টের জন্য |

> [!NOTE]
> ফ্রি প্ল্যানের সীমা (কত রিকোয়েস্ট, URL কতদিন থাকে) কোম্পানিগুলো মাঝে মাঝে বদলায়। ব্যবহারের আগে তাদের ওয়েবসাইটে বর্তমান শর্ত দেখে নিন।

## webhook.site: সবচেয়ে সহজ শুরু

ওয়েবসাইট: https://webhook.site

1. ব্রাউজারে সাইটটা খুলুন। সাথে সাথে একটা ইউনিক URL পাবেন, যেমন `https://webhook.site/` এর পরে একটা লম্বা UUID।
2. URL কপি করুন।
3. টার্মিনাল থেকে একটা নকল Webhook পাঠান:

```bash
curl -X POST "https://webhook.site/YOUR-UNIQUE-ID" \
  -H "Content-Type: application/json" \
  -H "X-Test-Source: sqa-practice" \
  -d '{"id":"evt_TEST001","type":"payment_intent.succeeded","data":{"object":{"id":"pi_TEST001","amount":2000,"metadata":{"order_id":"TEST-1001"}}}}'
```

4. ব্রাউজারে ফিরে দেখুন। বাঁ দিকে রিকোয়েস্টের তালিকা, ডান দিকে বিস্তারিত।

স্ক্রিনশট বর্ণনা: ডান প্যানেলে উপরে Request Details (মেথড POST, সময়, সোর্স IP, সাইজ), তার নিচে Headers টেবিল (`content-type`, `x-test-source`, `user-agent` ইত্যাদি), আর সবশেষে Raw Content-এ আপনার পাঠানো JSON।

### কী পরীক্ষা করবেন

| দেখার জিনিস | কেন গুরুত্বপূর্ণ |
|---|---|
| `Content-Type` | Stripe পাঠায় `application/json`; অ্যাপ কি সেটা ধরে নেয়? |
| `User-Agent` | Stripe-এর রিকোয়েস্টে `Stripe/1.0` ধরনের User-Agent থাকে; চেনার একটা সূত্র |
| `Stripe-Signature` হেডার | আসল Stripe রিকোয়েস্টে থাকে; সিগনেচার যাচাইয়ে লাগে (পরের লেসনগুলো) |
| Raw বডি | সিগনেচার যাচাই হয় **কাঁচা বডি**র উপর, তাই এক অক্ষর বদলালেও যাচাই ব্যর্থ |
| বডির সাইজ | বড় পেলোডে অ্যাপের লিমিট কাজ করে কি না |

> [!TIP]
> Stripe Dashboard-এ webhook.site-এর URL দিয়ে একটা টেস্ট এন্ডপয়েন্ট যোগ করে Postman থেকে একটা PaymentIntent বানালে আসল Stripe ইভেন্ট webhook.site-এ দেখতে পাবেন, `Stripe-Signature` হেডারসহ। কাজ শেষে এন্ডপয়েন্টটা মুছে ফেলুন।

## Beeceptor: দেখা আর নকল রেসপন্স

ওয়েবসাইট: https://beeceptor.com

1. সাইটে একটা endpoint নাম দিন, ইংরেজি ছোট হাতের অক্ষরে, যেমন `sqa-practice-rahim`।
2. আপনি একটা সাবডোমেইন URL পাবেন (ফরম্যাট সাধারণত `https://<নাম>.free.beeceptor.com`, সাইটে যা দেখায় সেটাই ব্যবহার করুন)।
3. উপরের মতো curl দিয়ে POST পাঠান, ড্যাশবোর্ডে রিকোয়েস্ট দেখুন।
4. **Mocking Rules** অংশে একটা রুল বানান: `/webhook` পাথে POST এলে Status `500` ফেরত দাও।
5. Stripe Dashboard-এ ঐ URL দিয়ে টেস্ট এন্ডপয়েন্ট বানিয়ে ইভেন্ট ট্রিগার করুন। Dashboard-এ দেখবেন ডেলিভারি ব্যর্থ, আর Stripe পরে retry করার পরিকল্পনা দেখাচ্ছে।

এভাবে **কোড না লিখেই** দেখা যায় এন্ডপয়েন্ট ৫০০ দিলে Stripe কেমন আচরণ করে। এটা webhook.site-এ সহজে হয় না, তাই Beeceptor-এর এই সুবিধা।

## ngrok: লোকাল অ্যাপে আসল রিকোয়েস্ট

ওয়েবসাইট: https://ngrok.com

প্রথমে একটা ছোট লোকাল সার্ভার বানাই, যাতে ফরোয়ার্ড হওয়া রিকোয়েস্ট দেখা যায়। কোনো প্যাকেজ লাগবে না, শুধু Node.js। ফাইল `receiver.js`:

```js
const http = require('node:http');

http.createServer((req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', () => {
    console.log('---', new Date().toISOString(), req.method, req.url);
    console.log('stripe-signature:', req.headers['stripe-signature'] || '(none)');
    console.log(body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"received":true}');
  });
}).listen(3000, () => console.log('Listening on http://localhost:3000'));
```

```bash
node receiver.js
```

এবার ngrok:

1. ngrok-এ ফ্রি অ্যাকাউন্ট খুলুন। Dashboard-এ আপনার **authtoken** পাবেন।
2. ngrok ইনস্টল করুন (ওয়েবসাইটের ডাউনলোড পেজে Windows, macOS, Linux নির্দেশনা আছে)।
3. authtoken একবার সেট করুন (এটা আপনার ব্যক্তিগত সিক্রেট, কোথাও শেয়ার করবেন না):

```bash
ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
```

4. টানেল চালু করুন:

```bash
ngrok http 3000
```

আউটপুটে একটা `Forwarding` লাইন দেখবেন, অনেকটা এরকম:

```text
Forwarding   https://abcd-1234.ngrok-free.app -> http://localhost:3000
Web Interface  http://127.0.0.1:4040
```

5. অন্য টার্মিনাল থেকে পাবলিক URL-এ POST পাঠান:

```bash
curl -X POST "https://abcd-1234.ngrok-free.app/webhook" \
  -H "Content-Type: application/json" \
  -d '{"id":"evt_TEST002","type":"payment_intent.payment_failed"}'
```

6. `receiver.js`-এর টার্মিনালে বডি প্রিন্ট হবে।
7. ব্রাউজারে `http://localhost:4040` খুলুন। এটা ngrok-এর **লোকাল ইন্সপেক্টর**: প্রতিটা রিকোয়েস্ট, আপনার অ্যাপের রেসপন্স, আর একটা **Replay** বাটন, যা দিয়ে একই রিকোয়েস্ট আবার পাঠানো যায়। ডুপ্লিকেট ইভেন্ট টেস্টে দারুণ কাজের।

## Cloudflare Tunnel: অ্যাকাউন্ট ছাড়া দ্রুত টানেল

ডকুমেন্টেশন: https://developers.cloudflare.com (সার্চ করুন "Cloudflare Tunnel" বা "quick tunnel")

1. `cloudflared` টুল ইনস্টল করুন। Cloudflare-এর ডকে প্রতিটা অপারেটিং সিস্টেমের নির্দেশনা আছে; macOS-এ Homebrew দিয়ে `brew install cloudflared`।
2. `receiver.js` চালু রেখে:

```bash
cloudflared tunnel --url http://localhost:3000
```

3. আউটপুটে একটা বাক্সের ভেতর URL আসবে, ফরম্যাট `https://<র‍্যান্ডম-শব্দ>.trycloudflare.com`।
4. সেই URL-এ `/webhook` যোগ করে curl দিয়ে POST পাঠান।
5. `Ctrl+C` দিলে টানেল বন্ধ, URL অকেজো।

এটাকে বলে **quick tunnel**: অ্যাকাউন্ট লাগে না, কিন্তু প্রতিবার নতুন URL, আর এটা শুধু টেস্ট ও ডেমোর জন্য। স্থায়ী ঠিকানা চাইলে Cloudflare অ্যাকাউন্টসহ named tunnel লাগে।

> [!TIP] টানেলের URL বদলালে
> ngrok বা quick tunnel-এর URL বদলালে Stripe Dashboard-এর এন্ডপয়েন্ট URL-ও আপডেট করতে হয়, নইলে ইভেন্ট পুরনো URL-এ গিয়ে ব্যর্থ হবে। এই ঝামেলা এড়াতেই Stripe CLI-এর `stripe listen` বেশি সুবিধাজনক।

### কোন পরিস্থিতিতে কোন টুল

| পরিস্থিতি | ভালো পছন্দ |
|---|---|
| "Stripe আসলে কী পাঠায়?" শুধু দেখতে চান | webhook.site |
| এন্ডপয়েন্ট ৫০০ দিলে বা ধীর হলে Stripe কী করে, কোড ছাড়া দেখতে চান | Beeceptor (mock rule) |
| নিজের লোকাল অ্যাপের Webhook কোড ডিবাগ, সাথে replay | ngrok |
| অ্যাকাউন্ট ছাড়া দ্রুত একটা পাবলিক URL দরকার | Cloudflare quick tunnel |
| শুধু Stripe-এর ইভেন্ট লোকালে আনা, প্রতিদিনের কাজ | Stripe CLI (পরের লেসন) |

## প্রাইভেসি আর নিরাপত্তা

> [!DANGER] এই টুলগুলোতে আসল ডেটা নয়
> - webhook.site আর Beeceptor-এর URL যে জানে, সে-ই রিকোয়েস্ট দেখতে পারে; ডেটা তৃতীয় পক্ষের সার্ভারে জমা থাকে।
> - শুধু **Test Mode**-এর নকল ডেটা পাঠান। আসল গ্রাহকের নাম, ইমেইল, ফোন, ঠিকানা কখনো নয়।
> - Live Mode-এর Stripe এন্ডপয়েন্টে এসব URL কখনো বসাবেন না।
> - কোনো Secret Key, `whsec_` সিক্রেট, ngrok authtoken বা পাসওয়ার্ড বডি বা হেডারে পাঠাবেন না।
> - টানেল চালু থাকলে আপনার লোকাল অ্যাপ ইন্টারনেটে খোলা। কাজ শেষে বন্ধ করুন, আর টানেলের পেছনে এমন কিছু চালাবেন না যা অ্যাডমিন প্যানেল বা ব্যক্তিগত ফাইল দেখায়।
> - অফিসের প্রজেক্টে এসব টুল ব্যবহারের আগে টিম লিড বা সিকিউরিটি টিমের অনুমতি নিন।

## হাতেকলমে অনুশীলন

1. webhook.site খুলে URL নিন। curl দিয়ে দুটো রিকোয়েস্ট পাঠান: একটা JSON, একটা `application/x-www-form-urlencoded` (`-d "a=1&b=2"`)। Content-Type-এর পার্থক্য লিখুন।
2. Stripe Dashboard (Test Mode)-এ webhook.site URL দিয়ে একটা এন্ডপয়েন্ট বানান, শুধু `payment_intent.succeeded` ইভেন্ট সিলেক্ট করে। Postman থেকে সফল পেমেন্ট বানান। webhook.site-এ `Stripe-Signature` হেডার খুঁজুন।
3. Beeceptor-এ ৫০০ ফেরত দেওয়ার রুল বানিয়ে Stripe এন্ডপয়েন্ট সেখানে দিন। Dashboard-এ ব্যর্থ ডেলিভারি আর retry-এর তথ্য দেখুন।
4. `receiver.js` চালিয়ে ngrok অথবা Cloudflare Tunnel দিয়ে পাবলিক URL বানান, curl দিয়ে POST পাঠান।
5. ngrok ব্যবহার করলে `localhost:4040` থেকে একটা রিকোয়েস্ট Replay করুন।
6. কাজ শেষে Stripe Dashboard থেকে সব টেস্ট এন্ডপয়েন্ট মুছুন আর টানেল বন্ধ করুন।

> [!CHECK] সফলতার চেকলিস্ট
> - বলতে পারছেন Request Inspector আর Tunnel-এর পার্থক্য
> - আসল Stripe ইভেন্টের হেডারে `Stripe-Signature` দেখেছেন
> - এন্ডপয়েন্ট ৫০০ দিলে Stripe-এর retry আচরণ দেখেছেন
> - লোকাল অ্যাপে টানেল দিয়ে রিকোয়েস্ট পৌঁছেছে

> [!MISTAKE] সাধারণ ভুল
> - `http://localhost:3000` সরাসরি Stripe Dashboard-এ বসানো।
> - টানেল রিস্টার্টের পর নতুন URL Dashboard-এ আপডেট না করা।
> - টেস্ট শেষে পুরনো এন্ডপয়েন্ট রেখে দেওয়া; পরে এগুলো ব্যর্থ হয়ে সতর্কতা ইমেইল আসে।
> - ngrok authtoken স্ক্রিনশট বা GitHub-এ শেয়ার করা।
> - টানেলের URL-এ এরর এলেই টানেলের দোষ ধরা; আগে `localhost` সরাসরি কাজ করে কি না দেখুন।

## সারসংক্ষেপ

- Stripe ইন্টারনেট থেকে `localhost`-এ পৌঁছাতে পারে না; Inspector, Tunnel বা Stripe CLI লাগে।
- webhook.site: কোড ছাড়া দ্রুত রিকোয়েস্ট দেখা। Beeceptor: দেখা আর নকল রেসপন্স।
- ngrok: লোকাল অ্যাপে টানেল, সাথে `localhost:4040` ইন্সপেক্টর ও Replay; ফ্রি অ্যাকাউন্ট আর authtoken লাগে।
- Cloudflare quick tunnel: অ্যাকাউন্ট ছাড়া এক কমান্ডে অস্থায়ী `trycloudflare.com` URL।
- শুধু Test Mode-এর নকল ডেটা; কাজ শেষে এন্ডপয়েন্ট মুছুন, টানেল বন্ধ করুন।

## বাড়ির কাজ

1. ৪টা টুলের প্রতিটা দিয়ে অন্তত একটা রিকোয়েস্ট পাঠিয়ে নিজের ভাষায় একটা তুলনা লিখুন: কোনটা কখন ব্যবহার করবেন।
2. `receiver.js` বদলে এমন করুন যে বডিতে `"type":"test.fail"` থাকলে ৫০০ ফেরত দেয়। টানেল দিয়ে দুটো রিকোয়েস্ট পাঠিয়ে দেখান একটায় ২০০, অন্যটায় ৫০০।

<details><summary>সমাধান দেখুন</summary>

`req.on('end', ...)` এর ভেতর রেসপন্সের আগে এরকম চেক যোগ করুন:

```js
const status = body.includes('"type":"test.fail"') ? 500 : 200;
res.writeHead(status, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({ received: status === 200 }));
```

ngrok-এর `localhost:4040`-এ দুটো রিকোয়েস্টের Status আলাদা রঙে দেখা যাবে।

</details>

পরের লেসনে Stripe-এর নিজের টুল: [Stripe CLI দিয়ে Webhook টেস্ট](/lessons/stripe-cli-webhooks/)।
