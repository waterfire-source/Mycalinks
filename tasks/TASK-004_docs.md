# TASK-004: Documentation CLAUDE.md作成タスク

## 📋 タスク基本情報

- **タスクID**: TASK-004
- **カテゴリ**: docs
- **担当エージェント**: Documentation-Agent
- **状態**: pending
- **優先度**: high
- **複雑度**: medium 
- **作成日**: 2025-01-24
- **期限**: 2025-01-26
- **担当ファイル数**: 22個

## 🎯 タスク概要

プロジェクト統括・全般API・Feature 低優先度ドメイン・その他全般のCLAUDE.mdファイルを作成し、プロジェクト全体の知識統合とナビゲーション機能を提供する。

## 📂 担当ファイルパス（競合防止）

### 🔒 **専属所有権ファイルパス**
```
packages/          # （統括のみ、サブディレクトリは他エージェント）
packages/web-app/  # （統括のみ、srcは他エージェント）
docs/
configs/
envs/
prompts/
tasks/
_templates/
apps/
```

## 📋 作成対象CLAUDE.mdファイル一覧

### 🔥 最優先配置 [2個]
- [ ] `packages/` - Monorepo全体概要
- [ ] `packages/web-app/` - Next.jsフロントエンド統括

### ⭐ 高優先配置 [0個]
*（高優先配置は他エージェントが担当）*

### 📋 中優先配置 [8個]
#### 残りの高頻度Feature ドメイン
- [ ] `packages/web-app/src/feature/products/` - 製品関連コンポーネント
- [ ] `packages/web-app/src/feature/customers/` - 顧客管理コンポーネント
- [ ] `packages/web-app/src/feature/sale/` - 売上関連コンポーネント
- [ ] `packages/web-app/src/feature/purchase/` - 購入関連コンポーネント
- [ ] `packages/web-app/src/feature/stock/` - 在庫関連コンポーネント
- [ ] `packages/web-app/src/feature/settings/` - 設定関連コンポーネント
- [ ] `packages/web-app/src/feature/ec/` - EC関連コンポーネント
- [ ] `packages/web-app/src/feature/account/` - アカウント関連

### 🎯 検討優先配置 [12個]
#### 全般API
- [ ] `packages/web-app/src/app/api/account/` - アカウント管理API
- [ ] `packages/web-app/src/app/api/corporation/` - 企業管理API
- [ ] `packages/web-app/src/app/api/contract/` - 契約管理API
- [ ] `packages/web-app/src/app/api/auth/` - 認証API
- [ ] `packages/web-app/src/app/api/system/` - システム管理API

#### 低頻度Feature ドメイン
- [ ] `packages/web-app/src/feature/purchaseReception/` - 購入受付コンポーネント
- [ ] `packages/web-app/src/feature/purchaseTable/` - 買取テーブルコンポーネント
- [ ] `packages/web-app/src/feature/stocking/` - 入荷関連コンポーネント
- [ ] `packages/web-app/src/feature/inventory-count/` - 棚卸しコンポーネント
- [ ] `packages/web-app/src/feature/originalPack/` - オリジナルパック関連
- [ ] `packages/web-app/src/feature/category/` - カテゴリ関連コンポーネント
- [ ] `packages/web-app/src/feature/genre/` - ジャンル関連コンポーネント

## 📄 CLAUDE.mdテンプレート構造

各CLAUDE.mdファイルには以下の構造を含める：

```markdown
# [ディレクトリ名]/CLAUDE.md

## 🎯 目的・役割

## 🏗️ 技術構成
- **主要技術**: 
- **依存関係**: 
- **関連システム**: 

## 📁 ディレクトリ構造
```
[ツリー構造]
```

## 🔧 主要機能
- 機能1の説明
- 機能2の説明

## 💡 使用パターン
- 典型的な使用方法
- 設定例

## 🗺️ プロジェクト内での位置づけ
- 他システムとの関係
- データフロー
- 責務の境界

## 🔗 関連ディレクトリ
- [関連ディレクトリ1](../path/)
- [関連ディレクトリ2](../path/)

## 📚 ドキュメント・リソース
- 関連ドキュメント
- 外部リンク
- 学習リソース

## 📝 開発メモ
- 開発時の注意点
- ベストプラクティス
- 将来の拡張計画

---
*Documentation-Agent作成: 2025-01-24*
```

