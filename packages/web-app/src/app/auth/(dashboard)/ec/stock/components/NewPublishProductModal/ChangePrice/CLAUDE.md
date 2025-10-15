# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/ChangePrice/CLAUDE.md

## 🎯 目的・役割

出品価格変更設定コンポーネント - EC商品の新規出品時に、自動設定価格から手動価格への変更設定を行う価格管理コンポーネント。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - NumericTextField（価格入力）
  - Checkbox（価格変更有効化）
  - Typography（ラベル・説明表示）
  - Stack レイアウト（整列配置）
  - 99行のコンパクト実装
- **依存関係**: 
  - NumericTextField（数値入力コンポーネント）
  - Material-UI コンポーネント

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/ChangePrice/
├── ChangePrice.tsx             # 価格変更設定コンポーネント（99行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. 価格変更設定
- **変更有効化**: Checkbox による価格変更機能の有効/無効切り替え
- **自動価格表示**: デフォルトの自動設定価格の表示
- **手動価格入力**: NumericTextField による手動価格の入力
- **価格バリデーション**: 適切な価格範囲の検証

### 2. 条件付き表示
- **動的表示**: 価格変更有効時のみ入力フィールド表示
- **説明文表示**: 価格変更機能の説明・注意事項
- **現在価格表示**: 現在設定されている価格の表示
- **差額表示**: 自動価格との差額表示（オプション）

### 3. 入力制御
- **数値制限**: 適切な価格範囲での入力制限
- **リアルタイム更新**: 入力値の即座の反映
- **エラーハンドリング**: 不正な価格入力の防止
- **フォーマット**: 価格表示の適切なフォーマット

## 💡 使用パターン

### 基本的な使用方法
```typescript
// 価格変更設定
<ChangePrice
  enablePriceChange={enablePriceChange}
  onEnablePriceChange={setEnablePriceChange}
  autoPrice={autoPrice}
  customPrice={customPrice}
  onCustomPriceChange={setCustomPrice}
/>
```

### データ構造
```typescript
// 価格設定情報
interface PriceSettings {
  enablePriceChange: boolean;       // 価格変更有効フラグ
  autoPrice: number;                // 自動設定価格
  customPrice?: number;             // 手動設定価格
  minPrice?: number;                // 最低価格
  maxPrice?: number;                // 最高価格
}
```

### 状態管理パターン
```typescript
// 価格変更有効化
const handleEnablePriceChange = (enabled: boolean) => {
  setEnablePriceChange(enabled);
  if (!enabled) {
    setCustomPrice(undefined);  // 無効化時はカスタム価格をクリア
  }
};

// カスタム価格変更
const handleCustomPriceChange = (price: number | undefined) => {
  setCustomPrice(price);
};

// 最終価格の計算
const getFinalPrice = () => {
  return enablePriceChange && customPrice !== undefined
    ? customPrice
    : autoPrice;
};
```

## 🎨 UI/UX設計

### レイアウト構成
```typescript
// 価格変更設定レイアウト
<Stack direction="column" spacing={2}>
  <Typography variant="h6">価格設定</Typography>
  
  {/* 自動価格表示 */}
  <Stack direction="row" justifyContent="space-between">
    <Typography>自動設定価格</Typography>
    <Typography>{autoPrice}円</Typography>
  </Stack>
  
  {/* 価格変更有効化 */}
  <Stack direction="row" alignItems="center" spacing={1}>
    <Checkbox
      checked={enablePriceChange}
      onChange={(event) => handleEnablePriceChange(event.target.checked)}
      sx={{
        color: 'black',
        '&.Mui-checked': {
          color: 'primary.main',
        },
      }}
    />
    <Typography>出品価格を手動で設定する</Typography>
  </Stack>
  
  {/* 手動価格入力（条件付き表示） */}
  {enablePriceChange && (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography>出品価格</Typography>
      <NumericTextField
        value={customPrice}
        onChange={handleCustomPriceChange}
        min={minPrice}
        max={maxPrice}
        placeholder="価格を入力"
      />
      <Typography>円</Typography>
    </Stack>
  )}
  
  {/* 説明文 */}
  <Typography variant="body2" color="text.secondary">
    チェックを入れると、自動設定価格ではなく手動で設定した価格で出品されます。
  </Typography>
</Stack>
```

