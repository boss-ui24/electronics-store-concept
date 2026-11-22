/* Витрина: роутер по hash, главная, каталог, товар, корзина, статус заказа, поиск. */
(() => {
  const B = window.BOSS, t = B.t, $ = (s, r = document) => r.querySelector(s);
  const view = $('#view');
  B.views = B.views || {};

  // ---------- общие куски ----------
  const head = (k, a, b) => `<div class="kicker">${k}</div><h2 class="h2">${a} <span class="mute">${b}</span></h2>`;
  const stockTag = (p) => p.stock > 0
    ? `<span class="tag ok">${t('in_stock')}${p.stock <= 3 ? ` · ${p.stock} ${t('left')}` : ''}</span>`
    : `<span class="tag no">${t('out_stock')}</span>`;
  const card = (p) => `
    <a class="card" href="#/p/${p.id}">
      <div class="card-art">${B.artOf(p)}${p.old ? `<span class="sale">−${Math.round((1 - p.price / p.old) * 100)}%</span>` : ''}</div>
      <div class="card-brand">${p.brand}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-price"><b data-price="${p.id}">${B.money(p.price)}</b>${p.old ? `<s>${B.money(p.old)}</s>` : ''}</div>
      <div class="card-foot">${stockTag(p)}<span class="mono">${B.money(B.monthly(p.price, 12))}/12</span></div>
    </a>`;
  B.card = card;

  // ---------- главная ----------
  B.views.home = () => {
    const hits = B.db.products.filter((p) => p.hit);
    const cnt = (c) => B.db.products.filter((p) => p.cat === c).length;
    return `
    <section class="hero wrap">
      <div class="hero-txt">
        <div class="kicker">${t('hero_k')}</div>
        <h1 class="h1">${t('hero_a')}<br><span class="mute">${t('hero_b')}</span></h1>
        <p class="lead">${t('hero_p')}</p>
        <div class="row">
          <a class="btn" href="#/c/phones">${t('hero_cta')}</a>
          <button class="btn ghost" data-open-bot>${t('hero_cta2')}</button>
        </div>
        <div class="hero-stats">
          <div><b>${B.db.products.length}</b><span>${B.lang === 'az' ? 'model' : 'моделей'}</span></div>
          <div><b>3–18</b><span>${B.lang === 'az' ? 'ay taksit' : 'мес рассрочка'}</span></div>
          <div><b>24/7</b><span>${B.lang === 'az' ? 'bot cavab verir' : 'бот на связи'}</span></div>
        </div>
      </div>
      <div class="hero-3d" id="stage">
        <div class="stage-fallback">${B.art('phone', '#e8e7e3')}</div>
        <div class="stage-ui">
          <div class="swatches" id="sw"></div>
          <div class="stage-hint">↔ ${t('drag')}</div>
        </div>
        <div class="stage-note">${t('view3d')}</div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-in">${Array(2).fill(
      ['iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'MacBook Air M3', 'Dyson V15', 'AirPods Pro 2', 'Apple Watch 10', 'iPad Air M2', 'Xiaomi 14T']
        .map((s) => `<span>${s}</span><i>✦</i>`).join('')).join('')}</div></div>

    <section class="wrap sec">
      ${head(t('cats_k'), t('cats_a'), t('cats_b'))}
      <div class="cats">${B.CATS.map((c, i) => `
        <a class="cat" href="#/c/${c.id}">
          <span class="cat-n">0${i + 1}</span>
          <span class="cat-art">${B.art(c.art, ['#d9d4cb', '#c9ccd1', '#a9b9cf', '#f2f2ef', '#e6d3c9', '#d6b24a'][i])}</span>
          <span class="cat-name">${t('cat_' + c.id)}</span>
          <span class="cat-cnt">${cnt(c.id)}</span>
        </a>`).join('')}</div>
    </section>

    <section class="wrap sec">
      ${head(t('hits_k'), t('hits_a'), t('hits_b'))}
      <div class="grid">${hits.map(card).join('')}</div>
    </section>

    <section class="wrap sec">
      <div class="taksit">
        <div>
          ${head(t('taksit_k'), t('taksit_a'), t('taksit_b'))}
          <p class="lead">${t('taksit_p')}</p>
        </div>
        <div class="calc" id="calc">
          <label class="calc-l">${B.lang === 'az' ? 'Məhsul' : 'Товар'}
            <select id="calc-p">${B.db.products.filter((p) => p.stock > 0).map((p) => `<option value="${p.id}">${p.name} — ${B.money(p.price)}</option>`).join('')}</select>
          </label>
          <div class="seg" id="calc-m">${[3, 6, 12, 18].map((m) => `<button data-m="${m}" class="${m === 12 ? 'on' : ''}">${m} ${t('months')}</button>`).join('')}</div>
          <div class="calc-out"><b id="calc-v"></b><span>${t('per_month')}</span></div>
          <small>${t('sample_calc')}</small>
        </div>
      </div>
    </section>

    <section class="wrap sec">
      ${head(t('sys_k'), t('sys_a'), t('sys_b'))}
      <div class="sys">
        ${[1, 2, 3].map((i) => `<div class="sys-i"><span class="sys-n">0${i}</span><h3>${t('sys_' + i)}</h3><p>${t('sys_' + i + 'p')}</p></div>`).join('')}
      </div>
      <div class="row center"><a class="btn" href="#/panel">${t('sys_cta')} →</a></div>
    </section>`;
  };
  B.after = B.after || {};
  B.after.home = () => {
    const sel = $('#calc-p'), out = $('#calc-v');
    let m = 12;
    const upd = () => { const p = B.product(sel.value); if (p) out.textContent = B.money(B.monthly(p.price, m)); };
    sel.onchange = upd;
    $('#calc-m').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      m = +b.dataset.m; [...$('#calc-m').children].forEach((x) => x.classList.toggle('on', x === b)); upd();
    };
    upd();
    B.mount3d && B.mount3d($('#stage'), $('#sw'));
  };

  // ---------- каталог ----------
  let sort = 'pop';
  const sorted = (list) => {
    const l = [...list];
    if (sort === 'low') l.sort((a, b) => a.price - b.price);
    if (sort === 'high') l.sort((a, b) => b.price - a.price);
    if (sort === 'pop') l.sort((a, b) => (b.hit - a.hit) || (b.stock > 0) - (a.stock > 0));
    return l;
  };
  const listing = (title, list, brands, catId) => `
    <section class="wrap sec page">
      <a class="back" href="#/">${t('back')}</a>
      <h1 class="h2">${title} <span class="mute">${list.length}</span></h1>
      <div class="toolbar">
        <div class="chips">${['', ...brands].map((b) => `<button class="chip ${B.brand === b ? 'on' : ''}" data-brand="${b}">${b || t('all')}</button>`).join('')}</div>
        <label class="sort">${t('sort')}
          <select id="sort">${['pop', 'low', 'high'].map((s) => `<option value="${s}" ${s === sort ? 'selected' : ''}>${t('sort_' + s)}</option>`).join('')}</select>
        </label>
      </div>
      <div class="grid">${sorted(list.filter((p) => !B.brand || p.brand === B.brand)).map(card).join('') || `<p class="lead">${t('no_results')}</p>`}</div>
      ${catId ? `<div class="cat-strip">${B.CATS.filter((c) => c.id !== catId).map((c) => `<a href="#/c/${c.id}">${t('cat_' + c.id)} →</a>`).join('')}</div>` : ''}
    </section>`;
  B.brand = '';
  B.views.c = (id) => {
    const list = B.db.products.filter((p) => p.cat === id);
    return listing(t('cat_' + id), list, [...new Set(list.map((p) => p.brand))], id);
  };
  B.views.s = (q) => {
    const s = decodeURIComponent(q || '').toLowerCase().trim();
    const list = B.findProducts(s);
    return listing(`${t('results')}: «${B.esc(s)}»`, list, [...new Set(list.map((p) => p.brand))]);
  };
  const listAfter = () => {
    view.querySelectorAll('[data-brand]').forEach((b) => (b.onclick = () => { B.brand = b.dataset.brand; B.render(); }));
    const s = $('#sort'); if (s) s.onchange = () => { sort = s.value; B.render(); };
  };
  B.after.c = listAfter; B.after.s = listAfter;

  // ---------- товар ----------
  const sel = { m: 0, c: 0, months: 12 };
  B.views.p = (id) => {
    const p = B.product(id);
    if (!p) return `<section class="wrap sec page"><p class="lead">${t('no_results')}</p></section>`;
    const price = p.price + (p.mem[sel.m] ? p.mem[sel.m].add : 0);
    return `
    <section class="wrap sec page">
      <a class="back" href="#/c/${p.cat}">${t('back')}</a>
      <div class="pdp">
        <div class="pdp-art">${B.artOf(p, sel.c)}</div>
        <div class="pdp-info">
          <div class="card-brand">${p.brand} · ${t('cat_' + p.cat)}</div>
          <h1 class="h2">${p.name}</h1>
          <div class="pdp-price"><b>${B.money(price)}</b>${p.old ? `<s>${B.money(p.old + (p.mem[sel.m] ? p.mem[sel.m].add : 0))}</s>` : ''} ${stockTag(p)}</div>
          ${p.mem.length ? `<div class="opt"><span>${t('memory')}</span><div class="seg" data-opt="m">${p.mem.map((m, i) => `<button data-i="${i}" class="${i === sel.m ? 'on' : ''}">${m.label}${m.add ? ` <small>+${m.add}</small>` : ''}</button>`).join('')}</div></div>` : ''}
          <div class="opt"><span>${t('color')}</span><div class="dots" data-opt="c">${p.colors.map((c, i) => `<button data-i="${i}" class="${i === sel.c ? 'on' : ''}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div></div>
          <div class="pdp-taksit">
            <div class="seg" data-opt="months">${[3, 6, 12, 18].map((m) => `<button data-i="${m}" class="${m === sel.months ? 'on' : ''}">${m} ${t('months')}</button>`).join('')}</div>
            <div class="calc-out"><b>${B.money(B.monthly(price, sel.months))}</b><span>${t('per_month')} · ${t('sample_calc')}</span></div>
          </div>
          <div class="row">
            ${p.stock > 0
              ? `<button class="btn" id="add">${t('buy')}</button><button class="btn ghost" id="tk">${t('taksit_buy')}</button>`
              : `<button class="btn ghost" id="tk">${t('notify')}</button>`}
          </div>
          <form class="form hide" id="tk-form">
            <input name="name" required placeholder="${t('name')}" autocomplete="off">
            <input name="phone" required placeholder="+994 __ ___ __ __" inputmode="tel" autocomplete="off">
            <button class="btn">${t('send')}</button>
          </form>
          <h3 class="h3">${t('specs')}</h3>
          <ul class="specs">${p.specs.map((s) => `<li>${s}</li>`).join('')}</ul>
        </div>
      </div>
    </section>`;
  };
  B.after.p = (id) => {
    const p = B.product(id); if (!p) return;
    view.querySelectorAll('[data-opt]').forEach((g) => (g.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      sel[g.dataset.opt] = +b.dataset.i; B.render();
    }));
    const add = $('#add');
    if (add) add.onclick = () => { B.cartAdd(p.id, sel.m, sel.c); B.toast(t('added') + ' · ' + p.name); };
    $('#tk').onclick = () => { $('#tk-form').classList.toggle('hide'); $('#tk-form input').focus(); };
    $('#tk-form').onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(e.target), mem = p.mem[sel.m];
      const o = B.addOrder({ name: f.get('name').trim(), phone: f.get('phone').trim(),
        items: [{ id: p.id, qty: 1, opt: mem ? mem.label : '', price: p.price + (mem ? mem.add : 0) }],
        pay: p.stock > 0 ? 'taksit' : 'cash', months: p.stock > 0 ? sel.months : 0, src: 'site' });
      location.hash = '#/ok/' + o.id;
    };
  };

  // ---------- корзина ----------
  B.views.cart = () => {
    const lines = B.cartLines(), total = lines.reduce((s, x) => s + x.price * x.qty, 0);
    if (!lines.length) return `<section class="wrap sec page"><h1 class="h2">${t('cart')}</h1><p class="lead">${t('empty_cart')}</p><a class="btn" href="#/c/phones">${t('hero_cta')}</a></section>`;
    return `
    <section class="wrap sec page">
      <h1 class="h2">${t('cart')} <span class="mute">${lines.length}</span></h1>
      <div class="cart">
        <div class="cart-lines">${lines.map((x, i) => `
          <div class="line">
            <div class="line-art">${B.artOf(x.p, x.c)}</div>
            <div class="line-txt"><b>${x.p.name}</b><span>${x.opt}</span></div>
            <div class="qty"><button data-q="${i}" data-d="-1">−</button><span>${x.qty}</span><button data-q="${i}" data-d="1">+</button></div>
            <b class="line-sum">${B.money(x.price * x.qty)}</b>
          </div>`).join('')}</div>
        <form class="cart-box form" id="co">
          <div class="cart-total"><span>${t('total')}</span><b>${B.money(total)}</b></div>
          <div class="seg" id="pay">${['cash', 'card', 'taksit'].map((k, i) => `<button type="button" data-pay="${k}" class="${i === 0 ? 'on' : ''}">${t('pay_' + k)}</button>`).join('')}</div>
          <input name="name" required placeholder="${t('name')}" autocomplete="off">
          <input name="phone" required placeholder="+994 __ ___ __ __" inputmode="tel" autocomplete="off">
          <button class="btn">${t('checkout')}</button>
          <small>${t('demo_note')}</small>
        </form>
      </div>
    </section>`;
  };
  B.after.cart = () => {
    view.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { const i = +b.dataset.q; B.cartSet(i, B.cart[i].qty + +b.dataset.d); B.render(); }));
    const co = $('#co'); if (!co) return;
    let pay = 'cash';
    $('#pay').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; pay = b.dataset.pay; [...$('#pay').children].forEach((x) => x.classList.toggle('on', x === b)); };
    co.onsubmit = (e) => {
      e.preventDefault();
      const f = new FormData(co);
      const o = B.addOrder({ name: f.get('name').trim(), phone: f.get('phone').trim(), pay, months: pay === 'taksit' ? 12 : 0, src: 'site',
        items: B.cartLines().map((x) => ({ id: x.id, qty: x.qty, opt: x.opt, price: x.price })) });
      B.cartClear();
      location.hash = '#/ok/' + o.id;
    };
  };

  // ---------- заказ принят и статус ----------
  const STEPS = ['new', 'confirmed', 'delivery', 'done'];
  const timeline = (o) => {
    if (o.status === 'cancel') return `<div class="tl"><div class="tl-i on cancel"><i></i><span>${t('st_cancel')}</span></div></div>`;
    const k = STEPS.indexOf(o.status);
    return `<div class="tl">${STEPS.map((s, i) => `<div class="tl-i ${i <= k ? 'on' : ''} ${i === k ? 'now' : ''}"><i></i><span>${t('st_' + s)}</span></div>`).join('')}</div>`;
  };
  B.timeline = timeline;
  const orderBox = (o) => `
    <div class="order-box">
      <div class="order-head"><span class="mono">${o.id}</span><span>${B.ago(o.t)}</span></div>
      ${timeline(o)}
      <ul class="specs">${o.items.map((x) => { const p = B.product(x.id); return `<li>${p ? p.name : x.id} ${x.opt} × ${x.qty}</li>`; }).join('')}</ul>
      <div class="cart-total"><span>${t('total')} · ${t('pay_' + o.pay)}${o.months ? ` ${o.months} ${t('months')}` : ''}</span><b>${B.money(o.total)}</b></div>
    </div>`;
  B.views.ok = (id) => {
    const o = B.order(id);
    if (!o) return `<section class="wrap sec page"><p class="lead">${t('not_found')}</p></section>`;
    const link = location.href.split('#')[0] + '#/track/' + o.id;
    return `<section class="wrap sec page narrow">
      <div class="kicker">✓ ${o.id}</div>
      <h1 class="h2">${t('order_ok')}</h1>
      <p class="lead">${t('order_ok_p')}</p>
      <a class="link-box mono" href="#/track/${o.id}">${B.esc(link)}</a>
      ${orderBox(o)}
      <p class="hint">${B.lang === 'az' ? 'Paneli başqa tabda açın — bu sifariş orada artıq görünür:' : 'Откройте панель в другой вкладке — этот заказ уже там:'} <a href="#/panel" target="_blank">${t('panel')} ↗</a></p>
    </section>`;
  };
  B.views.track = (id) => {
    const o = B.order(id);
    return `<section class="wrap sec page narrow">
      <div class="kicker">${t('track_k')}</div>
      <h1 class="h2">${t('track')} <span class="mute">${B.esc(id || '')}</span></h1>
      ${o ? orderBox(o) : `<p class="lead">${t('not_found')}</p>`}
    </section>`;
  };

  // ---------- роутер и оболочка ----------
  B.route = () => {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const name = parts[0] || 'home';
    return { name: B.views[name] ? name : 'home', arg: parts[1] };
  };
  let last = '';
  B.render = () => {
    const r = B.route(), key = r.name + '/' + r.arg;
    if (key !== last) { sel.m = 0; sel.c = 0; if (r.name !== 'c' && r.name !== 's') B.brand = ''; }
    const keep = key === last ? scrollY : 0;
    if (B.unmount3d) B.unmount3d();
    last = key;
    document.body.classList.toggle('is-panel', r.name === 'panel');
    view.innerHTML = B.views[r.name](r.arg);
    (B.after[r.name] || (() => {}))(r.arg);
    scrollTo({ top: keep, behavior: 'instant' });
    shell();
  };

  const shell = () => {
    const n = B.cart.reduce((s, x) => s + x.qty, 0);
    $('#cart-n').textContent = n; $('#cart-n').hidden = !n;
    document.querySelectorAll('[data-t]').forEach((el) => (el.textContent = t(el.dataset.t)));
    document.querySelectorAll('[data-tp]').forEach((el) => (el.placeholder = t(el.dataset.tp)));
    document.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('on', b.dataset.lang === B.lang));
    $('#nav').innerHTML = B.CATS.map((c) => `<a href="#/c/${c.id}" class="${location.hash === '#/c/' + c.id ? 'on' : ''}">${t('cat_' + c.id)}</a>`).join('');
  };
  B.shell = shell;

  B.toast = (msg) => {
    const el = document.createElement('div');
    el.className = 'toast'; el.innerHTML = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.classList.add('out'), 3200);
    setTimeout(() => el.remove(), 3700);
  };

  // ---------- события ----------
  addEventListener('hashchange', B.render);
  document.addEventListener('click', (e) => {
    const l = e.target.closest('[data-lang]');
    if (l) { B.setLang(l.dataset.lang); B.render(); B.bot && B.bot.relang(); }
  });
  // ---------- поиск с подсказками: «iph» уже показывает айфоны ----------
  const sq = (s) => s.toLowerCase().replace(/[\s\-_.]+/g, '');
  // как люди пишут названия по-русски и по-азербайджански
  const SYN = [['iphone', 'айфон|ayfon|aifon'], ['apple', 'эпл|эппл'], ['samsung', 'самсунг|samsunq'], ['galaxy', 'галакси'],
    ['xiaomi', 'сяоми|ксиаоми|ksiaomi'], ['macbook', 'макбук|makbuk'], ['ipad', 'айпад|aypad'], ['airpods', 'эйрподс|аирподс|qulaqciq|наушники'],
    ['watch', 'часы|saat'], ['dyson', 'дайсон|dayson'], ['buds', 'наушники|qulaqciq']];
  B.findProducts = (q) => {
    const words = q.toLowerCase().split(/\s+/).map(sq).filter(Boolean);
    if (!words.length) return [];
    return B.db.products
      .map((p) => {
        const name = sq(p.brand + p.name);
        const hay = name + '|' + p.alias.map(sq).join('|') + '|' + sq(t('cat_' + p.cat)) + '|' + SYN.filter(([k]) => name.includes(k)).map(([, v]) => v).join('|');
        if (!words.every((w) => hay.includes(w))) return null;
        const score = (sq(p.name).startsWith(words[0]) ? 0 : name.includes(words[0]) ? 1 : 2) + (p.stock > 0 ? 0 : 0.5) - (p.hit ? 0.2 : 0);
        return { p, score };
      })
      .filter(Boolean).sort((a, b) => a.score - b.score).map((x) => x.p);
  };
  const form = $('#search'), sInput = $('#search input');
  const drop = document.createElement('div');
  drop.className = 'suggest'; drop.hidden = true; drop.setAttribute('role', 'listbox');
  form.appendChild(drop);
  let act = -1;
  const showSuggest = () => {
    const q = sInput.value.trim();
    const list = q ? B.findProducts(q).slice(0, 6) : [];
    act = -1;
    if (!q) { drop.hidden = true; return; }
    drop.innerHTML = list.length
      ? list.map((p) => `<a href="#/p/${p.id}" role="option"><i class="mini">${B.artOf(p)}</i><span><b>${p.name}</b><small>${t('cat_' + p.cat)} · ${p.stock > 0 ? t('in_stock') : t('out_stock')}</small></span><em>${B.money(p.price)}</em></a>`).join('')
        + `<button type="submit" class="suggest-all">${t('results')}: «${B.esc(q)}» →</button>`
      : `<div class="suggest-none">${t('no_results')}</div>`;
    drop.hidden = false;
  };
  const closeSuggest = () => { drop.hidden = true; act = -1; };
  sInput.addEventListener('input', showSuggest);
  sInput.addEventListener('focus', () => sInput.value.trim() && showSuggest());
  sInput.addEventListener('keydown', (e) => {
    const items = [...drop.querySelectorAll('a')];
    if (e.key === 'Escape') return closeSuggest();
    if (!items.length || drop.hidden || !/Arrow(Down|Up)/.test(e.key)) return;
    e.preventDefault();
    act = (act + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach((a, i) => a.classList.toggle('on', i === act));
  });
  document.addEventListener('pointerdown', (e) => { if (!form.contains(e.target)) closeSuggest(); });
  drop.addEventListener('click', (e) => { if (e.target.closest('a')) { closeSuggest(); sInput.value = ''; sInput.blur(); } });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = [...drop.querySelectorAll('a')];
    if (act >= 0 && items[act]) { location.hash = items[act].getAttribute('href'); sInput.value = ''; closeSuggest(); return; }
    const q = sInput.value.trim();
    closeSuggest();
    if (q) location.hash = '#/s/' + encodeURIComponent(q);
  });
  B.on((what) => {
    if (what === 'cart') return shell();
    const r = B.route();
    if (r.name === 'panel') return B.panelRefresh && B.panelRefresh(what);
    // витрина: цены и наличие обновляются, если панель открыта в другой вкладке
    if (what === 'sync' || what === 'reset') {
      const active = document.activeElement;
      if (active && /INPUT|SELECT|TEXTAREA/.test(active.tagName) && view.contains(active)) return;
      B.render();
    }
  });
  B.on((what, d) => { if (what === 'sync' && d.fresh.length && B.route().name === 'panel') d.fresh.forEach((o) => B.toast(`🛎 ${o.id} · ${B.esc(o.name)} · ${B.money(o.total)}`)); });
})();
