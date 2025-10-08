# Original Pack Feature

## 概要
オリジナルパック作成機能。複数の商品を組み合わせて独自のパック商品を作成し、福袋やセット商品として販売する機能を提供する。

## 主要機能

### パック作成
- 封入商品選択
- 数量設定
- 価格設定
- パック情報登録

### 封入管理
- 固定封入設定
- ランダム封入設定
- 封入率管理
- 在庫割当

### パック開封
- 開封処理
- 封入商品確定
- 在庫移動
- 履歴記録

### 価格計算
- 原価自動計算
- 販売価格提案
- 利益率表示
- 割引設定

## ディレクトリ構造

```
original-pack/
├── create/                      # パック作成機能
│   ├── components/
│   │   ├── addProduct/         # 商品追加
│   │   │   ├── enclosedProduct/  # 封入商品管理
│   │   │   └── productResult/    # 商品結果表示
│   │   ├── confirm/            # 確認画面
│   │   └── list/              # 一覧表示
│   ├── context/               # 状態管理
│   └── hooks/                 # カスタムフック
└── page.tsx                   # メインページ
```

## 主要コンポーネント

### 商品選択
#### EnclosedSelectModal
- 封入商品検索
- カテゴリフィルタ
- 在庫確認
- 複数選択

#### EnclosedProductsTable
- 選択商品一覧
- 数量調整
- 小計表示
- 削除機能

### パック設定
#### OriginalPackCreateAddProductView
- パック基本情報入力
- 封入タイプ選択
- SKU生成
- バーコード発行

#### EnclosedDetailCard
- 封入詳細設定
- 確率設定（ランダム時）
- 在庫割当
- プレビュー

### 確認・作成
#### OriginalPackConfirmDetailCard
- 設定内容確認
- 原価・売価表示
- 利益計算
- 最終確認

#### useCreateOriginalPack
- パック作成処理
- 在庫引当
- SKU登録
- 完了通知

## データモデル

### OriginalPack
```typescript
interface OriginalPack {
  id: number;
  item_id: number;                 // 商品マスタID
  name: string;                    // パック名
  type: PackType;                  // パックタイプ
  status: PackStatus;              // ステータス
  total_quantity: number;          // 作成数量
  remaining_quantity: number;      // 残数量
  sell_price: number;              // 販売価格
  wholesale_price: number;         // 原価
  created_by: number;              // 作成者
  created_at: Date;
}
```

### PackType
```typescript
enum PackType {
  FIXED = 'FIXED',                 // 固定パック
  RANDOM = 'RANDOM',               // ランダムパック
  SEMI_RANDOM = 'SEMI_RANDOM'      // 準ランダム（一部固定）
}
```

### EnclosedProduct
```typescript
interface EnclosedProduct {
  id: number;
  pack_id: number;
  product_id: number;
  item_count: number;              // 封入数（固定時）
  probability?: number;            // 封入確率（ランダム時）
  is_guaranteed?: boolean;         // 確定封入フラグ
  min_count?: number;              // 最小封入数
  max_count?: number;              // 最大封入数
}
```

### PackOpenResult
```typescript
interface PackOpenResult {
  pack_id: number;
  opened_at: Date;
  opened_by: number;
  result_items: {
    product_id: number;
    quantity: number;
    serial_number?: string;
  }[];
}
```

## パック作成フロー

### 1. 企画
- ターゲット設定
- テーマ決定
- 価格帯設定
- 数量計画

### 2. 商品選択
- 封入商品選定
- 在庫確認
- 原価計算
- バランス調整

### 3. 設定
- 封入ルール設定
- 価格決定
- 数量決定
- 販売期間設定

### 4. 作成実行
- 在庫引当
- パック登録
- バーコード発行
- 商品化

### 5. 販売準備
- 陳列指示
- POP作成
- 告知準備
- 在庫配置

## 封入ルール

### 固定パック
- 全て同一内容
- 商品リスト公開可
- 価格透明性
- 在庫管理簡単

### ランダムパック
- 封入確率設定
- 最低保証設定可
- サプライズ要素
- 在庫調整機能

### 準ランダムパック
- 基本セット＋ランダム
- カテゴリ保証
- 価値保証
- バランス型

## 価格戦略

### 原価計算
```typescript
// 固定パック
原価 = Σ(商品原価 × 数量)

// ランダムパック
期待原価 = Σ(商品原価 × 数量 × 確率)
```

### 価格設定
- 原価積み上げ方式
- 市場価格参照
- 付加価値考慮
- 競合分析

### 利益管理
- 目標利益率設定
- 最低利益保証
- ロス考慮
- 価格弾力性

## 在庫管理

### 引当処理
- リアルタイム在庫確認
- 予約在庫作成
- 排他制御
- ロールバック対応

### 開封処理
- パック在庫減算
- 個別商品在庫加算
- 履歴記録
- シリアル管理

## コンプライアンス

### 景品表示法対応
- 正確な表示
- 優良誤認防止
- 有利誤認防止
- 記録保存

### 確率表示
- 封入率明示
- 最低保証明記
- 期待値表示
- 注意事項記載

## 分析機能

### 売上分析
- パック別売上
- 期間別推移
- 顧客層分析
- リピート率

### 在庫分析
- 回転率
- 滞留状況
- ロス率
- 最適数量

### 顧客満足度
- 開封結果追跡
- クレーム分析
- SNS反響
- 改善提案

## マーケティング連携

### プロモーション
- 限定パック企画
- 季節パック
- コラボパック
- 会員限定パック

### 告知方法
- SNS告知
- メール配信
- 店頭POP
- Web掲載

## 今後の拡張予定

1. **スマートパック**
   - AI封入最適化
   - 顧客別カスタマイズ
   - 需要予測連動
   - 動的価格設定

2. **デジタル連携**
   - NFT封入
   - デジタル特典
   - アプリ連動
   - 開封体験演出

3. **サブスクリプション**
   - 月額パック
   - 定期配送
   - 会員限定内容
   - 累積特典

## 関連機能

- [商品管理](/products/CLAUDE.md)
- [在庫管理](/stock/CLAUDE.md)
- [価格設定](/pricing/CLAUDE.md)
- [販売管理](/sale/CLAUDE.md)