const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'gulrez.db'));

// WAL mode for better performance
db.pragma('journal_mode = WAL');

// ─── CREATE TABLES ───
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    login    TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role     TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sort_order  INTEGER DEFAULT 0,
    name        TEXT NOT NULL,
    description TEXT DEFAULT '',
    composition TEXT DEFAULT '',
    size        TEXT DEFAULT '',
    color       TEXT DEFAULT '',
    price       REAL NOT NULL DEFAULT 0,
    currency    TEXT DEFAULT 'TJS',
    discount    INTEGER DEFAULT 0,
    status      INTEGER DEFAULT 1,
    tag         TEXT DEFAULT '',
    tag_bg      TEXT DEFAULT 'var(--rose)',
    image1      TEXT DEFAULT '',
    image2      TEXT DEFAULT '',
    image3      TEXT DEFAULT '',
    likes       INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ─── CHAT SYSTEM TABLES (must be before migrations & seeding) ───
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id         TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_msg   DATETIME DEFAULT CURRENT_TIMESTAMP,
    unread     INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS chat_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    dir        TEXT NOT NULL CHECK(dir IN ('in','out')),
    text       TEXT,
    photo      TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at    DATETIME
  );
  CREATE TABLE IF NOT EXISTS chat_triggers (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    keywords TEXT NOT NULL,
    reply    TEXT NOT NULL,
    active   INTEGER DEFAULT 1
  );
`);

// ─── MIGRATIONS ───
try { db.exec(`ALTER TABLE users ADD COLUMN phone  TEXT DEFAULT NULL`); } catch (_) {}
try { db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT DEFAULT NULL`); } catch (_) {}
try { db.exec(`ALTER TABLE reviews ADD COLUMN photos TEXT DEFAULT '[]'`); } catch (_) {}
try { db.exec(`ALTER TABLE chat_sessions ADD COLUMN user_name TEXT DEFAULT NULL`); } catch (_) {}
try { db.exec(`ALTER TABLE chat_sessions ADD COLUMN guest_num INTEGER DEFAULT NULL`); } catch (_) {}

