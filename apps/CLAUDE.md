# apps/CLAUDE.md

## 🎯 目的・役割

クライアントアプリケーション群の配置先。将来的にクライアント向けアプリ（モバイルアプリ、デスクトップアプリ等）のパッケージを集約し、統合的なクライアントアプリケーション管理を実現する予定。

## 🏗️ 技術構成
- **主要技術**: (将来計画) React Native, Electron, PWA等
- **依存関係**: 共通パッケージ、バックエンドAPI
- **関連システム**: モバイルプラットフォーム、デスクトップ環境

## 📁 ディレクトリ構造
```
apps/
├── CLAUDE.md
└── README.md       # 移行計画・方針説明
```

## 🔧 主要機能

### 将来予定機能
- **モバイルアプリ**: React Native によるiOS/Android対応
- **デスクトップアプリ**: Electron による店舗管理アプリ
- **PWA**: プログレッシブWebアプリケーション
- **ハイブリッドアプリ**: Web技術ベースのクロスプラットフォームアプリ

### 統合管理
- クライアントアプリの統一管理
- 共通コンポーネントの再利用
- 一貫したUX/UI設計の適用

## 💡 使用パターン

### 将来的な開発フロー
```bash
# モバイルアプリ開発
cd apps/mobile-app
npm run dev:ios
npm run dev:android

# デスクトップアプリ開発
cd apps/desktop-app
npm run dev:electron

# PWA開発
cd apps/pwa
npm run dev
```

## 🗺️ プロジェクト内での位置づけ

### 移行計画
```
現在: packages/web-app (Webアプリのみ)
     ↓
将来: apps/ (全クライアントアプリ統合)
     ├── web-app/      (既存Webアプリ移行)
     ├── mobile-app/   (新規モバイルアプリ)
     ├── desktop-app/  (新規デスクトップアプリ)
     └── pwa/          (PWA版)
```

### 他システムとの関係
- **バックエンドAPI**: 全クライアントアプリの共通データソース
- **共通パッケージ**: ビジネスロジック・ユーティリティの共有
- **認証システム**: 統一認証の適用
- **通知システム**: プラットフォーム横断通知

### 責務の境界
- **責務内**: クライアントアプリケーションの管理、UX統一
- **責務外**: バックエンドロジック、インフラ管理

## 🔗 関連ディレクトリ
- [Webアプリ](../packages/web-app/) - 移行対象の既存アプリ
- [共通パッケージ](../packages/common/) - 共有ロジック
- [API Generator](../packages/api-generator/) - クライアント向けAPI
- [バックエンドコア](../packages/backend-core/) - データ提供元

## 📚 ドキュメント・リソース
- React Native Documentation
- Electron Documentation
- PWA Development Guide
- Cross-Platform Design Guidelines

## 📝 開発メモ

### 移行戦略
- 段階的な機能移行
- 既存Webアプリとの並行運用
- プラットフォーム固有機能の段階的導入

### 設計思想
- コードの最大再利用
- プラットフォーム横断のUX統一
- パフォーマンス最適化

### 技術選定方針
- Web技術ベースの統一
- ネイティブ機能との適切な統合
- メンテナンス性の重視

### 将来の開発計画
1. **Phase 1**: Web-app移行（apps/web-app/）
2. **Phase 2**: PWA版作成（apps/pwa/）
3. **Phase 3**: モバイルアプリ開発（apps/mobile-app/）
4. **Phase 4**: デスクトップアプリ開発（apps/desktop-app/）

### 考慮事項
- プラットフォーム固有の制約
- アプリストア審査・配信戦略
- デバイス性能・画面サイズ対応
- オフライン機能の実装

### 品質管理
- クロスプラットフォームテスト
- パフォーマンス監視
- ユーザビリティテスト
- セキュリティ監査

---
*Documentation-Agent作成: 2025-01-24*