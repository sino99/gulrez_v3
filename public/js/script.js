
  /* ─── PRELOADER ─── */
  const preloader = document.getElementById('preloader');
  // Hide after animation completes (~4.2s) + small buffer
  setTimeout(() => {
    preloader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 4200);

  // Block scroll while loading
  document.body.style.overflow = 'hidden';


  const header = document.getElementById('header');
  const ticker = document.querySelector('.ticker-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    header.classList.toggle('scrolled', scrolled);
    ticker.classList.toggle('scrolled', scrolled);
  });

  /* ─── MOBILE NAV ─── */
  const mobileNav = document.getElementById('mobileNav');

  function openMobileNav() {
    mobileNav.classList.toggle('open');
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    const burger = document.querySelector('.burger');
    if (!mobileNav.contains(e.target) && !burger.contains(e.target)) {
      closeMobileNav();
    }
  });

  /* ─── LANGUAGE ─── */
  // setLang is now provided by language.js (loaded at bottom)
  // This stub keeps it safe if language.js loads after inline script
  if (typeof setLang === 'undefined') {
    window.setLang = function(lang, btn) {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };
  }
  if (typeof getCurrentLang === 'undefined') {
    window.getCurrentLang = function() { return 'RU'; };
  }

  /* ─── SLIDER ─── */
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');

  // Default RU quotes — language.js will override window._heroQuotes on lang change
  window._heroQuotes = [
    'Если любовь заставляет тебя расцветать — не сомневайся, это настоящее',
    'Цветы — молчаливые поэты, которые говорят языком природы',
    'Каждый цветок — это душа расцветшей к вечности',
    'Там, где цветут цветы, расцветает и надежда'
  ];

  let current = 0;
  window._heroCurrentSlide = 0;
  let timer;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    window._heroCurrentSlide = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    const q = document.getElementById('heroQuote');
    q.classList.remove('visible');
    setTimeout(() => {
      q.textContent = window._heroQuotes[current];
      q.classList.add('visible');
    }, 200);
    resetTimer();
  }

  function nextSlide() {
    goToSlide((current + 1) % slides.length);
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
  }

  resetTimer();

  /* ─── CART ─── */
  let cartCount = 0;

  /* ── Price helper (applies discount) ── */
  function finalPrice(p) {
    return p.discount > 0 ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
  }

  /* ══════════════════════════════════════════════════
     FULL CART SYSTEM
  ══════════════════════════════════════════════════ */

  const cartItems = new Map();   // key: productIndex → {p, qty}
  const DELIVERY_FEE = 10;
  let cartStep = 1;
  let cartRecipient = 'self';    // 'self' | 'other'

  // Extras state
  const extras = {
    card:  { selected: false, qty: 1, price: 0,  name: 'Открытка' },
    choc1: { selected: false, qty: 1, price: 10, name: 'Шоколад Люкс' },
    choc2: { selected: false, qty: 1, price: 11, name: 'Шоколад Бельгийский' },
    choc3: { selected: false, qty: 1, price: 15, name: 'Шоколад Трюфель' },
  };

  /* ── Open / close ── */
  function openCart() {
    _renderCartItems();
    _renderCartFooter();
    document.getElementById('cartPanel').classList.add('open');
    document.getElementById('cartOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Add to cart from card ── */
  function addToCart(btn) {
    const card = btn.closest('.product-card[data-product-index]');
    if (!card) return;
    const idx = parseInt(card.getAttribute('data-product-index'));
    const p   = products[idx];
    if (cartItems.has(idx)) {
      cartItems.get(idx).qty++;
    } else {
      cartItems.set(idx, { p, qty: 1 });
    }
    _updateCartBadge();

    const added = window._i18n_btnCartAdded || '✓ Добавлено';
    const cart  = window._i18n_btnCart      || 'В корзину';
    btn.textContent = added;
    btn.style.background = 'var(--leaf)';
    showToast(window._i18n_toastAdded || 'Товар добавлен в корзину');
    setTimeout(() => { btn.textContent = cart; btn.style.background = ''; }, 1800);
  }

  /* ── Add from modal ── */
  function modalAddToCart() {
    if (!currentProduct) return;
    const idx = window._currentProductIndex;
    if (cartItems.has(idx)) {
      cartItems.get(idx).qty += modalQty;
    } else {
      cartItems.set(idx, { p: currentProduct, qty: modalQty });
    }
    _updateCartBadge();
    cartCount = Array.from(cartItems.values()).reduce((s,e)=>s+e.qty,0);
    document.getElementById('cartBadge').textContent = cartCount;
    const fn  = window._i18n_modalAddedToCart;
    const msg = fn ? fn(currentProduct.title, modalQty) : (currentProduct.title + ' × ' + modalQty + ' добавлено в корзину');
    showToast(msg);
    closeModal();
  }

  /* ── Add ALL from wishlist ── */
  function addAllToCart() {
    if (wishlist.size === 0) return;
    wishlist.forEach(({ p, qty }, idx) => {
      if (cartItems.has(idx)) cartItems.get(idx).qty += qty;
      else cartItems.set(idx, { p, qty });
    });
    let totalQty = 0;
    wishlist.forEach(({ qty }) => totalQty += qty);
    _updateCartBadge();
    const label = document.getElementById('wlAllCartLabel');
    if (label) label.textContent = '✓ Добавлено!';
    setTimeout(() => { closeWishlist(); if (label) label.textContent = 'Добавить всё в корзину'; }, 700);
    showToast(`${totalQty} товаров добавлено в корзину 🛍️`);
  }

  /* ── Wishlist single add ── */
  function wlAddToCart(idx) {
    const entry = wishlist.get(idx);
    if (!entry) return;
    const { p, qty } = entry;
    if (cartItems.has(idx)) cartItems.get(idx).qty += qty;
    else cartItems.set(idx, { p, qty });
    _updateCartBadge();
    const btn = document.getElementById(`wlCartBtn${idx}`);
    if (btn) {
      btn.classList.add('added');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg> ✓`;
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="12" height="12"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> ${window._i18n_btnCart || 'В корзину'}`;
      }, 1800);
    }
    const tp = _getTranslatedProduct(idx);
    const title = tp ? tp.title : p.title;
    const fn = window._i18n_modalAddedToCart;
    showToast(fn ? fn(title, qty) : `${title} × ${qty} добавлено в корзину`);
  }

  /* ── Badge update ── */
  function _updateCartBadge() {
    let count = 0;
    cartItems.forEach(({ qty }) => count += qty);
    cartCount = count;
    const badge = document.getElementById('cartBadge');
    const pill  = document.getElementById('cartCountPill');
    badge.textContent = count;
    if (pill) pill.textContent = count;
    if (count > 0) {
      badge.style.display = 'flex';
      badge.style.animation = 'none';
      requestAnimationFrame(() => { badge.style.animation = ''; });
    } else {
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
    badge.style.display = 'flex';
  }

  /* ── Calc totals ── */
  function _calcTotal() {
    let sub = 0;
    cartItems.forEach(({ p, qty }) => sub += finalPrice(p) * qty);
    let ext = 0;
    Object.values(extras).forEach(e => { if (e.selected) ext += e.price * e.qty; });
    return { sub, ext, delivery: cartItems.size > 0 ? DELIVERY_FEE : 0, get total() { return this.sub + this.ext + this.delivery; } };
  }

  /* ── Render items list ── */
  function _renderCartItems() {
    const list  = document.getElementById('cartItemsList');
    const empty = document.getElementById('cartEmptyState');
    const extrasSec = document.getElementById('cartExtrasSection');
    if (!list) return;

    list.innerHTML = '';
    if (cartItems.size === 0) {
      empty.style.display = 'flex';
      if (extrasSec) extrasSec.style.display = 'none';
      document.getElementById('cartFooter').classList.remove('visible');
      _updateStepIndicator(1);
      return;
    }
    empty.style.display = 'none';
    if (extrasSec) extrasSec.style.display = 'block';

    cartItems.forEach(({ p, qty }, idx) => {
      const tp    = _getTranslatedProduct(idx);
      const title = tp ? tp.title : p.title;
      const div   = document.createElement('div');
      div.className = 'cart-item';
      div.dataset.cartIdx = idx;
      div.style.animationDelay = (Array.from(cartItems.keys()).indexOf(idx) * 0.05) + 's';
      div.innerHTML = `
        <img class="cart-item-img" src="${p.images[0]}" alt="${title}"
             onclick="closeCart(); setTimeout(()=>openModal(${idx}),120)">
        <div class="cart-item-body">
          <div class="cart-item-name" onclick="closeCart(); setTimeout(()=>openModal(${idx}),120)">${title}</div>
          <div class="cart-item-row">
            <div class="cart-item-price">${finalPrice(p) * qty} <span>${p.currency}</span></div>
            <div class="cart-item-controls">
              <div class="cart-qty">
                <button class="cart-qty-btn" onclick="cartChangeQty(${idx},-1)">−</button>
                <span class="cart-qty-num" id="cartQty${idx}">${qty}</span>
                <button class="cart-qty-btn" onclick="cartChangeQty(${idx},+1)">+</button>
              </div>
              <button class="cart-item-del" onclick="cartRemove(${idx})" aria-label="Удалить">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>`;
      list.appendChild(div);
    });

    _renderCartFooter();
    _updateStepIndicator(1);
    document.getElementById('cartFooter').classList.add('visible');
    document.getElementById('cartNextBtn').style.display = '';
    document.getElementById('cartBackBtn').style.display = 'none';
    document.getElementById('cartNextLabel').textContent = 'Перейти к оформлению';
  }

  /* ── Change qty ── */
  function cartChangeQty(idx, delta) {
    const entry = cartItems.get(idx);
    if (!entry) return;
    const newQty = entry.qty + delta;
    if (newQty <= 0) { cartRemove(idx); return; }
    entry.qty = newQty;
    const qtyEl   = document.getElementById(`cartQty${idx}`);
    const priceEl = document.querySelector(`.cart-item[data-cart-idx="${idx}"] .cart-item-price`);
    if (qtyEl)   qtyEl.textContent   = newQty;
    if (priceEl) priceEl.innerHTML   = `${finalPrice(entry.p) * newQty} <span>${entry.p.currency}</span>`;
    _updateCartBadge();
    _renderCartFooter();
  }

  /* ── Remove ── */
  function cartRemove(idx) {
    cartItems.delete(idx);
    const el = document.querySelector(`.cart-item[data-cart-idx="${idx}"]`);
    if (el) {
      el.classList.add('removing');
      setTimeout(() => { _renderCartItems(); _updateCartBadge(); }, 310);
    } else {
      _renderCartItems(); _updateCartBadge();
    }
  }

  /* ── Card greeting text counter ── */
  const cardTextEl = document.getElementById('cardText');
  if (cardTextEl) {
    cardTextEl.addEventListener('input', function() {
      const cnt = document.getElementById('cardTextCount');
      if (cnt) cnt.textContent = this.value.length;
    });
  }

  /* ── Schedule toggle ── */
  window.setSchedule = function(mode, btn) {
    document.querySelectorAll('.cart-schedule-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const wrap = document.getElementById('schedDateTimeWrap');
    if (wrap) wrap.style.display = mode === 'later' ? 'block' : 'none';
  };

  /* ── Extras ── */
  function toggleExtra(key) {
    const e   = extras[key];
    e.selected = !e.selected;
    // Show/hide card text field when card extra is toggled
    if (key === 'card') {
      const wrap = document.getElementById('cartCardTextWrap');
      if (wrap) wrap.style.display = e.selected ? 'block' : 'none';
    }
    const row  = document.getElementById('extra' + key.charAt(0).toUpperCase() + key.slice(1));
    if (row) row.classList.toggle('selected', e.selected);
    _renderCartFooter();
  }
  function changeExtraQty(key, delta) {
    const e = extras[key];
    e.qty   = Math.max(1, e.qty + delta);
    const numEl = document.getElementById(key + 'QtyNum');
    const prEl  = document.getElementById(key + 'Price');
    if (numEl) numEl.textContent = e.qty;
    if (prEl)  prEl.textContent  = (e.price * e.qty) + ' TJS';
    _renderCartFooter();
  }

  /* ── Footer totals ── */
  function _renderCartFooter() {
    const { sub, ext, delivery, total } = _calcTotal();
    const totalEl = document.getElementById('cartFooterTotal');
    const noteEl  = document.getElementById('cartFooterNote');
    if (totalEl) totalEl.innerHTML = total + ' <span>TJS</span>';
    if (noteEl) {
      let parts = [];
      if (sub)      parts.push('товары ' + sub + ' TJS');
      if (ext)      parts.push('добавки ' + ext + ' TJS');
      if (delivery) parts.push('доставка ' + delivery + ' TJS');
      noteEl.textContent = parts.join(' · ');
    }
  }

  /* ── Steps ── */
  function _updateStepIndicator(step) {
    cartStep = step;
    [1,2,3].forEach(n => {
      const el = document.getElementById('cartStep' + n + 'Ind');
      if (!el) return;
      el.classList.remove('active','done');
      if (n < step) el.classList.add('done');
      else if (n === step) el.classList.add('active');
    });
  }

  // Global order number for the session
  window._currentOrderNum = '';

  function cartNextStep() {
    if (cartStep === 1) {
      if (cartItems.size === 0) return;
      // Go to step 2
      document.getElementById('cartViewStep1').style.display = 'none';
      document.getElementById('cartViewStep2').style.display = 'block';
      document.getElementById('cartViewStep3').style.display = 'none';
      _renderOrderSummary();
      _updateStepIndicator(2);
      // Sync card text field visibility with current card selection
      const cardWrap = document.getElementById('cartCardTextWrap');
      if (cardWrap) cardWrap.style.display = extras.card.selected ? 'block' : 'none';
      document.getElementById('cartNextLabel').textContent = 'Выбрать соцсеть →';
      document.getElementById('cartBackBtn').style.display = 'flex';
      document.getElementById('cartBody').scrollTop = 0;
    } else if (cartStep === 2) {
      // Validate form
      if (!_validateForm()) return;
      // Step 3 — social network selector
      window._currentOrderNum = '#GULREZ-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('cartOrderNum').textContent = window._currentOrderNum;
      // Reset to choose view
      const choose = document.getElementById('cartSocialChoose');
      const done   = document.getElementById('cartSocialDone');
      if (choose) choose.style.display = 'block';
      if (done)   done.style.display   = 'none';
      document.getElementById('cartViewStep1').style.display = 'none';
      document.getElementById('cartViewStep2').style.display = 'none';
      document.getElementById('cartViewStep3').style.display = 'block';
      _updateStepIndicator(3);
      document.getElementById('cartNextBtn').style.display = 'none';
      document.getElementById('cartBackBtn').style.display = 'flex';
      document.getElementById('cartFooter').classList.remove('visible');
      document.getElementById('cartBody').scrollTop = 0;
    }
  }

  function cartPrevStep() {
    if (cartStep === 3) {
      // Step 3 → Step 2
      document.getElementById('cartViewStep1').style.display = 'none';
      document.getElementById('cartViewStep2').style.display = 'block';
      document.getElementById('cartViewStep3').style.display = 'none';
      _updateStepIndicator(2);
      document.getElementById('cartNextLabel').textContent = 'Выбрать соцсеть →';
      document.getElementById('cartNextBtn').style.display = '';
      document.getElementById('cartBackBtn').style.display = 'flex';
      document.getElementById('cartFooter').classList.add('visible');
    } else {
      // Step 2 → Step 1
      document.getElementById('cartViewStep1').style.display = 'block';
      document.getElementById('cartViewStep2').style.display = 'none';
      document.getElementById('cartViewStep3').style.display = 'none';
      _updateStepIndicator(1);
      document.getElementById('cartNextLabel').textContent = 'Перейти к оформлению';
      document.getElementById('cartBackBtn').style.display = 'none';
      document.getElementById('cartFooter').classList.add('visible');
    }
    document.getElementById('cartBody').scrollTop = 0;
  }

  /* ── Recipient toggle ── */
  function setRecipient(type) {
    cartRecipient = type;
    document.getElementById('recSelf').classList.toggle('active',  type === 'self');
    document.getElementById('recOther').classList.toggle('active', type === 'other');
    document.getElementById('formSelf').style.display  = type === 'self'  ? 'block' : 'none';
    document.getElementById('formOther').style.display = type === 'other' ? 'block' : 'none';
    // Clear invalid states on switch
    document.querySelectorAll('.cart-input').forEach(el => el.classList.remove('invalid'));
  }

  /* ── Order summary (mini) ── */
  function _renderOrderSummary() {
    const { sub, ext, delivery, total } = _calcTotal();
    const el = document.getElementById('cartOrderSummary');
    if (!el) return;
    let rows = '';
    cartItems.forEach(({ p, qty }, idx) => {
      const tp = _getTranslatedProduct(idx);
      const name = tp ? tp.title : p.title;
      rows += `<div class="cart-summary-row"><span>${name} × ${qty}</span><strong>${finalPrice(p) * qty} TJS</strong></div>`;
    });
    Object.entries(extras).forEach(([k, e]) => {
      if (e.selected) rows += `<div class="cart-summary-row"><span>${e.name}${e.qty > 1 ? ' × ' + e.qty : ''}</span><strong>${e.price === 0 ? 'Бесплатно' : (e.price * e.qty + ' TJS')}</strong></div>`;
    });
    rows += `<div class="cart-summary-row"><span>Доставка</span><strong>${delivery} TJS</strong></div>`;
    rows += `<div class="cart-summary-row total"><span>Итого</span><span>${total} TJS</span></div>`;
    el.innerHTML = rows;
  }

  /* ── Phone inputs: digits only, auto-format, max 9 ── */
  ['selfPhone','otherRecPhone','otherSenderPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function() {
      const raw = this.value.replace(/\D/g,'').slice(0,9);
      if      (raw.length > 7) this.value = raw.slice(0,2)+' '+raw.slice(2,5)+' '+raw.slice(5,7)+' '+raw.slice(7);
      else if (raw.length > 5) this.value = raw.slice(0,2)+' '+raw.slice(2,5)+' '+raw.slice(5);
      else if (raw.length > 2) this.value = raw.slice(0,2)+' '+raw.slice(2);
      else                     this.value = raw;
    });
  });

  /* ── Validation ── */
  function _validateForm() {
    const phoneIds = cartRecipient === 'self'
      ? ['selfPhone'] : ['otherRecPhone','otherSenderPhone'];
    const textFields = cartRecipient === 'self'
      ? ['selfName','selfAddress'] : ['otherRecName','otherAddress'];
    let ok = true;

    // Validate text fields
    textFields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('invalid','valid');
      if (!el.value.trim()) { el.classList.add('invalid'); ok = false; }
      else el.classList.add('valid');
    });

    // Validate phone fields (exactly 9 digits)
    phoneIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const group = el.closest('.cart-phone-group');
      const digits = el.value.replace(/\D/g,'');
      if (group) {
        group.classList.remove('invalid','valid');
        if (digits.length !== 9) { group.classList.add('invalid'); ok = false; }
        else group.classList.add('valid');
      }
    });

    if (!ok) {
      showToast('Заполните все поля — номер телефона ровно 9 цифр');
      const inv = document.querySelector('.cart-input.invalid, .cart-phone-group.invalid input');
      if (inv) inv.focus();
    }
    return ok;
  }

  /* ── Build order message text ── */
  function _buildOrderMessage() {
    const orderNum = window._currentOrderNum || '#GULREZ-????';
    let msg = `🌸 Новый заказ GULREZ\n${orderNum}\n\n`;

    // Items
    msg += '📦 Состав заказа:\n';
    cartItems.forEach(({ p, qty }, idx) => {
      const tp = _getTranslatedProduct(idx);
      const name = tp ? tp.title : p.title;
      msg += `• ${name} × ${qty} — ${finalPrice(p) * qty} TJS\n`;
    });
    // Extras
    Object.values(extras).forEach(e => {
      if (e.selected) msg += `• ${e.name}${e.qty > 1 ? ' × ' + e.qty : ''} — ${e.price === 0 ? 'Бесплатно' : (e.price * e.qty + ' TJS')}\n`;
    });
    const { delivery, total } = _calcTotal();
    msg += `• Доставка — ${delivery} TJS\n`;
    msg += `\n💰 Итого: ${total} TJS\n`;

    // Recipient info
    msg += '\n📋 Данные:\n';
    if (cartRecipient === 'self') {
      const name    = document.getElementById('selfName')?.value.trim() || '';
      const phone   = document.getElementById('selfPhone')?.value.trim() || '';
      const address = document.getElementById('selfAddress')?.value.trim() || '';
      const comment = document.getElementById('selfComment')?.value.trim() || '';
      msg += `👤 Имя: ${name}\n`;
      msg += `📱 Телефон: +992 ${phone}\n`;
      msg += `🏠 Адрес: ${address}\n`;
      if (comment) msg += `💬 Комментарий: ${comment}\n`;
    } else {
      const recName      = document.getElementById('otherRecName')?.value.trim() || '';
      const recPhone     = document.getElementById('otherRecPhone')?.value.trim() || '';
      const senderPhone  = document.getElementById('otherSenderPhone')?.value.trim() || '';
      const address      = document.getElementById('otherAddress')?.value.trim() || '';
      const comment      = document.getElementById('otherComment')?.value.trim() || '';
      msg += `🎁 Получатель: ${recName}\n`;
      msg += `📱 Телефон получателя: +992 ${recPhone}\n`;
      msg += `📱 Ваш телефон: +992 ${senderPhone}\n`;
      msg += `🏠 Адрес доставки: ${address}\n`;
      if (comment) msg += `💬 Комментарий: ${comment}\n`;
    }

    // Greeting card text
    if (extras.card && extras.card.selected) {
      const cardText = document.getElementById('cardText')?.value.trim() || '';
      if (cardText) msg += `\n💌 Текст открытки:\n"${cardText}"\n`;
    }

    // Schedule
    const schedLater = document.getElementById('schedLater');
    if (schedLater && schedLater.classList.contains('active')) {
      const dt = document.getElementById('schedDateTime')?.value;
      if (dt) {
        const d = new Date(dt);
        const formatted = d.toLocaleString('ru-RU', { day:'2-digit', month:'long', hour:'2-digit', minute:'2-digit' });
        msg += `\n🗓 Желаемое время доставки: ${formatted}\n`;
      }
    } else {
      msg += `\n🗓 Доставка: как можно скорее\n`;
    }

    return msg;
  }

  /* ── Place order via WhatsApp ── */
  window.placeOrderWhatsApp = function() {
    const msg = _buildOrderMessage();
    const url = 'https://wa.me/79965450272?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
    _showOrderSentConfirmation(false);
  };

  /* ── Place order via Instagram ── */
  window.placeOrderInstagram = function() {
    const msg = _buildOrderMessage();
    // Copy message to clipboard, then open Instagram DM
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msg).catch(() => {});
    } else {
      // Fallback: create temp textarea
      const ta = document.createElement('textarea');
      ta.value = msg; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(_) {}
      document.body.removeChild(ta);
    }
    window.open('https://ig.me/m/xalilovv.o9', '_blank');
    _showOrderSentConfirmation(true);
  };

  function _showOrderSentConfirmation(isInstagram) {
    const choose = document.getElementById('cartSocialChoose');
    const done   = document.getElementById('cartSocialDone');
    const igHint = document.getElementById('cartIgHint');
    const numEl  = document.getElementById('cartOrderNumDone');
    if (choose) choose.style.display = 'none';
    if (done)   done.style.display   = 'block';
    if (numEl)  numEl.textContent    = window._currentOrderNum || '';
    if (igHint) igHint.style.display = isInstagram ? 'block' : 'none';
    document.getElementById('cartBackBtn').style.display = 'none';
    document.getElementById('cartBody').scrollTop = 0;
    // Clear cart after sending
    setTimeout(() => {
      cartItems.clear();
      Object.keys(extras).forEach(k => { extras[k].selected = false; extras[k].qty = 1; });
      _updateCartBadge();
      // Reset card text
      const cardText = document.getElementById('cardText');
      if (cardText) { cardText.value = ''; }
      const cardCount = document.getElementById('cardTextCount');
      if (cardCount) cardCount.textContent = '0';
      // Reset schedule
      const schedNow = document.getElementById('schedNow');
      if (schedNow) schedNow.classList.add('active');
      const schedLater = document.getElementById('schedLater');
      if (schedLater) schedLater.classList.remove('active');
      const schedWrap = document.getElementById('schedDateTimeWrap');
      if (schedWrap) schedWrap.style.display = 'none';
    }, 300);
  }

  /* ── Swipe down to close cart (mobile) ── */
  (function() {
    const panel = document.getElementById('cartPanel');
    if (!panel) return;
    let startY = 0, dragging = false;
    panel.addEventListener('touchstart', e => {
      if (e.target.closest('.cart-body')) return;
      startY = e.touches[0].clientY; dragging = true;
      panel.style.transition = 'none';
    }, { passive: true });
    panel.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    panel.addEventListener('touchend', e => {
      if (!dragging) return; dragging = false;
      const dy = e.changedTouches[0].clientY - startY;
      panel.style.transition = '';
      if (dy > 110) { closeCart(); panel.style.transform = ''; }
      else panel.style.transform = '';
    });
  })();


  /* ══════════════════════════════════════════════════
     WISHLIST SYSTEM — full rewrite
  ══════════════════════════════════════════════════ */
  const wishlist = new Map(); // key: productIndex → {product, qty}

  /* ── helpers ── */
  function _getTranslatedProduct(index) {
    const p = products[index];
    if (!p) return null;
    const lang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'RU';
    if (lang === 'RU') return p;
    const trans = window._productTranslations && window._productTranslations[p.id];
    const override = trans && trans[lang];
    if (!override) return p;
    return {
      ...p,
      title: override.title || p.title,
      desc:  override.desc  || p.desc,
      color: override.color || p.color,
      composition: override.composition || p.composition,
      size:  override.size  || p.size
    };
  }

  /* ── Auth state (filled on page load) ── */
  window._isLoggedIn = false;

  /* ── Show login-required popup ── */
  function _requireLoginToast() {
    const msg = '<span style="display:inline-flex;align-items:center;gap:8px">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
      'Войдите в аккаунт, чтобы сохранить в избранное&nbsp;&nbsp;' +
      '<a href="login.html" style="color:#fff;text-decoration:underline;font-weight:700">Войти</a>' +
      '</span>';
    const toast = document.getElementById('toast');
    toast.innerHTML = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.classList.remove('show'); toast.innerHTML = ''; }, 4000);
  }

  /* ── Core: call server to toggle, then sync UI ── */
  function _applyFavoriteToggle(productIdx, modalLikeBtnEl) {
    const p = products[productIdx];
    const productId = p.id;

    fetch(`/api/favorites/${productId}`, { method: 'POST', credentials: 'same-origin' })
      .then(r => r.json())
      .then(data => {
        if (data.error) { showToast(data.error); return; }

        const isNowLiked = data.liked;

        // Update wishlist state
        if (isNowLiked) {
          wishlist.set(productIdx, { p, qty: 1 });
        } else {
          wishlist.delete(productIdx);
        }

        // Sync product likes count in local array
        products[productIdx] = { ...p, likes: data.likes };

        // Sync card like button
        const cardBtn = document.querySelector(`.product-card[data-product-index="${productIdx}"] .like-btn`);
        if (cardBtn) cardBtn.classList.toggle('liked', isNowLiked);

        // Sync modal like button
        if (modalLikeBtnEl) modalLikeBtnEl.classList.toggle('liked', isNowLiked);
        const openModalLikeBtn = document.getElementById('modalLikeBtn');
        if (openModalLikeBtn && window._currentProductIndex === productIdx) {
          openModalLikeBtn.classList.toggle('liked', isNowLiked);
          // Update live likes count in modal
          const likesEl = document.getElementById('modalLikes');
          if (likesEl) {
            likesEl.innerHTML = '<strong>' + data.likes + '</strong>\u00a0' + (window._i18n_modalLikes || 'человек добавили в избранное');
          }
        }

        if (isNowLiked) {
          const triggerBtn = cardBtn || modalLikeBtnEl || openModalLikeBtn;
          if (triggerBtn) _floatHearts(triggerBtn, 3);
          showToast(window._i18n_toastLiked || 'Добавлено в избранное ♡');
        } else {
          showToast(window._i18n_modalUnlikedToast || 'Убрано из избранного');
        }

        _updateWishlistBadge();
        if (document.getElementById('wishlistPanel').classList.contains('open')) {
          _renderWishlistPanel();
        }
      })
      .catch(() => showToast('Ошибка соединения'));
  }

  /* ── Toggle like on product card ── */
  function toggleLike(btn) {
    if (!window._isLoggedIn) { _requireLoginToast(); return; }
    const card = btn.closest('.product-card[data-product-index]');
    if (!card) return;
    const idx = parseInt(card.getAttribute('data-product-index'));
    _applyFavoriteToggle(idx, null);
  }

  /* ── Modal like ── */
  function toggleModalLike(e) {
    e.stopPropagation();
    if (!window._isLoggedIn) { _requireLoginToast(); return; }
    const btn = document.getElementById('modalLikeBtn');
    const idx = window._currentProductIndex;
    if (idx === null || idx === undefined) return;
    _applyFavoriteToggle(idx, btn);
  }

  /* ── Floating heart burst ── */
  function _floatHearts(btn, count) {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const emojis = ['♡', '❤', '✿', '♡'];

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const h = document.createElement('span');
        h.className = 'wl-heart-particle';
        h.textContent = emojis[i % emojis.length];
        const angle  = -90 + (Math.random() - 0.5) * 110;  // mostly upward fan
        const dist   = 55 + Math.random() * 55;
        const rad    = angle * Math.PI / 180;
        const tx     = Math.cos(rad) * dist;
        const ty     = Math.sin(rad) * dist;
        const scale  = 0.8 + Math.random() * 0.7;
        h.style.cssText = `
          position:fixed; pointer-events:none; z-index:9999;
          left:${cx}px; top:${cy}px;
          font-size:${16 + Math.random()*10}px;
          color:var(--rose);
          transform: translate(-50%,-50%) scale(${scale});
          opacity: 1;
          transition: transform ${0.7 + Math.random()*0.4}s cubic-bezier(0.2,0.8,0.4,1),
                      opacity   ${0.6 + Math.random()*0.3}s ease ${0.25}s;
        `;
        document.body.appendChild(h);
        requestAnimationFrame(() => {
          h.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale * 1.1}) rotate(${(Math.random()-0.5)*30}deg)`;
          h.style.opacity   = '0';
        });
        setTimeout(() => h.remove(), 1200);
      }, i * 80);
    }
  }

  /* ── Badge on header heart icon ── */
  function _updateWishlistBadge() {
    const badge = document.getElementById('wishlistBadge');
    const count = wishlist.size;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
      badge.style.animation = 'none';
      requestAnimationFrame(() => { badge.style.animation = ''; });
    } else {
      badge.style.display = 'none';
    }
    const pill = document.getElementById('wishlistCountPill');
    if (pill) {
      pill.textContent = count;
      pill.classList.remove('bump');
      requestAnimationFrame(() => pill.classList.add('bump'));
    }
  }

  /* ── Open / Close panel ── */
  function openWishlist() {
    _renderWishlistPanel();
    document.getElementById('wishlistPanel').classList.add('open');
    document.getElementById('wishlistOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeWishlist() {
    document.getElementById('wishlistPanel').classList.remove('open');
    document.getElementById('wishlistOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Render panel ── */
  function _renderWishlistPanel() {
    const body   = document.getElementById('wishlistBody');
    const empty  = document.getElementById('wishlistEmpty');
    const footer = document.getElementById('wishlistFooter');
    const pill   = document.getElementById('wishlistCountPill');
    if (!body) return;

    pill.textContent = wishlist.size;

    if (wishlist.size === 0) {
      body.innerHTML = '';
      empty.classList.add('visible');
      footer.classList.remove('visible');
      return;
    }

    empty.classList.remove('visible');
    footer.classList.add('visible');

    // preserve existing cards for smooth QTY updates
    const existingCards = new Set(Array.from(body.querySelectorAll('.wl-card')).map(c => +c.dataset.wlIndex));
    const newKeys = new Set(wishlist.keys());

    // Remove cards no longer in wishlist
    existingCards.forEach(idx => {
      if (!newKeys.has(idx)) {
        const el = body.querySelector(`.wl-card[data-wl-index="${idx}"]`);
        if (el) { el.classList.add('removing'); setTimeout(() => el.remove(), 320); }
      }
    });

    let total = 0;
    wishlist.forEach(({ p, qty }, idx) => {
      total += finalPrice(p) * qty;
      const tp    = _getTranslatedProduct(idx);
      const title = tp ? tp.title : p.title;
      const desc  = tp ? tp.desc  : p.desc;
      const hasDisc = p.discount > 0;
      const wlBadge = hasDisc
        ? `<span class="wl-img-tag wl-img-tag--discount">-${p.discount}%</span>`
        : (p.tag ? `<span class="wl-img-tag" style="background:${p.tagBg}">${p.tag}</span>` : '');

      let card = body.querySelector(`.wl-card[data-wl-index="${idx}"]`);

      if (!card) {
        // Create new card
        card = document.createElement('div');
        card.className = 'wl-card';
        card.dataset.wlIndex = idx;
        card.style.animationDelay = (Array.from(wishlist.keys()).indexOf(idx) * 0.06) + 's';
        body.appendChild(card);
      }

      card.innerHTML = `
        <div class="wl-img-wrap" onclick="closeWishlist(); setTimeout(()=>openModal(${idx}),120)">
          <img class="wl-img" src="${p.images[0]}" alt="${title}" loading="lazy">
          ${wlBadge}
        </div>
        <div class="wl-info">
          <div>
            <div class="wl-name" onclick="closeWishlist(); setTimeout(()=>openModal(${idx}),120)">${title}</div>
            <p class="wl-desc">${desc}</p>
          </div>
          <div class="wl-bottom">
            <div class="wl-price">${finalPrice(p) * qty} <span>${p.currency}</span></div>
            <div class="wl-actions">
              <button class="wl-btn-cart" id="wlCartBtn${idx}" onclick="wlAddToCart(${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" width="12" height="12">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                ${window._i18n_btnCart || 'В корзину'}
              </button>
              <button class="wl-btn-remove" onclick="wlRemove(${idx})" aria-label="Удалить">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"
                     stroke-linecap="round" fill="none" width="13" height="13">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>`;
    });

    // Footer total
    const note = document.getElementById('wlItemsNote');
    if (note) note.textContent = wishlist.size + ' ' + (wishlist.size === 1 ? 'товар' : 'товара');
    document.getElementById('wlFooterTotal').innerHTML = total + ' <span>TJS</span>';
  }

  /* ── Change qty in wishlist ── */
  function wlChangeQty(idx, delta) {
    const entry = wishlist.get(idx);
    if (!entry) return;
    const newQty = Math.max(1, entry.qty + delta);
    wishlist.set(idx, { ...entry, qty: newQty });

    // Update qty display and price inline without full re-render
    const qtyEl   = document.getElementById(`wlQty${idx}`);
    const priceEl = document.querySelector(`.wl-card[data-wl-index="${idx}"] .wl-price`);
    if (qtyEl)   qtyEl.textContent = newQty;
    if (priceEl) priceEl.innerHTML = `${finalPrice(entry.p) * newQty} <span>${entry.p.currency}</span>`;

    // Update footer total
    let total = 0;
    wishlist.forEach(({ p, qty }) => total += finalPrice(p) * qty);
    document.getElementById('wlFooterTotal').innerHTML = total + ' <span>TJS</span>';
    const note = document.getElementById('wlItemsNote');
    if (note) note.textContent = wishlist.size + ' ' + (wishlist.size === 1 ? 'товар' : 'товара');
  }

  /* ── Remove from wishlist ── */
  function wlRemove(idx) {
    wishlist.delete(idx);

    // Un-like card on page
    const pageCard = document.querySelector(`.product-card[data-product-index="${idx}"]`);
    if (pageCard) pageCard.querySelector('.like-btn')?.classList.remove('liked');

    // Animate out
    const wlCard = document.querySelector(`.wl-card[data-wl-index="${idx}"]`);
    if (wlCard) {
      wlCard.classList.add('removing');
      setTimeout(() => {
        _renderWishlistPanel();
        _updateWishlistBadge();
      }, 330);
    } else {
      _renderWishlistPanel();
      _updateWishlistBadge();
    }

    showToast(window._i18n_modalUnlikedToast || 'Убрано из избранного');
  }

  // wlAddToCart — defined in cart system above

  // addAllToCart — defined in cart system above

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeWishlist();
      closeCart();
    }
  });

  /* ── Swipe down to close modal on mobile ── */
  (function() {
    const sheet = document.getElementById('modalSheet');
    if (!sheet) return;
    let startY = 0, isDragging = false, startTransform = 0;

    sheet.addEventListener('touchstart', e => {
      // Only from handle or top area
      if (e.target.closest('.modal-content')) return; // don't hijack scroll
      startY = e.touches[0].clientY;
      isDragging = true;
      startTransform = 0;
      sheet.style.transition = 'none';
    }, { passive: true });

    sheet.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) {
        sheet.style.transform = `translateY(${dy}px)`;
      }
    }, { passive: true });

    sheet.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const dy = e.changedTouches[0].clientY - startY;
      sheet.style.transition = '';
      if (dy > 120) {
        closeModal();
      } else {
        sheet.style.transform = '';
      }
    });
  })();

  /* ── Swipe down to close wishlist panel on mobile ── */
  (function() {
    const panel = document.getElementById('wishlistPanel');
    if (!panel) return;
    let startY = 0, isDragging = false;

    panel.addEventListener('touchstart', e => {
      if (e.target.closest('.wishlist-body')) return;
      startY = e.touches[0].clientY;
      isDragging = true;
      panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) panel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });

    panel.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      const dy = e.changedTouches[0].clientY - startY;
      panel.style.transition = '';
      if (dy > 100) {
        closeWishlist();
        panel.style.transform = '';
      } else {
        panel.style.transform = '';
      }
    });
  })();
  let toastTimer;
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ─── PRODUCT GALLERY ─── */
  function galleryGoTo(gallery, index) {
    const track = gallery.querySelector('.gallery-track');
    const dots = gallery.querySelectorAll('.gallery-dot');
    const counter = gallery.querySelector('.gallery-counter');
    const total = gallery.querySelectorAll('.gallery-slide').length;
    // clamp
    index = (index + total) % total;
    gallery.dataset.current = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
    if (counter) counter.textContent = `${index + 1} / ${total}`;
  }

  function galleryPrev(btn, e) {
    if (e) e.stopPropagation();
    const gallery = btn.closest('.product-gallery');
    galleryGoTo(gallery, parseInt(gallery.dataset.current) - 1);
  }

  function galleryNext(btn, e) {
    if (e) e.stopPropagation();
    const gallery = btn.closest('.product-gallery');
    galleryGoTo(gallery, parseInt(gallery.dataset.current) + 1);
  }

  // Touch/swipe support for galleries
  document.querySelectorAll('.product-gallery').forEach(gallery => {
    let startX = 0;
    gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    gallery.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        e.preventDefault(); // prevent synthetic click from opening modal after swipe
        diff > 0 ? galleryGoTo(gallery, parseInt(gallery.dataset.current) + 1)
                 : galleryGoTo(gallery, parseInt(gallery.dataset.current) - 1);
      }
    }, { passive: false });
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  // Load products from API
  loadCatalog();


  /* ─── CATALOG — load from API ─── */
  let products = [];

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderProductCard(p, idx) {
    const delay = (idx % 4) * 0.07;
    const disc  = p.discount > 0;
    const final = disc ? Math.round(p.price * (1 - p.discount / 100)) : p.price;
    const priceHtml = disc
      ? `<span class="product-price-old">${p.price}</span><span class="product-price-new">${final} <span>${p.currency}</span></span>`
      : `${p.price} <span>${p.currency}</span>`;

    const slides = p.images.map(src =>
      `<div class="gallery-slide"><img src="${escHtml(src)}" alt="${escHtml(p.title)}" loading="lazy"></div>`
    ).join('');

    const dots = p.images.map((_, i) =>
      `<button class="gallery-dot${i===0?' active':''}" onclick="event.stopPropagation()"></button>`
    ).join('');

    const arrows = p.images.length > 1
      ? `<button class="gallery-arrow gallery-arrow-prev" onclick="galleryPrev(this,event)"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
         <button class="gallery-arrow gallery-arrow-next" onclick="galleryNext(this,event)"><svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg></button>`
      : '';

    // Discount takes priority over tag — only one badge shown top-left
    const topBadge = disc
      ? `<span class="product-tag product-tag--discount">-${p.discount}%</span>`
      : (p.tag ? `<span class="product-tag" style="background:${escHtml(p.tagBg)}">${escHtml(p.tag)}</span>` : '');

    return `
    <div class="product-card fade-up" data-product-index="${idx}" data-product-id="${p.id}" onclick="openModal(${idx})" style="cursor:pointer;transition-delay:${delay}s">
      <div class="product-img">
        <div class="product-gallery" data-current="0">
          <div class="gallery-track">${slides}</div>
          ${arrows}
          <div class="gallery-dots">${dots}</div>
          <span class="gallery-counter">1 / ${p.images.length}</span>
        </div>
        <button class="like-btn" onclick="event.stopPropagation();toggleLike(this)" title="В избранное">
          <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        ${topBadge}
      </div>
      <div class="product-body">
        <h3 class="product-name">${escHtml(p.title)}</h3>
        <p class="product-desc">${escHtml(p.desc)}</p>
        <div class="product-footer">
          <span class="product-price">${priceHtml}</span>
          <button class="btn-cart" onclick="event.stopPropagation();addToCart(this)">В корзину</button>
        </div>
      </div>
    </div>`;
  }

  async function loadCatalog() {
    try {
      // Check auth + fetch products + fetch saved favorites in parallel
      const [meRes, productsRes] = await Promise.all([
        fetch('/api/me', { credentials: 'same-origin' }),
        fetch('/api/products')
      ]);
      const meData = await meRes.json();
      window._isLoggedIn = !!meData.loggedIn;
      window._userLogin   = meData.login || null;

      // Boot reviews section
      initReviews(meData);

      const data = await productsRes.json();
      products = data;

      // Build lookup maps for translation-aware rendering
      window._productsById = {};
      window._productTranslations = {};
      data.forEach(p => {
        window._productsById[p.id] = p;
        if (p.translations) window._productTranslations[p.id] = p.translations;
      });

      const grid    = document.getElementById('productsGrid');
      const loading = document.getElementById('catalogLoading');
      if (loading) loading.remove();
      if (!data.length) {
        grid.innerHTML = '<p style="text-align:center;color:var(--clay);padding:60px 0">Товаров пока нет</p>';
        return;
      }
      grid.innerHTML = data.map((p, i) => renderProductCard(p, i)).join('');

      // Restore saved favorites for logged-in users
      if (window._isLoggedIn) {
        const favRes  = await fetch('/api/favorites', { credentials: 'same-origin' });
        const favData = await favRes.json();
        const favIds  = new Set(favData.ids || []);
        products.forEach((p, idx) => {
          if (favIds.has(p.id)) {
            wishlist.set(idx, { p, qty: 1 });
            const btn = grid.querySelector(`.product-card[data-product-index="${idx}"] .like-btn`);
            if (btn) btn.classList.add('liked');
          }
        });
        _updateWishlistBadge();
      }

      // Observe new cards for fade-in
      grid.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
      // Attach touch-swipe to new galleries
      grid.querySelectorAll('.product-gallery').forEach(gallery => {
        let startX = 0;
        gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        gallery.addEventListener('touchend', e => {
          const diff = startX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            e.preventDefault();
            diff > 0 ? galleryGoTo(gallery, parseInt(gallery.dataset.current)+1)
                     : galleryGoTo(gallery, parseInt(gallery.dataset.current)-1);
          }
        }, { passive: false });
      });
    } catch(err) {
      console.error('loadCatalog error', err);
    }
  }

  /* ─── PRODUCT MODAL ─── */


  let modalQty = 1;
  let currentProduct = null;

  function openModal(index) {
    const p = products[index];
    currentProduct = p;
    window._currentProductIndex = index;
    window._currentProductId = p.id;
    modalQty = 1;

    // Use translated product data if available
    const lang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'RU';
    const trans = window._productTranslations && window._productTranslations[p.id];
    const override = (lang !== 'RU' && trans && trans[lang]) ? trans[lang] : null;
    const tp = override ? {
      title: override.title || p.title,
      desc:  override.desc  || p.desc,
      info: p.info.map((item, i) => {
        if (i === 0) return { ...item, value: override.composition || item.value };
        if (i === 1) return { ...item, value: override.size  || item.value };
        if (i === 2) return { ...item, value: override.color || item.value };
        return item;
      })
    } : null;

    // Discount badge takes priority over tag in modal too
    const tagEl = document.getElementById('modalTag');
    const disc  = p.discount > 0;
    if (disc) {
      tagEl.textContent = `-${p.discount}%`;
      tagEl.style.background = '#d94f3d';
      tagEl.classList.add('modal-tag--discount');
      tagEl.style.display = '';
    } else if (p.tag) {
      tagEl.textContent = p.tag;
      tagEl.style.background = p.tagBg;
      tagEl.classList.remove('modal-tag--discount');
      tagEl.style.display = '';
    } else {
      tagEl.textContent = '';
      tagEl.style.display = 'none';
      tagEl.classList.remove('modal-tag--discount');
    }

    document.getElementById('modalTitle').textContent = tp ? tp.title : p.title;
    document.getElementById('modalDesc').textContent  = tp ? tp.desc  : p.desc;
    document.getElementById('modalQty').textContent = 1;
    document.getElementById('modalPriceBtn').textContent = finalPrice(p) + ' ' + p.currency;
    document.getElementById('modalLikes').innerHTML = '<strong>' + p.likes + '</strong>\u00a0' + (window._i18n_modalLikes || 'человек добавили в избранное');
    document.getElementById('modalLikeBtn').classList.remove('liked');

    const mainImg = document.getElementById('modalMainImg');
    mainImg.src = p.images[0];
    mainImg.alt = p.title;

    const thumbsEl = document.getElementById('modalThumbs');
    thumbsEl.innerHTML = p.images.map((src, i) =>
      '<div class="modal-thumb ' + (i === 0 ? 'active' : '') + '" onclick="switchModalImg(' + i + ', this)">' +
      '<img src="' + src + '" alt="' + p.title + ' ' + (i+1) + '" loading="lazy"></div>'
    ).join('');

    const gridEl = document.getElementById('modalInfoGrid');
    const infoData = p.info.map((orig, i) => ({
      icon:  orig.icon,
      label: (tp && tp.info && tp.info[i]) ? tp.info[i].label : orig.label,
      value: (tp && tp.info && tp.info[i]) ? tp.info[i].value : orig.value,
    }));
    gridEl.innerHTML = infoData.map(item =>
      '<div class="modal-info-card"><span class="modal-info-icon">' + item.icon + '</span>' +
      '<div><span class="modal-info-label">' + item.label + '</span>' +
      '<span class="modal-info-value">' + item.value + '</span></div></div>'
    ).join('');

    document.getElementById('productModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    // Sync like button state with wishlist
    const modalLikeBtn = document.getElementById('modalLikeBtn');
    if (wishlist.has(index)) {
      modalLikeBtn.classList.add('liked');
    } else {
      modalLikeBtn.classList.remove('liked');
    }
    // Scroll sheet to top
    document.getElementById('modalSheet').scrollTop = 0;
  }

  function closeModal() {
    document.getElementById('productModal').classList.remove('open');
    document.body.style.overflow = '';
    window._currentProductIndex = null;
    window._currentProductId = null;
  }

  function handleModalOverlayClick(e) {
    if (e.target === document.getElementById('productModal')) closeModal();
  }

  function switchModalImg(index, thumbEl) {
    if (!currentProduct) return;
    document.getElementById('modalMainImg').src = currentProduct.images[index];
    document.querySelectorAll('.modal-thumb').forEach((t, i) => t.classList.toggle('active', i === index));
  }

  function changeQty(delta) {
    modalQty = Math.max(1, modalQty + delta);
    document.getElementById('modalQty').textContent = modalQty;
    if (currentProduct) {
      document.getElementById('modalPriceBtn').textContent = (finalPrice(currentProduct) * modalQty) + ' ' + currentProduct.currency;
    }
  }

  // modalAddToCart — defined in cart system above

  /* ══════════════════════════════════════════════════
     SEARCH
  ══════════════════════════════════════════════════ */

  function openSearch() {
    document.getElementById('searchPanel').classList.add('open');
    document.getElementById('searchOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const inp = document.getElementById('searchInput');
      if (inp) inp.focus();
    }, 150);
  }

  function closeSearch() {
    document.getElementById('searchPanel').classList.remove('open');
    document.getElementById('searchOverlay').classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(clearSearch, 350);
  }

  function clearSearch() {
    const inp = document.getElementById('searchInput');
    if (inp) inp.value = '';
    const cb = document.getElementById('searchClearBtn');
    if (cb) cb.style.display = 'none';
    _setSearchView('initial');
  }

  function setSearch(term) {
    const inp = document.getElementById('searchInput');
    if (!inp) return;
    inp.value = term;
    doSearch(term);
    inp.focus();
  }

  function _setSearchView(view) {
    // view: 'initial' | 'results' | 'empty'
    document.getElementById('searchInitialState').style.display  = view === 'initial'  ? '' : 'none';
    document.getElementById('searchResultsArea').style.display   = view === 'results'  ? '' : 'none';
    document.getElementById('searchNoResults').style.display     = view === 'empty'    ? 'flex' : 'none';
  }

  function doSearch(q) {
    const query = (q || '').trim().toLowerCase();
    const cb = document.getElementById('searchClearBtn');
    if (cb) cb.style.display = query ? 'flex' : 'none';

    if (!query) { _setSearchView('initial'); return; }

    // Get translated product titles if language is active
    const lang = typeof getCurrentLang === 'function' ? getCurrentLang() : 'RU';
    const tProds = (typeof GULREZ_LANG !== 'undefined' && GULREZ_LANG[lang] && GULREZ_LANG[lang].products)
      ? GULREZ_LANG[lang].products : null;

    const hits = products.reduce((acc, p, idx) => {
      const tp = tProds ? tProds[idx] : null;
      const title = (tp ? tp.title : p.title).toLowerCase();
      const desc  = (tp ? tp.desc  : p.desc ).toLowerCase();
      const tag   = (tp ? tp.tag   : p.tag  ).toLowerCase();
      if (title.includes(query) || desc.includes(query) || tag.includes(query)) {
        acc.push({ p, idx, tp });
      }
      return acc;
    }, []);

    if (hits.length === 0) {
      _setSearchView('empty');
      const msg = document.getElementById('searchNoResultsMsg');
      if (msg) msg.textContent = 'Нет результатов для «' + q.trim() + '»';
      return;
    }

    _setSearchView('results');
    const countEl = document.getElementById('searchCountLabel');
    if (countEl) countEl.textContent = 'Найдено: ' + hits.length;

    const grid = document.getElementById('searchResultsGrid');
    grid.innerHTML = hits.map(({ p, idx, tp }) => {
      const title = tp ? tp.title : p.title;
      const desc  = tp ? tp.desc  : p.desc;
      const hasDisc = p.discount > 0;
      const srBadge = hasDisc
        ? '<span class="search-result-tag-badge search-result-tag-badge--discount">-' + p.discount + '%</span>'
        : (p.tag ? '<span class="search-result-tag-badge" style="background:' + p.tagBg + '">' + p.tag + '</span>' : '');
      return '<div class="search-result-card" onclick="closeSearch();setTimeout(()=>openModal(' + idx + '),200)">' +
        '<div class="search-result-img-wrap">' +
        '<img src="' + p.images[0] + '" alt="' + title + '" loading="lazy">' +
        srBadge +
        '</div>' +
        '<div class="search-result-body">' +
        '<div class="search-result-name">' + title + '</div>' +
        '<div class="search-result-desc-text">' + desc + '</div>' +
        '<div class="search-result-price-val">' + p.price + ' <span>' + p.currency + '</span></div>' +
        '</div></div>';
    }).join('');
  }

  /* ══════════════════════════════════════════════════
     REVIEWS SYSTEM
  ══════════════════════════════════════════════════ */

  let _reviews       = [];
  let _reviewRating  = 0;
  let _reviewIsAdmin = false;
  let _reviewsSort   = 'newest';

  const STAR_LABELS = ['', 'Плохо', 'Так себе', 'Неплохо', 'Хорошо', 'Отлично!'];

  /* ── Init ── */
  async function initReviews(meData) {
    // Show write-form or login prompt
    if (meData && meData.loggedIn) {
      _reviewIsAdmin = meData.role === 'admin';
      document.getElementById('reviewLoginPrompt').style.display = 'none';
      document.getElementById('reviewFormCard').style.display    = '';
      const av  = document.getElementById('reviewFormAvatar');
      const unn = document.getElementById('reviewFormUsername');
      if (av) {
        if (meData.avatar) {
          av.innerHTML = `<img src="/${meData.avatar}" alt="${meData.login}" class="rv-avatar-img">`;
          av.classList.add('rv-avatar--img');
        } else {
          av.textContent = meData.login.charAt(0).toUpperCase();
          av.classList.remove('rv-avatar--img');
        }
      }
      if (unn) unn.textContent = meData.login;
    }
    await loadReviews();
  }

  /* ── Load from server ── */
  async function loadReviews() {
    try {
      const res  = await fetch('/api/reviews', { credentials: 'same-origin' });
      const data = await res.json();
      _reviews = data.reviews || [];
      renderOverallStats(data.stats);
      renderReviews();
    } catch(e) {
      document.getElementById('reviewsLoading').style.display = 'none';
    }
  }

  /* ── Overall stats ── */
  function renderOverallStats(stats) {
    const scoreEl = document.getElementById('overallScore');
    const starsEl = document.getElementById('overallStars');
    const countEl = document.getElementById('overallCount');
    const bdEl    = document.getElementById('reviewsBreakdown');
    if (!scoreEl) return;

    const avg   = stats.avg || 0;
    const total = stats.total || 0;

    scoreEl.textContent = avg > 0 ? avg.toFixed(1) : '—';
    starsEl.innerHTML   = renderStarsHtml(avg, 'overall-star');
    countEl.textContent = _pluralRu(total, 'отзыв', 'отзыва', 'отзывов');

    // Breakdown bars (5→1)
    const counts = [0,0,0,0,0];
    _reviews.forEach(r => { if (r.rating >= 1 && r.rating <= 5) counts[r.rating-1]++; });
    bdEl.innerHTML = [5,4,3,2,1].map(v => {
      const pct = total > 0 ? Math.round((counts[v-1] / total) * 100) : 0;
      return `<div class="rbd-row">
        <span class="rbd-label">${v}</span>
        <svg class="rbd-star" viewBox="0 0 24 24" width="11" height="11" fill="var(--rose)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        <div class="rbd-bar-wrap"><div class="rbd-bar-fill" style="width:${pct}%"></div></div>
        <span class="rbd-pct">${pct}%</span>
      </div>`;
    }).join('');
  }

  /* ── Render list ── */
  function renderReviews() {
    const list    = document.getElementById('reviewsList');
    const loading = document.getElementById('reviewsLoading');
    const empty   = document.getElementById('reviewsEmpty');
    const ctrl    = document.getElementById('reviewsControls');
    const pill    = document.getElementById('reviewsCountPill');
    if (!list) return;

    if (loading) loading.style.display = 'none';

    if (!_reviews.length) {
      list.innerHTML = '';
      if (empty) empty.style.display = 'flex';
      if (ctrl)  ctrl.style.display  = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (ctrl)  ctrl.style.display  = 'flex';
    if (pill)  pill.textContent    = _pluralRu(_reviews.length, 'отзыв', 'отзыва', 'отзывов');

    const sorted = _sortedReviews();
    list.innerHTML = sorted.map(r => _reviewCardHtml(r)).join('');
    list.querySelectorAll('.rv-card.rv-new').forEach(el => {
      requestAnimationFrame(() => el.classList.remove('rv-new'));
    });
  }

  function _sortedReviews() {
    const arr = [..._reviews];
    if (_reviewsSort === 'top_rated')  arr.sort((a,b) => b.rating  - a.rating  || new Date(b.created_at)-new Date(a.created_at));
    else if (_reviewsSort === 'most_liked') arr.sort((a,b) => b.likes  - a.likes || new Date(b.created_at)-new Date(a.created_at));
    else arr.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    return arr;
  }

  function sortReviews(val) {
    _reviewsSort = val;
    renderReviews();
  }

  /* ── Single card HTML ── */
  function _reviewCardHtml(r) {
    const date     = _fmtDate(r.created_at);
    const initials = r.user_login.charAt(0).toUpperCase();
    const starsHtml= renderStarsHtml(r.rating, 'rv-star');
    const likeAct  = r.myReaction === 'like'    ? ' rv-react-active rv-react-like-active'    : '';
    const disAct   = r.myReaction === 'dislike' ? ' rv-react-active rv-react-dislike-active' : '';
    const adminDel = _reviewIsAdmin
      ? `<button class="rv-admin-del" onclick="deleteReview(${r.id})" title="Удалить отзыв">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
         </button>` : '';
    const avatarInner = r.user_avatar
      ? `<img src="/${r.user_avatar}" alt="${_escHtml(r.user_login)}" class="rv-avatar-img">`
      : initials;
    return `
    <div class="rv-card rv-new" data-rv-id="${r.id}">
      <div class="rv-card-header">
        <div class="rv-avatar${r.user_avatar ? ' rv-avatar--img' : ''}">${avatarInner}</div>
        <div class="rv-meta">
          <span class="rv-username">${_escHtml(r.user_login)}</span>
          <div class="rv-stars-row">${starsHtml}<span class="rv-date">${date}</span></div>
        </div>
        ${adminDel}
      </div>
      <p class="rv-text">${_escHtml(r.text)}</p>
      ${(r.photos && r.photos.length) ? `<div class="rv-photos">${r.photos.map(p => `<img src="/${p}" class="rv-photo-img" onclick="_openRvPhoto('/${p}')" alt="фото">`).join('')}</div>` : ''}
      <div class="rv-reactions">
        <button class="rv-react-btn rv-like-btn${likeAct}" onclick="reactReview(${r.id},'like',this)" title="Нравится">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          <span class="rv-like-count">${r.likes}</span>
        </button>
        <button class="rv-react-btn rv-dislike-btn${disAct}" onclick="reactReview(${r.id},'dislike',this)" title="Не нравится">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
          <span class="rv-dislike-count">${r.dislikes}</span>
        </button>
      </div>
    </div>`;
  }

  /* ── Star picker ── */
  function pickStar(v) {
    _reviewRating = v;
    document.querySelectorAll('.star-pick-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i < v);
    });
    const lbl = document.getElementById('starPickLabel');
    if (lbl) lbl.textContent = STAR_LABELS[v] || '';
  }

  /* ── Photo management ── */
  let _rvPhotoFiles = [];

  window.rvAddPhotos = function(input) {
    const remaining = 3 - _rvPhotoFiles.length;
    const added = Array.from(input.files).slice(0, remaining);
    _rvPhotoFiles = _rvPhotoFiles.concat(added);
    _rvRenderPreviews();
    input.value = '';
    const btn = document.querySelector('.rv-photo-add-btn');
    if (btn) btn.style.display = _rvPhotoFiles.length >= 3 ? 'none' : '';
  };

  function _rvRenderPreviews() {
    const wrap = document.getElementById('rvPhotoPreviews');
    if (!wrap) return;
    wrap.innerHTML = '';
    _rvPhotoFiles.forEach((file, i) => {
      const url = URL.createObjectURL(file);
      const div = document.createElement('div');
      div.className = 'rv-photo-thumb';
      div.innerHTML = `<img src="${url}" alt="фото"><button class="rv-photo-remove" onclick="rvRemovePhoto(${i})" title="Удалить">×</button>`;
      wrap.appendChild(div);
    });
    wrap.style.display = _rvPhotoFiles.length ? 'flex' : 'none';
  }

  window.rvRemovePhoto = function(i) {
    _rvPhotoFiles.splice(i, 1);
    _rvRenderPreviews();
    const btn = document.querySelector('.rv-photo-add-btn');
    if (btn) btn.style.display = _rvPhotoFiles.length >= 3 ? 'none' : '';
  };

  /* ── Submit ── */
  async function submitReview() {
    if (!window._isLoggedIn) { _requireLoginToast(); return; }
    if (!_reviewRating) { showToast('Поставьте оценку ★'); return; }
    const text = (document.getElementById('reviewText').value || '').trim();
    if (!text) { showToast('Напишите текст отзыва'); return; }

    const btn = document.getElementById('reviewSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg> Публикуем…';

    try {
      const fd = new FormData();
      fd.append('rating', _reviewRating);
      fd.append('text', text);
      _rvPhotoFiles.forEach(f => fd.append('photos', f));

      const res  = await fetch('/api/reviews', { method: 'POST', credentials: 'same-origin', body: fd });
      const data = await res.json();
      if (data.error) { showToast(data.error); return; }

      // Prepend to list
      _reviews.unshift(data);

      // Reset form
      document.getElementById('reviewText').value = '';
      document.getElementById('reviewCharCount').textContent = '0 / 800';
      pickStar(0);
      document.querySelectorAll('.star-pick-btn').forEach(b => b.classList.remove('active'));
      const lbl = document.getElementById('starPickLabel');
      if (lbl) lbl.textContent = 'Выберите оценку';
      _reviewRating = 0;
      _rvPhotoFiles = [];
      _rvRenderPreviews();
      const photoBtn = document.querySelector('.rv-photo-add-btn');
      if (photoBtn) photoBtn.style.display = '';

      // Refresh stats + re-render
      const statsRes  = await fetch('/api/reviews', { credentials: 'same-origin' });
      const statsData = await statsRes.json();
      _reviews = statsData.reviews || [];
      renderOverallStats(statsData.stats);
      renderReviews();
      showToast('Отзыв опубликован! Спасибо ♡');
    } catch { showToast('Ошибка публикации'); }
    finally {
      btn.disabled = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" width="15" height="15"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Опубликовать';
    }
  }

  /* ── React (like/dislike) ── */
  async function reactReview(id, type, btn) {
    if (!window._isLoggedIn) { _requireLoginToast(); return; }
    try {
      const res  = await fetch(`/api/reviews/${id}/react`, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.error) { showToast(data.error); return; }

      // Update local data
      const r = _reviews.find(x => x.id === id);
      if (r) { r.likes = data.likes; r.dislikes = data.dislikes; r.myReaction = data.myReaction; }

      // Update card DOM
      const card = document.querySelector(`.rv-card[data-rv-id="${id}"]`);
      if (card) {
        const likeBtn  = card.querySelector('.rv-like-btn');
        const disBtn   = card.querySelector('.rv-dislike-btn');
        const likeCnt  = card.querySelector('.rv-like-count');
        const disCnt   = card.querySelector('.rv-dislike-count');
        if (likeCnt) likeCnt.textContent = data.likes;
        if (disCnt)  disCnt.textContent  = data.dislikes;
        if (likeBtn) {
          likeBtn.classList.toggle('rv-react-active', data.myReaction === 'like');
          likeBtn.classList.toggle('rv-react-like-active', data.myReaction === 'like');
        }
        if (disBtn) {
          disBtn.classList.toggle('rv-react-active', data.myReaction === 'dislike');
          disBtn.classList.toggle('rv-react-dislike-active', data.myReaction === 'dislike');
        }
        // bounce
        btn.classList.add('rv-bounce');
        setTimeout(() => btn.classList.remove('rv-bounce'), 400);
      }
    } catch { showToast('Ошибка'); }
  }

  /* ── Admin delete ── */
  async function deleteReview(id) {
    if (!confirm('Удалить этот отзыв?')) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      const data = await res.json();
      if (data.error) { showToast(data.error); return; }
      _reviews = _reviews.filter(r => r.id !== id);
      const card = document.querySelector(`.rv-card[data-rv-id="${id}"]`);
      if (card) {
        card.classList.add('rv-removing');
        setTimeout(() => { renderReviews(); renderOverallStats({ avg: _calcAvg(), total: _reviews.length }); }, 320);
      } else {
        renderReviews();
        renderOverallStats({ avg: _calcAvg(), total: _reviews.length });
      }
      showToast('Отзыв удалён');
    } catch { showToast('Ошибка'); }
  }

  function _calcAvg() {
    if (!_reviews.length) return 0;
    return _reviews.reduce((s,r) => s+r.rating,0) / _reviews.length;
  }

  /* ── Helpers ── */
  function renderStarsHtml(rating, cls) {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.4;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= full) {
        html += `<svg class="${cls} ${cls}-full" viewBox="0 0 24 24" width="14" height="14" fill="var(--rose)" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      } else if (half && i === full + 1) {
        html += `<svg class="${cls} ${cls}-half" viewBox="0 0 24 24" width="14" height="14" stroke="var(--rose)" stroke-width="1.5" fill="none"><defs><linearGradient id="hg${i}"><stop offset="50%" stop-color="var(--rose)"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#hg${i})"/></svg>`;
      } else {
        html += `<svg class="${cls} ${cls}-empty" viewBox="0 0 24 24" width="14" height="14" stroke="var(--taupe)" stroke-width="1.5" fill="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      }
    }
    return html;
  }

  function reviewCharCount(el) {
    const n = el.value.length;
    const cc = document.getElementById('reviewCharCount');
    if (cc) { cc.textContent = n + ' / 800'; cc.classList.toggle('review-char-warn', n > 700); }
  }

  function _fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day:'numeric', month:'long', year:'numeric' });
  }
  function _pluralRu(n, one, few, many) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return n + ' ' + one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return n + ' ' + few;
    return n + ' ' + many;
  }
  function _escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window._openRvPhoto = function(src) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.88);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:fadeIn .2s';
    overlay.innerHTML = `<img src="${src}" style="max-width:92vw;max-height:90vh;border-radius:14px;box-shadow:0 8px 48px rgba(0,0,0,0.6)">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  };

  /* end */
