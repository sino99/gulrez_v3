/**
 * ══════════════════════════════════════════════════════
 *  GULREZ — Language System
 *  Supported: RU (русский) · EN (English) · TJ (тоҷикӣ)
 * ══════════════════════════════════════════════════════
 */

const GULREZ_LANG = {

  /* ────────────────────────────────
     РУССКИЙ  (default)
  ──────────────────────────────── */
  RU: {
    // Preloader
    preloaderSub: 'Цветочный магазин · Пенджикент',

    // Ticker
    ticker: [
      'Свежие букеты',
      '08:00 — 22:00',
      'Красиво',
      'Аккуратно',
      'Вовремя',
      'Пенджикент, Таджикистан',
      'Доставка — 10 TJS',
    ],

    // Nav
    navHome:     'Главная',
    navCatalog:  'Каталог',
    navAbout:    'О нас',
    navContacts: 'Контакты',
    navLogin:    'Войти',

    // Hero
    heroEyebrow: 'Цветочный магазин Gulrez · Пенджикент',
    heroSub:     'Авторские букеты с доставкой в день заказа',
    heroCta:     'Смотреть каталог',
    heroScroll:  'Прокрути',

    // Hero quotes — rotate on each slide
    heroQuotes: [
      'Если любовь заставляет тебя расцветать — не сомневайся, это настоящее',
      'Цветы — молчаливые поэты, которые говорят языком природы',
      'Каждый цветок — это душа расцветшей к вечности',
      'Там, где цветут цветы, расцветает и надежда',
    ],

    // Catalog section
    catalogLabel:    'Каталог',
    catalogTitle:    'Популярные букеты',
    catalogDesc:     'Свежие цветы каждый день — от нежных пастелей до ярких акцентов для любого повода.',
    catalogViewAll:  'Весь каталог',

    // Product cards
    btnCart:       'В корзину',
    btnCartAdded:  '✓ Добавлено',

    // Tags
    tagHit:     'Хит',
    tagNew:     'Новинка',
    tagTop:     'Топ',
    tagFresh:   'Свежий',
    tagSummer:  'Лето',

    // Products
    products: [
      {
        tag: 'Хит',
        title: 'Красные тюльпаны',
        desc: '15 бархатных красных тюльпанов с зеленью — классика весны',
        info: [
          { label: 'Состав',   value: '15 тюльпанов' },
          { label: 'Размер',   value: '30 × 55 см' },
          { label: 'Цвет',     value: 'Красный' },
          { label: 'Свежесть', value: '7+ дней' },
        ],
      },
      {
        tag: 'Новинка',
        title: "Happy Women's Day",
        desc: 'Нежный букет из роз, матиол и эвкалипта — признание без слов',
        info: [
          { label: 'Состав',   value: 'Розы, матиолы' },
          { label: 'Размер',   value: '35 × 60 см' },
          { label: 'Цвет',     value: 'Пастель' },
          { label: 'Свежесть', value: '7+ дней' },
        ],
      },
      {
        tag: 'Топ',
        title: 'Пион & Фрезия',
        desc: 'Пышные пионы с веточками фрезии — аромат и роскошь в одном букете',
        info: [
          { label: 'Состав',   value: 'Пионы, фрезия' },
          { label: 'Размер',   value: '40 × 65 см' },
          { label: 'Цвет',     value: 'Розовый' },
          { label: 'Свежесть', value: '5+ дней' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Grand Rose Bouquet',
        desc: '51 роза в авторской упаковке — подарок, который не забудут никогда',
        info: [
          { label: 'Состав',   value: '51 роза' },
          { label: 'Размер',   value: '50 × 75 см' },
          { label: 'Цвет',     value: 'Красный' },
          { label: 'Свежесть', value: '7+ дней' },
        ],
      },
      {
        tag: 'Свежий',
        title: 'Белые хризантемы',
        desc: 'Нежный букет из 20 белоснежных хризантем — символ чистоты и искренности',
        info: [
          { label: 'Состав',   value: '20 хризантем' },
          { label: 'Размер',   value: '30 × 50 см' },
          { label: 'Цвет',     value: 'Белый' },
          { label: 'Свежесть', value: '10+ дней' },
        ],
      },
      {
        tag: 'Топ',
        title: 'Лавандовый сон',
        desc: 'Букет из лаванды и эустомы — романтика в каждом стебле, аромат на весь день',
        info: [
          { label: 'Состав',   value: 'Лаванда, эустома' },
          { label: 'Размер',   value: '35 × 55 см' },
          { label: 'Цвет',     value: 'Лавандовый' },
          { label: 'Свежесть', value: '7+ дней' },
        ],
      },
      {
        tag: 'Лето',
        title: 'Солнечные подсолнухи',
        desc: '15 ярких подсолнухов с зеленью — заряд позитива и летнего настроения',
        info: [
          { label: 'Состав',   value: '15 подсолнухов' },
          { label: 'Размер',   value: '35 × 60 см' },
          { label: 'Цвет',     value: 'Жёлтый' },
          { label: 'Свежесть', value: '7+ дней' },
        ],
      },
      {
        tag: 'Хит',
        title: 'Пастельный микс',
        desc: 'Нежный микс из роз, ранункулюсов и альстромерий в пастельных тонах',
        info: [
          { label: 'Состав',   value: 'Розы, ранункулюсы' },
          { label: 'Размер',   value: '40 × 60 см' },
          { label: 'Цвет',     value: 'Пастель' },
          { label: 'Свежесть', value: '6+ дней' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Королевская орхидея',
        desc: 'Элегантная орхидея фаленопсис в керамическом горшке — роскошь на долгие месяцы',
        info: [
          { label: 'Состав',   value: 'Орхидея фаленопсис' },
          { label: 'Размер',   value: '25 × 60 см' },
          { label: 'Цвет',     value: 'Белый / розовый' },
          { label: 'Свежесть', value: '2+ месяца' },
        ],
      },
    ],

    // Modal
    modalLikes:       ' человек добавили в избранное',
    modalDeliveryTitle: 'Доставка по Пенджикенту',
    modalDeliveryText:  'Стоимость доставки — 10 TJS · 08:00–22:00',
    modalAddToCart:     'В корзину',
    modalAddedToCart:   (title, qty) => `${title} × ${qty} добавлено в корзину`,
    modalLikedToast:    'Добавлено в избранное ♡',
    modalUnlikedToast:  'Убрано из избранного',

    // About section
    aboutLabel:  'О нас',
    aboutTitle:  'Живая красота — каждый день',
    aboutText: [
      'Мы верим, что цветы — это не просто подарок, а язык самых глубоких чувств. Каждый букет создаётся руками наших флористов с трепетом и вниманием к деталям.',
      'Работаем только со свежими цветами — поставки напрямую с лучших ферм. Гарантируем свежесть каждого букета.',
      'Студия Gulrez в Пенджикенте. Пишите в Direct или WhatsApp — ответим быстро!',
    ],
    aboutStat1Label: 'лет в деле',
    aboutStat2Label: 'счастливых клиентов',
    aboutStat3Label: 'свежесть',

    // Delivery section
    deliveryEyebrow:  'Доставка и оплата',
    deliveryTitle:    'Как заказать и оплатить',
    deliverySubtitle: 'Быстрая доставка по Пенджикенту и удобные способы оплаты для вашего комфорта.',

    deliveryCardTitle:   'Доставка',
    deliveryCardSub:     'Ежедневно с 08:00 до 22:00',
    deliveryList: [
      'Доставка по Пенджикенту — 10 TJS',
      'Доставка в день заказа',
      'Заказы принимаются по телефону или через соцсети',
      'Самовывоз из магазина — бесплатно',
    ],
    deliveryBtnText:  'Заказать доставку',
    deliveryStamp:    'Быстро и удобно',

    paymentCardTitle: 'Оплата',
    paymentCardSub:   'Удобные способы оплаты',
    paymentList: [
      'Оплата через Алиф',
      'Оплата через Душанбе Сити',
      'Наличными при получении',
      'Перевод на карту',
    ],
    paymentBtnText:  'Написать нам',
    paymentStamp:    'Всегда на связи',

    // Footer
    footerBrandDesc: 'Цветочная мастерская в Пенджикенте. Свежие букеты с доставкой — с заботой о каждой детали.',
    footerLinksTitle:    'Быстрые ссылки',
    footerHoursTitle:    'Часы работы',
    footerHoursValue:    'Ежедневно: 08:00 — 22:00',
    footerDelivery:      'Доставка — 10 TJS',
    footerContactsTitle: 'Контакты',
    footerAddress:       'г. Пенджикент, Таджикистан',
    footerCopyright:     '© 2026 GULREZ',
    footerDevLabel:      'Разработка',
    footerMadeWith:      'Сделано с ♡',

    // Toasts & misc
    toastSearch:    'Поиск — скоро будет доступен',
    toastWishlist:  'Список избранного пуст',
    toastCart:      'Корзина',
    toastLogin:     'Страница входа',
    toastLangChanged: (l) => `Язык изменён: ${l}`,
    toastAddedToCart: 'Товар добавлен в корзину',
    toastLiked:     'Добавлено в избранное ♡',
  },


  /* ────────────────────────────────
     ENGLISH
  ──────────────────────────────── */
  EN: {
    preloaderSub: 'Flower Boutique · Panjakent',

    ticker: [
      'Fresh Bouquets',
      '08:00 — 22:00',
      'Beautiful',
      'Thoughtful',
      'On Time',
      'Panjakent, Tajikistan',
      'Delivery — 10 TJS',
    ],

    navHome:     'Home',
    navCatalog:  'Catalog',
    navAbout:    'About',
    navContacts: 'Contacts',
    navLogin:    'Sign In',

    heroEyebrow: 'Gulrez Flower Boutique · Panjakent',
    heroSub:     'Artisan bouquets delivered the same day',
    heroCta:     'Browse Catalog',
    heroScroll:  'Scroll',

    // Original English quotes — not translations
    heroQuotes: [
      'Where flowers bloom, so does hope',
      'A flower does not think of competing with the flower next to it — it just blooms',
      'To plant a garden is to believe in tomorrow',
      'Life is the flower for which love is the honey',
    ],

    catalogLabel:   'Catalog',
    catalogTitle:   'Bestselling Bouquets',
    catalogDesc:    'Fresh flowers every day — from soft pastels to bold statements, for every occasion.',
    catalogViewAll: 'View All',

    btnCart:      'Add to Cart',
    btnCartAdded: '✓ Added',

    tagHit:    'Hot',
    tagNew:    'New',
    tagTop:    'Top',
    tagFresh:  'Fresh',
    tagSummer: 'Summer',

    products: [
      {
        tag: 'Hot',
        title: 'Red Tulips',
        desc: '15 velvety red tulips with lush greens — the timeless signature of spring',
        info: [
          { label: 'Contents', value: '15 tulips' },
          { label: 'Size',     value: '30 × 55 cm' },
          { label: 'Color',    value: 'Red' },
          { label: 'Freshness', value: '7+ days' },
        ],
      },
      {
        tag: 'New',
        title: "Happy Women's Day",
        desc: 'A delicate blend of roses, stock & eucalyptus — feelings spoken in petals',
        info: [
          { label: 'Contents', value: 'Roses, stock' },
          { label: 'Size',     value: '35 × 60 cm' },
          { label: 'Color',    value: 'Pastel' },
          { label: 'Freshness', value: '7+ days' },
        ],
      },
      {
        tag: 'Top',
        title: 'Peony & Freesia',
        desc: 'Lush peonies with freesia sprigs — a bouquet that fills the room with luxury',
        info: [
          { label: 'Contents', value: 'Peonies, freesia' },
          { label: 'Size',     value: '40 × 65 cm' },
          { label: 'Color',    value: 'Pink' },
          { label: 'Freshness', value: '5+ days' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Grand Rose Bouquet',
        desc: '51 roses in bespoke wrapping — a gift no one will ever forget',
        info: [
          { label: 'Contents', value: '51 roses' },
          { label: 'Size',     value: '50 × 75 cm' },
          { label: 'Color',    value: 'Red' },
          { label: 'Freshness', value: '7+ days' },
        ],
      },
      {
        tag: 'Fresh',
        title: 'White Chrysanthemums',
        desc: 'A graceful bundle of 20 snow-white chrysanthemums — pure, honest, serene',
        info: [
          { label: 'Contents', value: '20 chrysanthemums' },
          { label: 'Size',     value: '30 × 50 cm' },
          { label: 'Color',    value: 'White' },
          { label: 'Freshness', value: '10+ days' },
        ],
      },
      {
        tag: 'Top',
        title: 'Lavender Dream',
        desc: 'Lavender and lisianthus — romance woven into every single stem',
        info: [
          { label: 'Contents', value: 'Lavender, lisianthus' },
          { label: 'Size',     value: '35 × 55 cm' },
          { label: 'Color',    value: 'Lavender' },
          { label: 'Freshness', value: '7+ days' },
        ],
      },
      {
        tag: 'Summer',
        title: 'Sunny Sunflowers',
        desc: '15 radiant sunflowers with greens — bottled sunshine for any occasion',
        info: [
          { label: 'Contents', value: '15 sunflowers' },
          { label: 'Size',     value: '35 × 60 cm' },
          { label: 'Color',    value: 'Yellow' },
          { label: 'Freshness', value: '7+ days' },
        ],
      },
      {
        tag: 'Hot',
        title: 'Pastel Mix',
        desc: 'Roses, ranunculus & alstroemeria in dreamy pastel shades — soft and unforgettable',
        info: [
          { label: 'Contents', value: 'Roses, ranunculus' },
          { label: 'Size',     value: '40 × 60 cm' },
          { label: 'Color',    value: 'Pastel' },
          { label: 'Freshness', value: '6+ days' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Royal Orchid',
        desc: 'An elegant phalaenopsis orchid in a ceramic pot — luxury that lasts for months',
        info: [
          { label: 'Contents', value: 'Phalaenopsis orchid' },
          { label: 'Size',     value: '25 × 60 cm' },
          { label: 'Color',    value: 'White / pink' },
          { label: 'Freshness', value: '2+ months' },
        ],
      },
    ],

    modalLikes:         ' people added to favourites',
    modalDeliveryTitle: 'Delivery across Panjakent',
    modalDeliveryText:  'Delivery fee — 10 TJS · 08:00–22:00',
    modalAddToCart:     'Add to Cart',
    modalAddedToCart:   (title, qty) => `${title} × ${qty} added to cart`,
    modalLikedToast:    'Saved to favourites ♡',
    modalUnlikedToast:  'Removed from favourites',

    aboutLabel: 'About Us',
    aboutTitle: 'Living Beauty — Every Single Day',
    aboutText: [
      'We believe flowers are not just a gift — they are the language of the deepest emotions. Every bouquet is crafted by our florists with love and meticulous attention to detail.',
      'We work exclusively with fresh flowers, sourced directly from the finest farms. We guarantee the freshness of every bouquet we deliver.',
      'Gulrez Studio is in Panjakent. Reach us on Instagram Direct or WhatsApp — we reply fast!',
    ],
    aboutStat1Label: 'years in bloom',
    aboutStat2Label: 'happy clients',
    aboutStat3Label: 'freshness',

    deliveryEyebrow:  'Delivery & Payment',
    deliveryTitle:    'How to Order & Pay',
    deliverySubtitle: 'Fast delivery across Panjakent and flexible payment options for your convenience.',

    deliveryCardTitle: 'Delivery',
    deliveryCardSub:   'Daily from 08:00 to 22:00',
    deliveryList: [
      'Delivery across Panjakent — 10 TJS',
      'Same-day delivery available',
      'Orders via phone or social media',
      'Free in-store pickup',
    ],
    deliveryBtnText: 'Order Delivery',
    deliveryStamp:   'Fast & Easy',

    paymentCardTitle: 'Payment',
    paymentCardSub:   'Flexible payment options',
    paymentList: [
      'Pay via Alif',
      'Pay via Dushanbe City',
      'Cash on delivery',
      'Card transfer',
    ],
    paymentBtnText: 'Message Us',
    paymentStamp:   'Always available',

    footerBrandDesc:     'A flower atelier in Panjakent. Fresh bouquets with delivery — crafted with care for every detail.',
    footerLinksTitle:    'Quick Links',
    footerHoursTitle:    'Opening Hours',
    footerHoursValue:    'Daily: 08:00 — 22:00',
    footerDelivery:      'Delivery — 10 TJS',
    footerContactsTitle: 'Contacts',
    footerAddress:       'Panjakent, Tajikistan',
    footerCopyright:     '© 2026 GULREZ',
    footerDevLabel:      'Dev by',
    footerMadeWith:      'Made with ♡',

    toastSearch:      'Search — coming soon',
    toastWishlist:    'Your wishlist is empty',
    toastCart:        'Cart',
    toastLogin:       'Login page',
    toastLangChanged: (l) => `Language changed: ${l}`,
    toastAddedToCart: 'Item added to cart',
    toastLiked:       'Saved to favourites ♡',
  },


  /* ────────────────────────────────
     ТОҶИКӢ  (Tajik)
  ──────────────────────────────── */
  TJ: {
    preloaderSub: 'Мағозаи гул · Панҷакент',

    ticker: [
      'Гулдастаҳои тоза',
      '08:00 — 22:00',
      'Зебо',
      'Бодиққат',
      'Саривақт',
      'Панҷакент, Тоҷикистон',
      'Расонидан — 10 ТСМ',
    ],

    navHome:     'Асосӣ',
    navCatalog:  'Каталог',
    navAbout:    'Дар бораи мо',
    navContacts: 'Тамос',
    navLogin:    'Даромадан',

    heroEyebrow: 'Мағозаи гули Gulrez · Панҷакент',
    heroSub:     'Гулдастаҳои муаллифӣ бо расонидани ҳамон рӯз',
    heroCta:     'Каталогро бубинед',
    heroScroll:  'Поён',

    // Original Tajik quotes — composed fresh, poetic
    heroQuotes: [
      'Дар куҷое ки гул мешукуфад, дил низ мешукуфад',
      'Гул забони дилест — бидуни ягон калима',
      'Баҳор ба хона меояд он гоҳе ки гул меорӣ',
      'Ҳар гул нишонаест аз меҳри беканор',
    ],

    catalogLabel:   'Каталог',
    catalogTitle:   'Гулдастаҳои машҳур',
    catalogDesc:    'Гулҳои тоза ҳар рӯз — аз рангҳои нозук то рангҳои дурахшон барои ҳар маросим.',
    catalogViewAll: 'Тамоми каталог',

    btnCart:      'Ба сабад',
    btnCartAdded: '✓ Илова шуд',

    tagHit:    'Хит',
    tagNew:    'Нав',
    tagTop:    'Беҳтарин',
    tagFresh:  'Тоза',
    tagSummer: 'Тобистон',

    products: [
      {
        tag: 'Хит',
        title: 'Лолаҳои сурх',
        desc: '15 лолаи бахмалии сурх бо сабзавот — классикаи баҳор',
        info: [
          { label: 'Таркиб',    value: '15 лола' },
          { label: 'Андоза',    value: '30 × 55 см' },
          { label: 'Ранг',      value: 'Сурх' },
          { label: 'Тозагӣ',   value: '7+ рӯз' },
        ],
      },
      {
        tag: 'Нав',
        title: "Happy Women's Day",
        desc: 'Гулдастаи нозук аз гулоб, матиола ва эвкалипт — эътирофи бе калима',
        info: [
          { label: 'Таркиб',    value: 'Гулоб, матиола' },
          { label: 'Андоза',    value: '35 × 60 см' },
          { label: 'Ранг',      value: 'Пастел' },
          { label: 'Тозагӣ',   value: '7+ рӯз' },
        ],
      },
      {
        tag: 'Беҳтарин',
        title: 'Пион & Фрезия',
        desc: 'Пионҳои шукуфон бо шохаҳои фрезия — хушбӯй ва боҳашамат дар як дастаи гул',
        info: [
          { label: 'Таркиб',    value: 'Пион, фрезия' },
          { label: 'Андоза',    value: '40 × 65 см' },
          { label: 'Ранг',      value: 'Гулобӣ' },
          { label: 'Тозагӣ',   value: '5+ рӯз' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Grand Rose Bouquet',
        desc: '51 гулоб дар бастабандии муаллифӣ — тӯҳфае ки ҳеҷ гоҳ фаромӯш намешавад',
        info: [
          { label: 'Таркиб',    value: '51 гулоб' },
          { label: 'Андоза',    value: '50 × 75 см' },
          { label: 'Ранг',      value: 'Сурх' },
          { label: 'Тозагӣ',   value: '7+ рӯз' },
        ],
      },
      {
        tag: 'Тоза',
        title: 'Хризантемаҳои сафед',
        desc: 'Гулдастаи нозук аз 20 хризантемаи барфсафед — рамзи покӣ ва самимият',
        info: [
          { label: 'Таркиб',    value: '20 хризантема' },
          { label: 'Андоза',    value: '30 × 50 см' },
          { label: 'Ранг',      value: 'Сафед' },
          { label: 'Тозагӣ',   value: '10+ рӯз' },
        ],
      },
      {
        tag: 'Беҳтарин',
        title: 'Хоби лаванда',
        desc: 'Гулдастаи лаванда ва эустома — ишқ дар ҳар як поя, хушбӯй тамоми рӯз',
        info: [
          { label: 'Таркиб',    value: 'Лаванда, эустома' },
          { label: 'Андоза',    value: '35 × 55 см' },
          { label: 'Ранг',      value: 'Лавандагӣ' },
          { label: 'Тозагӣ',   value: '7+ рӯз' },
        ],
      },
      {
        tag: 'Тобистон',
        title: 'Офтобпарастони тилоӣ',
        desc: '15 офтобпарасти дурахшон — заряди хуш ва кайфияти тобистон',
        info: [
          { label: 'Таркиб',    value: '15 офтобпараст' },
          { label: 'Андоза',    value: '35 × 60 см' },
          { label: 'Ранг',      value: 'Зард' },
          { label: 'Тозагӣ',   value: '7+ рӯз' },
        ],
      },
      {
        tag: 'Хит',
        title: 'Омехтаи пастел',
        desc: 'Омехтаи нозук аз гулоб, ранункулюс ва алстромерия дар тонҳои пастел',
        info: [
          { label: 'Таркиб',    value: 'Гулоб, ранункулюс' },
          { label: 'Андоза',    value: '40 × 60 см' },
          { label: 'Ранг',      value: 'Пастел' },
          { label: 'Тозагӣ',   value: '6+ рӯз' },
        ],
      },
      {
        tag: 'Premium',
        title: 'Орхидеяи шоҳона',
        desc: 'Орхидеяи зебои фаленопсис дар гулдони сафолин — боҳашамат барои моҳҳои дароз',
        info: [
          { label: 'Таркиб',    value: 'Орхидеяи фаленопсис' },
          { label: 'Андоза',    value: '25 × 60 см' },
          { label: 'Ранг',      value: 'Сафед / гулобӣ' },
          { label: 'Тозагӣ',   value: '2+ моҳ' },
        ],
      },
    ],

    modalLikes:         ' нафар ба дӯстдоштаҳо илова карданд',
    modalDeliveryTitle: 'Расонидан дар Панҷакент',
    modalDeliveryText:  'Нархи расонидан — 10 ТСМ · 08:00–22:00',
    modalAddToCart:     'Ба сабад',
    modalAddedToCart:   (title, qty) => `${title} × ${qty} ба сабад илова шуд`,
    modalLikedToast:    'Ба дӯстдоштаҳо илова шуд ♡',
    modalUnlikedToast:  'Аз дӯстдоштаҳо хориҷ шуд',

    aboutLabel: 'Дар бораи мо',
    aboutTitle: 'Зебоии зинда — ҳар рӯз',
    aboutText: [
      'Мо бовар дорем, ки гулҳо на танҳо тӯҳфа, балки забони чуқуртарин ҳиссиёт мебошанд. Ҳар гулдаста бо дасти флористони мо бо меҳру эҳтиром сохта мешавад.',
      'Мо танҳо бо гулҳои тоза кор мекунем — таъминот бевосита аз беҳтарин фермаҳо. Тозагии ҳар гулдастаро кафолат медиҳем.',
      'Студияи Gulrez дар Панҷакент. Дар Direct ё WhatsApp нависед — зуд ҷавоб медиҳем!',
    ],
    aboutStat1Label: 'соли таҷриба',
    aboutStat2Label: 'мизоҷони хушбахт',
    aboutStat3Label: 'тозагӣ',

    deliveryEyebrow:  'Расонидан ва пардохт',
    deliveryTitle:    'Чӣ тавр фармоиш диҳед ва пардохт кунед',
    deliverySubtitle: 'Расонидани зуд дар Панҷакент ва усулҳои пардохти қулай барои шумо.',

    deliveryCardTitle: 'Расонидан',
    deliveryCardSub:   'Ҳар рӯз аз 08:00 то 22:00',
    deliveryList: [
      'Расонидан дар Панҷакент — 10 ТСМ',
      'Расонидан ҳамон рӯзи фармоиш',
      'Фармоишҳо тавассути телефон ё шабакаҳои иҷтимоӣ',
      'Аз мағоза гирифтан — ройгон',
    ],
    deliveryBtnText: 'Фармоиши расонидан',
    deliveryStamp:   'Зуд ва осон',

    paymentCardTitle: 'Пардохт',
    paymentCardSub:   'Усулҳои пардохти қулай',
    paymentList: [
      'Пардохт тавассути Алиф',
      'Пардохт тавассути Душанбе Сити',
      'Пул нақд ҳангоми гирифтан',
      'Интиқол ба карта',
    ],
    paymentBtnText: 'Ба мо нависед',
    paymentStamp:   'Ҳамеша дар тамос',

    footerBrandDesc:     'Устохонаи гул дар Панҷакент. Гулдастаҳои тоза бо расонидан — бо ғамхорӣ ба ҳар як тафсилот.',
    footerLinksTitle:    'Пайвандҳои зуд',
    footerHoursTitle:    'Соатҳои кор',
    footerHoursValue:    'Ҳар рӯз: 08:00 — 22:00',
    footerDelivery:      'Расонидан — 10 ТСМ',
    footerContactsTitle: 'Тамос',
    footerAddress:       'ш. Панҷакент, Тоҷикистон',
    footerCopyright:     '© 2026 GULREZ',
    footerDevLabel:      'Сохта аз ҷониби',
    footerMadeWith:      'Бо ♡ сохта шудааст',

    toastSearch:      'Ҷустуҷӯ — ба зудӣ фаъол мешавад',
    toastWishlist:    'Рӯйхати дӯстдоштаҳо холист',
    toastCart:        'Сабад',
    toastLogin:       'Саҳифаи воридшавӣ',
    toastLangChanged: (l) => `Забон иваз шуд: ${l}`,
    toastAddedToCart: 'Мол ба сабад илова шуд',
    toastLiked:       'Ба дӯстдоштаҳо илова шуд ♡',
  },

};


/* ══════════════════════════════════════════════════════
   LANGUAGE ENGINE
   Reads the translations above and patches the DOM.
══════════════════════════════════════════════════════ */

let _currentLang = 'RU';

/**
 * Public API — call from anywhere:
 *   setLang('EN', buttonElement)
 */
window.setLang = function(lang, btn) {
  if (!GULREZ_LANG[lang]) return;
  _currentLang = lang;

  // Sync all lang-btn active states
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.trim() === lang);
  });

  applyTranslations(lang);

  const t = GULREZ_LANG[lang];
  showToast(t.toastLangChanged(lang));
};

window.getCurrentLang = function() { return _currentLang; };

/* ── Core DOM patcher ─────────────────────────────── */
function applyTranslations(lang) {
  const t = { ...GULREZ_LANG[lang], _lang: lang };

  // ── Preloader tagline
  _setText('[data-i18n="preloader-sub"]',     t.preloaderSub);

  // ── Ticker  (rebuild both copies for infinite scroll)
  const tickerInner = document.querySelector('.ticker-inner');
  if (tickerInner) {
    const fragment = t.ticker.map(item =>
      `<span class="ticker-item"><span class="ticker-icon">✦</span> ${item}</span>` +
      `<span class="ticker-dot"></span>`
    ).join('');
    tickerInner.innerHTML = fragment + fragment; // doubled for seamless loop
  }

  // ── Header nav
  _setText('[data-i18n="nav-home"]',     t.navHome);
  _setText('[data-i18n="nav-catalog"]',  t.navCatalog);
  _setText('[data-i18n="nav-about"]',    t.navAbout);
  _setText('[data-i18n="nav-contacts"]', t.navContacts);
  _setText('[data-i18n="nav-login"]',    t.navLogin);

  // ── Mobile nav
  _setText('[data-i18n="m-nav-home"]',     t.navHome);
  _setText('[data-i18n="m-nav-catalog"]',  t.navCatalog);
  _setText('[data-i18n="m-nav-about"]',    t.navAbout);
  _setText('[data-i18n="m-nav-contacts"]', t.navContacts);
  _setText('[data-i18n="m-nav-login"]',    t.navLogin);

  // ── Hero
  _setText('[data-i18n="hero-eyebrow"]', t.heroEyebrow);
  _setText('[data-i18n="hero-sub"]',     t.heroSub);
  _setText('[data-i18n="hero-cta"]',     t.heroCta);
  _setText('[data-i18n="hero-scroll"]',  t.heroScroll);

  // Update hero quotes array used by the slider
  // Use server quotes if available, otherwise fall back to language.js defaults
  if (window._heroQuotes !== undefined) {
    const serverQuotes = window._heroData && window._heroData.quotes && window._heroData.quotes[lang];
    const quotes = serverQuotes || t.heroQuotes;
    window._heroQuotes = quotes;
    // Refresh visible quote immediately
    const q = document.getElementById('heroQuote');
    if (q) {
      const idx = window._heroCurrentSlide || 0;
      q.classList.remove('visible');
      setTimeout(() => {
        q.textContent = quotes[idx];
        q.classList.add('visible');
      }, 180);
    }
  }

  // ── Catalog section
  _setText('[data-i18n="catalog-label"]',    t.catalogLabel);
  _setText('[data-i18n="catalog-title"]',    t.catalogTitle);
  _setText('[data-i18n="catalog-desc"]',     t.catalogDesc);
  _setText('[data-i18n="catalog-view-all"]', t.catalogViewAll);

  // ── Product cards  (data-product-id on each .product-card)
  document.querySelectorAll('.product-card[data-product-id]').forEach(card => {
    const pid      = parseInt(card.getAttribute('data-product-id'));
    const baseP    = window._productsById && window._productsById[pid];
    if (!baseP) return;

    const trans    = window._productTranslations && window._productTranslations[pid];
    const override = (lang !== 'RU' && trans && trans[lang]) ? trans[lang] : null;

    const title = override && override.title ? override.title : baseP.title;
    const desc  = override && override.desc  ? override.desc  : baseP.desc;

    const nameEl = card.querySelector('.product-name');
    const descEl = card.querySelector('.product-desc');
    const cartEl = card.querySelector('.btn-cart');

    if (nameEl) nameEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (cartEl && cartEl.textContent.trim() !== t.btnCartAdded) {
      cartEl.textContent = t.btnCart;
    }
  });

  // ── "Add to cart" feedback in addToCart()
  window._i18n_btnCart      = t.btnCart;
  window._i18n_btnCartAdded = t.btnCartAdded;
  window._i18n_toastAdded   = t.toastAddedToCart;
  window._i18n_toastLiked   = t.toastLiked;

  // ── About section
  _setText('[data-i18n="about-label"]', t.aboutLabel);
  _setText('[data-i18n="about-title"]', t.aboutTitle);
  const aboutTexts = document.querySelectorAll('[data-i18n^="about-text-"]');
  aboutTexts.forEach((el, i) => { if (t.aboutText[i]) el.textContent = t.aboutText[i]; });
  _setText('[data-i18n="stat-1-label"]', t.aboutStat1Label);
  _setText('[data-i18n="stat-2-label"]', t.aboutStat2Label);
  _setText('[data-i18n="stat-3-label"]', t.aboutStat3Label);

  // ── Delivery section
  _setText('[data-i18n="delivery-eyebrow"]',  t.deliveryEyebrow);
  _setText('[data-i18n="delivery-title"]',     t.deliveryTitle);
  _setText('[data-i18n="delivery-subtitle"]',  t.deliverySubtitle);
  _setText('[data-i18n="delivery-card-title"]', t.deliveryCardTitle);
  _setText('[data-i18n="delivery-card-sub"]',   t.deliveryCardSub);
  _setText('[data-i18n="delivery-btn"]',        t.deliveryBtnText);
  _setText('[data-i18n="delivery-stamp"]',      t.deliveryStamp);

  const dList = document.querySelectorAll('[data-i18n^="delivery-li-"]');
  dList.forEach((el, i) => { if (t.deliveryList[i]) el.textContent = t.deliveryList[i]; });

  _setText('[data-i18n="payment-card-title"]', t.paymentCardTitle);
  _setText('[data-i18n="payment-card-sub"]',   t.paymentCardSub);
  _setText('[data-i18n="payment-btn"]',         t.paymentBtnText);
  _setText('[data-i18n="payment-stamp"]',       t.paymentStamp);

  const pList = document.querySelectorAll('[data-i18n^="payment-li-"]');
  pList.forEach((el, i) => { if (t.paymentList[i]) el.textContent = t.paymentList[i]; });

  // ── Footer
  _setText('[data-i18n="footer-brand-desc"]',    t.footerBrandDesc);
  _setText('[data-i18n="footer-links-title"]',   t.footerLinksTitle);
  _setText('[data-i18n="footer-hours-title"]',   t.footerHoursTitle);
  _setText('[data-i18n="footer-hours-value"]',   t.footerHoursValue);
  _setText('[data-i18n="footer-delivery"]',      t.footerDelivery);
  _setText('[data-i18n="footer-contacts-title"]', t.footerContactsTitle);
  _setText('[data-i18n="footer-address"]',        t.footerAddress);
  _setText('[data-i18n="footer-copyright"]',      t.footerCopyright);
  _setText('[data-i18n="footer-dev-label"]',      t.footerDevLabel);
  _setText('[data-i18n="footer-made-with"]',      t.footerMadeWith);

  // Footer nav links mirror main nav
  _setText('[data-i18n="footer-nav-home"]',     t.navHome);
  _setText('[data-i18n="footer-nav-catalog"]',  t.navCatalog);
  _setText('[data-i18n="footer-nav-about"]',    t.navAbout);
  _setText('[data-i18n="footer-nav-contacts"]', t.navContacts);

  // ── Modal — static strings
  _setText('[data-i18n="modal-delivery-title"]', t.modalDeliveryTitle);
  _setText('[data-i18n="modal-delivery-text"]',  t.modalDeliveryText);
  _setText('[data-i18n="modal-add-btn"]',        t.modalAddToCart);

  // Store modal strings for JS functions to read
  window._i18n_modalLikes         = t.modalLikes;
  window._i18n_modalAddedToCart   = t.modalAddedToCart;
  window._i18n_modalLikedToast    = t.modalLikedToast;
  window._i18n_modalUnlikedToast  = t.modalUnlikedToast;

  // ── Update open modal (if any) product data
  if (window._currentProductIndex !== undefined && window._currentProductIndex !== null) {
    _refreshOpenModal(window._currentProductIndex, t);
  }

  // ── Document language attribute
  document.documentElement.lang = lang.toLowerCase();
}

/* Refresh modal content if it's currently open */
function _refreshOpenModal(idx, t) {
  const pid = window._currentProductId;
  const realProduct = (window._productsById && pid) ? window._productsById[pid] : (window.products ? window.products[idx] : null);
  if (!realProduct) return;

  const lang     = t._lang || 'RU';
  const trans    = window._productTranslations && pid && window._productTranslations[pid];
  const override = (lang !== 'RU' && trans && trans[lang]) ? trans[lang] : null;
  const title    = override && override.title ? override.title : realProduct.title;
  const desc     = override && override.desc  ? override.desc  : realProduct.desc;

  const tagEl   = document.getElementById('modalTag');
  const titleEl = document.getElementById('modalTitle');
  const descEl  = document.getElementById('modalDesc');

  if (tagEl && realProduct) {
    const hasDisc = realProduct.discount > 0;
    if (hasDisc) {
      tagEl.textContent = `-${realProduct.discount}%`;
      tagEl.style.background = '#d94f3d';
      tagEl.classList.add('modal-tag--discount');
      tagEl.style.display = '';
    } else if (realProduct.tag) {
      tagEl.textContent = realProduct.tag;
      tagEl.style.background = realProduct.tagBg;
      tagEl.classList.remove('modal-tag--discount');
      tagEl.style.display = '';
    } else {
      tagEl.textContent = '';
      tagEl.style.display = 'none';
      tagEl.classList.remove('modal-tag--discount');
    }
  }
  if (titleEl) titleEl.textContent = title;
  if (descEl)  descEl.textContent  = desc;

  // Info grid — use real product info with translation overrides
  const gridEl = document.getElementById('modalInfoGrid');
  if (gridEl && realProduct && realProduct.info) {
    const infoItems = realProduct.info.map((item, i) => {
      if (!override) return item;
      if (i === 0) return { ...item, value: override.composition || item.value };
      if (i === 1) return { ...item, value: override.size  || item.value };
      if (i === 2) return { ...item, value: override.color || item.value };
      return item;
    });
    gridEl.innerHTML = infoItems.map(item =>
      `<div class="modal-info-card"><span class="modal-info-icon">${item.icon}</span>` +
      `<div><span class="modal-info-label">${item.label}</span>` +
      `<span class="modal-info-value">${item.value}</span></div></div>`
    ).join('');
  }
}

/* ── Tiny helper ──────────────────────────────────── */
function _setText(selector, text) {
  document.querySelectorAll(selector).forEach(el => {
    // Preserve child elements (icons, badges)
    const children = Array.from(el.children);
    if (children.length === 0) {
      el.textContent = text;
    } else {
      // Replace only the first text node
      let found = false;
      el.childNodes.forEach(node => {
        if (!found && node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          node.textContent = text + ' ';
          found = true;
        }
      });
      if (!found) el.insertAdjacentText('afterbegin', text);
    }
  });
}