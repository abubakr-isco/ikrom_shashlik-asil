/* ==========================================================================
   app.js — интерфейс сайта Ikrom Shashlik
   --------------------------------------------------------------------------
   Зависит от: config.js, i18n.js, menu-data.js, cart.js (подключены раньше).

   Разделы файла:
     1. Утилиты: поиск элементов, форматирование цен и телефонов, отправка
     2. Шапка, телефон и статус «открыто / закрыто»
     3. Меню: категории, карточки, счётчики, подсветка раздела при прокрутке
     4. Шторки: общий менеджер для корзины и брони
     5. Корзина: список, итоги, оформление заказа
     6. Бронь стола
     7. Контакты: филиалы и карта
     8. Индикаторы корзины и нижний бар
     9. Анимации: появление секций и угольки на первом экране
    10. Язык интерфейса
    11. Обработчик кликов и запуск
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. УТИЛИТЫ
   ========================================================================== */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 45000 → «45 000» (неразрывные пробелы, чтобы число не переносилось) */
function formatNumber(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 45000 → «45 000 UZS» */
function formatPrice(amount) {
  return `${formatNumber(amount)} UZS`;
}

/** Цена для карточки: валюта мельче основного числа */
function priceHtml(amount) {
  return `${formatNumber(amount)}<span class="price__currency">UZS</span>`;
}

/** Выход порции: «180 г», «1 000 мл» */
function formatWeight(dish) {
  return `${formatNumber(dish.weight)} ${I18n.t(`units.${dish.unit}`)}`;
}

/** Экранирование текста перед вставкой в HTML-шаблон */
function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

/** Приводит ввод к виду «+998 90 123 45 67» */
function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  // Код страны убираем, если он введён целиком или частично стёрт
  if (digits.startsWith('998')) digits = digits.slice(3);
  else if ('998'.startsWith(digits)) digits = '';
  digits = digits.slice(0, 9);

  const groups = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return ['+998', ...groups.filter(Boolean)].join(' ');
}

function isPhoneComplete(value) {
  return value.replace(/\D/g, '').length === 12; // 998 + 9 цифр номера
}

/**
 * Отправка заявки на сервер.
 * Пока адрес в CONFIG.api не указан, работает демо-режим: данные
 * выводятся в консоль, а ответ имитируется.
 */
