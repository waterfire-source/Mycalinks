# TASK-3104: 在庫詳細絞り込み機能リファクタリング

## 📋 基本情報

- **タスクID**: TASK-3104
- **カテゴリ**: refactor
- **複雑度**: simple
- **工数**: 0.5人日
- **担当エージェント**: Agent-Frontend-01
- **状態**: pending
- **作成日**: 2025-01-24
- **対象Issue**: #3104

## 🎯 概要

在庫変動履歴画面において日付による絞り込み機能、表示中の販売・買取金額の表示、在庫数の増減表示を実装する。既存の在庫詳細モーダル機能のUIリファクタリングが主体。

## 🎨 デザイン参照

- **Figmaリンク**: https://www.figma.com/design/rkxe3xQ5YcDRKLacYUTB0M/myca?node-id=16077-480&t=GTZa0Qfnu4KihAbX-1
- **対象画面**: 在庫一覧 → 在庫詳細 → 在庫変動モーダル
- **画面URL**: https://staging.pos.mycalinks.io/auth/stock

## ✅ 受け入れ条件

### フロントエンド実装

#### 日付絞り込み機能
- [ ] 日付範囲選択UI（開始日・終了日）の実装
- [ ] 日付絞り込みロジックの実装（APIコール含む）
- [ ] 絞り込み状態の表示とクリア機能

#### 販売・買取金額表示
- [ ] 表示中データの販売金額合計計算（フロントエンド計算）
- [ ] 表示中データの買取金額合計計算（フロントエンド計算）
- [ ] 金額表示UIコンポーネントの配置

#### 在庫増減表示
- [ ] 在庫増減数の計算ロジック（フロントエンド計算）
- [ ] 増減表示UIの実装（増加・減少の視覚的区別）
- [ ] 期間内の在庫変動サマリー表示

### バックエンド対応

#### API拡張
- [ ] `/store/{store_id}/product/{product_id}/transfer-history` APIに日付絞り込みパラメータ追加
- [ ] `start_date` および `end_date` クエリパラメータ対応
- [ ] APIドキュメント更新

## 🔧 技術仕様

### 使用API
- **エンドポイント**: `/store/{store_id}/product/{product_id}/transfer-history`
- **ドキュメント**: https://staging.pos.mycalinks.io/docs/api#:~:text=%E5%9C%A8%E5%BA%AB%E5%A4%89%E6%8F%9B%E3%81%AE%E5%B1%A5%E6%AD%B4

### 関連ファイル

#### 修正対象ファイル
```
packages/web-app/src/app/auth/(dashboard)/stock/components/detailModal/
├── StockDetailModal.tsx              # メインモーダル
├── StockChangeLogModal.tsx           # 在庫変動ログモーダル
└── contents/History.tsx              # 履歴表示コンポーネント
```

#### API関連ファイル
```
packages/web-app/src/app/api/store/[store_id]/product/[product_id]/transfer-history/
└── route.ts                          # APIルート (日付絞り込み追加)

packages/api-generator/src/defs/product/
└── def.ts                            # API定義 (パラメータ追加)
```

### 技術スタック
- **フロントエンド**: React, TypeScript, Material-UI
- **状態管理**: React hooks (useState, useEffect)
- **日付操作**: dayjs (プロジェクト標準)
- **APIクライアント**: 既存のproduct API実装を拡張

## 🧩 コンテキスト情報（CLAUDE.mdより）

### packages/web-app/src/app/api/store/[store_id]/product/CLAUDE.md
- **目的**: 店舗別製品管理API - 在庫商品の管理、入荷・出荷処理、ロット管理
- **技術構成**: Next.js 14 API Routes + Prisma ORM + MySQL + Redis
- **既存パターン**: 在庫履歴APIは `/[product_id]/history/route.ts` で実装済み
- **開発ルール**: 在庫状況のリアルタイム更新、履歴データの効率的な取得

### 既存コンポーネント活用
- **CustomModalWithIcon**: モーダル標準コンポーネント
- **CustomTabTable**: タブ付きテーブル表示
- **NoSpinTextField**: 数値入力フィールド
- **DatePicker**: MUI日付選択コンポーネント

## 📊 実装アプローチ

### Phase 1: API拡張 (バックエンド)
1. `transfer-history` APIに日付パラメータ追加
2. クエリ条件の拡張とバリデーション
3. レスポンス仕様の確認

### Phase 2: UI実装 (フロントエンド)
1. 日付絞り込みUI実装
2. 金額計算ロジック実装
3. 在庫増減表示実装
4. 既存の `StockChangeLogModal` との統合

### Phase 3: テスト・統合
1. 絞り込み機能のテスト
2. 計算ロジックの検証
3. UIインタラクションの確認

## 🚨 注意事項

### 既存機能への影響
- **StockDetailModal**: 既存の在庫詳細表示機能との共存
- **History コンポーネント**: 現在の履歴表示ロジックとの整合性確保
- **API下位互換性**: 既存のAPIコール仕様を破壊しない

### パフォーマンス考慮
- 大量履歴データの効率的な絞り込み
- フロントエンド計算の最適化
- APIレスポンス時間の監視

### UX考慮事項
- 日付選択の直感的な操作性
- 絞り込み結果の明確な表示
- エラー状態のハンドリング

## 📋 検証項目

### 機能テスト
- [ ] 日付絞り込みが正常に動作する
- [ ] 販売・買取金額が正確に計算される
- [ ] 在庫増減が正しく表示される
- [ ] APIレスポンスが期待通りである

### UI/UXテスト  
- [ ] 日付選択UIが使いやすい
- [ ] 絞り込み状態が分かりやすい
- [ ] 金額表示が読みやすい
- [ ] モバイル対応が適切である

### 統合テスト
- [ ] 既存の在庫詳細機能に影響がない
- [ ] 他の画面からの遷移が正常
- [ ] エラーハンドリングが適切

## 🎯 完了定義

1. 日付絞り込み機能が Figma 仕様通りに実装されている
2. 販売・買取金額の表示が正確に動作している  
3. 在庫増減の表示が視覚的に分かりやすい
4. API の日付絞り込みパラメータが実装されている
5. 既存機能にデグレーションが発生していない
6. コードレビューが完了し、品質基準を満たしている

## 🔄 進捗状況

**現在状態**: pending

### 実装ログ
- [ ] **API拡張**: バックエンドの日付絞り込み対応
- [ ] **UI実装**: フロントエンドのコンポーネント更新
- [ ] **統合テスト**: 機能確認とデグレーションチェック
- [ ] **レビュー**: コード品質とUX確認

---

**Agent-Frontend-01**: @Agent-Frontend-01 このタスクを担当します。在庫詳細絞り込み機能のリファクタリングを進めてください。

**Status** 2025-01-24 10:00 Agent-Frontend-01: タスク作成完了、実装開始準備 