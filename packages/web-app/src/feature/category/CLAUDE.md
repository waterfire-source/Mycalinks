# Category Feature

## 概要
カテゴリ管理機能。商品を分類・整理するためのカテゴリマスタを管理し、商品検索や在庫管理、売上分析などの基盤となる分類体系を提供する。

## 主要機能

### カテゴリ管理
- カテゴリ作成・編集・削除
- 階層構造管理
- 表示/非表示設定
- 並び順管理

### コンディション設定
- カテゴリ別コンディション定義
- 状態オプション管理
- デフォルト値設定
- カスタム条件追加

### 関連付け管理
- 商品カテゴリ紐付け
- ジャンルとの関係設定
- 属性定義
- 検索タグ設定

### 権限・表示制御
- カテゴリ別アクセス権限
- 店舗別表示設定
- ユーザー別フィルタ
- API公開設定

## ディレクトリ構造

```
category/
└── hooks/                      # カスタムフック
    ├── useCategory.ts         # カテゴリ操作全般
    ├── useCreateCategory.ts   # カテゴリ作成
    └── useGetCardCategory.ts  # カード専用カテゴリ
```

## 主要フック

### useCategory
カテゴリ操作の中心的なフック：
- カテゴリ一覧取得
- CRUD操作
- フィルタリング
- 状態管理

### useCreateCategory
カテゴリ作成専用：
- バリデーション
- 重複チェック
- 作成後処理
- エラーハンドリング

### useGetCardCategory
カード商品専用：
- カード特有の属性
- レアリティ管理
- シリーズ管理
- 特殊ルール

## データモデル

### ItemCategory
```typescript
interface ItemCategory {
  id: number;
  corporation_id: number;
  display_name: string;           // 表示名
  handle: string;                 // システム識別子
  hidden: boolean;                // 非表示フラグ
  display_order: number;          // 表示順
  parent_id?: number;             // 親カテゴリID
  condition_options?: ConditionOption[];  // コンディション設定
  attributes?: CategoryAttribute[];       // カテゴリ属性
  created_at: Date;
  updated_at: Date;
}
```

### ConditionOption
```typescript
interface ConditionOption {
  id: number;
  category_id: number;
  display_name: string;           // コンディション表示名
  code: string;                   // コンディションコード
  sort_order: number;             // 並び順
  price_rate: number;             // 価格係数
  is_default: boolean;            // デフォルトフラグ
  description?: string;           // 説明
}
```

### CategoryAttribute
```typescript
interface CategoryAttribute {
  id: number;
  category_id: number;
  attribute_name: string;         // 属性名
  attribute_type: AttributeType;  // 属性タイプ
  is_required: boolean;           // 必須フラグ
  options?: string[];             // 選択肢（選択型の場合）
  validation_rule?: string;       // バリデーションルール
}
```

## API連携

### カテゴリAPI
- `GET /api/category/all`: 全カテゴリ取得
- `POST /api/category`: カテゴリ作成
- `PUT /api/category/{id}`: カテゴリ更新
- `DELETE /api/category/{id}`: カテゴリ削除

### フィルタリング
- 表示/非表示フィルタ
- 親カテゴリ指定
- キーワード検索
- 属性フィルタ

## カテゴリ体系

### 標準カテゴリ
```
商品
├── カード
│   ├── トレーディングカード
│   ├── スポーツカード
│   └── その他カード
├── ゲーム
│   ├── ゲームソフト
│   ├── ゲーム機本体
│   └── 周辺機器
├── ホビー
│   ├── フィギュア
│   ├── プラモデル
│   └── その他
└── その他
```

### 特殊カテゴリ
- `CARD`: カード専用設定
- `BUNDLE`: バンドル商品
- `PACK`: パック商品
- `SERVICE`: サービス商品

## コンディション管理

### カード商品
```typescript
{
  "S": "新品同様",
  "A": "美品",
  "B": "良品",
  "C": "可",
  "D": "傷あり"
}
```

### 一般商品
```typescript
{
  "NEW": "新品",
  "LIKE_NEW": "未使用品",
  "VERY_GOOD": "非常に良い",
  "GOOD": "良い",
  "ACCEPTABLE": "可"
}
```

### カスタムコンディション
- カテゴリ別設定可能
- 店舗独自定義
- 価格係数設定
- 説明文カスタマイズ

## 表示制御

### 非表示設定
- 一時的な非表示
- 期間限定表示
- 権限による制御
- API除外設定

### 並び順制御
- 手動並び替え
- 自動ソート
- カスタムルール
- ドラッグ&ドロップ

## カテゴリ属性

### 共通属性
- ブランド
- メーカー
- 発売日
- 型番

### カテゴリ固有属性
#### カード
- レアリティ
- エキスパンション
- カード番号
- 言語

#### ゲーム
- プラットフォーム
- ジャンル
- プレイ人数
- CERO

## 検索最適化

### インデックス設計
- カテゴリ階層インデックス
- 全文検索対応
- ファセット検索
- 高速フィルタリング

### キャッシュ戦略
- カテゴリツリーキャッシュ
- 頻出クエリキャッシュ
- 無効化タイミング
- 分散キャッシュ

## 権限管理

### 操作権限
- カテゴリ作成: 管理者
- カテゴリ編集: 店長以上
- 削除: システム管理者
- 閲覧: 全スタッフ

### データスコープ
- 全社カテゴリ
- 店舗限定カテゴリ
- 部門別アクセス
- 個人カスタマイズ

## 移行・統合

### カテゴリ統合
- 重複カテゴリマージ
- 商品再分類
- リダイレクト設定
- 履歴保持

### 外部連携
- 外部カテゴリマッピング
- 自動分類
- カテゴリ同期
- マスタ連携

## 分析活用

### カテゴリ分析
- 売上構成比
- 在庫回転率
- 利益率分析
- トレンド分析

### 最適化提案
- カテゴリ再編提案
- 新カテゴリ提案
- 統廃合提案
- 属性追加提案

## エラーハンドリング

### 整合性チェック
- 循環参照防止
- 孤立カテゴリ検出
- 必須属性チェック
- 依存関係確認

### 削除制約
- 商品存在チェック
- 子カテゴリ確認
- 削除影響範囲表示
- 安全な削除処理

## 今後の拡張予定

1. **AI分類支援**
   - 自動カテゴリ提案
   - 画像認識分類
   - テキスト解析
   - 類似商品グルーピング

2. **動的カテゴリ**
   - 売れ筋自動生成
   - 季節カテゴリ
   - パーソナライズ
   - トレンド反映

3. **グローバル対応**
   - 多言語カテゴリ名
   - 地域別カスタマイズ
   - 国際標準分類
   - 自動翻訳

## 関連機能

- [ジャンル管理](/genre/CLAUDE.md)
- [商品管理](/products/CLAUDE.md)
- [検索機能](/search/CLAUDE.md)
- [分析機能](/analytics/CLAUDE.md)