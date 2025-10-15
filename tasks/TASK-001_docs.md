# TASK-001: Frontend CLAUDE.md作成タスク

## 📋 タスク基本情報

- **タスクID**: TASK-001
- **カテゴリ**: docs
- **担当エージェント**: Frontend-Agent
- **状態**: pending
- **優先度**: high
- **複雑度**: medium
- **作成日**: 2025-01-24
- **期限**: 2025-01-26
- **担当ファイル数**: 24個

## 🎯 タスク概要

Next.js フロントエンド関連のCLAUDE.mdファイルを作成し、UI構造・Feature ドメイン・認証後ページの完全な知識ベースを構築する。

## 📂 担当ファイルパス（競合防止）

### 🔒 **専属所有権ファイルパス**
```
packages/web-app/src/app/auth/
packages/web-app/src/feature/
packages/web-app/src/components/
packages/web-app/src/hooks/
packages/web-app/src/contexts/
packages/web-app/src/providers/
packages/web-app/src/theme/
packages/web-app/src/utils/
packages/web-app/src/types/
packages/web-app/src/constants/
packages/web-app/src/assets/
```

## 📋 作成対象CLAUDE.mdファイル一覧

### 🔥 最優先配置 [1個]
- [ ] `packages/web-app/src/` - フロントエンドソースコード統括

### ⭐ 高優先配置 [2個]
- [ ] `packages/web-app/src/app/auth/` - 認証後UI統括
- [ ] `packages/web-app/src/feature/` - ドメイン別コンポーネント統括

### 📋 中優先配置 [16個]
#### 認証後UIページ詳細
- [ ] `packages/web-app/src/app/auth/(dashboard)/` - ダッシュボードルート
- [ ] `packages/web-app/src/app/auth/(dashboard)/item/` - 商品管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/transaction/` - 取引管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/customers/` - 顧客管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/register/` - レジスター画面
- [ ] `packages/web-app/src/app/auth/(dashboard)/sale/` - 売上管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/purchase/` - 購入管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/purchaseReception/` - 購入受付ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/purchaseTable/` - 買取テーブルページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/stock/` - 在庫管理ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/settings/` - 設定ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/sales-analytics/` - 売上分析ページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/inventory-count/` - 棚卸しページ
- [ ] `packages/web-app/src/app/auth/(dashboard)/original-pack/` - オリジナルパック管理ページ

#### UI基盤
- [ ] `packages/web-app/src/components/` - UIコンポーネント
- [ ] `packages/web-app/src/app/` - Next.js App Router

### 🎯 検討優先配置 [5個]
#### Feature ドメイン（高頻度利用）
- [ ] `packages/web-app/src/feature/transaction/` - 取引関連コンポーネント
- [ ] `packages/web-app/src/feature/item/` - 商品関連コンポーネント
- [ ] `packages/web-app/src/feature/customer/` - 顧客関連コンポーネント
- [ ] `packages/web-app/src/feature/register/` - レジスター関連コンポーネント
- [ ] `packages/web-app/src/feature/dashboard/` - ダッシュボードコンポーネント

## 📄 CLAUDE.mdテンプレート構造

各CLAUDE.mdファイルには以下の構造を含める：

```markdown
# [ディレクトリ名]/CLAUDE.md

## 🎯 目的・役割

## 🏗️ 技術構成
- **フレームワーク**: 
- **主要技術**: 
- **依存関係**: 

## 📁 ディレクトリ構造
```
[ツリー構造]
```

## 🔧 主要機能
- 機能1の説明
- 機能2の説明

## 💡 使用パターン
- 典型的な使用方法
- コード例

## 🔗 関連ディレクトリ
- [関連ディレクトリ1](../path/)
- [関連ディレクトリ2](../path/)

## 📝 開発メモ
- 開発時の注意点
- ベストプラクティス

---
*Frontend-Agent作成: 2025-01-24*
```

## ✅ 受け入れ基準

- [ ] **完全性**: 24個すべてのCLAUDE.mdファイルが作成済み
- [ ] **品質**: 各ファイルにテンプレート構造の全セクションが含まれる
- [ ] **一貫性**: 用語・書式・リンク形式が統一されている
- [ ] **相互参照**: 関連ディレクトリへのリンクが正しく設定されている
- [ ] **技術精度**: Next.js App Router、React、TypeScriptの技術情報が正確
- [ ] **実用性**: 開発者が実際に活用できる具体的な情報が含まれる

## 🔄 依存関係

- **requires**: project_analysis_report.md（完了済み）
- **blocks**: なし
- **relates**: TASK-002, TASK-003, TASK-004
- **coordination**: Backend-Agent（API統合ポイント）

## 🚀 実装手順

1. **Phase 1**: 最優先・高優先配置（3個）を作成
2. **Phase 2**: 中優先配置の認証後UIページ（14個）を作成
3. **Phase 3**: 中優先配置のUI基盤（2個）を作成
4. **Phase 4**: 検討優先配置の主要Featureドメイン（5個）を作成
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

**Status** 2025-01-24 17:30 Frontend-Agent: タスク作成完了、実装待機中

## 🔍 品質チェックリスト

- [ ] Next.js 14.2.3 App Router の機能説明が正確
- [ ] Material-UI v5 コンポーネントの使用パターン記載
- [ ] React Hook Form の実装例included
- [ ] TypeScript型定義への適切な参照
- [ ] 認証フロー（NextAuth.js）の説明
- [ ] Feature-Driven Design パターンの解説
- [ ] hooks/components 分離戦略の明記
- [ ] 相互参照リンクの動作確認完了 