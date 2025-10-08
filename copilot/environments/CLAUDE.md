# copilot/environments/CLAUDE.md

## 🎯 目的・役割

AWS Copilotの環境設定を管理し、マルチテナント対応のPOSシステムの各環境（開発・本番・顧客・公開）の独立性と一貫性を保証する。環境ごとに最適化されたリソース配置とセキュリティ設定を提供する。

## 🏗️ 技術構成

- **インフラ**: AWS Copilot Environment
- **コンテナ**: ECS Fargate
- **オーケストレーション**: CloudFormation (Copilot管理)
- **依存関係**: VPC, RDS, ElastiCache, NAT Gateway, VPN

## 📁 ディレクトリ構造

```
copilot/environments/
├── staging/                     # 開発・テスト環境
│   └── manifest.yml            # 環境設定
├── production/                 # 本番環境（Myca店舗）
│   └── manifest.yml
├── public/                     # 一般公開環境
│   └── manifest.yml
├── customer/                   # 有料顧客環境
│   └── manifest.yml
└── addons/                     # 環境共通アドオン
    ├── README.md               # アドオン説明
    ├── rds.yml                 # Aurora MySQL設定
    ├── nat-gateway.yml         # 固定IP設定
    ├── vpn.yml                 # VPNアクセス設定
    ├── s3.yml                  # ストレージ設定
    ├── ses.yml                 # メール設定
    ├── cloudwatch.yml          # 監視設定（本番のみ）
    └── chatbot.yml             # Slack通知（本番のみ）
```

## ☁️ AWS リソース

### 環境別構成

| リソース | Staging | Production | Public | Customer |
|---------|---------|------------|--------|----------|
| **VPC** | Copilot管理 | Copilot管理 | 既存VPC | 既存VPC |
| **NAT Gateway** | ✓ | ✓ | ✗ | ✗ |
| **RDS Aurora** | ✓ | ✓ | ✗ | ✗ |
| **ElastiCache** | ✓ | ✓ | ✗ | ✗ |
| **VPN** | ✓ | ✓ | ✗ | ✗ |
| **Container Insights** | ✗ | ✗ | ✗ | ✗ |

### データベース構成

#### Staging環境
- **インスタンス**: db.t4g.medium (単一)
- **バックアップ**: 7日間
- **モニタリング**: 基本

#### Production環境
- **Writer**: db.r8g.large
- **Reader**: db.r7g.large (1-3台自動スケーリング)
- **バックアップ**: 30日間
- **モニタリング**: 拡張 (60秒間隔)
- **Performance Insights**: 465日保持

### ネットワーク構成

#### Copilot管理VPC (Staging/Production)
- **CIDR**: 自動割り当て
- **Subnets**: パブリック×2, プライベート×2
- **NAT Gateway**: Elastic IP付き
- **ルートテーブル**: 自動構成

#### 既存VPC (Public/Customer)
- **VPC ID**: vpc-05953f861d6ff363d
- **Subnets**: 事前定義済み
- **インターネットゲートウェイ**: 既存利用

## 🔄 デプロイメント

### 環境デプロイ
```bash
# 新規環境作成
copilot env init --name staging

# 環境デプロイ（アドオン含む）
copilot env deploy --name staging

# 環境情報確認
copilot env show --name staging
```

### アドオン管理
```bash
# アドオン適用
copilot env deploy --name production

# カスタムアドオン追加
cp custom-addon.yml copilot/environments/addons/
copilot env deploy --name production
```

### 環境削除
```bash
# 環境内の全サービス削除後
copilot env delete --name staging
```

## 🔧 主要機能

### マルチテナント分離
- 環境間の完全なリソース分離
- 独立したデータベースインスタンス
- 環境専用のシークレット管理

### セキュリティ強化
- プライベートサブネット配置
- VPNによる安全なアクセス
- 最小権限のIAMロール
- 暗号化されたデータストア

### コスト最適化
- Container Insights無効化
- Staging環境の最小構成
- Public/Customer環境のVPC共有

### 高可用性
- Multi-AZ配置
- 自動フェイルオーバー
- スケーラブルな読み取りレプリカ

## 💡 運用パターン

### 環境変数管理
```bash
# シークレット設定
copilot secret init --name DB_PASSWORD
echo -n "password" | copilot secret put --name DB_PASSWORD --env production

# 環境変数確認
copilot env show --name production --resources
```

### VPNアクセス
```bash
# 証明書ダウンロード
aws s3 cp s3://copilot-vpn-certificates-{env}/client-config.ovpn .

# OpenVPNで接続
openvpn --config client-config.ovpn
```

### データベース接続
```bash
# RDS Proxy経由（推奨）
mysql -h proxy.{env}.pos.local -u admin -p

# 直接接続（VPN必須）
mysql -h writer.{env}.pos.local -u admin -p
```

## 📊 監視・ログ

### 監視項目
- **RDS**: CPU、接続数、レプリカラグ
- **NAT Gateway**: 帯域幅、パケット数
- **VPN**: 接続数、トラフィック
- **ElastiCache**: メモリ使用率、接続数

### ログ出力
- **CloudWatch Logs**: 環境別ログググループ
- **VPC Flow Logs**: ネットワークトラフィック
- **RDS Logs**: スロークエリログ（本番のみ）

### アラート設定
- **Production環境のみ**:
  - Chatbot経由でSlack通知
  - RDS高負荷アラート
  - VPN接続異常通知

## 🔗 関連ディレクトリ

- [Copilotインフラ全体](../)
- [パイプライン設定](../pipelines/)
- [サービス定義](../pos-web-app/)
- [ワーカー設定](../../workers/)
- [ジョブ設定](../../jobs/)

## 📝 運用メモ

### パフォーマンス考慮事項
- **RDS Proxy**: 接続プーリングで負荷分散
- **読み取りレプリカ**: 参照クエリの負荷分散
- **ElastiCache**: セッション管理とキャッシュ
- **NAT Gateway**: 固定IPで外部API連携

### セキュリティ設定
- **ネットワーク分離**: プライベートサブネット必須
- **暗号化**: RDS・S3の保存時暗号化
- **アクセス制御**: セキュリティグループで最小限
- **監査**: CloudTrailで全操作記録

### トラブルシューティング
1. **環境デプロイ失敗**
   - CloudFormationスタック確認
   - IAM権限確認
   - リソース制限確認

2. **RDS接続エラー**
   - セキュリティグループ確認
   - RDS Proxy状態確認
   - VPN接続確認（直接接続時）

3. **VPN接続不可**
   - 証明書有効期限確認
   - クライアント設定確認
   - ルートテーブル確認

### 環境別チューニング
#### Staging
- 最小構成でコスト削減
- 開発効率重視の設定
- 本番同等の機能確認

#### Production
- 高可用性・高性能設定
- 自動スケーリング有効
- 詳細モニタリング

#### Public/Customer
- 既存インフラ活用
- 独立したアプリケーション層
- 共有VPCでコスト最適化

---
*Infrastructure-Agent作成: 2025-01-24*