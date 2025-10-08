// ジャンルカードのデータ
export const genreCards = [
  { id: 1, title: 'ポケモンカードゲーム', image: '/sample.png' },
  { id: 2, title: '遊戯王', image: '/sample.png' },
  { id: 3, title: 'デュエルマスターズ', image: '/sample.png' },
  { id: 4, title: 'ヴァイスシュバルツ', image: '/sample.png' },
  { id: 5, title: 'ワンピースカードゲーム', image: '/sample.png' },
  { id: 6, title: 'デジモンカードゲーム', image: '/sample.png' },
  { id: 7, title: 'ヴァンガード', image: '/sample.png' },
  { id: 8, title: 'シャドウバースエボルブ', image: '/sample.png' },
  { id: 9, title: 'RUSHデュエル', image: '/sample.png' },
  { id: 10, title: 'バトルスピリッツ', image: '/sample.png' },
  { id: 11, title: '名探偵コナンカードゲーム', image: '/sample.png' },
  { id: 12, title: 'ユニオンアリーナ', image: '/sample.png' },
  { id: 13, title: 'プロ野球ドリームオーダー', image: '/sample.png' },
  { id: 14, title: 'ヴァイスシュバルツブロウ', image: '/sample.png' },
  { id: 15, title: 'Z/X', image: '/sample.png' },
  { id: 16, title: 'ドラゴンボール超カードゲーム', image: '/sample.png' },
];

// カルーセルバナーの型定義
export interface CarouselItem {
  id: number;
  image: string;
  title: string;
  description: string;
  link: string | null;
  linkType: 'internal' | 'external' | null;
}

// カルーセルバナーのデータ
export const carouselItems: CarouselItem[] = [
  {
    id: 1,
    image: '/images/ec/Inferno.png',
    title: 'ポケモンカードゲーム MEGA 拡張パック「インフェルノX」',
    description: 'ポケモンカードゲーム MEGA 拡張パック「インフェルノX」が登場',
    link: '/ec/items/genre/1?name=M2&hasStock=true&category=CARD&cardseries=%25MEGA%25',
    linkType: 'internal',
  },
  {
    id: 2,
    image: '/images/ec/25pr3_banner.jpg',
    title:
      'デュエル・マスターズTCG 王道W 第3弾 邪神vs時皇 ～ビヨンド・ザ・タイム～',
    description:
      'デュエル・マスターズTCG 王道W 第3弾 邪神vs時皇 ～ビヨンド・ザ・タイム～ がMycalinks Mallに登場！',
    link: '/ec/items/genre/4?orderBy=-actual_ec_sell_price&name=25RP3&hasStock=true',
    linkType: 'internal',
  },
  {
    id: 3,
    image: '/images/ec/mega_banner.jpg',
    title: 'ポケモンMEGAシリーズ',
    description: 'ポケモンカードゲームのMEGAシリーズが登場',
    link: '/ec/items/genre/1?hasStock=true&orderBy=-actual_ec_sell_price&category=CARD&cardseries=%25MEGA%25',
    linkType: 'internal',
  },
];

// アルカジア島バナーのデータ
export const bottomBannerItems = [
  {
    id: 1,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 2,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 3,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
  {
    id: 4,
    image: '/images/ec/vs_new_banner.png',
    title: "Archazia's Island Single-Player Decks Overview",
  },
];
