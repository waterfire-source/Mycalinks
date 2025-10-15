# packages/web-app/src/app/ec/login/CLAUDE.md

## 🎯 目的・役割

ECサイトの顧客ログイン機能 - メールアドレス・パスワードによる認証を行い、ユーザー情報の完全性に応じて適応的リダイレクトを実行する高度な認証システム。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 (App Router) + TypeScript
- **認証**: useAppAuth プロバイダー
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - 適応的リダイレクト（ユーザー情報完全性チェック）
  - パスワード表示制御（Visibility/VisibilityOff）
  - エラーハンドリング・ローディング状態管理
  - 新規登録誘導システム
- **依存関係**: 
  - useAppAuth（認証プロバイダー）
  - validateUserInfo（ユーザー情報検証）
  - PATH定数（ルーティング）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/ec/login/
├── page.tsx                    # ログインページ（216行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 高度な認証フロー
- **段階的認証**: signIn → getAccountInfo → validateUserInfo → 適応的リダイレクト
- **ユーザー情報完全性チェック**: 必須情報の有無による画面遷移制御
- **適応的リダイレクト**: 
  - 情報完全 → `/ec/order`（注文ページ）
  - 情報不完全 → `/ec/account/edit`（編集ページ）

### 2. セキュアなパスワード管理
- **パスワード保護**: type="password"による入力保護
- **表示制御**: 目アイコンによる表示/非表示切り替え
- **アクセシビリティ**: IconButton + Visibility/VisibilityOff アイコン

### 3. フォーム制御・状態管理
- **制御されたコンポーネント**: useState による状態管理
- **リアルタイム更新**: onChange イベントハンドラー
- **バリデーション**: 必須項目チェック・サーバーサイド検証
- **ローディング状態**: 認証中の視覚的フィードバック

### 4. エラーハンドリング
- **多層エラー処理**: 認証失敗・情報取得失敗・システムエラー
- **ユーザーフレンドリーなメッセージ**: 具体的なエラー内容表示
- **エラー状態管理**: useState による一元的なエラー管理

### 5. 新規登録誘導
- **未登録ユーザー対応**: 新規会員登録への明確な誘導
- **視覚的訴求**: 専用セクション・ボタンによる登録促進
- **パスワード忘れ対応**: パスワードリセットページへのリンク

## 💡 使用パターン

### 基本的なログインフロー
```typescript
// 1. ユーザー入力
メールアドレス入力 → パスワード入力 → ログインボタンクリック

// 2. 認証処理
const { appUserId } = await signIn({ email, password });

// 3. ユーザー情報取得
const userResult = await getAccountInfo();

// 4. 情報完全性チェック
const validation = validateUserInfo(userResult);

// 5. 適応的リダイレクト
if (validation.isValid) {
  router.push('/ec/order');     // 注文ページへ
} else {
  router.push('/ec/account/edit'); // 編集ページへ
}
```

### パスワード表示制御
```typescript
// パスワード表示切り替え
const [showPassword, setShowPassword] = useState(false);
const togglePasswordVisibility = () => setShowPassword(!showPassword);

// パスワードフィールド
<TextField
  type={showPassword ? 'text' : 'password'}
  InputProps={{
    endAdornment: (
      <IconButton onClick={togglePasswordVisibility}>
        {showPassword ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    ),
  }}
/>
```

## 🎨 UI/UX設計

### レスポンシブデザイン
- **Container maxWidth="sm"**: モバイル対応レイアウト
- **2セクション構成**: ログインフォーム + 新規登録誘導
- **統一されたデザイン**: Material-UI による一貫性

### 視覚的フィードバック
- **ローディング状態**: 「ログイン中...」表示・ボタン無効化
- **エラー表示**: 赤色テキストによる明確なエラーメッセージ
- **プレースホルダー**: ユーザーフレンドリーな入力ガイド

### アクセシビリティ
- **autoFocus**: メールアドレスフィールドへの自動フォーカス
- **autoComplete**: ブラウザ自動補完対応
- **required**: 必須フィールドの明示

## 🔗 API統合

### useAppAuth プロバイダー
```typescript
const { signIn, getAccountInfo } = useAppAuth();

// 認証処理
const { appUserId } = await signIn({
  email: 'user@example.com',
  password: 'password123',
});

// ユーザー情報取得
const userResult = await getAccountInfo();
```

### validateUserInfo ユーティリティ
```typescript
// ユーザー情報完全性チェック
const validation = validateUserInfo(userResult);

// 検証結果
interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  // その他の検証情報
}
```

## 🚀 パフォーマンス最適化

### 状態管理効率化
- **最小限の状態**: 必要な状態のみ管理
- **条件付きレンダリング**: エラー・ローディング状態の効率的な表示
- **useCallback**: イベントハンドラーの最適化

### ユーザーエクスペリエンス
- **即座のフィードバック**: リアルタイムエラー表示
- **適応的ナビゲーション**: ユーザー状態に応じた自動遷移
- **明確なアクション**: 次に取るべき行動の明示

## 🔗 関連ディレクトリ

- [../account/signup/](../account/signup/) - 新規会員登録
- [../forget-password/](../forget-password/) - パスワードリセット
- [../(auth)/order/](../(auth)/order/) - 認証後の注文ページ
- [../account/edit/](../account/edit/) - アカウント情報編集
- [../(core)/constants/](../(core)/constants/) - PATH定数
- [/providers/](../../../../providers/) - useAppAuth認証プロバイダー
- [../(core)/utils/](../(core)/utils/) - validateUserInfo

## 📝 開発メモ

### 実装の特徴
- **216行のコンパクト設計**: 認証・リダイレクト・UI制御の効率的な統合
- **適応的リダイレクト**: ユーザー状態に応じた柔軟な画面遷移
- **セキュリティ重視**: パスワード保護・認証検証の徹底
- **UX最適化**: ローディング・エラー・成功時の適切なフィードバック

### 技術的工夫
- **エラーハンドリング**: 3層構造（認証・情報取得・システム）
- **状態管理**: 5つの状態（email, password, showPassword, loading, error）
- **フォーム制御**: 制御されたコンポーネントによる一貫性
- **新規登録誘導**: 未登録ユーザーへの積極的な登録促進

### 将来の拡張計画
- **ソーシャルログイン**: Google・Facebook認証の追加
- **二要素認証**: SMS・メール認証の実装
- **ログイン履歴**: セキュリティ強化機能
- **自動ログイン**: Remember me 機能

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 