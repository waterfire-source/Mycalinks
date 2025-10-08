# Stock Feature

## 概要
在庫管理機能。商品の入出庫、在庫調整、バンドル商品管理、パック開封、セール設定など在庫に関する全ての操作を統括する。

## 主要機能

### 在庫管理
- 在庫数量管理
- 在庫移動・調整
- 在庫履歴追跡
- ロケーション管理

### バンドル商品管理
- バンドル作成・編集
- セット商品定義
- バンドル解体
- 価格自動計算

### パック商品管理
- 固定パック登録
- ランダムパック設定
- パック開封処理
- 封入率管理

### セール管理
- セール期間設定
- 割引設定（率・額）
- 対象商品選択
- セット販売定義

### 在庫変動履歴
- 入出庫履歴
- 調整履歴
- 移動履歴
- 監査証跡

## ディレクトリ構造

```
stock/
├── bundle/              # バンドル商品機能
│   ├── components/     # UIコンポーネント
│   ├── hooks/          # バンドルロジック
│   └── register/       # バンドル登録
├── changeHistory/       # 在庫変動履歴
├── components/          # 共通コンポーネント
├── hooks/              # 共通フック
├── register/           # 在庫登録
│   └── pack/          # パック商品登録
├── sale/               # セール設定
│   ├── hooks/         # セールロジック
│   └── register/      # セール登録
└── set/                # セット商品
    ├── hooks/         # セットロジック
    └── register/      # セット登録
```

## 主要コンポーネント

### バンドル管理
#### BundleForm
- バンドル構成定義
- 商品選択・数量設定
- 価格計算
- SKU生成

#### DismantleBundleModal
- バンドル解体処理
- 構成商品の在庫復元
- 履歴記録

### パック管理
#### PackRegisterTab
- 固定/ランダム切替
- 封入商品設定
- 確率設定
- 在庫割当

#### PackOpenSetting
- 開封ルール定義
- ランダム抽選ロジック
- 結果記録

### 在庫履歴
#### StockChangeHistory
- 変動履歴一覧
- フィルタリング
- 詳細表示
- CSV出力

### セール管理
#### SaleInfo
- セール基本情報
- 期間設定
- 割引設定
- 適用条件

## データモデル

### ProductStock
```typescript
interface ProductStock {
  productId: number;
  storeId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  location: string;
  lastUpdated: Date;
}
```

### StockHistory
```typescript
interface StockHistory {
  id: number;
  productId: number;
  changeType: StockChangeType;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  reason: string;
  transactionId?: number;
  createdBy: number;
  createdAt: Date;
}
```

### Bundle
```typescript
interface Bundle {
  id: number;
  name: string;
  products: BundleProduct[];
  price: number;
  active: boolean;
}
```

## API連携

### 在庫API
- `GET /api/store/{store_id}/stock`: 在庫一覧
- `POST /api/store/{store_id}/stock/adjust`: 在庫調整
- `POST /api/store/{store_id}/stock/transfer`: 在庫移動
- `GET /api/store/{store_id}/stock/history`: 変動履歴

### バンドルAPI
- `POST /api/store/{store_id}/bundle`: バンドル作成
- `PUT /api/store/{store_id}/bundle/{id}`: バンドル更新
- `POST /api/store/{store_id}/bundle/{id}/dismantle`: 解体

### セールAPI
- `POST /api/store/{store_id}/sale`: セール作成
- `GET /api/store/{store_id}/sale/active`: 有効セール一覧

## 在庫管理フロー

### 入庫処理
1. 仕入れ/買取からの自動入庫
2. 手動在庫調整
3. 店舗間移動受入
4. 返品による入庫

### 出庫処理
1. 販売による自動出庫
2. 店舗間移動出庫
3. 廃棄処理
4. サンプル出庫

### 在庫調整
1. 棚卸による調整
2. 破損・紛失処理
3. 数量訂正
4. ロケーション変更

## 在庫最適化

### 自動発注提案
- 安全在庫設定
- リードタイム考慮
- 需要予測連動
- 発注点アラート

### 在庫回転率管理
- ABC分析
- 滞留在庫検出
- 自動値下げ提案
- 廃棄候補抽出

## バンドル・セット戦略

### バンドル商品
- 関連商品組み合わせ
- 在庫処分バンドル
- 季節限定セット
- 利益率最適化

### セット販売
- まとめ買い割引
- 数量割引
- 組み合わせ割引
- 会員限定セット

## 監査・コンプライアンス

### 在庫監査
- 定期棚卸
- 循環棚卸
- 差異分析
- 原因追跡

### アクセス制御
- 在庫調整権限
- 承認フロー
- 操作ログ
- 異常検知

## パフォーマンス

### リアルタイム在庫
- 即時反映
- 楽観的ロック
- キャッシュ戦略
- 非同期更新

### 大量処理
- バッチ更新
- 並行処理制御
- エラー復旧
- 進捗表示

## レポート

### 在庫レポート
- 在庫推移
- 在庫評価額
- 回転率分析
- ロケーション別集計

### 異常レポート
- 在庫差異
- 異常変動
- 期限切れアラート
- 欠品予測

## 今後の拡張予定

1. **AI在庫最適化**
   - 需要予測精度向上
   - 自動発注実行
   - 動的価格調整

2. **IoT連携**
   - RFIDタグ対応
   - 自動棚卸
   - リアルタイム追跡

3. **マルチロケーション**
   - 倉庫管理対応
   - 3PL連携
   - クロスドッキング

## 関連機能

- [販売管理](/sale/CLAUDE.md)
- [買取管理](/purchase/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [仕入管理](/stocking/CLAUDE.md)