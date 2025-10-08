# Inventory Count Feature

## 概要
棚卸機能。在庫の実地棚卸を効率的に実施し、システム在庫と実在庫の差異を検出・修正する。定期棚卸と循環棚卸の両方に対応。

## 主要機能

### 棚卸計画
- 棚卸スケジュール作成
- 対象範囲設定
- 担当者割当
- 進捗管理

### 棚卸実施
- バーコードスキャン
- 数量入力
- 棚番管理
- 一時保存

### 差異管理
- 差異自動検出
- 原因分析
- 承認フロー
- 在庫調整

### レポート
- 棚卸結果レポート
- 差異分析レポート
- 作業効率分析
- 監査証跡

## ディレクトリ構造

```
inventory-count/
├── components/              # UIコンポーネント
│   ├── edit/               # 編集関連
│   │   ├── ShelfButtons.tsx    # 棚操作ボタン
│   │   └── ShelfSelect.tsx     # 棚選択
│   └── ProgressCell.tsx    # 進捗表示
└── hook/                   # カスタムフック
    ├── useInventories.tsx  # 棚卸一覧
    └── useInventoryCount.ts # 棚卸処理

app/auth/(dashboard)/inventory-count/
├── components/
│   ├── modal/              # モーダル群
│   └── InventoryCountTable.tsx
└── edit/                   # 編集画面
    └── components/
```

## 主要コンポーネント

### 棚卸作成
#### CreateInventoryCountModal
- 新規棚卸作成
- 対象範囲設定
- スケジュール設定
- 担当者アサイン

### 棚卸実施
#### InventoryCount
- 商品スキャン
- 数量入力
- 棚番指定
- 進捗表示

#### SelectedProducts
- カウント済み商品一覧
- 数量修正
- 削除機能
- 一括操作

### 進捗管理
#### ProgressCell
- 進捗率表示
- 視覚的インジケーター
- リアルタイム更新
- 完了予測

### 差異確認
#### InventoryCountDetailModal
- 差異一覧表示
- 原因選択
- コメント入力
- 承認申請

## データモデル

### InventoryCount
```typescript
interface InventoryCountData {
  id: number;
  title: string;                    // 棚卸名
  status: InventoryStatus;          // ステータス
  store: {
    id: number;
    display_name: string;
  };
  genreIds: number[];               // 対象ジャンル
  categoryIds: number[];            // 対象カテゴリ
  progress: number;                 // 進捗率(%)
  difference: number;               // 差異金額
  inputCount: number;               // 入力済み件数
  targetCount: number;              // 対象件数
  discrepancy: number;              // 差異件数
  updatedAt: string;
}
```

### InventoryStatus
```typescript
enum InventoryStatus {
  PLANNING = 'PLANNING',            // 計画中
  IN_PROGRESS = 'IN_PROGRESS',      // 実施中
  PAUSED = 'PAUSED',               // 一時停止
  REVIEWING = 'REVIEWING',          // 確認中
  COMPLETED = 'COMPLETED',          // 完了
  CANCELLED = 'CANCELLED'           // 中止
}
```

### InventoryItem
```typescript
interface InventoryItem {
  id: number;
  inventory_id: number;
  product_id: number;
  system_quantity: number;          // システム在庫
  counted_quantity: number;         // 実地棚卸数
  difference: number;               // 差異
  shelf_id?: string;                // 棚番
  counted_by: number;               // カウント者
  counted_at: Date;                 // カウント日時
  adjustment_reason?: string;       // 調整理由
  approved_by?: number;             // 承認者
}
```

## 棚卸フロー

### 1. 計画作成
- 棚卸タイプ選択（全品/循環）
- 対象範囲設定
- スケジュール決定
- リソース割当

### 2. 準備作業
- 売場整理
- 在庫移動停止
- 棚札確認
- 機材準備

### 3. カウント作業
- 商品スキャン/手入力
- 数量確認
- 棚番記録
- 不明商品記録

### 4. 差異確認
- 自動差異計算
- 再カウント実施
- 原因調査
- 修正入力

### 5. 承認・反映
- 管理者確認
- 承認処理
- 在庫調整実行
- 完了処理

## 棚卸方式

### 全品棚卸
- 年1-2回実施
- 全商品対象
- 営業時間外実施
- 複数人体制

### 循環棚卸
- 日次/週次実施
- 部分的実施
- 営業中も可能
- 少人数対応

### スポット棚卸
- 不定期実施
- 特定商品のみ
- 問題発生時
- 即時対応

## 効率化機能

### バーコードスキャン
- 高速読取
- 連続スキャン
- エラー音通知
- オフライン対応

### 棚番管理
- 棚別集計
- 効率的ルート
- 作業割当
- 進捗可視化

### 差異分析
- パターン検出
- 頻出エラー特定
- 改善提案
- トレンド分析

## モバイル対応

### タブレット最適化
- タッチ操作
- 大きなボタン
- 見やすい表示
- 片手操作

### オフライン機能
- ローカル保存
- 自動同期
- 競合解決
- データ保護

## 権限管理

### 操作権限
- 棚卸作成: 管理者
- カウント実施: スタッフ以上
- 差異承認: 店長以上
- 在庫調整: 管理者

### データ参照
- 自店舗のみ
- 期間制限
- 金額マスク
- 監査ログ

## 分析・レポート

### 棚卸実績
- 精度分析
- 作業時間分析
- コスト計算
- 改善効果測定

### 差異分析
- 商品別差異
- 原因別集計
- 担当者別精度
- 経年変化

### 監査対応
- 作業証跡
- 承認履歴
- 調整根拠
- 外部監査対応

## エラー防止

### 入力チェック
- 異常値検出
- 前回比較
- 在庫上限チェック
- 確認ダイアログ

### 作業支援
- 商品画像表示
- 前回棚卸情報
- 類似商品警告
- ヘルプ機能

## パフォーマンス

### 大量データ対応
- ページング処理
- 遅延読込
- バックグラウンド処理
- プログレスバー

### 高速化
- インデックス最適化
- キャッシュ活用
- 非同期処理
- 部分更新

## 今後の拡張予定

1. **AI活用**
   - 画像認識カウント
   - 異常検知
   - 最適ルート提案
   - 作業時間予測

2. **RFID対応**
   - 一括読取
   - リアルタイム在庫
   - 自動棚卸
   - ロケーション管理

3. **高度な分析**
   - 機械学習による予測
   - ロス要因分析
   - 最適在庫提案
   - ROI分析

## 関連機能

- [在庫管理](/stock/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [レポート](/reports/CLAUDE.md)
- [監査ログ](/audit/CLAUDE.md)