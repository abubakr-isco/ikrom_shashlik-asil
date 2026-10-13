/* ==========================================================================
   menu-data.js — категории и блюда
   --------------------------------------------------------------------------
   Чтобы добавить блюдо, скопируйте любой объект в MENU и поменяйте поля:
     id          — уникальный латинский ключ (используется в корзине)
     category    — id категории из CATEGORIES
     name        — название на двух языках
     description — короткое описание (1 строка)
     weight/unit — выход порции: unit 'g' (граммы) или 'ml' (миллилитры)
     price       — цена в сумах, целым числом
     image       — путь к фото (WebP)
     hit         — true, если нужно показать метку «Хит»

   Фото сейчас подгружаются с Unsplash как заглушки. Для продакшна положите
   свои снимки в assets/img/menu/ и укажите путь: image: 'assets/img/menu/lamb.webp'
   ========================================================================== */

/** Ссылка на фото-заглушку с Unsplash: сразу WebP, обрезка 4:3 */
const photo = (id, width = 640) =>
  `https://images.unsplash.com/photo-${id}?w=${width}&h=${Math.round(width * 0.75)}&fit=crop&q=70&fm=webp`;

const CATEGORIES = [
  { id: 'shashlik', name: { ru: 'Шашлыки', uz: 'Shashliklar' } },
  { id: 'sets', name: { ru: 'Сеты', uz: 'Setlar' } },
  { id: 'hot', name: { ru: 'Горячие блюда', uz: 'Issiq taomlar' } },
  { id: 'soups', name: { ru: 'Супы', uz: 'Sho‘rvalar' } },
  { id: 'salads', name: { ru: 'Салаты', uz: 'Salatlar' } },
  { id: 'drinks', name: { ru: 'Напитки', uz: 'Ichimliklar' } },
];

