---
order: 27
level: 4
week: 8
title: "Burp Suite ও OWASP ZAP: রিকোয়েস্ট Intercept, Repeater ও Scope সেটআপ"
description: "লোকালে চলা OWASP Juice Shop-এ Burp Suite Community ও ZAP দিয়ে রিকোয়েস্ট ধরা, বদলানো ও আবার পাঠানো শিখুন: Intercept, HTTP history, Repeater, Breakpoint, Passive Scan ও Scope।"
keywords: ["burp suite", "burp community", "owasp zap", "zap by checkmarx", "intercept", "proxy", "repeater", "http history", "breakpoint", "manual request editor", "passive scan", "scope", "ca certificate", "juice shop", "docker", "প্রক্সি", "ইন্টারসেপ্ট", "রিকোয়েস্ট বদলানো"]
minutes: 75
quiz:
  - q: "Burp-এ Intercept চালু রেখে Juice Shop-এ ক্লিক করলেন, কিন্তু পেজ লোড হচ্ছে না, ঘুরছেই। সবচেয়ে সম্ভাব্য কারণ কী?"
    options: ["Juice Shop ক্র্যাশ করেছে", "রিকোয়েস্ট Burp-এ আটকে আছে; Forward চাপতে হবে বা Intercept বন্ধ করতে হবে", "CA সার্টিফিকেট ভুল", "Repeater চালু নেই"]
    answer: 1
    explain: "Intercept চালু থাকলে প্রতিটি রিকোয়েস্ট আপনার অনুমতির অপেক্ষায় থামে। Forward না করলে ব্রাউজার উত্তর পায় না। সাধারণ ব্রাউজিংয়ে Intercept বন্ধ রেখে HTTP history ব্যবহার করুন।"
  - q: "Juice Shop-এর বাস্কেটে quantity বদলানোর PUT রিকোয়েস্ট Repeater-এ পাঠিয়ে quantity -1 করে Send দিলেন, রেসপন্স 200 এবং বাস্কেটের মোট দাম কমে গেল। এর অর্থ কী?"
    options: ["সার্ভার quantity যাচাই করছে না; ঋণাত্মক পরিমাণ গ্রহণ করা একটা ব্যবসায়িক লজিক বাগ", "Burp ভুল রেসপন্স দেখাচ্ছে", "এটা শুধু UI-র সমস্যা", "Repeater সব সময় 200 দেয়"]
    answer: 0
    explain: "Repeater সরাসরি সার্ভারে পাঠায়, আর সার্ভারই 200 দিয়েছে ও দাম বদলেছে। এটা Juice Shop-এর ইচ্ছাকৃত দুর্বলতা; আসল অ্যাপে এটা Critical।"
  - q: "Burp চালু রেখে অন্য ট্যাবে Facebook ও আপনার ব্যাংকের সাইটও খোলা ছিল, HTTP history-তে সেগুলোর রিকোয়েস্টও জমা হচ্ছে। সঠিক পদক্ষেপ কোনটি?"
    options: ["কিছু করার দরকার নেই", "ওই সাইটগুলোতেও Repeater দিয়ে টেস্ট করা", "Target Scope-এ শুধু localhost:3000 রাখা, scope-এর বাইরের আইটেম history-তে না রাখা, আর টেস্টের সময় অন্য সাইট এই ব্রাউজারে না খোলা", "Burp আনইনস্টল করা"]
    answer: 2
    explain: "Scope নিশ্চিত করে আপনি শুধু অনুমতি পাওয়া টার্গেটে কাজ করছেন এবং অন্যের ডেটা আপনার প্রজেক্টে জমা হচ্ছে না। অন্যের সাইটে টেস্ট করা নিষেধ।"
  - q: "ZAP-এ Alerts ট্যাবে কোনো Active Scan না চালিয়েই 'Content Security Policy (CSP) Header Not Set' দেখা গেল। এটা কোথা থেকে এলো?"
    options: ["ZAP নিজে থেকে আক্রমণ চালিয়েছে", "Juice Shop রিপোর্ট পাঠিয়েছে", "ব্রাউজারের এক্সটেনশন থেকে", "Passive scan: ZAP প্রক্সির ভেতর দিয়ে যাওয়া রেসপন্সগুলো পড়ে, কোনো বাড়তি রিকোয়েস্ট না পাঠিয়েই সমস্যা চিহ্নিত করে"]
    answer: 3
    explain: "Passive scan শুধু চলমান ট্রাফিক দেখে, তাই এটা নিরাপদ। Active scan সত্যিই আক্রমণধর্মী রিকোয়েস্ট পাঠায়, যা শুধু নিজের ল্যাবে চালানো যায়।"
  - q: "Burp ও ZAP একসাথে চালু করার সময় একটি চালু হলো না, পোর্ট ব্যস্ত বলে এরর দিল। কেন?"
    options: ["দুটোই ডিফল্টভাবে 127.0.0.1:8080-এ প্রক্সি চালায়; একটির পোর্ট বদলাতে হবে বা একটাই চালাতে হবে", "Juice Shop 8080 পোর্ট নিয়েছে", "Docker বন্ধ", "CA সার্টিফিকেট দুটো একসাথে থাকতে পারে না"]
    answer: 0
    explain: "দুই টুলেরই ডিফল্ট প্রক্সি পোর্ট 8080। Juice Shop এখানে 3000-এ চলছে। একটার প্রক্সি পোর্ট (যেমন 8081) বদলালে দুটোই চলবে।"
