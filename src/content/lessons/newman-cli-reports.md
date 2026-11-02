---
order: 11
level: 2
week: 4
title: "Newman CLI: Postman Collection কমান্ড লাইনে চালানো ও HTML রিপোর্ট"
description: "Node.js ও Newman ইনস্টল করে Postman Collection টার্মিনালে চালান, CSV ডেটা দিন, htmlextra দিয়ে সুন্দর HTML রিপোর্ট বানান, আর secret কী ফাইলে না রেখে নিরাপদে পাঠান।"
keywords: ["newman", "newman cli", "htmlextra", "html report", "postman cli", "node.js", "npm", "env-var", "exit code", "bail", "iteration", "jsonplaceholder", "stripe test mode", "নিউম্যান", "রিপোর্ট", "কমান্ড লাইন"]
minutes: 50
quiz:
  - q: "CI সার্ভারে Newman চালাতে হবে, কিন্তু Environment ফাইলে stripeSecretKey রাখা যাবে না। সঠিক উপায় কোনটি?"
    options: ["কী-টা সরাসরি collection.json-এ লিখে দেওয়া", "কী ছাড়াই চালানো, Stripe নিজে বুঝে নেবে", "কী-টা অপারেটিং সিস্টেমের এনভায়রনমেন্ট ভ্যারিয়েবলে রেখে --env-var দিয়ে Newman-কে দেওয়া", "কী-টা README-তে লিখে দেওয়া"]
    answer: 2
    explain: "--env-var \"stripeSecretKey=$STRIPE_TEST_KEY\" দিলে কী কোনো ফাইলে বা রিপোতে থাকে না, শুধু রানের সময় মেমরিতে আসে। ফাইলে বা README-তে কী রাখলে তা ফাঁস হয়।"
  - q: "Newman রান শেষ হলো, কয়েকটি টেস্ট ফেইল করেছে। কমান্ডের Exit code সাধারণত কী হবে, আর কেন এটা জরুরি?"
    options: ["0, কারণ রান শেষ হয়েছে", "404, কারণ টেস্ট পাওয়া যায়নি", "Exit code থাকে না", "1, যাতে CI পাইপলাইন বুঝতে পারে টেস্ট ফেইল করেছে এবং বিল্ড থামাতে পারে"]
    answer: 3
    explain: "সব পাস হলে 0, টেস্ট ফেইল বা রানে এরর হলে Newman শূন্য-নয় (সাধারণত 1) কোড দেয়। CI এই কোড দেখেই বিল্ড সবুজ বা লাল করে।"
  - q: "৫০০ সারির CSV দিয়ে Stripe Test Mode-এ চালাচ্ছেন। প্রথম কয়েকটির পর 429 রেসপন্স আসছে। কোন ফ্ল্যাগ সবচেয়ে কাজে আসবে?"
    options: ["--bail", "--delay-request 300", "--iteration-count 1000", "--insecure"]
    answer: 1
    explain: "429 মানে রেট লিমিট পেরিয়েছে। রিকোয়েস্টের মাঝে বিরতি দিলে চাপ কমে। --bail প্রথম ফেইলে থামায়, সমস্যা মেটায় না; --insecure শুধু SSL যাচাই বন্ধ করে, যা ঝুঁকিপূর্ণ।"
  - q: "htmlextra রিপোর্ট টিমের সাথে শেয়ার করবেন। কোন ঝুঁকি আগে দেখবেন?"
    options: ["রিপোর্টে রিকোয়েস্ট হেডার থাকতে পারে, যেমন Authorization: Bearer sk_test_…", "রিপোর্টের রং", "রিপোর্টের ফাইলের সাইজ", "রিপোর্টে কতগুলো ট্যাব আছে"]
    answer: 0
    explain: "HTML রিপোর্টে রিকোয়েস্ট ও রেসপন্সের বিস্তারিত থাকতে পারে, যার মধ্যে কী-ও থাকে। শেয়ারের আগে sensitive ডেটা বাদ দেওয়ার অপশন ব্যবহার করুন বা রিপোর্ট খুলে যাচাই করুন।"
  - q: "পুরো Collection নয়, শুধু '03 Refunds' ফোল্ডার চালাতে চান। কোনটি ঠিক?"
    options: ["ফোল্ডারটি আলাদা Collection হিসেবে আবার বানাতে হবে", "Newman ফোল্ডার চালাতে পারে না", "newman run collection.json --folder \"03 Refunds\" -e env.json", "newman refunds collection.json"]
    answer: 2
    explain: "--folder দিয়ে নির্দিষ্ট ফোল্ডার চালানো যায়। তবে মনে রাখুন, সেই ফোল্ডারের দরকারি ভ্যারিয়েবল (যেমন paymentIntentId) আগে থেকে না থাকলে চেইন ভাঙবে।"