// ─── RE-SEED TRIGGERS (human-like multi-variant JSON array replies) ───
try {
  db.exec('DELETE FROM chat_triggers');
  const ins = db.prepare('INSERT INTO chat_triggers (keywords, reply, active) VALUES (?,?,1)');
  const seeds = [
    ['привет,здравствуйте,салам,салом,ассалом,ассаламу,хай,добрый день,добрый вечер,добрый утро,алейкум,вассалом',
     '["Ассаламу алейкум! 😊 Рады видеть вас! Чихел шумо?","Салом! 🌸 Как дела? Чем могу помочь?","Привет! Рада вас видеть в GULREZ 🌹 Как вы сегодня?"]'],
    ['хорошо,нормально,отлично,замечательно,всё хорошо,ок,окей,ладно,неплохо,супер',
     '["Вот и отлично! 😊 Рада слышать. Могу помочь с выбором букета?","Прекрасно! 🌸 Если нужна помощь с заказом — я здесь!","Хорошо слышать! 🌹 Есть какой-то особый повод сегодня?"]'],
    ['как ты,как вы,как дела,как сами,чихел,как жизнь,как поживаете',
     '["Спасибо, у меня всё хорошо! 🌸 А у вас? Чем могу помочь?","Отлично, спасибо что спросили! 😊 Готова помочь с выбором цветов!","Хорошо! Сегодня привезли свежие розы 🌹 Хотите посмотреть?"]'],
    ['заказать,хочу,купить,оформить,нужен букет,нужны цветы,возьму',
     '["Конечно! 🌹 Скажите повод — день рождения, свадьба или просто так? Подберу идеальный вариант!","Отличный выбор! 🌸 Для кого букет — для любимого человека или в подарок?","С удовольствием помогу! Какой стиль нравится — нежный, яркий или классика?"]'],
    ['цена,стоимость,сколько стоит,почём,дорого,бюджет',
     '["Наши букеты от 20 TJS 🌸 Есть на любой бюджет. На какую сумму рассчитываете?","Цены разные — от скромных до роскошных 🌹 Скажите бюджет, подберу лучший вариант!","Есть букеты от 20 до 1000+ TJS. Что ищете — что-то особенное или повседневное?"]'],
    ['доставка,привезти,доставить,привезёте,курьер,когда приедет',
     '["Доставляем по всему городу за 10 сомони 🚗 Время — 50-90 минут, курьер позвонит заранее!","Да! Доставка 10 TJS, приедем за 1-1.5 часа. Куда и когда удобно?","Конечно доставим! 🌹 Всего 10 сомони по городу. Адрес и время — скажите!"]'],
    ['скидк,акци,выгодно,дешевле,скидочка,есть скидки',
     '["Сейчас есть горячие предложения! 🔥 Смотрите ниже в каталоге — там актуальные акции!","У нас периодически бывают скидки на хиты 🌸 Загляните в каталог — там отмечены!","Акции меняются! Лучшие предложения сейчас в каталоге с тегом Хит и Топ 🌹"]'],
    ['состав,из чего,какие цветы,что в букете,цветочки',
     '["Состав каждого букета подробно написан в карточке товара 🌿 Открой любой — там всё!","Все ингредиенты указаны в описании букета 🌸 Есть какой-то конкретный, который нравится?","В карточке букета всё расписано! Если хочешь определённые цветы — скажи, подберу 🌹"]'],
    ['спасибо,благодарю,рахмат,спс,спасибки,огромное спасибо',
     '["Пожалуйста! 🌸 Всегда рада помочь. Если ещё что-то нужно — я здесь!","Рахмат! 😊 Для меня это удовольствие. Хорошего вам дня!","Не за что! 🌹 Обращайтесь в любое время — я всегда на связи!"]'],
    ['время,работаете,режим,часы работы,открыты,закрыты',
     '["Работаем каждый день с 08:00 до 22:00 🕗 Без выходных!","Мы открыты ежедневно с 8 утра до 10 вечера 🌸 Сегодня тоже!","С 08:00 до 22:00 ежедневно 🕗 Пишите в любое время в этом промежутке!"]'],
    ['адрес,где находитесь,как найти,местоположение,локация',
     '["Напишите нам в WhatsApp 📍 Скинем точный адрес и поможем добраться!","Адрес пришлём в WhatsApp — там удобнее с картой 🗺️ Написать?","Есть несколько точек! Скажите ваш район — найдём ближайшую 📍"]'],
    ['свежий,свежесть,сколько простоит,долго,держится,дней',
     '["Наши букеты стоят 7+ дней при правильном уходе 🌷 Меняйте воду ежедневно!","7-10 дней если держать вдали от солнца и менять воду каждый день 🌸","Минимум неделю, а обычно 10-14 дней 🌹 Даю советы по уходу при заказе!"]'],
    ['пока,до свидания,хайр,хайр бошед,до встречи,всего хорошего,ладно пока',
     '["Хайр бошед! 🌸 Будем рады видеть снова. Удачи вам!","До свидания! 🌹 Обращайтесь в любое время — всегда рада помочь!","Пока! 😊 Если понадобятся цветы — мы здесь. Хорошего дня!"]'],
    ['открытка,поздравление,надпись,написать,пожелание',
     '["Конечно! 💌 Добавим открытку с вашими словами. Диктуйте пожелание!","Да! Пишем от руки с любовью 🌸 Какой текст хотите на открытке?","Открытка бесплатно 🎁 Напишите текст пожелания — оформим красиво!"]'],
    ['упаковка,оформление,красиво упаковать,бумага,лента',
     '["Каждый букет упаковываем с любовью 🎁 Крафт, атлас, фирменная лента — всё включено!","Упаковка уже в цене 🌸 Красиво оформим в фирменном стиле GULREZ!","Конечно красиво 🌹 У нас несколько видов упаковки. Хотите фото примеров?"]'],
  ];
  const doSeed = db.transaction(() => { for (const [kw, rep] of seeds) ins.run(kw, rep); });
  doSeed();
} catch(e) { console.error('[Chat triggers seed]', e); }

// Favorites table: tracks which user liked which product
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
  );
