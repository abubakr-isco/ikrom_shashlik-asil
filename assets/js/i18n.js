/* ==========================================================================
   i18n.js — переводы интерфейса (RU / UZ) и помощники для работы с языком
   --------------------------------------------------------------------------
   Как это работает:
   1. В HTML у элемента указывается ключ: data-i18n="hero.title".
      Для атрибутов: data-i18n-placeholder, data-i18n-aria (aria-label), data-i18n-alt.
   2. I18n.apply() проходит по документу и подставляет текст нужного языка.
   3. В JS текст берётся через I18n.t('ключ', { переменные }).
   Узбекский — на латинице; для oʻ/gʻ используется символ ‘ (U+2018),
   он есть во всех шрифтах.
   ========================================================================== */

const TRANSLATIONS = {
  ru: {
    'meta.title': 'Ikrom Shashlik — шашлык на углях в Самарканде',
    'meta.description': 'Шашлык на живых углях, плов и горячие блюда. Доставка и самовывоз по Самарканду, бронь столов. Каждый день с {open} до {close}.',

    'a11y.skip': 'Перейти к меню',

    'nav.main': 'Основная навигация',
    'nav.quick': 'Быстрая навигация',
    'nav.menu': 'Меню',
    'nav.about': 'О нас',
    'nav.contacts': 'Контакты',
    'nav.home': 'Ikrom Shashlik, на главную',

    'lang.label': 'Язык сайта',
    'lang.uz': 'O‘zbekcha',
    'lang.ru': 'Русский',

    'header.book': 'Забронировать',
    'header.bookShort': 'Бронь',
    'header.cart': 'Открыть корзину',

    'status.open': 'Открыто до {time}',
    'status.closed': 'Закрыто, откроемся в {time}',

    'hero.title': 'Сочный настоящий шашлык на углях в Самарканде',
    'hero.text': 'Маринуем мясо по своему рецепту и жарим на живых углях. Привезём горячим или накроем стол в зале.',
    'hero.ctaMenu': 'Смотреть меню',
    'hero.ctaBook': 'Забронировать стол',

    'menu.title': 'Меню',
    'menu.text': 'Цены указаны за порцию. Шашлык начинаем жарить после заказа, это 15–20 минут.',
    'menu.categories': 'Категории меню',
    'menu.hit': 'Хит',
    'menu.add': 'В корзину',
    'menu.addAria': 'Добавить в корзину: {name}',
    'menu.increase': 'Добавить ещё одну порцию: {name}',
    'menu.decrease': 'Убрать одну порцию: {name}',
    'menu.qty': 'В корзине: {qty}',
    'menu.noscript': 'Включите JavaScript, чтобы увидеть меню и оформить заказ. Или позвоните нам:',

    'units.g': 'г',
    'units.ml': 'мл',

    'about.title': 'Почему к нам возвращаются',
    'about.text': 'В Ikrom Shashlik всё начинается с мангала. Мясо маринуется с вечера, угли разжигаем до открытия, а шампуры снимаем с огня, когда шашлык ещё сочный внутри.',
    'about.imageAlt': 'Зал ресторана Ikrom Shashlik вечером',
    'about.f1Title': 'Свежее мясо каждый день',
    'about.f1Text': 'Баранину и говядину берём у проверенных фермеров и не замораживаем.',
    'about.f2Title': 'Только живые угли',
    'about.f2Text': 'Никаких газовых грилей: дымок и румяная корочка, как принято в Самарканде.',
    'about.f3Title': 'Открыты до {close}',
    'about.f3Text': 'Поздний ужин или ночной заказ: кухня работает каждый день без выходных.',
    'about.f4Title': 'Привозим горячим',
    'about.f4Text': 'Упаковываем в термобоксы, чтобы шашлык доехал до вас таким же сочным.',

    'contacts.title': 'Адреса в Самарканде',
    'contacts.text': 'Выберите филиал, чтобы увидеть его на карте.',
    'contacts.hoursTitle': 'Часы работы',
    'contacts.daily': 'Каждый день, {open} – {close}',
    'contacts.call': 'Позвонить',
    'contacts.yandex': 'Открыть в Яндекс Картах',
    'contacts.mapTitle': 'Карта: {name}',

    'cart.title': 'Ваш заказ',
    'cart.label': 'Корзина',
    'cart.clear': 'Очистить',
    'cart.close': 'Закрыть',
    'cart.emptyTitle': 'Корзина пока пуста',
    'cart.emptyText': 'Добавьте блюда из меню, и они появятся здесь.',
    'cart.emptyCta': 'Открыть меню',
    'cart.howTo': 'Как получить заказ',
    'cart.pickup': 'Самовывоз',
    'cart.delivery': 'Доставка',
    'cart.address': 'Адрес доставки',
    'cart.addressPh': 'Улица, дом, подъезд, этаж',
    'cart.branch': 'Филиал',
    'cart.comment': 'Комментарий',
    'cart.commentPh': 'Например: без лука, позвонить заранее',
    'cart.subtotal': 'Блюда',
    'cart.deliveryFee': 'Доставка',
    'cart.free': 'Бесплатно',
    'cart.freeHint': 'Добавьте блюд ещё на {sum}, и доставим бесплатно',
    'cart.total': 'Итого',
    'cart.submit': 'Отправить заказ',
    'cart.sending': 'Отправляем…',
    'cart.payNote': 'Оплата наличными или картой при получении.',
    'cart.successTitle': 'Заказ отправлен',
    'cart.successText': 'Номер заказа: {id}. Оператор позвонит на {phone}, чтобы подтвердить заказ.',
    'cart.successCta': 'Вернуться в меню',
    'cart.error': 'Заказ не отправлен. Проверьте интернет и попробуйте ещё раз или позвоните нам.',

    'form.name': 'Имя',
    'form.phone': 'Телефон',
    'form.optional': 'необязательно',

    'book.title': 'Бронь стола',
    'book.text': 'Оставьте контакты, и администратор перезвонит, чтобы подтвердить бронь.',
    'book.date': 'Дата',
    'book.time': 'Время',
    'book.guests': 'Гостей',
    'book.branch': 'Филиал',
    'book.comment': 'Пожелания',
    'book.commentPh': 'Например: день рождения, нужен детский стул',
    'book.submit': 'Забронировать',
    'book.sending': 'Отправляем…',
    'book.successTitle': 'Заявка на бронь отправлена',
    'book.successText': 'Администратор перезвонит на {phone} и подтвердит стол на {date}, {time}.',
    'book.done': 'Готово',
    'book.error': 'Заявка не отправлена. Попробуйте ещё раз или позвоните нам.',
    'book.guestsOne': '{n} гость',
    'book.guestsFew': '{n} гостя',
    'book.guestsMany': '{n} гостей',

    'err.name': 'Введите имя',
    'err.phone': 'Введите номер полностью: +998 XX XXX XX XX',
    'err.address': 'Укажите адрес доставки',
    'err.date': 'Выберите дату',

    'footer.text': 'Шашлык на живых углях в Самарканде.',
    'footer.nav': 'Разделы',
    'footer.contacts': 'Связаться',
    'footer.rights': '© {year} Ikrom Shashlik',
  },

  uz: {
    'meta.title': 'Ikrom Shashlik — Samarqandda cho‘g‘da pishgan shashlik',
    'meta.description': 'Cho‘g‘da pishgan shashlik, osh va issiq taomlar. Samarqand bo‘ylab yetkazib berish va olib ketish, stol band qilish. Har kuni {open} dan {close} gacha.',

    'a11y.skip': 'Menyuga o‘tish',

    'nav.main': 'Asosiy navigatsiya',
    'nav.quick': 'Tezkor navigatsiya',
    'nav.menu': 'Menyu',
    'nav.about': 'Biz haqimizda',
    'nav.contacts': 'Aloqa',
    'nav.home': 'Ikrom Shashlik, bosh sahifa',

    'lang.label': 'Sayt tili',
    'lang.uz': 'O‘zbekcha',
    'lang.ru': 'Русский',

    'header.book': 'Stol band qilish',
    'header.bookShort': 'Band qilish',
    'header.cart': 'Savatni ochish',

    'status.open': '{time} gacha ochiq',
    'status.closed': 'Yopiq, {time} da ochilamiz',

    'hero.title': 'Samarqandda cho‘g‘da pishgan haqiqiy shirali shashlik',
    'hero.text': 'Go‘shtni o‘z retseptimiz bo‘yicha marinadlaymiz va tabiiy cho‘g‘da pishiramiz. Issiq holda yetkazamiz yoki zalda dasturxon tuzaymiz.',
    'hero.ctaMenu': 'Menyuni ko‘rish',
    'hero.ctaBook': 'Stol band qilish',

    'menu.title': 'Menyu',
    'menu.text': 'Narxlar bir porsiya uchun. Shashlik buyurtmadan keyin pishiriladi, bu 15–20 daqiqa.',
    'menu.categories': 'Menyu bo‘limlari',
    'menu.hit': 'Xit',
    'menu.add': 'Savatga',
    'menu.addAria': 'Savatga qo‘shish: {name}',
    'menu.increase': 'Yana bitta porsiya qo‘shish: {name}',
    'menu.decrease': 'Bitta porsiyani olib tashlash: {name}',
    'menu.qty': 'Savatda: {qty}',
    'menu.noscript': 'Menyuni ko‘rish va buyurtma berish uchun JavaScript’ni yoqing. Yoki bizga qo‘ng‘iroq qiling:',

    'units.g': 'g',
    'units.ml': 'ml',

    'about.title': 'Nega bizga qaytib kelishadi',
    'about.text': 'Ikrom Shashlik’da hammasi manqaldan boshlanadi. Go‘sht kechqurundan marinadlanadi, cho‘g‘ ochilishdan oldin tayyorlanadi, sixlar esa shashlik ichi shirali paytida olinadi.',
    'about.imageAlt': 'Ikrom Shashlik restorani zali kechqurun',
    'about.f1Title': 'Har kuni yangi go‘sht',
    'about.f1Text': 'Qo‘y va mol go‘shtini ishonchli fermerlardan olamiz va muzlatmaymiz.',
    'about.f2Title': 'Faqat tabiiy cho‘g‘',
    'about.f2Text': 'Gaz grili yo‘q: Samarqandcha tutun hidi va qizarib pishgan qobiq.',
    'about.f3Title': '{close} gacha ochiqmiz',
    'about.f3Text': 'Kechki ovqat yoki tungi buyurtma: oshxona har kuni dam olishsiz ishlaydi.',
    'about.f4Title': 'Issiq holda yetkazamiz',
    'about.f4Text': 'Shashlik shirali yetib borishi uchun termoqutilarga joylaymiz.',

    'contacts.title': 'Samarqanddagi manzillarimiz',
    'contacts.text': 'Xaritada ko‘rish uchun filialni tanlang.',
    'contacts.hoursTitle': 'Ish vaqti',
    'contacts.daily': 'Har kuni, {open} – {close}',
    'contacts.call': 'Qo‘ng‘iroq qilish',
    'contacts.yandex': 'Yandex Xaritada ochish',
    'contacts.mapTitle': 'Xarita: {name}',

    'cart.title': 'Buyurtmangiz',
    'cart.label': 'Savat',
    'cart.clear': 'Tozalash',
    'cart.close': 'Yopish',
    'cart.emptyTitle': 'Savat hozircha bo‘sh',
    'cart.emptyText': 'Menyudan taom qo‘shing, ular shu yerda paydo bo‘ladi.',
    'cart.emptyCta': 'Menyuni ochish',
    'cart.howTo': 'Buyurtmani qanday olasiz',
    'cart.pickup': 'Olib ketish',
    'cart.delivery': 'Yetkazib berish',
    'cart.address': 'Yetkazish manzili',
    'cart.addressPh': 'Ko‘cha, uy, podyezd, qavat',
    'cart.branch': 'Filial',
    'cart.comment': 'Izoh',
    'cart.commentPh': 'Masalan: piyozsiz, oldindan qo‘ng‘iroq qiling',
    'cart.subtotal': 'Taomlar',
    'cart.deliveryFee': 'Yetkazib berish',
    'cart.free': 'Bepul',
    'cart.freeHint': 'Bepul yetkazib berishgacha yana {sum} qoldi',
    'cart.total': 'Jami',
    'cart.submit': 'Buyurtmani yuborish',
    'cart.sending': 'Yuborilmoqda…',
    'cart.payNote': 'To‘lov qabul qilishda naqd yoki karta orqali.',
    'cart.successTitle': 'Buyurtma yuborildi',
    'cart.successText': 'Buyurtma raqami: {id}. Operator tasdiqlash uchun {phone} raqamiga qo‘ng‘iroq qiladi.',
    'cart.successCta': 'Menyuga qaytish',
    'cart.error': 'Buyurtma yuborilmadi. Internetni tekshirib, qayta urinib ko‘ring yoki bizga qo‘ng‘iroq qiling.',

    'form.name': 'Ismingiz',
    'form.phone': 'Telefon',
    'form.optional': 'majburiy emas',

    'book.title': 'Stol band qilish',
    'book.text': 'Kontaktlaringizni qoldiring, administrator qo‘ng‘iroq qilib, bandni tasdiqlaydi.',
    'book.date': 'Sana',
    'book.time': 'Vaqt',
    'book.guests': 'Mehmonlar',
    'book.branch': 'Filial',
    'book.comment': 'Istaklar',
    'book.commentPh': 'Masalan: tug‘ilgan kun, bolalar stuli kerak',
    'book.submit': 'Band qilish',
    'book.sending': 'Yuborilmoqda…',
    'book.successTitle': 'Band qilish so‘rovi yuborildi',
    'book.successText': 'Administrator {phone} raqamiga qo‘ng‘iroq qilib, {date}, {time} uchun stolni tasdiqlaydi.',
    'book.done': 'Tayyor',
    'book.error': 'So‘rov yuborilmadi. Qayta urinib ko‘ring yoki bizga qo‘ng‘iroq qiling.',
    'book.guestsOne': '{n} kishi',
    'book.guestsFew': '{n} kishi',
    'book.guestsMany': '{n} kishi',

    'err.name': 'Ismingizni kiriting',
    'err.phone': 'Raqamni to‘liq kiriting: +998 XX XXX XX XX',
    'err.address': 'Yetkazish manzilini kiriting',
    'err.date': 'Sanani tanlang',

    'footer.text': 'Samarqandda tabiiy cho‘g‘da pishgan shashlik.',
    'footer.nav': 'Bo‘limlar',
    'footer.contacts': 'Bog‘lanish',
    'footer.rights': '© {year} Ikrom Shashlik',
  },
};

