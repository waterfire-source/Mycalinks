# conditionOption/CLAUDE.md

## 🎯 目的・役割

コンディションオプション管理機能 - 商品コンディションの詳細オプション設定、カスタム評価項目、特殊状態管理を行うReactコンポーネント群。標準コンディションに加えた詳細評価を提供する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: React Hook Form + Zod
- **データフェッチ**: SWR
- **依存関係**: condition/, backend-core/services/conditionOption

## 📁 ディレクトリ構造

```
conditionOption/
├── components/
│   ├── ConditionOptionSelector.tsx    # オプション選択UI
│   ├── CustomConditionForm.tsx        # カスタム評価フォーム
│   ├── SpecialConditionBadge.tsx      # 特殊状態バッジ
│   └── ConditionOptionHistory.tsx     # オプション履歴
├── hooks/
│   ├── useConditionOption.ts          # オプション操作
│   └── useCustomCondition.ts          # カスタム評価
└── types/
    └── conditionOption.ts             # 型定義
```

## 🔧 主要機能

### オプション管理
- **付属品状態**: 箱・説明書・付属品の有無
- **動作確認**: 機能別動作チェック
- **外観詳細**: 部位別の傷・汚れ評価
- **特殊状態**: 修理歴・改造・レア度

### カスタム評価
- **カテゴリ別項目**: 商品カテゴリ固有の評価項目
- **重要度設定**: 評価項目の重み付け
- **写真マッピング**: 評価項目と証拠写真の関連付け
- **査定影響**: 価格への影響度計算

## 💡 使用パターン

### オプション選択
```typescript
<ConditionOptionSelector
  baseCondition="A"
  options={conditionOptions}
  onChange={handleOptionChange}
  category="electronics"
/>
```

### カスタム評価
```typescript
<CustomConditionForm
  itemId={123}
  baseCondition={condition}
  onSubmit={handleCustomEvaluation}
  showPriceImpact={true}
/>
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: Feature統括
- **関連層**: コンディション管理
- **下位層**: 詳細評価、特殊状態
- **連携先**: 査定・買取・価格算出

## 🔗 関連ディレクトリ

- [../](../) - Feature統括
- [../condition/](../condition/) - 基本コンディション
- [../purchase/](../purchase/) - 買取管理
- [../item/](../item/) - 商品管理

## 📝 開発メモ

### オプション種類
- **付属品**: 完備(+10%), 一部欠品(-5%), 欠品(-15%)
- **動作**: 完動(+0%), 一部不良(-20%), 不動(-50%)
- **外観**: 美品(+5%), 通常(+0%), 難あり(-10%)
- **特殊**: レア(+20%), 限定(+15%), 修理歴(-25%)

### 価格影響計算
```typescript
const finalPrice = basePrice * 
  (1 + accessoryRate + functionRate + appearanceRate + specialRate)
```

---
*Frontend-Agent作成: 2025-01-24* 