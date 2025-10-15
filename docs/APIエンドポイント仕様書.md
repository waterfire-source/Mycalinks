# APIエンドポイント仕様書

MycaLinks POS SystemのRESTful API仕様書です。小売店舗運営に必要な全ての業務機能を提供するAPIエンドポイントの詳細仕様を記載しています。

## 📋 基本情報

### API仕様
- **ベースURL**: `{NEXT_PUBLIC_ORIGIN}/api`
- **プロトコル**: HTTPS
- **認証方式**: JWT (NextAuth.js)
- **データ形式**: JSON
- **文字エンコーディング**: UTF-8
- **APIバージョン**: v1.0.0

### 共通ヘッダー
```http
Content-Type: application/json
Authorization: Bearer {jwt_token}
Test-User-Kind: {role}  # テスト環境のみ
```

## 🔐 認証・認可システム

### 認証方式
MycaLinks POS Systemは以下の認証方式をサポートしています：

#### 1. JWTトークン認証（本番環境）
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. テストヘッダー認証（テスト環境）
```http
Test-User-Kind: pos          # POSユーザー
Test-User-Kind: myca_user    # Mycaアプリユーザー
Test-User-Kind: bot          # Botアカウント
Test-User-Kind: admin        # 管理者
Test-User-Kind: ""           # 認証なし
```

### ユーザーロール
| ロール | 説明 | 権限レベル |
|--------|------|-----------|
| `pos` | POSシステムユーザー | 店舗運営全般 |
| `myca_user` | Mycaアプリユーザー | 顧客機能 |
| `bot` | システムBot | 自動処理 |
| `admin` | システム管理者 | 全権限 |
| `""` (空文字) | 認証なし | 公開API |

### 動作モード
| モード | 説明 | 対象ユーザー |
|--------|------|-------------|
| `admin` | 管理モード | 法人管理者・店舗管理者 |
| `sales` | 営業モード | 店舗スタッフ |

### 権限ポリシー
詳細な権限ポリシーは `common/apiPolicies` で定義されています。主要な権限：

- `create_account`: アカウント作成
- `update_store`: 店舗情報更新
- `sales_mode`: 販売モード利用
- `create_transaction_return`: 返品処理
- `assess_buy_transaction`: 買取査定
- `get_stats`: 統計情報取得

## 🏪 店舗API群

### ベースパス
```
/api/store/[store_id]/*
```

全ての店舗関連APIは店舗IDをパスパラメータに含む必要があります。

## 📦 1. 商品マスタAPI (`/item`)

商品マスタ情報の管理を行うAPIです。

### 1.1 商品マスタ一覧取得
```http
GET /api/store/{store_id}/item
```

**権限**: `pos`

**クエリパラメータ**:
```typescript
{
  display_name?: string;        // 商品名検索
  category_id?: number;         // カテゴリID
  genre_id?: number;           // ジャンルID
  department_id?: number;      // 部門ID
  rarity?: string;             // レアリティ
  cardnumber?: string;         // カード番号
  expansion?: string;          // エキスパンション
  jan_code?: string;           // JANコード
  orderBy?: string;            // ソート順
  take?: number;               // 取得件数 (default: 20)
  skip?: number;               // スキップ件数
  includesSummary?: boolean;   // 件数情報を含む
}
```

**レスポンス**:
```typescript
{
  items: Array<{
    id: number;
    display_name: string;
    image_url?: string;
    market_price?: number;
    category: {
      id: number;
      display_name: string;
    };
    genre: {
      id: number;
      display_name: string;
    };
    // ... その他フィールド
  }>;
  summary?: {
    totalCount: number;
  };
}
```

### 1.2 商品マスタ作成
```http
POST /api/store/{store_id}/item
```

**権限**: `pos` + `create_item`

**リクエストボディ**:
```typescript
{
  display_name: string;         // 商品名（必須）
  category_id: number;          // カテゴリID（必須）
  genre_id: number;            // ジャンルID（必須）
  department_id?: number;      // 部門ID
  image_url?: string;          // 商品画像URL
  market_price?: number;       // 市場価格
  jan_code?: string;           // JANコード
  rarity?: string;             // レアリティ
  cardnumber?: string;         // カード番号
  expansion?: string;          // エキスパンション
  description?: string;        // 説明
  // バンドル商品の場合
  bundle_products?: Array<{
    item_id: number;
    quantity: number;
  }>;
}
```

