// Điều phối: môn × lớp × mức độ → bài học 5 câu.
import { gradeOf, QUESTIONS_PER_LESSON, fromBank, fromGenerator, pick } from './core.js';
import { tvLesson } from './subjects/tiengviet.js';
import { toanLesson } from './subjects/toan.js';
import { enLesson } from './subjects/tienganh.js';
import { KHOAHOC } from './subjects/khoahoc.js';
import { LICHSU } from './subjects/lichsu.js';
import { KYNANG } from './subjects/kynang.js';

export { GRADES, LEVELS, gradeOf, levelOf, makeRng, QUESTIONS_PER_LESSON, UNLOCK_RATIO, UNLOCK_LESSONS } from './core.js';

export const SUBJECTS = [
  { id: 'tv', name: 'Tiếng Việt', emoji: '📖', color: 'var(--red)' },
  { id: 'toan', name: 'Toán', emoji: '🔢', color: 'var(--blue)' },
  { id: 'ta', name: 'Tiếng Anh', emoji: '🔤', color: 'var(--pink)' },
  { id: 'kh', name: 'Khoa học', emoji: '🔬', color: 'var(--green)' },
  { id: 'ls', name: 'Lịch sử & Địa lý', emoji: '🏛️', color: 'var(--brown)' },
  { id: 'kn', name: 'Kỹ năng sống', emoji: '🛡️', color: 'var(--purple)' },
];
export const subjectOf = (id) => SUBJECTS.find((s) => s.id === id);

export function generateLesson(subject, grade, level, rng = Math.random, n = QUESTIONS_PER_LESSON) {
  switch (subject) {
    case 'tv': return tvLesson(grade, level, rng, n);
    case 'toan': return toanLesson(grade, level, rng, n);
    case 'ta': return enLesson(grade, level, rng, n);
    case 'kh': return fromBank(rng, KHOAHOC[grade][level], n);
    case 'ls': return fromBank(rng, LICHSU[grade][level], n);
    case 'kn': return fromBank(rng, KYNANG[gradeOf(grade).band][level], n);
    default: throw new Error('Môn không tồn tại: ' + subject);
  }
}

// Câu hỏi trộn nhiều môn (Rung chuông vàng). levels: { [subject]: [các mức đã mở] }
export function mixedQuiz(grade, levels, rng = Math.random, n = 10) {
  return fromGenerator(rng, (r) => {
    const s = pick(r, SUBJECTS).id;
    const lv = pick(r, levels[s] || ['tb']);
    return generateLesson(s, grade, lv, r, 1)[0];
  }, n);
}

// Hoàn thành bài luôn được ít nhất 1 sao; điểm thưởng = sao × hệ số mức độ.
export function starsFor(correctFirstTry, total) {
  const r = correctFirstTry / total;
  if (r >= 1) return 3;
  if (r >= 0.6) return 2;
  return 1;
}
