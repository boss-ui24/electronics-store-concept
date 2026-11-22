/* Демо-данные концепта: товары, заказы, вопросы боту. Всё выдумано, цены примерные.
   Заказы и журнал бота строятся относительно текущего времени, чтобы «сегодня» всегда было заполнено. */
(() => {
  const B = (window.BOSS = window.BOSS || {});

  B.CATS = [
    { id: 'phones', art: 'phone' },
    { id: 'laptops', art: 'laptop' },
    { id: 'tablets', art: 'tablet' },
    { id: 'audio', art: 'buds' },
    { id: 'watches', art: 'watch' },
    { id: 'home', art: 'vacuum' },
  ];

  const P = (id, cat, brand, name, price, stock, colors, extra = {}) =>
    ({ id, cat, brand, name, price, stock, colors, mem: [], hit: false, old: 0, specs: [], alias: [], ...extra });
  const MEM = (...a) => a.map(([label, add]) => ({ label, add }));

  B.SEED_PRODUCTS = [
    P('ip16pm', 'phones', 'Apple', 'iPhone 16 Pro Max', 2799, 7, ['#d9d4cb', '#3a3a3c', '#c9b29b', '#f2f1ed'],
      { mem: MEM(['256 GB', 0], ['512 GB', 450], ['1 TB', 900]), hit: true, old: 2949, alias: ['16 pro max', '16promax', 'pro max'],
        specs: ['6.9″ Super Retina XDR', 'A18 Pro', '48 MP · 5× zoom', '4685 mAh'] }),
    P('ip16p', 'phones', 'Apple', 'iPhone 16 Pro', 2399, 4, ['#d9d4cb', '#3a3a3c', '#c9b29b'],
      { mem: MEM(['128 GB', 0], ['256 GB', 250], ['512 GB', 700]), hit: true, alias: ['16 pro', '16pro'],
        specs: ['6.3″ Super Retina XDR', 'A18 Pro', '48 MP · 5× zoom', '3582 mAh'] }),
    P('ip16', 'phones', 'Apple', 'iPhone 16', 1849, 12, ['#9fb4c9', '#e9b8c4', '#2b2b2d', '#e9e9e4'],
      { mem: MEM(['128 GB', 0], ['256 GB', 250]), alias: ['iphone 16', 'айфон 16', 'ayfon 16'],
        specs: ['6.1″ OLED', 'A18', '48 MP', 'Camera Control'] }),
    P('ip15', 'phones', 'Apple', 'iPhone 15', 1499, 0, ['#e7c9cf', '#2b2b2d', '#dfe6c8'],
      { mem: MEM(['128 GB', 0], ['256 GB', 230]), old: 1649, alias: ['iphone 15', 'айфон 15', 'ayfon 15'],
        specs: ['6.1″ OLED', 'A16 Bionic', '48 MP', 'USB-C'] }),
    P('s24u', 'phones', 'Samsung', 'Galaxy S24 Ultra', 2299, 5, ['#4b4a48', '#d7cdbf', '#7b8aa0'],
      { mem: MEM(['256 GB', 0], ['512 GB', 380]), hit: true, alias: ['s24 ultra', 's24ultra', 'ultra'],
        specs: ['6.8″ QHD+ 120 Hz', 'Snapdragon 8 Gen 3', '200 MP', 'S Pen'] }),
    P('s24', 'phones', 'Samsung', 'Galaxy S24', 1499, 9, ['#2c2c2e', '#c7b9e0', '#e8d99a'],
      { mem: MEM(['128 GB', 0], ['256 GB', 160]), alias: ['s24'],
        specs: ['6.2″ FHD+ 120 Hz', 'Exynos 2400', '50 MP', '4000 mAh'] }),
    P('a55', 'phones', 'Samsung', 'Galaxy A55', 749, 21, ['#1f2a44', '#b7c7e6', '#d8e7c4'],
      { mem: MEM(['128 GB', 0], ['256 GB', 90]), alias: ['a55'],
        specs: ['6.6″ Super AMOLED', 'Exynos 1480', '50 MP', '5000 mAh'] }),
    P('x14t', 'phones', 'Xiaomi', 'Xiaomi 14T', 1099, 6, ['#2f3a4a', '#a9b6c5', '#2b2b2d'],
      { mem: MEM(['256 GB', 0], ['512 GB', 150]), alias: ['14t', 'xiaomi', 'сяоми', 'ksiaomi'],
        specs: ['6.67″ AMOLED 144 Hz', 'Dimensity 8300', '50 MP Leica', '5000 mAh'] }),
    P('mba13', 'laptops', 'Apple', 'MacBook Air 13 M3', 2199, 3, ['#c9ccd1', '#2e3440', '#e6dccb'],
      { mem: MEM(['8/256 GB', 0], ['16/512 GB', 700]), hit: true, alias: ['macbook air', 'air m3', 'макбук'],
        specs: ['13.6″ Liquid Retina', 'Apple M3', '18 saat batareya', '1.24 kg'] }),
    P('mbp14', 'laptops', 'Apple', 'MacBook Pro 14 M4', 3399, 2, ['#3a3b3e', '#c9ccd1'],
      { mem: MEM(['16/512 GB', 0], ['24/1 TB', 900]), alias: ['macbook pro', 'mbp'],
        specs: ['14.2″ XDR', 'Apple M4', '24 saat batareya', 'Thunderbolt 4'] }),
    P('ipadair', 'tablets', 'Apple', 'iPad Air 11 M2', 1349, 8, ['#a9b9cf', '#cbbfe0', '#3a3a3c'],
      { mem: MEM(['128 GB', 0], ['256 GB', 220]), alias: ['ipad air', 'айпад'],
        specs: ['11″ Liquid Retina', 'Apple M2', 'Apple Pencil Pro', 'Wi-Fi 6E'] }),
    P('ipad10', 'tablets', 'Apple', 'iPad 10.9', 799, 14, ['#9fc0e6', '#e7b8c6', '#e9e9e4'],
      { mem: MEM(['64 GB', 0], ['256 GB', 260]), alias: ['ipad'],
        specs: ['10.9″ Liquid Retina', 'A14 Bionic', '12 MP', 'USB-C'] }),
    P('app2', 'audio', 'Apple', 'AirPods Pro 2', 499, 30, ['#f2f2ef'],
      { hit: true, old: 559, alias: ['airpods', 'эйрподс', 'qulaqcıq', 'qulaqciq', 'наушник'],
        specs: ['Aktiv səs-küy azaltma', 'USB-C', '30 saat', 'IP54'] }),
    P('buds3', 'audio', 'Samsung', 'Galaxy Buds3 Pro', 389, 11, ['#d9d9d6', '#4a4b4d'],
      { alias: ['buds'], specs: ['ANC', '24-bit Hi-Fi', '30 saat', 'IP57'] }),
    P('aw10', 'watches', 'Apple', 'Apple Watch Series 10', 899, 6, ['#2b2b2d', '#e6d3c9', '#cfd2d6'],
      { mem: MEM(['42 mm', 0], ['46 mm', 70]), alias: ['apple watch', 'watch 10', 'saat'],
        specs: ['Always-On OLED', 'S10 SiP', 'EKQ', 'Yuxu apnoesi'] }),
    P('gw7', 'watches', 'Samsung', 'Galaxy Watch7', 549, 9, ['#2b2b2d', '#d9d2c3'],
      { mem: MEM(['40 mm', 0], ['44 mm', 50]), alias: ['galaxy watch'], specs: ['Super AMOLED', 'Exynos W1000', 'BIA', '5ATM'] }),
    P('dv15', 'home', 'Dyson', 'Dyson V15 Detect', 1399, 4, ['#d6b24a', '#8a6fb8'],
      { hit: true, alias: ['v15', 'dyson', 'дайсон', 'tozsoran', 'пылесос'], specs: ['Lazer işıqlandırma', '240 AW', '60 dəq', 'LCD ekran'] }),
    P('dair', 'home', 'Dyson', 'Dyson Airwrap', 1199, 0, ['#9c2f55', '#c7a98b'],
      { alias: ['airwrap', 'fen', 'фен', 'стайлер'], specs: ['Coanda effekti', '6 başlıq', '3 sürət', '4 temperatur'] }),
  ];

  // Заказы: [минут назад, имя, телефон, [[id, кол-во, память]], оплата, месяцев, статус, источник]
  const ORD = [
    [6, 'Elvin M.', '+994 50 *** ** 14', [['ip16pm', 1, 1]], 'taksit', 12, 'new', 'bot'],
    [19, 'Нигяр А.', '+994 55 *** ** 82', [['app2', 1, 0]], 'card', 0, 'new', 'site'],
    [47, 'Rəşad Q.', '+994 70 *** ** 05', [['s24u', 1, 0], ['buds3', 1, 0]], 'taksit', 18, 'confirmed', 'instagram'],
    [95, 'Aysel H.', '+994 51 *** ** 63', [['dv15', 1, 0]], 'cash', 0, 'delivery', 'site'],
    [160, 'Tural İ.', '+994 50 *** ** 37', [['mba13', 1, 1]], 'taksit', 12, 'confirmed', 'bot'],
    [240, 'Камран Г.', '+994 55 *** ** 90', [['ip16', 2, 0]], 'cash', 0, 'delivery', 'instagram'],
    [380, 'Leyla R.', '+994 77 *** ** 21', [['aw10', 1, 1]], 'card', 0, 'done', 'site'],
    [610, 'Orxan S.', '+994 50 *** ** 48', [['ip16p', 1, 1]], 'taksit', 6, 'done', 'bot'],
    [890, 'Səbinə K.', '+994 55 *** ** 76', [['a55', 1, 0]], 'cash', 0, 'cancel', 'instagram'],
  ];

  // Вопросы боту: [минут назад, текст, намерение, товар, ответил ли бот сам]
  const LOG = [
    [3, 'iPhone 16 Pro Max neçəyədir?', 'price', 'ip16pm', 1],
    [8, '16 pro max 512 var?', 'stock', 'ip16pm', 1],
    [12, 'Сколько стоит S24 Ultra?', 'price', 's24u', 1],
    [15, 'taksit neçə aylıqdır?', 'taksit', '', 1],
    [22, 'airpods pro qiymət', 'price', 'app2', 1],
    [30, 'Dyson Airwrap var?', 'stock', 'dair', 1],
    [41, 'Есть рассрочка на макбук?', 'taksit', 'mba13', 1],
    [55, 'iphone 16 pro qiymeti', 'price', 'ip16p', 1],
    [63, 'Gəncəyə çatdırılma var?', 'delivery', '', 1],
    [70, 'köhnə telefonu dəyişmək olar?', 'other', '', 0],
    [84, '16 pro max taksitlə', 'taksit', 'ip16pm', 1],
    [99, 'Xiaomi 14T neçəyə?', 'price', 'x14t', 1],
    [120, 'Сколько iPhone 15?', 'price', 'ip15', 1],
    [150, 'zəmanət neçə ildir?', 'other', '', 0],
    [175, 's24 ultra taksit', 'taksit', 's24u', 1],
    [200, 'iPhone 16 Pro Max qiymət', 'price', 'ip16pm', 1],
  ];

  B.seed = () => {
    const now = Date.now(), min = 60000;
    const products = JSON.parse(JSON.stringify(B.SEED_PRODUCTS));
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    const orders = ORD.map(([ago, name, phone, items, pay, months, status, src], i) => {
      const its = items.map(([id, qty, m]) => {
        const p = byId[id], mem = p.mem[m];
        return { id, qty, opt: mem ? mem.label : '', price: p.price + (mem ? mem.add : 0) };
      });
      return { id: 'B-' + (1050 - i), t: now - ago * min, name, phone, items: its,
        total: its.reduce((s, x) => s + x.price * x.qty, 0), pay, months, status, src };
    });
    const log = LOG.map(([ago, q, intent, pid, auto]) => ({ t: now - ago * min, q, intent, pid, auto: !!auto }));
    return { v: 1, products, orders, log, next: 1051 };
  };
})();