---

Postman-এ বাটন চেপে টেস্ট চালানো শেখা হলো। কিন্তু প্রতিটি রিলিজের আগে কেউ বসে বাটন চাপবে, এটা টেকসই নয়। Newman (Postman Collection কমান্ড লাইন থেকে চালানোর ফ্রি টুল) দিয়ে একটি কমান্ডে পুরো স্যুট চলে, আর শেষে একটি HTML রিপোর্ট পাওয়া যায়।

এই লেসনটি অটোমেশনের প্রথম ধাপ। পরে [CI/CD ও GitHub Actions](/lessons/cicd-github-actions/) লেসনে এই কমান্ডই প্রতিটি কোড পরিবর্তনে নিজে নিজে চলবে।

## এই লেসনে যা শিখবেন

- Node.js LTS আর Newman ইনস্টল করা
- Postman থেকে Collection ও Environment Export করা
- `newman run` দিয়ে Environment, CSV ডেটা আর রিপোর্টারসহ চালানো
- দরকারি ফ্ল্যাগ: `--iteration-count`, `--delay-request`, `--bail`, `--env-var`, `--folder`
- Exit code কী, আর CI-তে কেন জরুরি
- htmlextra HTML রিপোর্ট পড়া, আর কী যেন রিপোর্টে বা রিপোতে না যায়

## ইনস্টলেশন

### Node.js LTS

Newman চলে Node.js (ব্রাউজারের বাইরে JavaScript চালানোর প্ল্যাটফর্ম) -এর ওপর। অফিসিয়াল সাইট থেকে **LTS** (Long Term Support, দীর্ঘ সময় সাপোর্ট পাওয়া স্থিতিশীল সংস্করণ) ডাউনলোড করুন: https://nodejs.org

ইনস্টলের পর নতুন টার্মিনাল (Windows-এ PowerShell, macOS/Linux-এ Terminal) খুলে যাচাই করুন:

```bash
node -v
npm -v
```

দুটোই একটি ভার্সন নম্বর দেখালে ঠিক আছে।

### Newman ও রিপোর্টার

```bash
npm install -g newman newman-reporter-htmlextra
newman -v
```

- `newman`: মূল টুল।
- `newman-reporter-htmlextra`: কমিউনিটির বানানো বিস্তারিত HTML রিপোর্টার, ট্যাব, ফিল্টার আর রিকোয়েস্ট-রেসপন্সের বিস্তারিতসহ।
- সাধারণ বিকল্প `newman-reporter-html` (Postman-এর নিজের, সহজ HTML রিপোর্ট)। চাইলে এটাও ইনস্টল করতে পারেন: `npm install -g newman-reporter-html`।

> [!TIP]
> macOS বা Linux-এ `-g` দিয়ে ইনস্টলে permission এরর এলে `sudo` ব্যবহার না করাই ভালো। nvm (Node Version Manager) দিয়ে Node ইনস্টল করলে গ্লোবাল প্যাকেজ নিজের ফোল্ডারে যায়, permission সমস্যা হয় না।

## Collection ও Environment Export

