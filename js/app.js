import {
  GRADES, LEVELS, SUBJECTS, gradeOf, levelOf, subjectOf, generateLesson, mixedQuiz, starsFor,
  UNLOCK_RATIO, UNLOCK_LESSONS,
} from './content.js';
import { CLIPS, CLIPS_BY } from './clips.js';
import * as store from './storage.js';
import { initSpeech, speak, stopSpeech, chime, configureSpeech, hasVietnameseVoice, hasEnglishVoice, speechSupported } from './speech.js';
import { createGames } from './games.js';

const $app = document.getElementById('app');
const $overlay = document.getElementById('overlay');
const AVATARS = ['🐃', '🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🐸', '🐧', '🦄'];
const STICKERS = ['🌸', '🏮', '🐉', '🪁', '🥭', '🐟', '🌾', '🛵', '🍜', '🐓', '🎋', '🌕', '🐢', '🦚', '🌈', '🥁', '🛶', '🏯', '🎑', '👑'];
const STARS_PER_STICKER = 10;
const BREAK_SECONDS = 20;
const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!', 'Bé làm tốt lắm!', 'Xuất sắc!'];
const RETRY = ['Thử lại nhé!', 'Gần đúng rồi, thử lần nữa nào!', 'Không sao, bé chọn lại nhé!'];
const RCV_LIVES = 3;

let screen = 'profiles';
let lesson = null;
let clipState = null;
let continuousSec = 0;
let pendingUsage = 0;
let paused = false; // đang hiện màn nghỉ / hết giờ / khóa phụ huynh
let videoIds = [];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pct = (x) => (x == null ? '—' : Math.round(x * 100) + '%');

function clearTimers() {
  if (lesson?.timer) clearTimeout(lesson.timer);
  if (lesson?.next) clearTimeout(lesson.next);
  if (clipState?.timer) clearTimeout(clipState.timer);
  if (clipState) clipState.token++;
}

function go(name, ...args) {
  stopSpeech();
  clearTimers();
  screen = name;
  SCREENS[name](...args);
  window.scrollTo(0, 0);
  // Vào màn hình tính giờ: kiểm tra hạn mức (sau khi phụ huynh gia hạn hoặc đổi bé).
  if (TRACKED.has(name) && $overlay.hidden) {
    paused = false;
    checkTimeUp();
  }
}

// ---------------- HỒ SƠ ----------------
function renderProfiles() {
  const { profiles } = store.getState();
  $app.innerHTML = `
    <header class="hero">
      <div class="mascot" aria-hidden="true">🐃</div>
      <h1>Bé Vui Học</h1>
      <p class="tag">Học mà chơi – chơi mà học</p>
    </header>
    <section class="panel">
      <h2>Ai đang học hôm nay?</h2>
      <div class="grid profiles">
        ${profiles.map((p) => `
          <button class="card profile" data-action="pick" data-id="${p.id}">
            <span class="avatar">${p.avatar}</span>
            <span class="name">${esc(p.name)}</span>
            <span class="meta">${gradeOf(p.grade).label} · ⭐ ${p.stars}</span>
          </button>`).join('')}
        ${profiles.length < 6 ? `
          <button class="card profile add" data-action="new">
            <span class="avatar">➕</span><span class="name">Thêm bé</span>
          </button>` : ''}
      </div>
    </section>
    <footer class="foot"><button class="link" data-action="parent">🔒 Khu vực phụ huynh</button></footer>`;
  bind({
    pick: (el) => { store.setActive(el.dataset.id); go('home'); },
    new: () => go('newProfile'),
    parent: () => gate(() => go('parent')),
  });
}

function gradeChips(selected) {
  return GRADES.map((g) => `<button class="chip age ${g.id === selected ? 'on' : ''}" data-action="grade" data-v="${g.id}">
    <b>${g.emoji} ${g.label}</b><small>${g.sub}</small></button>`).join('');
}