async function sendRequest(url, payload) {
  if (!url) {
    console.info('[Демо-режим] Заявка не отправлена на сервер. Данные:', payload);
    await wait(900);
    return { id: String(Date.now()).slice(-5) };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Сервер ответил ${response.status}`);
  return response.json();
}

/** Сообщение для экранных читалок (без визуального вывода) */
function announce(message) {
  const region = $('#live-region');
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

/** Имя и телефон из прошлого заказа — чтобы не вводить их заново */
const Customer = {
  STORAGE_KEY: 'ikrom.customer',

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  },

  save({ name, phone }) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ name, phone }));
    } catch {
      /* не критично */
    }
  },

  prefill(form) {
    const saved = this.load();
    $$('[data-customer]', form).forEach((input) => {
      const value = saved[input.dataset.customer];
      if (!input.value && value) input.value = value;
    });
  },
};

/* ==========================================================================
   2. ШАПКА, ТЕЛЕФОН, СТАТУС РАБОТЫ
   ========================================================================== */

const header = $('#site-header');

function updateHeaderState() {
  header.classList.toggle('is-scrolled', window.scrollY > 16);
}

/** Телефон и соцсети берём из config.js, чтобы менять их в одном месте */
function renderContactInfo() {
  $$('[data-phone-link]').forEach((link) => {
    link.href = CONFIG.phone.href;
  });
  $$('[data-phone-text]').forEach((el) => {
    el.textContent = CONFIG.phone.display;
  });

  const socials = Object.entries(CONFIG.socials).filter(([, url]) => url);
  $('#social-links').innerHTML = socials
    .map(([network, url]) => `
      <li>
        <a class="social-link" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="${network}">
          <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-${network}" /></svg>
        </a>
      </li>`)
    .join('');
}

function minutesFromTime(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Открыт ли ресторан прямо сейчас — по самаркандскому времени, а не по часам посетителя */
function isOpenNow(date = new Date()) {
  const { open, close, timeZone } = CONFIG.hours;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type) => Number(parts.find((part) => part.type === type).value);

  const now = read('hour') * 60 + read('minute');
  const openAt = minutesFromTime(open);
  const closeAt = minutesFromTime(close);

  // Закрываемся после полуночи (05:00 раньше 10:00) — интервал переходит через 00:00
  return closeAt < openAt
    ? now >= openAt || now < closeAt
    : now >= openAt && now < closeAt;
}

function renderOpenStatus() {
  const open = isOpenNow();
  const text = open
    ? I18n.t('status.open', { time: CONFIG.hours.close })
    : I18n.t('status.closed', { time: CONFIG.hours.open });

  $$('[data-open-status]').forEach((el) => {
    el.classList.toggle('is-closed', !open);
    $('[data-open-status-text]', el).textContent = text;
  });
}

/* ==========================================================================
   3. МЕНЮ
   ========================================================================== */

const categoryNav = $('#category-nav');
const categoryList = $('#category-list');
const menuSections = $('#menu-sections');

const menuState = {
  activeCategory: CATEGORIES[0].id,
  isAutoScrolling: false, // пока страница едет к категории, scrollspy не вмешивается
  autoScrollTimer: null,
};

function renderCategoryNav() {
  categoryList.innerHTML = CATEGORIES
    .map((category) => `
      <li>
        <a href="#cat-${category.id}" class="chip" data-action="go-to-category" data-category="${category.id}"
           ${category.id === menuState.activeCategory ? 'aria-current="true"' : ''}>
          ${escapeHtml(I18n.pick(category.name))}
        </a>
      </li>`)
    .join('');
}

function renderDishCard(dish) {
  const name = escapeHtml(I18n.pick(dish.name));
  return `
    <article class="dish-card">
      <div class="dish-card__media">
        <img src="${dish.image}" alt="${name}" width="640" height="480" loading="lazy" decoding="async">
        ${dish.hit ? `<span class="dish-card__badge">${I18n.t('menu.hit')}</span>` : ''}
      </div>
      <div class="dish-card__body">
        <h4 class="dish-card__title">${name}</h4>
        <p class="dish-card__desc">${escapeHtml(I18n.pick(dish.description))}</p>
        <p class="dish-card__weight">${formatWeight(dish)}</p>
        <div class="dish-card__footer">
          <p class="price gold-text">${priceHtml(dish.price)}</p>
          <div data-dish-control="${dish.id}"></div>
        </div>
      </div>
    </article>`;
}

/**
 * Рисует все категории с карточками.
 * animate: false — при смене языка, чтобы карточки не «появлялись» заново.
 */
function renderMenu({ animate = true } = {}) {
  menuSections.innerHTML = CATEGORIES
    .map((category) => {
      const dishes = MENU.filter((dish) => dish.category === category.id);
      if (dishes.length === 0) return '';

      return `
        <section id="cat-${category.id}" class="menu-category ${animate ? '' : 'is-visible'}" data-reveal
                 data-category-section="${category.id}" aria-labelledby="cat-${category.id}-title">
          <h3 id="cat-${category.id}-title" class="menu-category__title">${escapeHtml(I18n.pick(category.name))}</h3>
          <div class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            ${dishes.map(renderDishCard).join('')}
          </div>
        </section>`;
    })
    .join('');

  $$('[data-dish-control]').forEach(renderDishControl);
  initReveal(menuSections);
}

function addButtonHtml(id, name) {
  return `
    <button type="button" class="btn-add" data-action="cart-add" data-id="${id}"
            aria-label="${escapeHtml(I18n.t('menu.addAria', { name }))}">
      <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-plus" /></svg>
      <span>${I18n.t('menu.add')}</span>
    </button>`;
}

function stepperHtml(id, qty, name, modifier = '') {
  return `
    <div class="stepper ${modifier}">
      <button type="button" class="stepper__btn" data-action="cart-decrement" data-id="${id}"
              aria-label="${escapeHtml(I18n.t('menu.decrease', { name }))}">
        <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-minus" /></svg>
      </button>
      <span class="stepper__value">${qty}</span>
      <button type="button" class="stepper__btn" data-action="cart-increment" data-id="${id}"
              aria-label="${escapeHtml(I18n.t('menu.increase', { name }))}">
        <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-plus" /></svg>
      </button>
    </div>`;
}

/** Кнопка «В корзину» превращается в счётчик и обратно */
function renderDishControl(control) {
  const id = control.dataset.dishControl;
  const qty = Cart.getQty(id);
  control.closest('.dish-card').classList.toggle('is-in-cart', qty > 0);

  // Счётчик уже на месте — меняем только число, без перерисовки и потери фокуса
  const value = $('.stepper__value', control);
  if (qty > 0 && value) {
    value.textContent = qty;
    return;
  }

  const hadFocus = control.contains(document.activeElement);
  const name = I18n.pick(DISHES_BY_ID.get(id).name);
  control.innerHTML = qty > 0 ? stepperHtml(id, qty, name) : addButtonHtml(id, name);

  // Нажатая кнопка исчезла — переводим фокус на её замену (важно для клавиатуры)
  if (hadFocus) {
    const next = qty > 0 ? $('[data-action="cart-increment"]', control) : $('button', control);
    next.focus();
  }
}

/**
 * Положение элемента от верха документа.
 * offsetTop не учитывает transform, поэтому анимация появления не сбивает расчёт.
 */
function documentTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

/** Высота липкой зоны сверху: шапка + панель категорий */
function stickyOffset() {
  return header.offsetHeight + categoryNav.offsetHeight;
}

/** Плавно прокручивает к категории и сразу подсвечивает её чип */
function goToCategory(id) {
  const section = document.getElementById(`cat-${id}`);
  if (!section) return;

  // Заголовок категории встаёт на 24px ниже липкой панели
  const title = $('.menu-category__title', section);
  setActiveCategory(id);
  menuState.isAutoScrolling = true;
  window.scrollTo({ top: documentTop(title) - stickyOffset() - 24, behavior: scrollBehavior });

  clearTimeout(menuState.autoScrollTimer);
  menuState.autoScrollTimer = setTimeout(() => {
    menuState.isAutoScrolling = false;
    updateActiveCategory();
  }, 800);
}

function setActiveCategory(id) {
  if (id === menuState.activeCategory) return;
  menuState.activeCategory = id;

  $$('.chip', categoryList).forEach((chip) => {
    const isActive = chip.dataset.category === id;
    if (isActive) {
      chip.setAttribute('aria-current', 'true');
      scrollChipIntoView(chip);
    } else {
      chip.removeAttribute('aria-current');
    }
  });
}

/** Если активный чип спрятан за краем ленты — подкручиваем ленту к нему */
function scrollChipIntoView(chip) {
  const trackRect = categoryList.getBoundingClientRect();
  const chipRect = chip.getBoundingClientRect();
  const isOutside = chipRect.left < trackRect.left + 16 || chipRect.right > trackRect.right - 32;
  if (isOutside) {
    categoryList.scrollBy({ left: chipRect.left - trackRect.left - 16, behavior: scrollBehavior });
  }
}

/** Scrollspy: активна последняя категория, чей верх уже ушёл под липкую панель */
function updateActiveCategory() {
  if (menuState.isAutoScrolling) return;

  const line = window.scrollY + stickyOffset() + 24;
  let current = CATEGORIES[0].id;
  $$('[data-category-section]').forEach((section) => {
    if (documentTop(section) <= line) current = section.dataset.categorySection;
  });
  setActiveCategory(current);
}

function updateCategoryNavState() {
  const isStuck = categoryNav.getBoundingClientRect().top <= header.offsetHeight + 1;
  categoryNav.classList.toggle('is-stuck', isStuck);
}

/* ==========================================================================
   4. ШТОРКИ: общий менеджер для корзины и брони
   Отвечает за подложку, блокировку прокрутки, Esc, удержание фокуса
   внутри панели и возврат фокуса на кнопку, которая её открыла.
   ========================================================================== */

const Overlay = (() => {
  const backdrop = $('#backdrop');
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let activePanel = null;
  let returnFocusTo = null;

  function open(panel) {
    if (activePanel === panel) return;
    if (activePanel) close({ restoreFocus: false });

    returnFocusTo = document.activeElement;
    activePanel = panel;

    panel.inert = false;
    panel.classList.add('is-open');
    backdrop.classList.add('is-visible');
    document.documentElement.classList.add('is-scroll-locked');

    // Фокус на саму панель: читалка озвучит заголовок, страница не дёрнется
    panel.focus({ preventScroll: true });
  }

  function close({ restoreFocus = true } = {}) {
    if (!activePanel) return;
    const panel = activePanel;
    activePanel = null;

    panel.classList.remove('is-open');
    panel.inert = true;
    backdrop.classList.remove('is-visible');
    document.documentElement.classList.remove('is-scroll-locked');
    panel.dispatchEvent(new CustomEvent('overlay:closed'));

    if (restoreFocus && returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true });
  }

  /** Tab и Shift+Tab ходят по кругу внутри открытой панели */
  function trapFocus(event) {
    const focusable = $$(FOCUSABLE, activePanel).filter((el) => el.getClientRects().length > 0);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && (current === first || current === activePanel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  document.addEventListener('keydown', (event) => {
    if (!activePanel) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') trapFocus(event);
  });
  backdrop.addEventListener('click', () => close());

  return { open, close };
})();

/* ==========================================================================
   5. КОРЗИНА
   ========================================================================== */

const cartEls = {
  drawer: $('#cart-drawer'),
  empty: $('#cart-empty'),
  form: $('#cart-form'),
  success: $('#cart-success'),
  successText: $('#cart-success-text'),
  items: $('#cart-items'),
  clear: $('#cart-clear'),
  subtotal: $('#cart-subtotal'),
  deliveryRow: $('#cart-delivery-row'),
  deliveryFee: $('#cart-delivery-fee'),
  freeHint: $('#cart-free-hint'),
  total: $('#cart-total'),
  submit: $('#cart-submit'),
  submitTotal: $('#cart-submit-total'),
  error: $('#cart-error'),
};

const cartState = {
  view: 'order',    // 'order' — список и оформление, 'success' — заказ отправлен
  lastOrder: null,  // { id, phone } — для текста на экране успеха
};

function openCart() {
  Customer.prefill(cartEls.form);
  Overlay.open(cartEls.drawer);
}

function getDeliveryType() {
  return cartEls.form.elements.type.value; // 'pickup' | 'delivery'
}

/** Все суммы корзины считаются здесь — и для интерфейса, и для заявки */
function calculateTotals() {
  const subtotal = Cart.subtotal();
  const isDelivery = getDeliveryType() === 'delivery';
  const { fee, freeFrom } = CONFIG.delivery;
  const deliveryFee = isDelivery && subtotal < freeFrom ? fee : 0;

  return {
    subtotal,
    isDelivery,
    deliveryFee,
    total: subtotal + deliveryFee,
    leftForFree: Math.max(freeFrom - subtotal, 0),
  };
}

function renderCartLine({ dish, qty, sum }) {
  const name = I18n.pick(dish.name);
  return `
    <li class="cart-item">
      <img class="cart-item__image" src="${dish.image}" alt="" width="64" height="64" loading="lazy" decoding="async">
      <div class="min-w-0 flex-1">
        <p class="cart-item__name">${escapeHtml(name)}</p>
        <p class="cart-item__meta">${formatPrice(dish.price)}</p>
      </div>
      <div class="cart-item__side">
        <p class="cart-item__sum">${formatPrice(sum)}</p>
        ${stepperHtml(dish.id, qty, name, 'stepper--quiet')}
      </div>
    </li>`;
}

function renderCart() {
  if (cartState.view === 'success') return; // экран успеха не трогаем до закрытия шторки

  const lines = Cart.items();
  const hasItems = lines.length > 0;

  // Запоминаем, на какой кнопке был фокус, чтобы вернуть его после перерисовки
  const focused = document.activeElement;
  const focusKey = cartEls.items.contains(focused)
    ? { action: focused.dataset.action, id: focused.dataset.id }
    : null;

  cartEls.empty.hidden = hasItems;
  cartEls.form.hidden = !hasItems;
  cartEls.clear.hidden = !hasItems;
  cartEls.success.hidden = true;
  cartEls.items.innerHTML = lines.map(renderCartLine).join('');
  renderCartTotals();

  if (focusKey) {
    const sameButton = $(`[data-action="${focusKey.action}"][data-id="${focusKey.id}"]`, cartEls.items);
    const fallback = $('.stepper__btn', cartEls.items) || $('button', cartEls.empty);
    (sameButton || fallback).focus();
  }
}

function renderCartTotals() {
  const totals = calculateTotals();

  cartEls.subtotal.textContent = formatPrice(totals.subtotal);
  cartEls.deliveryRow.hidden = !totals.isDelivery;
  cartEls.deliveryFee.textContent = totals.deliveryFee ? formatPrice(totals.deliveryFee) : I18n.t('cart.free');

  const showFreeHint = totals.isDelivery && totals.leftForFree > 0;
  cartEls.freeHint.hidden = !showFreeHint;
  if (showFreeHint) cartEls.freeHint.textContent = I18n.t('cart.freeHint', { sum: formatPrice(totals.leftForFree) });

  cartEls.total.textContent = formatPrice(totals.total);
  cartEls.submitTotal.textContent = formatPrice(totals.total);
}

/** Самовывоз → выбор филиала; доставка → поле адреса */
function updateDeliveryFields() {
  const type = getDeliveryType();
  $$('[data-show-for]', cartEls.form).forEach((field) => {
    field.hidden = field.dataset.showFor !== type;
  });
  renderCartTotals();
}

function renderCartSuccessText() {
  const { id, phone } = cartState.lastOrder;
  cartEls.successText.textContent = I18n.t('cart.successText', { id, phone });
}

function showCartSuccess(order) {
  cartState.view = 'success';
  cartState.lastOrder = order;
  renderCartSuccessText();

  cartEls.form.hidden = true;
  cartEls.empty.hidden = true;
  cartEls.clear.hidden = true;
  cartEls.success.hidden = false;
  cartEls.drawer.focus({ preventScroll: true });
}

/** После закрытия шторки с экрана успеха возвращаемся к обычному виду */
function resetCartView() {
  if (cartState.view !== 'success') return;
  cartState.view = 'order';
  cartEls.form.reset();
  updateDeliveryFields();
  renderCart();
}

/* ---------- Валидация форм (общая для корзины и брони) ---------- */

const validators = {
  name: (value) => (value.length >= 2 ? null : 'err.name'),
  phone: (value) => (isPhoneComplete(value) ? null : 'err.phone'),
  address: (value) => (value.length >= 5 ? null : 'err.address'),
  date: (value) => (value ? null : 'err.date'),
};

/**
 * Показывает или убирает ошибку под полем.
 * Ключ перевода кладём в data-i18n, чтобы ошибка переводилась при смене языка.
 */
function setFieldError(input, errorKey) {
  const error = document.getElementById(`${input.id}-error`);
  if (!error) return;

  if (errorKey) {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
    error.dataset.i18n = errorKey;
    error.textContent = I18n.t(errorKey);
    error.hidden = false;
  } else {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    delete error.dataset.i18n;
    error.hidden = true;
  }
}

/** Проверяет перечисленные поля; фокус уходит на первое ошибочное */
function validateFields(form, fieldNames) {
  let firstInvalid = null;

  fieldNames.forEach((name) => {
    const input = form.elements[name];
    const errorKey = validators[name](input.value.trim());
    setFieldError(input, errorKey);
    if (errorKey && !firstInvalid) firstInvalid = input;
  });

  firstInvalid?.focus();
  return firstInvalid === null;
}

/** Ошибка исчезает, как только пользователь начал исправлять поле */
function clearErrorOnInput(form) {
  form.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid')) setFieldError(event.target, null);
  });
}

function setFormAlert(alert, messageKey) {
  if (messageKey) {
    alert.dataset.i18n = messageKey;
    alert.textContent = I18n.t(messageKey);
    alert.hidden = false;
  } else {
    delete alert.dataset.i18n;
    alert.hidden = true;
  }
}

function setSubmitting(button, isBusy, labelKey) {
  const label = $('[data-submit-label]', button);
  button.disabled = isBusy;
  button.setAttribute('aria-busy', String(isBusy));
  label.dataset.i18n = labelKey;
  label.textContent = I18n.t(labelKey);
}

async function submitOrder(event) {
  event.preventDefault();
  const form = cartEls.form;
  const totals = calculateTotals();

  const requiredFields = totals.isDelivery ? ['address', 'name', 'phone'] : ['name', 'phone'];
  if (!validateFields(form, requiredFields)) return;

  const data = new FormData(form);
  const payload = {
    kind: 'order',
    createdAt: new Date().toISOString(),
    lang: I18n.lang,
    customer: { name: data.get('name').trim(), phone: data.get('phone') },
    delivery: {
      type: data.get('type'),
      address: totals.isDelivery ? data.get('address').trim() : null,
      branchId: totals.isDelivery ? null : data.get('branch'),
    },
    comment: data.get('comment').trim(),
    items: Cart.items().map(({ dish, qty, sum }) => ({
      id: dish.id,
      name: dish.name.ru, // кухне удобнее единый язык
      price: dish.price,
      qty,
      sum,
    })),
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
  };

  setFormAlert(cartEls.error, null);
  setSubmitting(cartEls.submit, true, 'cart.sending');

  try {
    const result = await sendRequest(CONFIG.api.orderUrl, payload);
    Customer.save(payload.customer);
    showCartSuccess({ id: result.id, phone: payload.customer.phone });
    Cart.clear();
  } catch (error) {
    console.error('Не удалось отправить заказ:', error);
    setFormAlert(cartEls.error, 'cart.error');
  } finally {
    setSubmitting(cartEls.submit, false, 'cart.submit');
  }
}

/* ==========================================================================
   6. БРОНЬ СТОЛА
   ========================================================================== */

const bookingEls = {
  modal: $('#booking-modal'),
  intro: $('#booking-intro'),
  form: $('#booking-form'),
  submit: $('#booking-submit'),
  error: $('#booking-error'),
  success: $('#booking-success'),
  successText: $('#booking-success-text'),
  date: $('#book-date'),
  time: $('#book-time'),
  guests: $('#book-guests'),
};

const bookingState = { lastBooking: null };

/** Дата для <input type="date">: «2026-10-13» */
function toDateInputValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Слоты каждые 30 минут: от открытия до часа перед закрытием */
function getTimeSlots() {
  const start = minutesFromTime(CONFIG.hours.open);
  let end = minutesFromTime(CONFIG.hours.close);
  if (end <= start) end += 24 * 60; // закрытие после полуночи

  const slots = [];
  for (let minutes = start; minutes <= end - 60; minutes += 30) {
    const hours = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
    slots.push(`${hours}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return slots;
}

function setupBookingForm() {
  const today = toDateInputValue(new Date());
  bookingEls.date.min = today;
  bookingEls.date.value = today;

  bookingEls.time.innerHTML = getTimeSlots()
    .map((slot) => `<option value="${slot}" ${slot === '19:00' ? 'selected' : ''}>${slot}</option>`)
    .join('');
}

/** Варианты «2 гостя / 5 гостей» зависят от языка, поэтому перерисовываются */
function renderGuestOptions() {
  const selected = Number(bookingEls.guests.value) || 2;
  const keys = { one: 'book.guestsOne', few: 'book.guestsFew', many: 'book.guestsMany' };

  bookingEls.guests.innerHTML = Array.from({ length: 12 }, (_, index) => index + 1)
    .map((count) => `<option value="${count}" ${count === selected ? 'selected' : ''}>${I18n.plural(count, keys)}</option>`)
    .join('');
}

/** «2026-10-13» → «13 октября» / «13-oktabr» */
const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function formatBookingDate(value) {
  const date = new Date(`${value}T00:00`);
  // Узбекские названия месяцев есть не во всех браузерах, поэтому задаём их сами
  if (I18n.lang === 'uz') return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`;
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
}

function renderBookingSuccessText() {
  const { phone, date, time } = bookingState.lastBooking;
  bookingEls.successText.textContent = I18n.t('book.successText', { phone, date: formatBookingDate(date), time });
}

function openBooking() {
  Customer.prefill(bookingEls.form);
  Overlay.open(bookingEls.modal);
}

function resetBookingView() {
  if (bookingEls.success.hidden) return;
  bookingEls.success.hidden = true;
  bookingEls.intro.hidden = false;
  bookingEls.form.hidden = false;
  $('[name="comment"]', bookingEls.form).value = '';
}

async function submitBooking(event) {
  event.preventDefault();
  const form = bookingEls.form;
  if (!validateFields(form, ['name', 'phone', 'date'])) return;

  const data = new FormData(form);
  const payload = {
    kind: 'booking',
    createdAt: new Date().toISOString(),
    lang: I18n.lang,
    customer: { name: data.get('name').trim(), phone: data.get('phone') },
    date: data.get('date'),
    time: data.get('time'),
    guests: Number(data.get('guests')),
    branchId: data.get('branch'),
    comment: data.get('comment').trim(),
  };

  setFormAlert(bookingEls.error, null);
  setSubmitting(bookingEls.submit, true, 'book.sending');

  try {
    await sendRequest(CONFIG.api.bookingUrl, payload);
    Customer.save(payload.customer);
    bookingState.lastBooking = { phone: payload.customer.phone, date: payload.date, time: payload.time };
    renderBookingSuccessText();
    form.hidden = true;
    bookingEls.intro.hidden = true;
    bookingEls.success.hidden = false;
    bookingEls.modal.focus({ preventScroll: true });
  } catch (error) {
    console.error('Не удалось отправить бронь:', error);
    setFormAlert(bookingEls.error, 'book.error');
  } finally {
    setSubmitting(bookingEls.submit, false, 'book.submit');
  }
}

/* ==========================================================================
   7. КОНТАКТЫ: филиалы и карта
   ========================================================================== */

const contactsState = { activeBranchId: CONFIG.branches[0].id };

/** Ссылка «Открыть в Яндекс Картах» с меткой на филиале */
function yandexMapsUrl({ coords: [lat, lon] }) {
  return `https://yandex.uz/maps/?pt=${lon},${lat}&z=17&l=map`;
}

/** Встраиваемая карта Яндекса (без API-ключа) */
function yandexWidgetUrl({ coords: [lat, lon] }) {
  const lang = I18n.lang === 'uz' ? 'uz_UZ' : 'ru_RU';
  return `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=16&pt=${lon}%2C${lat}%2Cpm2orm&lang=${lang}`;
}

function renderBranches() {
  $('#branch-list').innerHTML = CONFIG.branches
    .map((branch) => {
      const isActive = branch.id === contactsState.activeBranchId;
      return `
        <li>
          <article class="branch ${isActive ? 'is-active' : ''}" data-branch="${branch.id}">
            <button type="button" class="branch__select" data-action="select-branch" data-id="${branch.id}" aria-pressed="${isActive}">
              <span class="branch__name">
                <svg class="icon h-5 w-5" aria-hidden="true"><use href="#i-pin" /></svg>
                ${escapeHtml(I18n.pick(branch.name))}
              </span>
              <span class="branch__address">${escapeHtml(I18n.pick(branch.address))}</span>
            </button>
            <a class="branch__link" href="${yandexMapsUrl(branch)}" target="_blank" rel="noopener">
              ${I18n.t('contacts.yandex')}
              <svg class="icon h-4 w-4" aria-hidden="true"><use href="#i-external" /></svg>
            </a>
          </article>
        </li>`;
    })
    .join('');

  updateMap();
}

function selectBranch(id) {
  contactsState.activeBranchId = id;
  $$('.branch').forEach((card) => {
    const isActive = card.dataset.branch === id;
    card.classList.toggle('is-active', isActive);
    $('.branch__select', card).setAttribute('aria-pressed', String(isActive));
  });
  updateMap();
}

function updateMap() {
  const branch = CONFIG.branches.find((item) => item.id === contactsState.activeBranchId);
  const map = $('#branch-map');
  const url = yandexWidgetUrl(branch);
  if (map.src !== url) map.src = url;
  map.title = I18n.t('contacts.mapTitle', { name: I18n.pick(branch.name) });
}

/** Списки филиалов в формах корзины и брони */
function renderBranchOptions() {
  $$('[data-branch-select]').forEach((select) => {
    const selected = select.value || CONFIG.branches[0].id;
    select.innerHTML = CONFIG.branches
      .map((branch) => `
        <option value="${branch.id}" ${branch.id === selected ? 'selected' : ''}>
          ${escapeHtml(I18n.pick(branch.name))}, ${escapeHtml(I18n.pick(branch.address))}
        </option>`)
      .join('');
  });
}

/* ==========================================================================
   8. ИНДИКАТОРЫ КОРЗИНЫ И НИЖНИЙ БАР
   ========================================================================== */

const bottomCartButton = $('.bottom-nav__cart');
let previousCartCount = Cart.count();

/** Счётчики и суммы в шапке и нижнем баре */
function renderCartIndicators() {
  const count = Cart.count();
  const total = formatPrice(Cart.subtotal());
  const hasGrown = count > previousCartCount;
  previousCartCount = count;

  $$('[data-cart-count]').forEach((badge) => {
    badge.hidden = count === 0;
    badge.textContent = count;
    // Короткий «прыжок» счётчика подтверждает, что блюдо добавилось
    if (hasGrown) {
      badge.classList.remove('is-bumped');
      void badge.offsetWidth; // перезапуск CSS-анимации
      badge.classList.add('is-bumped');
    }
  });

  $$('[data-cart-total]').forEach((el) => {
    el.hidden = count === 0;
    el.textContent = total;
  });

  bottomCartButton.classList.toggle('has-items', count > 0);
  $('[data-cart-label]', bottomCartButton).textContent = count > 0 ? total : I18n.t('cart.label');
}

/** Подсвечиваем «Меню» или «Контакты», когда пользователь в этом разделе */
function updateBottomNav() {
  const probeLine = window.innerHeight * 0.4;
  let activeSection = null;

  ['menu', 'contacts'].forEach((id) => {
    const rect = document.getElementById(id).getBoundingClientRect();
    if (rect.top <= probeLine && rect.bottom > probeLine) activeSection = id;
  });

  $$('[data-bottom-link]').forEach((link) => {
    const isActive = link.dataset.bottomLink === activeSection;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function onCartChange() {
  $$('[data-dish-control]').forEach(renderDishControl);
  renderCart();
  renderCartIndicators();
}

/* ==========================================================================
   9. АНИМАЦИИ
   ========================================================================== */

let revealObserver = null;

/** Плавное появление элементов с атрибутом data-reveal при прокрутке */
function initReveal(root = document) {
  const elements = $$('[data-reveal]:not(.is-visible)', root);

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  revealObserver ??= new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  elements.forEach((el) => revealObserver.observe(el));
}

/** Искры над мангалом на первом экране. Ставятся на паузу, когда экран не виден */
function initEmbers() {
  const container = $('#embers');
  if (!container || prefersReducedMotion) return;

  const count = window.innerWidth < 768 ? 10 : 18;
  const random = (min, max) => min + Math.random() * (max - min);

  for (let i = 0; i < count; i += 1) {
    const ember = document.createElement('span');
    ember.className = 'ember';
    ember.style.setProperty('--x', `${random(20, 100)}%`);
    ember.style.setProperty('--size', `${random(2, 4).toFixed(1)}px`);
    ember.style.setProperty('--ember-alpha', random(0.4, 0.9).toFixed(2));
    ember.style.setProperty('--ember-drift', `${random(-48, 48).toFixed(0)}px`);
    ember.style.setProperty('--ember-duration', `${random(6, 12).toFixed(1)}s`);
    ember.style.setProperty('--ember-delay', `${random(0, 8).toFixed(1)}s`);
    container.append(ember);
  }

  new IntersectionObserver(([entry]) => {
    container.classList.toggle('is-paused', !entry.isIntersecting);
  }).observe(container);
}

/* ==========================================================================
   10. ЯЗЫК ИНТЕРФЕЙСА
   ========================================================================== */

/** Переводит статичный текст и перерисовывает всё, что строится из данных */
function applyLanguage() {
  I18n.apply();

  $$('[data-action="set-lang"]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === I18n.lang));
  });

  renderCategoryNav();
  renderMenu({ animate: !$('[data-category-section]') }); // анимируем только первую отрисовку
  renderBranches();
  renderBranchOptions();
  renderGuestOptions();
  renderOpenStatus();
  renderCart();
  renderCartIndicators();
  if (cartState.view === 'success') renderCartSuccessText();
  if (!bookingEls.success.hidden) renderBookingSuccessText();
}

function setLanguage(lang) {
  if (!I18n.SUPPORTED.includes(lang) || lang === I18n.lang) return;
  I18n.lang = lang;
  I18n.save();
  applyLanguage();
}

/* ==========================================================================
   11. ОБРАБОТЧИК КЛИКОВ И ЗАПУСК
   Все кнопки размечены data-action — один обработчик на весь документ.
   ========================================================================== */

function announceQty(id) {
  const dish = DISHES_BY_ID.get(id);
  announce(`${I18n.pick(dish.name)}. ${I18n.t('menu.qty', { qty: Cart.getQty(id) })}`);
}

const actions = {
  'cart-add': (el) => {
    Cart.add(el.dataset.id);
    announceQty(el.dataset.id);
  },
  'cart-increment': (el) => {
    Cart.add(el.dataset.id);
    announceQty(el.dataset.id);
  },
  'cart-decrement': (el) => {
    Cart.remove(el.dataset.id);
    announceQty(el.dataset.id);
  },
  'clear-cart': () => Cart.clear(),
  'open-cart': () => openCart(),
  'open-booking': () => openBooking(),
  'close-overlay': () => Overlay.close(),
  'go-to-menu': () => {
    Overlay.close({ restoreFocus: false });
    $('#menu-title').focus({ preventScroll: true });
    document.getElementById('menu').scrollIntoView({ behavior: scrollBehavior });
  },
  'go-to-category': (el, event) => {
    event.preventDefault();
    goToCategory(el.dataset.category);
  },
  'select-branch': (el) => selectBranch(el.dataset.id),
  'set-lang': (el) => setLanguage(el.dataset.lang),
};

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;
  actions[trigger.dataset.action]?.(trigger, event);
});

/** Прокрутка: шапка, липкая панель, scrollspy, нижний бар — не чаще раза за кадр */
let scrollFrameRequested = false;
function onScroll() {
  if (scrollFrameRequested) return;
  scrollFrameRequested = true;
  requestAnimationFrame(() => {
    updateHeaderState();
    updateCategoryNavState();
    updateActiveCategory();
    updateBottomNav();
    scrollFrameRequested = false;
  });
}

/** Маска телефона во всех формах */
function initPhoneInputs() {
  $$('[data-phone-input]').forEach((input) => {
    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+998 ';
    });
    input.addEventListener('input', () => {
      const formatted = formatPhone(input.value);
      if (formatted !== input.value.trimEnd()) input.value = formatted;
    });
    input.addEventListener('blur', () => {
      if (input.value.replace(/\D/g, '') === '998') input.value = '';
    });
  });
}

