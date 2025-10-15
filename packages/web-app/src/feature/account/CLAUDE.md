# Account Feature

## 概要
アカウント管理機能。システムユーザーのアカウント情報取得、権限管理、グループ管理などの基本的なアカウント操作を提供する。

## 主要機能

### アカウント情報管理
- アカウント情報取得
- プロフィール表示
- ログイン履歴
- アクティビティ追跡

### アカウントグループ
- グループ所属管理
- 権限継承
- 役割定義
- 階層構造

### 認証連携
- NextAuth統合
- セッション管理
- トークン管理
- 自動ログアウト

## ディレクトリ構造

```
account/
└── hooks/              # カスタムフック
    ├── useAccount.tsx      # アカウント情報取得
    ├── useAccountGroup.tsx # グループ管理
    └── useAccounts.ts      # 複数アカウント管理
```

## 主要フック

### useAccount
単一アカウントの情報管理：
- アカウントID指定での取得
- ローディング状態管理
- エラーハンドリング
- キャッシュ管理

### useAccountGroup
アカウントグループ管理：
- グループ一覧取得
- グループメンバー管理
- 権限情報取得
- グループ階層管理

### useAccounts
複数アカウントの一括管理：
- アカウント一覧取得
- フィルタリング
- ソート機能
- ページネーション

## データモデル

### Account
```typescript
interface Account {
  id: number;
  code: string;
  name: string;
  email: string;
  phoneNumber?: string;
  accountGroups: AccountGroup[];
  stores: Store[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

### AccountGroup
```typescript
interface AccountGroup {
  id: number;
  name: string;
  description?: string;
  permissions: Permission[];
  parentGroupId?: number;
  level: number;
  accounts: Account[];
}
```

### Permission
```typescript
interface Permission {
  id: number;
  resource: string;
  action: string;
  allowed: boolean;
  conditions?: PermissionCondition[];
}
```

## API連携

### アカウントAPI
- `GET /api/account/{id}`: アカウント詳細取得
- `GET /api/account/me`: 現在のアカウント情報
- `GET /api/account`: アカウント一覧
- `PUT /api/account/{id}`: アカウント更新

### グループAPI
- `GET /api/account/groups`: グループ一覧
- `GET /api/account/groups/{id}`: グループ詳細
- `GET /api/account/groups/{id}/members`: メンバー一覧

## 認証フロー

### ログイン処理
1. 認証情報入力
2. NextAuth認証
3. JWTトークン生成
4. セッション確立

### セッション管理
- トークンリフレッシュ
- セッションタイムアウト
- 並行セッション制御
- デバイス管理

### ログアウト処理
- セッション破棄
- トークン無効化
- クライアント側クリア
- 監査ログ記録

## 権限管理

### RBAC (Role-Based Access Control)
- ロール定義
- リソースベース権限
- アクションベース制御
- 条件付き権限

### 権限チェック
- フロントエンド権限制御
- APIレベル認可
- UIコンポーネント表示制御
- 機能アクセス制限

### 権限の継承
- グループ階層による継承
- 上位グループからの権限継承
- 個別権限の上書き
- 最小権限の原則

## セキュリティ

### 認証セキュリティ
- 多要素認証（MFA）対応
- パスワードポリシー
- アカウントロック
- 不正アクセス検知

### データ保護
- 個人情報暗号化
- 通信暗号化
- セッション暗号化
- 監査ログ暗号化

### アクセス制御
- IPアドレス制限
- デバイス認証
- 時間帯制限
- 地理的制限

## 状態管理

### クライアント側
- React Context利用
- セッション情報保持
- 権限情報キャッシュ
- UI状態管理

### サーバー側
- Redisセッション管理
- JWTトークン管理
- 権限キャッシュ
- ログイン状態追跡

## 監査とコンプライアンス

### アクティビティログ
- ログイン/ログアウト記録
- 権限変更履歴
- アクセス履歴
- 操作履歴

### コンプライアンス対応
- GDPR準拠
- 個人情報保護法対応
- アクセスログ保管
- データ削除権

## エラーハンドリング

### 認証エラー
- 無効な認証情報
- セッションタイムアウト
- 権限不足
- アカウント無効

### API エラー
- ネットワークエラー
- サーバーエラー
- レート制限
- データ不整合

## パフォーマンス

### 最適化
- 権限情報キャッシュ
- セッション情報キャッシュ
- 非同期データ取得
- 遅延ローディング

### スケーラビリティ
- 分散セッション管理
- 負荷分散対応
- キャッシュ戦略
- データベース最適化

## UI/UX

### アカウント画面
- プロフィール表示
- 設定変更
- パスワード変更
- デバイス管理

### 権限表示
- 現在の権限一覧
- グループ所属表示
- アクセス可能機能
- 制限事項表示

## 今後の拡張予定

1. **高度な認証**
   - 生体認証対応
   - パスキー対応
   - ソーシャルログイン
   - SSO連携

2. **権限管理強化**
   - 動的権限付与
   - 一時的権限昇格
   - 承認ワークフロー
   - 権限委譲機能

3. **分析機能**
   - ログイン分析
   - 権限利用分析
   - セキュリティ分析
   - 異常検知

## 関連機能

- [設定管理](/settings/CLAUDE.md)
- [セキュリティ](/security/CLAUDE.md)
- [監査ログ](/audit/CLAUDE.md)
- [認証システム](/auth/CLAUDE.md)