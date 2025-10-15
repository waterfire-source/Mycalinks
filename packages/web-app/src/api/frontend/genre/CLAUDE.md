# Genre API

## 概要
ジャンル管理のためのフロントエンドAPI。商品の大分類となるジャンルの作成、取得、更新、削除を行い、カテゴリの上位概念として商品体系を構築する。

## 主要機能

### ジャンル管理
- ジャンル一覧取得
- ジャンル作成・更新・削除
- 表示順管理
- カテゴリ関連付け

### Mycaジャンル連携
- Mycaマスタからのインポート
- ジャンルマッピング
- 自動同期
- カスタマイズ

### 権限制御
- 店舗別ジャンル設定
- タブレット表示制御
- API公開設定
- アクセス権限

## API一覧

### ジャンル取得
```typescript
getGenreAll: {
  request: {
    storeID: number;
    fromTablet?: boolean;  // タブレット用フィルタ
  };
  response: {
    genres: Array<{
      id: number;
      display_name: string;
      display_order: number;
      myca_genre_id?: number;
      categories: ItemCategory[];
    }>;
  };
}
```

### ジャンル作成
```typescript
createGenre: {
  request: {
    storeID: number;
    displayName: string;
  };
  response: {
    genre: ItemGenre;
  };
}
```

### Mycaジャンル追加
```typescript
createMycaGenre: {
  request: {
    storeID: number;
    mycaGenreID: number;
  };
  response: {
    genre: ItemGenre;
  };
}
```

### ジャンル更新
```typescript
updateGenre: {
  request: {
    storeID: number;
    genreID: number;
    displayName?: string;
    displayOrder?: number;
    hidden?: boolean;
  };
  response: {
    genre: ItemGenre;
  };
}
```

### ジャンル削除
```typescript
deleteGenre: {
  request: {
    storeID: number;
    genreID: number;
  };
  response: {
    success: boolean;
  };
}
```

## データモデル

### ItemGenre
```typescript
interface ItemGenre {
  id: number;
  corporation_id: number;
  display_name: string;         // 表示名
  display_order: number;        // 表示順
  myca_genre_id?: number;       // Mycaジャンル連携ID
  hidden: boolean;              // 非表示フラグ
  created_at: Date;
  updated_at: Date;
}
```

### GenreCategory関係
```typescript
interface GenreCategoryRelation {
  genre_id: number;
  category_id: number;
  display_order: number;
}
```

## ジャンル体系

### 標準ジャンル例
```
トレーディングカード
├── ポケモンカード
├── 遊戯王
├── MTG
└── その他TCG

ゲーム
├── Nintendo Switch
├── PlayStation
├── レトロゲーム
└── その他ゲーム

ホビー
├── フィギュア
├── プラモデル
├── ミニカー
└── その他ホビー
```

### Mycaジャンル
- 業界標準分類
- 定期更新
- カスタマイズ可能
- 互換性保証

## 表示制御

### タブレット表示
- 表示ジャンル選択
- カテゴリフィルタ
- 並び順カスタマイズ
- 簡易表示モード

### 店舗別設定
- ジャンル有効/無効
- カスタムジャンル
- 表示優先度
- 地域特性対応

## バリデーション

### ジャンル名
- 最大文字数: 50文字
- 重複チェック
- 特殊文字制限
- 空白トリム

### 階層構造
- 最大階層: 3階層
- 循環参照防止
- 孤立ジャンル検出
- 整合性チェック

## エラーハンドリング

### 一般的なエラー
- `400`: バリデーションエラー
- `404`: ジャンルが見つからない
- `409`: 重複エラー
- `500`: サーバーエラー

### 削除時の制約
- カテゴリ存在チェック
- 商品紐付けチェック
- 依存関係確認
- カスケード削除オプション

## キャッシュ戦略

### フロントエンドキャッシュ
- ジャンル一覧キャッシュ
- 更新時の無効化
- 楽観的更新
- バックグラウンド同期

### APIレスポンスキャッシュ
- CDNキャッシュ
- ETagサポート
- 条件付きリクエスト
- キャッシュ期間設定

## 使用例

### ジャンル一覧取得
```typescript
const genreAPI = new GenreAPI();
const response = await genreAPI.getGenreAll({
  storeID: 1,
  fromTablet: false
});

if (!(response instanceof CustomError)) {
  const genres = response.genres;
  // ジャンル一覧を表示
}
```

### ジャンル作成
```typescript
const response = await genreAPI.createGenre({
  storeID: 1,
  displayName: "新規ジャンル"
});

if (!(response instanceof CustomError)) {
  console.log("作成されたジャンル:", response.genre);
}
```

### Mycaジャンル追加
```typescript
const response = await genreAPI.createMycaGenre({
  storeID: 1,
  mycaGenreID: 123
});
```

## 分析活用

### ジャンル別分析
- 売上構成
- 在庫分布
- 回転率
- 利益率

### トレンド分析
- 人気ジャンル推移
- 季節変動
- 新規ジャンル成長
- 衰退ジャンル特定

## 今後の拡張予定

1. **AIジャンル分類**
   - 自動ジャンル提案
   - 商品画像からの判定
   - テキスト解析
   - 類似ジャンルグルーピング

2. **動的ジャンル生成**
   - トレンドベース生成
   - 顧客嗜好反映
   - 地域特性考慮
   - イベント連動

3. **外部連携強化**
   - 業界標準分類対応
   - ECプラットフォーム連携
   - POSシステム互換
   - データ交換API

## 関連機能

- [カテゴリ管理](/category/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [Mycaアイテム](/myca-item/CLAUDE.md)
- [統計分析](/stats/CLAUDE.md)