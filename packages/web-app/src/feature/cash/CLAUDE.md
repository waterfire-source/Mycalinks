# cash/CLAUDE.md

## 🎯 目的・役割

現金管理機能 - レジの現金残高管理、入出金記録、釣り銭計算、現金過不足管理を行うReactコンポーネント群。店舗の現金フローを正確に追跡・管理する。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **UIライブラリ**: Material-UI (MUI) v5
- **状態管理**: React Hook Form + Zod
- **データフェッチ**: SWR
- **依存関係**: backend-core/services/cash

## 📁 ディレクトリ構造

```
cash/
├── components/
│   ├── CashDrawer.tsx             # レジドロワー管理
│   ├── CashCountForm.tsx          # 現金計数フォーム
│   ├── CashTransactionList.tsx    # 現金取引履歴
│   ├── CashBalanceDisplay.tsx     # 残高表示
│   └── CashReconciliation.tsx     # 現金照合
├── hooks/
│   ├── useCashBalance.ts          # 残高管理
│   ├── useCashTransaction.ts      # 取引記録
│   └── useCashCount.ts            # 現金計数
└── types/
    └── cash.ts                    # 型定義
```

## 🔧 主要機能

### 現金管理
- **残高追跡**: リアルタイム現金残高表示
- **入出金記録**: 売上・釣り銭・補充・回収の記録
- **計数機能**: 紙幣・硬貨別の現金計数
- **照合機能**: 理論値と実際値の照合

### レジドロワー制御
- **開閉制御**: 取引時の自動開閉
- **手動開閉**: 管理者による手動操作
- **セキュリティ**: 不正開閉の検知・記録
- **状態監視**: ドロワー開閉状態の監視

## 💡 使用パターン

### 現金計数
```typescript
<CashCountForm
  onSubmit={handleCashCount}
  currentBalance={cashBalance}
  showDenominations={true}
  autoCalculate={true}
/>
```

### 残高表示
```typescript
<CashBalanceDisplay
  balance={currentBalance}
  showBreakdown={true}
  showHistory={false}
  refreshInterval={30000}
/>
```

### 現金照合
```typescript
<CashReconciliation
  theoreticalBalance={theoretical}
  actualBalance={actual}
  onReconcile={handleReconciliation}
  showDiscrepancy={true}
/>
```

## 🗺️ プロジェクト内での位置づけ

- **上位層**: Feature統括
- **同位層**: レジスター、取引管理
- **下位層**: 現金取引、残高履歴
- **連携先**: 売上管理、会計システム

## 🔗 関連ディレクトリ

- [../](../) - Feature統括
- [../register/](../register/) - レジスター管理
- [../transaction/](../transaction/) - 取引管理
- [../cashRegister/](../cashRegister/) - キャッシュレジスター
- [../sale/](../sale/) - 売上管理

## 📝 開発メモ

### 現金種別管理
```typescript
const denominations = {
  bills: [10000, 5000, 2000, 1000],
  coins: [500, 100, 50, 10, 5, 1]
};
```

### セキュリティ考慮事項
- 現金操作の権限チェック
- 大額取引の承認フロー
- 現金過不足の報告義務
- 監査ログの確実な記録

### 業務フロー
1. **開店時**: 釣り銭準備・初期残高設定
2. **営業中**: 売上・釣り銭の自動記録
3. **閉店時**: 現金計数・照合・回収
4. **日次**: 売上報告・入金処理

---
*Frontend-Agent作成: 2025-01-24* 