# packages/web-app/src/app/api/CLAUDE.md

## 🎯 目的・役割

MycaLinks POS APIエンドポイント実装層 - Next.js App Routerを使用したRESTful API実装。認証・権限管理、トランザクション制御、リアルタイム通信（SSE）を統合的に提供。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 (App Router)
- **ORM**: Prisma（backend-core経由）
- **データベース**: MySQL + Redis
- **主要技術**: 
  - NextAuth.js（認証）
  - Server-Sent Events（リアルタイム）
  - Zod（バリデーション）
  - multipart/form-data（ファイルアップロード）
- **依存関係**: 
  - @mycalinks/backend-core
  - @mycalinks/common
  - api-generator（型定義）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/api/
├── auth/                    # 認証関連
│   └── [...nextauth]/       # NextAuth.js統合
├── account/                 # アカウント管理
├── corporation/             # 法人管理
├── contract/                # 契約・支払い
├── launch/                  # ログイン初期化
├── system/                  # システム管理
│   ├── health-check/        # ヘルスチェック
│   └── docs/                # APIドキュメント
├── ec/                      # ECサイト公開API
├── store/                   # 店舗管理
│   ├── route.ts             # 店舗CRUD
│   ├── activate/            # アカウント有効化
│   ├── all/                 # 全店舗集約API
│   └── [store_id]/          # 店舗別API（26+ドメイン）
│       ├── appraisal/       # 査定
│       ├── customer/        # 顧客管理
│       ├── ec/              # EC管理
│       ├── inventory/       # 棚卸
│       ├── item/            # 商品マスタ（840行・最重要）
│       ├── loss/            # ロス管理
│       ├── memo/            # メモ
│       ├── product/         # 在庫管理
│       ├── purchase-table/  # 買取テーブル
│       ├── register/        # レジ管理
│       ├── reservation/     # 予約管理
│       ├── sale/            # 売上管理
│       ├── stats/           # 統計
│       ├── status/          # ステータス
│       ├── stocking/        # 入荷管理
│       ├── template/        # テンプレート
│       ├── transaction/     # 取引管理
│       └── functions/       # 特殊機能
├── square/                  # Square決済
├── shopify/                 # Shopify連携
├── ochanoko/                # おちゃのこ連携
├── gmo/                     # GMO決済
└── opengraph/               # OGP生成
```

## 📡 API仕様

### エンドポイント構造
```typescript
// Next.js App Router形式
export async function GET(req: NextRequest, params: { store_id: string }) {
  const API = await BackendAPI.setUp(req, params, {
    privileges: {
      role: [apiRole.pos],      // 必要なロール
      policies: ['view_item']   // 必要な権限
    }
  });
  
  // ビジネスロジック実行
  const result = await API.service.getItems();
  
  // レスポンス
  return API.status(200).response({ data: result });
}
```

### 認証・権限
- **ロール**: pos, everyone, bot, mycaUser, admin
- **ポリシー**: 122種類の細かい権限制御
- **store_id**: マルチテナント分離

### エラーハンドリング
```typescript
// 定義済みエラー
throw new ApiError('permission');
throw new ApiError('notFound');

// カスタムエラー
throw new ApiError({
  status: 400,
  messageText: 'カスタムエラー'
});
```

## 🔧 主要機能

### BackendAPIクラス
- リクエスト解析・バリデーション
- 認証・権限チェック
- トランザクション管理
- レスポンス生成
- エラーハンドリング

### Server-Sent Events（SSE）
```typescript
// リアルタイム通信
export async function GET(req: NextRequest) {
  return API.sse((send) => {
    // イベント購読
    const unsubscribe = subscribe((data) => {
      send({ event: 'update', data });
    });
    
    return () => unsubscribe();
  });
}
```

### ファイルアップロード
```typescript
// multipart/form-data処理
const formData = await req.formData();
const file = formData.get('file') as File;
await API.service.uploadFile(file);
```

### キャッシュ制御
```typescript
// Redisキャッシュ
const cached = await API.cache.get(key);
if (cached) return API.response(cached);

const result = await heavyOperation();
await API.cache.set(key, result, ttl);
```

## 💡 使用パターン

### 基本的なCRUD
```typescript
// GET: 一覧取得
export async function GET(req: NextRequest) {
  const API = await BackendAPI.setUp(req, params);
  const items = await API.service.getItems(API.query);
  return API.response({ data: items });
}

// POST: 作成
export async function POST(req: NextRequest) {
  const API = await BackendAPI.setUp(req, params);
  const data = await API.getBody();
  const item = await API.transaction(async (tx) => {
    return await API.service.createItem(data, tx);
  });
  return API.status(201).response({ data: item });
}
```

### トランザクション処理
```typescript
const txRes = await API.transaction(async (tx) => {
  // 複数の操作をトランザクション内で実行
  const product = await productService.create(data, tx);
  await stockService.update(product.id, quantity, tx);
  await logService.record('CREATED', product.id, tx);
  return product;
});
```

### リアルタイムAPI
```typescript
// SSEでリアルタイム更新を配信
export async function GET(req: NextRequest) {
  const API = await BackendAPI.setUp(req, params);
  
  return API.sse(async (send) => {
    const unsubscribe = ApiEvent.subscribe('PRODUCT_UPDATED', (data) => {
      if (data.store_id === API.store_id) {
        send({ event: 'update', data: data.payload });
      }
    });
    
    return () => unsubscribe();
  });
}
```

## 🗄️ データベース設計

APIレイヤーでは直接DBアクセスせず、backend-coreのサービス層を使用：
- Prismaクライアントはbackend-core内に隔離
- トランザクション境界の明確化
- マルチテナントアクセス制御

## 🔗 関連ディレクトリ

- [バックエンドコア](../../../backend-core/)
- [API定義](../../../api-generator/)
- [フロントエンド](../../)
- [認証設定](../../../utils/auth/)

## 📝 開発メモ

### パフォーマンス考慮事項
- 適切なキャッシュ戦略（商品マスタ等）
- N+1問題の回避（include指定）
- ページネーション必須（大量データ）
- SSEの接続数管理

### セキュリティ注意点
- store_idによる厳密なデータ分離
- 権限チェックの徹底
- 入力バリデーション（Zod）
- SQLインジェクション対策（Prisma）
- CORS設定の適切な管理

### ベストプラクティス
- エンドポイントごとに必要な権限を明示
- エラーハンドリングの統一
- トランザクション境界の明確化
- レスポンス形式の統一
- API定義との同期

### 注意事項
- 新規API追加時はapi-generatorに定義追加
- 破壊的変更は避ける（バージョニング検討）
- 本番環境ではrate limiting有効
- ファイルアップロードサイズ制限
- SSE接続のタイムアウト管理

---
*Backend-Agent作成: 2025-01-24*