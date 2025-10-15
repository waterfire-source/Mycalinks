# Transaction Management - 取引管理

## 概要
店舗の全取引（販売・買取）を一覧表示・検索・分析する画面。日別・商品別の集計機能も提供。

## 主な機能
- **取引一覧** - 全取引の時系列表示
- **取引詳細** - 個別取引の商品明細・金額内訳
- **検索・フィルタ** - 期間、取引種別、スタッフでの絞り込み
- **商品別集計** - 商品ごとの売上・買取集計
- **レスポンシブ対応** - PC/モバイル両対応

## 技術仕様

### コンポーネント構成
```tsx
page.tsx // メインページ（デバイス判定）
components/
├── TransactionContentsCard.tsx // PC版メインコンポーネント
├── MobileTransactionContentsCard.tsx // モバイル版
└── TransactionTab.tsx // タブ切り替え

product/ // 商品別集計
├── page.tsx
└── components/
    ├── ProductList.tsx // 商品一覧
    ├── ProductDetail.tsx // 商品詳細
    ├── SearchProduct.tsx // 商品検索
    └── TotalSalesOrPurchases.tsx // 売上/買取集計
```

### レスポンシブ対応
```typescript
const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
// モバイル: MobileTransactionContentsCard
// PC: TransactionContentsCard
```

### データ構造
```typescript
interface Transaction {
  id: number;
  transaction_kind: 'BUY' | 'SELL';
  total_price: number;
  created_at: Date;
  account: Account;
  customer?: Customer;
  transaction_products: TransactionProduct[];
}
```

## 使用方法

### 取引一覧画面
1. デフォルトで本日の取引を表示
2. 日付範囲で絞り込み可能
3. 取引クリックで詳細表示

### 商品別集計画面
1. 「商品別」タブをクリック
2. 商品を検索・選択
3. 期間指定で売上/買取を集計

## ビュー切り替え
- **日別ビュー**: 時系列での取引確認
- **商品別ビュー**: 商品単位での分析
- **モバイルビュー**: 簡略化されたUI

## 主要機能詳細

### フィルタリング
- 期間指定（開始日〜終了日）
- 取引種別（販売/買取）
- 担当スタッフ
- 顧客

### 集計機能
- 売上合計/買取合計
- 取引件数
- 平均単価
- 商品別ランキング

## 関連リンク
- [販売処理](/auth/(dashboard)/sale/)
- [買取処理](/auth/(dashboard)/purchase/)
- [在庫管理](/auth/(dashboard)/stock/)
- [売上分析](/auth/(dashboard)/sales-analytics/)
- [EC取引](/auth/(dashboard)/ec/transaction/)