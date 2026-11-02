/**
 * The site's own script: one small module, bundled and deferred (Base.astro).
 * Every page is complete HTML without it; this only adds the interactive
 * parts: theme toggle, course progress, quiz feedback, code copy buttons and
 * the lesson search/filter. Clicks are handled by delegation on `document`
 * (bound once), page work runs on `astro:page-load` (every navigation).
 *
 * Progress and theme live ONLY in this browser (localStorage). Every read and
 * write is in try/catch: if storage is blocked, everything still works for
 * the visit, held in memory.
 */

const PROGRESS_KEY = 'pqa-progress-v1';
const THEME_KEY = 'pqa-theme';

const BN = '০১২৩৪৫৬৭৮৯';
const bn = (value: number | string) => String(value).replace(/[0-9]/g, d => BN[Number(d)]);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: keep going with the in-memory copy.
  }
}

interface Progress {
  done: string[];
  /** Best quiz score per lesson. */
  quiz: Record<string, number>;
}

const stored = load<Partial<Progress>>(PROGRESS_KEY, {});
const progress: Progress = {
  done: Array.isArray(stored.done) ? stored.done.filter(id => typeof id === 'string') : [],
  quiz: stored.quiz && typeof stored.quiz === 'object' ? stored.quiz : {},
};
let theme: string | null = load<string | null>(THEME_KEY, null);

const isDone = (id: string) => progress.done.includes(id);

function setDone(id: string, done: boolean): void {
  progress.done = progress.done.filter(x => x !== id);
  if (done) progress.done.push(id);
  save(PROGRESS_KEY, progress);
  renderProgress();
}

function announce(message: string): void {
  const region = document.querySelector<HTMLElement>('[data-announce]');
  if (!region) return;
  region.textContent = '';
  // A fresh change, so screen readers read the same message twice in a row too.
  window.setTimeout(() => (region.textContent = message), 50);
}

