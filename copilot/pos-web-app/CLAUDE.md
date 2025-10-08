# copilot/pos-web-app/CLAUDE.md

## 🎯 目的・役割

メインPOSシステムのWebアプリケーションサービス。店舗スタッフが使用する販売・在庫管理・顧客管理の中核システムをホスティング。

## 🏗️ 技術構成
- **インフラ**: AWS Copilot (ECS)
- **コンテナ**: Docker + Next.js 14 + Node.js 23.9.0
- **オーケストレーション**: ECS Fargate + Application Load Balancer
- **依存関係**: RDS, ElastiCache, S3, SES

## 📁 ディレクトリ構造
```
copilot/pos-web-app/
├── Dockerfile                # Next.jsアプリケーションコンテナ
├── manifest.yml              # Copilotサービス定義
├── addons/                   # 専用AWSリソース
│   ├── README.md
│   ├── elasticache.yml       # Redis クラスター
│   └── waf.yml               # Web Application Firewall
├── overrides/                # CloudFormation上書き設定
│   ├── README.md
│   └── cfn.patches.yml       # ALB・ECS設定カスタマイズ
└── sidecars/                 # サイドカーコンテナ
    ├── README.md
    ├── nginx/                # リバースプロキシ
    │   ├── Dockerfile
    │   ├── default.local.conf
    │   └── default.production.conf
    └── python/               # レシート生成サービス
        ├── Dockerfile
        ├── README.md
        ├── flask/
        │   ├── app.py
        │   └── modules/
        └── requirements.txt
```

## ☁️ AWS リソース
- **サービス**: ECS Fargate, ALB, ElastiCache
- **リージョン**: 環境依存
- **環境設定**: マルチAZ配置、Auto Scaling

## 🔄 デプロイメント
- **デプロイ戦略**: Blue-Green Deployment
- **パイプライン**: GitHub Actions → Copilot Deploy
- **環境切り替え**: copilot app deploy --env [staging|production|customer|public]

## 🔧 主要機能
- **POS販売**: 商品販売・決済処理・レシート発行
- **在庫管理**: 入出庫・棚卸・在庫移動
- **顧客管理**: 顧客登録・購入履歴・ポイント管理
- **レポート**: 売上分析・在庫分析・顧客分析

## 💡 運用パターン
- Multi-container service (Next.js + Nginx + Python)
- Session affinity for user experience
- Auto scaling based on CPU/Memory

## 📊 監視・ログ
- **監視項目**: 応答時間、エラー率、同時接続数
- **ログ出力**: CloudWatch Logs、アクセスログ、アプリケーションログ
- **アラート設定**: 応答時間 > 3秒、エラー率 > 5%

## 🔗 関連ディレクトリ
- [copilot/](../) - Copilot全体統括
- [packages/web-app/](../../packages/web-app/) - Next.jsアプリケーション
- [copilot/environments/](../environments/) - 環境設定

## 📝 運用メモ
- **パフォーマンス**: CDN活用、静的アセット最適化
- **セキュリティ**: WAF設定、HTTPS強制、CSP設定
- **トラブルシューティング**: ECS Task停止時の自動復旧、ログ分析手順

---
*Infrastructure-Agent作成: 2025-01-24*