## ✅ 受け入れ基準

- [ ] **完全性**: 22個すべてのCLAUDE.mdファイルが作成済み
- [ ] **品質**: 各ファイルにテンプレート構造の全セクションが含まれる
- [ ] **統合性**: プロジェクト全体の知識が統合されている
- [ ] **ナビゲーション**: 他エージェント作成のCLAUDE.mdへの適切なリンク
- [ ] **相互参照**: 全体アーキテクチャの整合性が保たれている
- [ ] **実用性**: 新規参加者が全体像を把握できる情報レベル
- [ ] **アクセシビリティ**: 検索性・発見性の高い構造

## 🔄 依存関係

- **requires**: project_analysis_report.md（完了済み）
- **blocks**: なし
- **relates**: TASK-001, TASK-002, TASK-003
- **coordination**: 全エージェント（統合・リンク調整）

## 🚀 実装手順

1. **Phase 1**: 最優先配置（2個）- プロジェクト統括概要
2. **Phase 2**: 中優先配置のFeature（8個）- 残りのドメインコンポーネント
3. **Phase 3**: 検討優先配置の全般API（5個）- システム系API
4. **Phase 4**: 検討優先配置の低頻度Feature（7個）- 専門ドメイン
5. **Phase 5**: 全体統合・相互参照リンクの最終調整
6. **Phase 6**: プロジェクト全体のナビゲーション最適化

## 📊 進捗追跡

- **開始日時**: 未開始
- **Phase 1 完了**: 未完了
- **Phase 2 完了**: 未完了
- **Phase 3 完了**: 未完了
- **Phase 4 完了**: 未完了
- **Phase 5 完了**: 未完了
- **Phase 6 完了**: 未完了
- **最終完了**: 未完了

## 💬 コミュニケーション

**Status** 2025-01-24 17:30 Documentation-Agent: タスク作成完了、実装待機中

## 🔍 品質チェックリスト

- [ ] Monorepo構成（pnpm workspace）の説明が正確
- [ ] Next.js 14.2.3 App Router の全体像が明確
- [ ] TypeScript設定・型定義の統合説明
- [ ] 各APIドメインの役割分担が明確
- [ ] Feature-Driven Design の全体設計思想
- [ ] 他3エージェント作成内容への適切なリンク
- [ ] プロジェクト全体のデータフロー図
- [ ] 新規開発者向けの学習パス提供
- [ ] 技術的負債・改善点の明記
- [ ] 将来の拡張計画・ロードマップ

## 🎯 特別重点項目

### 🗺️ プロジェクト全体統合
- **アーキテクチャ概要**: 全体設計思想とパターン
- **データフロー**: フロントエンド〜API〜データベース
- **責務分離**: 各レイヤーの境界と責務

### 📚 ドキュメント中心設計
- **知識ベース**: 開発者が迷わない情報構造
- **学習パス**: 新規参加者向けのオンボーディング
- **リファレンス**: 開発中に参照する実用的な情報

### 🔗 統合・リンク戦略
- **相互参照**: 他エージェント作成コンテンツとの整合性
- **ナビゲーション**: 効率的な情報発見のためのリンク設計
- **検索最適化**: キーワード・タグによる検索性向上

### 🎨 情報アーキテクチャ
- **情報階層**: 全体〜詳細の適切な情報粒度
- **視覚化**: 図表・フローチャートによる理解促進
- **メンテナンス性**: 継続的な更新が容易な構造

## 🎯 エージェント間協調事項

### 📞 Frontend-Agent との連携
- UI/UX パターンの統合説明
- コンポーネント設計思想の統合
- Next.js App Router の全体像統合

### 📞 Backend-Agent との連携  
- API設計思想の統合説明
- データベース設計の全体像
- マイクロサービス アーキテクチャの統合

### 📞 Infrastructure-Agent との連携
- デプロイメント戦略の全体像
- 環境管理・運用の統合説明
- 監視・ログ戦略の統合

### 🎯 最終統合責任
- 全94個のCLAUDE.mdファイルの整合性確認
- 相互参照リンクの動作確認
- プロジェクト全体のナビゲーション最適化 