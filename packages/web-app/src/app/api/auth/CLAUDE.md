# Auth API

## 概要
認証・認可のためのAPI。NextAuth.jsを使用したJWTベースの認証システムで、管理モードと営業モードの2つの動作モードをサポートする。

## エンドポイント

### NextAuth エンドポイント
- `POST /api/auth/signin` - ログイン
- `POST /api/auth/signout` - ログアウト  
- `GET /api/auth/session` - セッション取得
- `GET /api/auth/csrf` - CSRFトークン取得
- `GET /api/auth/providers` - 認証プロバイダー一覧

## 認証フロー

### ログイン処理
```typescript
POST /api/auth/signin
```

**リクエストボディ**:
```typescript
{
  email: string;           // メールアドレス（必須）
  password: string;        // パスワード（必須）
  mode: PosRunMode;        // 動作モード（必須）
  store_id?: number;       // 店舗ID（営業モード時必須）
  register_id?: number;    // レジID（オプション）
}
```

### 動作モード
```typescript
enum PosRunMode {
  admin = 'admin',   // 管理モード
  sales = 'sales'    // 営業モード
}
```

## 認証プロセス

### 1. 基本認証
1. メールアドレスでアカウント検索
2. パスワードをハッシュ化して検証
3. アカウントの有効性確認

### 2. 特殊アカウント処理
- `login_flg = false`の特殊アカウントの場合
- 初回ログイン時にパスワードを設定
- 管理モードのみ対応

### 3. 通常認証（launch処理）
1. BackendApiAuthService.launchを実行
2. 利用可能なモードを確認
3. 指定モードの権限チェック

### 4. モード別処理

#### 管理モード（admin）
- 管理権限の確認
- 法人全体の管理が可能

#### 営業モード（sales）
- 営業権限の確認
- 指定店舗へのアクセス権確認
- レジ指定がある場合はレジの存在確認

## セッション管理

### JWT トークン
```typescript
interface customJwtType {
  sub: string;              // アカウントID
  corporation_id: number;   // 法人ID
  store_id?: number;        // 店舗ID（営業モード時）
  register_id?: number;     // レジID（指定時）
  mode: PosRunMode;         // 動作モード
  email: string;            // メールアドレス
  display_name: string;     // 表示名
}
```

### セッションユーザー
```typescript
interface SessionUser {
  id: number;
  corporation_id: number;
  store_id?: number;
  register_id?: number;
  mode: PosRunMode;
  email: string;
  display_name: string;
}
```

## セキュリティ

### パスワード管理
- bcryptによるハッシュ化
- ソルト付きハッシュ
- 平文パスワードは保存しない

### CSRF対策
- CSRFトークンの自動生成・検証
- ダブルサブミットクッキー

### セッションセキュリティ
- HTTPOnly Cookie
- Secure Cookie（HTTPS環境）
- SameSite属性

## エラーハンドリング

### 認証エラー
- 無効な認証情報
- アカウント無効
- 権限不足
- モード不一致

### エラーレスポンス
NextAuthの標準エラー形式に従う：
- ログインページへのリダイレクト
- エラーメッセージの表示

## 権限チェック

### 管理モード権限
- 法人管理
- 全店舗アクセス
- システム設定変更
- レポート閲覧

### 営業モード権限
- 指定店舗のみアクセス
- 販売・買取処理
- 在庫確認
- 日次処理

## 実装詳細

### NextAuth設定
```typescript
{
  pages: {
    signIn: '/login'  // カスタムログインページ
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [CredentialsProvider],
  callbacks: {
    jwt: JWTコールバック,
    session: セッションコールバック
  }
}
```

### 環境変数
- `NEXTAUTH_URL`: アプリケーションURL
- `NEXTAUTH_SECRET`: JWT署名用シークレット

## 使用例

### ログイン（管理モード）
```typescript
const result = await signIn('credentials', {
  email: 'admin@example.com',
  password: 'password123',
  mode: 'admin',
  redirect: false
});
```

### ログイン（営業モード）
```typescript
const result = await signIn('credentials', {
  email: 'staff@example.com',
  password: 'password123',
  mode: 'sales',
  store_id: 1,
  register_id: 2,
  redirect: false
});
```

### セッション取得
```typescript
const session = await getSession();
if (session?.user) {
  console.log('ログイン中:', session.user.email);
  console.log('モード:', session.user.mode);
}
```

## トラブルシューティング

### ログインできない
1. メールアドレス・パスワードの確認
2. アカウントの有効性確認
3. 指定モードの権限確認
4. 店舗・レジIDの妥当性確認

### セッションが維持されない
1. Cookie設定の確認
2. NEXTAUTH_URL環境変数の確認
3. HTTPSの使用確認

## 今後の拡張予定

1. **多要素認証（MFA）**
   - TOTP対応
   - SMS認証
   - 生体認証

2. **シングルサインオン（SSO）**
   - SAML対応
   - OAuth2.0プロバイダー
   - Active Directory連携

3. **セッション管理強化**
   - デバイス管理
   - 同時ログイン制限
   - セッション履歴

## 関連機能

- [アカウントAPI](/account/CLAUDE.md)
- [権限管理](/authority/CLAUDE.md)
- [セキュリティ設定](/security/CLAUDE.md)
- [監査ログ](/audit/CLAUDE.md)