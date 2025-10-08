# inventory-count/CLAUDE.md

## 🎯 目的・役割

店舗の定期棚卸し機能。実在庫と帳簿在庫の差異を確認し、在庫データの正確性を保つ。棚卸し作業の効率化とミス防止、在庫差異の原因分析をサポートする重要な在庫管理機能。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 App Router
- **状態管理**: React hooks、ローカルストレージ
- **バーコードスキャン**: カメラAPI、外部バーコードリーダー対応
- **データ同期**: リアルタイム在庫更新、オフライン対応
- **印刷機能**: 棚卸しリスト、差異レポート印刷
- **依存関係**: `/api/store/[store_id]/inventory/`, バーコードスキャナライブラリ

## 📁 ディレクトリ構造

```
inventory-count/
├── page.tsx                        # 棚卸し一覧・管理画面
├── edit/
│   ├── page.tsx                     # 棚卸し実行画面
│   └── components/
│       ├── InventoryCount.tsx       # 棚卸し作業コンポーネント
│       ├── InventoryCountInfo.tsx   # 棚卸し情報表示
│       └── SelectedProducts.tsx     # 選択商品一覧
└── components/
    ├── InventoryCountTable.tsx      # 棚卸し履歴テーブル
    └── modal/
        ├── CreateInventoryCountModal.tsx     # 新規棚卸し作成
        ├── InventoryCountDetailModal.tsx     # 棚卸し詳細表示
        ├── ConfirmCompletionModal.tsx        # 完了確認モーダル
        ├── PauseConfirmationModal.tsx        # 一時停止確認
        └── ShelfNameChangeModal.tsx          # 棚名変更モーダル
```

## 🔧 主要機能

### 棚卸し管理
- **棚卸し計画**: 全店舗・部分棚卸し設定、スケジュール管理
- **棚卸し実行**: バーコードスキャン、手動入力による実在庫カウント
- **進捗管理**: 作業進捗表示、担当者別作業状況
- **一時保存**: 作業中断・再開機能

### バーコードスキャン
- **商品識別**: バーコード・QRコードスキャンによる自動商品識別
- **数量入力**: スキャン後の数量入力、複数商品一括スキャン
- **エラー処理**: 未登録商品、重複スキャンの検出・処理
- **音声ガイド**: スキャン成功・エラー時の音声フィードバック

### 差異分析
- **差異計算**: 帳簿在庫 vs 実在庫の自動差異計算
- **差異レポート**: ジャンル別・商品別差異分析
- **原因分析**: 差異原因のカテゴリ分類（紛失、破損、計上ミス等）
- **承認フロー**: 差異承認・在庫調整の承認ワークフロー

### レポート・エクスポート
- **棚卸しリスト**: 作業用棚卸しリスト印刷
- **差異レポート**: 差異詳細レポート生成
- **CSV出力**: 棚卸し結果のデータエクスポート

## 💡 使用パターン

### 棚卸し作成
```typescript
// 新規棚卸し作成
<CreateInventoryCountModal
  open={createModalOpen}
  onClose={() => setCreateModalOpen(false)}
  onInventoryCountCreated={handleInventoryCountCreated}
  storeId={storeId}
/>
```

### 棚卸し実行
```typescript
// バーコードスキャンと数量入力
<InventoryCount
  inventoryCountId={inventoryCountId}
  onProductScanned={handleProductScanned}
  onQuantityUpdate={handleQuantityUpdate}
  products={selectedProducts}
/>
```

### 差異確認
```typescript
// 差異詳細表示
<InventoryCountDetailModal
  inventoryCount={inventoryCountData}
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  onApproveDiscrepancy={handleApproveDiscrepancy}
/>
```

## 🔗 関連ディレクトリ

- [../stock/](../stock/) - 在庫管理（通常在庫操作）
- [../item/](../item/) - 商品マスタ（商品情報参照）
- [../../../../components/barcode/](../../../../components/barcode/) - バーコード表示・生成
- [../../../../feature/stock/](../../../../feature/stock/) - 在庫関連コンポーネント
- [../../../../api/backendApi/services/](../../../../api/backendApi/services/) - 在庫管理API
- [../../../../components/tables/](../../../../components/tables/) - テーブルコンポーネント

## 📝 開発メモ

### 棚卸しワークフロー
1. **計画**: 棚卸し対象・範囲設定
2. **開始**: 棚卸し開始、帳簿在庫のスナップショット作成
3. **実行**: バーコードスキャン・手動カウント
4. **確認**: 差異確認・原因分析
5. **承認**: 差異承認・在庫調整実行
6. **完了**: 棚卸し完了、レポート生成

### データ整合性
- **スナップショット**: 棚卸し開始時点の在庫データ固定
- **ロック機能**: 棚卸し中の在庫変更制限
- **同期処理**: 複数端末での同時作業制御
- **バックアップ**: 作業データの自動バックアップ

### モバイル対応
- **タッチ操作**: タブレット・スマートフォン最適化UI
- **カメラ連携**: デバイスカメラでのバーコードスキャン
- **オフライン対応**: ネットワーク断時の作業継続
- **データ同期**: オンライン復帰時の自動同期

### パフォーマンス
- **大量データ処理**: 数万商品の棚卸し対応
- **リアルタイム更新**: 進捗状況のリアルタイム反映
- **メモリ管理**: 長時間作業でのメモリリーク防止
- **バッチ処理**: 大量データの効率的処理

---
*Frontend-Agent作成: 2025-01-13*