### 1.3 商品マスタ更新
```http
PUT /api/store/{store_id}/item/{item_id}
```

**権限**: `pos` + `update_item`

### 1.4 商品マスタ取引履歴
```http
GET /api/store/{store_id}/item/transaction
```

**権限**: `pos`

**クエリパラメータ**:
```typescript
{
  item_id?: number;                    // 商品ID
  transaction_kind?: 'sell' | 'buy';   // 取引種別
  transactionFinishedAtGte?: string;   // 取引日時（開始）
  transactionFinishedAtLt?: string;    // 取引日時（終了）
  customer_id?: number;                // 顧客ID
  includesTransactions?: boolean;      // 取引詳細を含む
  includesSummary?: boolean;          // 集計情報を含む
}
```

## 📋 2. 在庫商品API (`/product`)

販売・買取用の在庫商品管理APIです。

### 2.1 在庫商品一覧取得
```http
GET /api/store/{store_id}/product
```

**権限**: `pos` + `list_product`

**クエリパラメータ**:
```typescript
{
  display_name?: string;        // 商品名検索
  item_id?: number;            // 商品マスタID
  stock_number?: string;       // 在庫番号
  barcode?: string;            // バーコード
  category_id?: number;        // カテゴリID
  genre_id?: number;           // ジャンルID
  condition_option_id?: number; // コンディションID
  price_min?: number;          // 最低価格
  price_max?: number;          // 最高価格
  stock_min?: number;          // 最低在庫数
  stock_max?: number;          // 最高在庫数
  is_infinite_stock?: boolean; // 無限在庫フラグ
  tag_name?: string;           // タグ名
  orderBy?: ProductOrderType;  // ソート順
  take?: number;               // 取得件数
  skip?: number;               // スキップ件数
  includesSummary?: boolean;   // 集計情報を含む
}
```

**レスポンス**:
```typescript
{
  products: Array<{
    id: number;
    display_name: string;
    stock_number: string;
    sale_unit_price: number;
    stock_count: number;
    is_infinite_stock: boolean;
    image_url?: string;
    item: {
      id: number;
      display_name: string;
      category: { display_name: string };
      genre: { display_name: string };
    };
    conditions: Array<{
      condition_option: {
        display_name: string;
      };
    }>;
    tags: Array<{
      tag: { display_name: string };
    }>;
  }>;
  summary?: {
    totalCount: number;
    totalValue: number;
  };
}
```

### 2.2 在庫商品更新
```http
PUT /api/store/{store_id}/product/{product_id}
```

**権限**: `pos` + `update_product`

**リクエストボディ**:
```typescript
{
  display_name?: string;           // 表示名
  sale_unit_price?: number;        // 販売単価
  buy_unit_price?: number;         // 買取単価
  stock_count?: number;            // 在庫数
  is_infinite_stock?: boolean;     // 無限在庫フラグ
  description?: string;            // 説明
  condition_option_ids?: number[]; // コンディションID配列
  expire_at?: string;              // 有効期限
  start_at?: string;               // 販売開始日
}
```

### 2.3 在庫変動履歴取得
```http
GET /api/store/{store_id}/product/{product_id}/history
```

**権限**: `pos`

### 2.4 商品転送
```http
POST /api/store/{store_id}/product/{product_id}/transfer
```

**権限**: `pos` + `transfer_product`

**リクエストボディ**:
```typescript
{
  to_store_id: number;      // 転送先店舗ID
  quantity: number;         // 転送数量
  reason?: string;          // 転送理由
}
```

## 💰 3. 取引API (`/transaction`)

POS取引（販売・買取）の管理APIです。

### 3.1 取引作成
```http
POST /api/store/{store_id}/transaction
```

**権限**: `pos`