function renderNewProfile() {
  let avatar = AVATARS[0];
  let grade = 'mn1';
  $app.innerHTML = `
    ${topbar('Thêm bé')}
    <section class="panel form">
      <label class="field">Tên của bé
        <input id="name" maxlength="20" autocomplete="off" placeholder="Ví dụ: Bông, Bin, Na…" />
      </label>
      <p class="field">Chọn con vật yêu thích</p>
      <div class="chips" id="avatars">
        ${AVATARS.map((a, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-action="avatar" data-v="${a}">${a}</button>`).join('')}
      </div>
      <p class="field">Bé đang học lớp nào?</p>
      <div class="chips ages" id="grades">${gradeChips(grade)}</div>
      <button class="btn primary big" data-action="save">Bắt đầu học! 🚀</button>
      <p class="note">Chỉ cần tên gọi ở nhà. Thông tin chỉ lưu trên máy này.</p>
    </section>`;
  const choose = (sel, el) => {
    document.querySelectorAll(sel + ' .chip').forEach((c) => c.classList.remove('on'));
    el.classList.add('on');
  };
  bind({
    back: () => go('profiles'),
    avatar: (el) => { avatar = el.dataset.v; choose('#avatars', el); },
    grade: (el) => { grade = el.dataset.v; choose('#grades', el); },
    save: () => {
      const input = document.getElementById('name');
      const name = input.value.trim();
      if (!name) { input.focus(); input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 500); return; }
      store.addProfile({ name, avatar, grade });
      go('home');
    },
  });
}

// ---------------- TRANG CHỦ ----------------
const GAMES = [
  { id: 'rebus', name: 'Đuổi hình bắt chữ', emoji: '🧩', color: 'var(--red)', meta: 'Đoán từ qua hình' },
  { id: 'rcv', name: 'Rung chuông vàng', emoji: '🔔', color: 'var(--yellow)', meta: 'Trắc nghiệm vượt ải' },
  { id: 'words', name: 'Ô chữ', emoji: '🔠', color: 'var(--blue)', meta: 'Xếp chữ thành từ' },
  { id: 'match', name: 'Nối cặp', emoji: '🔗', color: 'var(--green)', meta: 'Tìm cặp đi đôi' },
  { id: 'memory', name: 'Lật thẻ', emoji: '🃏', color: 'var(--purple)', meta: 'Tìm hình giống nhau' },
];

function renderHome() {
  const p = store.activeProfile();
  if (!p) return go('profiles');
  const stickers = Math.min(STICKERS.length, Math.floor(p.stars / STARS_PER_STICKER));
  const toNext = STARS_PER_STICKER - (p.stars % STARS_PER_STICKER);
  const lvBadge = (sid) => {
    const top = levelOf(store.subjectSummary(p.id, sid, p.grade).topLevel);
    return `${top.emoji} ${top.label}`;
  };
  $app.innerHTML = `
    <header class="homebar">
      <button class="who" data-action="switch" aria-label="Đổi bé">
        <span class="avatar sm">${p.avatar}</span>
        <span><b>${esc(p.name)}</b><small>${gradeOf(p.grade).label}</small></span>
      </button>
      <span class="badges">
        <span class="stars" aria-label="${p.stars} sao">⭐ ${p.stars}</span>
        <span class="tickets" aria-label="${p.tickets} lượt chơi">🎟️ ${p.tickets}</span>
      </span>
    </header>
    <section class="bubble-row">
      <div class="mascot sm" aria-hidden="true">🐃</div>
      <div class="bubble">Chào ${esc(p.name)}! Học xong 1 bài được 1 lượt chơi 🎟️ đó!</div>
      <button class="icon" data-action="hello" aria-label="Nghe">🔊</button>
    </section>
    <h2 class="section">📚 Học</h2>
    <div class="grid subjects">
      ${SUBJECTS.map((s) => `
        <button class="card subject" style="--c:${s.color}" data-action="subject" data-id="${s.id}">
          <span class="emoji">${s.emoji}</span>
          <span class="name">${s.name}</span>
          <span class="meta">${lvBadge(s.id)}</span>
        </button>`).join('')}
    </div>
    <h2 class="section">🎮 Trò chơi <small class="cost">mỗi lượt 🎟️ 1</small></h2>
    <div class="grid games">
      ${GAMES.map((g) => `
        <button class="card game" style="--c:${g.color}" data-action="game" data-id="${g.id}">
          <span class="emoji">${g.emoji}</span><span class="name">${g.name}</span><span class="meta">${g.meta}</span>
        </button>`).join('')}
      <button class="card game" style="--c:var(--pink)" data-action="game" data-id="draw">
        <span class="emoji">🖍️</span><span class="name">Bảng vẽ</span><span class="meta">Miễn phí</span>
      </button>
    </div>
    <h2 class="section">🏅 Bộ sưu tập</h2>
    <section class="panel shelf">
      <div class="stickers">
        ${STICKERS.map((s, i) => `<span class="sticker ${i < stickers ? 'got' : ''}">${i < stickers ? s : '❔'}</span>`).join('')}
      </div>
      <p class="note">${stickers < STICKERS.length ? `Còn ${toNext} ⭐ nữa để nhận hình dán mới!` : 'Bé đã sưu tập đủ hình dán! 🎉'}</p>
    </section>
    <footer class="foot"><button class="link" data-action="parent">🔒 Phụ huynh</button></footer>`;
  bind({
    switch: () => go('profiles'),
    hello: () => speak(`Chào ${p.name}! Học xong một bài được một lượt chơi đó!`),
    subject: (el) => go('subject', el.dataset.id),
    game: (el) => startGame(el.dataset.id),
    parent: () => gate(() => go('parent')),
  });
}

// ---------------- MÔN HỌC: chọn mức + clip ----------------
function renderSubject(sid) {
  const p = store.activeProfile();
  const subj = subjectOf(sid);
  const st = store.levelStatus(p.id, sid, p.grade);
  const clips = CLIPS_BY[sid]?.[p.grade] || [];
  $app.innerHTML = `
    ${topbar(subj.emoji + ' ' + subj.name)}
    <p class="hint">${gradeOf(p.grade).label} · Chọn mức độ</p>
    <div class="levels">
      ${LEVELS.map((lv, i) => {
        const s = st[lv.id];
        const prev = LEVELS[i - 1];
        if (!s.unlocked) {
          const ps = st[prev.id];
          return `<div class="card level locked" aria-disabled="true">
            <span class="emoji">🔒</span>
            <span class="name">${lv.label}</span>
            <span class="meta">Mở khi đạt ≥${Math.round(UNLOCK_RATIO * 100)}% trong ${UNLOCK_LESSONS} bài gần nhất ở mức ${prev.label}</span>
            <span class="meta small">Hiện tại: ${ps.recentCount}/${UNLOCK_LESSONS} bài${ps.recentAvg != null ? ` · ${pct(ps.recentAvg)}` : ''}</span>
          </div>`;
        }
        return `<button class="card level" style="--c:${subj.color}" data-action="start" data-level="${lv.id}">
          <span class="emoji">${lv.emoji}</span>
          <span class="name">${lv.label}</span>
          <span class="mult">Điểm ×${lv.mult}</span>
          <span class="meta">${s.lessons ? `Đã học ${s.lessons} bài · Gần đây ${pct(s.recentAvg)}` : 'Bắt đầu nào!'}${s.mastered ? ' · ✅ Vững' : ''}</span>
        </button>`;
      }).join('')}
    </div>
    ${clips.length ? `
      <h2 class="section">📺 Xem clip</h2>
      <div class="grid clips">
        ${clips.map((id) => `<button class="card clip" style="--c:${subj.color}" data-action="clip" data-id="${id}">
          <span class="emoji">${CLIPS[id].emoji}</span><span class="name">${CLIPS[id].title}</span>
          <span class="meta">${p.watched?.includes(id) ? '✅ Đã xem' : '▶ Xem'}</span></button>`).join('')}
      </div>` : ''}`;
  bind({
    back: () => go('home'),
    start: (el) => startLesson(sid, el.dataset.level),
    clip: (el) => go('clip', el.dataset.id, sid),
  });
}

// ---------------- BÀI HỌC & RUNG CHUÔNG VÀNG ----------------
function startLesson(subject, level) {
  const p = store.activeProfile();
  lesson = { mode: 'learn', subject, level, qs: generateLesson(subject, p.grade, level), i: 0, firstTry: true, correct: 0 };
  go('lesson');
}

function startRcv() {
  const p = store.activeProfile();
  const levels = Object.fromEntries(SUBJECTS.map((s) => [s.id, store.unlockedLevels(p.id, s.id, p.grade)]));
  const secs = p.grade.startsWith('mn') ? 30 : 20;
  lesson = { mode: 'rcv', qs: mixedQuiz(p.grade, levels), i: 0, correct: 0, lives: RCV_LIVES, secs };
  go('lesson');
}

function renderVisual(v) {
  if (!v) return '';
  if (v.listen) return `<button class="visual listen" data-action="say" aria-label="Nghe lại">🔊</button>`;
  if (v.big) return `<div class="visual big">${esc(v.big)}</div>`;
  if (v.count) return `<div class="visual count">${`<span>${v.emoji}</span>`.repeat(v.count)}</div>`;
  if (v.html) return `<div class="visual html">${v.html}</div>`;
  return `<div class="visual emoji">${v.emoji}</div>`;
}

function renderLesson() {
  const q = lesson.qs[lesson.i];
  const rcv = lesson.mode === 'rcv';
  const subj = rcv ? { emoji: '🔔', name: 'Rung chuông vàng', color: 'var(--yellow)' } : subjectOf(lesson.subject);
  const long = q.choices.some((c) => (c.text ?? '').length > 14);
  $app.innerHTML = `
    ${topbar(subj.emoji + ' ' + subj.name)}
    ${rcv ? `<div class="rcv-bar"><span class="lives">${'❤️'.repeat(lesson.lives)}${'🤍'.repeat(RCV_LIVES - lesson.lives)}</span>
      <span>Câu ${lesson.i + 1}/${lesson.qs.length}</span></div>
      <div class="timer"><span id="tbar" style="--secs:${lesson.secs}s"></span></div>`
    : `<p class="hint small">${levelOf(lesson.level).emoji} ${levelOf(lesson.level).label} · Điểm ×${levelOf(lesson.level).mult}</p>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${lesson.qs.length}" aria-valuenow="${lesson.i}">
        ${lesson.qs.map((_, i) => `<span class="${i < lesson.i ? 'done' : i === lesson.i ? 'now' : ''}"></span>`).join('')}
      </div>`}
    <section class="panel question" style="--c:${subj.color}">
      <button class="prompt" data-action="say">
        <span class="speaker">🔊</span><span>${esc(q.prompt)}</span>
      </button>
      ${renderVisual(q.visual)}
      <div class="choices ${long ? 'long' : ''} n${q.choices.length}">
        ${q.choices.map((c, i) => `<button class="choice ${c.lang?.startsWith('en') ? 'en' : ''}" data-action="choose" data-i="${i}">${c.html ?? esc(c.text)}</button>`).join('')}
      </div>
      <p class="feedback" id="fb" aria-live="polite"></p>
    </section>`;
  bind({
    back: () => go(rcv ? 'home' : 'subject', lesson.subject),
    say: () => speak(q.say),
    choose: (el) => answer(el, Number(el.dataset.i)),
  });
  setTimeout(() => screen === 'lesson' && lesson.qs[lesson.i] === q && speak(q.say), 250);
  if (rcv) {
    requestAnimationFrame(() => document.getElementById('tbar')?.classList.add('run'));
    lesson.timer = setTimeout(() => rcvMiss(null), lesson.secs * 1000);
  }
}

function lockChoices() {
  document.querySelectorAll('.choice').forEach((c) => (c.disabled = true));
}

function nextQuestion(delay) {
  lesson.next = setTimeout(() => {
    lesson.locked = false;
    lesson.firstTry = true;
    lesson.i++;
    if (lesson.i < lesson.qs.length && (lesson.mode !== 'rcv' || lesson.lives > 0)) go('lesson');
    else lesson.mode === 'rcv' ? finishRcv() : finishLesson();
  }, delay);
}

function answer(el, i) {
  const q = lesson.qs[lesson.i];
  const fb = document.getElementById('fb');
  if (el.disabled || lesson.locked) return;
  if (i === q.answer) {
    lesson.locked = true;
    clearTimeout(lesson.timer);
    if (lesson.mode === 'rcv' || lesson.firstTry) lesson.correct++;
    el.classList.add('right');
    lockChoices();
    const msg = rand(PRAISE);
    fb.textContent = '🎉 ' + msg;
    fb.className = 'feedback ok';
    chime(true);
    speak(msg);
    nextQuestion(1300);
  } else if (lesson.mode === 'rcv') {
    rcvMiss(el);
  } else {
    lesson.firstTry = false;
    el.classList.add('wrong');
    el.disabled = true;
    const msg = rand(RETRY);
    fb.textContent = '💪 ' + msg;
    fb.className = 'feedback try';
    chime(false);
    speak(msg);
  }
}

// Rung chuông vàng: trả lời sai hoặc hết giờ → mất 1 tim, xem đáp án đúng rồi sang câu sau.
function rcvMiss(el) {
  if (lesson.locked) return;
  lesson.locked = true;
  clearTimeout(lesson.timer);
  lesson.lives--;
  const q = lesson.qs[lesson.i];
  el?.classList.add('wrong');
  document.querySelectorAll('.choice')[q.answer]?.classList.add('right');
  lockChoices();
  const fb = document.getElementById('fb');
  const ans = q.choices[q.answer];
  fb.textContent = `${el ? '❌ Chưa đúng' : '⏰ Hết giờ'}! Đáp án: ${ans.text ?? ''}`;
  fb.className = 'feedback try';
  chime(false);
  speak(el ? 'Chưa đúng rồi.' : 'Hết giờ rồi.');
  nextQuestion(2200);
}

function finishLesson() {
  const p = store.activeProfile();
  const total = lesson.qs.length;
  const stars = starsFor(lesson.correct, total);
  const before = Math.floor(p.stars / STARS_PER_STICKER);
  const { earned, newlyUnlocked } = store.recordLesson(p.id, lesson.subject, p.grade, lesson.level, { correct: lesson.correct, total, stars });
  const after = Math.floor(p.stars / STARS_PER_STICKER);
  const newSticker = after > before && before < STICKERS.length ? STICKERS[before] : null;
  go('result', { stars, earned, mult: levelOf(lesson.level).mult, correct: lesson.correct, total, newSticker, newlyUnlocked });
}

function renderResult({ stars, earned, mult, correct, total, newSticker, newlyUnlocked }) {
  const msg = stars === 3 ? 'Bé thật giỏi!' : stars === 2 ? 'Bé làm tốt lắm!' : 'Bé đã cố gắng, lần sau sẽ giỏi hơn nữa!';
  const unlocked = newlyUnlocked ? levelOf(newlyUnlocked) : null;
  $app.innerHTML = `
    <section class="panel result">
      <div class="mascot dance" aria-hidden="true">🐃</div>
      <div class="bigstars">${'⭐'.repeat(stars)}${'<span class="dim">⭐</span>'.repeat(3 - stars)}</div>
      <h2>${msg}</h2>
      <p>Đúng ngay lần đầu: <b>${correct}/${total}</b> câu</p>
      <p class="reward">+${earned} ⭐ ${mult > 1 ? `<small>(${stars} sao × ${mult})</small>` : ''} &nbsp; +1 🎟️ lượt chơi</p>
      ${unlocked ? `<p class="gift">🔓 Mở khóa mức <b>${unlocked.emoji} ${unlocked.label}</b> – điểm ×${unlocked.mult}!</p>` : ''}
      ${newSticker ? `<p class="gift">🎁 Hình dán mới: <span class="sticker got">${newSticker}</span></p>` : ''}
      <div class="row">
        <button class="btn primary" data-action="again">Học tiếp ▶</button>
        ${unlocked ? `<button class="btn" data-action="up">Thử mức ${unlocked.label} 🚀</button>` : ''}
        <button class="btn" data-action="play">Đi chơi 🎮</button>
      </div>
    </section>`;
  chime(true);
  speak(msg + (unlocked ? ` Bé đã mở khóa mức ${unlocked.label}!` : '') + (newSticker ? ' Bé nhận được hình dán mới!' : ''));
  bind({
    again: () => startLesson(lesson.subject, lesson.level),
    up: () => startLesson(lesson.subject, newlyUnlocked),
    play: () => go('home'),
  });
}

function finishRcv() {
  const p = store.activeProfile();
  const total = lesson.qs.length;
  const all = lesson.correct === total;
  const stars = all ? 10 : Math.max(1, Math.floor(lesson.correct / 2));
  store.addStars(p.id, stars);
  showModal(`
    <div class="mascot dance">${all ? '🔔' : '🐃'}</div>
    <h2>${all ? 'RUNG CHUÔNG VÀNG!' : lesson.lives > 0 ? 'Hoàn thành!' : 'Hết tim rồi!'}</h2>
    <p>Bé trả lời đúng <b>${lesson.correct}/${total}</b> câu. ⭐ +${stars}</p>`, all ? 'Bé đã rung chuông vàng! Xuất sắc!' : 'Bé giỏi lắm! Cố gắng lần sau nhé!', 'rcv');
  chime(all ? 'bell' : true);
}

// Hộp thông báo cuối trò chơi: Chơi lại (tốn 1 lượt) / Về trang chủ.
function showModal(html, sayText, againGame) {
  $overlay.innerHTML = `<div class="modal">${html}
    <div class="row">${againGame ? '<button class="btn primary" data-o="again">Chơi lại 🎟️1</button>' : ''}
    <button class="btn" data-o="home">Về trang chủ</button></div></div>`;
  $overlay.hidden = false;
  paused = true;
  if (sayText) speak(sayText);
  $overlay.onclick = (e) => {
    const o = e.target.closest('[data-o]')?.dataset.o;
    if (!o) return;
    closeOverlay();
    paused = false;
    if (o === 'again') startGame(againGame);
    else go('home');
  };
}

// ---------------- CLIP ----------------
function renderClip(id, sid) {
  const clip = CLIPS[id];
  const back = () => go('subject', sid);
  if (videoIds.includes(id)) {
    $app.innerHTML = `${topbar(clip.emoji + ' ' + clip.title)}
      <video class="clipvideo" src="videos/${id}.mp4" controls playsinline autoplay></video>`;
    bind({ back });
    document.querySelector('video').addEventListener('ended', () => clipDone(id));
    return;
  }
  clipState = { id, i: 0, playing: true, token: 0, timer: null };
  $app.innerHTML = `
    ${topbar(clip.emoji + ' ' + clip.title)}
    <div class="stage" id="stage"></div>
    <p class="caption" id="cap" aria-live="polite"></p>
    <div class="clipbar">
      <button class="icon" data-action="prev" aria-label="Cảnh trước">⏮️</button>
      <button class="icon big" data-action="toggle" id="tg" aria-label="Tạm dừng">⏸️</button>
      <button class="icon" data-action="next" aria-label="Cảnh sau">⏭️</button>
      <span class="dots" id="dots"></span>
    </div>`;
  bind({
    back,
    prev: () => playScene(Math.max(0, clipState.i - 1)),
    next: () => (clipState.i + 1 < clip.scenes.length ? playScene(clipState.i + 1) : clipDone(id)),
    toggle: () => {
      clipState.playing = !clipState.playing;
      document.getElementById('tg').textContent = clipState.playing ? '⏸️' : '▶️';
      if (clipState.playing) playScene(clipState.i);
      else { clearTimeout(clipState.timer); clipState.token++; stopSpeech(); }
    },
  });
  playScene(0);
}

function playScene(i) {
  const clip = CLIPS[clipState.id];
  const sc = clip.scenes[i];
  clearTimeout(clipState.timer);
  const token = ++clipState.token;
  clipState.i = i;
  const stage = document.getElementById('stage');
  stage.className = 'stage bg-' + sc.bg;
  stage.innerHTML = sc.items.map(([e, a], k) => `<span class="it ${a ? 'a-' + a : ''}" style="--d:${k * 0.25}s">${e}</span>`).join('');
  document.getElementById('cap').textContent = sc.say;
  document.getElementById('dots').innerHTML = clip.scenes.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'done' : ''}"></i>`).join('');
  if (!clipState.playing) return;
  const advance = () => {
    if (token !== clipState.token || screen !== 'clip') return;
    if (i + 1 < clip.scenes.length) playScene(i + 1);
    else clipDone(clipState.id);
  };
  const start = Date.now();
  const minMs = Math.max(2800, sc.say.length * 55);
  // Dự phòng khi máy không đọc được: vẫn tự chuyển cảnh.
  clipState.timer = setTimeout(advance, sc.say.length * 140 + 4000);
  speak(sc.say, 'vi-VN', () => {
    if (token !== clipState.token) return;
    clearTimeout(clipState.timer);
    clipState.timer = setTimeout(advance, Math.max(700, minMs - (Date.now() - start)));
  });
}

