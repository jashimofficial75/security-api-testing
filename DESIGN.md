# Design System: পেমেন্ট QA একাডেমি

Design spec for the free Bangla learning site on Payment Gateway Security Testing, API Testing and Webhook Setup. Hand this file to the AI together with the build prompt so the UI stays consistent.

---

## 1. Design principles

- **Bangla first.** All UI text, buttons, menus and the footer are in Bangla. Only technical terms (API, Webhook, Postman) stay in English.
- **Readable over fancy.** Long lessons, so comfortable line length and generous line height matter more than decoration.
- **Mobile first.** Most learners will open it on a phone.
- **Level is always visible.** Each level has its own colour, used on badges, card borders and progress.
- **Safety is loud.** Security lessons always open with a red warning box.
- **No real secrets.** Every code sample uses placeholders such as `sk_test_XXXXXXXX`.

---

## 2. Colour tokens

Define as CSS variables on `:root`. Redefine for dark mode under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`, so the manual toggle wins over the system setting.

### Light

| Token | Value | Use |
|---|---|---|
| `--bg` | `#FAFAF7` | Page background |
| `--surface` | `#FFFFFF` | Cards, header, code block frame |
| `--surface-2` | `#F1F3F6` | Table stripes, inline code |
| `--text` | `#1A1D23` | Body text |
| `--text-muted` | `#5B6270` | Captions, meta |
| `--border` | `#E3E5EA` | Dividers, card borders |
| `--primary` | `#2563EB` | Links, buttons, focus ring |
| `--primary-text` | `#FFFFFF` | Text on primary |
| `--code-bg` | `#0F172A` | Code block background |
| `--code-text` | `#E2E8F0` | Code block text |

### Dark

| Token | Value |
|---|---|
| `--bg` | `#0F1217` |
| `--surface` | `#171B22` |
| `--surface-2` | `#1F242D` |
| `--text` | `#E8EAEE` |
| `--text-muted` | `#9AA3B2` |
| `--border` | `#2A303B` |
| `--primary` | `#60A5FA` |
| `--primary-text` | `#0F1217` |
| `--code-bg` | `#0B0E13` |
| `--code-text` | `#E2E8F0` |

### Level colours

| Level | Name (UI) | Light | Dark |
|---|---|---|---|
| 0 | ভিত্তি | `#0F766E` | `#2DD4BF` |
| 1 | বিগিনার | `#15803D` | `#4ADE80` |
| 2 | ইন্টারমিডিয়েট | `#1D4ED8` | `#60A5FA` |
| 3 | Webhook | `#0369A1` | `#38BDF8` |
| 4 | সিকিউরিটি | `#C2410C` | `#FB923C` |
| 5 | অ্যাডভান্সড | `#7E22CE` | `#C084FC` |

### Status colours

| Token | Light | Dark | Use |
|---|---|---|---|
| `--success` | `#15803D` | `#4ADE80` | Correct quiz answer, completed |
| `--danger` | `#B91C1C` | `#F87171` | Wrong answer, security warning |
| `--warning` | `#B45309` | `#FBBF24` | Live Mode caution |
| `--info` | `#1D4ED8` | `#60A5FA` | Tips |

Never use colour alone to carry meaning. Pair it with an icon and a label (✔ সঠিক, ✖ ভুল).

---

## 3. Typography

- **Body and headings:** `"Hind Siliguri", "Noto Sans Bengali", system-ui, sans-serif` (Google Fonts, weights 400, 500, 600, 700).
- **Code:** `"JetBrains Mono", "Fira Code", ui-monospace, monospace`.
- Load fonts with `display=swap` and preconnect to Google Fonts.

| Style | Size | Weight | Line height |
|---|---|---|---|
| Hero title | `clamp(2rem, 5vw, 3.25rem)` | 700 | 1.35 |
| H1 (lesson title) | `clamp(1.75rem, 4vw, 2.5rem)` | 700 | 1.4 |
| H2 | `1.5rem` | 600 | 1.5 |
| H3 | `1.25rem` | 600 | 1.5 |
| Body | `1.0625rem` (17px) | 400 | **1.85** |
| Small / meta | `0.875rem` | 400 | 1.6 |
| Code | `0.9rem` | 400 | 1.6 |