**リクエストボディ**:
```typescript
{
  asDraft?: boolean;                    // 下書きフラグ
  id?: number;                         // 既存取引ID（更新時）
  staff_account_id: number;            // スタッフアカウントID
  customer_id?: number;                // 顧客ID
  register_id?: number;                // レジID
  transaction_kind: 'sell' | 'buy';    // 取引種別
  total_price: number;                 // 合計金額
  subtotal_price: number;              // 小計
  tax: number;                         // 税額
  discount_price: number;              // 手動割引
  point_discount_price: number;        // ポイント割引
  payment_method: TransactionPaymentMethod; // 支払い方法
  buy__is_assessed?: boolean;          // 買取査定完了フラグ
  recieved_price?: number;             // 受取金額
  change_price?: number;               // お釣り
  id_kind?: string;                    // 身分証種別
  id_number?: string;                  // 身分証番号
  description?: string;                // 備考
  
  // カート情報
  carts: Array<{
    product_id: number;                // 商品ID
    item_count: number;                // 数量
    unit_price: number;                // 単価
    discount_price?: number;           // 商品別割引
    sale_id?: number;                  // セールID
  }>;
  
  // 顧客カート（買取時）
  customer_carts?: Array<{
    product_id: number;
    item_count: number;
    unit_price: number;
    discount_price?: number;
  }>;
}
```

**レスポンス**:
```typescript
{
  data: {
    id: number;                        // 取引ID
    status: TransactionStatus;         // 取引ステータス
    autoPrintReceiptEnabled: boolean;  // 自動レシート印刷
    reception_number?: string;         // 買取受付番号
  };
}
```

### 3.2 取引一覧取得
```http
GET /api/store/{store_id}/transaction
```

**権限**: `pos` または 認証なし（制限あり）

**クエリパラメータ**:
```typescript
{
  id?: string;                      // 取引ID（カンマ区切り）
  customer_id?: number;             // 顧客ID
  staff_account_id?: number;        // スタッフID
  register_id?: number;             // レジID
  reception_number?: number;        // 買取受付番号
  transaction_kind?: 'sell' | 'buy'; // 取引種別
  payment_method?: TransactionPaymentMethod; // 支払い方法
  status?: TransactionStatus;       // ステータス
  productName?: string;             // 商品名検索
  buy__is_assessed?: boolean;       // 査定完了フラグ
  includeSales?: boolean;           // 売上情報を含む
  includeStats?: boolean;           // 統計情報を含む
  includeSummary?: boolean;         // 集計情報を含む
  take?: number;                    // 取得件数
  skip?: number;                    // スキップ件数
  orderBy?: string;                 // ソート順
}
```

### 3.3 特定取引詳細取得
```http
GET /api/store/{store_id}/transaction/{transaction_id}
```

**権限**: `pos` または 認証なし（制限あり）

### 3.4 返品処理
```http
POST /api/store/{store_id}/transaction/{transaction_id}/return
```

**権限**: `pos` + `create_transaction_return`

**リクエストボディ**:
```typescript
{
  staff_account_id: number;         // スタッフID
  return_carts: Array<{
    transaction_cart_id: number;    // 返品対象カートID
    return_count: number;           // 返品数量
  }>;
  return_reason?: string;           // 返品理由
}
```

### 3.5 取引キャンセル
```http
POST /api/store/{store_id}/transaction/{transaction_id}/cancel
```

**権限**: `pos`

### 3.6 レシート発行
```http
GET /api/store/{store_id}/transaction/{transaction_id}/receipt
```

**権限**: `pos` または 認証なし

**クエリパラメータ**:
```typescript
{
  type?: 'receipt' | 'invoice';     // レシート種別
  format?: 'html' | 'pdf';          // 出力形式
}
```

## 👥 4. 顧客API (`/customer`)

顧客情報の管理APIです。

### 4.1 顧客登録・取得
```http
POST /api/store/{store_id}/customer
```

**権限**: `pos`

**リクエストボディ**:
```typescript
{
  email?: string;                   // メールアドレス
  phone_number?: string;            // 電話番号
  full_name?: string;               // 氏名
  birth_date?: string;              // 生年月日
  postal_code?: string;             // 郵便番号
  address?: string;                 // 住所
  memo?: string;                    // メモ
  // 検索用（既存顧客取得時）
  search_email?: string;
  search_phone_number?: string;
}
```

### 4.2 顧客一覧取得
```http
GET /api/store/{store_id}/customer
```

**権限**: `pos` + `list_customer`