1. Postman-এ Collection-এর তিন ডট → **Export** → ফরম্যাট **Collection v2.1** → সেভ করুন `payment-qa.postman_collection.json` নামে।
2. Environments থেকে `test` Environment-এর তিন ডট → **Export** → `test.postman_environment.json`।
3. আগের লেসনের `payment-cases.csv` একই ফোল্ডারে রাখুন।

ফোল্ডার গঠন:

```text
payment-qa-tests/
├── payment-qa.postman_collection.json
├── test.postman_environment.json
├── data/
│   └── payment-cases.csv
├── reports/            (রিপোর্ট এখানে তৈরি হবে)
└── .gitignore
```

Export-এর পর `test.postman_environment.json` টেক্সট এডিটরে খুলুন। `stripeSecretKey`-এর `value` খালি হওয়া উচিত। কোনো `sk_test_` বা অন্য কী দেখলে মুছে দিন।

> [!DANGER]
> কী-সহ Environment ফাইল কখনো Git-এ commit করবেন না, পাবলিক বা প্রাইভেট যে রিপোই হোক। Git ইতিহাসে একবার ঢুকলে ফাইল মুছলেও কী থেকে যায়। ভুলে commit হলে সঙ্গে সঙ্গে Stripe Dashboard থেকে কী রোল করুন। Live কী (`sk_live_`) কখনো এই ফোল্ডারের ধারেকাছে আনবেন না।

`.gitignore`-এ অন্তত এগুলো রাখুন:

```text
reports/
.env
*.local.postman_environment.json
```

## `newman run`: মূল কমান্ড

### সবচেয়ে সহজ রূপ

প্রথমে একটি পাবলিক টেস্ট API দিয়ে শুরু করুন। আগের লেসনের JSONPlaceholder ফোল্ডার যদি আলাদা Collection হিসেবে Export করেন (`jsonplaceholder.postman_collection.json`):

```bash
newman run jsonplaceholder.postman_collection.json -e test.postman_environment.json
```

টার্মিনালে প্রতিটি রিকোয়েস্ট, স্ট্যাটাস, সময় আর টেস্টের ✓ বা ✗ দেখাবে। শেষে একটি সারসংক্ষেপ টেবিল: কতগুলো রিকোয়েস্ট, টেস্ট (assertions) পাস ও ফেইল।

### পূর্ণ কমান্ড: ডেটা আর HTML রিপোর্টসহ

```bash
newman run payment-qa.postman_collection.json \
  -e test.postman_environment.json \
  -d data/payment-cases.csv \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/report.html
```

প্রতিটি অংশের মানে:

| অংশ | মানে |
|---|---|
| `run <collection>` | কোন Collection চালাবে |
| `-e` | Environment ফাইল |
| `-d` | ডেটা ফাইল (CSV বা JSON), প্রতি সারি একটি Iteration |
| `-r cli,htmlextra` | কোন রিপোর্টার: টার্মিনাল আর htmlextra দুটোই |
| `--reporter-htmlextra-export` | HTML রিপোর্ট কোথায় সেভ হবে |

সাধারণ `newman-reporter-html` ব্যবহার করলে: `-r cli,html --reporter-html-export reports/report.html`।

Windows PowerShell-এ `\` দিয়ে লাইন ভাঙা চলে না। হয় পুরো কমান্ড এক লাইনে লিখুন, নয়তো লাইনের শেষে ব্যাকটিক (`` ` ``) দিন।

## দরকারি ফ্ল্যাগ

