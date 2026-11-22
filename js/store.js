/* Хранилище демо: одно состояние на браузер (localStorage), общее для витрины, бота и панели.
   Изменения из другой вкладки приходят через событие storage — панель и сайт обновляются вживую. */
(() => {
  const B = window.BOSS;
  const KEY = 'boss-demo-v1';
  const subs = new Set();

  const read = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.v === 1 ? s : null; } catch { return null; } };
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(B.db)); } catch { /* приватный режим — живём в памяти */ } };

  B.db = read() || B.seed();
  write();

  const emit = (what, data) => subs.forEach((fn) => fn(what, data));
  B.on = (fn) => { subs.add(fn); return () => subs.delete(fn); };

  addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const prev = B.db, next = read();
    if (!next) return;
    B.db = next;
    const fresh = next.orders.filter((o) => !prev.orders.some((p) => p.id === o.id));
    emit('sync', { fresh });
  });

  B.product = (id) => B.db.products.find((p) => p.id === id);
  B.order = (id) => B.db.orders.find((o) => o.id.toLowerCase() === String(id).toLowerCase());

  B.setProduct = (id, patch) => {
    const p = B.product(id);
    if (!p) return;
    Object.assign(p, patch);
    write();
    emit('product', p);
  };

  B.addOrder = ({ name, phone, items, pay = 'cash', months = 0, src = 'site' }) => {
    const o = { id: 'B-' + B.db.next++, t: Date.now(), name, phone, items, total: items.reduce((s, x) => s + x.price * x.qty, 0), pay, months, status: 'new', src };
    B.db.orders.unshift(o);
    write();
    emit('order', o);
    return o;
  };

  B.setStatus = (id, status) => {
    const o = B.order(id);
    if (!o) return;
    o.status = status;
    write();
    emit('status', o);
  };

  B.logQ = (entry) => {
    B.db.log.unshift({ t: Date.now(), ...entry });
    B.db.log.length = Math.min(B.db.log.length, 300);
    write();
    emit('log', entry);
  };

  B.reset = () => { B.db = B.seed(); write(); emit('reset'); };

  // ---------- корзина (своя для посетителя, отдельно от базы) ----------
  const CK = 'boss-cart-v1';
  B.cart = (() => { try { return JSON.parse(localStorage.getItem(CK)) || []; } catch { return []; } })();
  const saveCart = () => { try { localStorage.setItem(CK, JSON.stringify(B.cart)); } catch { /* ок */ } emit('cart'); };
  B.cartAdd = (id, m = 0, c = 0) => {
    const ex = B.cart.find((x) => x.id === id && x.m === m && x.c === c);
    if (ex) ex.qty++; else B.cart.push({ id, m, c, qty: 1 });
    saveCart();
  };
  B.cartSet = (i, qty) => { if (qty <= 0) B.cart.splice(i, 1); else B.cart[i].qty = qty; saveCart(); };
  B.cartClear = () => { B.cart = []; saveCart(); };
  B.cartLines = () => B.cart.map((x) => {
    const p = B.product(x.id);
    if (!p) return null;
    const mem = p.mem[x.m];
    return { ...x, p, opt: mem ? mem.label : '', price: p.price + (mem ? mem.add : 0) };
  }).filter(Boolean);

  // ---------- формат ----------
  B.money = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₼';
  B.monthly = (total, months) => Math.ceil(total / months);
  B.ago = (t) => {
    const m = Math.max(0, Math.round((Date.now() - t) / 60000)), az = B.lang === 'az';
    if (m < 1) return az ? 'indicə' : 'только что';
    if (m < 60) return az ? `${m} dəq əvvəl` : `${m} мин назад`;
    const h = Math.round(m / 60);
    if (h < 24) return az ? `${h} saat əvvəl` : `${h} ч назад`;
    const d = Math.round(h / 24);
    return az ? `${d} gün əvvəl` : `${d} дн назад`;
  };
  B.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
})();