---

> [!DANGER] শুধু নিজের ল্যাব, Scope সবসময় চালু
> Burp Suite ও ZAP শক্তিশালী টুল। এই লেসনের সব কাজ শুধু আপনার নিজের কম্পিউটারে Docker-এ চলা OWASP Juice Shop (`http://localhost:3000`) বা নিজের লোকাল অ্যাপে করবেন। অন্যের সাইটের রিকোয়েস্ট বদলে পাঠানো, দাম বা পরিমাণ পাল্টে অর্ডার দেওয়া বা স্ক্যান চালানো বেআইনি, যদিও "শুধু শেখার জন্য"। নিচে Scope সেটআপ বাধ্যতামূলকভাবে করুন। নিয়মগুলো আবার পড়ে নিন: [নৈতিকতা ও দায়িত্বশীল প্রকাশ](/lessons/ethics-responsible-disclosure/)।

এতদিন Postman দিয়ে আমরা নিজে রিকোয়েস্ট বানিয়ে পাঠিয়েছি। কিন্তু একটা আসল ওয়েব অ্যাপ ব্রাউজার থেকে কী কী রিকোয়েস্ট পাঠায়, কোন হেডার, কোন বডি? সেটা দেখতে ও মাঝপথে বদলাতে লাগে Intercepting Proxy (ব্রাউজার আর সার্ভারের মাঝখানে বসা একটা টুল, যার ভেতর দিয়ে সব ট্রাফিক যায়)।

ভাবুন কুরিয়ার সার্ভিসের মাঝখানের হাব: প্রতিটি পার্সেল খুলে দেখা যায়, ভেতরের জিনিস বদলানো যায়, তারপর আবার পাঠানো যায়। Burp ও ZAP ঠিক এই হাব।

## এই লেসনে যা শিখবেন

- Juice Shop লোকালে চালানো
- Burp Suite Community Edition ইনস্টল, built-in browser, Intercept, HTTP history, Repeater
- একটা বাস্কেট রিকোয়েস্টের quantity বদলে রেসপন্স পর্যবেক্ষণ
- OWASP ZAP: Manual Explore, Breakpoint, Manual Request Editor, Passive scan alerts
- CA সার্টিফিকেট কেন লাগে
- Scope সেটআপ, যাতে ভুলেও অন্য সাইট ছোঁয়া না হয়

## প্রস্তুতি: Juice Shop চালু করুন

