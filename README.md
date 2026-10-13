# Ikrom Shashlik — сайт ресторана

Одностраничный сайт: меню с корзиной, оформление заказа (самовывоз или доставка), бронь стола, адреса с картой. Два языка: русский и узбекский (латиница).

## Запуск

Откройте `index.html` в браузере. Сборка не нужна: Tailwind, шрифт и фото загружаются по сети.

Удобнее через локальный сервер:

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## Структура

```
index.html              разметка всех секций
assets/css/styles.css   токены, компоненты, шторки, анимации
assets/js/config.js     телефон, часы, филиалы, доставка, адреса API
assets/js/i18n.js       тексты интерфейса RU / UZ
assets/js/menu-data.js  категории и блюда
assets/js/cart.js       состояние корзины (без DOM)
assets/js/app.js        интерфейс: меню, корзина, бронь, карта, язык
assets/img/favicon.svg  иконка вкладки
```

## Что заменить перед запуском

Значения ниже — демонстрационные, в коде они помечены `TODO`.

1. **Телефон, филиалы, координаты, соцсети** — `assets/js/config.js`.
2. **Фото блюд** — сейчас это заглушки с Unsplash. Положите свои WebP в `assets/img/menu/` и укажите путь в `menu-data.js`: `image: 'assets/img/menu/lamb.webp'`. Пропорции 4:3, ширина от 640px.
3. **Фото первого экрана и зала** — в `index.html` (секции `hero` и `about`). Там же в комментарии показано, как поставить видео.
4. **Цены и состав меню** — `assets/js/menu-data.js`.
5. **Тексты** — `assets/js/i18n.js`. Часы работы подставляются из `config.js` автоматически.

## Отправка заказов и броней

Пока `CONFIG.api.orderUrl` и `CONFIG.api.bookingUrl` пустые, сайт работает в демо-режиме: заявка выводится в консоль браузера, пользователь видит экран успеха.

Чтобы заявки уходили, например, в Telegram-бот, укажите адрес своего бэкенда. Сайт отправляет `POST` с JSON и ждёт в ответ `{ "id": "1234" }`. Токен бота храните только на сервере, не во фронтенде.

Пример заказа:

```json
{
  "kind": "order",
  "createdAt": "2026-10-13T15:00:00.000Z",
  "lang": "ru",
  "customer": { "name": "Азиз", "phone": "+998 90 123 45 67" },
  "delivery": { "type": "delivery", "address": "ул. Регистан, 5", "branchId": null },
  "comment": "",
  "items": [{ "id": "plov", "name": "Самаркандский плов", "price": 45000, "qty": 2, "sum": 90000 }],
  "subtotal": 90000,
  "deliveryFee": 15000,
  "total": 105000
}
```

## Продакшн

Tailwind через CDN подходит для проверки. Для боевого сайта соберите CSS:

1. Перенесите объект `tailwind.config` из `index.html` в `tailwind.config.js` и добавьте `content: ['./index.html', './assets/js/**/*.js']`.
2. Соберите: `npx tailwindcss@3 -i ./assets/css/tailwind.css -o ./assets/css/tailwind.min.css --minify` (во входном файле — три директивы `@tailwind base; @tailwind components; @tailwind utilities;`).
3. В `index.html` замените два `<script>` Tailwind на `<link rel="stylesheet" href="assets/css/tailwind.min.css">` перед `styles.css`.
