# Settings Feature

## 概要
システム設定管理機能。アカウント管理、権限設定、店舗設定、レジ設定、ポイント設定など、POSシステム全体の設定を統括する。

## 主要機能

### アカウント管理
- ユーザーアカウント作成・編集
- パスワード管理
- アカウントコード発行
- グループ割り当て

### 権限管理
- 権限グループ定義
- 機能別アクセス制御
- 役職別権限設定
- カスタム権限作成

### 店舗設定
- 店舗基本情報
- 営業時間設定
- 税率設定
- レシート設定

### レジ設定
- レジ端末管理
- 決済方法設定
- Square連携
- プリンター設定

### 商品設定
- コンディション定義
- ジャンル・カテゴリ管理
- 卸売価格設定
- タグ管理

### ポイント設定
- ポイント付与率
- ポイント利用設定
- 有効期限設定
- キャンペーン設定

## ディレクトリ構造

```
settings/
├── account/            # アカウント管理
│   └── components/    # アカウント関連UI
├── authority/          # 権限管理
│   ├── components/    # 権限設定UI
│   └── utils/         # 権限ユーティリティ
└── tag/               # タグ管理
    ├── components/    # タグ設定UI
    └── hooks/         # タグ管理ロジック

app/auth/(dashboard)/settings/
├── account/           # アカウント設定ページ
├── authority/         # 権限設定ページ
├── cash-register/     # レジ設定ページ
├── condition/         # コンディション設定
├── corporation/       # 企業設定ページ
├── genre-and-category/ # ジャンル・カテゴリ設定
├── point-setting/     # ポイント設定ページ
├── store/            # 店舗設定ページ
├── tablet-setting/    # タブレット設定
└── wholesale-price/   # 卸売価格設定
```

## 主要コンポーネント

### アカウント管理
#### AccountList
- アカウント一覧表示
- 検索・フィルタ
- 一括操作
- ステータス管理

#### ConfirmPasswordDialog
- パスワード変更確認
- 現在のパスワード検証
- 新パスワード設定
- 強度チェック

### 権限管理
#### AuthorityList
- 権限一覧表示
- 権限詳細設定
- 継承関係表示
- プリセット管理

#### AccountGroup
- グループ作成・編集
- メンバー管理
- 権限割り当て
- 階層構造

### レジ設定
#### RegisterCheckSettingModal
- レジ点検設定
- 開店/閉店処理
- 現金残高確認
- 差異チェック

#### SquareConnectButton
- Square決済連携
- アカウント接続
- 端末ペアリング
- テスト決済

### ポイント設定
#### PointSettingContentsCard
- ポイント基本設定
- 付与条件設定
- 利用制限設定
- 表示設定

## データモデル

### Account
```typescript
interface Account {
  id: number;
  code: string;
  name: string;
  email: string;
  accountGroups: AccountGroup[];
  stores: Store[];
  active: boolean;
  lastLogin: Date;
}
```

### AccountGroup
```typescript
interface AccountGroup {
  id: number;
  name: string;
  permissions: Permission[];
  parentGroupId?: number;
  accounts: Account[];
}
```

### StoreSettings
```typescript
interface StoreSettings {
  storeId: number;
  taxRate: number;
  openTime: string;
  closeTime: string;
  receiptSettings: ReceiptSettings;
  pointSettings: PointSettings;
}
```

## API連携

### 設定API
- `GET /api/settings/account`: アカウント設定取得
- `PUT /api/settings/account/{id}`: アカウント更新
- `GET /api/settings/store/{id}`: 店舗設定取得
- `PUT /api/settings/store/{id}`: 店舗設定更新

### 権限API
- `GET /api/authority/groups`: 権限グループ一覧
- `POST /api/authority/groups`: グループ作成
- `PUT /api/authority/groups/{id}/permissions`: 権限更新

## セキュリティ

### アクセス制御
- ロールベースアクセス制御(RBAC)
- 最小権限の原則
- 権限の継承と上書き
- 監査ログ

### パスワードポリシー
- 複雑性要件
- 定期変更
- 履歴管理
- ロックアウト

### APIセキュリティ
- APIキー管理
- レート制限
- IP制限
- 暗号化通信

## 設定管理

### 環境別設定
- 開発環境
- ステージング環境
- 本番環境
- 顧客別カスタマイズ

### 設定の同期
- 店舗間同期
- バックアップ
- 復元機能
- バージョン管理

## UI/UX

### 設定画面設計
- カテゴリ別整理
- 検索機能
- お気に入り設定
- 最近の変更履歴

### バリデーション
- リアルタイムチェック
- 依存関係検証
- 警告表示
- 確認ダイアログ

## 外部連携設定

### 決済連携
- Square設定
- GMO設定
- その他決済Gateway

### ハードウェア連携
- プリンター設定
- バーコードスキャナー
- キャッシュドロアー
- カスタマーディスプレイ

## 監査・コンプライアンス

### 変更履歴
- 全設定変更の記録
- 変更者・日時
- 変更前後の値
- ロールバック機能

### レポート
- 設定変更レポート
- 権限利用状況
- ログイン履歴
- セキュリティ監査

## パフォーマンス

### キャッシュ戦略
- 設定値キャッシュ
- 無効化タイミング
- 分散キャッシュ
- TTL管理

### 設定の反映
- 即時反映項目
- 再起動必要項目
- 段階的適用
- ロールバック

## トラブルシューティング

### 設定エラー
- 検証エラー
- 競合解決
- デフォルト値
- エラー通知

### 復旧手順
- 設定バックアップ
- 緊急時復旧
- サポート連絡
- ログ収集

## 今後の拡張予定

1. **AI設定最適化**
   - 利用パターン分析
   - 推奨設定提案
   - 自動チューニング

2. **マルチテナント対応**
   - テナント別設定
   - 設定テンプレート
   - 一括適用

3. **高度な権限管理**
   - 時間ベース権限
   - 承認ワークフロー
   - 動的権限付与

## 関連機能

- [アカウント管理](/account/CLAUDE.md)
- [店舗管理](/store/CLAUDE.md)
- [レジ管理](/register/CLAUDE.md)
- [セキュリティ](/security/CLAUDE.md)