OWASP Juice Shop একটা ইচ্ছাকৃতভাবে দুর্বল অনলাইন দোকান, শেখার জন্যই বানানো। Docker থাকলে এক লাইনে চলে:

```bash
docker run --rm -p 3000:3000 bkimminich/juice-shop
```

টার্মিনালে "Server listening on port 3000" ধরনের বার্তা এলে ব্রাউজারে `http://localhost:3000` খুলুন। `--rm` মানে কন্টেইনার বন্ধ করলে মুছে যাবে, প্রতিবার নতুন করে শুরু হবে।

স্ক্রিনশট বর্ণনা: গাঢ় রঙের একটা দোকানের হোমপেজ, উপরে "OWASP Juice Shop" লোগো, নিচে ফলের জুসের কার্ড, প্রতিটিতে দাম ও "Add to Basket" বোতাম। ডান উপরে "Account" মেনু।

Account → Login → "Not yet a customer?" দিয়ে একটা টেস্ট অ্যাকাউন্ট খুলুন (যেমন `tester@juice.local`, যেকোনো পাসওয়ার্ড)। এটা শুধু আপনার লোকাল কন্টেইনারে থাকে।

## Burp Suite Community: ইনস্টল ও প্রথম Intercept

### ইনস্টল

Burp Suite Community Edition ফ্রি। ডাউনলোড: [portswigger.net/burp/communitydownload](https://portswigger.net/burp/communitydownload)। Windows, macOS, Linux সব আছে।

1. ইনস্টল করে চালান। "Temporary project" বাছুন (Community-তে এটাই)।
2. "Use Burp defaults" দিয়ে Start Burp।

স্ক্রিনশট বর্ণনা: উপরে অনেকগুলো ট্যাব: Dashboard, Target, Proxy, Intruder, Repeater ইত্যাদি। Dashboard-এ "Tasks" ও "Event log" প্যানেল দেখা যাচ্ছে।

### Built-in browser: প্রক্সি সেটিং লাগে না

Burp-এর সাথে একটা Chromium ব্রাউজার আসে, যেটা আগে থেকেই Burp-এর প্রক্সি (`127.0.0.1:8080`) ব্যবহার করতে সেট করা এবং Burp-এর সার্টিফিকেট বিশ্বাস করে।

1. **Proxy** ট্যাব → **Intercept** সাব-ট্যাবে যান।
2. **Open browser** বোতাম চাপুন।
3. নতুন ব্রাউজারে `http://localhost:3000` খুলুন।

> [!TIP] localhost দেখা না গেলে
> কোনো কারণে localhost-এর রিকোয়েস্ট HTTP history-তে না এলে `http://127.0.0.1:3000` দিয়ে খুলে দেখুন। নিজের সাধারণ Chrome বা Firefox ব্যবহার করলে আলাদা করে প্রক্সি সেটিং ও সার্টিফিকেট লাগবে, তাই শুরুতে built-in browser-ই সহজ।

### CA সার্টিফিকেট: কেন লাগে

HTTPS সাইটে ব্রাউজার আর সার্ভারের মাঝে এনক্রিপশন থাকে। প্রক্সি ভেতরে দেখতে চাইলে নিজেকে "সার্ভার" হিসেবে পরিচয় দেয়, আর নিজের CA (Certificate Authority, যে সার্টিফিকেটে সই করে) দিয়ে প্রতিটি সাইটের জন্য নকল সার্টিফিকেট বানায়। ব্রাউজার সেই CA-কে বিশ্বাস না করলে সতর্কবার্তা দেখায়।

- Burp-এর built-in browser আগেই বিশ্বাস করে।
- অন্য ব্রাউজারে: প্রক্সি চালু অবস্থায় `http://burpsuite` খুলে CA Certificate ডাউনলোড করে ব্রাউজারে ইমপোর্ট করতে হয়।
- আমাদের Juice Shop `http://`, তাই এখানে এটা না হলেও চলে।

> [!NOTE]
> Burp বা ZAP-এর CA কখনো নিজের দৈনন্দিন ব্রাউজারে স্থায়ীভাবে রেখে দেবেন না। কাজ শেষে সরিয়ে দিন বা আলাদা ব্রাউজার প্রোফাইল ব্যবহার করুন। ওই CA-র প্রাইভেট কী কারো হাতে গেলে সে আপনার HTTPS ট্রাফিক পড়তে পারবে।

## Scope সেটআপ: সবার আগে

কাজ শুরুর আগেই Scope সেট করুন, যাতে Burp শুধু Juice Shop-এর ট্রাফিক নিয়ে কাজ করে।

1. **Target** ট্যাব → **Scope** (নতুন ভার্সনে Settings → Project → Scope-এও পাবেন)।
2. "Include in scope"-এ **Add** চাপুন, লিখুন `http://localhost:3000` (এবং দরকার হলে `http://127.0.0.1:3000`)।
3. Burp জিজ্ঞেস করতে পারে, scope-এর বাইরের আইটেম history-তে পাঠানো বন্ধ করবে কি না। **Yes** দিন।
4. **Proxy → HTTP history**-তে উপরের ফিল্টার বারে ক্লিক করে "Show only in-scope items" টিক দিন।
5. Proxy settings-এ intercept rule-এ "And URL Is in target scope" চালু থাকলে Intercept শুধু scope-এর রিকোয়েস্ট থামাবে।

স্ক্রিনশট বর্ণনা: Scope পেজে "Include in scope" টেবিলে একটা সারি, Enabled টিক দেওয়া, Prefix কলামে `http://localhost:3000`। নিচে "Exclude from scope" টেবিল খালি।

## Intercept, HTTP history ও Repeater

### Intercept on/off

1. Proxy → Intercept-এ বোতামটি **Intercept on** করুন।
2. Juice Shop-এ যেকোনো জুসের "Add to Basket" চাপুন।
3. ব্রাউজার থেমে যাবে। Burp-এ রিকোয়েস্টটা দেখা যাবে।

স্ক্রিনশট বর্ণনা: Intercept প্যানেলে একটা কাঁচা HTTP রিকোয়েস্ট। প্রথম লাইনে `POST /api/BasketItems/`, নিচে হেডার, তার মধ্যে `Authorization: Bearer eyJ...`, শেষে JSON বডি। উপরে Forward, Drop বোতাম।

রিকোয়েস্টটা মোটামুটি এমন:

```http
POST /api/BasketItems/ HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJXXXXXXXX
Content-Type: application/json

{"ProductId":1,"BasketId":"6","quantity":1}
```

- **Forward**: রিকোয়েস্ট যেমন আছে (বা বদলানোর পর) সার্ভারে পাঠান
- **Drop**: বাতিল করুন, সার্ভারে যাবে না
- এরপর **Intercept off** করুন। সব সময় চালু রাখলে প্রতিটি ছবি, CSS আটকে থাকবে।

### HTTP history

Intercept বন্ধ থাকলেও সব রিকোয়েস্ট **Proxy → HTTP history**-তে জমা হয়। এখানে তালিকা থেকে যেকোনোটায় ক্লিক করে নিচে Request ও Response দুটোই দেখা যায়। বেশিরভাগ সময় এটাই ব্যবহার করবেন।

### Repeater-এ পাঠানো ও parameter বদলানো

এবার বাস্কেটে গিয়ে একটা আইটেমের পরিমাণ `+` চেপে বাড়ান। HTTP history-তে এমন একটা রিকোয়েস্ট আসবে:

```http
PUT /api/BasketItems/7 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJXXXXXXXX
Content-Type: application/json

{"quantity":2}
```

1. রিকোয়েস্টে রাইট-ক্লিক → **Send to Repeater** (শর্টকাট `Ctrl+R`)।
2. **Repeater** ট্যাবে যান। বাম দিকে রিকোয়েস্ট, ডান দিকে খালি Response।
3. প্রথমে কিছু না বদলে **Send** চাপুন। Response-এ `200 OK` ও আপডেট হওয়া আইটেমের JSON দেখবেন।
4. এবার বডিতে `{"quantity":-1}` লিখে Send।
5. Response দেখুন: `200` এলো, নাকি `400`? ব্রাউজারে বাস্কেট রিফ্রেশ করে মোট দাম দেখুন।
6. আরও চেষ্টা করুন: `0`, `1000`, `1.5`, `"abc"`। প্রতিটির ফল লিখে রাখুন।

স্ক্রিনশট বর্ণনা: Repeater-এ দুই কলাম। বামে বদলানো বডি `{"quantity":-1}`, ডানে Response `HTTP/1.1 200 OK` এবং JSON-এ `"quantity":-1`। উপরে Send বোতামের পাশে `<` `>` তীর দিয়ে আগের পাঠানো রিকোয়েস্টে ফেরা যায়।

Juice Shop-এ ঋণাত্মক পরিমাণ গ্রহণ হওয়া একটা পরিচিত ইচ্ছাকৃত দুর্বলতা। আসল অ্যাপে এর মানে গ্রাহক নিজের বিল কমিয়ে ফেলতে পারছে, Critical বাগ। এটা [পেমেন্ট লজিক দুর্বলতা](/lessons/payment-logic-vulnerabilities/) আর [ইনপুট ভ্যালিডেশন](/lessons/input-validation-rate-limiting/) দুই লেসনের সাথেই যুক্ত।

> [!TIP] Juice Shop-এ দাম কোথায়?
> বাস্কেটের রিকোয়েস্টে দাম পাঠানো হয় না, সার্ভার ডাটাবেস থেকে নেয়। এটাই সঠিক ডিজাইন। তাই বদলানোর মতো parameter এখানে quantity। নিজের প্রজেক্টে টেস্ট করার সময় দেখুন রিকোয়েস্টে `price` বা `amount` যায় কি না; গেলে সেটা বদলে দেখুন সার্ভার বিশ্বাস করে কি না।

## OWASP ZAP: একই কাজ, ভিন্ন টুল

ZAP পুরোপুরি ফ্রি ও ওপেন সোর্স, এখন "ZAP by Checkmarx" নামে চলে। ডাউনলোড: [zaproxy.org](https://www.zaproxy.org)। চালাতে Java লাগে, তবে ইনস্টলারে সাধারণত সাথেই থাকে।

> [!NOTE]
> Burp আর ZAP দুটোই ডিফল্টভাবে `127.0.0.1:8080`-এ প্রক্সি চালায়। একসাথে চালাতে হলে একটার পোর্ট বদলান (যেমন ZAP-এর Options/Settings → Network → Local Servers/Proxies-এ 8081)। শুরুতে একটা বন্ধ রেখে আরেকটা চালানোই সহজ।

### Manual Explore দিয়ে ব্রাউজার চালু

1. ZAP চালু করে session persist করবেন কি না জিজ্ঞেস করলে "No" বা যেকোনোটা।
2. **Quick Start** ট্যাব → **Manual Explore**।
3. URL ঘরে `http://localhost:3000` দিন, ব্রাউজার (Firefox বা Chrome) বেছে **Launch Browser**।
4. খোলা ব্রাউজারে Juice Shop-এ লগইন করে কয়েকটা পেজ ঘুরুন।

স্ক্রিনশট বর্ণনা: ZAP-এর বাম দিকে "Sites" গাছে `http://localhost:3000` এবং তার নিচে `api`, `rest` ফোল্ডার। নিচের প্যানেলে "History" ট্যাবে রিকোয়েস্টের তালিকা, প্রতিটির Method, URL, Code।

### Scope ও Mode

1. Sites গাছে `http://localhost:3000`-এ রাইট-ক্লিক → **Include in Context** → Default Context।
2. উপরের টুলবারের Mode ড্রপডাউনে **Protected mode** বাছুন। এতে ঝুঁকিপূর্ণ কাজ (যেমন Active scan) শুধু scope-এর ভেতরে চলবে।
3. History-র ফিল্টারে শুধু Context-এর আইটেম দেখানোর অপশন চালু করুন।

### Breakpoints: Intercept-এর ZAP সংস্করণ

1. টুলবারে সবুজ গোল বোতাম **Set break on all requests and responses** চাপুন, লাল হয়ে যাবে।
2. Juice Shop-এ বাস্কেটে পরিমাণ বাড়ান।
3. ZAP-এ "Break" ট্যাব খুলবে, রিকোয়েস্ট বদলানো যাবে।
4. **Step** (শুধু এটা পাঠাও, পরেরটায় আবার থামো) বা **Continue** (পাঠাও, আর থামিও না) চাপুন।
5. কাজ শেষে বোতামটা আবার সবুজ করুন।

### Manual Request Editor: Repeater-এর ZAP সংস্করণ

1. History-তে `PUT /api/BasketItems/...` রিকোয়েস্টে রাইট-ক্লিক → **Open/Resend with Request Editor...**।
2. নতুন উইন্ডোতে বডিতে quantity বদলান।
3. **Send** চাপুন, Response ট্যাবে ফল দেখুন।

Tools মেনু থেকেও Manual Request Editor খোলা যায়, একদম নতুন রিকোয়েস্ট লিখতে।

### Passive scan alerts

ZAP প্রক্সির ভেতর দিয়ে যাওয়া প্রতিটি রেসপন্স নিজে থেকেই পরীক্ষা করে, কোনো বাড়তি রিকোয়েস্ট না পাঠিয়ে। একে Passive scan বলে। নিচের **Alerts** ট্যাবে ফল আসে, ঝুঁকি অনুযায়ী রঙিন পতাকাসহ (High, Medium, Low, Informational)।

Juice Shop-এ প্রায়ই দেখবেন:

- Content Security Policy (CSP) Header Not Set
- Cross-Domain Misconfiguration (CORS)
- Missing Anti-clickjacking Header
- Timestamp বা তথ্য ফাঁস সম্পর্কিত Informational alert

প্রতিটি alert-এ ক্লিক করলে বর্ণনা, কোন URL, প্রমাণ (Evidence) ও সমাধান দেখায়। মনে রাখবেন, অনেক alert false positive হতে পারে; টেস্টারের কাজ যাচাই করা।

> [!LIVE] Active scan শুধু নিজের ল্যাবে
> ZAP-এর Active scan ও Burp-এর Intruder সত্যিকারের আক্রমণধর্মী রিকোয়েস্ট পাঠায়। এগুলো কখনো স্টেজিং বা প্রোডাকশনে অনুমতি ছাড়া, আর কখনোই Stripe বা অন্য পেমেন্ট গেটওয়ের ডোমেইনে চালাবেন না। স্টেজিংয়ে Active scan চালালে ডাটাবেস ভরে যেতে পারে, ইমেইল চলে যেতে পারে।

## হাতেকলমে অনুশীলন

1. Docker-এ Juice Shop চালু করুন ও একটা টেস্ট অ্যাকাউন্ট খুলুন।
2. Burp চালিয়ে Scope-এ শুধু `http://localhost:3000` রাখুন, "Show only in-scope items" চালু করুন।
3. Built-in browser দিয়ে লগইন করুন, দুটো জুস বাস্কেটে নিন।
4. HTTP history থেকে `POST /api/BasketItems/` ও `PUT /api/BasketItems/...` খুঁজে বের করুন।
5. PUT রিকোয়েস্ট Repeater-এ পাঠিয়ে quantity-র ৫টি মান (`2`, `0`, `-1`, `1000`, `"abc"`) চেষ্টা করুন, একটা টেবিলে Status ও ফল লিখুন।
6. Burp বন্ধ করে ZAP চালান। Manual Explore দিয়ে একই কাজ Breakpoint ও Request Editor দিয়ে করুন।
7. Alerts ট্যাব থেকে ৩টি Passive alert বেছে নিন, প্রতিটি সত্যি কি না যাচাই করে ২ লাইনে লিখুন।
8. সবচেয়ে গুরুতর ফাইন্ডিং নিয়ে একটা [বাগ রিপোর্ট](/lessons/payment-bug-reports/) লিখুন, Repeater-এর রিকোয়েস্ট ও রেসপন্স কোড ব্লকে দিয়ে (টোকেন মুছে)।

> [!MISTAKE] সাধারণ ভুল
> - Intercept চালু রেখে ভুলে যাওয়া, তারপর ভাবা "সাইট কাজ করছে না"।
> - Scope সেট না করে সাধারণ ব্রাউজিং চালানো, ফলে ব্যক্তিগত সাইটের কুকি ও টোকেন প্রজেক্টে জমা।
> - বাগ রিপোর্টে `Authorization: Bearer ...` টোকেন পুরো রেখে দেওয়া।
> - Burp/ZAP-এর CA দৈনন্দিন ব্রাউজারে রেখে দেওয়া।
> - শেখার উৎসাহে অফিস বা অন্য কোম্পানির সাইটে Repeater দিয়ে দাম বদলে দেখা। এটা অনুমতিহীন আক্রমণ।

> [!CHECK] সফলতার চেকলিস্ট
> - Juice Shop লোকালে চলছে, Scope-এ শুধু localhost
> - Intercept দিয়ে একটা রিকোয়েস্ট থামিয়ে Forward ও Drop করতে পারেন
> - Repeater ও ZAP Request Editor দিয়ে parameter বদলে ফল তুলনা করতে পারেন
> - Passive alert পড়ে সত্যি-মিথ্যা যাচাই করতে পারেন

## সারসংক্ষেপ

- Intercepting proxy ব্রাউজার ও সার্ভারের মাঝে বসে রিকোয়েস্ট দেখায়, থামায়, বদলায়।
- Burp: built-in browser, Proxy → Intercept, HTTP history, Send to Repeater (`Ctrl+R`)।
- ZAP: Manual Explore, Breakpoints, Open/Resend with Request Editor, Passive scan alerts।
- HTTPS দেখতে টুলের CA সার্টিফিকেট লাগে; কাজ শেষে সরিয়ে দিন।
- Scope প্রথমে, সবসময়; কাজ শুধু নিজের ল্যাবে।

## বাড়ির কাজ

1. Juice Shop-এর চেকআউটে ঠিকানা বা ডেলিভারি অপশন বাছাইয়ের রিকোয়েস্টগুলো HTTP history-তে খুঁজে বের করুন, কোনটা কী কাজ করে এক লাইনে লিখুন।
2. Repeater-এ অন্য একজন ইউজারের BasketId দিয়ে GET বাস্কেট রিকোয়েস্ট পাঠিয়ে দেখুন কী হয় (এটা IDOR, দেখুন [অথরাইজেশন টেস্টিং](/lessons/auth-authorization-testing/))।
3. Burp ও ZAP-এর একটা তুলনা টেবিল বানান: ইন্টারফেস, ফ্রি সুবিধা, কোনটা কোন কাজে সহজ লাগল।

<details><summary>সমাধান দেখুন</summary>

২ নম্বরের ইঙ্গিত: Juice Shop-এ `GET /rest/basket/<id>` রিকোয়েস্টে নিজের id-এর জায়গায় অন্য একটা সংখ্যা দিলে অন্যের বাস্কেট দেখা যায়, এটা "View Basket" নামের পরিচিত চ্যালেঞ্জ। আসল অ্যাপে সার্ভারের উচিত টোকেনের ইউজার আর বাস্কেটের মালিক মিলিয়ে দেখা, না মিললে 403 দেওয়া।

</details>
