# EC Feature

## 概要
ECサイト管理機能。オンラインストアの商品管理、注文処理、在庫同期、顧客対応、配送管理など、EC運営に必要な全機能を提供する。

## 主要機能

### 注文管理
- 注文一覧・検索
- 注文ステータス管理
- ピッキングリスト
- 配送処理

### EC在庫管理
- 店舗在庫との連携
- EC専用在庫設定
- 複数プラットフォーム管理
- 在庫自動同期

### 商品出品
- 商品情報登録
- 画像アップロード
- 価格設定
- カテゴリ分類

### 顧客問い合わせ
- メッセージ管理
- 注文関連問い合わせ
- 自動返信設定
- 対応履歴管理

### 配送設定
- 配送方法定義
- 送料計算ルール
- 配送業者連携
- 追跡番号管理

### EC設定
- 決済方法設定
- 利用規約管理
- 営業日設定
- セール設定

## ディレクトリ構造

```
ec/
├── components/         # 共通コンポーネント
├── hooks/             # 共通フック
├── inquiry/           # 問い合わせ機能
│   ├── components/    # 問い合わせUI
│   └── hooks/         # 問い合わせロジック
├── setting/           # EC設定
│   ├── components/    # 設定UI
│   └── delivery/      # 配送設定
└── server/            # サーバーサイド処理

app/auth/(dashboard)/ec/
├── inquiry/           # 問い合わせページ
├── list/             # 注文一覧ページ
├── picking/          # ピッキングページ
├── settings/         # 設定ページ
├── stock/            # EC在庫ページ
└── transaction/      # 取引詳細ページ
```

## 主要コンポーネント

### 注文管理
#### EcOrderTable
- 注文一覧表示
- ステータスフィルタ
- 一括操作
- 詳細表示

#### OrderDetailSidePanel
- 注文詳細情報
- 商品リスト
- 配送先情報
- 決済情報

### EC在庫
#### EcProductList
- EC出品商品一覧
- 在庫数表示
- 価格管理
- 出品停止/再開

#### NewPublishProductModal
- 新規出品登録
- 商品選択
- 価格設定
- プラットフォーム選択

### 問い合わせ管理
#### InquiryTabTable
- 問い合わせ一覧
- ステータス管理
- 優先度設定
- 担当者割当

#### Conversation
- メッセージスレッド
- 返信作成
- テンプレート利用
- 添付ファイル

### 配送設定
#### DeliverySettings
- 配送方法一覧
- 料金設定
- 配送エリア設定
- 配送日数設定

## データモデル

### EC_Order
```typescript
interface EC_Order {
  id: number;
  orderNumber: string;
  platform: ECPlatform;
  status: OrderStatus;
  customer: ECCustomer;
  items: EC_OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  totalAmount: number;
  shippingFee: number;
  orderedAt: Date;
  shippedAt?: Date;
}
```

### EC_Product
```typescript
interface EC_Product {
  id: number;
  productId: number;
  platform: ECPlatform;
  listingStatus: ListingStatus;
  price: number;
  stock: number;
  title: string;
  description: string;
  images: string[];
  categories: string[];
}
```

### EC_Inquiry
```typescript
interface EC_Inquiry {
  id: number;
  orderId?: number;
  customerId: number;
  subject: string;
  status: InquiryStatus;
  priority: Priority;
  messages: Message[];
  assignedTo?: number;
  createdAt: Date;
}
```

## API連携

### EC注文API
- `GET /api/ec/orders`: 注文一覧取得
- `PUT /api/ec/orders/{id}/status`: ステータス更新
- `POST /api/ec/orders/{id}/ship`: 出荷処理
- `POST /api/ec/orders/{id}/cancel`: キャンセル処理

### EC商品API
- `GET /api/ec/products`: EC商品一覧
- `POST /api/ec/products`: 新規出品
- `PUT /api/ec/products/{id}`: 商品情報更新
- `POST /api/ec/products/sync`: 在庫同期

### 外部プラットフォーム連携
- おちゃのこネットAPI
- 楽天市場API（予定）
- Amazon API（予定）

## 注文処理フロー

### 1. 注文受付
- 自動取り込み
- 在庫確認
- 決済確認
- 注文確定通知

### 2. ピッキング
- ピッキングリスト生成
- バーコードスキャン
- 検品チェック
- 梱包処理

### 3. 出荷
- 送り状発行
- 追跡番号登録
- 出荷通知送信
- ステータス更新

### 4. アフターサポート
- 配送状況確認
- 問い合わせ対応
- 返品・交換処理
- レビュー依頼

## 在庫同期

### リアルタイム同期
- 販売時の即時反映
- 入荷時の自動更新
- 在庫調整の同期
- エラー時のリトライ

### バッチ同期
- 定期的な全件同期
- 差分更新
- 不整合チェック
- 同期ログ

## マルチプラットフォーム対応

### プラットフォーム管理
- 複数モール出品
- 統一在庫管理
- 価格一括更新
- 商品情報同期

### プラットフォーム別設定
- 手数料計算
- カテゴリマッピング
- 配送ルール
- 決済方法

## 顧客対応

### 自動返信
- 注文確認メール
- 発送通知
- お問い合わせ受付
- FAQ自動回答

### 手動対応
- 個別メッセージ
- 特殊対応記録
- エスカレーション
- 対応履歴管理

## 分析・レポート

### 売上分析
- 日次・月次売上
- 商品別売上
- カテゴリ別分析
- 顧客分析

### 在庫分析
- 回転率
- 欠品率
- ABC分析
- 需要予測

## セキュリティ

### 顧客情報保護
- 個人情報暗号化
- アクセス制限
- 操作ログ記録
- PCI DSS準拠

### 不正注文対策
- 注文パターン分析
- ブラックリスト
- 与信チェック
- 手動確認フロー

## パフォーマンス最適化

### 高速化対応
- 注文データキャッシュ
- 非同期処理
- CDN利用
- 画像最適化

### 大量注文対応
- バッチ処理
- 並列実行
- 負荷分散
- エラーハンドリング

## 今後の拡張予定

1. **AI活用**
   - 需要予測
   - 価格最適化
   - チャットボット対応
   - レコメンド機能

2. **オムニチャネル強化**
   - 店舗受取
   - 在庫取り置き
   - クロスセル促進

3. **グローバル対応**
   - 多言語対応
   - 海外配送
   - 多通貨決済

## 関連機能

- [在庫管理](/stock/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [顧客管理](/customers/CLAUDE.md)
- [配送管理](/shipping/CLAUDE.md)