function clipDone(id) {
  const p = store.activeProfile();
  const first = !p.watched?.includes(id);
  if (first) store.updateProfile(p.id, { watched: [...(p.watched || []), id], stars: p.stars + 2 });
  clearTimers();
  showModal(`<div class="mascot dance">🐃</div><h2>Xem xong rồi! ${first ? '⭐ +2' : ''}</h2>
    <p>${esc(CLIPS[id].title)}</p>`, 'Bé xem xong rồi! Giỏi quá!', null);
}

// ---------------- TRÒ CHƠI ----------------
const games = createGames({
  $app, topbar, bind, go, esc, rand, speak, chime, store,
  finish: (title, stars, sayText, gameId) => {
    const p = store.activeProfile();
    if (stars) store.addStars(p.id, stars);
    showModal(`<div class="mascot dance">🐃</div><h2>${title}${stars ? ` ⭐ +${stars}` : ''}</h2>`, sayText, gameId);
  },
});

function startGame(id) {
  if (id === 'draw') return go('draw');
  const p = store.activeProfile();
  if (!store.useTicket(p.id)) {
    paused = true;
    $overlay.innerHTML = `<div class="modal"><div class="mascot">🐃🎟️</div>
      <h2>Bé chưa có lượt chơi</h2><p>Học xong 1 bài sẽ được 1 lượt chơi. Mình cùng học nhé!</p>
      <div class="row"><button class="btn primary" data-o="learn">Đi học 📚</button><button class="btn" data-o="home">Để sau</button></div></div>`;
    $overlay.hidden = false;
    speak('Bé học xong một bài sẽ được một lượt chơi. Mình cùng học nhé!');
    $overlay.onclick = (e) => {
      const o = e.target.closest('[data-o]')?.dataset.o;
      if (!o) return;
      closeOverlay();
      paused = false;
      go('home');
      if (o === 'learn') document.querySelector('.grid.subjects')?.scrollIntoView({ behavior: 'smooth' });
    };
    return;
  }
  if (id === 'rcv') return startRcv();
  go(id);
}

