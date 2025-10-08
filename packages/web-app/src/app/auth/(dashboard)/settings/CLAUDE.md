# Settings Module

## 概要
システム設定管理機能。店舗運営に必要な各種設定を集約したモジュール。アカウント管理、店舗設定、システム連携、商品設定など、POSシステムの動作に関わる全ての設定を一元管理する。

## 主要機能

### アカウント管理
- 従業員アカウント作成・編集
- 権限グループ管理
- アクセス制御設定
- パスワードポリシー

### 法人・店舗設定
- 法人基本情報管理
- 店舗情報設定
- 営業時間設定
- 連絡先・住所管理

### 商品設定
- ジャンル・カテゴリ管理
- 商品コンディション設定
- 仕入価格設定
- 表示名カスタマイズ

### システム連携
- レジ設定・管理
- Square連携設定
- タブレット設定
- プリンター設定

### ポイント設定
- ポイント付与ルール
- ポイント利用設定
- 有効期限管理
- 特典設定

## ディレクトリ構造

```
settings/
├── account/                     # 従業員アカウント管理
│   └── page.tsx
├── authority/                   # 権限設定
│   └── page.tsx
├── cash-register/               # レジ設定
│   ├── components/
│   │   ├── DetailComponent.tsx
│   │   ├── RegisterCheckSettingModal.tsx
│   │   └── SquareConnectButton.tsx
│   └── page.tsx
├── condition/                   # 商品コンディション設定
│   ├── components/
│   │   ├── ConditionSection.tsx
│   │   ├── DisplayNameField.tsx
│   │   ├── EditConditionOptionsModal.tsx
│   │   ├── EditConditionOptionsTable.tsx
│   │   └── showConditionOptionsTable.tsx
│   └── page.tsx
├── corporation/                 # 法人情報設定
│   └── page.tsx
├── genre-and-category/          # ジャンル・カテゴリ管理
│   ├── components/
│   │   ├── AddGenreModal.tsx
│   │   ├── AddGenreModalOpen.tsx
│   │   ├── GenreCard.tsx
│   │   ├── CannotDeleteGenreDialog.tsx
│   │   ├── GenreCategoryTabTable.tsx
│   │   └── dialog/
│   │       └── DeleteGenreDialog.tsx
│   └── page.tsx
├── point-setting/               # ポイント設定
│   ├── components/
│   │   ├── PointFunction.tsx
│   │   ├── PointGrant.tsx
│   │   ├── PointSettingContentsCard.tsx
│   │   ├── PointUsage.tsx
│   │   ├── RadioForPoint.tsx
│   │   ├── SelectForPoint.tsx
│   │   └── TextFieldForPoint.tsx
│   └── page.tsx
├── store/                       # 個別店舗設定
│   └── [store_id]/
│       └── page.tsx
├── tablet-setting/              # タブレット設定
│   ├── components/
│   │   ├── CategoryGenreSelect.tsx
│   │   └── GenreCategorySetting.tsx
│   ├── hooks/
│   │   └── useAllowedGenreCategories.ts
│   └── page.tsx
└── wholesale-price/             # 卸価格設定
    └── page.tsx
```

## 主要コンポーネント

### アカウント管理
#### AccountList
- 従業員一覧表示
- アカウント状態管理
- 権限レベル表示
- 編集・削除機能

#### OpenModalButton
- 新規アカウント作成
- 権限グループ選択
- 初期設定
- パスワード生成

### 法人情報設定
#### CorporationEditModal
- 基本情報編集
- 古物商情報管理
- インボイス情報
- Square連携設定

#### StoreManagementModal
- 店舗追加・編集
- 営業時間設定
- 住所・連絡先管理
- 税設定

### 商品設定
#### GenreCategoryTabTable
- ジャンル・カテゴリ階層管理
- 表示順設定
- 有効/無効切り替え
- 一括編集機能

#### ConditionSection
- コンディション定義
- 価格影響率設定
- 表示名カスタマイズ
- 並び順管理

### レジ設定
#### RegisterCheckSettingModal
- レジ端末設定
- 決済方法設定
- レシート設定
- 税計算設定

#### SquareConnectButton
- Square OAuth連携
- 端末ペアリング
- 決済設定同期
- エラーハンドリング

### ポイント設定
#### PointFunction
- ポイント機能有効化
- 基本設定
- 計算ルール
- 表示設定

#### PointGrant & PointUsage
- 付与ルール設定
- 利用ルール設定
- 有効期限管理
- 特別ルール

## データモデル

