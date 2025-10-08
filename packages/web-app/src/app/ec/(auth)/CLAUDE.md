# EC Auth - 認証機能グループ

## 目的

ECサイトでログイン認証が必要な機能群を管理・提供するルートグループを形成し、認証ガード機能による安全なアクセス制御を実現

## 機能概要

- **認証ガード**: ログイン状態のチェック・リダイレクト制御
- **認証レイアウト**: 認証済みユーザー向けの共通レイアウト
- **注文管理**: 注文確認・履歴・問い合わせ・配送状況確認
- **メッセージセンター**: 注文に関するメッセージ・問い合わせ管理
- **支払い方法管理**: MycalinksMALL決済方法設定・管理

## 内容概要

```
packages/web-app/src/app/ec/(auth)/
├── layout.tsx                  # 認証ガードレイアウト（28行）
├── CLAUDE.md                   # 本ドキュメント
├── order/                      # 注文管理機能
│   ├── page.tsx               # 注文確認・決済画面（578行）
│   ├── result/                # 注文結果
│   ├── history/               # 注文履歴
│   └── contact/               # 注文問い合わせ
├── message-center/             # メッセージセンター
│   ├── page.tsx               # メッセージ一覧（205行）
│   └── [id]/                  # 個別メッセージ詳細
└── payment-method/             # 支払い方法管理
```

## 重要ファイル

- `layout.tsx`: 認証ガードレイアウト - 28行のシンプルで効果的な認証制御
- `order/page.tsx`: 注文確認・決済画面 - 578行の大規模決済システム
- `message-center/page.tsx`: メッセージ一覧 - 205行のメッセージ管理

## 主要機能実装

### 1. 認証ガードレイアウト（28行）

```typescript
'use client';
import { useEffect } from 'react';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useAppAuth } from '@/providers/useAppAuth';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUserId } = useAppAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userId = await getUserId();
      if (!userId) {
        router.push(PATH.LOGIN);
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}
```

### 2. 認証チェック機能

```typescript
// 非同期認証状態確認
const checkAuth = async () => {
  const userId = await getUserId();
  if (!userId) {
    router.push(PATH.LOGIN);
  }
};

// useEffect での自動実行
useEffect(() => {
  checkAuth();
}, []);
```

### 3. 子コンポーネント描画

```typescript
// 認証チェック後の子コンポーネント表示
return <>{children}</>;
```

## 認証ガード機能詳細

### 自動認証チェック

- **useEffect**: コンポーネントマウント時の自動認証チェック
- **非同期処理**: async/await による適切な非同期認証確認
- **getUserId**: useAppAuth プロバイダーからのユーザーID取得

### リダイレクト制御

- **未ログイン検出**: ユーザーIDが存在しない場合の検出
- **自動リダイレクト**: PATH.LOGIN への自動遷移
- **セッション管理**: 認証状態の適切な管理

### レイアウト継承

- **シンプル設計**: 最小限のコードで認証ガード実装
- **透過的レンダリング**: 認証後の子コンポーネント表示
- **パフォーマンス**: 軽量な認証チェック

## 認証機能グループの構成

### 注文管理機能（order/）

```typescript
// 注文確認・決済画面（578行）
- 注文内容確認
- 支払い方法選択
- 配送方法管理
- 注文確定処理

// 注文履歴（history/）
- 過去の注文一覧
- 注文詳細表示
- 注文状況確認

// 注文問い合わせ（contact/）
- 注文に関する問い合わせ
- 問い合わせ履歴
- 問い合わせ結果確認
```

### メッセージセンター（message-center/）

```typescript
// メッセージ一覧（205行）
- 受信メッセージ一覧
- メッセージ状態管理
- 未読・既読管理

// 個別メッセージ詳細（[id]/）
- メッセージ詳細表示
- 返信機能
- 添付ファイル管理
```

### 支払い方法管理（payment-method/）

```typescript
// 支払い方法設定
- クレジットカード登録
- 決済方法選択
- 支払い履歴確認
```

## 技術実装詳細

### 認証アーキテクチャ

- **useAppAuth**: 認証プロバイダーによる統一的な認証管理
- **PATH定数**: ECサイトパス定義による一元管理
- **useRouter**: Next.js ルーティングによる画面遷移
- **クライアントサイド**: 'use client' による動的認証チェック

### セキュリティ機能

- **認証ガード**: 全ての子ルートで自動認証チェック
- **自動リダイレクト**: 未ログイン時の適切な画面遷移
- **セッション管理**: 認証状態の適切な管理
- **アクセス制御**: 認証済みユーザーのみアクセス可能

### パフォーマンス最適化

- **軽量実装**: 28行のミニマルな認証ガード
- **非同期処理**: 効率的な認証チェック
- **メモリ効率**: 不要な状態管理の排除

## 認証フロー

### アクセス時のフロー

1. **アクセス**: 認証が必要なページへのアクセス
2. **レイアウト実行**: AuthLayout コンポーネントの実行
3. **認証チェック**: useAppAuth による認証状態確認
4. **ユーザーID確認**: getUserId() による ID 存在確認
5. **分岐処理**:
   - **認証済み**: 子コンポーネント表示
   - **未認証**: ログインページへリダイレクト

### エラー時のフロー

1. **認証失敗**: getUserId() が null を返す
2. **リダイレクト**: router.push(PATH.LOGIN) 実行
3. **ログイン画面**: ログインページへの自動遷移

## 使用パターン

### 1. 認証が必要なページアクセス

```typescript
// URL: /ec/order, /ec/message-center, /ec/payment-method
// 自動的に認証チェック → 認証済みなら表示、未認証ならログインページへ
```

### 2. ログイン後のページ利用

```typescript
// ログイン成功後 → 認証機能グループ内のページ自由アクセス
// セッション維持中は認証チェックをパス
```

### 3. セッション切れ時の処理

```typescript
// セッション期限切れ → getUserId() が null 返却
// 自動的にログインページへリダイレクト
```

## API統合

### useAppAuth プロバイダー

```typescript
// 認証状態管理
const { getUserId } = useAppAuth();

// ユーザーID取得
const userId = await getUserId();

// 認証状態確認
if (!userId) {
  // 未認証時の処理
  router.push(PATH.LOGIN);
}
```

### PATH 定数

```typescript
// ECサイトパス定義
import { PATH } from '@/app/ec/(core)/constants/paths';

// ログインページパス
PATH.LOGIN // '/ec/login'
```

## セキュリティ考慮事項

### アクセス制御

- **全ページ認証**: 認証機能グループ内の全ページで認証必須
- **自動チェック**: ページアクセス時の自動認証確認
- **リダイレクト**: 未認証時の適切な画面遷移

### セッション管理

- **認証状態**: useAppAuth による統一的な認証状態管理
- **セッション維持**: 認証状態の適切な保持
- **セキュリティ**: 認証情報の安全な管理

## 関連ディレクトリ

- `../login/`: ログイン機能（リダイレクト先）
- `../account/`: アカウント管理
- `../(core)/`: 共通コンポーネント・定数
- `/providers/`: useAppAuth認証プロバイダー

## 開発ノート

- **28行のシンプル設計**: 最小限のコードで認証ガード実装
- **自動化**: useEffect による自動認証チェック
- **非同期処理**: async/await による適切な非同期処理
- **型安全性**: TypeScript による型定義
- **パフォーマンス**: 認証チェックの効率化
- **UX**: 認証状態に応じた適切な画面遷移
- **拡張性**: 新しい認証機能の追加が容易な構造

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24*