**クエリパラメータ**:
```typescript
{
  full_name?: string;               // 氏名検索
  email?: string;                   // メール検索
  phone_number?: string;            // 電話番号検索
  take?: number;                    // 取得件数
  skip?: number;                    // スキップ件数
  orderBy?: string;                 // ソート順
}
```

### 4.3 付与可能ポイント取得
```http
GET /api/store/{store_id}/customer/{customer_id}/addable-point
```

**権限**: `pos`

**クエリパラメータ**:
```typescript
{
  total_price: number;              // 取引合計金額
}
```

## 🏪 5. レジAPI (`/register`)

レジ管理・精算処理のAPIです。

### 5.1 レジ情報取得
```http
GET /api/store/{store_id}/register
```

**権限**: `pos`

**レスポンス**:
```typescript
{
  registers: Array<{
    id: number;
    display_name: string;
    cash_amount: number;              // 現金残高
    theoretical_cash_amount: number;  // 理論現金残高
    auto_print_receipt_enabled: boolean; // 自動レシート印刷
    is_active: boolean;               // アクティブフラグ
  }>;
}
```

### 5.2 レジ内現金調整
```http
PUT /api/store/{store_id}/register/cash
```

**権限**: `pos` + `adjust_register_cash`

**リクエストボディ**:
```typescript
{
  register_id: number;              // レジID
  amount: number;                   // 調整金額（正負）
  reason: string;                   // 調整理由
  staff_account_id: number;         // スタッフID
}
```

### 5.3 レジ精算
```http
POST /api/store/{store_id}/register
```

**権限**: `pos` + `settlement_register`

**リクエストボディ**:
```typescript
{
  register_id: number;              // レジID
  actual_cash_amount: number;       // 実際の現金残高
  staff_account_id: number;         // スタッフID
  memo?: string;                    // 備考
}
```

## 📊 6. 統計API (`/stats`)

売上・在庫分析のAPIです。

### 6.1 取引統計（ジャンル別）
```http
GET /api/store/{store_id}/stats/transaction/by-genre
```

**権限**: `pos` + `get_stats`

**クエリパラメータ**:
```typescript
{
  start_date?: string;              // 開始日
  end_date?: string;                // 終了日
  transaction_kind?: 'sell' | 'buy'; // 取引種別
}
```

**レスポンス**:
```typescript
{
  summaryByGenres: Array<{
    genre_display_name: string;      // ジャンル名
    total_wholesale_price: number;   // 仕入れ合計
    total_price: number;             // 売上合計
    total_count: number;             // 取引件数
    total_item_count: number;        // 商品点数
  }>;
}
```

### 6.2 商品統計
```http
GET /api/store/{store_id}/stats/product
```

**権限**: `pos` + `get_stats`

## 🛒 7. EC統合API (`/ec`)

ECサイト連携のAPIです。

### 7.1 EC注文一覧
```http
GET /api/store/{store_id}/ec/order
```

**権限**: `pos`

### 7.2 EC商品同期
```http
POST /api/store/{store_id}/ec/sync
```

**権限**: `pos` + `sync_ec`

## 📦 8. 仕入れAPI (`/stocking`)

商品仕入れ管理のAPIです。

### 8.1 仕入れ登録
```http
POST /api/store/{store_id}/stocking
```

**権限**: `pos` + `create_stocking`

### 8.2 仕入れ先管理
```http
GET /api/store/{store_id}/stocking/supplier
POST /api/store/{store_id}/stocking/supplier
```

**権限**: `pos` + `list_stocking_supplier`

## 📋 9. 棚卸API (`/inventory`)

在庫棚卸しのAPIです。

### 9.1 棚卸作成
```http
POST /api/store/{store_id}/inventory
```

**権限**: `pos` + `create_inventory`

### 9.2 棚卸実行
```http
POST /api/store/{store_id}/inventory/{inventory_id}/apply
```

**権限**: `pos` + `apply_inventory`

## 🔄 10. リアルタイム更新API (`/subscribe-event`)

Server-Sent Eventsによるリアルタイム更新APIです。

### 10.1 商品更新購読
```http
GET /api/store/{store_id}/subscribe-event/product
```

**権限**: `pos`

**レスポンス**: Server-Sent Events形式

## 📄 11. CSV出力API

### 11.1 取引CSV
```http
GET /api/store/{store_id}/transaction/csv
```

