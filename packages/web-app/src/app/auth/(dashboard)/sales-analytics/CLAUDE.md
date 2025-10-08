# sales-analytics/CLAUDE.md

## 🎯 目的・役割

売上分析・経営ダッシュボード機能。売上実績、買取実績、在庫状況をジャンル別・期間別に分析し、経営判断に必要なKPIを可視化する。店舗経営者・管理者向けの業績分析インターフェース。

## 🏗️ 技術構成

- **フレームワーク**: Next.js 14 App Router (Server Components)
- **データ可視化**: カスタムテーブル、Material-UI DataGrid
- **状態管理**: React hooks、URLパラメータ
- **データフェッチ**: Server Actions、SWR for real-time updates
- **エクスポート**: CSV、Excel出力対応
- **依存関係**: `/api/store/[store_id]/stats/`, Material-UI

## 📁 ディレクトリ構造

```
sales-analytics/
├── page.tsx                     # メインページ・分析ダッシュボード
└── components/
    ├── SalesAnalyticsTable.tsx  # 分析データテーブル
    ├── DetailContent.tsx        # 詳細表示共通コンポーネント
    ├── SellDetailContent.tsx    # 売上詳細表示
    ├── SellDetailByGenreModal.tsx # ジャンル別売上詳細モーダル
    ├── BuyDetailContent.tsx     # 買取詳細表示
    ├── BuyDetailByGenreModal.tsx # ジャンル別買取詳細モーダル
    ├── StockDetailContent.tsx   # 在庫詳細表示
    └── StockDetailByGenreModal.tsx # ジャンル別在庫詳細モーダル
```

## 🔧 主要機能

### 分析指標
- **売上分析**: 日別・月別・年別売上推移、ジャンル別売上構成
- **買取分析**: 買取実績、査定精度、ジャンル別買取傾向
- **在庫分析**: 在庫回転率、滞留在庫、ジャンル別在庫価値
- **収益性分析**: 粗利率、ROI、商品別収益性

### データ表示・操作
- **期間フィルタ**: 日付範囲選択、事前定義期間（今月、先月、四半期等）
- **ジャンル・カテゴリフィルタ**: 商品ジャンル別詳細分析
- **ソート・検索**: 多軸ソート、キーワード検索
- **ドリルダウン**: サマリーから詳細データへの展開

### エクスポート・レポート
- **CSV/Excel出力**: 分析データのダウンロード
- **印刷対応**: レポート印刷用レイアウト
- **定期レポート**: 日次・週次・月次レポート自動生成

## 💡 使用パターン

### ページアクセス
```typescript
// URL: /auth/item/page.tsx
// アクセス権限: 店舗管理者以上
// データソース: /api/store/[store_id]/stats/
```

### 分析テーブル表示
```typescript
<SalesAnalyticsTable
  data={analyticsData}
  period={selectedPeriod}
  genre={selectedGenre}
  onRowClick={handleDetailView}
  loading={loading}
/>
```

### ジャンル別詳細モーダル
```typescript
<SellDetailByGenreModal
  open={modalOpen}
  genre={selectedGenre}
  period={selectedPeriod}
  onClose={() => setModalOpen(false)}
/>
```

## 🔗 関連ディレクトリ

- [../transaction/](../transaction/) - 取引データの元データ
- [../item/](../item/) - 商品マスタデータ
- [../stock/](../stock/) - 在庫データ
- [../sale/](../sale/) - 売上取引データ
- [../purchase/](../purchase/) - 買取取引データ
- [../../../../api/backendApi/services/](../../../../api/backendApi/services/) - 分析データAPI
- [../../../../components/tables/](../../../../components/tables/) - テーブルコンポーネント

## 📝 開発メモ

### データソース
- **売上データ**: `Transaction` テーブル（売上取引）
- **買取データ**: `Transaction` テーブル（買取取引）
- **在庫データ**: `Product` テーブル（現在在庫）
- **商品データ**: `Item` テーブル（マスタデータ）

### パフォーマンス考慮
- 大量データのページング処理
- サーバーサイド集計によるクライアント負荷軽減
- キャッシュ機能による応答速度向上
- レスポンシブ対応（モバイル表示最適化）

### ビジネスロジック
- **期間比較**: 前年同期比、前月比の自動計算
- **トレンド分析**: 売上傾向、季節性分析
- **異常値検出**: 売上急変、在庫異常の自動検出
- **予測機能**: 売上予測、在庫最適化提案

### セキュリティ・権限
- 店舗データの分離（他店舗データアクセス不可）
- 管理者権限での全データアクセス
- 一般スタッフは限定データのみ表示
- データエクスポート権限管理

---
*Frontend-Agent作成: 2025-01-13*