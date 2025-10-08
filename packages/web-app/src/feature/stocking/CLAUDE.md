# Stocking Feature

## 概要
仕入れ管理機能。商品の発注、入荷予定管理、仕入先管理、入荷処理、在庫への反映など、仕入れプロセス全体を管理する。

## 主要機能

### 仕入先管理
- 仕入先マスタ登録
- 取引条件設定
- 連絡先管理
- 取引履歴追跡

### 発注管理
- 発注書作成
- 自動発注提案
- 承認フロー
- 発注履歴管理

### 入荷管理
- 入荷予定登録
- 入荷実績記録
- 検品処理
- 在庫反映

### CSV一括処理
- CSV仕入れデータ取込
- バリデーション
- エラー処理
- 処理結果出力

## ディレクトリ構造

```
stocking/
└── hooks/
    └── useAddressSearch.tsx  # 住所検索フック

api/store/[store_id]/stocking/
├── csv/                     # CSV処理
├── supplier/                # 仕入先管理
├── [stocking_id]/
│   ├── apply/              # 入荷実行
│   └── cancel/             # 入荷キャンセル
└── route.ts                # メインAPI
```

## 主要API

### 仕入先管理
#### 仕入先登録・更新
```typescript
POST /api/store/{store_id}/stocking/supplier/
```
- 新規登録（ID未指定）
- 更新（ID指定）
- 基本情報・取引条件設定

#### 仕入先取得
```typescript
GET /api/store/{store_id}/stocking/supplier/
```
- ID/表示名検索
- 有効/無効フィルタ
- ページネーション対応

### 入荷管理
#### 入荷登録
```typescript
POST /api/store/{store_id}/stocking/
```
- 入荷予定作成
- 商品・数量指定
- 納期設定

#### 入荷実行
```typescript
POST /api/store/{store_id}/stocking/{stocking_id}/apply/
```
- 実入荷処理
- 検品結果記録
- 在庫自動更新

### CSV処理
#### CSV仕入れ
```typescript
POST /api/store/{store_id}/stocking/csv/
```
- ファイルアップロード
- 一括データ処理
- 在庫即時反映
- エラーレポート

## データモデル

### Stocking（仕入れ）
```typescript
interface Stocking {
  id: number;
  store_id: number;
  supplier_id: number;              // 仕入先ID
  status: StockingStatus;           // ステータス
  order_date: Date;                 // 発注日
  expected_date: Date;              // 入荷予定日
  actual_date?: Date;               // 実入荷日
  total_amount: number;             // 合計金額
  items: StockingItem[];            // 仕入れ明細
  created_by: number;               // 作成者
  applied_by?: number;              // 入荷処理者
}
```

### StockingItem（仕入れ明細）
```typescript
interface StockingItem {
  id: number;
  stocking_id: number;
  product_id: number;
  expected_quantity: number;        // 予定数量
  actual_quantity?: number;         // 実数量
  unit_price: number;               // 単価
  total_price: number;              // 小計
  notes?: string;                   // 備考
}
```

### Supplier（仕入先）
```typescript
interface Supplier {
  id: number;
  corporation_id: number;
  name: string;                     // 仕入先名
  code: string;                     // 仕入先コード
  contact_info: {
    address: string;
    phone: string;
    email: string;
    person_in_charge?: string;
  };
  payment_terms: {
    method: PaymentMethod;          // 支払方法
    due_days: number;               // 支払期日
    discount_rate?: number;         // 基本割引率
  };
  active: boolean;                  // 有効フラグ
}
```

### StockingStatus
```typescript
enum StockingStatus {
  DRAFT = 'DRAFT',                  // 下書き
  ORDERED = 'ORDERED',              // 発注済
  PARTIAL = 'PARTIAL',              // 一部入荷
  COMPLETED = 'COMPLETED',          // 入荷完了
  CANCELLED = 'CANCELLED'           // キャンセル
}
```

## 仕入れフロー

### 1. 発注準備
- 在庫確認
- 需要予測
- 発注数量決定
- 仕入先選定

### 2. 発注処理
- 発注書作成
- 承認取得
- 発注送信
- ステータス更新

### 3. 入荷待ち
- 進捗確認
- 納期管理
- 遅延アラート
- 仕入先連絡

### 4. 入荷処理
- 商品受領
- 検品作業
- 数量確認
- 品質チェック

### 5. 在庫反映
- システム登録
- 在庫数更新
- ロケーション設定
- 完了処理

## CSV仕入れ機能

### CSVフォーマット
```csv
商品コード,商品名,数量,単価,仕入先コード,備考
JAN123456,サンプル商品A,10,1000,SUP001,初回入荷
JAN789012,サンプル商品B,5,2000,SUP001,追加発注
```

### 処理仕様
- UTF-8エンコーディング必須
- ヘッダー行必須
- 最大10,000行
- トランザクション処理

### エラーハンドリング
- 形式エラー検出
- 商品マスタ照合
- 仕入先存在確認
- エラー行スキップ/中断選択

## 自動発注機能

### 発注提案ロジック
- 安全在庫を下回った商品
- リードタイム考慮
- 需要予測基づく
- 最小発注単位考慮

### 発注点計算
```typescript
発注点 = (平均日販 × リードタイム) + 安全在庫
発注数量 = 最大在庫 - 現在庫 - 発注残
```

### スケジュール設定
- 日次/週次/月次
- 曜日・時間指定
- 祝日考慮
- 手動実行

## 仕入先評価

### 評価指標
- 納期遵守率
- 品質スコア
- 価格競争力
- 対応スピード

### レポート機能
- 仕入先別実績
- 商品別仕入状況
- コスト分析
- トレンド分析

## 権限管理

### 操作権限
- 仕入先登録: 管理者
- 発注作成: 発注担当者
- 発注承認: 上長
- 入荷処理: 在庫担当者

### データ参照権限
- 仕入価格: 権限による
- 仕入先情報: 店舗限定
- 取引履歴: 期間制限

## 連携機能

### 在庫管理連携
- リアルタイム在庫更新
- 在庫移動履歴
- 棚卸との整合性

### 会計連携
- 仕入計上
- 買掛金管理
- 支払予定管理

## パフォーマンス最適化

### 大量データ処理
- バッチ処理
- 非同期実行
- 進捗表示
- 部分コミット

### 検索最適化
- インデックス設計
- キャッシュ活用
- 遅延ローディング

## 今後の拡張予定

1. **AI発注最適化**
   - 需要予測精度向上
   - 最適発注量算出
   - 季節変動対応
   - 特売対応

2. **EDI連携**
   - 電子発注対応
   - 自動入荷確認
   - 請求書電子化
   - ペーパーレス化

3. **モバイル対応**
   - 入荷検品アプリ
   - 発注承認アプリ
   - プッシュ通知
   - オフライン対応

## 関連機能

- [在庫管理](/stock/CLAUDE.md)
- [商品マスタ](/products/CLAUDE.md)
- [仕入先管理](/supplier/CLAUDE.md)
- [発注管理](/ordering/CLAUDE.md)