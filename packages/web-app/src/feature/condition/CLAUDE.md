# condition/CLAUDE.md

## 🎯 目的・役割

商品コンディション管理機能 - 中古商品の状態評価、コンディション設定、査定基準管理を行うReactコンポーネント群。買取・販売時の商品状態を統一的に管理する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: React Hook Form + Zod
- **データフェッチ**: SWR
- **依存関係**: backend-core/services/condition

## 📁 ディレクトリ構造

```
condition/
├── components/
│   ├── ConditionSelector.tsx      # コンディション選択UI
│   ├── ConditionCard.tsx          # コンディション表示カード
│   ├── ConditionForm.tsx          # コンディション編集フォーム
│   ├── ConditionGradeDisplay.tsx  # グレード表示
│   └── ConditionHistory.tsx       # コンディション履歴
├── hooks/
│   ├── useCondition.ts            # コンディション操作
│   ├── useConditionList.ts        # コンディション一覧
│   └── useConditionValidation.ts  # バリデーション
└── types/
    └── condition.ts               # 型定義
```

## 🔧 主要機能

### コンディション管理
- **コンディション選択**: 商品状態の選択UI
- **グレード設定**: A+, A, B+, B, C の5段階評価
- **詳細評価**: 傷・汚れ・動作状況の詳細記録
- **写真添付**: コンディション証明用画像

### 査定支援
- **自動査定**: コンディションに基づく価格算出
- **査定履歴**: 過去の査定結果参照
- **基準表示**: コンディション判定基準の表示
- **比較機能**: 同一商品の他コンディション比較

## 💡 使用パターン

### コンディション選択
```typescript
<ConditionSelector
  value={selectedCondition}
  onChange={handleConditionChange}
  itemCategory="electronics"
  showDetails={true}
/>
```

### コンディション表示
```typescript
<ConditionCard
  condition={itemCondition}
  showGrade={true}
  showPhotos={true}
  editable={false}
/>
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: Feature統括
- **同位層**: 商品管理、査定機能
- **下位層**: コンディション詳細、履歴
- **連携先**: 買取・販売・在庫管理

## 🔗 関連ディレクトリ

- [../](../) - Feature統括
- [../item/](../item/) - 商品管理
- [../purchase/](../purchase/) - 買取管理
- [../conditionOption/](../conditionOption/) - コンディションオプション

## 📝 開発メモ

### コンディション基準
- **A+**: 新品同様、使用感なし
- **A**: 軽微な使用感、機能問題なし
- **B+**: 使用感あり、軽微な傷
- **B**: 明確な使用感、動作良好
- **C**: 傷・汚れあり、動作確認済み

### 注意事項
- カテゴリ別のコンディション基準適用
- 査定者による主観的判断の標準化
- 写真による客観的証拠の重要性

---
*Frontend-Agent作成: 2025-01-24* 