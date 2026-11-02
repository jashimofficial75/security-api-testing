import {type CollectionEntry, getCollection} from 'astro:content';

import {LEVELS} from '../content/site';

/** BUILD TIME helpers for the course (`lessons` collection, src/content.config.ts). */

export type Lesson = CollectionEntry<'lessons'>;

/** Every lesson, in course order. */
export async function allLessons(): Promise<Lesson[]> {
  const lessons = await getCollection('lessons');
  return lessons.sort((a, b) => a.data.order - b.data.order);
}

export const lessonHref = (lesson: Lesson) => `/lessons/${lesson.id}/`;

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** `12` → `১২`: Bangla numerals for counts in prose (DESIGN.md "Typography"). */
export const bn = (value: number | string) => String(value).replace(/[0-9]/g, d => BN_DIGITS[Number(d)]);

export const levelName = (level: number) => LEVELS[level]?.name ?? '';

/** `45` → `৪৫ মিনিট`, `90` → `১ ঘণ্টা ৩০ মিনিট`. */
export function duration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${bn(m)} মিনিট`;
  return m ? `${bn(h)} ঘণ্টা ${bn(m)} মিনিট` : `${bn(h)} ঘণ্টা`;
}

/** The words the lesson search matches: title, description, keywords, level. */
export const searchText = (lesson: Lesson) =>
  [lesson.data.title, lesson.data.description, ...lesson.data.keywords, levelName(lesson.data.level)].join(' ');