// ---------------- KHÓA PHỤ HUYNH ----------------
function gate(onPass) {
  const wasPaused = paused;
  paused = true; // dừng tính giờ khi phụ huynh đang mở khóa
  const a = 11 + Math.floor(Math.random() * 19);
  const b = 3 + Math.floor(Math.random() * 7);
  $overlay.innerHTML = `
    <form class="modal" id="gate">
      <h2>🔒 Dành cho phụ huynh</h2>
      <p>Vui lòng nhập kết quả phép tính:</p>
      <p class="visual big">${a} × ${b} = ?</p>
      <input id="g" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Kết quả" />
      <p class="feedback try" id="gfb"></p>
      <div class="row"><button class="btn primary" type="submit">Mở</button><button class="btn" type="button" data-o="cancel">Hủy</button></div>
    </form>`;
  $overlay.hidden = false;
  document.getElementById('g').focus();
  document.getElementById('gate').onsubmit = (e) => {
    e.preventDefault();
    if (Number(document.getElementById('g').value) === a * b) {
      closeOverlay();
      onPass();
    } else {
      document.getElementById('gfb').textContent = 'Chưa đúng, vui lòng thử lại.';
      document.getElementById('g').value = '';
    }
  };
  $overlay.onclick = (e) => {
    if (e.target.closest('[data-o="cancel"]')) {
      closeOverlay();
      paused = wasPaused;
      if (paused) checkTimeUp();
    }
  };
}

