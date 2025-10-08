# Item Management - 商品マスタ管理

## 概要
商品マスタの一覧表示・検索・編集を行う画面。商品の基本情報（名称、価格、カテゴリ等）を一元管理する。

## 主な機能
- **商品検索** - 名称、レアリティ、カード番号、カテゴリ、ジャンルでの絞り込み
- **価格編集** - 販売価格・買取価格の一括編集モード
- **CSV管理** - 商品マスタのダウンロード/アップロード
- **新規登録** - 商品の新規追加（手動入力、Myca検索、パック開封）
- **非表示商品管理** - 非アクティブ商品の一覧表示・管理
- **ラベル印刷** - 買取後の自動ラベル印刷対応

## 技術仕様

### コンポーネント構成
```tsx
page.tsx // メインページ
components/
├── ItemTable.tsx // 商品一覧テーブル
├── ItemListMenu.tsx // 新規登録メニュー
├── HiddenItemsModal.tsx // 非表示商品モーダル
├── ItemRegisterModal.tsx // 商品登録モーダル
├── MycaItemsModal.tsx // Myca商品検索
└── itemTable/
    ├── ItemTableSort.tsx // ソート機能
    ├── ItemTableCategorySelect.tsx // カテゴリ選択
    └── StockDetailCell.tsx // 在庫詳細セル
```

### 状態管理
- `useItemSearch` - 商品検索ロジック
- `useUpdateItem` - 商品更新処理
- `useMultipleParamsAsState` - URLクエリパラメータ管理
- `editedPrices` - 編集中の価格情報

### APIエンドポイント
```typescript
// 商品一覧取得
clientAPI.item.getAll({
  storeID: number,
  includesProducts?: boolean,
  // 検索条件
})

// CSV取得
clientAPI.item.getCsvFile({
  storeID: number
})
```

## 使用方法

### 基本操作
1. **検索**: 上部の検索フィールドで条件指定
2. **価格編集**: 「価格編集モード」ボタンクリック → 直接入力 → 保存
3. **CSV**: ダウンロード/アップロードボタンから実行

### 新規商品登録
1. 「新規商品登録」ボタンクリック
2. 登録方法を選択:
   - 手動入力
   - Myca商品検索
   - パック開封

### 買取連携機能
買取画面から価格未設定商品の編集のため遷移した場合:
1. 自動的に価格編集モードが有効化
2. 価格保存後、該当商品のラベルを自動印刷

## データフロー
```
URLクエリパラメータ
  ↓
useItemSearch（検索実行）
  ↓
ItemTable（表示）
  ↓
価格編集 → useUpdateItem
  ↓
API更新 → 再検索
```

## 関連機能
- **ラベルプリンター連携** - 価格設定後の自動印刷
- **LocalStorage連携** - 買取データの一時保存
- **ページネーション** - 大量データの分割表示

## 注意事項
- 価格編集モード中は他の操作が制限される
- CSV操作は大量データの場合時間がかかる
- 買取連携時はLocalStorageのデータが自動削除される

## 関連リンク
- [在庫管理](/auth/(dashboard)/stock/)
- [買取処理](/auth/(dashboard)/purchase/)
- [商品登録](/auth/(dashboard)/item/register/)
- [設定 - ジャンル・カテゴリ](/auth/(dashboard)/settings/genre-and-category/)