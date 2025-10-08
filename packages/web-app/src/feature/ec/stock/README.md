# EC在庫管理 - 価格統一機能

## 概要

EC出品時に同じカードの他の商品の価格も統一する機能の実装計画

## 機能要件

### 対象商品の条件

- **myca_item_id**: 同じ
- **rarity**: 同じ  
- **specialty_id**: 同じ（nullの場合は同じくnull）
- **メモ・画像**: 両方が設定されていない商品のみ
  - description が null または ""
  - images が [] または null
- **店舗スコープ**: 同一店舗内のみ

### 価格統一の仕様

- **価格基準**: ユーザーが統一価格を入力
- **実行タイミング**: 新規出品時
- **エラーハンドリング**: 商品更新失敗時は出品処理も中断

## 使用箇所

### 1. DetailEcProductModal（個別出品）

- **パス**: `/app/auth/(dashboard)/ec/stock/components/DetailEcProductModal/`
- **モード**: single（1つの商品が基準）
- **UI配置**: プラットフォーム選択画面内

### 2. EcListingModal（一括出品）

- **パス**: `/app/auth/(dashboard)/ec/stock/components/EcListingModal/`
- **モード**: batch（複数商品が基準）
- **UI配置**: 出品モーダル内

## 実装設計

### ディレクトリ構造

```
feature/ec/stock/
├── hooks/
│   └── useUnifyPricing.ts        # 価格統一メインフック
├── components/
│   └── UnifyPricingSection.tsx   # 価格統一UI
└── utils/
    └── unifyPricingUtils.ts      # 統一対象商品のフィルタリング
```

### useUnifyPricing Hook

```typescript
export interface UnifyPricingOptions {
  baseProducts: Product[];   // 基準商品配列
  storeId: number;
  mode: 'single' | 'batch';  // 個別/一括出品
  enabled?: boolean;         // 有効/無効制御
}

export const useUnifyPricing = ({
  baseProducts, 
  storeId, 
  mode, 
  enabled = true 
}: UnifyPricingOptions) => {
  // 既存のuseStockSearchを活用
  // EC在庫管理専用オプション:
  // - ecAvailable: true
  // - isMycalinksItem: true  
  // - mycalinksEcEnabled: true
  
  return {
    enableUnifyPricing,        // チェックボックス状態
    setEnableUnifyPricing,
    unifyPrice,               // 統一価格
    setUnifyPrice,
    unifyTargetProducts,      // 統一対象商品リスト
    unifyTargetCount,         // 統一対象商品数
    loading,                  // 検索中フラグ
    executeUnifyPricing,      // 価格統一実行関数
    refreshUnifyTargets,      // 再検索関数
  };
};
```

### 統一対象商品フィルタリング

```typescript
export const filterUnifyTargetProducts = (
  allProducts: any[],
  baseProducts: any[],
  mode: 'single' | 'batch'
): any[] => {
  // 条件:
  // 1. baseProductsのいずれかと一致（myca_item_id + rarity + specialty_id）
  // 2. 既に出品中（mycalinks_ec_enabled = true）
  // 3. メモなし（description が空）
  // 4. 画像なし（images が空）
  // 5. 自分自身を除外
};
```

### UnifyPricingSection Component

```typescript
interface Props {
  enableUnifyPricing: boolean;
  setEnableUnifyPricing: (enabled: boolean) => void;
  unifyPrice: number | undefined;
  setUnifyPrice: (price: number | undefined) => void;
  unifyTargetCount: number;
  loading: boolean;
  baseProducts: any[];
  mode: 'single' | 'batch';
}

// UI要素:
// - チェックボックス「同じカードの他の商品の価格も統一する」
// - 統一価格入力フィールド
// - 対象商品数表示「対象商品: X個」
// - 警告メッセージ（対象商品情報、対象なしの場合）
```

## 処理フロー

### 個別出品（DetailEcProductModal）

1. プラットフォーム選択画面で価格統一オプション表示
2. チェックボックスON → 統一対象商品を検索
3. 統一価格入力 → 対象商品数をリアルタイム表示
4. 「新規出品」ボタン押下
5. 価格統一処理実行（有効な場合）
6. 通常の出品処理実行
7. 完了通知

### 一括出品（EcListingModal）

1. 選択商品を基準に統一対象商品を検索
2. 統一価格設定
3. 「出品する」ボタン押下
4. 選択商品の出品処理
5. 価格統一処理実行（有効な場合）
6. 完了通知

## 既存コードとの連携

### useStockSearch活用

- `feature/products/hooks/useNewProductSearch.ts`の`useStockSearch`を使用
- 既存のAPIエンドポイント`/api/store/{store_id}/product`を活用
- EC在庫管理専用の検索オプションを指定

### useUpdateProduct活用

- `feature/products/hooks/useUpdateProduct.ts`を使用
- `specificEcSellPrice`パラメータで価格更新

## 懸念点・リスク

### 1. APIコール数

- 複数の異なるmyca_item_idがある場合、複数回APIコールが発生
- **対策**: 初期実装では受け入れ、後にバックエンドAPI拡張を検討

### 2. パフォーマンス

- 大量商品のフィルタリング処理
- **対策**: useMemoによる最適化、検索結果件数制限

### 3. データ整合性

- 価格統一中の他ユーザーによる編集競合
- **対策**: Promise.allSettledによる部分失敗対応

### 4. UX

- 意図しない大量商品の価格変更リスク
- **対策**: 明確な警告表示、統一対象商品数の上限設定

### 5. 型安全性

- useStockSearch結果とbaseProductsの型差異
- **対策**: 適切な型定義の整備

## 実装フェーズ

### Phase 1: 基本実装

- [ ] hooks/useUnifyPricing.ts
- [ ] components/UnifyPricingSection.tsx  
- [ ] utils/unifyPricingUtils.ts
- [ ] DetailEcProductModalへの統合

### Phase 2: 一括処理対応

- [ ] EcListingModalへの統合
- [ ] バッチ処理モードの最適化

### Phase 3: 改善・最適化

- [ ] エラーハンドリング強化
- [ ] パフォーマンス改善
- [ ] バックエンドAPI拡張検討

## 注意事項

- 既存のEC在庫管理フローに影響を与えない設計
- 価格統一はオプション機能（デフォルトOFF）
- 統一対象が0件の場合も正常に動作
- エラー時は明確なメッセージ表示

---
*作成日: 2025-01-24*
*更新日: 2025-01-24*
