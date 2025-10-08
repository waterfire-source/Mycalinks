# Purchase Table Feature

## 概要
買取表管理機能。商品カテゴリごとの買取価格表を作成・管理し、査定時の価格参照や顧客への価格提示に使用する。

## 主要機能

### 買取表管理
- 買取価格表の作成
- 価格表の編集・更新
- カテゴリ別管理
- バージョン管理

### 価格設定
- 商品別価格設定
- コンディション別価格
- 一括価格更新
- 価格履歴管理

### 画像管理
- 商品画像アップロード
- 価格表画像生成
- QRコード付き価格表
- 印刷用フォーマット

### 公開管理
- 店頭表示用出力
- Web公開設定
- 有効期限管理
- 承認フロー

## ディレクトリ構造

```
purchaseTable/
└── hooks/                      # カスタムフック
    ├── useCreatePurchaseTable.tsx  # 買取表作成
    └── usePurchaseTable.tsx        # 買取表取得

app/auth/(dashboard)/purchaseTable/
└── components/
    ├── CreatePurchaseTableModal/   # 作成モーダル
    ├── InputComponent/             # 入力コンポーネント
    ├── ItemComponent/              # 商品コンポーネント
    ├── ListedProductComponent/     # 掲載商品管理
    └── UpdateItemPriceModal/       # 価格更新モーダル
```

## 主要コンポーネント

### 買取表作成
#### CreatePurchaseTableModal
- 新規買取表作成
- テンプレート選択
- 基本情報設定
- 初期商品登録

#### InputComponent
- 買取表名入力
- カテゴリ選択
- 有効期間設定
- 説明文入力

### 商品管理
#### PurchaseTableItemListComponent
- 商品一覧表示
- 検索・フィルタ
- 並び替え
- 一括選択

#### PurchaseTableNarrowDown
- カテゴリ絞り込み
- 価格帯フィルタ
- 在庫状況フィルタ
- キーワード検索

### 価格設定
#### UpdateItemPriceModal
- 個別価格更新
- 一括価格変更
- 割合指定更新
- 価格履歴表示

#### ListedProduct
- 掲載商品表示
- 価格情報
- コンディション別価格
- 編集・削除

## データモデル

### PurchaseTable
```typescript
interface PurchaseTable {
  id: number;
  store_id: number;
  name: string;                    // 買取表名
  category: string;                // カテゴリ
  description?: string;            // 説明文
  valid_from: Date;                // 有効開始日
  valid_until?: Date;              // 有効終了日
  status: PurchaseTableStatus;     // ステータス
  version: number;                 // バージョン番号
  created_by: number;              // 作成者
  approved_by?: number;            // 承認者
  items: PurchaseTableItem[];      // 掲載商品
}
```

### PurchaseTableItem
```typescript
interface PurchaseTableItem {
  id: number;
  purchase_table_id: number;
  item_id: number;
  item_name: string;
  image_url?: string;
  prices: {
    condition: string;             // コンディション
    price: number;                 // 買取価格
    max_quantity?: number;         // 最大買取数
  }[];
  notes?: string;                  // 備考
  display_order: number;           // 表示順
}
```

### PurchaseTableStatus
```typescript
enum PurchaseTableStatus {
  DRAFT = 'DRAFT',                 // 下書き
  PENDING_APPROVAL = 'PENDING_APPROVAL',  // 承認待ち
  ACTIVE = 'ACTIVE',               // 有効
  EXPIRED = 'EXPIRED',             // 期限切れ
  ARCHIVED = 'ARCHIVED'            // アーカイブ
}
```

## API連携

### 買取表API
- `GET /api/purchaseTable`: 買取表一覧取得
- `POST /api/purchaseTable`: 新規作成
- `PUT /api/purchaseTable/{id}`: 更新
- `DELETE /api/purchaseTable/{id}`: 削除

### 価格API
- `PUT /api/purchaseTable/{id}/prices`: 価格一括更新
- `GET /api/purchaseTable/{id}/history`: 価格履歴取得

## 買取表運用フロー

### 1. 作成
- カテゴリ選択
- 商品選択・追加
- 価格設定
- 下書き保存

### 2. 承認
- 価格妥当性確認
- 承認申請
- 上長承認
- 公開準備

### 3. 公開
- 有効期間設定
- 店頭掲示
- Web公開
- QRコード生成

### 4. 運用
- 価格調整
- 商品追加・削除
- 期限管理
- 実績分析

## 価格設定戦略

### 価格決定要因
- 市場相場
- 在庫状況
- 需要予測
- 競合価格

### 自動価格提案
- 相場データ連携
- AI価格予測
- 在庫回転率考慮
- 利益率最適化

### コンディション別価格
```typescript
{
  "S": 基準価格 * 1.0,    // 新品同様
  "A": 基準価格 * 0.8,    // 美品
  "B": 基準価格 * 0.6,    // 良品
  "C": 基準価格 * 0.4,    // 可品
  "D": 基準価格 * 0.2     // 難あり
}
```

## 表示・出力

### 店頭表示
- A4/A3印刷対応
- ラミネート推奨フォーマット
- QRコード付き
- 更新日時表示

### デジタル表示
- タブレット最適化
- リアルタイム更新
- 検索機能付き
- 多言語対応

### Web公開
- レスポンシブデザイン
- SEO最適化
- 共有機能
- 埋め込みコード

## バージョン管理

### 履歴管理
- 全変更履歴保存
- 差分表示
- ロールバック機能
- 変更理由記録

### 承認履歴
- 承認者記録
- 承認日時
- コメント保存
- 監査証跡

## 分析機能

### 利用実績
- 参照回数
- 成約率
- 価格妥当性
- 顧客反応

### 最適化提案
- 価格調整提案
- 商品追加提案
- 削除候補抽出
- A/Bテスト

## セキュリティ

### アクセス制御
- 作成権限
- 編集権限
- 承認権限
- 公開権限

### 改ざん防止
- 変更ログ
- 電子署名
- バックアップ
- 復元機能

## パフォーマンス

### 高速表示
- 画像最適化
- キャッシュ活用
- 遅延読み込み
- CDN配信

### 大量データ対応
- ページネーション
- 仮想スクロール
- インデックス最適化
- 非同期処理

## 今後の拡張予定

1. **AI価格最適化**
   - 機械学習による価格予測
   - 競合分析自動化
   - 需要予測精度向上
   - 動的価格調整

2. **マルチチャネル対応**
   - SNS連携
   - LINE公式アカウント
   - チャットボット対応
   - API公開

3. **高度な分析**
   - 価格弾力性分析
   - 顧客セグメント別最適化
   - 地域別価格戦略
   - 季節変動対応

## 関連機能

- [買取管理](/purchase/CLAUDE.md)
- [査定機能](/appraisal/CLAUDE.md)
- [在庫管理](/stock/CLAUDE.md)
- [価格管理](/pricing/CLAUDE.md)