const MENU = [
  /* ---------- Шашлыки ---------- */
  {
    id: 'lamb',
    category: 'shashlik',
    name: { ru: 'Шашлык из баранины', uz: 'Qo‘y go‘shtidan shashlik' },
    description: { ru: 'Мякоть молодой баранины, курдючный жир, лук и зира', uz: 'Yosh qo‘y go‘shti, dumba yog‘i, piyoz va zira' },
    weight: 180, unit: 'g', price: 38000, hit: true,
    image: photo('1603360946369-dc9bb6258143'),
  },
  {
    id: 'lyulya',
    category: 'shashlik',
    name: { ru: 'Люля-кебаб из баранины', uz: 'Qo‘y go‘shtidan lula-kabob' },
    description: { ru: 'Рубленая вручную баранина с луком и специями', uz: 'Qo‘lda chopilgan qo‘y go‘shti, piyoz va ziravorlar' },
    weight: 200, unit: 'g', price: 32000, hit: true,
    image: photo('1555939594-58d7cb561ad1'),
  },
  {
    id: 'rack',
    category: 'shashlik',
    name: { ru: 'Каре ягнёнка', uz: 'Qo‘zichoq qovurg‘asi' },
    description: { ru: 'Рёбрышки на косточке в маринаде с чёрным перцем', uz: 'Qora murchli marinaddagi suyakli qovurg‘alar' },
    weight: 250, unit: 'g', price: 65000,
    image: photo('1529193591184-b1d58069ecdd'),
  },
  {
    id: 'beef',
    category: 'shashlik',
    name: { ru: 'Шашлык из говядины', uz: 'Mol go‘shtidan shashlik' },
    description: { ru: 'Вырезка в маринаде из лука и гранатового сока', uz: 'Piyoz va anor sharbatida marinadlangan mol go‘shti' },
    weight: 180, unit: 'g', price: 36000,
    image: photo('1558030006-450675393462'),
  },
  {
    id: 'jigar',
    category: 'shashlik',
    name: { ru: 'Жигар в курдюке', uz: 'Dumbali jigar' },
    description: { ru: 'Печень с курдючным салом, классика мангала', uz: 'Dumba yog‘i bilan jigar, manqal klassikasi' },
    weight: 150, unit: 'g', price: 28000,
    image: photo('1529692236671-f1f6cf9683ba'),
  },
  {
    id: 'wings',
    category: 'shashlik',
    name: { ru: 'Куриные крылья на углях', uz: 'Cho‘g‘da pishgan tovuq qanotlari' },
    description: { ru: 'Острый маринад с паприкой и чесноком', uz: 'Paprika va sarimsoqli achchiq marinad' },
    weight: 300, unit: 'g', price: 34000,
    image: photo('1608039755401-742074f0548d'),
  },

  /* ---------- Сеты ---------- */
  {
    id: 'set-samarkand',
    category: 'sets',
    name: { ru: 'Сет «Самарканд»', uz: '«Samarqand» seti' },
    description: { ru: 'Баранина, люля, каре, крылья, овощи и лепёшка на 3–4 гостей', uz: 'Qo‘y go‘shti, lula, qovurg‘a, qanotlar, sabzavot va non, 3–4 kishiga' },
    weight: 1500, unit: 'g', price: 380000, hit: true,
    image: photo('1544025162-d76694265947'),
  },
  {
    id: 'set-duo',
    category: 'sets',
    name: { ru: 'Сет «На двоих»', uz: '«Ikki kishilik» set' },
    description: { ru: 'Четыре шампура на выбор шефа, ачичук и лепёшка', uz: 'Oshpaz tanlagan to‘rtta six, achchiq-chuchuk va non' },
    weight: 800, unit: 'g', price: 195000,
    image: photo('1504674900247-0877df9cc836'),
  },
  {
    id: 'set-chicken',
    category: 'sets',
    name: { ru: 'Куриный сет', uz: 'Tovuqli set' },
    description: { ru: 'Голени и крылья на углях, картофель и два соуса', uz: 'Cho‘g‘da pishgan son va qanotlar, kartoshka va ikki xil sous' },
    weight: 1000, unit: 'g', price: 160000,
    image: photo('1610057099443-fde8c4d50f91'),
  },

  /* ---------- Горячие блюда ---------- */
  {
    id: 'plov',
    category: 'hot',
    name: { ru: 'Самаркандский плов', uz: 'Samarqand oshi' },
    description: { ru: 'Жёлтая морковь, баранина и рис девзира из казана', uz: 'Sariq sabzi, qo‘y go‘shti va devzira guruchi, qozonda' },
    weight: 400, unit: 'g', price: 45000, hit: true,
    image: photo('1630851840633-f96999247032'),
  },
  {
    id: 'kazan-kebab',
    category: 'hot',
    name: { ru: 'Казан-кебаб', uz: 'Qozon kabob' },
    description: { ru: 'Баранина с картофелем, обжаренные в казане', uz: 'Qozonda qovurilgan qo‘y go‘shti va kartoshka' },
    weight: 450, unit: 'g', price: 85000,
    image: photo('1594041680534-e8c8cdebd659'),
  },
  {
    id: 'samsa',
    category: 'hot',
    name: { ru: 'Самса из тандыра', uz: 'Tandir somsa' },
    description: { ru: 'Слоёное тесто, рубленая баранина и лук', uz: 'Qatlama xamir, chopilgan qo‘y go‘shti va piyoz' },
    weight: 180, unit: 'g', price: 12000,
    image: photo('1601050690597-df0568f70950'),
  },
  {
    id: 'manty',
    category: 'hot',
    name: { ru: 'Манты с бараниной', uz: 'Qo‘y go‘shtli manti' },
    description: { ru: 'Пять штук на пару, подаём со сметаной', uz: 'Bug‘da pishgan beshta manti, qaymoq bilan' },
    weight: 350, unit: 'g', price: 35000,
    image: photo('1563245372-f21724e3856d'),
  },

  /* ---------- Супы ---------- */
  {
    id: 'shurpa',
    category: 'soups',
    name: { ru: 'Шурпа из баранины', uz: 'Qo‘y go‘shtli sho‘rva' },
    description: { ru: 'Наваристый бульон, мясо на кости и крупные овощи', uz: 'Quyuq sho‘rva, suyakli go‘sht va yirik sabzavotlar' },
    weight: 450, unit: 'g', price: 38000,
    image: photo('1582878826629-29b7ad1cdc43'),
  },
  {
    id: 'lagman',
    category: 'soups',
    name: { ru: 'Лагман', uz: 'Lag‘mon' },
    description: { ru: 'Тянутая лапша, говядина и овощи', uz: 'Cho‘zma lag‘mon, mol go‘shti va sabzavotlar' },
    weight: 450, unit: 'g', price: 40000,
    image: photo('1607330289024-1535c6b4e1c1'),
  },
  {
    id: 'mastava',
    category: 'soups',
    name: { ru: 'Мастава', uz: 'Mastava' },
    description: { ru: 'Рисовый суп с бараниной и катыком', uz: 'Qo‘y go‘shti va qatiqli guruchli sho‘rva' },
    weight: 400, unit: 'g', price: 30000,
    image: photo('1559847844-5315695dadae'),
  },

  /* ---------- Салаты ---------- */
  {
    id: 'achichuk',
    category: 'salads',
    name: { ru: 'Ачичук', uz: 'Achchiq-chuchuk' },
    description: { ru: 'Томаты, сладкий лук и острый перец, лучший друг шашлыка', uz: 'Pomidor, shirin piyoz va achchiq qalampir, shashlikning eng yaxshi do‘sti' },
    weight: 250, unit: 'g', price: 18000, hit: true,
    image: photo('1592417817098-8fd3d9eb14a5'),
  },
  {
    id: 'tashkent',
    category: 'salads',
    name: { ru: 'Салат «Ташкент»', uz: '«Toshkent» salati' },
    description: { ru: 'Зелёная редька, говядина, жареный лук и яйцо', uz: 'Ko‘k turp, mol go‘shti, qovurilgan piyoz va tuxum' },
    weight: 250, unit: 'g', price: 32000,
    image: photo('1547496502-affa22d38842'),
  },
  {
    id: 'greens',
    category: 'salads',
    name: { ru: 'Овощи с рейханом', uz: 'Rayhonli sabzavot salati' },
    description: { ru: 'Огурцы, томаты, редис и рейхан с лимонным соком', uz: 'Bodring, pomidor, rediska va rayhon, limon sharbati bilan' },
    weight: 300, unit: 'g', price: 25000,
    image: photo('1540189549336-e6e99c3679fe'),
  },

  /* ---------- Напитки ---------- */
  {
    id: 'green-tea',
    category: 'drinks',
    name: { ru: 'Зелёный чай', uz: 'Ko‘k choy' },
    description: { ru: 'Чайник на компанию, к нему нават', uz: 'Davra uchun choynak, novvot bilan' },
    weight: 800, unit: 'ml', price: 12000,
    image: photo('1558160074-4d7d8bdf4256'),
  },
  {
    id: 'lemonade',
    category: 'drinks',
    name: { ru: 'Домашний лимонад', uz: 'Uy limonadi' },
    description: { ru: 'Лимон, лайм и мята, кувшин', uz: 'Limon, laym va yalpiz, ko‘zada' },
    weight: 1000, unit: 'ml', price: 35000,
    image: photo('1513558161293-cdaf765ed2fd'),
  },
  {
    id: 'compote',
    category: 'drinks',
    name: { ru: 'Ягодный компот', uz: 'Rezavorli kompot' },
    description: { ru: 'Клубника и вишня, без лишнего сахара', uz: 'Qulupnay va olcha, ortiqcha shakarsiz' },
    weight: 1000, unit: 'ml', price: 25000,
    image: photo('1497534446932-c925b458314e'),
  },
  {
    id: 'orange-juice',
    category: 'drinks',
    name: { ru: 'Апельсиновый фреш', uz: 'Apelsin fresh' },
    description: { ru: 'Только что выжатые апельсины', uz: 'Yangi siqilgan apelsin' },
    weight: 300, unit: 'ml', price: 28000,
    image: photo('1600271886742-f049cd451bba'),
  },
];

/** Быстрый поиск блюда по id (нужен корзине) */
const DISHES_BY_ID = new Map(MENU.map((dish) => [dish.id, dish]));
