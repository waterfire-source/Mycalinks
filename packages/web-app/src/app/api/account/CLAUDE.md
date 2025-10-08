# Account API

## 概要
アカウント管理のためのREST API。ユーザーアカウントの作成、取得、更新、削除、および権限グループの管理を提供する。

## エンドポイント一覧

### アカウント管理
- `GET /api/account/` - アカウント一覧取得
- `GET /api/account/[account_id]/` - アカウント詳細取得
- `PUT /api/account/[account_id]/` - アカウント更新
- `DELETE /api/account/[account_id]/` - アカウント削除

### アカウントグループ管理
- `GET /api/account/group/` - グループ一覧取得
- `POST /api/account/group/` - グループ作成・更新
- `GET /api/account/group/[account_group_id]/` - グループ詳細取得
- `PUT /api/account/group/[account_group_id]/` - グループ更新
- `DELETE /api/account/group/[account_group_id]/` - グループ削除

## API詳細

### アカウント一覧取得
```typescript
GET /api/account/
```

**権限**: corp, store

**クエリパラメータ**:
- `id`: アカウントIDでフィルタ
- `account_kind`: アカウント種別でフィルタ
- `include_corporation`: 法人情報を含める
- `include_employee`: 従業員情報を含める
- `include_stores`: 店舗情報を含める

**レスポンス**:
```typescript
{
  accounts: Array<{
    id: number;
    code: string;
    name: string;
    email: string;
    accountGroups: AccountGroup[];
    stores: Store[];
    corporation?: Corporation;
    employee?: Employee;
  }>
}
```

### アカウント更新
```typescript
PUT /api/account/[account_id]/
```

**権限**: corp, store

**リクエストボディ**:
```typescript
{
  password?: string;           // 新しいパスワード
  current_password?: string;   // 現在のパスワード（パスワード変更時必須）
  display_name?: string;       // 表示名
  email?: string;             // メールアドレス
  account_groups?: number[];   // 所属グループID配列
}
```

**セキュリティ**:
- パスワード変更時は現在のパスワードによる認証が必須
- 自身より上位の権限を持つアカウントは更新不可

### アカウントグループ作成・更新
```typescript
POST /api/account/group/
```

**権限**: pos

**リクエストボディ**:
```typescript
{
  id?: number;                // 更新時は指定
  display_name: string;       // グループ名（新規作成時必須）
  
  // 権限設定（全て必須）
  create_account: boolean;
  update_corporation: boolean;
  admin_mode: boolean;
  update_store: boolean;
  sales_mode: boolean;
  update_store_setting: boolean;
  get_transaction_customer_info: boolean;
  set_transaction_manual_discount: boolean;
  create_transaction_return: boolean;
  create_buy_reception: boolean;
  assess_buy_transaction: boolean;
  finish_buy_transaction: boolean;
  set_buy_transaction_manual_product_price: boolean;
  list_item: boolean;
  list_product: boolean;
  list_inventory: boolean;
  list_stocking_supplier: boolean;
  list_stocking: boolean;
  list_cash_history: boolean;
  list_transaction: boolean;
  list_customer: boolean;
  get_stats: boolean;
  // ... その他多数の権限フラグ
}
```

## 権限ポリシー

### 権限フラグ一覧
- **アカウント管理**
  - `create_account`: アカウント作成
  - `update_account`: アカウント更新
  - `delete_account`: アカウント削除

- **店舗管理**
  - `update_store`: 店舗情報更新
  - `update_store_setting`: 店舗設定更新

- **販売管理**
  - `sales_mode`: 販売モード利用
  - `set_transaction_manual_discount`: 手動割引設定
  - `create_transaction_return`: 返品処理

- **買取管理**
  - `create_buy_reception`: 買取受付
  - `assess_buy_transaction`: 買取査定
  - `finish_buy_transaction`: 買取完了
  - `set_buy_transaction_manual_product_price`: 買取価格手動設定

- **在庫管理**
  - `list_item`: 商品一覧表示
  - `list_product`: 在庫一覧表示
  - `list_inventory`: 棚卸一覧表示

- **その他**
  - `admin_mode`: 管理者モード
  - `get_transaction_customer_info`: 取引顧客情報取得
  - `get_stats`: 統計情報取得

### 権限の継承
- 自身が持っていない権限を他のグループに付与することはできない
- 権限グループは階層構造を持ち、上位グループの権限を継承する

## エラーハンドリング

### 共通エラーコード
- `400`: リクエストパラメータ不正
- `401`: 認証エラー
- `403`: 権限不足
- `404`: リソースが見つからない
- `409`: 競合（重複など）
- `500`: サーバーエラー

### エラーレスポンス形式
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

## バリデーション

### パスワード要件
- 最小8文字
- 大文字・小文字・数字を含む
- 特殊文字推奨

### メールアドレス
- RFC準拠の形式
- 重複チェック
- ドメイン存在確認（オプション）

### アカウントコード
- 自動生成（6桁数字）
- 一意性保証
- 再発行可能

## セキュリティ考慮事項

### 認証・認可
- JWTトークンベース認証
- ロールベースアクセス制御
- APIレート制限

### データ保護
- パスワードのハッシュ化（bcrypt）
- 個人情報の暗号化
- 通信の暗号化（HTTPS必須）

### 監査
- 全APIアクセスのログ記録
- 権限変更の追跡
- 異常アクセスの検知

## 使用例

### アカウント作成フロー
```typescript
// 1. アカウントグループ作成
const group = await fetch('/api/account/group', {
  method: 'POST',
  body: JSON.stringify({
    display_name: '店舗スタッフ',
    sales_mode: true,
    list_product: true,
    // ... 他の権限設定
  })
});

// 2. アカウント作成（別システムで実行）
const account = await createAccount({
  name: '山田太郎',
  email: 'yamada@example.com',
  account_groups: [group.id]
});
```

### 権限チェック例
```typescript
// 現在のユーザーの権限確認
const me = await fetch('/api/account/me');
const canCreateTransaction = me.accountGroups.some(
  group => group.sales_mode
);
```

## 関連API

- [認証API](/auth/CLAUDE.md)
- [店舗API](/store/CLAUDE.md)
- [法人API](/corporation/CLAUDE.md)
- [権限API](/authority/CLAUDE.md)