import {defineCollection} from 'astro:content';
import {file, glob} from 'astro/loaders';
import {z} from 'astro/zod';

/**
 * The blog: one Markdown file per post in `src/content/blog/`. The file name
 * is the URL (`hello-world.md` → `/blog/hello-world/`). Front matter is
 * checked at build time: a missing title or a bad date fails the build with
 * the file name, before anything goes live.
 */
const blog = defineCollection({
  loader: glob({pattern: '**/*.md', base: './src/content/blog'}),
  schema: ({image}) =>
    z.object({
      title: z.string().min(1).max(120),
      /** One or two sentences: the list, the meta description, social cards. */
      description: z.string().min(1).max(200),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().max(80).optional(),
      /**
       * The cover (1200×630 or larger, 16:9-ish), one of:
       *   - a file in `src/assets/` relative to the post (`../../assets/blog/post.jpg`):
       *     optimised at build (AVIF/WebP, several widths). PREFERRED;
       *   - a path in `public/` (`/images/post.webp`), served as committed;
       *   - an https URL (an image CDN).
       */
      cover: z
        .union([
          z.string().regex(/^(\/[^/]|https:\/\/)/, 'Use ./ or ../ for src/assets, a /path in public/ or an https:// URL.'),
          image(),
        ])
        .optional(),
      coverAlt: z.string().max(200).default(''),
      /** Lowercase words; each gets a page at `/blog/tags/<tag>/`. */
      tags: z.array(z.string().min(1).max(40)).max(10).default([]),
      /** `true`: built in `npm run dev` only, never published. */
      draft: z.boolean().default(false),
    }),
});

/**
 * The course: one Markdown file per lesson in `src/content/lessons/`. The file
 * name is the URL (`how-payments-work.md` → `/lessons/how-payments-work/`);
 * `order` puts it in the course. Each lesson ends with exactly five MCQs.
 */
const quizQuestion = z.object({
  q: z.string().min(1).max(300),
  options: z.array(z.string().min(1).max(200)).length(4),
  /** Index (0–3) of the right option. */
  answer: z.number().int().min(0).max(3),
  /** Shown right after the learner answers. */
  explain: z.string().min(1).max(500),
});

const lessons = defineCollection({
  loader: glob({pattern: '*.md', base: './src/content/lessons'}),
  schema: z.object({
    order: z.number().int().min(1).max(60),
    /** 0 ভিত্তি · 1 বিগিনার · 2 ইন্টারমিডিয়েট · 3 Webhook · 4 সিকিউরিটি · 5 অ্যাডভান্সড (src/content/levels.ts). */
    level: z.number().int().min(0).max(5),
    week: z.number().int().min(1).max(10),
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(200),
    /** Extra words the lesson search should match (Bangla and English). */
    keywords: z.array(z.string().min(1).max(40)).max(20).default([]),
    minutes: z.number().int().min(5).max(240),
    quiz: z.array(quizQuestion).length(5),
  }),
});

/** Long-form pages (cheat sheet, capstone, career, ethics): Markdown rendered by their page. */
const guides = defineCollection({
  loader: glob({pattern: '*.md', base: './src/content/guides'}),
  schema: z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(200),
  }),
});

const https = z.string().regex(/^https:\/\//, 'https:// links only');

/** The toolbox page: one entry per free tool. */
const tools = defineCollection({
  loader: file('src/content/tools.json'),
  schema: z.object({
    name: z.string().max(60),
    category: z.string().max(40),
    /** What it is for, in Bangla. */
    use: z.string().max(400),
    url: https,
    /** Short install / setup steps, in Bangla (commands may be English). */
    install: z.array(z.string().max(300)).max(10),
    lessons: z.array(z.string()).max(10).default([]),
  }),
});

/** The resource library: grouped free links. */
const resources = defineCollection({
  loader: file('src/content/resources.json'),
  schema: z.object({
    group: z.string().max(60),
    title: z.string().max(120),
    url: https,
    note: z.string().max(300),
    /** বাংলা / English */
    lang: z.enum(['bn', 'en']).default('en'),
  }),
});

/** The practice lab: safe, free, intentionally vulnerable or sandbox targets. */
const labs = defineCollection({
  loader: file('src/content/labs.json'),
  schema: z.object({
    title: z.string().max(120),
    level: z.number().int().min(0).max(5),
    target: z.string().max(120),
    targetUrl: https,
    goal: z.string().max(400),
    steps: z.array(z.string().max(400)).min(1).max(12),
    solution: z.array(z.string().max(500)).min(1).max(12),
    lessons: z.array(z.string()).max(10).default([]),
  }),
});

export const collections = {blog, lessons, guides, tools, resources, labs};
