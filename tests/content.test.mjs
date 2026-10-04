// Kiểm tra tự động bộ sinh câu hỏi: chạy `node --test tests/`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AGE_GROUPS, SUBJECTS, DISCOVER, LETTERS, LETTER_SAY, PICTURE_WORDS, TONE_WORDS,
  generateLesson, makeRng, baseLetter, starsFor, QUESTIONS_PER_LESSON,
} from '../js/content.js';

const key = (c) => c.text ?? c.html;

test('mọi bài học hợp lệ ở mọi môn × độ tuổi (2.000 bài ngẫu nhiên mỗi tổ hợp)', () => {
  for (const s of SUBJECTS) {
    for (const a of AGE_GROUPS) {
      for (let seed = 0; seed < 2000; seed++) {
        const qs = generateLesson(s.id, a.id, makeRng(seed));
        assert.equal(qs.length, QUESTIONS_PER_LESSON, `${s.id}/${a.id}`);
        for (const q of qs) {
          assert.ok(q.prompt && q.say, 'thiếu đề bài');
          assert.ok(q.choices.length >= 2 && q.choices.length <= 4, 'số phương án');
          assert.ok(q.answer >= 0 && q.answer < q.choices.length, 'đáp án nằm ngoài phương án');
          const keys = q.choices.map(key);
          assert.equal(new Set(keys).size, keys.length, `phương án trùng: ${q.prompt} ${keys}`);
        }
      }
    }
  }
});

test('đáp án toán luôn đúng', () => {
  for (const a of ['l12', 'l35']) {
    for (let seed = 0; seed < 3000; seed++) {
      for (const q of generateLesson('toan', a, makeRng(seed))) {
        const m = q.prompt.match(/^(\d+) ([+\-×:]) (\d+) = \?$/);
        if (!m) continue;
        const [x, op, y] = [Number(m[1]), m[2], Number(m[3])];
        const r = { '+': x + y, '-': x - y, '×': x * y, ':': x / y }[op];
        assert.ok(Number.isInteger(r) && r >= 0, `kết quả không hợp lệ: ${q.prompt}`);
        assert.equal(q.choices[q.answer].text, String(r), q.prompt);
        assert.ok(q.choices.every((c) => Number(c.text) >= 0), 'có phương án âm');
      }
    }
  }
});

test('đếm hình: đáp án bằng số hình hiển thị', () => {
  for (let seed = 0; seed < 2000; seed++) {
    for (const q of generateLesson('toan', 'mam', makeRng(seed))) {
      if (q.visual?.count) assert.equal(q.choices[q.answer].text, String(q.visual.count));
    }
  }
});

test('chữ cái và từ có hình', () => {
  assert.equal(LETTERS.length, 29, 'bảng chữ cái tiếng Việt có 29 chữ');
  for (const l of LETTERS) assert.ok(LETTER_SAY[l], `thiếu cách đọc chữ ${l}`);
  for (const p of PICTURE_WORDS) assert.ok(LETTERS.includes(baseLetter(p.w[0])), `chữ đầu của ${p.w}`);
  assert.equal(baseLetter('ế'), 'ê');
  assert.equal(baseLetter('ừ'), 'ư');
  for (const t of TONE_WORDS) assert.ok(!t.x.includes(t.w), `phương án sai trùng đáp án: ${t.w}`);
});

test('ngân hàng Khám phá đủ câu cho 1 bài, không trùng phương án', () => {
  for (const a of AGE_GROUPS) {
    assert.ok(DISCOVER[a.id].length >= QUESTIONS_PER_LESSON);
    for (const [, , ...opts] of DISCOVER[a.id]) assert.equal(new Set(opts).size, opts.length);
  }
});

test('chấm sao luôn khích lệ (1–3 sao)', () => {
  assert.equal(starsFor(5, 5), 3);
  assert.equal(starsFor(3, 5), 2);
  assert.equal(starsFor(0, 5), 1);
});