| ফ্ল্যাগ | কাজ | কখন |
|---|---|---|
| `-n, --iteration-count <n>` | পুরো Collection কতবার চলবে | ডেটা ফাইল ছাড়া একই ফ্লো কয়েকবার |
| `--delay-request <ms>` | প্রতি রিকোয়েস্টের মাঝে বিরতি | Stripe-এর রেট লিমিট এড়াতে, যেমন 300 |
| `--bail` | প্রথম ফেইল বা এররে রান থামাবে | চেইনের শুরুতে ফেইল হলে বাকিটা চালানো অর্থহীন |
| `--env-var "key=value"` | একটি Environment ভ্যারিয়েবল সেট বা ওভাররাইড | কী ফাইলে না রেখে পাঠাতে |
| `--folder "<নাম>"` | শুধু একটি ফোল্ডার চালাবে | শুধু Refunds বা শুধু Customers টেস্ট |
| `--timeout-request <ms>` | একটি রিকোয়েস্ট সর্বোচ্চ কত সময় অপেক্ষা করবে | ঝুলে থাকা রিকোয়েস্ট ধরতে |
| `--export-environment <file>` | রান শেষে Environment-এর মান ফাইলে লেখে | ডিবাগের জন্য; কী থাকলে এই ফাইলও গোপন |

সব ফ্ল্যাগের তালিকা: `newman run -h`। অফিসিয়াল ডকস: https://github.com/postmanlabs/newman এবং https://learning.postman.com/ (সার্চ করুন "Newman")।

### `--env-var` দিয়ে secret পাঠানো

কী থাকবে আপনার অপারেটিং সিস্টেমের Environment Variable (OS-এর ভেতরে রাখা নাম-মান জোড়া, ফাইলে নয়) -এ, আর Newman রানের সময় সেটা নেবে।

macOS / Linux (bash):

```bash
# এই সেশনের জন্য কী সেট করুন (নিজের Sandbox কী বসান)
export STRIPE_TEST_KEY="sk_test_XXXXXXXXXXXXXXXX"

newman run payment-qa.postman_collection.json \
  -e test.postman_environment.json \
  --env-var "stripeSecretKey=$STRIPE_TEST_KEY" \
  -d data/payment-cases.csv \
  --delay-request 300 \
  -r cli,htmlextra \
  --reporter-htmlextra-export reports/report.html
```

Windows PowerShell:

```bash
$env:STRIPE_TEST_KEY = "sk_test_XXXXXXXXXXXXXXXX"
newman run payment-qa.postman_collection.json -e test.postman_environment.json --env-var "stripeSecretKey=$env:STRIPE_TEST_KEY" -d data/payment-cases.csv --delay-request 300 -r cli,htmlextra --reporter-htmlextra-export reports/report.html
```

`--env-var` Environment ফাইলের একই নামের মানকে ওভাররাইড করে। ফলে ফাইলে কী খালি থাকলেও রান কাজ করে। GitHub Actions-এ এই মান আসবে Repository Secrets থেকে, যা [CI/CD লেসনে](/lessons/cicd-github-actions/) দেখাব।

> [!NOTE]
> টার্মিনালে সরাসরি কী টাইপ করলে তা shell history-তে থেকে যেতে পারে। শেখার সময় সমস্যা কম, কিন্তু অভ্যাস হিসেবে `.env` ফাইল (যা `.gitignore`-এ আছে) থেকে লোড করা বা CI-র secret ব্যবহার করা ভালো।

## Exit code

Exit code (কমান্ড শেষ হওয়ার পর OS-কে দেওয়া একটি সংখ্যা, যা বলে সফল কিনা):

| Exit code | মানে |
|---|---|
| `0` | সব রিকোয়েস্ট চলেছে, সব টেস্ট পাস |
| শূন্য নয় (সাধারণত `1`) | অন্তত একটি টেস্ট ফেইল, বা রানে এরর (ফাইল নেই, নেটওয়ার্ক, স্ক্রিপ্ট এরর) |

শেষ কমান্ডের Exit code দেখতে:

```bash
newman run jsonplaceholder.postman_collection.json -e test.postman_environment.json
echo $?
```

PowerShell-এ `echo $LASTEXITCODE`। CI টুল এই সংখ্যা দেখেই বিল্ড লাল বা সবুজ করে। তাই টেস্ট ফেইল হলে Newman ইচ্ছা করেই শূন্য-নয় কোড দেয়।

## HTML রিপোর্ট পড়া

