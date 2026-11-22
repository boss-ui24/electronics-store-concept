/* Демо-панель владельца: заказы со статусами, товары (цена и наличие меняются сразу на сайте и в боте),
   статистика за сегодня. Без пароля и сервера — в настоящей версии вход по паролю и база на сервере. */
(() => {
  const B = window.BOSS, t = B.t, $ = (s, r = document) => r.querySelector(s);
  let tab = 'orders', filter = 'all';
  const L = (az, ru) => (B.lang === 'az' ? az : ru);
  const STATUSES = ['new', 'confirmed', 'delivery', 'done', 'cancel'];

  const kpis = () => {
    const day = Date.now() - 864e5;
    const today = B.db.orders.filter((o) => o.t > day && o.status !== 'cancel');
    const qs = B.db.log.filter((l) => l.t > day);
    const auto = qs.filter((l) => l.auto).length;
    return `<div class="kpis">
      <div class="kpi"><span>${L('Bu gün sifariş', 'Заказов за сутки')}</span><b>${today.length}</b></div>
      <div class="kpi"><span>${L('Məbləğ', 'Сумма')}</span><b>${B.money(today.reduce((s, o) => s + o.total, 0))}</b></div>
      <div class="kpi"><span>${L('Yeni, cavabsız', 'Новые, без ответа')}</span><b class="${B.db.orders.some((o) => o.status === 'new') ? 'warn' : ''}">${B.db.orders.filter((o) => o.status === 'new').length}</b></div>
      <div class="kpi"><span>${L('Bot özü cavab verdi', 'Бот ответил сам')}</span><b>${auto}<small> / ${qs.length}</small></b></div>
    </div>`;
  };

  const orders = () => {
    const list = B.db.orders.filter((o) => filter === 'all' || o.status === filter);
    return `
      <div class="toolbar">
        <div class="chips">${['all', ...STATUSES].map((s) => `<button class="chip ${filter === s ? 'on' : ''}" data-f="${s}">${s === 'all' ? t('all') : t('st_' + s)} <small>${s === 'all' ? B.db.orders.length : B.db.orders.filter((o) => o.status === s).length}</small></button>`).join('')}</div>
      </div>
      <div class="tbl orders">
        <div class="tr th"><span>№</span><span>${L('Müştəri', 'Клиент')}</span><span>${L('Məhsul', 'Товар')}</span><span>${L('Məbləğ', 'Сумма')}</span><span>${L('Mənbə', 'Источник')}</span><span>Status</span></div>
        ${list.map((o) => `
        <div class="tr ${o.status === 'new' ? 'is-new' : ''}" data-id="${o.id}">
          <span><b class="mono">${o.id}</b><small>${B.ago(o.t)}</small></span>
          <span><b>${B.esc(o.name)}</b><small class="mono">${B.esc(o.phone)}</small></span>
          <span>${o.items.map((x) => { const p = B.product(x.id); return `${p ? p.name : x.id}${x.opt ? ' · ' + x.opt : ''}${x.qty > 1 ? ' × ' + x.qty : ''}`; }).join('<br>')}</span>
          <span><b>${B.money(o.total)}</b><small>${t('pay_' + o.pay)}${o.months ? ' · ' + o.months + ' ' + t('months') : ''}</small></span>
          <span><i class="src src-${o.src}">${t('src_' + o.src)}</i></span>
          <span><select class="st st-${o.status}" data-st="${o.id}">${STATUSES.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${t('st_' + s)}</option>`).join('')}</select></span>
        </div>`).join('') || `<p class="lead pad">${t('no_results')}</p>`}
      </div>
      <p class="hint">${L('Statusu dəyişin — müştəri öz linkində dərhal görür.', 'Поменяйте статус — клиент сразу увидит его по своей ссылке.')}</p>`;
  };

  const products = () => `
    <p class="hint top">${L('Qiyməti dəyişin və sayta keçin — yeni qiymət saytda və botun cavabında artıq var.', 'Измените цену и откройте сайт — новая цена уже на витрине и в ответах бота.')}</p>
    <div class="tbl prods">
      <div class="tr th"><span>${L('Məhsul', 'Товар')}</span><span>${L('Qiymət, ₼', 'Цена, ₼')}</span><span>${L('Stok', 'Наличие')}</span><span>${L('Hit', 'Хит')}</span><span></span></div>
      ${B.db.products.map((p) => `
      <div class="tr">
        <span class="pcell"><i class="mini">${B.artOf(p)}</i><span><b>${p.name}</b><small>${t('cat_' + p.cat)}</small></span></span>
        <span><input type="number" min="0" step="10" value="${p.price}" data-price="${p.id}" class="num"></span>
        <span><input type="number" min="0" step="1" value="${p.stock}" data-stock="${p.id}" class="num ${p.stock ? '' : 'zero'}"></span>
        <span><label class="sw"><input type="checkbox" data-hit="${p.id}" ${p.hit ? 'checked' : ''}><i></i></label></span>
        <span><a href="#/p/${p.id}" target="_blank" class="ext">${L('Saytda', 'На сайте')} ↗</a></span>
      </div>`).join('')}
    </div>`;

  const bars = (rows) => {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return `<div class="bars">${rows.map(([label, v]) => `<div class="bar"><span>${label}</span><i style="--w:${(v / max) * 100}%"></i><b>${v}</b></div>`).join('')}</div>`;
  };
  const stats = () => {
    const log = B.db.log, byP = {}, byI = {}, bySrc = {};
    log.forEach((l) => { if (l.pid) byP[l.pid] = (byP[l.pid] || 0) + 1; byI[l.intent] = (byI[l.intent] || 0) + 1; });
    B.db.orders.forEach((o) => (bySrc[o.src] = (bySrc[o.src] || 0) + 1));
    const IN = { price: L('Qiymət', 'Цена'), stock: L('Stok', 'Наличие'), taksit: L('Taksit', 'Рассрочка'), delivery: L('Çatdırılma', 'Доставка'), track: L('Sifariş statusu', 'Статус заказа'), warranty: L('Zəmanət', 'Гарантия'), lead: L('Müraciət', 'Заявка'), other: L('Menecerə ötürüldü', 'Передано менеджеру') };
    const auto = log.filter((l) => l.auto).length;
    const mins = Math.round(auto * 1.5);
    return `
      <div class="stats">
        <div class="box"><h3 class="h3">${L('Botdan ən çox soruşulan modellər', 'О каких моделях чаще спрашивают бота')}</h3>
          ${bars(Object.entries(byP).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, v]) => [B.product(id) ? B.product(id).name : id, v]))}</div>
        <div class="box"><h3 class="h3">${L('Suallar mövzuya görə', 'Вопросы по темам')}</h3>
          ${bars(Object.entries(byI).sort((a, b) => b[1] - a[1]).map(([k, v]) => [IN[k] || k, v]))}</div>
        <div class="box"><h3 class="h3">${L('Sifarişlər haradan gəlir', 'Откуда приходят заказы')}</h3>
          ${bars(Object.entries(bySrc).sort((a, b) => b[1] - a[1]).map(([k, v]) => [t('src_' + k), v]))}</div>
        <div class="box accent"><h3 class="h3">${L('Menecerin vaxtı', 'Время менеджера')}</h3>
          <div class="big">≈ ${mins} ${L('dəq', 'мин')}</div>
          <p>${L(`Bot ${auto} suala özü cavab verdi. Hər cavab menecerə orta hesabla 1,5 dəqiqəyə başa gəlir.`, `Бот сам ответил на ${auto} вопросов. Каждый такой ответ — в среднем 1,5 минуты менеджера.`)}</p></div>
      </div>
      <div class="box"><h3 class="h3">${L('Son suallar', 'Последние вопросы')}</h3>
        <div class="qlog">${log.slice(0, 12).map((l) => `<div><span class="mono">${B.ago(l.t)}</span><span>${B.esc(l.q)}</span><i class="${l.auto ? 'ok' : 'hum'}">${l.auto ? L('bot', 'бот') : L('menecer', 'менеджер')}</i></div>`).join('')}</div></div>`;
  };

  const body = () => (tab === 'orders' ? orders() : tab === 'products' ? products() : stats());

  B.views.panel = () => `
    <section class="panel">
      <aside class="side">
        <div class="side-logo">BOSS<span>panel</span></div>
        ${[['orders', L('Sifarişlər', 'Заказы')], ['products', L('Məhsullar', 'Товары')], ['stats', L('Statistika', 'Статистика')]]
          .map(([k, n]) => `<button class="side-i ${tab === k ? 'on' : ''}" data-tab="${k}">${n}${k === 'orders' ? `<em id="new-n">${B.db.orders.filter((o) => o.status === 'new').length || ''}</em>` : ''}</button>`).join('')}
        <a class="side-i" href="#/">← ${t('shop')}</a>
        <button class="side-reset" id="reset">${L('Demonu sıfırla', 'Сбросить демо')}</button>
      </aside>
      <div class="panel-main">
        <div class="panel-top">
          <div><div class="kicker">${L('Menecer paneli · demo', 'Панель менеджера · демо')}</div>
          <h1 class="h2">${tab === 'orders' ? L('Sifarişlər', 'Заказы') : tab === 'products' ? L('Məhsullar', 'Товары') : L('Statistika', 'Статистика')}</h1></div>
          <span class="live"><i></i>${L('Canlı', 'Онлайн')}</span>
        </div>
        ${kpis()}
        <div id="pbody">${body()}</div>
        <p class="hint">${t('demo_note')}. ${L('Real versiyada giriş şifrə ilədir.', 'В настоящей версии вход по паролю.')}</p>
      </div>
    </section>`;

  B.after.panel = () => {
    const v = $('#view');
    v.onclick = (e) => {
      const tb = e.target.closest('[data-tab]'); if (tb) { tab = tb.dataset.tab; return B.render(); }
      const f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f; return B.render(); }
      if (e.target.closest('#reset')) { B.reset(); B.toast(L('Demo sıfırlandı', 'Демо сброшено')); }
    };
    v.onchange = (e) => {
      const el = e.target;
      if (el.dataset.st) { B.setStatus(el.dataset.st, el.value); B.toast(`${el.dataset.st} → ${t('st_' + el.value)}`); }
      if (el.dataset.price) { B.setProduct(el.dataset.price, { price: Math.max(0, +el.value || 0) }); B.toast(`${B.product(el.dataset.price).name}: ${B.money(+el.value)} ✓ ${L('saytda və botda', 'на сайте и в боте')}`); }
      if (el.dataset.stock) { B.setProduct(el.dataset.stock, { stock: Math.max(0, +el.value || 0) }); el.classList.toggle('zero', !+el.value); }
      if (el.dataset.hit) B.setProduct(el.dataset.hit, { hit: el.checked });
    };
  };

  // Обновление без потери фокуса: пока менеджер печатает цену, таблицу не перерисовываем.
  B.panelRefresh = (what) => {
    if (what === 'product') return;
    const a = document.activeElement;
    if (a && a.matches('input.num') && what !== 'reset') return;
    const y = scrollY;
    B.render();
    scrollTo({ top: y, behavior: 'instant' });
  };
  B.on((what, d) => {
    if (B.route().name !== 'panel') return;
    if (what === 'order') B.toast(`🛎 ${L('Yeni sifariş', 'Новый заказ')} ${d.id} · ${B.money(d.total)}`);
  });
})();