### 価格表示フォーマット
```typescript
// 価格フォーマット関数
const formatPrice = (price: number | undefined) => {
  if (price === undefined) return '-';
  return new Intl.NumberFormat('ja-JP').format(price) + '円';
};

// 差額表示
const getPriceDifference = () => {
  if (!enablePriceChange || customPrice === undefined) return null;
  const difference = customPrice - autoPrice;
  const sign = difference >= 0 ? '+' : '';
  return `${sign}${difference}円`;
};
```

## 🔗 API統合

### Props インターフェース
```typescript
interface Props {
  enablePriceChange: boolean;
  onEnablePriceChange: (enabled: boolean) => void;
  autoPrice: number;
  customPrice?: number;
  onCustomPriceChange: (price: number | undefined) => void;
  minPrice?: number;
  maxPrice?: number;
}
```

### 使用例
```typescript
// 親コンポーネントでの使用
const NewPublishProductModal = () => {
  const [enablePriceChange, setEnablePriceChange] = useState(false);
  const [customPrice, setCustomPrice] = useState<number | undefined>();
  const autoPrice = 1000; // 自動設定価格

  const handlePriceSettingsChange = (settings: PriceSettings) => {
    setEnablePriceChange(settings.enablePriceChange);
    setCustomPrice(settings.customPrice);
  };

  return (
    <ChangePrice
      enablePriceChange={enablePriceChange}
      onEnablePriceChange={setEnablePriceChange}
      autoPrice={autoPrice}
      customPrice={customPrice}
      onCustomPriceChange={setCustomPrice}
      minPrice={100}
      maxPrice={100000}
    />
  );
};
```

## 🚀 パフォーマンス最適化

### レンダリング最適化
- **99行のコンパクト実装**: 最小限のコードによる効率性
- **条件付きレンダリング**: 価格変更有効時のみ入力フィールド表示
- **シンプルな状態**: 必要最小限の状態管理

### UX最適化
- **即座の反映**: 設定変更の即座な反映
- **明確なフィードバック**: 価格変更の視覚的な表示
- **入力制限**: 適切な価格範囲での入力制限

## 🔗 関連コンポーネント

- [../NewPublishProductModal.tsx](../NewPublishProductModal.tsx) - 親モーダルコンポーネント
- [../NewPublishProductList/](../NewPublishProductList/) - 商品選択リスト
- [../SelectedProduct/](../SelectedProduct/) - 選択済み商品表示
- [../SelectPlatForm/](../SelectPlatForm/) - プラットフォーム選択
- [/components/inputFields/NumericTextField](../../../../../../../components/inputFields/) - 数値入力フィールド

## 📝 開発メモ

### 実装の特徴
- **99行のミニマル実装**: 価格変更設定に特化したシンプル設計
- **条件付きUI**: 価格変更有効時のみ入力フィールド表示
- **バリデーション**: 適切な価格範囲での入力制限
- **Material-UI準拠**: 一貫したデザインシステム

### 技術的工夫
- **状態連動**: enablePriceChange による UI の動的制御
- **数値入力**: NumericTextField による適切な価格入力
- **型安全性**: TypeScript による型定義
- **エラー防止**: 不正な価格入力の防止

### UI設計原則
- **シンプリシティ**: 必要最小限の要素による明確な UI
- **条件表示**: 有効時のみ入力フィールド表示
- **一貫性**: Material-UI による統一されたデザイン
- **使いやすさ**: 直感的な操作・明確なフィードバック

### 使用場面
- **新規出品**: EC商品の新規出品時の価格設定
- **価格調整**: 自動価格からの手動調整
- **一括設定**: 複数商品の価格設定
- **価格戦略**: 競合価格に応じた価格設定

### 将来の拡張
- **価格提案**: 競合価格に基づく価格提案機能
- **価格履歴**: 過去の価格変更履歴の表示
- **利益計算**: 設定価格による利益計算
- **価格アラート**: 価格変更時のアラート機能

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 