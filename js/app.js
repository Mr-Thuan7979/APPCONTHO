import {
  AGE_GROUPS, SUBJECTS, MEMORY_EMOJI, MEMORY_PAIRS,
  generateLesson, starsFor,
} from './content.js';
import * as store from './storage.js';
import { initSpeech, speak, stopSpeech, chime, configureSpeech, hasVietnameseVoice, speechSupported } from './speech.js';

const $app = document.getElementById('app');
const $overlay = document.getElementById('overlay');
const AVATARS = ['🐃', '🐱', '🐶', '🐰', '🐼', '🦊', '🐯', '🐸', '🐧', '🦄'];
const STICKERS = ['🌸', '🏮', '🐉', '🪁', '🥭', '🐟', '🌾', '🛵', '🍜', '🐓', '🎋', '🌕', '🐢', '🦚', '🌈'];
const STARS_PER_STICKER = 10;
const BREAK_SECONDS = 20;
const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!', 'Bé làm tốt lắm!', 'Xuất sắc!'];
const RETRY = ['Thử lại nhé!', 'Gần đúng rồi, thử lần nữa nào!', 'Không sao, bé chọn lại nhé!'];

let screen = 'profiles';
let lesson = null;
let memory = null;
let continuousSec = 0;
let pendingUsage = 0;
let paused = false; // đang hiện màn nghỉ / hết giờ

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ageOf = (id) => AGE_GROUPS.find((a) => a.id === id);

function go(name, ...args) {
  stopSpeech();
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
            <span class="meta">${ageOf(p.age)?.label ?? ''} · ⭐ ${p.stars}</span>
          </button>`).join('')}
        ${profiles.length < 6 ? `
          <button class="card profile add" data-action="new">
            <span class="avatar">➕</span><span class="name">Thêm bé</span>
          </button>` : ''}
      </div>
    </section>
    <footer class="foot"><button class="link" data-action="parent">🔒 Khu vực phụ huynh</button></footer>`;
  bind({
    pick: (el) => {
      store.setActive(el.dataset.id);
      go('home');
    },
    new: () => go('newProfile'),
    parent: () => gate(() => go('parent')),
  });
}

function renderNewProfile() {
  let avatar = AVATARS[0];
  let age = 'mam';
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
      <p class="field">Bé bao nhiêu tuổi?</p>
      <div class="chips ages" id="ages">
        ${AGE_GROUPS.map((g) => `<button class="chip age ${g.id === age ? 'on' : ''}" data-action="age" data-v="${g.id}">
          <b>${g.emoji} ${g.label}</b><small>${g.sub}</small></button>`).join('')}
      </div>
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
    age: (el) => { age = el.dataset.v; choose('#ages', el); },
    save: () => {
      const input = document.getElementById('name');
      const name = input.value.trim();
      if (!name) { input.focus(); input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 500); return; }
      store.addProfile({ name, avatar, age });
      go('home');
    },
  });
}

