# packages/web-app/src/CLAUDE.md

## 🎯 目的・役割

MycaLinks POSシステムのフロントエンド実装の中核ディレクトリ。Next.js 14 App Routerを基盤に、小売店舗向けPOS機能、在庫管理、EC統合、顧客管理などの包括的な業務システムUIを提供。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14.2.3 (App Router)
- **UIライブラリ**: Material-UI (MUI) v5.16.6
- **フォーム管理**: React Hook Form v7.55.0 + Zod
- **認証**: NextAuth v4.24.7
- **スタイリング**: Emotion (CSS-in-JS)
- **データグリッド**: MUI X Data Grid
- **バーコード/QR**: jsbarcode, qrcode.react, @zxing
- **依存関係**: TypeScript 5.6.2, React 18.3.1

## 📁 ディレクトリ構造

```
src/
├── app/                    # Next.js App Router (ページ・API)
│   ├── auth/              # 認証後エリア
│   ├── ec/                # ECストアフロント
│   ├── guest/             # ゲストアクセス
│   └── api/               # APIルート
├── api/                    # APIクライアント層
│   ├── backendApi/        # バックエンドAPI統合
│   └── frontendApi/       # フロントエンドAPI定義
├── components/             # 共通UIコンポーネント
│   ├── buttons/           # ボタンコンポーネント
│   ├── cards/             # カードコンポーネント
│   ├── forms/             # フォーム部品
│   └── tables/            # テーブルコンポーネント
├── contexts/              # React Context定義
├── feature/               # ドメイン別機能実装
│   ├── transaction/       # 取引関連
│   ├── item/              # 商品関連
│   ├── customer/          # 顧客関連
│   └── register/          # レジスター関連
├── hooks/                 # カスタムフック
├── providers/             # アプリケーションプロバイダー
├── theme/                 # MUIテーマ設定
├── types/                 # TypeScript型定義
├── utils/                 # ユーティリティ関数
└── middleware.ts          # Next.jsミドルウェア
```

## 🔧 主要機能

### POS機能
- **販売処理**: 商品販売、複数決済方法対応
- **買取処理**: 査定、買取、仕入処理
- **在庫管理**: 在庫移動、棚卸し、ロス管理
- **レジ管理**: 開局/閉局、現金管理

### EC統合
- **注文管理**: EC注文の確認・処理
- **商品連携**: EC商品の在庫同期
- **外部EC**: おちゃのこネット連携

### 顧客管理
- **顧客情報**: プロファイル、購入履歴
- **ポイント**: ポイント付与・利用
- **予約管理**: 商品予約システム

### ハードウェア連携
- **プリンター**: EPSON (レシート)、Brother (ラベル)
- **バーコード**: スキャナー統合
- **決済端末**: Square端末連携

## 💡 使用パターン

### 認証フロー
```typescript
// 1. ログイン → 2. モード選択 → 3. 店舗/レジ選択
/login → /auth/setup/mode → /auth/(dashboard)/sale
```

### API呼び出し
```typescript
import { apiClient } from '@/api/client';

// 型安全なAPI呼び出し
const response = await apiClient.transaction.create({
  storeId: 1,
  items: [...],
  payment: {...}
});
```

### コンポーネント使用
```tsx
import { PrimaryButton } from '@/components/buttons';
import { DataTable } from '@/components/tables';
import { useAlert } from '@/contexts/AlertContext';

// アラート表示
const { showAlert } = useAlert();
showAlert('success', '処理が完了しました');
```

## 🔗 関連ディレクトリ

- [App Router構造](./app/CLAUDE.md)
- [Feature実装](./feature/CLAUDE.md)
- [APIクライアント](./api/CLAUDE.md)
- [共通コンポーネント](./components/CLAUDE.md)
- [カスタムフック](./hooks/CLAUDE.md)

## 📝 開発メモ

### ベストプラクティス
- **型安全性**: 全てのAPIレスポンスに型定義必須
- **エラーハンドリング**: try-catchとAlertContext併用
- **パフォーマンス**: React.memo、useMemoで最適化
- **アクセシビリティ**: MUIのa11y機能活用

### 注意事項
- **認証**: 全ての/auth配下ルートは認証必須
- **モード**: sales/adminモードで機能制限あり
- **マルチテナント**: Corporation → Store → Register階層
- **リアルタイム**: SSEでの更新は接続管理に注意

### 開発フロー
1. `pnpm run dev:web-app` で開発サーバー起動（port 3020）
2. 変更は即座にホットリロード
3. TypeScriptエラーは厳密にチェック
4. コミット前にlint/prettierが自動実行

---
*Frontend-Agent作成: 2025-01-24*