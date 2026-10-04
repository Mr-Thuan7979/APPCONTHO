// Kiểm tra cơ chế mở khóa mức độ, điểm thưởng, lượt chơi.
// Trong Node không có localStorage: storage.js tự chạy ở chế độ chỉ-bộ-nhớ.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as store from '../js/storage.js';

test('mở khóa Khá khi 3 bài gần nhất ở mức Trung bình đạt trung bình ≥ 80%', () => {
  const p = store.addProfile({ name: 'Bin', avatar: '🐱', grade: 'l2' });
  let st = store.levelStatus(p.id, 'toan', 'l2');
  assert.equal(st.tb.unlocked, true);
  assert.equal(st.kha.unlocked, false);
  assert.equal(st.nc.unlocked, false);

  store.recordLesson(p.id, 'toan', 'l2', 'tb', { correct: 5, total: 5, stars: 3 });
  store.recordLesson(p.id, 'toan', 'l2', 'tb', { correct: 5, total: 5, stars: 3 });
  assert.equal(store.levelStatus(p.id, 'toan', 'l2').kha.unlocked, false, 'mới 2 bài: chưa mở');

  const r = store.recordLesson(p.id, 'toan', 'l2', 'tb', { correct: 2, total: 5, stars: 1 }); // TB = (1+1+0.4)/3 = 0.8
  assert.equal(r.newlyUnlocked, 'kha');
  st = store.levelStatus(p.id, 'toan', 'l2');
  assert.equal(st.kha.unlocked, true);
  assert.equal(st.nc.unlocked, false);
  // Môn khác, lớp khác không bị ảnh hưởng
  assert.equal(store.levelStatus(p.id, 'tv', 'l2').kha.unlocked, false);
  assert.equal(store.levelStatus(p.id, 'toan', 'l3').kha.unlocked, false);
});

test('chưa đạt 80% thì không mở', () => {
  const p = store.addProfile({ name: 'Na', avatar: '🐶', grade: 'l1' });
  for (let i = 0; i < 3; i++) store.recordLesson(p.id, 'tv', 'l1', 'tb', { correct: 3, total: 5, stars: 2 });
  assert.equal(store.levelStatus(p.id, 'tv', 'l1').kha.unlocked, false);
});

test('điểm tăng theo mức: sao × 1 / × 2 / × 3; mỗi bài +1 lượt chơi', () => {
  const p = store.addProfile({ name: 'Su', avatar: '🐰', grade: 'l3' });
  store.updateProfile(p.id, { unlockAll: true });
  const t0 = p.tickets;
  assert.equal(store.recordLesson(p.id, 'kh', 'l3', 'tb', { correct: 5, total: 5, stars: 3 }).earned, 3);
  assert.equal(store.recordLesson(p.id, 'kh', 'l3', 'kha', { correct: 5, total: 5, stars: 3 }).earned, 6);
  assert.equal(store.recordLesson(p.id, 'kh', 'l3', 'nc', { correct: 5, total: 5, stars: 3 }).earned, 9);
  assert.equal(store.activeProfile().stars, 18);
  assert.equal(store.activeProfile().tickets, t0 + 3);
});

test('dùng lượt chơi: hết lượt thì không chơi được', () => {
  const p = store.addProfile({ name: 'Tí', avatar: '🦊', grade: 'mn1' });
  assert.equal(p.tickets, 1);
  assert.equal(store.useTicket(p.id), true);
  assert.equal(store.useTicket(p.id), false);
});