// ---------------- TRANG CHỦ ----------------
function renderHome() {
  const p = store.activeProfile();
  if (!p) return go('profiles');
  const prog = store.getState().progress[p.id] || {};
  const stickers = Math.min(STICKERS.length, Math.floor(p.stars / STARS_PER_STICKER));
  const toNext = STARS_PER_STICKER - (p.stars % STARS_PER_STICKER);
  $app.innerHTML = `
    <header class="homebar">
      <button class="who" data-action="switch" aria-label="Đổi bé">
        <span class="avatar sm">${p.avatar}</span>
        <span><b>${esc(p.name)}</b><small>${ageOf(p.age).label}</small></span>
      </button>
      <span class="stars" aria-label="${p.stars} sao">⭐ ${p.stars}</span>
    </header>
    <section class="bubble-row">
      <div class="mascot sm" aria-hidden="true">🐃</div>
      <div class="bubble">Chào ${esc(p.name)}! Hôm nay mình học gì nào?</div>
      <button class="icon" data-action="hello" aria-label="Nghe">🔊</button>
    </section>
    <h2 class="section">📚 Học</h2>
    <div class="grid subjects">
      ${SUBJECTS.map((s) => `
        <button class="card subject" style="--c:${s.color}" data-action="learn" data-id="${s.id}">
          <span class="emoji">${s.emoji}</span>
          <span class="name">${s.name}</span>
          <span class="meta">${prog[s.id]?.lessons ? `Đã học ${prog[s.id].lessons} bài` : 'Bắt đầu nào!'}</span>
        </button>`).join('')}
    </div>
    <h2 class="section">🎈 Chơi</h2>
    <div class="grid games">
      <button class="card game" style="--c:var(--yellow)" data-action="memory">
        <span class="emoji">🃏</span><span class="name">Lật thẻ</span><span class="meta">Tìm cặp giống nhau</span>
      </button>
      <button class="card game" style="--c:var(--purple)" data-action="draw">
        <span class="emoji">🖍️</span><span class="name">Bảng vẽ</span><span class="meta">Vẽ tự do</span>
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
    hello: () => speak(`Chào ${p.name}! Hôm nay mình học gì nào?`),
    learn: (el) => startLesson(el.dataset.id),
    memory: () => go('memory'),
    draw: () => go('draw'),
    parent: () => gate(() => go('parent')),
  });
}

// ---------------- BÀI HỌC ----------------
function startLesson(subject) {
  const p = store.activeProfile();
  lesson = { subject, qs: generateLesson(subject, p.age), i: 0, firstTry: true, correct: 0 };
  go('lesson');
}

function renderLesson() {
  const q = lesson.qs[lesson.i];
  const subj = SUBJECTS.find((s) => s.id === lesson.subject);
  const v = q.visual;
  const visual = !v ? '' : v.big ? `<div class="visual big">${esc(v.big)}</div>`
    : v.count ? `<div class="visual count">${`<span>${v.emoji}</span>`.repeat(v.count)}</div>`
    : `<div class="visual emoji">${v.emoji}</div>`;
  const long = q.choices.some((c) => (c.text ?? '').length > 14);
  $app.innerHTML = `
    ${topbar(subj.emoji + ' ' + subj.name)}
    <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${lesson.qs.length}" aria-valuenow="${lesson.i}">
      ${lesson.qs.map((_, i) => `<span class="${i < lesson.i ? 'done' : i === lesson.i ? 'now' : ''}"></span>`).join('')}
    </div>
    <section class="panel question" style="--c:${subj.color}">
      <button class="prompt" data-action="say">
        <span class="speaker">🔊</span><span>${esc(q.prompt)}</span>
      </button>
      ${visual}
      <div class="choices ${long ? 'long' : ''} n${q.choices.length}">
        ${q.choices.map((c, i) => `<button class="choice" data-action="choose" data-i="${i}">${c.html ?? esc(c.text)}</button>`).join('')}
      </div>
      <p class="feedback" id="fb" aria-live="polite"></p>
    </section>`;
  bind({
    back: () => go('home'),
    say: () => speak(q.say),
    choose: (el) => answer(el, Number(el.dataset.i)),
  });
  setTimeout(() => screen === 'lesson' && speak(q.say), 250);
}

function answer(el, i) {
  const q = lesson.qs[lesson.i];
  const fb = document.getElementById('fb');
  if (el.disabled || lesson.locked) return;
  if (i === q.answer) {
    lesson.locked = true;
    if (lesson.firstTry) lesson.correct++;
    el.classList.add('right');
    document.querySelectorAll('.choice').forEach((c) => (c.disabled = true));
    const msg = rand(PRAISE);
    fb.textContent = '🎉 ' + msg;
    fb.className = 'feedback ok';
    chime(true);
    speak(msg);
    setTimeout(() => {
      lesson.locked = false;
      lesson.firstTry = true;
      lesson.i++;
      if (lesson.i < lesson.qs.length) go('lesson');
      else finishLesson();
    }, 1300);
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

function finishLesson() {
  const p = store.activeProfile();
  const total = lesson.qs.length;
  const stars = starsFor(lesson.correct, total);
  const before = Math.floor(p.stars / STARS_PER_STICKER);
  store.recordLesson(p.id, lesson.subject, { correct: lesson.correct, total, stars });
  const newSticker = Math.floor(p.stars / STARS_PER_STICKER) > before && before < STICKERS.length;
  go('result', { stars, correct: lesson.correct, total, newSticker: newSticker ? STICKERS[before] : null });
}

function renderResult({ stars, correct, total, newSticker }) {
  const msg = stars === 3 ? 'Bé thật giỏi!' : stars === 2 ? 'Bé làm tốt lắm!' : 'Bé đã cố gắng, lần sau sẽ giỏi hơn nữa!';
  $app.innerHTML = `
    <section class="panel result">
      <div class="mascot dance" aria-hidden="true">🐃</div>
      <div class="bigstars">${'⭐'.repeat(stars)}${'<span class="dim">⭐</span>'.repeat(3 - stars)}</div>
      <h2>${msg}</h2>
      <p>Đúng ngay lần đầu: <b>${correct}/${total}</b> câu</p>
      ${newSticker ? `<p class="gift">🎁 Bé nhận được hình dán mới: <span class="sticker got">${newSticker}</span></p>` : ''}
      <div class="row">
        <button class="btn primary" data-action="again">Học tiếp ▶</button>
        <button class="btn" data-action="home">Về trang chủ 🏠</button>
      </div>
    </section>`;
  chime(true);
  speak(msg + (newSticker ? ' Bé nhận được hình dán mới!' : ''));
  bind({ again: () => startLesson(lesson.subject), home: () => go('home') });
}

// ---------------- TRÒ LẬT THẺ ----------------
function renderMemory() {
  const p = store.activeProfile();
  const n = MEMORY_PAIRS[p.age];
  const pool = MEMORY_EMOJI.slice().sort(() => Math.random() - 0.5).slice(0, n);
  const cards = [...pool, ...pool].map((e, id) => ({ id, e })).sort(() => Math.random() - 0.5);
  memory = { cards, open: [], matched: new Set(), moves: 0, busy: false };
  const cols = n <= 3 ? 3 : 4;
  $app.innerHTML = `
    ${topbar('🃏 Lật thẻ')}
    <p class="hint">Lật 2 thẻ, tìm cặp hình giống nhau nhé!</p>
    <div class="memory" style="--cols:${cols}">
      ${cards.map((c, i) => `<button class="mcard" data-action="flip" data-i="${i}" aria-label="Thẻ ${i + 1}">
        <span class="front">${c.e}</span><span class="back">🐃</span></button>`).join('')}
    </div>
    <p class="hint" id="moves">Số lượt: 0</p>`;
  speak('Lật hai thẻ, tìm cặp hình giống nhau nhé!');
  bind({ back: () => go('home'), flip: (el) => flip(el, Number(el.dataset.i)) });
}

function flip(el, i) {
  const m = memory;
  if (m.busy || m.matched.has(i) || m.open.includes(i)) return;
  el.classList.add('open');
  m.open.push(i);
  if (m.open.length < 2) return;
  m.moves++;
  document.getElementById('moves').textContent = `Số lượt: ${m.moves}`;
  const [a, b] = m.open;
  const els = document.querySelectorAll('.mcard');
  if (m.cards[a].e === m.cards[b].e) {
    m.matched.add(a).add(b);
    els[a].classList.add('matched');
    els[b].classList.add('matched');
    m.open = [];
    chime(true);
    if (m.matched.size === m.cards.length) {
      const p = store.activeProfile();
      store.addStars(p.id, 1);
      setTimeout(() => {
        $overlay.innerHTML = `<div class="modal"><div class="mascot dance">🐃</div><h2>Hoàn thành! ⭐ +1</h2>
          <p>Bé tìm hết các cặp sau ${m.moves} lượt.</p>
          <div class="row"><button class="btn primary" data-o="again">Chơi lại</button><button class="btn" data-o="home">Về trang chủ</button></div></div>`;
        $overlay.hidden = false;
        speak('Hoàn thành! Bé giỏi quá!');
        $overlay.onclick = (e) => {
          const o = e.target.closest('[data-o]')?.dataset.o;
          if (!o) return;
          closeOverlay();
          go(o === 'again' ? 'memory' : 'home');
        };
      }, 500);
    }
  } else {
    m.busy = true;
    setTimeout(() => {
      els[a].classList.remove('open');
      els[b].classList.remove('open');
      m.open = [];
      m.busy = false;
    }, 900);
  }
}

// ---------------- BẢNG VẼ ----------------
function renderDraw() {
  const colors = ['#222', '#e85d3f', '#f2a81d', '#2e9b5f', '#2f7fd8', '#8b5cf6', '#ec4899', '#8b5a2b'];
  $app.innerHTML = `
    ${topbar('🖍️ Bảng vẽ')}
    <div class="palette">
      ${colors.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" style="background:${c}" data-action="color" data-v="${c}" aria-label="Màu"></button>`).join('')}
      <button class="swatch eraser" data-action="color" data-v="#ffffff" aria-label="Tẩy">🧽</button>
      <button class="btn small" data-action="size">✏️ Nét</button>
      <button class="btn small" data-action="clear">🗑️ Xóa</button>
    </div>
    <canvas id="cv" class="canvas"></canvas>`;
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  cv.width = rect.width * dpr;
  cv.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  ctx.lineCap = ctx.lineJoin = 'round';
  let color = colors[0], size = 8, drawing = false, last = null;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.addEventListener('pointerdown', (e) => { drawing = true; last = pos(e); cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = color === '#ffffff' ? size * 3 : size;
    ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...p); ctx.stroke();
    last = p;
  });
  const end = () => (drawing = false);
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);
  bind({
    back: () => go('home'),
    color: (el) => {
      color = el.dataset.v;
      document.querySelectorAll('.swatch').forEach((s) => s.classList.remove('on'));
      el.classList.add('on');
    },
    size: (el) => { size = size === 8 ? 16 : size === 16 ? 4 : 8; el.textContent = `✏️ Nét ${size === 4 ? 'nhỏ' : size === 8 ? 'vừa' : 'to'}`; },
    clear: () => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, rect.width, rect.height); },
  });
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
function fmtMin(sec) {
  return Math.round(sec / 60) + ' phút';
}

function renderParent() {
  flushUsage();
  const st = store.getState();
  const s = st.settings;
  const opt = (vals, cur, label) => vals.map((v) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${label(v)}</option>`).join('');
  const voice = !speechSupported() ? '❌ Trình duyệt không hỗ trợ đọc. Nên dùng Chrome (Android) hoặc Safari (iPhone/iPad).'
    : hasVietnameseVoice() ? '✅ Đã có giọng đọc tiếng Việt.'
    : '⚠️ Chưa thấy giọng tiếng Việt trên máy. Android: Cài đặt → Chuyển văn bản thành giọng nói → cài gói Tiếng Việt. iPhone/iPad: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Việt.';
  $app.innerHTML = `
    ${topbar('🔒 Phụ huynh')}
    <section class="panel">
      <h2>Tiến độ của các bé</h2>
      ${st.profiles.length === 0 ? '<p class="note">Chưa có bé nào.</p>' : st.profiles.map((p) => {
        const pr = st.progress[p.id] || {};
        const u = store.usageToday(p.id);
        return `<div class="kid">
          <div class="kid-head"><span class="avatar sm">${p.avatar}</span><b>${esc(p.name)}</b>
            <select data-change="age" data-id="${p.id}" aria-label="Độ tuổi">${AGE_GROUPS.map((g) => `<option value="${g.id}" ${g.id === p.age ? 'selected' : ''}>${g.label}</option>`).join('')}</select>
          </div>
          <table class="tbl"><thead><tr><th>Môn</th><th>Số bài</th><th>Đúng lần đầu</th></tr></thead><tbody>
            ${SUBJECTS.map((sj) => {
              const x = pr[sj.id];
              return `<tr><td>${sj.emoji} ${sj.name}</td><td>${x?.lessons ?? 0}</td><td>${x?.total ? Math.round((x.correct / x.total) * 100) + '%' : '—'}</td></tr>`;
            }).join('')}
          </tbody></table>
          <p class="note">Hôm nay đã dùng: <b>${fmtMin(u.seconds)}</b>${u.bonusMin ? ` (gia hạn +${u.bonusMin} phút)` : ''} · Tổng sao: ${p.stars} ⭐</p>
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
      <button class="btn small" data-action="test">🔊 Thử giọng đọc</button>
    </section>
    <section class="panel">
      <h2>Cam kết an toàn</h2>
      <ul class="list">
        <li>Không quảng cáo, không mua hàng trong ứng dụng.</li>
        <li>Không chat, không kết nối mạng xã hội, không có người lạ.</li>
        <li>Không cần tài khoản. Dữ liệu chỉ lưu trên máy này, không gửi đi đâu.</li>
        <li>Không trừ điểm, không có “thua”: bé được chọn lại đến khi đúng.</li>
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
    reset: () => { if (confirm('Xóa toàn bộ hồ sơ, tiến độ và cài đặt?')) { store.resetAll(); go('profiles'); } },
  });
  $app.querySelectorAll('[data-change]').forEach((el) => {
    el.addEventListener('change', () => {
      const k = el.dataset.change;
      if (k === 'age') return store.updateProfile(el.dataset.id, { age: el.value });
      const v = el.type === 'checkbox' ? el.checked : Number(el.value);
      store.updateSettings({ [k]: v });
      configureSpeech(store.getState().settings);
    });
  });
}

// ---------------- THỜI GIAN & NGHỈ NGƠI ----------------
const TRACKED = new Set(['home', 'lesson', 'result', 'memory', 'draw']);

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
  lesson: renderLesson,
  result: renderResult,
  memory: renderMemory,
  draw: renderDraw,
  parent: renderParent,
};

// ---------------- KHỞI ĐỘNG ----------------
configureSpeech(store.getState().settings);
initSpeech();
go(store.activeProfile() ? 'home' : 'profiles');
setInterval(tick, 1000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') { flushUsage(); stopSpeech(); }
});
window.addEventListener('pagehide', flushUsage);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
