# copilot/ec-web-app/CLAUDE.md

## 🎯 目的・役割

ECサイト専用のWebアプリケーションサービス。一般顧客向けのオンラインストア機能を提供し、POSシステムと連携した統合EC体験を実現。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Next.js 14 + Node.js 23.9.0
- **オーケストレーション**: ECS Fargate + Application Load Balancer
- **依存関係**: RDS, ElastiCache, S3, CloudFront

## 📁 ディレクトリ構造
```
copilot/ec-web-app/
├── manifest.yml              # Copilotサービス定義
└── overrides/                # CloudFormation上書き設定
    ├── README.md
    └── cfn.patches.yml       # ALB・CloudFront設定カスタマイズ
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, ALB, CloudFront
- **リージョン**: 環境依存
- **環境設定**: CDN配信、キャッシュ最適化

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green Deployment
- **パイプライン**: GitHub Actions → Copilot Deploy
- **環境切り替え**: copilot app deploy --env [staging|production|public]

## 🔧 主要機能
- **商品カタログ**: 商品一覧・詳細・検索・フィルタリング
- **ショッピングカート**: カート機能・注文処理・決済連携
- **顧客機能**: 会員登録・ログイン・注文履歴・お気に入り
- **ECサイト管理**: 商品管理・注文管理・顧客管理

## 💡 運用パターン
- CDNによる静的コンテンツ配信
- 商品画像の自動最適化・配信
- SEO最適化とパフォーマンス重視

## 📊 監視・ログ
- **監視項目**: ページ表示速度、コンバージョン率、CDNヒット率
- **ログ出力**: CloudWatch Logs、CloudFrontアクセスログ
- **アラート設定**: ページ速度 > 2秒、CDNエラー率 > 1%

## 🔗 関連ディレクトリ
- [copilot/](../) - Copilot全体統括
- [packages/web-app/](../../packages/web-app/) - Next.jsアプリケーション（EC機能）
- [copilot/pos-web-app/](../pos-web-app/) - 管理画面との連携

## 📝 運用メモ
- **パフォーマンス**: 画像最適化、LazyLoading、Service Worker
- **セキュリティ**: CSRF対策、XSS対策、決済情報保護
- **トラブルシューティング**: CDNキャッシュクリア、商品データ同期確認

---
*Infrastructure-Agent作成: 2025-01-24*