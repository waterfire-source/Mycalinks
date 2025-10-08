# packages/api-generator/CLAUDE.md

## 🎯 目的・役割

API定義からOpenAPI仕様書とTypeScriptクライアントを自動生成するツール。Zodスキーマベースの型安全なAPI定義管理により、フロントエンド・バックエンド間の契約を保証し、開発効率を向上させる。

## 🏗️ 技術構成

- **フレームワーク**: Node.js + TypeScript
- **ORM**: Prisma型連携（zod-prisma-types経由）
- **データベース**: なし（定義ツール）
- **主要技術**: 
  - Zod → OpenAPI変換
  - OpenAPI → TypeScriptクライアント生成
  - 型安全なAPI定義
  - 自動バリデーション
- **依存関係**: 
  - @asteasolutions/zod-to-openapi（OpenAPI生成）
  - openapi-typescript-codegen（クライアント生成）
  - backend-core、common（内部パッケージ）

## 📁 ディレクトリ構造

```
packages/api-generator/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── defs/                 # API定義（26ドメイン）
│   │   ├── account/def.ts    # アカウント・権限API
│   │   ├── customer/def.ts   # 顧客管理API
│   │   ├── ec/def.ts         # EC機能API
│   │   ├── item/def.ts       # 商品マスタAPI
│   │   ├── product/def.ts    # 在庫管理API
│   │   ├── transaction/def.ts # 取引API
│   │   ├── store/def.ts      # 店舗管理API
│   │   ├── common/           # 共通定義
│   │   │   ├── model.ts      # 共通モデル
│   │   │   └── README.md     
│   │   └── ... (19 more domains)
│   ├── generator/            # 生成エンジン
│   │   ├── main.ts           # OpenAPI生成
│   │   ├── client.ts         # TSクライアント生成
│   │   ├── constant.ts       # グローバル設定
│   │   └── util.ts           # 共通ユーティリティ
│   ├── types/                # 型定義
│   │   └── main.ts           # API定義型
│   └── generated/            # 生成物
│       └── openapi.json      # OpenAPI仕様書
└── client/                   # TSクライアント（生成物）
    └── .gitkeep
```

## 📡 API仕様

### API定義構造（BackendApiDef型）
```typescript
{
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  tag: string,
  role: "pos" | "everyone" | "bot" | "mycaUser" | "admin",
  policies?: string[],    // 必要な権限
  summary: string,
  description?: string,
  params?: ZodSchema,     // パスパラメータ
  query?: ZodSchema,      // クエリパラメータ
  body?: ZodSchema,       // リクエストボディ
  response: ZodSchema,    // レスポンス
  responses?: {           // その他のレスポンス
    [statusCode: string]: {
      description: string,
      schema: ZodSchema
    }
  }
}
```

### 26の管理ドメイン
1. **account** - アカウント・権限・ロール管理
2. **advertisement** - 広告管理
3. **appraisal** - 査定機能
4. **contract** - 契約管理
5. **corporation** - 法人管理
6. **customer** - 顧客・ポイント管理
7. **ec** - ECサイト機能
8. **inventory** - 棚卸管理
9. **item** - 商品マスタ管理
10. **launch** - アプリ起動管理
11. **memo** - メモ機能
12. **myca-item** - Mycaアイテム管理
13. **ochanoko** - おちゃのこネット連携
14. **product** - 在庫管理
15. **purchase-table** - 買取テーブル管理
16. **register** - レジ管理
17. **reservation** - 予約管理
18. **square** - Square決済連携
19. **stats** - 統計・分析
20. **stocking** - 入荷管理
21. **store** - 店舗管理
22. **system** - システム管理
23. **template** - テンプレート管理
24. **transaction** - 取引管理
25. **loss** - ロス管理
26. **status** - ステータス管理

## 🔧 主要機能

### API定義（defs/）
- Zodスキーマによる型安全な定義
- 各ドメインごとにファイル分割
- 共通モデルの再利用（common/model.ts）
- ロールベースアクセス制御
- ポリシーベース権限管理

### 生成処理（generator/）
```typescript
// OpenAPI生成
generateOpenApiDocument({
  openapi: "3.1.0",
  info: { title: "Myca Links POS API", version: "1.0.0" },
  servers: [{ url: process.env.NEXT_PUBLIC_API_URL }],
  paths: generatePaths(apiDefinitions),
  components: generateComponents(zodSchemas)
})

// TypeScriptクライアント生成
generateClient({
  input: "./openapi.json",
  output: "./client",
  httpClient: "fetch",
  useUnionTypes: true
})
```

## 💡 使用パターン

### 新規API定義の追加
```typescript
// src/defs/myDomain/def.ts
export const myApiDef: BackendApiDef = {
  method: "POST",
  path: "/api/store/{store_id}/my-resource",
  tag: "MyDomain",
  role: "pos",
  policies: ["my_domain_create"],
  summary: "リソース作成",
  params: z.object({
    store_id: z.coerce.number()
  }),
  body: MyResourceCreateSchema,
  response: MyResourceSchema
};
```

### API生成コマンド
```bash
# 完全な生成フロー
pnpm run api:generate

# 個別実行
pnpm run prisma:generate    # Prisma型生成
pnpm run build:backend-core # バックエンドビルド
pnpm run build              # API定義ビルド
pnpm run client             # クライアント生成
```

### 生成されたクライアントの使用
```typescript
import { StoreService } from '@/api/client';

// 型安全なAPI呼び出し
const products = await StoreService.getProducts({
  store_id: 1,
  page: 1,
  per_page: 20
});
```

## 🗄️ データベース設計

直接的なDB接続はないが、Prismaスキーマから生成された型を使用：
- zod-prisma-typesによる自動型生成
- データベーススキーマとAPI定義の整合性保証

## 🔗 関連ディレクトリ

- [バックエンドコア](../backend-core/)
- [共通ライブラリ](../common/)
- [APIエンドポイント実装](../web-app/src/app/api/)
- [Prismaスキーマ](../backend-core/prisma/)

## 📝 開発メモ

### パフォーマンス考慮事項
- 生成処理は開発時のみ実行
- ビルド成果物はキャッシュ活用
- 大規模API定義でも高速生成

### セキュリティ注意点
- ロールベースアクセス制御の厳格な定義
- ポリシーによる細かい権限制御
- 入力バリデーションの自動化
- 型安全性による実行時エラー防止

### ベストプラクティス
- API定義はドメインごとに分割
- 共通モデルは common/model.ts に集約
- Zodスキーマは再利用を意識
- エラーレスポンスも型定義
- OpenAPI仕様書はドキュメント兼用

### 注意事項
- API定義変更時は必ず再生成実行
- 生成物（client/）はコミット不要
- バックエンドの実装と定義の同期必須
- 破壊的変更は慎重に（バージョニング検討）

---
*Backend-Agent作成: 2025-01-24*