`);

// Product translations (EN / TJ overrides; RU is always base in products table)
db.exec(`
  CREATE TABLE IF NOT EXISTS product_translations (
    product_id  INTEGER NOT NULL,
    lang        TEXT NOT NULL CHECK(lang IN ('EN','TJ')),
    name        TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tag         TEXT DEFAULT '',
    color       TEXT DEFAULT '',
    composition TEXT DEFAULT '',
    size        TEXT DEFAULT '',
    PRIMARY KEY (product_id, lang)
  );
`);

// Reviews
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    user_login TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    text       TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS review_reactions (
    user_id   INTEGER NOT NULL,
    review_id INTEGER NOT NULL,
    type      TEXT NOT NULL CHECK(type IN ('like','dislike')),
    PRIMARY KEY (user_id, review_id)
  );
`);

// Sync likes column with actual favorites count (run once on startup)
db.exec(`
  UPDATE products SET likes = (
    SELECT COUNT(*) FROM favorites WHERE favorites.product_id = products.id
  );
`);

// Hero settings table (single row, id=1)
db.exec(`
  CREATE TABLE IF NOT EXISTS hero_settings (
    id         INTEGER PRIMARY KEY DEFAULT 1,
    slide1_img TEXT DEFAULT 'images/1.jpg',
    slide2_img TEXT DEFAULT 'images/2.jpg',
    slide3_img TEXT DEFAULT 'images/3.jpg',
    slide4_img TEXT DEFAULT 'images/4.jpg',
    quotes_ru  TEXT DEFAULT '["Если любовь заставляет тебя расцветать — не сомневайся, это настоящее","Цветы — молчаливые поэты, которые говорят языком природы","Каждый цветок — это душа расцветшей к вечности","Там, где цветут цветы, расцветает и надежда"]',
    quotes_en  TEXT DEFAULT '["Where flowers bloom, so does hope","A flower does not think of competing with the flower next to it — it just blooms","To plant a garden is to believe in tomorrow","Life is the flower for which love is the honey"]',
    quotes_tj  TEXT DEFAULT '["Дар куҷое ки гул мешукуфад, дил низ мешукуфад","Гул забони дилест — бидуни ягон калима","Баҳор ба хона меояд он гоҳе ки гул меорӣ","Ҳар гул нишонаест аз меҳри беканор"]'
  );
`);
// Seed default row if missing
const heroExists = db.prepare('SELECT id FROM hero_settings WHERE id = 1').get();
if (!heroExists) {
  db.prepare('INSERT INTO hero_settings (id) VALUES (1)').run();
}

// Site settings (key-value)
db.exec(`
  CREATE TABLE IF NOT EXISTS site_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`);
// Default: chat widget enabled
const chatEnabled = db.prepare("SELECT value FROM site_settings WHERE key='chat_enabled'").get();
if (!chatEnabled) db.prepare("INSERT INTO site_settings (key,value) VALUES ('chat_enabled','1')").run();

// ─── SEED ADMIN ───
const adminExists = db.prepare('SELECT id FROM users WHERE login = ?').get('Malika');
if (!adminExists) {
  const hash = bcrypt.hashSync('999999', 10);
  db.prepare('INSERT INTO users (login, password, role) VALUES (?, ?, ?)').run('Malika', hash, 'admin');
  console.log('[DB] Admin created: Malika');
}

