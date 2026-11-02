/**
 * The site's own words: name, navigation, levels, home, about and contact
 * copy. Every string is plain text (rendered escaped). Lessons, guides, tools,
 * resources and labs live in the content collections (src/content.config.ts).
 */

export const SITE = {
  name: 'পেমেন্ট QA একাডেমি',
  /** Who runs it (shown in the footer). */
  publisher: 'SQA Mentor',
  /** One sentence: the home page's meta description and the footer line. */
  description:
    'বাংলায় ফ্রি কোর্স: Payment Gateway Security Testing, API Testing ও Webhook Setup। Beginner থেকে Advanced, শুধু ফ্রি টুল দিয়ে হাতেকলমে।',
  /** `en`, `fr`, … : the page language (screen readers, search engines). */
  lang: 'bn',
  /**
   * The site's public address, for canonical URLs and social cards
   * (`https://www.example.com`, no trailing slash). Leave empty until known.
   */
  url: '',
};

export interface NavItem {
  label: string;
  href: string;
}

/** Top navigation: pages of THIS site only, plain links. */
export const NAV: NavItem[] = [
  {label: 'হোম', href: '/'},
  {label: 'রোডম্যাপ', href: '/roadmap/'},
  {label: 'লেসন', href: '/lessons/'},
  {label: 'টুলবক্স', href: '/toolbox/'},
  {label: 'রিসোর্স', href: '/resources/'},
  {label: 'ল্যাব', href: '/labs/'},
  {label: 'চিটশিট', href: '/cheatsheet/'},
];

/** Footer columns (DESIGN.md "Footer"). */
export const FOOTER = [
  {
    title: 'সাইট সম্পর্কে',
    links: [
      {label: 'আমাদের সম্পর্কে', href: '/about/'},
      {label: 'যোগাযোগ', href: '/contact/'},
      {label: 'ব্লগ', href: '/blog/'},
    ],
  },
  {
    title: 'লেসন',
    links: [
      {label: 'কোর্স রোডম্যাপ', href: '/roadmap/'},
      {label: 'সব লেসন', href: '/lessons/'},
      {label: 'ক্যাপস্টোন প্রজেক্ট', href: '/capstone/'},
    ],
  },
  {
    title: 'রিসোর্স',
    links: [
      {label: 'টুলবক্স', href: '/toolbox/'},
      {label: 'ফ্রি রিসোর্স লাইব্রেরি', href: '/resources/'},
      {label: 'প্র্যাকটিস ল্যাব', href: '/labs/'},
      {label: 'চিটশিট', href: '/cheatsheet/'},
    ],
  },
  {
    title: 'নৈতিকতা নীতি',
    links: [
      {label: 'নৈতিকতা ও আইনি সীমা', href: '/about/#ethics'},
      {label: 'FAQ ও ক্যারিয়ার গাইড', href: '/career/'},
    ],
  },
];

/** The six levels of the course; `level` in a lesson's front matter is the index. */
export const LEVELS = [
  {id: 0, name: 'ভিত্তি', weeks: 'সপ্তাহ ১', summary: 'পেমেন্ট সিস্টেম, HTTP-JSON এবং Stripe Sandbox: যা না জানলে সামনে এগোনো যায় না।'},
  {id: 1, name: 'বিগিনার', weeks: 'সপ্তাহ ২–৩', summary: 'Postman-এ প্রথম API কল, Stripe টেস্ট কার্ড, টেস্ট কেস আর ভালো বাগ রিপোর্ট লেখা।'},
  {id: 2, name: 'ইন্টারমিডিয়েট', weeks: 'সপ্তাহ ৪–৫', summary: 'Postman Tests, Newman, Stripe API, Idempotency এবং Playwright দিয়ে অটোমেশন।'},
  {id: 3, name: 'Webhook', weeks: 'সপ্তাহ ৬', summary: 'Webhook সেটআপ, Stripe CLI, Signature Verification আর Webhook-এর টেস্ট কেস।'},
  {id: 4, name: 'সিকিউরিটি', weeks: 'সপ্তাহ ৭–৮', summary: 'নৈতিকতা থেকে OWASP, পেমেন্ট লজিকের দুর্বলতা, Burp/ZAP ও PCI DSS: শুধু নিজের ল্যাবে।'},
  {id: 5, name: 'অ্যাডভান্সড', weeks: 'সপ্তাহ ৯–১০', summary: 'CI/CD, k6 লোড টেস্ট, Contract Testing, Reconciliation আর ক্যারিয়ার প্রস্তুতি।'},
] as const;

/** The 10-week plan on the roadmap page: what each week is for. */
export const WEEKS = [
  {week: 1, level: 0, goal: 'পেমেন্ট কীভাবে চলে বুঝুন, Stripe Test Mode অ্যাকাউন্ট খুলুন।'},
  {week: 2, level: 1, goal: 'Postman-এ API কল করুন, টেস্ট কার্ড দিয়ে পেমেন্ট ফ্লো চালান।'},
  {week: 3, level: 1, goal: '৩০টির বেশি টেস্ট কেস আর ৫টি বাগ রিপোর্ট লিখুন।'},
  {week: 4, level: 2, goal: 'Collection, Environment, Tests বানান; Newman দিয়ে রিপোর্ট নিন।'},
  {week: 5, level: 2, goal: 'Stripe API, Idempotency আর Playwright দিয়ে অটোমেশন।'},
  {week: 6, level: 3, goal: 'Stripe CLI দিয়ে Webhook চালান, Signature যাচাই করুন, টেস্ট কেস লিখুন।'},
  {week: 7, level: 4, goal: 'নৈতিকতা, OWASP আর পেমেন্ট লজিক ও Auth-এর দুর্বলতা নিজের ল্যাবে।'},
  {week: 8, level: 4, goal: 'Webhook সিকিউরিটি, ডেটা ফাঁস, Burp/ZAP আর PCI DSS-এর বেসিক।'},
  {week: 9, level: 5, goal: 'GitHub Actions, k6 আর Contract Testing দিয়ে টেস্ট পাইপলাইন।'},
  {week: 10, level: 5, goal: 'Reconciliation, দেশি গেটওয়ে, মনিটরিং আর পোর্টফোলিও তৈরি।'},
];