/* ---------- theme ---------- */

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function applyTheme(): void {
  const root = document.documentElement;
  if (theme === 'dark' || theme === 'light') root.dataset.theme = theme;
  else delete root.dataset.theme;
  const dark = theme ? theme === 'dark' : systemDark();
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach(button => {
    button.setAttribute('aria-label', dark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন');
    const icon = button.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = dark ? '☀' : '🌙';
  });
}

function toggleTheme(): void {
  const dark = theme ? theme === 'dark' : systemDark();
  theme = dark ? 'light' : 'dark';
  save(THEME_KEY, theme);
  applyTheme();
}

// As early as this module runs, and again on every client-side page swap
// (the new page's <html> arrives without the attribute).
applyTheme();
document.addEventListener('astro:after-swap', applyTheme);

/* ---------- progress ---------- */

function renderProgress(): void {
  const bar = document.querySelector<HTMLProgressElement>('[data-progress-total]');
  const all = (bar?.dataset.lessons ?? '').split(',').filter(Boolean);
  const doneCount = all.filter(isDone).length;
  const percent = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  if (bar) {
    bar.value = percent;
    bar.setAttribute('aria-valuetext', `${bn(percent)}% সম্পন্ন`);
  }
  document.querySelectorAll<HTMLElement>('[data-progress-text]').forEach(el => {
    el.textContent = `${bn(percent)}% সম্পন্ন · ${bn(all.length)}টির মধ্যে ${bn(doneCount)}টি লেসন`;
  });
  document.querySelectorAll<HTMLProgressElement>('progress[data-progress-overall]').forEach(el => (el.value = percent));

  document.querySelectorAll<HTMLElement>('[data-lesson-id]').forEach(el => {
    const done = isDone(el.dataset.lessonId!);
    el.classList.toggle('is-done', done);
    el.querySelectorAll<HTMLElement>('[data-done-mark]').forEach(mark => (mark.hidden = !done));
  });

  document.querySelectorAll<HTMLElement>('[data-level-ids]').forEach(el => {
    const ids = el.dataset.levelIds!.split(',').filter(Boolean);
    const n = ids.filter(isDone).length;
    const meter = el.querySelector<HTMLProgressElement>('progress');
    if (meter) meter.value = ids.length ? Math.round((n / ids.length) * 100) : 0;
    const text = el.querySelector<HTMLElement>('[data-level-text]');
    if (text) text.textContent = `${bn(ids.length)}টির মধ্যে ${bn(n)}টি সম্পন্ন`;
  });

  document.querySelectorAll<HTMLButtonElement>('[data-complete-toggle]').forEach(button => {
    const done = isDone(button.dataset.lesson!);
    button.setAttribute('aria-pressed', String(done));
    button.textContent = done ? '✔ সম্পন্ন হয়েছে (বাতিল করতে ক্লিক করুন)' : 'লেসনটি সম্পন্ন হিসেবে চিহ্নিত করুন';
  });
}

/* ---------- quiz ---------- */

function answerQuestion(option: HTMLButtonElement): void {
  const item = option.closest<HTMLElement>('[data-quiz-item]');
  const quiz = option.closest<HTMLElement>('[data-quiz]');
  if (!item || !quiz || item.dataset.answered) return;
  const correct = Number(item.dataset.answer);
  const picked = Number(option.dataset.index);
  item.dataset.answered = String(picked === correct);
  item.querySelectorAll<HTMLButtonElement>('[data-quiz-option]').forEach(button => {
    const index = Number(button.dataset.index);
    button.setAttribute('aria-disabled', 'true');
    const verdict = button.querySelector<HTMLElement>('[data-verdict]');
    if (index === correct) {
      button.classList.add('is-correct');
      if (verdict) verdict.textContent = '✔ সঠিক উত্তর';
    } else if (index === picked) {
      button.classList.add('is-wrong');
      if (verdict) verdict.textContent = '✖ আপনার উত্তর';
    }
  });
  const status = item.querySelector<HTMLElement>('[data-quiz-status]');
  if (status) {
    const letter = item.querySelectorAll('[data-quiz-option]')[correct]?.querySelector('[data-letter]')?.textContent ?? '';
    status.textContent = picked === correct ? '✔ সঠিক! দারুণ।' : `✖ ভুল হয়েছে। সঠিক উত্তর: ${letter}`;
    status.className = picked === correct ? 'quiz-status is-correct' : 'quiz-status is-wrong';
  }
  item.querySelector<HTMLElement>('[data-quiz-explain]')?.removeAttribute('hidden');

  const items = [...quiz.querySelectorAll<HTMLElement>('[data-quiz-item]')];
  if (items.every(q => q.dataset.answered)) {
    const score = items.filter(q => q.dataset.answered === 'true').length;
    const lesson = quiz.dataset.lesson!;
    progress.quiz[lesson] = Math.max(progress.quiz[lesson] ?? 0, score);
    const result = quiz.querySelector<HTMLElement>('[data-quiz-result]');
    const text = quiz.querySelector<HTMLElement>('[data-quiz-score]');
    if (text) {
      const cheer = score === items.length ? 'অসাধারণ! ' : score >= 3 ? 'ভালো হয়েছে! ' : 'আরেকবার লেসনটা দেখে নিন। ';
      text.textContent = `${cheer}আপনি ${bn(items.length)}টির মধ্যে ${bn(score)}টি সঠিক করেছেন। লেসনটি সম্পন্ন হিসেবে চিহ্নিত হয়েছে ✔`;
    }
    if (result) result.hidden = false;
    setDone(lesson, true);
  }
}

function resetQuiz(quiz: HTMLElement): void {
  quiz.querySelectorAll<HTMLElement>('[data-quiz-item]').forEach(item => {
    delete item.dataset.answered;
    item.querySelectorAll<HTMLButtonElement>('[data-quiz-option]').forEach(button => {
      button.removeAttribute('aria-disabled');
      button.classList.remove('is-correct', 'is-wrong');
      const verdict = button.querySelector<HTMLElement>('[data-verdict]');
      if (verdict) verdict.textContent = '';
    });
    const status = item.querySelector<HTMLElement>('[data-quiz-status]');
    if (status) {
      status.textContent = '';
      status.className = 'quiz-status';
    }
    item.querySelector<HTMLElement>('[data-quiz-explain]')?.setAttribute('hidden', '');
  });
  const result = quiz.querySelector<HTMLElement>('[data-quiz-result]');
  if (result) result.hidden = true;
  quiz.querySelector<HTMLButtonElement>('[data-quiz-option]')?.focus();
}

/* ---------- code copy buttons ---------- */

function addCopyButtons(): void {
  document.querySelectorAll<HTMLPreElement>('.prose pre').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-block')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.replaceWith(wrapper);
    wrapper.append(pre);
    const lang = /language-([\w-]+)/.exec(pre.querySelector('code')?.className ?? '')?.[1];
    if (lang && lang !== 'text') {
      const label = document.createElement('span');
      label.className = 'code-lang';
      label.textContent = lang;
      wrapper.append(label);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.dataset.copy = '';
    button.textContent = 'কপি করুন';
    wrapper.append(button);
  });
}

async function copyCode(button: HTMLButtonElement): Promise<void> {
  const text = button.parentElement?.querySelector('pre')?.textContent ?? '';
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    // Older browsers or no clipboard permission: select the text instead.
    const pre = button.parentElement?.querySelector('pre');
    const selection = window.getSelection();
    if (pre && selection) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  button.textContent = ok ? 'কপি হয়েছে ✔' : 'সিলেক্ট হয়েছে, Ctrl+C চাপুন';
  announce(ok ? 'কোড কপি হয়েছে' : 'কোড সিলেক্ট হয়েছে, Ctrl+C চেপে কপি করুন');
  window.setTimeout(() => (button.textContent = 'কপি করুন'), 2000);
}

/* ---------- lesson search and level filter (/lessons/) ---------- */

