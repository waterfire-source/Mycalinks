# Corporation API

## 概要
法人情報管理のためのREST API。法人の基本情報、古物商情報、税務設定、価格設定ルールなどを管理する。

## エンドポイント一覧

- `GET /api/corporation/` - 法人情報取得
- `POST /api/corporation/` - 法人作成
- `PUT /api/corporation/[corporation_id]/` - 法人情報更新

## API詳細

### 法人情報取得
```typescript
GET /api/corporation/
```

**権限**: pos（法人アカウント）

**レスポンス**:
```typescript
{
  corporation: {
    id: number;                           // 法人ID
    name: string;                         // 法人名
    ceo_name: string;                     // 代表者名
    head_office_address: string;          // 本社住所
    phone_number: string;                 // 電話番号
    kobutsusho_koan_iinkai: string;      // 古物商公安委員会名
    kobutsusho_number: string;            // 古物商許可番号
    invoice_number: string;               // インボイス番号
    zip_code: string;                     // 郵便番号
    square_available: boolean;            // Square連携済みフラグ
    
    // デフォルト設定
    tax_mode: 'include' | 'exclude';      // 税込/税抜モード
    price_adjustment_round_rule: string;  // 価格調整ルール
    price_adjustment_round_rank: number;  // 丸め桁数
    use_wholesale_price_order_column: string;  // 卸売価格使用順序
    use_wholesale_price_order_rule: string;    // 卸売価格順序ルール
    wholesale_price_keep_rule: string;         // 卸売価格保持ルール
  }
}
```

### 法人作成
```typescript
POST /api/corporation/
```

**権限**: pos（ID:1またはステージング環境の法人アカウントのみ）

**リクエストボディ**:
```typescript
{
  email: string;  // 法人代表メールアドレス（必須）
}
```

**レスポンス**:
```typescript
{
  account: {
    id: number;
    email: string;
    // ... その他アカウント情報
    corporation: {
      id: number;
      // ... 法人情報
    }
  }
}
```

**制限事項**:
- システム管理者またはステージング環境でのみ実行可能
- 新規法人作成時は代表アカウントも同時に作成される

### 法人情報更新
```typescript
PUT /api/corporation/[corporation_id]/
```

**権限**: corp（法人アカウント）

**リクエストボディ**:
```typescript
{
  name?: string;                    // 法人名
  ceo_name?: string;               // 代表者名
  head_office_address?: string;    // 本社住所
  phone_number?: string;           // 電話番号
  kobutsusho_koan_iinkai?: string; // 古物商公安委員会名
  kobutsusho_number?: string;      // 古物商許可番号
  invoice_number?: string;         // インボイス番号
  zip_code?: string;              // 郵便番号
  
  // デフォルト設定
  tax_mode?: 'include' | 'exclude';
  price_adjustment_round_rule?: string;
  price_adjustment_round_rank?: number;
  use_wholesale_price_order_column?: string;
  use_wholesale_price_order_rule?: string;
  wholesale_price_keep_rule?: 'individual' | 'average';
}
```

## データモデル

### Corporation
```typescript
interface Corporation {
  id: number;
  name: string;
  ceo_name: string;
  head_office_address: string;
  phone_number: string;
  kobutsusho_koan_iinkai: string;  // 古物商公安委員会
  kobutsusho_number: string;        // 古物商許可番号
  invoice_number: string;           // 適格請求書発行事業者番号
  zip_code: string;
  square_available: boolean;
  
  // 店舗デフォルト設定
  tax_mode: TaxMode;
  price_adjustment_round_rule: RoundRule;
  price_adjustment_round_rank: number;
  use_wholesale_price_order_column: string;
  use_wholesale_price_order_rule: string;
  wholesale_price_keep_rule: WholesalePriceRule;
  
  // 関連
  stores: Store[];
  accounts: Account[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 法人設定詳細

### 税務設定
- **tax_mode**: 価格表示モード
  - `include`: 内税（税込価格表示）
  - `exclude`: 外税（税抜価格表示）

### 価格調整設定
- **price_adjustment_round_rule**: 端数処理ルール
  - `round`: 四捨五入
  - `floor`: 切り捨て
  - `ceil`: 切り上げ

- **price_adjustment_round_rank**: 丸め桁数
  - 1: 1円単位
  - 10: 10円単位
  - 100: 100円単位

### 卸売価格設定
- **wholesale_price_keep_rule**: 仕入価格管理方法
  - `individual`: 個別管理（入荷ごとに価格保持）
  - `average`: 平均値管理（移動平均法）

## 古物営業法対応

### 必須情報
法人が古物営業を行う場合、以下の情報が必須：
- 古物商公安委員会名
- 古物商許可番号
- 代表者名
- 本社所在地

### コンプライアンス
- 古物台帳の自動生成
- 本人確認記録の保存
- 不正品申告機能
- 定期報告書出力

## インボイス対応

### 適格請求書発行事業者
- インボイス番号の登録・管理
- 適格請求書の自動生成
- 税額計算の正確性保証

## 外部連携

### Square連携
- `square_available`フラグで連携状態管理
- 決済手数料の自動計算
- 売上データの同期

### 会計システム連携
- 仕訳データ出力
- 税務申告用データ生成
- 監査証跡の保持

## セキュリティ

### アクセス制御
- 法人情報は法人アカウントのみ更新可能
- 店舗アカウントは参照のみ
- 従業員アカウントは権限による

### 監査ログ
- 全ての更新操作を記録
- 変更前後の値を保存
- 変更者と日時を記録

## バリデーション

### 電話番号
- 国内番号形式チェック
- ハイフン有無両対応

### 郵便番号
- 7桁数字（ハイフン任意）
- 住所との整合性チェック（オプション）

### 古物商許可番号
- 12桁の数字
- 都道府県公安委員会コードチェック

### インボイス番号
- T + 13桁の数字
- チェックデジット検証

## エラーハンドリング

### 共通エラー
- `400`: バリデーションエラー
- `401`: 認証エラー
- `403`: 権限不足
- `404`: 法人が見つからない
- `409`: 重複エラー

## 使用例

### 法人情報取得
```typescript
const response = await fetch('/api/corporation/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { corporation } = await response.json();
```

### 法人情報更新
```typescript
const response = await fetch('/api/corporation/1/', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: '株式会社サンプル',
    invoice_number: 'T1234567890123',
    tax_mode: 'include'
  })
});
```

## 今後の拡張予定

1. **グループ企業対応**
   - 親会社・子会社関係
   - 連結決算対応
   - グループ間取引

2. **多店舗展開支援**
   - フランチャイズ対応
   - エリア管理
   - 本部一括設定

3. **コンプライアンス強化**
   - 電子帳簿保存法対応
   - マネーロンダリング対策
   - 反社チェック連携

## 関連API

- [店舗API](/store/CLAUDE.md)
- [アカウントAPI](/account/CLAUDE.md)
- [設定API](/settings/CLAUDE.md)
- [税務API](/tax/CLAUDE.md)