const I18n = {
  STORAGE_KEY: 'ikrom.lang',
  SUPPORTED: ['ru', 'uz'],
  lang: 'ru',
  globals: {}, // общие переменные для всех строк, например { open: '10:00' }

  /** Текст по ключу с подстановкой переменных: t('status.open', { time: '05:00' }) */
  t(key, vars = {}) {
    const template = TRANSLATIONS[this.lang][key] ?? TRANSLATIONS.ru[key] ?? key;
    const values = { ...this.globals, ...vars };
    return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  },

  /** Значение из объекта вида { ru: '…', uz: '…' } для текущего языка */
  pick(field) {
    return field[this.lang] ?? field.ru;
  },

  /** Склонение для русского (1 гость / 2 гостя / 5 гостей) */
  plural(count, keys) {
    const rule = new Intl.PluralRules('ru').select(count); // one | few | many | other
    const key = rule === 'one' ? keys.one : rule === 'few' ? keys.few : keys.many;
    return this.t(key, { n: count });
  },

  /** Язык из прошлого визита (если браузер разрешает хранилище) */
  loadSaved() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (this.SUPPORTED.includes(saved)) this.lang = saved;
    } catch {
      /* хранилище недоступно (приватный режим) — остаёмся на русском */
    }
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, this.lang);
    } catch {
      /* не критично: язык просто не запомнится */
    }
  },

  /** Подставляет переводы во все размеченные элементы страницы */
  apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = this.t(el.dataset.i18nPlaceholder);
    });
    root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', this.t(el.dataset.i18nAria));
    });
    root.querySelectorAll('[data-i18n-alt]').forEach((el) => {
      el.alt = this.t(el.dataset.i18nAlt);
    });

    document.documentElement.lang = this.lang;
    document.title = this.t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', this.t('meta.description'));
  },
};
