# Contract API

## 概要
契約管理のためのREST API。POSシステムの利用契約作成、支払い処理、サブスクリプション管理を行う。

## エンドポイント一覧

- `POST /api/contract/` - 契約作成
- `GET /api/contract/` - 契約情報取得
- `POST /api/contract/pay/` - 初期支払い処理
- `POST /api/contract/pay/callback/` - 支払いコールバック処理
- `POST /api/contract/pay/subscription/` - 月額課金処理

## API詳細

### 契約作成
```typescript
POST /api/contract/
```

**権限**: admin, pos

**リクエストボディ**:
```typescript
{
  start_at: Date;                       // 利用開始日（必須）
  main_account_monthly_fee: number;     // メインアカウント月額利用料（必須）
  corporation_management_account_fee: number;  // 本部管理アカウント利用料（必須）
  mobile_device_connection_fee: number; // スマホ・タブレット連携費用（必須）
  initial_fee: number;                  // 初期費用（必須）
}
```

**レスポンス**:
```typescript
{
  id: number;
  token: string;          // 契約トークン
  status: ContractStatus;
  // ... その他契約情報
}
```

**エラー**:
- `pastStartAt`: 利用開始日を過去にすることはできません（400）

### 契約情報取得
```typescript
GET /api/contract/?token={token}
```

**権限**: everyone（トークンがあれば誰でも可）

**クエリパラメータ**:
- `token`: 契約トークン（必須）

**レスポンス**:
```typescript
{
  token_expires_at: Date;                     // トークン有効期限
  start_at: Date;                            // 利用開始日
  main_account_monthly_fee: number;          // メインアカウント利用料
  corporation_management_account_fee: number; // 本部管理アカウント利用料
  mobile_device_connection_fee: number;      // スマホ・タブレット連携費用
  initial_fee: number;                       // 初期費用
  initial_payment_price: number;             // 初期支払い料（自動計算）
  monthly_payment_price: number;             // 月額支払い料（自動計算）
}
```

### 初期支払い処理
```typescript
POST /api/contract/pay/
```

**権限**: everyone（トークンがあれば誰でも可）

**リクエストボディ**:
```typescript
{
  token: string;                    // 契約トークン（必須）
  corporation: {
    name: string;                   // 法人名（必須）
    ceo_name: string;              // 法人代表者名（必須）
    head_office_address: string;   // 本社所在地（必須）
    phone_number: string;          // 電話番号（必須）
  };
  account: {
    email: string;                 // 本部アカウントメールアドレス（必須）
  };
  card: {
    token: string;                 // クレジットカードトークン（必須）
  };
}
```

**レスポンス**:
```typescript
{
  contract: {
    status: 'NOT_STARTED' | 'STARTED';  // 契約ステータス
  };
  tds?: {                               // 3Dセキュア情報（必要な場合）
    redirectUrl: string;                // 3Dセキュア認証URL
  };
}
```

**処理フロー**:
1. クレジットカード情報の検証
2. 初期費用の決済処理
3. 3Dセキュアが必要な場合はリダイレクトURL返却
4. 決済成功時は法人・アカウント作成

### 月額課金処理
```typescript
POST /api/contract/pay/subscription/
```

**権限**: bot, pos

**処理内容**:
- 全ての有効な契約に対して月額料金を課金
- 毎月1日に自動実行（バッチ処理）
- 失敗時は再試行とアラート送信

**レスポンス**:
```typescript
{
  ok: "処理が完了しました"
}
```

## データモデル

### Contract
```typescript
interface Contract {
  id: number;
  corporation_id: number;
  token: string;                          // 一意の契約トークン
  token_expires_at: Date;                 // トークン有効期限
  status: ContractStatus;                 // 契約ステータス
  
  // 料金設定
  main_account_monthly_fee: number;       // メインアカウント月額
  corporation_management_account_fee: number;  // 本部アカウント月額
  mobile_device_connection_fee: number;   // モバイルデバイス月額
  initial_fee: number;                    // 初期費用
  
  // 計算フィールド
  initial_payment_price: number;          // 初期支払い総額
  monthly_payment_price: number;          // 月額支払い総額
  
  // 契約期間
  start_at: Date;                        // 利用開始日
  end_at?: Date;                         // 利用終了日
  
  // 決済情報
  gmo_member_id?: string;                // GMO会員ID
  gmo_card_seq?: string;                 // GMOカード連番
  
  createdAt: Date;
  updatedAt: Date;
}
```

### ContractStatus
```typescript
enum ContractStatus {
  NOT_STARTED = 'NOT_STARTED',  // 未開始（支払い前）
  STARTED = 'STARTED',          // 開始済み（支払い完了）
  SUSPENDED = 'SUSPENDED',      // 一時停止
  CANCELLED = 'CANCELLED',      // 解約済み
}
```

## 料金計算

### 初期支払い額
```typescript
initial_payment_price = 
  initial_fee +                           // 初期費用
  main_account_monthly_fee +              // 初月のメイン料金
  corporation_management_account_fee +    // 初月の本部料金
  mobile_device_connection_fee           // 初月のモバイル料金
```

### 月額支払い額
```typescript
monthly_payment_price = 
  main_account_monthly_fee +              // メインアカウント料金
  corporation_management_account_fee +    // 本部アカウント料金
  mobile_device_connection_fee +         // モバイルデバイス料金
  (追加アカウント数 × アカウント単価)      // 追加アカウント料金
```

## 決済フロー

### GMO Payment Gateway連携
1. **カードトークン化**
   - フロントエンドでカード情報をトークン化
   - トークンをバックエンドに送信

2. **決済処理**
   - GMO会員登録
   - カード登録
   - 初期費用決済

3. **3Dセキュア対応**
   - 必要な場合はリダイレクトURL生成
   - コールバック処理で決済完了

4. **サブスクリプション**
   - 登録カードで自動課金
   - 失敗時の再試行処理

## セキュリティ

### トークン管理
- 契約トークンは一意のUUID
- 有効期限は作成から24時間
- 使用後は無効化

### カード情報保護
- カード情報は保存しない
- GMOのトークン化サービス利用
- PCI DSS準拠

### アクセス制御
- 契約作成は管理者のみ
- 支払い処理はトークン認証
- 月額課金はシステムのみ

## エラーハンドリング

### 決済エラー
- カード無効
- 残高不足
- 3Dセキュア失敗
- タイムアウト

### システムエラー
- GMO連携エラー
- データベースエラー
- ネットワークエラー

### リトライ処理
- 月額課金失敗時は3回まで再試行
- 再試行間隔: 1時間、6時間、24時間
- 最終失敗時は管理者通知

## 監査・コンプライアンス

### 取引履歴
- 全決済履歴の保存
- 請求書自動生成
- 領収書発行機能

### 法令遵守
- 特定商取引法対応
- 資金決済法対応
- 個人情報保護法対応

## 通知機能

### メール通知
- 契約完了通知
- 決済完了通知
- 決済失敗通知
- 契約更新通知

### 管理者通知
- 新規契約アラート
- 決済エラーアラート
- 解約通知

## 今後の拡張予定

1. **柔軟な料金プラン**
   - 従量課金対応
   - ディスカウント機能
   - プロモーション対応

2. **決済手段拡充**
   - 銀行振込対応
   - 請求書払い対応
   - PayPal連携

3. **契約管理機能強化**
   - プラン変更機能
   - 一時停止・再開
   - 自動更新設定

## 関連API

- [法人API](/corporation/CLAUDE.md)
- [アカウントAPI](/account/CLAUDE.md)
- [決済API](/payment/CLAUDE.md)
- [通知API](/notification/CLAUDE.md)