### 11.2 在庫CSV
```http
GET /api/store/{store_id}/product/csv
```

### 11.3 商品マスタCSV
```http
GET /api/store/{store_id}/item/csv
```

## 🌐 全店舗共通API

### ベースパス
```
/api/store/all/*
```

Mycaアプリからアクセスする全店舗共通のAPIです。

### 全店舗取引取得
```http
GET /api/store/all/transaction
```

**権限**: `myca_user`

### 全店舗顧客一覧
```http
GET /api/store/all/customer
```

**権限**: `myca_user`

## ⚠️ エラーレスポンス

### 共通エラー形式
```typescript
{
  error: {
    code: string;                     // エラーコード
    message: string;                  // エラーメッセージ
    details?: any;                    // 詳細情報
  }
}
```

### HTTPステータスコード
| コード | 意味 | 説明 |
|--------|------|------|
| 200 | OK | 成功 |
| 201 | Created | 作成成功 |
| 400 | Bad Request | リクエストエラー |
| 401 | Unauthorized | 認証エラー |
| 403 | Forbidden | 権限不足 |
| 404 | Not Found | リソースが見つからない |
| 409 | Conflict | 競合エラー |
| 422 | Unprocessable Entity | バリデーションエラー |
| 500 | Internal Server Error | サーバーエラー |

### エラーコード一覧
| コード | 説明 | HTTPステータス |
|--------|------|---------------|
| `notEnough` | パラメータ不足 | 400 |
| `notExist` | リソースが存在しない | 404 |
| `permission` | 権限不足 | 403 |
| `validation` | バリデーションエラー | 422 |
| `conflict` | データ競合 | 409 |

## 📝 レスポンス形式

### 成功レスポンス
```typescript
{
  data: T;                          // レスポンスデータ
  meta?: {                          // メタ情報
    pagination?: {
      total: number;
      page: number;
      limit: number;
    };
    summary?: any;                  // 集計情報
  };
}
```

### ページネーション
```typescript
// クエリパラメータ
{
  take?: number;                    // 取得件数（default: 20, max: 100）
  skip?: number;                    // スキップ件数（default: 0）
}

// レスポンス
{
  data: T[];
  meta: {
    pagination: {
      total: number;                // 総件数
      page: number;                 // 現在ページ
      limit: number;                // 1ページあたり件数
      hasNext: boolean;             // 次ページ有無
    };
  };
}
```

## 🔧 開発者向け情報

### API生成器
APIの型定義は `packages/api-generator` で自動生成されています：

- **定義ファイル**: `packages/api-generator/src/defs/*/def.ts`
- **生成コマンド**: `pnpm run generate`
- **出力先**: `packages/api-generator/src/generated/`

### OpenAPI仕様書
OpenAPI 3.1形式の仕様書が自動生成されます：
- **ファイル**: `packages/api-generator/src/generated/openapi.json`
- **アクセス**: `{NEXT_PUBLIC_ORIGIN}/api/docs`

### APIクライアント
型安全なAPIクライアント（`MycaPosApiClient`）が自動生成されます：
```typescript
import { MycaPosApiClient } from 'api-generator';

const client = new MycaPosApiClient({
  baseURL: process.env.NEXT_PUBLIC_ORIGIN + '/api',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// 型安全なAPI呼び出し
const products = await client.product.list({
  store_id: 1,
  take: 20,
});
```

### テスト用固定データ
テスト環境では以下の固定データが使用されます：
```typescript
// packages/web-app/src/api/backendApi/test/constant.ts
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

## 📚 関連ドキュメント

- [API統合テスト環境セットアップガイド](./API統合テスト環境セットアップガイド.md)
- [API自動統合テスト開発ガイド](./API自動統合テスト開発ガイド.md)
- [テストケーステンプレート集](./テストケーステンプレート集.md)
- [テスト実行・監視ガイド](./テスト実行・監視ガイド.md)

## 🔄 更新履歴

- **v1.0.0** (2025-01-24): 初版作成
  - 全APIエンドポイントの仕様策定
  - 認証・認可システムの詳細化
  - エラーハンドリングの標準化

---

*この仕様書は MycaLinks POS System の実装に基づいて作成されています。最新の実装状況については、実際のコードを参照してください。* 