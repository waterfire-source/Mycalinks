# packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/SelectPlatForm/CLAUDE.md

## 🎯 目的・役割

出品プラットフォーム選択コンポーネント - EC商品の新規出品時に、出品先プラットフォーム（おちゃのこネット等）を選択する機能を提供するコンポーネント。

## 🏗️ 技術構成

- **フレームワーク**: React + TypeScript
- **UI**: Material-UI 5.15.15
- **主要技術**: 
  - Checkbox（プラットフォーム選択）
  - Typography（ラベル表示）
  - Stack レイアウト（整列配置）
  - 99行のコンパクト実装
- **依存関係**: 
  - Material-UI コンポーネント
  - React状態管理

## 📁 ディレクトリ構造

```
packages/web-app/src/app/auth/(dashboard)/ec/stock/components/NewPublishProductModal/SelectPlatForm/
├── SelectPlatForm.tsx          # プラットフォーム選択コンポーネント（99行）
└── CLAUDE.md                   # 本ドキュメント
```

## 🔧 主要機能

### 1. プラットフォーム選択
- **Checkbox選択**: 複数プラットフォームの選択・解除
- **ラベル表示**: プラットフォーム名の明確な表示
- **状態管理**: 選択状態の適切な管理
- **複数選択**: 複数のECプラットフォームへの同時出品対応

### 2. 選択状態管理
- **checked状態**: Checkbox の選択状態制御
- **onChange処理**: 選択変更時のコールバック処理
- **初期状態**: デフォルト選択状態の設定
- **状態同期**: 親コンポーネントとの状態同期

## 💡 使用パターン

### 基本的な使用方法
```typescript
// プラットフォーム選択
<SelectPlatForm
  selectedPlatforms={selectedPlatforms}
  onPlatformChange={handlePlatformChange}
  availablePlatforms={availablePlatforms}
/>
```

### データ構造
```typescript
// プラットフォーム情報
interface Platform {
  id: string;
  name: string;
  displayName: string;
  enabled: boolean;
}

// 選択状態
interface SelectedPlatforms {
  [platformId: string]: boolean;
}
```

### 状態管理パターン
```typescript
// プラットフォーム選択変更
const handlePlatformChange = (platformId: string, checked: boolean) => {
  setSelectedPlatforms((prev) => ({
    ...prev,
    [platformId]: checked,
  }));
};

// 全選択・全解除
const handleSelectAll = (checked: boolean) => {
  const newSelection = {};
  availablePlatforms.forEach((platform) => {
    newSelection[platform.id] = checked;
  });
  setSelectedPlatforms(newSelection);
};
```

## 🎨 UI/UX設計

### レイアウト構成
```typescript
// プラットフォーム選択レイアウト
<Stack direction="column" spacing={1}>
  <Typography variant="h6">出品先プラットフォーム</Typography>
  
  {availablePlatforms.map((platform) => (
    <Stack
      key={platform.id}
      direction="row"
      alignItems="center"
      spacing={1}
    >
      <Checkbox
        checked={selectedPlatforms[platform.id] || false}
        onChange={(event) => handlePlatformChange(platform.id, event.target.checked)}
        sx={{
          color: 'black',
          '&.Mui-checked': {
            color: 'primary.main',
          },
        }}
      />
      <Typography>{platform.displayName}</Typography>
    </Stack>
  ))}
</Stack>
```

### チェックボックススタイル
```typescript
// カスタムチェックボックス
<Checkbox
  sx={{
    color: 'black',                    // 未選択時の色
    padding: 0,                       // パディング除去
    margin: 0,                        // マージン除去
    '&.Mui-checked': {
      color: 'primary.main',          // 選択時の色
    },
  }}
/>
```

## 🔗 API統合

### Props インターフェース
```typescript
interface Props {
  selectedPlatforms: SelectedPlatforms;
  onPlatformChange: (platformId: string, checked: boolean) => void;
  availablePlatforms: Platform[];
}
```

### 使用例
```typescript
// 親コンポーネントでの使用
const NewPublishProductModal = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SelectedPlatforms>({
    ochanoko: false,
    shopify: false,
    // その他のプラットフォーム
  });

  const availablePlatforms = [
    { id: 'ochanoko', name: 'ochanoko', displayName: 'おちゃのこネット', enabled: true },
    { id: 'shopify', name: 'shopify', displayName: 'Shopify', enabled: true },
    // その他のプラットフォーム
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platformId]: checked,
    }));
  };

  return (
    <SelectPlatForm
      selectedPlatforms={selectedPlatforms}
      onPlatformChange={handlePlatformChange}
      availablePlatforms={availablePlatforms}
    />
  );
};
```

## 🚀 パフォーマンス最適化

### レンダリング最適化
- **99行のコンパクト実装**: 最小限のコードによる効率性
- **条件付きレンダリング**: 利用可能プラットフォームのみ表示
- **シンプルな状態**: 必要最小限の状態管理

### UX最適化
- **即座の反映**: チェックボックス変更の即座な反映
- **明確なラベル**: プラットフォーム名の明確な表示
- **視覚的フィードバック**: 選択状態の明確な表示

## 🔗 関連コンポーネント

- [../NewPublishProductModal.tsx](../NewPublishProductModal.tsx) - 親モーダルコンポーネント
- [../NewPublishProductList/](../NewPublishProductList/) - 商品選択リスト
- [../SelectedProduct/](../SelectedProduct/) - 選択済み商品表示
- [../ChangePrice/](../ChangePrice/) - 価格変更設定
- [../../external/](../../external/) - 外部EC連携管理

## 📝 開発メモ

### 実装の特徴
- **99行のミニマル実装**: プラットフォーム選択に特化したシンプル設計
- **複数選択対応**: 複数プラットフォームへの同時出品対応
- **拡張可能**: 新しいプラットフォームの追加に対応
- **Material-UI準拠**: 一貫したデザインシステム

### 技術的工夫
- **状態管理**: オブジェクト形式による効率的な選択状態管理
- **コールバック設計**: onPlatformChange による柔軟な処理制御
- **型安全性**: TypeScript による型定義
- **スタイル統一**: Material-UI テーマによる一貫したスタイル

### UI設計原則
- **シンプリシティ**: 必要最小限の要素による明確な UI
- **選択性**: 複数プラットフォームの選択・解除
- **一貫性**: Material-UI による統一されたデザイン
- **拡張性**: 新しいプラットフォームの追加に対応

### 使用場面
- **新規出品**: EC商品の新規出品時のプラットフォーム選択
- **一括出品**: 複数商品の一括出品時の設定
- **プラットフォーム管理**: 出品先の管理・設定
- **連携設定**: 外部ECプラットフォームとの連携設定

### 将来の拡張
- **プラットフォーム情報**: アイコン・説明文の追加
- **制限事項**: プラットフォーム別の制限事項表示
- **手数料情報**: プラットフォーム別手数料の表示
- **連携状況**: プラットフォーム別連携状況の表示

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 