function closeOverlay() {
  $overlay.hidden = true;
  $overlay.innerHTML = '';
  $overlay.onclick = null;
}

// ---------------- KHU PHỤ HUYNH ----------------
const fmtMin = (sec) => Math.round(sec / 60) + ' phút';

function renderParent() {
  flushUsage();
  const st = store.getState();
  const s = st.settings;
  const opt = (vals, cur, label) => vals.map((v) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label(v)}</option>`).join('');
  const voice = !speechSupported() ? '❌ Trình duyệt không hỗ trợ đọc. Nên dùng Chrome (Android) hoặc Safari (iPhone/iPad).'
    : `${hasVietnameseVoice() ? '✅ Có giọng tiếng Việt.' : '⚠️ Chưa thấy giọng tiếng Việt.'} ${hasEnglishVoice() ? '✅ Có giọng tiếng Anh.' : '⚠️ Chưa thấy giọng tiếng Anh.'}
       ${hasVietnameseVoice() && hasEnglishVoice() ? '' : '<br>Android: Cài đặt → Chuyển văn bản thành giọng nói → tải gói ngôn ngữ. iPhone/iPad: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói.'}`;
  $app.innerHTML = `
    ${topbar('🔒 Phụ huynh')}
    <section class="panel">
      <h2>Tiến độ của các bé</h2>
      ${st.profiles.length === 0 ? '<p class="note">Chưa có bé nào.</p>' : st.profiles.map((p) => {
        const u = store.usageToday(p.id);
        return `<div class="kid">
          <div class="kid-head"><span class="avatar sm">${p.avatar}</span><b>${esc(p.name)}</b>
            <select data-change="grade" data-id="${p.id}" aria-label="Lớp">${GRADES.map((g) => `<option value="${g.id}" ${g.id === p.grade ? 'selected' : ''}>${g.label}</option>`).join('')}</select>
          </div>
          <table class="tbl"><thead><tr><th>Môn (${gradeOf(p.grade).label})</th><th>Mức đã mở</th><th>Số bài</th><th>Đúng lần đầu</th></tr></thead><tbody>
            ${SUBJECTS.map((sj) => {
              const x = store.subjectSummary(p.id, sj.id, p.grade);
              const lv = levelOf(x.topLevel);
              return `<tr><td>${sj.emoji} ${sj.name}</td><td>${lv.emoji} ${lv.label}</td><td>${x.lessons}</td><td>${pct(x.accuracy)}</td></tr>`;
            }).join('')}
          </tbody></table>
          <p class="note">Hôm nay đã dùng: <b>${fmtMin(u.seconds)}</b>${u.bonusMin ? ` (gia hạn +${u.bonusMin} phút)` : ''} · ⭐ ${p.stars} · 🎟️ ${p.tickets}</p>
          <label class="field check small"><input type="checkbox" data-change="unlockAll" data-id="${p.id}" ${p.unlockAll ? 'checked' : ''}/> Mở tất cả mức độ cho bé (bỏ qua điều kiện 80%)</label>
          <div class="row">
            <button class="btn small" data-action="bonus" data-id="${p.id}">+15 phút hôm nay</button>
            <button class="btn small danger" data-action="del" data-id="${p.id}">Xóa hồ sơ</button>
          </div>
        </div>`;
      }).join('')}
    </section>
    <section class="panel form">
      <h2>Cài đặt</h2>
      <label class="field">Giới hạn thời gian mỗi bé/ngày
        <select data-change="dailyMinutes">${opt([15, 20, 30, 45, 60, 0], s.dailyMinutes, (v) => (v ? v + ' phút' : 'Không giới hạn'))}</select>
      </label>
      <label class="field">Nhắc nghỉ mắt sau mỗi
        <select data-change="breakEvery">${opt([10, 15, 20, 0], s.breakEvery, (v) => (v ? v + ' phút' : 'Tắt'))}</select>
      </label>
      <label class="field">Tốc độ đọc
        <select data-change="speechRate">${opt([0.7, 0.8, 0.9, 1], s.speechRate, (v) => ({ 0.7: 'Rất chậm', 0.8: 'Chậm', 0.9: 'Vừa', 1: 'Bình thường' })[v])}</select>
      </label>
      <label class="field check"><input type="checkbox" data-change="sound" ${s.sound ? 'checked' : ''}/> Bật âm thanh và giọng đọc</label>
      <p class="note">${voice}</p>
      <div class="row left">
        <button class="btn small" data-action="test">🔊 Thử giọng Việt</button>
        <button class="btn small" data-action="testen">🔊 Thử giọng Anh</button>
      </div>
    </section>
    <section class="panel">
      <h2>Cách tính điểm</h2>
      <ul class="list">
        <li>Mỗi bài 5 câu. Đúng ngay lần đầu cả 5 câu: 3 sao; từ 3 câu: 2 sao; còn lại: 1 sao.</li>
        <li>Điểm nhận được = số sao × hệ số mức: Trung bình ×1, Khá ×2, Nâng cao ×3.</li>
        <li>Mức Khá/Nâng cao mở khi 3 bài gần nhất ở mức dưới đạt trung bình ≥ ${Math.round(UNLOCK_RATIO * 100)}%.</li>
        <li>Học xong 1 bài được 1 lượt chơi 🎟️. Bảng vẽ không tốn lượt.</li>
      </ul>
    </section>
    <section class="panel">
      <h2>Cam kết an toàn</h2>
      <ul class="list">
        <li>Không quảng cáo, không mua hàng trong ứng dụng.</li>
        <li>Không chat, không kết nối mạng xã hội, không có người lạ.</li>
        <li>Không cần tài khoản. Dữ liệu chỉ lưu trên máy này, không gửi đi đâu.</li>
        <li>Nội dung bám mạch kiến thức Chương trình GDPT 2018; nên được giáo viên rà soát trước khi phổ biến rộng.</li>
      </ul>
      <button class="btn small danger" data-action="reset">Xóa toàn bộ dữ liệu</button>
    </section>`;
  bind({
    back: () => go(store.activeProfile() ? 'home' : 'profiles'),
    bonus: (el) => { store.grantBonus(el.dataset.id, 15); go('parent'); },
    del: (el) => {
      const p = st.profiles.find((x) => x.id === el.dataset.id);
      if (confirm(`Xóa hồ sơ và tiến độ của ${p.name}?`)) { store.removeProfile(p.id); go('parent'); }
    },
    test: () => speak('Xin chào! Bé hãy tìm chữ A nhé.'),
    testen: () => speak('Hello! How are you?', 'en-US'),
    reset: () => { if (confirm('Xóa toàn bộ hồ sơ, tiến độ và cài đặt?')) { store.resetAll(); go('profiles'); } },
  });
  $app.querySelectorAll('[data-change]').forEach((el) => {
    el.addEventListener('change', () => {
      const k = el.dataset.change;
      if (k === 'grade') { store.updateProfile(el.dataset.id, { grade: el.value }); return go('parent'); }
      if (k === 'unlockAll') return store.updateProfile(el.dataset.id, { unlockAll: el.checked });
      const v = el.type === 'checkbox' ? el.checked : Number(el.value);
      store.updateSettings({ [k]: v });
      configureSpeech(store.getState().settings);
    });
  });
}

// ---------------- THỜI GIAN & NGHỈ NGƠI ----------------
const TRACKED = new Set(['home', 'subject', 'lesson', 'result', 'clip', 'memory', 'draw', 'rebus', 'words', 'match']);

function limitSeconds(pid) {
  const { dailyMinutes } = store.getState().settings;
  if (!dailyMinutes) return Infinity;
  return (dailyMinutes + store.usageToday(pid).bonusMin) * 60;
}

function checkTimeUp() {
  const p = store.activeProfile();
  if (!p) return false;
  if (store.usageToday(p.id).seconds + pendingUsage < limitSeconds(p.id)) return false;
  showTimeUp(p);
  return true;
}

function showTimeUp(p) {
  paused = true;
  stopSpeech();
  clearTimers();
  $overlay.innerHTML = `
    <div class="modal">
      <div class="mascot sleep">🐃💤</div>
      <h2>Hết giờ chơi hôm nay rồi!</h2>
      <p>${esc(p.name)} đã học rất chăm. Mình cùng ra ngoài vận động, đọc sách hoặc chơi với bố mẹ nhé!</p>
      <div class="row">
        <button class="btn" data-o="switch">Đổi bé khác</button>
        <button class="btn" data-o="parent">🔒 Phụ huynh gia hạn</button>
      </div>
    </div>`;
  $overlay.hidden = false;
  speak('Hết giờ chơi hôm nay rồi! Mình cùng ra ngoài vận động nhé!');
  $overlay.onclick = (e) => {
    const o = e.target.closest('[data-o]')?.dataset.o;
    if (o === 'switch') { closeOverlay(); paused = false; store.setActive(null); go('profiles'); }
    if (o === 'parent') gate(() => go('parent'));
  };
}

function showBreak() {
  paused = true;
  stopSpeech();
  clearTimers();
  let left = BREAK_SECONDS;
  $overlay.innerHTML = `
    <div class="modal">
      <div class="mascot">🐃👀</div>
      <h2>Nghỉ mắt một chút nhé!</h2>
      <p>Bé hãy nhìn ra xa, chớp mắt thật nhiều và vươn vai nào.</p>
      <div class="countdown" id="cd">${left}</div>
    </div>`;
  $overlay.hidden = false;
  speak('Nghỉ mắt một chút nhé! Bé hãy nhìn ra xa và vươn vai nào.');
  const t = setInterval(() => {
    left--;
    const cd = document.getElementById('cd');
    if (cd) cd.textContent = left;
    if (left <= 0) {
      clearInterval(t);
      closeOverlay();
      paused = false;
      continuousSec = 0;
      speak('Giỏi lắm! Mình học tiếp nào!');
      // Màn đang dở (bài học, clip) được mở lại từ đầu câu/cảnh hiện tại.
      if (screen === 'lesson') { if (lesson.locked) nextQuestion(0); else go('lesson'); }
      else if (screen === 'clip') playScene(clipState.i);
    }
  }, 1000);
}

function tick() {
  const p = store.activeProfile();
  if (!p || paused || document.visibilityState !== 'visible' || !TRACKED.has(screen)) return;
  pendingUsage++;
  continuousSec++;
  if (pendingUsage >= 10) { store.addUsage(p.id, pendingUsage); pendingUsage = 0; }
  if (checkTimeUp()) return;
  const { breakEvery } = store.getState().settings;
  if (breakEvery && continuousSec >= breakEvery * 60) showBreak();
}

function flushUsage() {
  const p = store.activeProfile();
  if (p && pendingUsage) store.addUsage(p.id, pendingUsage);
  pendingUsage = 0;
}

// ---------------- TIỆN ÍCH GIAO DIỆN ----------------
function topbar(title) {
  return `<header class="topbar"><button class="icon" data-action="back" aria-label="Quay lại">⬅️</button><h1>${title}</h1><span></span></header>`;
}

function bind(handlers) {
  $app.onclick = (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || !handlers[el.dataset.action]) return;
    handlers[el.dataset.action](el);
  };
}

const SCREENS = {
  profiles: renderProfiles,
  newProfile: renderNewProfile,
  home: renderHome,
  subject: renderSubject,
  lesson: renderLesson,
  result: renderResult,
  clip: renderClip,
  parent: renderParent,
  rebus: () => games.rebus(),
  words: () => games.words(),
  match: () => games.match(),
  memory: () => games.memory(),
  draw: () => games.draw(),
};

// ---------------- KHỞI ĐỘNG ----------------
configureSpeech(store.getState().settings);
initSpeech();
fetch('videos/manifest.json').then((r) => (r.ok ? r.json() : [])).then((ids) => (videoIds = Array.isArray(ids) ? ids : [])).catch(() => {});
go(store.activeProfile() ? 'home' : 'profiles');
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { flushUsage(); stopSpeech(); }
});
window.addEventListener('pagehide', flushUsage);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
