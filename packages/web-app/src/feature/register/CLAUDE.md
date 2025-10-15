# register/CLAUDE.md

## 🎯 目的・役割

レジスター（金銭登録機）の管理とレジ業務の制御機能。レジの開閉、現金管理、売上集計、レジ点検を統合的に管理し、店舗の日次業務運営を支援する。POSシステムの物理的なレジ操作と連携する重要なドメイン。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **状態管理**: React hooks、レジ状態管理
- **ハードウェア連携**: EPSONレシートプリンター、キャッシュドロワー
- **リアルタイム**: WebSocket によるレジ状態同期
- **データ同期**: 売上データの自動同期・バックアップ
- **依存関係**: `/api/store/[store_id]/register/`, ハードウェアSDK

## 📁 ディレクトリ構造

```
register/
└── hooks/                           # カスタムフック群
    ├── useRegister.ts               # レジスター基本操作
    ├── useCreateRegister.ts         # レジスター新規作成
    ├── useUpdateRegister.ts         # レジスター情報更新
    ├── useRegisterCash.ts           # レジ現金管理
    ├── useRegisterSettlement.ts    # レジ精算処理
    └── useRegisterTodaySummary.ts   # 当日売上サマリー
```

## 🔧 主要機能

### レジスター管理
- **レジ開閉**: 営業開始時のレジオープン、営業終了時のレジクローズ
- **レジ登録**: 新規レジスター追加、設定変更
- **レジ状態監視**: オンライン/オフライン状態、エラー監視
- **複数レジ対応**: 店舗内複数レジの一元管理

### 現金管理
- **釣り銭準備**: 営業開始時の釣り銭セット
- **入金・出金**: レジからの現金入出金記録
- **現金残高**: リアルタイム現金残高表示
- **差額管理**: 理論在高と実在高の差額チェック

### 売上集計・精算
- **日次売上**: 当日売上の自動集計
- **取引別集計**: 現金・カード・電子マネー別売上
- **時間別分析**: 時間帯別売上動向
- **レジ締め**: 日次売上確定・精算処理

### ハードウェア連携
- **プリンター制御**: レシート印刷、レポート印刷
- **キャッシュドロワー**: 自動開閉制御
- **バーコードリーダー**: 商品スキャン連携
- **カード決済端末**: 決済端末との連携

## 💡 使用パターン

### レジ基本操作
```typescript
// レジスター管理フック
const {
  register,
  openRegister,
  closeRegister,
  loading,
  error,
} = useRegister(registerId)

// レジオープン
const handleOpenRegister = async () => {
  await openRegister({
    startCash: 50000, // 開始時現金
    staffId: currentStaff.id,
  })
}
```

### 現金管理
```typescript
// 現金操作フック
const {
  currentCash,
  addCash,
  removeCash,
  adjustCash,
} = useRegisterCash(registerId)

// 現金追加
const handleAddCash = async (amount: number, reason: string) => {
  await addCash({
    amount,
    reason,
    staffId: currentStaff.id,
  })
}
```

### 日次集計
```typescript
// 当日サマリー取得
const {
  summary,
  refreshSummary,
  loading,
} = useRegisterTodaySummary(registerId)

// サマリー表示
const displaySummary = {
  totalSales: summary.totalAmount,
  cashSales: summary.cashAmount,
  cardSales: summary.cardAmount,
  transactionCount: summary.transactionCount,
}
```

### レジ精算
```typescript
// 精算処理フック
const {
  settlement,
  executeSettlement,
  loading,
} = useRegisterSettlement(registerId)

// 日次精算実行
const handleSettlement = async () => {
  const result = await executeSettlement({
    actualCash: enteredCashAmount,
    notes: settlementNotes,
  })
}
```

## 🔗 関連ディレクトリ

- [../../app/auth/(dashboard)/register/](../../app/auth/(dashboard)/register/) - レジ管理画面
- [../transaction/](../transaction/) - 取引データ（売上集計ソース）
- [../sale/](../sale/) - 売上処理との連携
- [../cash/](../cash/) - 現金管理機能
- [../../components/layouts/](../../components/layouts/) - レジ画面レイアウト
- [../../api/backendApi/services/](../../api/backendApi/services/) - レジ管理API

## 📝 開発メモ

### レジ業務フロー
1. **営業開始**: レジオープン、釣り銭セット
2. **営業中**: 売上処理、現金管理
3. **途中精算**: 必要に応じた中間精算
4. **営業終了**: レジクローズ、日次精算
5. **報告**: 売上レポート生成・提出

### データモデル
- **Register**: レジスターマスタ
- **RegisterSession**: レジセッション（開閉記録）
- **RegisterCash**: 現金入出金履歴
- **RegisterSettlement**: 精算記録

### 現金管理仕様
```typescript
// 現金種別定義
const CASH_DENOMINATIONS = [
  { value: 10000, type: 'bill', name: '一万円札' },
  { value: 5000, type: 'bill', name: '五千円札' },
  { value: 1000, type: 'bill', name: '千円札' },
  { value: 500, type: 'coin', name: '五百円玉' },
  { value: 100, type: 'coin', name: '百円玉' },
  { value: 50, type: 'coin', name: '五十円玉' },
  { value: 10, type: 'coin', name: '十円玉' },
  { value: 5, type: 'coin', name: '五円玉' },
  { value: 1, type: 'coin', name: '一円玉' },
]
```

### ハードウェア制御
- **EPSON ePOS**: レシートプリンター制御
- **キャッシュドロワー**: 電気信号による開閉制御
- **デバイス監視**: 用紙残量、エラー状態監視
- **オフライン対応**: ネットワーク断時の処理継続

### セキュリティ・内部統制
- **権限管理**: レジ操作権限の階層管理
- **操作ログ**: 全レジ操作の詳細記録
- **二重チェック**: 重要操作の確認プロセス
- **不正検知**: 異常な現金操作の自動検知

### レポート・分析
- **日次レポート**: 売上・現金・取引件数サマリー
- **差額分析**: 現金過不足の原因分析
- **効率分析**: レジ稼働率、待ち時間分析
- **トレンド分析**: 売上傾向、時間帯別分析

---
*Frontend-Agent作成: 2025-01-13*