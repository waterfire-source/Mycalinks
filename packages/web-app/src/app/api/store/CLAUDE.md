# packages/web-app/src/app/api/store/CLAUDE.md

## 🎯 目的・役割

店舗別API統括ディレクトリ - マルチテナント対応の店舗スコープAPI群。店舗運営に必要な全ての業務機能（販売・買取・在庫・顧客管理・EC連携）を店舗ID別に分離して提供。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 (App Router)
- **ORM**: Prisma（backend-core経由）
- **データベース**: MySQL + Redis（店舗別データ分離）
- **主要技術**: 
  - マルチテナント設計（store_id分離）
  - Server-Sent Events（リアルタイム）
  - トランザクション制御
  - ロールベースアクセス制御
- **依存関係**: 
  - @mycalinks/backend-core
  - @mycalinks/api-generator
  - NextAuth.js（認証）

## 📁 ディレクトリ構造

```
packages/web-app/src/app/api/store/
├── route.ts                     # 店舗CRUD操作
├── activate/                    # 店舗アクティベーション
├── all/                         # 法人全体API
│   ├── app-advertisement/       # 全店舗広告管理
│   ├── customer/               # 横断顧客操作
│   ├── item/                   # 全店舗商品操作
│   ├── myca-item/              # Mycaアイテム検索
│   └── transaction/            # 横断取引操作
└── [store_id]/                 # 店舗別API（24ドメイン）
    ├── app-advertisement/      # アプリ広告
    ├── appraisal/             # 査定機能
    ├── cheat/                 # 開発用ユーティリティ
    ├── customer/              # 顧客管理・ポイント
    ├── ec/                    # EC連携
    ├── functions/             # ユーティリティ機能
    ├── inventory/             # 棚卸管理
    ├── item/                  # 商品マスタ ⭐（最重要・839行）
    ├── loss/                  # ロス管理
    ├── memo/                  # メモ機能
    ├── myca-item/             # Mycaアイテム連携
    ├── product/               # 在庫管理
    ├── purchase-table/        # 買取テーブル
    ├── register/              # レジ・現金管理
    ├── reservation/           # 予約管理
    ├── sale/                  # 売上・セール管理
    ├── stats/                 # 統計・分析
    ├── status/                # 店舗ステータス
    ├── stocking/              # 入荷・仕入先管理
    ├── subscribe-event/       # リアルタイム通信
    ├── template/              # テンプレート管理
    ├── test/                  # 開発テスト
    └── transaction/           # 取引管理
```

## 📡 API仕様

### 共通アクセスパターン
```typescript
// 店舗別API認証
const API = await BackendAPI.setUp(req, params, {
  privileges: {
    role: [apiRole.pos],    // 必要なロール
    policies: []            // 必要な権限
  }
});

// store_idによるデータ分離
const { store_id } = API.params;
const results = await API.service.getByStore(store_id);
```

### アクセス制御
- **pos役割**: 店舗スタッフ・管理者
- **corp役割**: 法人管理者
- **store_id分離**: 他店舗データへのアクセス禁止

## 🔧 主要機能

### 基幹業務API群

#### 1. **item** - 商品マスタ管理（最重要・839行）
- 商品検索（20+パラメータ対応）
- カテゴリ・ジャンル階層管理
- バンドル商品作成
- CSV一括操作
- 市場価格調整
- EC公開可否判定

#### 2. **transaction** - 取引管理
- 販売・買取・返品処理
- 決済連携（GMO・Square）
- 割引・ポイント適用
- レシート・領収書発行

#### 3. **product** - 在庫管理
- 在庫追加・更新・削除
- 在庫履歴管理
- コンディション管理
- タグ付け・価格設定

#### 4. **customer** - 顧客管理
- 顧客登録・更新
- ポイント履歴管理
- 購入履歴
- 予約管理

### 運営支援API群

#### 5. **register** - レジ管理
- 現金精算
- シフト管理
- 釣り銭計算
- 売上締め処理

#### 6. **inventory** - 棚卸管理
- 定期棚卸実行
- 在庫差異管理
- 棚割り設定

#### 7. **stocking** - 入荷管理
- 仕入先管理
- 入荷予定・実績
- 発注処理

### EC・外部連携API群

#### 8. **ec** - EC統合
- オンライン注文管理
- 在庫同期
- 配送管理

#### 9. **myca-item** - Mycaアイテム連携
- 外部商品データ取得
- 価格・在庫同期

### 分析・管理API群

#### 10. **stats** - 統計分析
- 売上分析（DWHベース）
- 在庫分析
- 顧客分析

#### 11. **appraisal** - 査定機能
- 商品査定価格算出
- 査定履歴管理

## 💡 使用パターン

### 店舗別データアクセス
```typescript
// GET /api/store/123/item
export async function GET(req: NextRequest, { params }: { params: { store_id: string } }) {
  const API = await BackendAPI.setUp(req, params, {
    privileges: { role: [apiRole.pos] }
  });
  
  const items = await API.service.getItemsByStore(API.store_id, API.query);
  return API.response({ data: items });
}
```

### 複雑検索（itemAPI例）
```typescript
// 20+パラメータによる商品検索
const searchParams = {
  category_id: number,
  genre_id: number,
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK',
  ec_publishable: boolean,
  tablet_genre_allowed: boolean,
  bundle_flag: boolean,
  price_min: number,
  price_max: number,
  // ...他16パラメータ
};
```

### リアルタイム通信
```typescript
// GET /api/store/123/subscribe-event
export async function GET(req: NextRequest) {
  const API = await BackendAPI.setUp(req, params);
  
  return API.sse(async (send) => {
    const unsubscribe = ApiEvent.subscribe('STORE_UPDATE', (data) => {
      if (data.store_id === API.store_id) {
        send({ event: 'update', data: data.payload });
      }
    });
    
    return () => unsubscribe();
  });
}
```

### トランザクション処理
```typescript
// 販売取引処理
const txResult = await API.transaction(async (tx) => {
  // 在庫減算
  await productService.updateStock(items, tx);
  // 取引記録
  const transaction = await transactionService.create(data, tx);
  // ポイント付与
  await customerService.addPoints(customer_id, points, tx);
  
  return transaction;
});
```

## 🗄️ データベース設計

全てのテーブルにstore_idによるマルチテナント分離：
- 店舗間のデータ完全分離
- 法人→店舗→データの階層構造
- Row Level Securityによるアクセス制御

## 🔗 関連ディレクトリ

- [APIルート](../)
- [バックエンドサービス](../../../../backend-core/src/services/)
- [API定義](../../../../api-generator/)
- [フロントエンド店舗管理](../../(business)/store/)

## 📝 開発メモ

### パフォーマンス考慮事項
- itemAPI（839行）は最適化必須
- 複雑検索のインデックス設計
- 大量データのページネーション
- Redisキャッシュの活用

### セキュリティ注意点
- store_idの厳密な検証
- 店舗間データアクセス禁止
- 権限レベルの適切な設定
- 機密データのマスキング

### ベストプラクティス
- 各APIでstore_id検証必須
- 共通処理のサービス層への集約
- エラーハンドリングの統一
- リアルタイム更新の適切な使用

### 注意事項
- itemAPIの変更は影響大（839行・最重要）
- 店舗削除時のデータ整合性
- 大量データ操作時のタイムアウト対策
- 法人全体API（all/）との使い分け

---
*Backend-Agent作成: 2025-01-24*