**Bangla-specific rules**
- Line height of 1.8 or more, because Bangla matras and conjuncts need vertical room.
- No `text-transform: uppercase` and no `letter-spacing` on Bangla text. Both break conjunct shapes.
- No italics for Bangla. Use bold or a coloured note box for emphasis.
- Keep body line length between 60 and 75 characters (`max-width: 70ch`).
- Use Bangla numerals (০-৯) for lesson numbers and week counts. Keep English digits inside code, commands and card numbers.

---

## 4. Spacing, radius, elevation

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64 px.
- **Page gutter:** 16px on mobile, 24px on tablet, centred container `max-width: 1200px` on desktop.
- **Radius:** 8px (inputs, buttons), 12px (cards), 16px (hero, large panels), 999px (badges).
- **Border:** 1px solid `--border`. Prefer borders over shadows.
- **Shadow (only on hover or overlays):** `0 4px 16px rgba(0,0,0,0.08)`, and `0.35` opacity in dark mode.

---

## 5. Layout

### Breakpoints

| Name | Width | Layout |
|---|---|---|
| Mobile | under 640px | Single column, hamburger menu |
| Tablet | 640 to 1023px | Two-column cards |
| Desktop | 1024px and up | Lesson page: content plus right-side table of contents |
| Wide | 1280px and up | Container capped at 1200px |

### Lesson page (desktop)
```
[ Header: logo | search | theme toggle | progress ]
[ Sidebar: lesson list (collapsible) ] [ Content (70ch) ] [ TOC (sticky) ]
[ Prev lesson ]                                    [ Next lesson ]
```
- Mobile: sidebar becomes a slide-in drawer, TOC becomes a collapsible "এই পাতায়" block at the top.
- Header is sticky, 64px high. It has a thin progress bar on its bottom edge.

---

## 6. Components

### Header
- Logo and site name on the left, nav links (হোম, রোডম্যাপ, লেসন, টুলবক্স, রিসোর্স, ল্যাব), search, theme toggle.
- Theme toggle shows ☀ or 🌙 with an `aria-label` in Bangla ("ডার্ক মোড চালু করুন").

### Hero (home)
- Large Bangla headline, one-line subtitle, two buttons: **"শেখা শুরু করুন"** (primary) and **"রোডম্যাপ দেখুন"** (outline).
- Below it, three stat chips: "৩৫টি লেসন", "১০ সপ্তাহ", "১০০% ফ্রি".

### Level card
- Top border 4px in the level colour, level badge, title, short description, lesson count, time estimate, and a small progress ring.
- Hover: lift 2px and show shadow. Whole card is one link.

### Level badge
- Pill, 12px text, level colour at 12% opacity as background, level colour for text and border.

### Lesson list item
- Number, title, time, a ✔ checkbox on the right. Completed items get muted text and a check icon.

### Code block
- Dark background in both themes, 12px radius, language label top-left, **"কপি করুন"** button top-right.
- On click the button text changes to **"কপি হয়েছে ✔"** for 2 seconds, then reverts.
- Horizontal scroll for long lines, never wrap commands.
- Inline code: `--surface-2` background, 4px radius, 2px 6px padding.

### Callout boxes
All have a 4px left border, icon, bold Bangla title and body text.

| Type | Title | Colour |
|---|---|---|
| Tip | মেন্টরের টিপ | `--info` |
| Warning (security) | সতর্কতা: শুধু নিজের বা অনুমতিপ্রাপ্ত পরিবেশে টেস্ট করুন | `--danger`, filled light-red background |
| Live Mode caution | লাইভ মোডে টেস্টের আগে অনুমতি নিন | `--warning` |
| Common mistake | সাধারণ ভুল | `--warning` |
| Success check | সফলতার চেকলিস্ট | `--success` |

### Tables
- Full width, horizontal scroll on mobile, zebra stripes with `--surface-2`, sticky header row.
- Test-card and test-case tables keep numbers in monospace.