/** The home page, top to bottom. */
export const HOME = {
  hero: {
    eyebrow: 'বাংলায় ১০০% ফ্রি কোর্স',
    title: 'পেমেন্ট টেস্টিং শিখুন: API, Webhook আর Security, একদম শুরু থেকে',
    body: 'Manual QA থেকে SQA Automation Engineer হওয়ার পথে: Stripe Sandbox, Postman আর ফ্রি টুল দিয়ে ১০ সপ্তাহে হাতেকলমে শিখুন, প্রতিটি লেসনের শেষে কুইজ।',
    primary: {label: 'শেখা শুরু করুন', href: '/lessons/how-payments-work/'},
    secondary: {label: 'রোডম্যাপ দেখুন', href: '/roadmap/'},
  },
  who: {
    title: 'এই কোর্স কাদের জন্য',
    items: [
      {title: 'Manual QA', body: 'যারা UI টেস্ট করেন, এখন API আর পেমেন্ট ফ্লো বুঝতে চান।'},
      {title: 'ফ্রেশ গ্র্যাজুয়েট', body: 'যারা SQA ক্যারিয়ার শুরু করতে চান একটা চাহিদাসম্পন্ন দক্ষতা দিয়ে।'},
      {title: 'জুনিয়র SQA', body: 'যারা ফিনটেক বা ই-কমার্স প্রজেক্টে পেমেন্ট টেস্টের দায়িত্ব পাচ্ছেন।'},
      {title: 'ভবিষ্যৎ Automation Engineer', body: 'যারা Postman, Newman, Playwright আর CI/CD-তে হাত পাকাতে চান।'},
    ],
  },
  tools: ['Postman', 'Newman', 'Stripe CLI', 'Playwright', 'webhook.site', 'ngrok', 'k6', 'Burp Suite', 'OWASP ZAP', 'Juice Shop', 'GitHub Actions', 'VS Code'],
  faq: [
    {q: 'কোর্সটা কি সত্যিই ফ্রি?', a: 'হ্যাঁ। সব লেসন, কুইজ, ল্যাব আর চিটশিট ফ্রি। যেসব টুল ব্যবহার করবেন সেগুলোও ফ্রি বা ফ্রি প্ল্যানে চলে।'},
    {q: 'কোডিং জানতে হবে?', a: 'শুরুতে না। প্রথম তিন লেভেল কোডিং ছাড়াই চলে। Automation অংশে একটু JavaScript/TypeScript লাগবে, আমরা ধাপে ধাপে দেখাব।'},
    {q: 'Stripe-এ টেস্ট করতে কি আসল কার্ড বা টাকা লাগে?', a: 'না। Stripe-এর Test Mode-এ শুধু টেস্ট কার্ড নম্বর ব্যবহার হয়, কোনো আসল টাকা কাটে না। আসল কার্ড কখনো ব্যবহার করবেন না।'},
    {q: 'অগ্রগতি কোথায় সেভ হয়?', a: 'শুধু আপনার নিজের ব্রাউজারে (localStorage)। কোনো অ্যাকাউন্ট লাগে না, আমরা কোনো তথ্য সংগ্রহ করি না। ব্রাউজার ডেটা মুছলে অগ্রগতিও মুছে যাবে।'},
    {q: 'সিকিউরিটি টেস্টিং শেখা কি আইনসম্মত?', a: 'নিজের অ্যাপ, নিজের Stripe Sandbox আর ইচ্ছাকৃতভাবে দুর্বল ফ্রি ল্যাবে শেখা সম্পূর্ণ নিরাপদ। অনুমতি ছাড়া কোনো আসল সাইটে টেস্ট করা অপরাধ, এখানে তা কখনো শেখানো হয় না।'},
  ],
};

export const ABOUT = {
  title: 'আমাদের সম্পর্কে ও নৈতিকতা নীতি',
  lede: 'কারা বানিয়েছে, কেন ফ্রি, আর এই সাইটে শেখার সময় যে নিয়ম সবাইকে মানতে হবে।',
};

export const CONTACT = {
  title: 'যোগাযোগ',
  lede: 'কোনো লেসনে ভুল পেয়েছেন, নতুন টপিকের আইডিয়া আছে বা প্রশ্ন? আমাদের জানান।',
  /** Shown as a mailto: link. Use an address you read; empty = no email shown. */
  email: '',
  /** Prefilled subject for the email. */
  subject: 'পেমেন্ট QA একাডেমি: মতামত',
  /**
   * Optional: an https:// link to a form hosted elsewhere (a form service the
   * owner uses). Empty = the email link only. A static site cannot receive posts.
   */
  formUrl: '',
};
