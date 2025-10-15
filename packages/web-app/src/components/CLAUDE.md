# components/CLAUDE.md

## 🎯 目的・役割

フロントエンドUIの基盤となる再利用可能なReactコンポーネントライブラリ。Material-UIをベースに、POS業務に特化したカスタムコンポーネントを提供し、全画面で一貫性のあるUI/UXを実現する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **スタイリング**: CSS-in-JS (emotion), sx props
- **状態管理**: React hooks, form状態はReact Hook Form
- **フォーム**: React Hook Form + Zod validation
- **データ表示**: MUI DataGrid, カスタムテーブルコンポーネント
- **依存関係**: `@mui/material`, `@mui/icons-material`, `react-hook-form`, `zod`

## 📁 ディレクトリ構造

```
components/
├── barcode/              # バーコード生成・表示
├── buttons/              # 各種ボタンコンポーネント
├── cards/                # カード型レイアウト
├── circular/             # ローディング・進捗表示
├── common/               # 共通汎用コンポーネント
├── dataGrid/             # データグリッド拡張
├── dialogs/              # ダイアログ・モーダル
├── fields/               # フォームフィールド基盤
├── inputFields/          # 入力フィールド群
├── layouts/              # レイアウト・ナビゲーション
├── modals/               # 業務特化モーダル群
├── radios/               # ラジオボタン拡張
├── tables/               # テーブル・リスト表示
├── tabs/                 # タブ・タブ内テーブル
└── tooltips/             # ツールチップ・ヘルプ表示
```

## 🔧 主要機能

### 入力系コンポーネント
- **FormTextField**: React Hook Form連携フォームフィールド
- **NumericTextField**: 数値専用入力（価格・数量）
- **SearchField**: 商品・顧客検索フィールド
- **DateField/DateRangeField**: 日付範囲選択
- **QuantityControlField**: 数量増減コントロール

### 表示系コンポーネント
- **DataTable系**: サーバーサイドページング対応テーブル
- **CustomCard**: 業務データ表示カード
- **QRCodeDisplay/Barcode**: コード表示・印刷
- **TagLabel**: ステータス・カテゴリ表示

### ナビゲーション・レイアウト
- **SideBar**: メインナビゲーション（デスクトップ/モバイル対応）
- **Header**: 店舗情報・アカウント・設定アクセス
- **ContainerLayout**: ページ共通レイアウト

### モーダル・ダイアログ
- **業務特化モーダル**: 商品詳細、顧客取引、在庫更新など
- **ConfirmationDialog**: 操作確認ダイアログ
- **SearchModal**: 高度検索・絞り込み

## 💡 使用パターン

### フォームコンポーネント
```typescript
// React Hook Form + Zod validation
<FormTextField
  name="productName"
  label="商品名"
  control={control}
  rules={{ required: "商品名は必須です" }}
/>

<NumericTextField
  name="price"
  label="価格"
  control={control}
  suffix="円"
/>
```

### テーブル表示
```typescript
// サーバーサイドページング対応
<DataTableWithServerPagination
  columns={columns}
  rows={data}
  totalCount={totalCount}
  onPageChange={handlePageChange}
  loading={loading}
/>
```

### モーダル表示
```typescript
// 業務特化モーダル
<ProductSelectModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onProductSelect={handleProductSelect}
  storeId={storeId}
/>
```

## 🔗 関連ディレクトリ

- [../feature/](../feature/) - 業務ドメイン別コンポーネント
- [../app/auth/(dashboard)/](../app/auth/(dashboard)/) - これらのコンポーネントを使用する画面
- [../hooks/](../hooks/) - コンポーネントで使用するカスタムフック
- [../theme/](../theme/) - MUIテーマ設定
- [../types/](../types/) - コンポーネントProps型定義

## 📝 開発メモ

### 設計原則
- **再利用性**: 業務ロジックを含まず、props経由でカスタマイズ可能
- **一貫性**: MUIテーマに準拠し、デザインシステムを統一
- **アクセシビリティ**: aria属性、キーボードナビゲーション対応
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応

### ベストプラクティス
- コンポーネントは単一責任の原則に従う
- propsインターフェースを明確に定義
- ローディング状態・エラー状態を適切にハンドリング
- MUIの`sx` propsを活用したスタイリング
- TypeScriptの型安全性を最大限活用

### パフォーマンス考慮
- `React.memo`による不要な再レンダリング防止
- 大量データのテーブルは仮想化（virtualization）検討
- 重いモーダルは`lazy`ローディング対応

---
*Frontend-Agent作成: 2025-01-13*