# item/CLAUDE.md

## 🎯 目的・役割

商品マスタ管理とアイテム検索機能の中核ドメイン。POSシステムで扱う全商品の基本情報（商品名、JANコード、カテゴリ、価格等）を管理し、商品検索・選択・登録のユーザーインターフェースを提供する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **検索機能**: Elasticsearch ベースの高速検索
- **状態管理**: React hooks、無限スクロール対応
- **フォーム**: React Hook Form + Zod validation
- **画像管理**: 商品画像アップロード・表示
- **依存関係**: `/api/store/[store_id]/item/`, `/api/store/[store_id]/myca-item/`

## 📁 ディレクトリ構造

```
item/
├── components/                      # UI コンポーネント群
│   ├── ItemImage.tsx               # 商品画像表示
│   ├── ItemText.tsx                # 商品テキスト情報
│   ├── GenreCategoryButtons.tsx    # ジャンル・カテゴリボタン
│   ├── cards/
│   │   ├── AddedCard.tsx           # 追加済み商品カード
│   │   └── AddedPack.tsx           # パック商品カード
│   ├── modals/
│   │   ├── ItemDetailModal.tsx     # 商品詳細モーダル
│   │   ├── ItemDetailModalContainer.tsx
│   │   └── components/
│   │       └── ProductAddButton.tsx # 商品追加ボタン
│   ├── search/
│   │   ├── ItemSearch.tsx          # 商品検索UI
│   │   └── SearchResultView.tsx    # 検索結果表示
│   ├── select/
│   │   ├── CategorySelect.tsx      # カテゴリ選択
│   │   ├── FindOptionSelect.tsx    # 検索オプション選択
│   │   └── GenreSelect.tsx         # ジャンル選択
│   ├── tab/
│   │   └── GenreTab.tsx            # ジャンルタブ
│   └── tables/
│       └── SearchResultMycaTable.tsx # Myca商品検索結果テーブル
├── hooks/                          # カスタムフック群
│   ├── useItems.ts                 # 基本商品操作
│   ├── useItemSearch.ts            # 商品検索
│   ├── useInfiniteItemSearch.ts    # 無限スクロール検索
│   ├── usePaginatedItemSearch.ts   # ページング検索
│   ├── useGetItem.ts               # 商品詳細取得
│   ├── useCreateItems.ts           # 商品新規作成
│   ├── useUpdateItem.ts            # 商品更新
│   ├── useMycaCart.ts              # Mycaカート管理
│   ├── useMycaGenres.ts            # Mycaジャンル取得
│   ├── useSearchMycaItems.ts       # Myca商品検索
│   ├── useCreateMycaGenreAndImportItems.ts # Mycaジャンル作成・商品インポート
│   ├── useGetItemFindOption.ts     # 検索オプション取得
│   ├── useSearchItemByFindOption.ts # オプション別検索
│   └── useIPackItems.ts            # パック商品操作
└── utils.ts                       # ユーティリティ関数
```

## 🔧 主要機能

### 商品マスタ管理
- **商品CRUD**: 新規登録、更新、削除、詳細表示
- **商品情報**: 商品名、JANコード、価格、画像、説明
- **カテゴリ分類**: ジャンル、カテゴリ、サブカテゴリの階層管理
- **商品画像**: 複数画像対応、サムネイル生成

### 高速検索機能
- **全文検索**: 商品名、説明文での高速検索
- **条件検索**: ジャンル、カテゴリ、価格帯での絞り込み
- **バーコード検索**: JANコード、店舗独自コードでの検索
- **候補表示**: 入力途中での検索候補表示

### Myca連携
- **Myca商品データベース**: 業界標準商品データとの連携
- **商品データインポート**: Mycaからの商品情報一括取得
- **価格情報同期**: 市場価格情報の自動更新
- **ジャンル自動分類**: Mycaジャンル体系との連携

### パック・バンドル商品
- **パック商品管理**: 複数商品をセットとして管理
- **開封機能**: パック開封時の個別商品展開
- **在庫連動**: パック・個別商品の在庫自動調整

## 💡 使用パターン

### 商品検索
```typescript
// 無限スクロール検索
const {
  data,
  loading,
  error,
  hasNextPage,
  fetchNextPage,
} = useInfiniteItemSearch({
  query: searchTerm,
  genre: selectedGenre,
  category: selectedCategory,
})

// 検索UI
<ItemSearch
  onSearch={handleSearch}
  onFilterChange={handleFilterChange}
  loading={loading}
/>
```

### 商品詳細表示
```typescript
// 商品詳細モーダル
<ItemDetailModal
  itemId={selectedItemId}
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onAddToCart={handleAddToCart}
/>
```

### 商品選択・カート追加
```typescript
// Mycaカート管理
const { addToCart, removeFromCart, cart } = useMycaCart()

<ProductAddButton
  item={item}
  onAdd={() => addToCart(item)}
  disabled={!item.available}
/>
```

### ジャンル・カテゴリ選択
```typescript
// ジャンル選択
<GenreSelect
  value={selectedGenre}
  onChange={setSelectedGenre}
  genres={availableGenres}
/>

// カテゴリ絞り込み
<CategorySelect
  genre={selectedGenre}
  value={selectedCategory}
  onChange={setSelectedCategory}
/>
```

## 🔗 関連ディレクトリ

- [../products/](../products/) - 在庫・商品実態管理
- [../genre/](../genre/) - ジャンル管理
- [../category/](../category/) - カテゴリ管理
- [../sale/](../sale/) - 売上時の商品選択
- [../purchase/](../purchase/) - 買取時の商品選択
- [../../components/modals/](../../components/modals/) - 商品選択モーダル
- [../../api/backendApi/services/](../../api/backendApi/services/) - 商品API

## 📝 開発メモ

### データモデル
- **Item**: 商品マスタテーブル
- **MycaItem**: Myca連携商品データ
- **ItemGenre**: ジャンル分類
- **ItemCategory**: カテゴリ分類

### 検索パフォーマンス
- **インデックス**: 商品名、JANコード、カテゴリでのDB最適化
- **キャッシュ戦略**: 頻繁に検索される商品データのメモリキャッシュ
- **無限スクロール**: 大量検索結果の効率的表示
- **検索履歴**: ユーザー検索パターンの学習・最適化

### Myca連携仕様
- **API同期**: 定期的なMycaデータベース同期
- **差分更新**: 変更分のみの効率的データ更新
- **価格情報**: リアルタイム市場価格取得
- **画像同期**: 商品画像の自動ダウンロード・保存

### 商品登録ワークフロー
1. **基本情報入力**: 商品名、JANコード等
2. **分類設定**: ジャンル・カテゴリ選択
3. **価格設定**: 基準価格、コンディション別価格
4. **画像登録**: 商品画像アップロード
5. **検証・保存**: データ整合性チェック後保存

### セキュリティ・権限
- **商品データ保護**: 不正な商品データ改変防止
- **店舗データ分離**: 店舗間での商品データアクセス制御
- **Myca認証**: Myca APIアクセス時の認証・認可
- **商品画像**: 画像アップロード時のファイル検証

---
*Frontend-Agent作成: 2025-01-13*