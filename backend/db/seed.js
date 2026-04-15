/**
 * npm run db:seed
 * Inserts the 15 initial perfume products (skips duplicates via ON CONFLICT DO NOTHING).
 */
require('dotenv').config();
const pool = require('../src/db');

const PRODUCTS = [
  {
    id:          'maison-crivelli-oud-maracuja',
    name:        'Oud Maracuja',
    brand:       'Maison Crivelli',
    price:       375,
    description: 'Экзотический аромат с нотами уда, маракуйи, шафрана, индонезийского пачули и турецкой розы. Перенесёт в сердце удового леса.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw730c6ffd/images/Q6012009_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'maison-crivelli-tubereuse-astrale',
    name:        'Tubéreuse Astrale',
    brand:       'Maison Crivelli',
    price:       360,
    description: 'Облако искрящегося туберозы, озарённое аккордом бархатистой кожи и мускуса. Корица, мёдовая тубероза, османтус и тёплая ваниль.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwe3f4ec8d/images/Q601200B_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'hermes-terre-d-hermes',
    name:        "Terre d'Hermès",
    brand:       'Hermès',
    price:       125,
    description: 'Тёплый древесный аромат с кедром, искрящимся грейпфрутом и лучистой нотой шисо. История отношений человека с природой.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw01881bb4/images/47117042_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'hermes-terre-d-hermes-gift-set',
    name:        "Terre d'Hermès — Gift Set",
    brand:       'Hermès',
    price:       98,
    description: 'Подарочный набор: спрей-парфюм 30 мл + сменный флакон 125 мл. Древесный, растительный, минеральный — грейпфрут, кедр, кремень.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-base-master/default/dwa479447a/images/47117031_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'dg-the-one-for-men',
    name:        'The One For Men',
    brand:       'Dolce & Gabbana',
    price:       60,
    description: 'Изысканный аромат с чёрным перцем и апельсином таррокко, амбровым лабданумом и тёплым табаком для чувственного образа.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw63e14d90/images/30217009_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'dg-intenso',
    name:        'Intenso',
    brand:       'Dolce & Gabbana',
    price:       54,
    description: 'Древесно-ароматный парфюм с аккордом моэпеля, зелёным базиликом, лавандой, сандалом и бальзамическим мёдом лабданума.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-base-master/default/dw6063ea6a/images/30217950_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'dg-q-eau-de-parfum-intense',
    name:        'Q By Dolce&Gabbana Intense',
    brand:       'Dolce & Gabbana',
    price:       70,
    description: 'Женственный, утончённый и мощный аромат: вишня, гелиотроп и янтарные ноты в насыщенной парфюмной концентрации.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwd0e1f1f5/images/30200865_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'creed-millesime-imperial',
    name:        'Millesime Imperial',
    brand:       'Creed',
    price:       278,
    description: 'Свежий и бодрящий аромат с бергамотом, чёрной смородиной и фиалковым листом, ирисом в сердце и тёплой базой из кедра, сандала и мускуса.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwc11ba078/images/23917490_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'creed-sublime-vanille',
    name:        'Sublime Vanille',
    brand:       'Creed',
    price:       409,
    description: 'Первый из коллекции Les Royales Exclusives — парфюм и объект искусства, созданный мастером Оливье Кридом и его сыном Эрвином.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwb7b4d418/images/23923841_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'creed-royal-princess-oud',
    name:        'Royal Princess Oud',
    brand:       'Creed',
    price:       252,
    description: 'Женственный парфюм, вдохновлённый миром моды XIX века и богатым наследием английской от-кутюр.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw704833b8/images/23913137_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'rabanne-1-million-night-elixir',
    name:        '1 Million Night Elixir',
    brand:       'Rabanne',
    price:       101,
    description: 'Янтарная чувственность и свежий мандарин с аддиктивным кленовым сиропом — магнетический аромат, рождённый ночью.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwdf1dcaed/images/738175B5_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'hugo-boss-bottled-triumph-elixir',
    name:        'Boss Bottled Triumph Elixir',
    brand:       'Hugo Boss',
    price:       60,
    description: 'Живой древесно-янтарный аромат с фиалковым листом, ветивером и пачули — концентрированный эликсир для уверенного мужчины.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dwaaf915a8/images/11117M05_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'jpgaultier-scandal-pour-homme-absolu',
    name:        'Scandal Pour Homme Absolu',
    brand:       'Jean Paul Gaultier',
    price:       84,
    description: 'Интенсивный древесно-гурманский аромат с каштаном, сандалом и мирабелью. Чувственный и неисправимый — для вечернего выхода.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw83d13515/images/3971782A_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'prada-l-homme',
    name:        "L'Homme Prada",
    brand:       'Prada',
    price:       84,
    description: 'Смелое исследование мужественности: чёрный перец, герань и пачули с тёплым янтарём, ирисом и цветочным нероли в финале.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw842bc577/images/73018645_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'armani-stronger-with-you-amber',
    name:        'Stronger With You Amber',
    brand:       'Giorgio Armani',
    price:       77,
    description: 'Янтарный фужерный аромат: прованская лаванда, тёплые специи с янтарным аккордом и бурбонская ваниль — аддиктивное сочетание.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-base-master/default/dw27963c8d/images/0301787L_P.jpg?sw=1500&sh=1500&sm=fit',
  },
  {
    id:          'tom-ford-tobacco-vanille',
    name:        'Tobacco Vanille',
    brand:       'Tom Ford',
    price:       229,
    description: 'Роскошный аромат в стиле английских джентльменских клубов: табак, тонка, ваниль, какао и пряности.',
    imageUrl:    'https://www.my-origines.com/dw/image/v2/BJRD_PRD/on/demandware.static/-/Sites-size-master/default/dw4e3a52d1/images/88F23145_P.jpg?sw=1500&sh=1500&sm=fit',
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    let inserted = 0;
    for (const p of PRODUCTS) {
      const result = await client.query(
        `INSERT INTO products (id, name, brand, price, description, image_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.brand, p.price, p.description, p.imageUrl],
      );
      if (result.rowCount > 0) inserted++;
    }
    console.log(`✅  Seeded ${inserted} product(s) (${PRODUCTS.length - inserted} already existed).`);
  } catch (err) {
    console.error('❌  Seed error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
