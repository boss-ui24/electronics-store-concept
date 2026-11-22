/* Демо-бот: отвечает на «цена / есть ли / рассрочка / доставка / где заказ» по данным из базы,
   принимает заявку на рассрочку прямо в чате и пишет каждый вопрос в журнал для статистики панели.
   В настоящей версии та же логика работает в Instagram Direct. */
(() => {
  const B = window.BOSS, t = B.t, $ = (s, r = document) => r.querySelector(s);
  const root = $('#bot');
  root.innerHTML = `
    <button class="bot-fab" aria-label="Chat"><span class="bot-dot"></span>
      <svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button>
    <div class="bot-win" role="dialog" aria-label="Chat">
      <div class="bot-head"><div class="bot-ava">B</div><div><b data-t="bot_title"></b><small data-t="bot_sub"></small></div><button class="bot-x" aria-label="×">×</button></div>
      <div class="bot-body"></div>
      <div class="bot-chips"></div>
      <form class="bot-in"><input data-tp="bot_ph" autocomplete="off"><button aria-label="send">↑</button></form>
    </div>`;
  const body = $('.bot-body', root), chips = $('.bot-chips', root), input = $('.bot-in input', root);
  let state = null; // ожидание данных для заявки: { pid }
  let greeted = false;

  const say = (html, who = 'bot') => {
    const el = document.createElement('div');
    el.className = 'msg ' + who; el.innerHTML = html;
    body.appendChild(el); body.scrollTop = body.scrollHeight;
  };
  const typing = (fn) => {
    const el = document.createElement('div'); el.className = 'msg bot typing'; el.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(el); body.scrollTop = body.scrollHeight;
    setTimeout(() => { el.remove(); fn(); }, 550 + Math.random() * 350);
  };
  const setChips = (list) => { chips.innerHTML = list.map((c) => `<button data-q="${B.esc(c)}">${B.esc(c)}</button>`).join(''); };
  const defaultChips = () => setChips([t('chip_price'), t('chip_taksit'), t('chip_stock'), t('chip_track')]);

  const open = () => {
    root.classList.add('open');
    if (!greeted) { greeted = true; say(t('bot_hi')); defaultChips(); }
    setTimeout(() => input.focus(), 50);
  };
  B.bot = { open, relang: () => { B.shell(); if (!state) defaultChips(); } };
  $('.bot-fab', root).onclick = () => (root.classList.contains('open') ? root.classList.remove('open') : open());
  $('.bot-x', root).onclick = () => root.classList.remove('open');
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-bot]')) open(); });
  chips.onclick = (e) => { const b = e.target.closest('button'); if (b) ask(b.dataset.q); };
  $('.bot-in', root).onsubmit = (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; ask(q); } };

  // ---------- понимание ----------
  const norm = (s) => s.toLowerCase().replace(/ı/g, 'i').replace(/ə/g, 'e').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/\s+/g, ' ');
  const findProduct = (q) => {
    const n = norm(q);
    let best = null, len = 0;
    for (const p of B.db.products) {
      for (const a of [p.name, ...p.alias]) {
        const k = norm(a);
        if (k.length > len && n.includes(k)) { best = p; len = k.length; }
      }
    }
    return best;
  };
  const findMem = (q, p) => { const n = norm(q).replace(/\s/g, ''); return Math.max(0, p.mem.findIndex((m) => n.includes(norm(m.label).replace(/\s/g, '').replace('gb', '')))); };
  const intentOf = (q) => {
    const n = norm(q);
    if (/b-?\d{3,}/.test(n) || /sifaris(im)? (hara|ne yer)|harada|где мой|мой заказ|статус/.test(n)) return 'track';
    if (/taksit|kredit|hisse|рассроч|кредит|частям/.test(n)) return 'taksit';
    if (/catdir|dostav|достав|kuryer|курьер/.test(n)) return 'delivery';
    if (/zemanet|qarant|гарант/.test(n)) return 'warranty';
    if (/qiym|necey|nece manat|сколько|цена|стоит|почем|price/.test(n)) return 'price';
    if (/\bvar\b|varmi|stok|есть|налич/.test(n)) return 'stock';
    return 'other';
  };

  // ---------- ответы ----------
  const az = () => B.lang === 'az';
  const pLine = (p, mi) => {
    const mem = p.mem[mi], price = p.price + (mem ? mem.add : 0);
    return `<b>${p.name}${mem ? ' · ' + mem.label : ''}</b> — <b>${B.money(price)}</b>`;
  };
  const stockLine = (p) => p.stock > 0
    ? (az() ? `Stokda var ✓${p.stock <= 3 ? ` (cəmi ${p.stock} ədəd)` : ''}` : `В наличии ✓${p.stock <= 3 ? ` (всего ${p.stock} шт.)` : ''}`)
    : (az() ? 'Hazırda stokda yoxdur. Gələndə xəbər verək?' : 'Сейчас нет в наличии. Сообщить, когда появится?');
  const link = (p) => `<a href="#/p/${p.id}">${az() ? 'Məhsula bax →' : 'Открыть товар →'}</a>`;

  function answer(q) {
    if (state) {
      const digits = q.replace(/\D/g, '');
      if (digits.length >= 9) {
        const p = B.product(state.pid), mem = p.mem[state.mi];
        const name = q.replace(/[+\d()\-\s]{9,}/g, '').replace(/[,.;:]+$/, '').trim() || (az() ? 'Müştəri' : 'Клиент');
        const d = digits.replace(/^0/, '994').replace(/^(?!994)/, '994').slice(0, 12);
        const o = B.addOrder({ name, phone: `+${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`, src: 'bot', pay: 'taksit', months: 12,
          items: [{ id: p.id, qty: 1, opt: mem ? mem.label : '', price: p.price + (mem ? mem.add : 0) }] });
        state = null;
        B.logQ({ q, intent: 'lead', pid: p.id, auto: true });
        say(az()
          ? `Müraciət <b>${o.id}</b> qəbul olundu ✓<br>Menecer 15 dəqiqə ərzində zəng edəcək. Statusu buradan izləyin: <a href="#/track/${o.id}">#/track/${o.id}</a>`
          : `Заявка <b>${o.id}</b> принята ✓<br>Менеджер позвонит в течение 15 минут. Статус здесь: <a href="#/track/${o.id}">#/track/${o.id}</a>`);
        say(az() ? `<small>Bu müraciət artıq paneldə görünür → <a href="#/panel" target="_blank">Panel ↗</a></small>` : `<small>Эта заявка уже в панели → <a href="#/panel" target="_blank">Панель ↗</a></small>`);
        return defaultChips();
      }
      if (/^(xeyr|yox|нет|отмена|ləğv)/i.test(q.trim())) { state = null; say(az() ? 'Oldu, başqa sualınız varsa yazın.' : 'Хорошо, пишите, если будут вопросы.'); return defaultChips(); }
      return say(az() ? 'Zəhmət olmasa adınızı və nömrənizi yazın, məsələn: <i>Elvin 050 123 45 67</i>' : 'Напишите, пожалуйста, имя и номер, например: <i>Эльвин 050 123 45 67</i>');
    }

    const intent = intentOf(q), p = findProduct(q);
    const log = (auto) => B.logQ({ q, intent, pid: p ? p.id : '', auto });

    if (intent === 'track') {
      const m = q.match(/b-?(\d{3,})/i), o = m && B.order('B-' + m[1]);
      log(true);
      if (o) return say(`<b>${o.id}</b>: ${t('st_' + o.status)} · ${B.ago(o.t)}<br><a href="#/track/${o.id}">${az() ? 'Ətraflı →' : 'Подробнее →'}</a>`);
      return say(az() ? 'Sifariş nömrənizi yazın, məsələn: <b>B-1050</b>' : 'Напишите номер заказа, например: <b>B-1050</b>');
    }
    if (intent === 'warranty') {
      log(true);
      return say(az() ? 'Bütün cihazlara 1 il rəsmi zəmanət verilir, Apple və Samsung üçün qeydiyyatla. <small>(nümunə şərtlər)</small>' : 'На всю технику официальная гарантия 1 год, Apple и Samsung с регистрацией. <small>(пример условий)</small>');
    }
    if (intent === 'delivery') {
      log(true);
      return say(az() ? 'Bakı daxilində çatdırılma pulsuzdur, adətən eyni gün. Regionlara 1–3 gün. <small>(nümunə şərtlər)</small>' : 'По Баку доставка бесплатная, обычно в тот же день. В регионы 1–3 дня. <small>(пример условий)</small>');
    }
    if (intent === 'taksit') {
      log(true);
      if (!p) { setChips(['iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'MacBook Air']); return say(az() ? 'Taksit 3, 6, 12 və 18 aya mümkündür. Hansı model maraqlıdır?' : 'Рассрочка на 3, 6, 12 и 18 месяцев. Какая модель интересует?'); }
      const mi = findMem(q, p), price = p.price + (p.mem[mi] ? p.mem[mi].add : 0);
      state = { pid: p.id, mi };
      setChips([az() ? 'Xeyr, sağ olun' : 'Нет, спасибо']);
      return say(`${pLine(p, mi)}<br>${[6, 12, 18].map((m) => `${m} ${t('months')} × <b>${B.money(B.monthly(price, m))}</b>`).join('<br>')}<br><br>${az() ? 'Müraciət edək? Adınızı və nömrənizi yazın.' : 'Оформим заявку? Напишите имя и номер.'}`);
    }
    if (p) {
      const mi = findMem(q, p);
      log(true);
      setChips([az() ? `${p.name} taksitlə` : `${p.name} в рассрочку`, t('chip_taksit')]);
      if (intent === 'stock') return say(`${pLine(p, mi)}<br>${stockLine(p)}<br>${link(p)}`);
      return say(`${pLine(p, mi)}<br>${stockLine(p)}${p.stock > 0 ? `<br>${az() ? 'Taksitlə' : 'В рассрочку'}: 12 ${t('months')} × ${B.money(B.monthly(p.price + (p.mem[mi] ? p.mem[mi].add : 0), 12))}` : ''}<br>${link(p)}`);
    }
    if (intent === 'price' || intent === 'stock') {
      log(true);
      setChips(['iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'AirPods Pro 2']);
      return say(az() ? 'Hansı model maraqlıdır? Adını yazın, qiyməti və stoku dərhal deyim.' : 'Какая модель интересует? Напишите название — сразу скажу цену и наличие.');
    }
    log(false);
    say(az() ? 'Bu sualı menecerə ötürdüm 👤 Bir neçə dəqiqəyə burada cavab verəcək.' : 'Передал вопрос менеджеру 👤 Он ответит здесь через несколько минут.');
    defaultChips();
  }

  function ask(q) {
    say(B.esc(q), 'me');
    chips.innerHTML = '';
    // бот отвечает на языке вопроса: кириллица — по-русски
    const ql = /[а-яё]/i.test(q) ? 'ru' : /[əğıöüşç]/i.test(q) ? 'az' : B.lang;
    typing(() => { const keep = B.lang; B.lang = ql; try { answer(q); } finally { B.lang = keep; } });
  }
  B.shell();
})();
