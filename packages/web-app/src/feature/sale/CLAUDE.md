# Sale Feature

## 概要
販売取引処理の中核機能。商品のバーコードスキャン、カート管理、決済処理、レシート発行まで一連の販売フローを管理する。

## 主要機能

### 販売カート管理
- 商品スキャン・手動追加
- 数量変更・商品削除
- 価格編集（権限制御付き）
- セット販売適用
- 個別割引適用

### 決済処理
- 複数決済方法対応
  - 現金
  - クレジットカード
  - 電子マネー
  - ポイント
- 決済分割（併用払い）
- お釣り計算

### 取引管理
- 取引一時保存（下書き）
- 取引キャンセル
- 返品処理
- 取引履歴検索

## ディレクトリ構造

```
sale/
├── components/          # UIコンポーネント
│   ├── buttons/        # アクションボタン
│   ├── cards/          # カード型UI
│   ├── modals/         # モーダルダイアログ
│   ├── scan/           # スキャン関連
│   └── searchModal/    # 商品検索モーダル
├── hooks/              # カスタムフック
│   └── useSaleCart.ts  # カート管理ロジック
└── utils/              # ユーティリティ関数
```

## 主要コンポーネント

### useSaleCart Hook
販売カートの状態管理とビジネスロジックを集約：
- カート商品の追加・削除・更新
- セット販売の自動適用
- 合計金額計算
- 在庫チェック

### SaleCartCardContainer
カート内商品の表示と操作：
- 商品情報表示
- 数量変更UI
- 価格編集（権限あり）
- 削除操作

### SalePaymentSummaryModal
決済確認モーダル：
- 合計金額表示
- 決済方法選択
- お釣り計算
- 決済実行

### ProductScanButtonContainer
バーコードスキャン機能：
- カメラスキャン
- 手動入力
- 複数商品対応
- エラーハンドリング

## データモデル

### SaleCartItem
```typescript
interface SaleCartItem {
  productId: number;
  displayName: string;
  conditionName: string;
  stockNumber: number;
  originalSalePrice: number | null;
  infinite_stock?: boolean;
  variants: Array<{
    variantId: string;
    itemCount: number;
    unitPrice: number;
    sale?: SaleInfo;
    individualDiscount?: DiscountInfo;
  }>;
}
```

### Transaction
販売取引のデータベースモデル：
- `TransactionKind.sale`: 販売取引
- `TransactionPaymentMethod`: 決済方法
- 関連: TransactionDetail, TransactionPayment

## API連携

### 販売API
- `POST /api/store/{store_id}/sale/transaction`: 取引作成
- `POST /api/store/{store_id}/sale/draft`: 下書き保存
- `POST /api/store/{store_id}/sale/payment`: 決済処理
- `GET /api/store/{store_id}/sale/history`: 取引履歴

### 在庫API
- 販売時の在庫減算
- 在庫チェック
- 返品時の在庫復元

## 状態管理

### カート状態
- LocalStorageによる永続化
- 店舗切り替え時のクリア
- エラー時のロールバック

### 決済状態
- 決済プロセスの進行管理
- エラーハンドリング
- タイムアウト処理

## セキュリティ

### 権限制御
- 価格編集権限
- 割引適用権限
- 取引キャンセル権限
- 返品処理権限

### 監査ログ
- 全取引の記録
- 価格変更履歴
- キャンセル・返品理由

## デバイス連携

### EPSONプリンター
- レシート印刷
- ラベル印刷
- プリンターステータス監視

### バーコードスキャナー
- USB/Bluetooth接続
- カメラスキャン（フォールバック）

## パフォーマンス最適化

### カート操作
- 楽観的UI更新
- デバウンス処理
- バッチ更新

### 商品検索
- インクリメンタルサーチ
- 検索結果キャッシュ
- 仮想スクロール

## エラーハンドリング

### 在庫不足
- リアルタイム在庫チェック
- 代替商品提案
- 取り置き機能

### 決済エラー
- リトライ機能
- 代替決済方法
- ロールバック処理

## テスト

### ユニットテスト
- カート計算ロジック
- 割引適用ロジック
- 決済金額検証

### E2Eテスト
- 販売フロー全体
- エラーケース
- デバイス連携

## 今後の拡張予定

1. **AI価格提案**
   - 需要予測に基づく動的価格
   - 在庫回転率最適化

2. **オムニチャネル**
   - EC在庫との統合
   - 店舗受取予約

3. **顧客体験向上**
   - セルフレジ対応
   - モバイル決済拡充

## 関連機能

- [在庫管理](/stock/CLAUDE.md)
- [顧客管理](/customers/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [決済処理](/payment/CLAUDE.md)