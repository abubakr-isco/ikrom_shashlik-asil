/* ==========================================================================
   cart.js — состояние корзины (без работы с DOM)
   --------------------------------------------------------------------------
   Корзина хранит только пары «id блюда → количество». Цены и названия
   всегда берутся из MENU, поэтому изменение прайса сразу видно в корзине.
   Интерфейс подписывается на изменения через Cart.subscribe(fn).
   ========================================================================== */

const Cart = (() => {
  const STORAGE_KEY = 'ikrom.cart.v1';
  const MAX_QTY = 50; // защита от случайного «залипания» кнопки +

  const listeners = new Set();
  let lines = load(); // { [dishId]: qty }

  /** Читаем корзину из прошлого визита и отбрасываем блюда, которых больше нет в меню */
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      const clean = {};
      for (const [id, qty] of Object.entries(saved)) {
        if (DISHES_BY_ID.has(id) && Number.isInteger(qty) && qty > 0) {
          clean[id] = Math.min(qty, MAX_QTY);
        }
      }
      return clean;
    } catch {
      return {};
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* хранилище недоступно — корзина живёт до перезагрузки страницы */
    }
  }

  /** Сохраняем и оповещаем подписчиков (перерисовка интерфейса) */
  function commit() {
    save();
    listeners.forEach((listener) => listener());
  }

  return {
    getQty(id) {
      return lines[id] || 0;
    },

    add(id) {
      if (!DISHES_BY_ID.has(id)) return;
      lines[id] = Math.min(this.getQty(id) + 1, MAX_QTY);
      commit();
    },

    remove(id) {
      if (!lines[id]) return;
      lines[id] -= 1;
      if (lines[id] === 0) delete lines[id];
      commit();
    },

    clear() {
      lines = {};
      commit();
    },

    /** Позиции в порядке добавления: [{ dish, qty, sum }] */
    items() {
      return Object.entries(lines).map(([id, qty]) => {
        const dish = DISHES_BY_ID.get(id);
        return { dish, qty, sum: dish.price * qty };
      });
    },

    count() {
      return Object.values(lines).reduce((total, qty) => total + qty, 0);
    },

    subtotal() {
      return this.items().reduce((total, line) => total + line.sum, 0);
    },

    subscribe(listener) {
      listeners.add(listener);
    },
  };
})();
