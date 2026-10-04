// Trò chơi sau giờ học: Đuổi hình bắt chữ, Ô chữ, Nối cặp, Lật thẻ, Bảng vẽ.
import { gradeOf } from './core.js';
import { REBUS_IDIOMS, rebusPool, wordPool, matchSets, MATCH_PAIRS, MEMORY_EMOJI, MEMORY_PAIRS } from './games-data.js';

const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const isEnglish = (s) => /^[A-Za-z][A-Za-z' -]*$/.test(s);
const IDIOMS = new Set(REBUS_IDIOMS.map(([, a]) => a));
const VI_LETTERS = 'AĂÂBCDĐEÊGHIKLMNOÔƠPQRSTUƯVXY'.split('');

export function createGames(ui) {
  const { $app, topbar, bind, go, esc, rand, speak, chime } = ui;
  const profile = () => ui.store.activeProfile();
  const PRAISE = ['Giỏi quá!', 'Đúng rồi!', 'Tuyệt vời!'];

  // ---------- ĐUỔI HÌNH BẮT CHỮ ----------
  function rebus() {
    const band = gradeOf(profile().grade).band;
    const pool = rebusPool(band);
    const rounds = shuffle(pool).slice(0, 5);
    const st = { i: 0, score: 0, first: true };
    const round = () => {
      const [pics, ans] = rounds[st.i];
      const isIdiom = (a) => IDIOMS.has(a);
      const idiom = isIdiom(ans);
      const others = shuffle(pool.filter(([, a]) => a !== ans && isIdiom(a) === idiom)).slice(0, 3).map(([, a]) => a);
      const choices = shuffle([ans, ...others]);
      $app.innerHTML = `
        ${topbar('🧩 Đuổi hình bắt chữ')}
        <p class="hint">Câu ${st.i + 1}/${rounds.length} · Mỗi hình gợi ý một tiếng hoặc một ý</p>
        <section class="panel question" style="--c:var(--red)">
          <button class="prompt" data-action="say"><span class="speaker">🔊</span><span>${idiom ? 'Các hình này là câu tục ngữ, thành ngữ nào?' : 'Ghép các hình lại là từ gì?'}</span></button>
          <div class="rebus">${pics.map((e) => `<span>${e}</span>`).join('<b>+</b>')}</div>
          <div class="choices ${idiom ? 'long' : ''}">
            ${choices.map((c) => `<button class="choice" data-action="pick" data-v="${esc(c)}">${esc(c)}</button>`).join('')}
          </div>
          <p class="feedback" id="fb"></p>
        </section>`;
      const sayQ = idiom ? 'Các hình này là câu tục ngữ, thành ngữ nào?' : 'Ghép các hình lại là từ gì?';
      speak(sayQ);
      bind({
        back: () => go('home'),
        say: () => speak(sayQ),
        pick: (el) => {
          if (el.disabled) return;
          const fb = document.getElementById('fb');
          if (el.dataset.v === ans) {
            if (st.first) st.score++;
            el.classList.add('right');
            document.querySelectorAll('.choice').forEach((c) => (c.disabled = true));
            fb.textContent = '🎉 ' + ans;
            fb.className = 'feedback ok';
            chime(true);
            speak(rand(PRAISE) + ' ' + ans);
            setTimeout(() => {
              st.i++;
              st.first = true;
              if (st.i < rounds.length) round();
              else ui.finish(`Bé đoán đúng ${st.score}/${rounds.length}!`, st.score >= 4 ? 2 : 1, 'Hoàn thành! Bé giỏi quá!', 'rebus');
            }, 1800);
          } else {
            st.first = false;
            el.classList.add('wrong');
            el.disabled = true;
            fb.textContent = '💪 Thử lại nhé!';
            fb.className = 'feedback try';
            chime(false);
          }
        },
      });
    };
    round();
  }

  // ---------- Ô CHỮ (xếp chữ) ----------
  function words() {
    const p = profile();
    const pool = wordPool(p.grade);
    const rounds = shuffle(pool).slice(0, 3);
    const older = gradeOf(p.grade).band === 'l35';
    const st = { i: 0, mistakes: 0 };
    const round = () => {
      const { clue, emoji, word } = rounds[st.i];
      const letters = [...word.replace(/ /g, '')];
      const decoys = older ? shuffle(VI_LETTERS.filter((l) => !letters.includes(l))).slice(0, 2) : [];
      const tiles = shuffle([...letters, ...decoys]);
      let pos = 0;
      const slots = [...word].map((ch) => (ch === ' ' ? '<span class="gap"></span>' : '<span class="slot"></span>')).join('');
      $app.innerHTML = `
        ${topbar('🔠 Ô chữ')}
        <p class="hint">Từ ${st.i + 1}/${rounds.length} · Bấm các chữ cái theo đúng thứ tự</p>
        <section class="panel question" style="--c:var(--blue)">
          <button class="prompt" data-action="say"><span class="speaker">🔊</span><span>${emoji ? 'Đây là gì?' : esc(clue)}</span></button>
          ${emoji ? `<div class="visual emoji">${clue}</div>` : ''}
          <div class="slots">${slots}</div>
          <div class="tiles">${tiles.map((t, k) => `<button class="tile" data-action="tile" data-k="${k}">${t}</button>`).join('')}</div>
          <p class="feedback" id="fb"></p>
        </section>`;
      const sayQ = emoji ? 'Bé hãy xếp chữ cái thành tên của hình này.' : clue;
      speak(sayQ);
      const slotEls = [...document.querySelectorAll('.slot')];
      bind({
        back: () => go('home'),
        say: () => speak(sayQ),
        tile: (el) => {
          if (el.disabled) return;
          if (el.textContent === letters[pos]) {
            slotEls[pos].textContent = letters[pos];
            slotEls[pos].classList.add('filled');
            el.disabled = true;
            el.classList.add('used');
            pos++;
            if (pos === letters.length) {
              const fb = document.getElementById('fb');
              fb.textContent = '🎉 ' + word;
              fb.className = 'feedback ok';
              chime(true);
              speak(rand(PRAISE) + ' ' + word.toLowerCase(), isEnglish(word) ? 'en-US' : 'vi-VN');
              setTimeout(() => {
                st.i++;
                if (st.i < rounds.length) round();
                else ui.finish('Bé xếp xong tất cả các từ!', st.mistakes <= 2 ? 2 : 1, 'Hoàn thành! Bé giỏi quá!', 'words');
              }, 1800);
            }
          } else {
            st.mistakes++;
            el.classList.add('shake');
            setTimeout(() => el.classList.remove('shake'), 400);
            chime(false);
          }
        },
      });
    };
    round();
  }

  // ---------- NỐI CẶP ----------
  function match() {
    const p = profile();
    const [title, pairs] = rand(matchSets(p.grade));
    const n = Math.min(MATCH_PAIRS[p.grade], pairs.length);
    const chosen = shuffle(pairs).slice(0, n).map(([l, r], id) => ({ id, l, r }));
    const right = shuffle(chosen);
    let sel = null;
    let done = 0;
    let mistakes = 0;
    $app.innerHTML = `
      ${topbar('🔗 Nối cặp')}
      <section class="panel question" style="--c:var(--green)">
        <button class="prompt" data-action="say"><span class="speaker">🔊</span><span>${esc(title)}</span></button>
        <p class="hint small">Chạm một ô bên trái, rồi chạm ô đi đôi với nó bên phải</p>
        <div class="match">
          <div class="col">${chosen.map((c) => `<button class="mitem" data-action="L" data-id="${c.id}">${esc(c.l)}</button>`).join('')}</div>
          <div class="col">${right.map((c) => `<button class="mitem" data-action="R" data-id="${c.id}">${esc(c.r)}</button>`).join('')}</div>
        </div>
        <p class="feedback" id="fb"></p>
      </section>`;
    speak(title);
    const hue = (id) => `hsl(${(id * 67) % 360} 70% 88%)`;
    const sayItem = (t) => { if (isEnglish(t)) speak(t, 'en-US'); };
    bind({
      back: () => go('home'),
      say: () => speak(title),
      L: (el) => {
        if (el.classList.contains('ok')) return;
        document.querySelectorAll('.mitem.sel').forEach((x) => x.classList.remove('sel'));
        el.classList.add('sel');
        sel = el;
        sayItem(el.textContent);
      },
      R: (el) => {
        if (el.classList.contains('ok')) return;
        sayItem(el.textContent);
        if (!sel) {
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 400);
          return;
        }
        if (sel.dataset.id === el.dataset.id) {
          [sel, el].forEach((x) => { x.classList.remove('sel'); x.classList.add('ok'); x.style.background = hue(Number(el.dataset.id)); });
          sel = null;
          done++;
          chime(true);
          if (done === chosen.length) {
            speak('Bé nối đúng hết rồi!');
            setTimeout(() => ui.finish('Bé nối đúng hết!', mistakes <= 1 ? 2 : 1, 'Hoàn thành! Bé giỏi quá!', 'match'), 900);
          }
        } else {
          mistakes++;
          el.classList.add('shake');
          setTimeout(() => el.classList.remove('shake'), 400);
          chime(false);
        }
      },
    });
  }

  // ---------- LẬT THẺ ----------
  function memory() {
    const p = profile();
    const n = MEMORY_PAIRS[p.grade];
    const pool = shuffle(MEMORY_EMOJI).slice(0, n);
    const cards = shuffle([...pool, ...pool].map((e, id) => ({ id, e })));
    const m = { open: [], matched: new Set(), moves: 0, busy: false };
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
    bind({
      back: () => go('home'),
      flip: (el) => {
        const i = Number(el.dataset.i);
        if (m.busy || m.matched.has(i) || m.open.includes(i)) return;
        el.classList.add('open');
        m.open.push(i);
        if (m.open.length < 2) return;
        m.moves++;
        document.getElementById('moves').textContent = `Số lượt: ${m.moves}`;
        const [a, b] = m.open;
        const els = document.querySelectorAll('.mcard');
        if (cards[a].e === cards[b].e) {
          m.matched.add(a).add(b);
          els[a].classList.add('matched');
          els[b].classList.add('matched');
          m.open = [];
          chime(true);
          if (m.matched.size === cards.length) {
            setTimeout(() => ui.finish(`Bé tìm hết các cặp sau ${m.moves} lượt!`, 1, 'Hoàn thành! Bé giỏi quá!', 'memory'), 500);
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
      },
    });
  }

  // ---------- BẢNG VẼ ----------
  function draw() {
    const colors = ['#222', '#e85d3f', '#f2a81d', '#2e9b5f', '#2f7fd8', '#8b5cf6', '#ec4899', '#8b5a2b'];
    $app.innerHTML = `
      ${topbar('🖍️ Bảng vẽ')}
      <div class="palette">
        ${colors.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" style="background:${c}" data-action="color" data-v="${c}" aria-label="Màu"></button>`).join('')}
        <button class="swatch eraser" data-action="color" data-v="#ffffff" aria-label="Tẩy">🧽</button>
        <button class="btn small" data-action="size">✏️ Nét vừa</button>
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
      const pt = pos(e);
      ctx.strokeStyle = color;
      ctx.lineWidth = color === '#ffffff' ? size * 3 : size;
      ctx.beginPath(); ctx.moveTo(...last); ctx.lineTo(...pt); ctx.stroke();
      last = pt;
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

  return { rebus, words, match, memory, draw };
}
