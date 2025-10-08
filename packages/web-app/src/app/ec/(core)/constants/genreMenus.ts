// ジャンル別メニュー設定

export interface GenreMenuItem {
  id: string;
  label: string;
  link: string;
  icon?: string; // アイコンパス（オプション）
}

export interface GenreMenuSection {
  title: string;
  items: GenreMenuItem[];
  sectionImage?: string; // セクション画像パス（オプション）
}

export interface GenreMenuConfig {
  genreId: number;
  genreName: string;
  sections: GenreMenuSection[];
}

// ジャンル別メニュー設定
export const genreMenuConfigs: GenreMenuConfig[] = [
  // ポケモンカードゲーム
  {
    genreId: 1,
    genreName: 'ポケモン',
    sections: [
      {
        title: '最新シリーズ',
        items: [
          {
            id: 'mega',
            label: 'MEGA',
            link: '/ec/items/genre/1?hasStock=true&cardseries=%25MEGA%25',
          },
          {
            id: 'scarlet',
            label: 'スカーレット＆バイオレット',
            link: '/ec/items/genre/1?hasStock=true&cardseries=%25スカーレット%25',
          },
          {
            id: 'sword',
            label: 'ソード&シールド',
            link: '/ec/items/genre/1?hasStock=true&cardseries=%25ソード%25',
          },
          {
            id: 'sun',
            label: 'サン＆ムーン',
            link: '/ec/items/genre/1?hasStock=true&cardseries=%25サン%25',
          },
        ],
      },
      {
        title: '特殊状態',
        items: [
          {
            id: 'PSA10',
            label: 'PSA10',
            link: '/ec/items/genre/1?hasStock=true&specialty=S1_PSA10',
          },
          {
            id: 'UNBOXED',
            label: '未開封',
            link: '/ec/items/genre/1?hasStock=true&specialty=S50_UNBOXED',
          },
        ],
      },
    ],
  },
  /*
  // デュエルマスターズ
  {
    genreId: 3,
    genreName: 'デュエマ',
    sections: [
      {
        title: '商品検索',
        items: [
          {
            id: 'all',
            label: '全ての商品',
            link: '/ec/items/genre/3?hasStock=true',
          },
          {
            id: 'single',
            label: 'シングルカード',
            link: '/ec/items/genre/3?hasStock=true&type=single',
          },
          {
            id: 'pack',
            label: 'パック・BOX',
            link: '/ec/items/genre/3?hasStock=true&type=pack',
          },
          {
            id: 'deck',
            label: 'デッキ・サプライ',
            link: '/ec/items/genre/3?hasStock=true&type=deck',
          },
        ],
      },
      {
        title: '人気カテゴリ',
        items: [
          {
            id: 'rare',
            label: 'レアカード',
            link: '/ec/items/genre/3?hasStock=true&rarity=rare',
          },
          {
            id: 'new',
            label: '最新弾',
            link: '/ec/items/genre/3?hasStock=true&latest=true',
          },
          {
            id: 'tournament',
            label: '大会カード',
            link: '/ec/items/genre/3?hasStock=true&type=tournament',
          },
        ],
      },
    ],
  },
  // 遊戯王
  {
    genreId: 2,
    genreName: '遊戯王',
    sections: [
      {
        title: '商品検索',
        items: [
          {
            id: 'all',
            label: '全ての商品',
            link: '/ec/items/genre/2?hasStock=true',
          },
          {
            id: 'single',
            label: 'シングルカード',
            link: '/ec/items/genre/2?hasStock=true&type=single',
          },
          {
            id: 'pack',
            label: 'パック・BOX',
            link: '/ec/items/genre/2?hasStock=true&type=pack',
          },
          {
            id: 'deck',
            label: 'デッキ・サプライ',
            link: '/ec/items/genre/2?hasStock=true&type=deck',
          },
        ],
      },
      {
        title: '人気カテゴリ',
        items: [
          {
            id: 'rare',
            label: 'レアカード',
            link: '/ec/items/genre/2?hasStock=true&rarity=rare',
          },
          {
            id: 'new',
            label: '最新弾',
            link: '/ec/items/genre/2?hasStock=true&latest=true',
          },
          {
            id: 'structure',
            label: 'ストラクチャー',
            link: '/ec/items/genre/2?hasStock=true&type=structure',
          },
        ],
      },
    ],
  },
  // ヴァイス
  {
    genreId: 4,
    genreName: 'ヴァイス',
    sections: [
      {
        title: '商品検索',
        items: [
          {
            id: 'all',
            label: '全ての商品',
            link: '/ec/items/genre/4?hasStock=true',
          },
          {
            id: 'single',
            label: 'シングルカード',
            link: '/ec/items/genre/4?hasStock=true&type=single',
          },
          {
            id: 'pack',
            label: 'パック・BOX',
            link: '/ec/items/genre/4?hasStock=true&type=pack',
          },
          {
            id: 'trial',
            label: 'トライアル',
            link: '/ec/items/genre/4?hasStock=true&type=trial',
          },
        ],
      },
      {
        title: '人気シリーズ',
        items: [
          {
            id: 'anime',
            label: 'アニメ系',
            link: '/ec/items/genre/4?hasStock=true&series=anime',
          },
          {
            id: 'game',
            label: 'ゲーム系',
            link: '/ec/items/genre/4?hasStock=true&series=game',
          },
          {
            id: 'signed',
            label: 'サイン入り',
            link: '/ec/items/genre/4?hasStock=true&signed=true',
          },
        ],
      },
    ],
  },
  // ワンピース
  {
    genreId: 5,
    genreName: 'ワンピース',
    sections: [
      {
        title: '商品検索',
        items: [
          {
            id: 'all',
            label: '全ての商品',
            link: '/ec/items/genre/5?hasStock=true',
          },
          {
            id: 'single',
            label: 'シングルカード',
            link: '/ec/items/genre/5?hasStock=true&type=single',
          },
          {
            id: 'pack',
            label: 'パック・BOX',
            link: '/ec/items/genre/5?hasStock=true&type=pack',
          },
          {
            id: 'starter',
            label: 'スタートデッキ',
            link: '/ec/items/genre/5?hasStock=true&type=starter',
          },
        ],
      },
      {
        title: '人気カテゴリ',
        items: [
          {
            id: 'leader',
            label: 'リーダーカード',
            link: '/ec/items/genre/5?hasStock=true&type=leader',
          },
          {
            id: 'parallel',
            label: 'パラレル',
            link: '/ec/items/genre/5?hasStock=true&parallel=true',
          },
          {
            id: 'new',
            label: '最新弾',
            link: '/ec/items/genre/5?hasStock=true&latest=true',
          },
        ],
      },
    ],
  },
  */
];

// ジャンルIDからメニュー設定を取得
export const getGenreMenuConfig = (
  genreId: number,
): GenreMenuConfig | undefined => {
  return genreMenuConfigs.find((config) => config.genreId === genreId);
};

// 全ジャンルのリストを取得（メニュー表示用）
export const getAllGenreNames = (): Array<{ id: number; name: string }> => {
  return genreMenuConfigs.map((config) => ({
    id: config.genreId,
    name: config.genreName,
  }));
};
