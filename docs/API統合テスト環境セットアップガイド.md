# API統合テスト環境セットアップガイド

MycaLinks POS SystemのAPI自動統合テストを実行するための**シンプルな**環境セットアップ手順書です。

## 📋 前提条件

### 必要なソフトウェア
| ソフトウェア | バージョン | 用途 |
|-------------|-----------|------|
| Node.js | 23.9.0 | 実行環境 |
| pnpm | 最新版 | パッケージ管理 |
| Git | 最新版 | ソースコード管理 |

**注意**: DockerやMySQLの個別インストールは不要です。

## 🚀 1. 基本環境セットアップ（3ステップ）

### 1.1 リポジトリのクローンと依存関係インストール
```bash
git clone <repository-url>
cd pos
pnpm install
```

### 1.2 プロジェクトビルド
```bash
pnpm run build
```

### 1.3 開発サーバー起動
```bash
cd packages/web-app
pnpm run dev
```

**これで環境構築完了です！**

## 🧪 2. テスト実行

### 2.1 基本テスト実行
```bash
# 新しいターミナルで実行
cd packages/web-app
pnpm run test:integ:api:internal
```

### 2.2 個別テスト実行
```bash
# 特定のテストファイルのみ実行
pnpm run test:integ:api:internal -- src/app/api/store/[store_id]/product/route.test.ts

# 特定のパターンでテスト実行
pnpm run test:integ:api:internal -- --grep "商品"
```

## 📊 3. テスト結果の確認

### 正常実行の例
```
✓ packages/web-app/src/app/api/store/[store_id]/product/route.test.ts
✓ packages/web-app/src/app/api/store/[store_id]/customer/route.test.ts

Test Files  2 passed (2)
Tests  8 passed (8)
```

### 現在のテスト状況
- **総テストファイル数**: 59個
- **総テストケース数**: 135個
- **実装済みAPIエンドポイント**: 主要なPOS機能をカバー

## 🔧 4. 既存のテスト仕組み

### 4.1 認証方式
現在のテストは`Test-User-Kind`ヘッダーによるシンプルな認証を使用：

```typescript
// テストでの認証指定例
BackendApiTest.define({
  as: apiRole.pos,  // POSユーザーとして実行
}, async (fetch) => {
  // テストロジック
});
```

**利用可能なロール**:
- `pos`: POSシステムユーザー
- `myca_user`: Mycaアプリユーザー
- `admin`: 管理者
- `""`: 認証なし

### 4.2 テスト用固定データ
テストでは以下の固定IDを使用：

```typescript
export const apiTestConstant = {
  storeMock: { id: 3 },
  productMock: { id: 561417 },
  itemMock: { id: 97360 },
  corporationMock: { id: 2 },
  customerMock: { id: 53 },
  userMock: {
    posMaster: {
      token: {
        id: 4,
        role: 'pos',
        corporation_id: 2,
        email: 'test@sophiate.co.jp',
      },
    },
  },
};
```

### 4.3 テストファイルの場所
```
packages/web-app/src/app/api/
├── account/route.test.ts
├── corporation/route.test.ts
├── store/[store_id]/
│   ├── product/route.test.ts
│   ├── customer/route.test.ts
│   ├── transaction/route.test.ts
│   └── ec/route.test.ts
└── ... (その他59個のテストファイル)
```

## 🔍 5. トラブルシューティング

### よくある問題と解決策

#### テストが500エラーで失敗する
**原因**: 開発サーバーが起動していない
**解決策**:
```bash
# 開発サーバーが起動しているか確認
cd packages/web-app
pnpm run dev  # http://localhost:3020 でアクセス可能になる
```

#### 「コマンドが見つからない」エラー
**原因**: 依存関係がインストールされていない
**解決策**:
```bash
cd pos
pnpm install
pnpm run build
```

#### テストが見つからない
**原因**: ファイルパスが間違っている
**解決策**:
```bash
# 利用可能なテストファイルを確認
find src/app/api -name "*.test.ts"
```

## 📚 6. 主要コマンド一覧

```bash
# 開発サーバー起動
pnpm run dev

# 全API統合テスト実行
pnpm run test:integ:api:internal

# 負荷テスト（高度な用途）
pnpm run test:load:api

# E2Eテスト（高度な用途）
pnpm run test:e2e

# リント実行
pnpm run lint

# フォーマット実行
pnpm run format
```

## ✅ 7. セットアップ完了チェックリスト

- [ ] Node.js 23.9.0がインストール済み
- [ ] pnpmがインストール済み
- [ ] リポジトリをクローン済み
- [ ] `pnpm install`実行済み
- [ ] `pnpm run build`実行済み
- [ ] `pnpm run dev`で開発サーバーが起動する
- [ ] `pnpm run test:integ:api:internal`が実行できる

## 🎯 8. 次のステップ

環境構築が完了したら、以下のドキュメントを参照してテストを拡張できます：

- [API自動統合テスト開発ガイド](./API自動統合テスト開発ガイド.md) - テスト追加方法
- [テストケーステンプレート集](./テストケーステンプレート集.md) - 実用的なテンプレート
- [テスト実行・監視ガイド](./テスト実行・監視ガイド.md) - テスト運用方法
- [APIエンドポイント仕様書](./APIエンドポイント仕様書.md) - API仕様の詳細

---

**重要**: このガイドは実際の既存実装に基づいています。Dockerやデータベースの個別セットアップは不要で、既存の開発環境をそのまま活用できます。 