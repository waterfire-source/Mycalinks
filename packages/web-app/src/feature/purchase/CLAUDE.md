# Purchase Feature

## 概要
買取取引処理機能。顧客からの商品買取、査定、在庫登録、支払い処理まで一連の買取フローを管理する。

## 主要機能

### 買取カート管理
- 商品スキャン・手動追加
- 買取価格設定
- コンディション評価
- 査定メモ追加

### 査定機能
- 商品状態評価
- 市場価格参照
- 買取価格自動提案
- 価格交渉履歴

### 支払い処理
- 現金支払い
- 銀行振込
- 即時買取・後日精算
- 支払い証明書発行

### 在庫登録
- 買取商品の在庫化
- SKU自動採番
- 商品写真登録
- 在庫ロケーション設定

## ディレクトリ構造

```
purchase/
├── components/          # UIコンポーネント
│   ├── buttons/        # アクションボタン
│   ├── cards/          # カード型UI
│   ├── modals/         # モーダルダイアログ
│   └── searchModal/    # 商品検索モーダル
└── hooks/              # カスタムフック
    └── usePurchaseCart.ts  # 買取カート管理
```

## 主要コンポーネント

### usePurchaseCart Hook
買取カートの状態管理とビジネスロジック：
- カート商品の追加・削除・更新
- 買取価格計算
- 査定情報管理
- 支払い金額計算

### PurchaseDetailsCard
買取商品詳細表示：
- 商品情報
- コンディション選択
- 買取価格入力
- 査定メモ

### PurchasePaymentSummaryModal
支払い確認モーダル：
- 買取金額合計
- 支払い方法選択
- 本人確認
- 支払い実行

### PriceEditConfirmationModal
価格編集確認：
- 提案価格との差異表示
- 編集理由入力
- 承認フロー

## データモデル

### PurchaseCartItem
```typescript
interface PurchaseCartItem {
  productId: number;
  displayName: string;
  conditionName: string;
  isBuyOnly?: boolean | null;
  stockNumber: number;
  originalPurchasePrice: number | null;
  variants: Array<{
    variantId: string;
    itemCount: number;
    unitPrice: number;
  }>;
}
```

### Transaction (買取)
- `TransactionKind.purchase`: 買取取引
- 買取特有フィールド：
  - 査定情報
  - 本人確認情報
  - 支払い方法

## API連携

### 買取API
- `POST /api/store/{store_id}/purchase/transaction`: 買取取引作成
- `POST /api/store/{store_id}/purchase/appraisal`: 査定依頼
- `GET /api/store/{store_id}/purchase/price-suggestion`: 価格提案取得
- `POST /api/store/{store_id}/purchase/payment`: 支払い処理

### 商品マスタAPI
- 買取可能商品検索
- 参考価格取得
- 商品状態定義

## 買取フロー

### 1. 商品特定
- バーコードスキャン
- 商品名検索
- カテゴリ検索
- 新規商品登録

### 2. 査定
- コンディション評価
- 付属品確認
- 動作確認
- 価格決定

### 3. 顧客情報
- 本人確認書類
- 連絡先登録
- 買取履歴確認
- 不正チェック

### 4. 支払い
- 支払い方法選択
- 金額確認
- 支払い実行
- 証明書発行

## 状態管理

### カート状態
- セッション管理
- 一時保存機能
- エラー復旧

### 査定状態
- 査定進捗管理
- 価格履歴
- 承認状態

## コンプライアンス

### 古物営業法対応
- 本人確認必須
- 取引記録保存
- 盗品チェック
- 報告書生成

### 個人情報保護
- 顧客情報暗号化
- アクセス制限
- 監査ログ

## 価格設定

### 自動価格提案
- 市場価格連動
- コンディション別価格
- 在庫状況反映
- 競合価格参照

### 価格調整権限
- 店長承認
- 割引上限設定
- 理由記録必須

## 在庫連携

### 在庫登録
- 自動SKU採番
- 初期在庫ステータス
- ロケーション割当
- 商品写真アップロード

### 在庫追跡
- 買取元情報保持
- トレーサビリティ
- 品質保証期間管理

## レポート機能

### 買取実績
- 日次・月次集計
- カテゴリ別分析
- 顧客別統計
- 利益率分析

### コンプライアンスレポート
- 本人確認実施率
- 高額買取一覧
- 要注意顧客リスト

## エラーハンドリング

### 価格エラー
- 異常価格検知
- 承認フロー
- エスカレーション

### システムエラー
- トランザクション保護
- ロールバック
- 復旧手順

## テスト

### ユニットテスト
- 価格計算ロジック
- 在庫登録処理
- 支払い計算

### 統合テスト
- 買取フロー全体
- 外部API連携
- エラーケース

## 今後の拡張予定

1. **AI査定支援**
   - 画像認識による状態評価
   - 価格予測精度向上
   - 不正検知強化

2. **オンライン査定**
   - リモート査定対応
   - 事前見積もり
   - 宅配買取連携

3. **買取キャンペーン**
   - 期間限定価格UP
   - カテゴリ別施策
   - 顧客セグメント別対応

## 関連機能

- [在庫管理](/stock/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [顧客管理](/customers/CLAUDE.md)
- [査定履歴](/appraisal/CLAUDE.md)