### Quiz (5 MCQs per lesson)
- One question card at a time, or all five stacked. Options are large tap targets (min 48px).
- After answering: lock the question, highlight correct in `--success` and a wrong pick in `--danger`, show the explanation immediately.
- Final score: "আপনি ৫টির মধ্যে ৪টি সঠিক করেছেন", with a retry button. Mark the lesson complete when the learner finishes.

### Progress tracking
- Per-lesson checkbox plus overall percentage bar in the header and on the roadmap page.
- Stored in `localStorage`. Every read and write is wrapped in `try/catch`. If storage fails, the page still renders with progress held in memory.

### Search
- Input with a clear (✕) button, results dropdown showing lesson title, level badge and the matching snippet.
- Must match Bangla text (normalise Unicode before comparing). Show "কিছু পাওয়া যায়নি" for an empty result.

### Buttons
- **Primary:** `--primary` background, 44px min height, 8px radius, 600 weight.
- **Outline:** transparent background, 1px `--primary` border.
- **Ghost:** text only, for copy and toggles.
- Disabled: 50% opacity, `cursor: not-allowed`.

### Collapsible "সমাধান দেখুন"
- Native `<details>` and `<summary>`, styled as a bordered block. The answer stays hidden until opened.

### Footer
- Four columns on desktop: সাইট সম্পর্কে, লেসন, রিসোর্স, নৈতিকতা নীতি. Single column on mobile.
- Short line: "এই সাইটের সব কনটেন্ট শিক্ষামূলক। শুধু অনুমতিপ্রাপ্ত পরিবেশে টেস্ট করুন।"

---

## 7. Page-specific notes

| Page | Key design points |
|---|---|
| হোম | Hero, level cards grid, tool strip (logos or names), FAQ accordion |
| রোডম্যাপ | Vertical timeline for ১০ সপ্তাহ, each week a card with level colour dot |
| সব লেসন | Filter chips by level, grid of lesson cards, search at top |
| টুলবক্স | Card per tool: name, what it does, free link, install steps in a collapsible |
| রিসোর্স লাইব্রেরি | Grouped sections (Stripe, Postman, OWASP, Labs). Show a small "লিংক যাচাই করুন" note |
| প্র্যাকটিস ল্যাব | 8 lab cards with level badge, "সমাধান দেখুন" collapsible |
| ক্যাপস্টোন | Deliverables checklist plus rubric table |
| চিটশিট | Compact tables (status codes, Stripe test cards, bug report template), print-friendly CSS |
| FAQ ও ক্যারিয়ার | Accordion plus career path stepper (SQA → SQA Automation Engineer) |

---

## 8. Motion

- Keep it subtle: 150 to 200ms ease-out for hover, focus and theme change.
- Page and lesson changes: simple fade, no slide or parallax.
- Respect `prefers-reduced-motion: reduce` by turning off all transitions and animations.

---

## 9. Accessibility checklist

- Semantic landmarks: `header`, `nav`, `main`, `aside`, `footer`. One `h1` per page.
- Visible focus ring: 2px `--primary` outline with 2px offset, never removed.
- Body text contrast target is WCAG AA (4.5:1). The colours above are chosen for that, but **verify each pair with a contrast checker** before release, including level badges and callouts in dark mode.
- All icons have text labels or `aria-label` in Bangla. Images have Bangla `alt` text.
- Full keyboard use: menu, search, quiz options, collapsibles, copy buttons.
- Quiz feedback uses `aria-live="polite"` so screen readers announce the result.
- Set `<html lang="bn">`.

---

## 10. Performance and SEO

- Static HTML, CSS and vanilla JS. No frameworks, no backend.
- Self-contained pages, minimal JS, lazy-load images, target page weight under 300KB excluding fonts.
- Each page has a unique Bangla `<title>`, `meta description` and Open Graph tags.

---

## 11. Do and don't

**Do**
- Keep paragraphs short (2 to 4 lines) and break with callouts, tables and code.
- Show the level badge and estimated time at the top of every lesson.
- Put the red safety warning at the start of every security lesson.

**Don't**
- Don't use real API keys, card numbers or passwords anywhere, even as "examples".
- Don't use uppercase or letter-spacing styling on Bangla.
- Don't rely on colour alone, and don't use auto-playing motion.
- Don't invent resource links. If a URL is uncertain, show the resource name and a search hint, and flag it for verification.