function init() {
  I18n.loadSaved();
  I18n.globals = {
    open: CONFIG.hours.open,
    close: CONFIG.hours.close,
    year: new Date().getFullYear(),
  };

  renderContactInfo();
  setupBookingForm();
  applyLanguage();

  Cart.subscribe(onCartChange);

  // Формы
  cartEls.form.addEventListener('submit', submitOrder);
  cartEls.form.addEventListener('change', (event) => {
    if (event.target.name === 'type') updateDeliveryFields();
  });
  bookingEls.form.addEventListener('submit', submitBooking);
  updateDeliveryFields(); // браузер мог восстановить выбор «Доставка» после перезагрузки
  clearErrorOnInput(cartEls.form);
  clearErrorOnInput(bookingEls.form);
  initPhoneInputs();

  // Сброс экранов успеха после закрытия (ждём окончания анимации)
  cartEls.drawer.addEventListener('overlay:closed', () => setTimeout(resetCartView, 300));
  bookingEls.modal.addEventListener('overlay:closed', () => setTimeout(resetBookingView, 300));

  // Фото не загрузилось — прячем его, остаётся аккуратная заглушка с куполом
  document.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) event.target.classList.add('is-broken');
  }, true);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  initReveal();
  initEmbers();

  // Статус «открыто / закрыто» обновляем раз в минуту
  setInterval(renderOpenStatus, 60 * 1000);
}

init();