### Account
```typescript
interface Account {
  id: string;
  code: string;                   // 従業員番号
  name: string;                   // 従業員名
  email: string;                  // メールアドレス
  group_id: number;               // 権限グループID
  store_ids: number[];            // 所属店舗ID配列
  is_active: boolean;             // アクティブ状態
  created_at: Date;
  updated_at: Date;
}
```

### Corporation
```typescript
interface Corporation {
  id: number;
  name: string;                   // 法人名
  ceo_name: string;               // 代表者名
  zip_code: string;               // 郵便番号
  head_office_address: string;    // 本社住所
  phone_number: string;           // 電話番号
  kobutsusho_koan_iinkai: string; // 古物商公安委員会
  kobutsusho_number: string;      // 古物商番号
  invoice_number: string;         // インボイス登録番号
  square_available: boolean;      // Square利用可能フラグ
}
```

### ItemGenre & ItemCategory
```typescript
interface ItemGenre {
  id: number;
  display_name: string;           // 表示名
  sort_order: number;             // 表示順
  is_active: boolean;             // 有効フラグ
  categories: ItemCategory[];     // 配下カテゴリ
}

interface ItemCategory {
  id: number;
  genre_id: number;               // 親ジャンルID
  display_name: string;           // 表示名
  sort_order: number;             // 表示順
  is_active: boolean;             // 有効フラグ
}
```

### Register
```typescript
interface Register {
  id: number;
  store_id: number;               // 店舗ID
  name: string;                   // レジ名
  type: RegisterType;             // レジタイプ
  square_device_id?: string;      // Square端末ID
  is_active: boolean;             // 有効フラグ
  settings: RegisterSettings;     // レジ設定
}

interface RegisterSettings {
  auto_print_receipt: boolean;    // 自動レシート印刷
  cash_drawer_connected: boolean; // キャッシュドロワー接続
  barcode_scanner_enabled: boolean; // バーコードスキャナー有効
  customer_display_enabled: boolean; // 客面表示有効
}
```

### PointSetting
```typescript
interface PointSetting {
  store_id: number;
  is_enabled: boolean;            // ポイント機能有効
  grant_rate: number;             // 付与率（%）
  grant_unit: number;             // 付与単位（円）
  usage_unit: number;             // 利用単位（ポイント）
  usage_value: number;            // 利用価値（円）
  expiry_months: number;          // 有効期限（月）
  min_grant_amount: number;       // 最小付与金額
  max_usage_rate: number;         // 最大利用率（%）
}
```

## 設定カテゴリ

### システム基盤設定
- 認証・認可
- データベース接続
- API設定
- ログ設定

### 業務設定
- 営業時間
- 税率設定
- 通貨設定
- 言語設定

### 連携設定
- 決済ゲートウェイ
- 外部EC連携
- 会計システム連携
- 在庫管理システム連携

### UI/UX設定
- テーマ設定
- 表示言語
- 画面レイアウト
- ショートカット設定

## 権限管理

### 権限レベル
```typescript
enum AuthorityLevel {
  ADMIN = 'ADMIN',                // システム管理者
  MANAGER = 'MANAGER',            // 店舗管理者
  STAFF = 'STAFF',               // 一般スタッフ
  READONLY = 'READONLY'           // 読み取り専用
}
```

### 機能別権限
- 商品管理権限
- 売上管理権限
- 顧客管理権限
- 設定変更権限
- レポート閲覧権限

### 店舗別権限
- 複数店舗アクセス
- 店舗間データ参照
- 店舗設定変更
- スタッフ管理

## セキュリティ

### パスワードポリシー
- 最小文字数
- 文字種混在要求
- 定期変更要求
- 履歴管理

### アクセス制御
- IPアドレス制限
- 時間帯制限
- 機能別制限
- ログ記録

### データ保護
- 暗号化設定
- バックアップ設定
- 削除ポリシー
- 監査ログ

## 運用管理

### 設定バックアップ
- 定期バックアップ
- 設定変更履歴
- ロールバック機能
- バージョン管理

### 監視・アラート
- 設定変更通知
- システム監視
- パフォーマンス監視
- エラー通知

### メンテナンス
- 定期メンテナンス設定
- 自動更新設定
- 障害時対応
- 復旧手順

## 今後の拡張予定

1. **設定テンプレート**
   - 業種別テンプレート
   - 設定セット保存
   - インポート/エクスポート
   - 推奨設定提案

2. **高度な権限管理**
   - ロールベース権限
   - 時限権限
   - 承認フロー
   - 委任機能

3. **AI支援設定**
   - 最適設定提案
   - 異常検知
   - 自動調整
   - 学習機能

## 関連機能

- [認証・認可](/auth/CLAUDE.md)
- [店舗管理](/store/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [決済管理](/payments/CLAUDE.md)