// ─── SEED PRODUCTS ───
const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
if (productCount === 0) {
  const insert = db.prepare(`
    INSERT INTO products
      (sort_order, name, description, composition, size, color, price, currency, discount, status, tag, tag_bg, image1, image2, image3, likes)
    VALUES
      (@sort_order, @name, @description, @composition, @size, @color, @price, @currency, @discount, @status, @tag, @tag_bg, @image1, @image2, @image3, @likes)
  `);

  const seedProducts = [
    {
      sort_order: 1, name: 'Красные тюльпаны',
      description: '15 бархатных красных тюльпанов с зеленью — классика весны',
      composition: '15 тюльпанов', size: '30 × 55 см', color: 'Красный',
      price: 20, currency: 'TJS', discount: 0, status: 1,
      tag: 'Хит', tag_bg: 'var(--rose)',
      image1: 'images/5.jpg', image2: 'images/6.jpg', image3: 'images/7.jpg', likes: 47
    },
    {
      sort_order: 2, name: "Happy Women's Day",
      description: 'Нежный букет из роз, матиол и эвкалипта — признание без слов',
      composition: 'Розы, матиолы, эвкалипт', size: '35 × 60 см', color: 'Пастель',
      price: 230, currency: 'TJS', discount: 0, status: 1,
      tag: 'Новинка', tag_bg: '#7a8f6e',
      image1: 'images/8.jpg', image2: 'images/9.jpg', image3: 'images/10.jpg', likes: 128
    },
    {
      sort_order: 3, name: 'Пион & Фрезия',
      description: 'Пышные пионы с веточками фрезии — аромат и роскошь в одном букете',
      composition: 'Пионы, фрезия', size: '40 × 65 см', color: 'Розовый',
      price: 410, currency: 'TJS', discount: 0, status: 1,
      tag: 'Топ', tag_bg: '#9b7bb8',
      image1: 'images/11.jpg', image2: 'images/12.jpg', image3: 'images/13.jpg', likes: 93
    },
    {
      sort_order: 4, name: 'Grand Rose Bouquet',
      description: '51 роза в авторской упаковке — подарок, который не забудут никогда',
      composition: '51 роза', size: '50 × 75 см', color: 'Красный',
      price: 610, currency: 'TJS', discount: 0, status: 1,
      tag: 'Premium', tag_bg: 'var(--bark)',
      image1: 'images/14.jpg', image2: 'images/15.jpg', image3: 'images/16.jpg', likes: 215
    },
    {
      sort_order: 5, name: 'Белые хризантемы',
      description: 'Нежный букет из 20 белоснежных хризантем — символ чистоты и искренности',
      composition: '20 хризантем', size: '30 × 50 см', color: 'Белый',
      price: 180, currency: 'TJS', discount: 0, status: 1,
      tag: 'Свежий', tag_bg: '#7a8f6e',
      image1: 'images/17.jpg', image2: 'images/18.jpg', image3: 'images/17a.jpg', likes: 62
    },
    {
      sort_order: 6, name: 'Лавандовый сон',
      description: 'Букет из лаванды и эустомы — романтика в каждом стебле, аромат на весь день',
      composition: 'Лаванда, эустома', size: '35 × 55 см', color: 'Лавандовый',
      price: 270, currency: 'TJS', discount: 0, status: 1,
      tag: 'Топ', tag_bg: '#9b7bb8',
      image1: 'images/19.jpg', image2: 'images/20.jpg', image3: 'images/19a.jpg', likes: 84
    },
    {
      sort_order: 7, name: 'Солнечные подсолнухи',
      description: '15 ярких подсолнухов с зеленью — заряд позитива и летнего настроения',
      composition: '15 подсолнухов', size: '35 × 60 см', color: 'Жёлтый',
      price: 150, currency: 'TJS', discount: 0, status: 1,
      tag: 'Лето', tag_bg: '#d4a84b',
      image1: 'images/21.jpg', image2: 'images/22.jpg', image3: 'images/21a.jpg', likes: 57
    },
    {
      sort_order: 8, name: 'Пастельный микс',
      description: 'Нежный микс из роз, ранункулюсов и альстромерий в пастельных тонах',
      composition: 'Розы, ранункулюсы, альстромерии', size: '40 × 60 см', color: 'Пастель',
      price: 320, currency: 'TJS', discount: 0, status: 1,
      tag: 'Хит', tag_bg: 'var(--rose)',
      image1: 'images/23.jpg', image2: 'images/24.jpg', image3: 'images/23a.jpg', likes: 103
    },
    {
      sort_order: 9, name: 'Королевская орхидея',
      description: 'Элегантная орхидея фаленопсис в керамическом горшке — роскошь на долгие месяцы',
      composition: 'Орхидея фаленопсис', size: '25 × 60 см', color: 'Белый / розовый',
      price: 490, currency: 'TJS', discount: 0, status: 1,
      tag: 'Premium', tag_bg: 'var(--bark)',
      image1: 'images/25.jpg', image2: 'images/26.jpg', image3: 'images/25a.jpg', likes: 139
    }
  ];

  const insertAll = db.transaction((products) => {
    for (const p of products) insert.run(p);
  });
  insertAll(seedProducts);
  console.log('[DB] Seeded 9 products');
}

module.exports = db;