`reports/report.html` ব্রাউজারে খুলুন। htmlextra রিপোর্টে সাধারণত এই অংশগুলো থাকে:

- **Summary:** মোট Iteration, রিকোয়েস্ট, Assertion, ফেইল সংখ্যা, মোট সময় ও গড় রেসপন্স টাইম।
- **Total Requests:** প্রতিটি রিকোয়েস্ট খুলে Request ও Response হেডার, বডি, আর টেস্টের পাস/ফেইল দেখা যায়।
- **Failed Tests:** শুধু ফেইলগুলো, কোন Iteration-এ, কোন Assertion, কী মেসেজ।
- **Skipped Tests:** যেগুলো চালানো হয়নি।

স্ক্রিনশট বর্ণনা: রিপোর্টের ওপরে কয়েকটি রঙিন কার্ড (মোট রিকোয়েস্ট, ফেইল টেস্ট ইত্যাদি), নিচে ট্যাব; Failed Tests ট্যাবে প্রতিটি ফেইল লাল বক্সে, যেমন "TC-PAY-009: স্ট্যাটাস 402 | expected response to have status code 402 but got 200"।

পড়ার ক্রম: আগে Summary, তারপর Failed Tests, তারপর ফেইল হওয়া রিকোয়েস্টের রেসপন্স বডি। টেস্টের নামে `caseId` থাকায় ([আগের লেসন](/lessons/postman-tests-data-driven/)) সরাসরি টেস্ট কেস শিটের সাথে মেলানো যায়, আর রেসপন্স হেডারের `Request-Id` (`req_…`) বাগ রিপোর্টে প্রমাণ হিসেবে দেওয়া যায়।

> [!DANGER] রিপোর্টে কী থাকতে পারে
> HTML রিপোর্টে রিকোয়েস্ট হেডার থাকে, যার মধ্যে `Authorization: Bearer sk_test_…` থাকতে পারে। শেয়ারের আগে রিপোর্ট খুলে খুঁজে দেখুন। htmlextra-তে সংবেদনশীল ডেটা বাদ দেওয়ার অপশন আছে (যেমন `--reporter-htmlextra-skipSensitiveData`); সঠিক অপশনের নাম ও আচরণ রিপোর্টারের README-তে দেখে নিন: https://github.com/DannyDainton/newman-reporter-htmlextra

## হাতেকলমে অনুশীলন

দুটি অংশে করুন: আগে JSONPlaceholder, তারপর Stripe Test Mode।

**অংশ ক: JSONPlaceholder**

1. Node.js LTS আর Newman ইনস্টল করে `newman -v` দেখুন।
2. `payment-qa-tests` ফোল্ডার বানিয়ে ওপরের গঠন অনুযায়ী ফাইল রাখুন।
3. JSONPlaceholder-এর Collection (আগের লেসনের ৩টি টেস্টসহ) Export করুন এবং চালান: `newman run jsonplaceholder.postman_collection.json -e test.postman_environment.json`।
4. `-r cli,htmlextra --reporter-htmlextra-export reports/jp.html` যোগ করে আবার চালান। রিপোর্ট খুলুন।
5. একটি টেস্ট ইচ্ছা করে ভাঙুন (যেমন স্ট্যাটাস ২০০-র বদলে ২০১ আশা করা), আবার Export করে চালান, `echo $?` দিয়ে Exit code দেখুন।

**অংশ খ: Stripe Test Mode**

6. Stripe Collection ও `test` Environment Export করুন। Environment ফাইলে কী নেই নিশ্চিত হোন।
7. টার্মিনালে `STRIPE_TEST_KEY` সেট করে ওপরের পূর্ণ কমান্ড `--env-var`, `-d data/payment-cases.csv` আর `--delay-request 300` সহ চালান।
8. `reports/report.html`-এ Failed Tests দেখুন। কোনো ফেইল থাকলে কারণ লিখুন: টেস্ট ভুল, নাকি ডেটা ভুল।
9. শুধু Refunds ফোল্ডার `--folder "03 Refunds"` দিয়ে চালান। `paymentIntentId` না থাকায় কী হয় লক্ষ্য করুন।
10. `--bail` দিয়ে একবার চালান এবং দেখুন প্রথম ফেইলে রান থামে কিনা।