/** Same text for "য়" typed either way, no ZWJ/ZWNJ, Bangla digits as 0–9, any case. */
const normalize = (text: string) =>
  text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‌‍]/g, '')
    .replace(/[০-৯]/g, d => String(BN.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim();

function filterLessons(): void {
  const root = document.querySelector<HTMLElement>('[data-lesson-browser]');
  if (!root) return;
  const input = root.querySelector<HTMLInputElement>('[data-lesson-query]');
  const level = root.dataset.level ?? 'all';
  const terms = normalize(input?.value ?? '').split(' ').filter(Boolean);
  let shown = 0;
  root.querySelectorAll<HTMLElement>('[data-lesson-card]').forEach(card => {
    const haystack = (card.dataset.haystack ??= normalize(card.dataset.search ?? card.textContent ?? ''));
    const visible = (level === 'all' || card.dataset.level === level) && terms.every(term => haystack.includes(term));
    card.hidden = !visible;
    if (visible) shown++;
  });
  root.querySelectorAll<HTMLElement>('[data-level-group]').forEach(group => {
    group.hidden = !group.querySelector('[data-lesson-card]:not([hidden])');
  });
  const count = root.querySelector<HTMLElement>('[data-result-count]');
  if (count) count.textContent = shown ? `${bn(shown)}টি লেসন দেখানো হচ্ছে` : 'কিছু পাওয়া যায়নি। অন্য শব্দ দিয়ে খুঁজে দেখুন।';
  root.querySelectorAll<HTMLElement>('[data-filter-level]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filterLevel === level)));
  const clear = root.querySelector<HTMLElement>('[data-clear-query]');
  if (clear) clear.hidden = !input?.value;

  const url = new URL(window.location.href);
  if (input?.value) url.searchParams.set('q', input.value);
  else url.searchParams.delete('q');
  if (level !== 'all') url.searchParams.set('level', level);
  else url.searchParams.delete('level');
  if (url.href !== window.location.href) history.replaceState(history.state, '', url);
}

function setupLessonBrowser(): void {
  const root = document.querySelector<HTMLElement>('[data-lesson-browser]');
  if (!root) return;
  const params = new URL(window.location.href).searchParams;
  const input = root.querySelector<HTMLInputElement>('[data-lesson-query]');
  if (input) {
    input.value = params.get('q') ?? '';
    input.addEventListener('input', filterLessons);
  }
  const level = params.get('level');
  root.dataset.level = level && /^[0-5]$/.test(level) ? level : 'all';
  root.querySelector<HTMLElement>('[data-filters]')?.removeAttribute('hidden');
  filterLessons();
}

/* ---------- wiring ---------- */

document.addEventListener('click', event => {
  const target = event.target as HTMLElement;
  const themeButton = target.closest<HTMLButtonElement>('[data-theme-toggle]');
  if (themeButton) return toggleTheme();
  const copy = target.closest<HTMLButtonElement>('[data-copy]');
  if (copy) return void copyCode(copy);
  const option = target.closest<HTMLButtonElement>('[data-quiz-option]');
  if (option) return answerQuestion(option);
  const retry = target.closest<HTMLElement>('[data-quiz-retry]');
  if (retry) {
    const quiz = retry.closest<HTMLElement>('[data-quiz]');
    if (quiz) resetQuiz(quiz);
    return;
  }
  const complete = target.closest<HTMLButtonElement>('[data-complete-toggle]');
  if (complete) {
    const id = complete.dataset.lesson!;
    setDone(id, !isDone(id));
    announce(isDone(id) ? 'লেসনটি সম্পন্ন হিসেবে চিহ্নিত হয়েছে' : 'লেসনটি অসম্পূর্ণ হিসেবে চিহ্নিত হয়েছে');
    return;
  }
  const chip = target.closest<HTMLElement>('[data-filter-level]');
  const browser = chip?.closest<HTMLElement>('[data-lesson-browser]');
  if (chip && browser) {
    browser.dataset.level = chip.dataset.filterLevel!;
    return filterLessons();
  }
  const clear = target.closest<HTMLElement>('[data-clear-query]');
  if (clear) {
    const input = document.querySelector<HTMLInputElement>('[data-lesson-query]');
    if (input) {
      input.value = '';
      input.focus();
    }
    filterLessons();
  }
});

// The lesson page search box filters in place; Enter does not reload the page.
document.addEventListener('submit', event => {
  if ((event.target as HTMLElement).closest('[data-lesson-browser]')) event.preventDefault();
});

// Escape closes the mobile menu and returns focus to its button.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const menu = document.querySelector<HTMLDetailsElement>('details.menu[open]');
  if (menu) {
    menu.open = false;
    menu.querySelector('summary')?.focus();
  }
});

// Another tab changed the progress: show it here too.
window.addEventListener('storage', event => {
  if (event.key !== PROGRESS_KEY) return;
  const fresh = load<Partial<Progress>>(PROGRESS_KEY, {});
  progress.done = Array.isArray(fresh.done) ? fresh.done : [];
  progress.quiz = fresh.quiz ?? {};
  renderProgress();
});

document.addEventListener('astro:page-load', () => {
  applyTheme();
  renderProgress();
  addCopyButtons();
  setupLessonBrowser();
});
