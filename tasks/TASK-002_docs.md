# TASK-002: Backend CLAUDE.md作成タスク

## 📋 タスク基本情報

- **タスクID**: TASK-002
- **カテゴリ**: docs
- **担当エージェント**: Backend-Agent
- **状態**: pending
- **優先度**: high
- **複雑度**: high
- **作成日**: 2025-01-24
- **期限**: 2025-01-26
- **担当ファイル数**: 26個

## 🎯 タスク概要

Node.js バックエンド・API・データベース関連のCLAUDE.mdファイルを作成し、サーバーサイド アーキテクチャとAPI設計の完全な知識ベースを構築する。

## 📂 担当ファイルパス（競合防止）

### 🔒 **専属所有権ファイルパス**
```
packages/backend-core/
packages/web-app/src/app/api/
packages/api-generator/
packages/common/
```

## 📋 作成対象CLAUDE.mdファイル一覧

### 🔥 最優先配置 [3個]
- [ ] `packages/backend-core/` - Node.jsバックエンド
- [ ] `packages/backend-core/src/` - バックエンドソースコード
- [ ] `packages/backend-core/prisma/` - データベース設計

### ⭐ 高優先配置 [4個]
- [ ] `packages/common/` - 共通ライブラリ
- [ ] `packages/api-generator/` - API生成ツール
- [ ] `packages/web-app/src/app/api/` - 全APIエンドポイント統括
- [ ] `packages/web-app/src/app/api/store/` - 店舗API統括

### 📋 中優先配置 [19個]
#### Backend Core 構造
- [ ] `packages/backend-core/src/services/` - ビジネスロジック

#### 店舗API詳細（最重要エンドポイント）
- [ ] `packages/web-app/src/app/api/store/[store_id]/` - 店舗APIルート
- [ ] `packages/web-app/src/app/api/store/[store_id]/item/` - 商品管理API (26KB, 840行)
- [ ] `packages/web-app/src/app/api/store/[store_id]/product/` - 製品管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/transaction/` - 取引API
- [ ] `packages/web-app/src/app/api/store/[store_id]/customer/` - 顧客管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/inventory/` - 在庫管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/register/` - レジスター管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/sale/` - 売上管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/purchase-table/` - 買取テーブルAPI
- [ ] `packages/web-app/src/app/api/store/[store_id]/stats/` - 統計API
- [ ] `packages/web-app/src/app/api/store/[store_id]/reservation/` - 予約管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/functions/` - 機能API
- [ ] `packages/web-app/src/app/api/store/[store_id]/ec/` - EC連携API
- [ ] `packages/web-app/src/app/api/store/[store_id]/appraisal/` - 査定API
- [ ] `packages/web-app/src/app/api/store/[store_id]/loss/` - ロス管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/template/` - テンプレート管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/status/` - ステータス管理API
- [ ] `packages/web-app/src/app/api/store/[store_id]/stocking/` - 入荷管理API

## 📄 CLAUDE.mdテンプレート構造

各CLAUDE.mdファイルには以下の構造を含める：

```markdown
# [ディレクトリ名]/CLAUDE.md

## 🎯 目的・役割

## 🏗️ 技術構成
- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma 6.6.0
- **データベース**: MySQL + Redis
- **主要技術**: 
- **依存関係**: 

## 📁 ディレクトリ構造
```
[ツリー構造]
```

## 📡 API仕様
- **エンドポイント**: 
- **メソッド**: 
- **リクエスト形式**: 
- **レスポンス形式**: 

## 🔧 主要機能
- 機能1の説明
- 機能2の説明

## 💡 使用パターン
- 典型的な使用方法
- コード例

## 🗄️ データベース設計
- **テーブル関連**: 
- **主要フィールド**: 
- **インデックス**: 

## 🔗 関連ディレクトリ
- [関連ディレクトリ1](../path/)
- [関連ディレクトリ2](../path/)

## 📝 開発メモ
- パフォーマンス考慮事項
- セキュリティ注意点
- ベストプラクティス

---
*Backend-Agent作成: 2025-01-24*
```

## ✅ 受け入れ基準

- [ ] **完全性**: 26個すべてのCLAUDE.mdファイルが作成済み
- [ ] **品質**: 各ファイルにテンプレート構造の全セクションが含まれる
- [ ] **API仕様**: OpenAPI形式に準拠したエンドポイント仕様記載
- [ ] **データベース**: Prismaスキーマとの整合性確保
- [ ] **相互参照**: 関連API・テーブル間のリンクが正しく設定
- [ ] **技術精度**: Node.js、Prisma、MySQL、Redisの技術情報が正確
- [ ] **セキュリティ**: 認証・認可・バリデーションの考慮事項記載

## 🔄 依存関係

- **requires**: project_analysis_report.md（完了済み）
- **blocks**: なし
- **relates**: TASK-001, TASK-003, TASK-004
- **coordination**: Frontend-Agent（API統合ポイント）

## 🚀 実装手順

1. **Phase 1**: 最優先配置（3個）- バックエンド基盤
2. **Phase 2**: 高優先配置（4個）- API統括・共通機能
3. **Phase 3**: 中優先配置（19個）- 店舗API詳細
4. **Phase 4**: API仕様とデータベースの整合性チェック
5. **Phase 5**: 相互参照リンクの検証・更新

## 📊 進捗追跡

- **開始日時**: 未開始
- **Phase 1 完了**: 未完了
- **Phase 2 完了**: 未完了
- **Phase 3 完了**: 未完了
- **Phase 4 完了**: 未完了
- **Phase 5 完了**: 未完了
- **最終完了**: 未完了

## 💬 コミュニケーション

**Status** 2025-01-24 17:30 Backend-Agent: タスク作成完了、実装待機中

## 🔍 品質チェックリスト

- [ ] Node.js + TypeScript アーキテクチャ説明が正確
- [ ] Prisma 6.6.0 ORM の使用パターン記載
- [ ] MySQL + Redis 構成の説明
- [ ] RESTful API 設計原則の適用
- [ ] マルチテナント（店舗別）アーキテクチャの解説
- [ ] AWS SDK サービス統合の説明
- [ ] Zod バリデーション スキーマへの参照
- [ ] エラーハンドリング パターンの記載
- [ ] パフォーマンス最適化の考慮事項
- [ ] セキュリティベストプラクティスの記載

## 🎯 特別重点項目

### 🏆 最重要API
- **item API** (26KB, 840行): 最も複雑で重要なエンドポイント
  - 商品管理の核となる機能
  - 詳細なAPI仕様書作成必須
  - パフォーマンス考慮事項の詳記

### 🔄 マルチテナント設計
- 店舗ID による分離機構
- データ分離とセキュリティ
- スケーラビリティ考慮事項

### 🗄️ Prismaスキーマ統合
- 9つのスキーマファイルの役割分担
- マイグレーション戦略
- トリガー・ストアドプロシージャ連携 