<details><summary>সমাধান দেখুন: ধাপ ৯-এ কী হয় এবং কেন</summary>

Refunds ফোল্ডারের রিকোয়েস্ট `{{paymentIntentId}}` চায়। Customer ও PaymentIntent রিকোয়েস্ট না চলায় এই মান খালি থাকে (যদি Environment ফাইলে আগের মান না থাকে)। Stripe তখন `400` আর `invalid_request_error` দেয়, তাই টেস্ট ফেইল করে।

সমাধানের দুটি উপায়:

- পুরো চেইন চালান (ফোল্ডার ছাড়া), যাতে আগের রিকোয়েস্ট মান সেভ করে।
- Refunds ফোল্ডারের প্রথমে একটি নিজস্ব "Create PaymentIntent for refund" রিকোয়েস্ট রাখুন, যাতে ফোল্ডারটি একা চললেও কাজ করে।

দ্বিতীয়টি ভালো অভ্যাস: প্রতিটি ফোল্ডার নিজের ডেটা নিজে বানায়।

</details>

> [!MISTAKE]
> - কী-সহ `postman_environment.json` Git-এ commit করা।
> - `reports/` ফোল্ডার commit করা; রিপোর্টে হেডারসহ কী থাকতে পারে।
> - Postman-এ টেস্ট বদলে আবার Export না করা; Newman পুরনো ফাইলই চালায়।
> - Stripe-এ বড় ডেটা ফাইল `--delay-request` ছাড়া চালানো, তারপর 429 দেখে অবাক হওয়া।
> - SSL এরর এড়াতে `--insecure` দেওয়া; এতে নিরাপত্তা যাচাই বন্ধ হয়, আসল সমস্যা লুকায়।
> - Exit code না দেখে শুধু টার্মিনালের রং দেখে সিদ্ধান্ত নেওয়া।

## সারসংক্ষেপ

- `npm install -g newman newman-reporter-htmlextra` দিয়ে ইনস্টল; Collection v2.1 আর Environment Export।
- `newman run <collection> -e <env> -d <data> -r cli,htmlextra --reporter-htmlextra-export <file>` মূল কমান্ড।
- `--delay-request` রেট লিমিট থেকে বাঁচায়, `--bail` আগে থামায়, `--folder` একটি অংশ চালায়।
- কী ফাইলে নয়: OS Environment Variable থেকে `--env-var` দিয়ে দিন; Environment ফাইল, `.env` আর রিপোর্ট কখনো commit নয়।
- Exit code `0` মানে সব পাস, শূন্য-নয় মানে ফেইল; CI এটা দেখেই সিদ্ধান্ত নেয়।

## বাড়ির কাজ

1. একটি ছোট স্ক্রিপ্ট ফাইল (`run-tests.sh` বা `run-tests.ps1`) বানান, যা ওপরের পূর্ণ কমান্ড চালায় এবং রিপোর্টের নামে তারিখ রাখে (যেমন `reports/report-2026-11-02.html`)।
2. JSONPlaceholder ও Stripe দুটির জন্য আলাদা রিপোর্ট বানান এবং তুলনা করুন: গড় রেসপন্স টাইম কোনটির বেশি, কেন হতে পারে।
3. আপনার ফোল্ডারকে একটি প্রাইভেট GitHub রিপো হিসেবে রাখার প্রস্তুতি নিন (`.gitignore` সঠিক কিনা দেখুন)। [CI/CD ও GitHub Actions](/lessons/cicd-github-actions/) লেসনে এটাই স্বয়ংক্রিয়ভাবে চালাব। পরের সপ্তাহের শুরু [Stripe API টেস্টিং](/lessons/stripe-api-testing/) দিয়ে।
