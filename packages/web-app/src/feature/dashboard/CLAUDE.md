# dashboard/CLAUDE.md

## 🎯 目的・役割

店舗運営の中核となるダッシュボード機能。リアルタイムの売上状況、在庫アラート、重要な業務指標を一覧表示し、店舗管理者が迅速な意思決定を行えるよう情報を集約する。店舗の「コックピット」的役割を担う。

## 🏗️ 技術構成

- **フレームワーク**: React 18 with TypeScript
- **データ可視化**: Chart.js、カスタムカードコンポーネント
- **リアルタイム更新**: WebSocket、SWR polling
- **レスポンシブ**: モバイル・タブレット・デスクトップ対応
- **パフォーマンス**: 軽量コンポーネント、効率的データフェッチ
- **依存関係**: 複数API集約、リアルタイムデータ

## 📁 ディレクトリ構造

```
dashboard/
└── components/                        # ダッシュボードカード群
    ├── TransactionAmountCard.tsx      # 売上金額表示カード
    ├── TopTransactionsItemCard.tsx    # 売上トップ商品カード
    ├── ArrivalCard.tsx               # 入荷情報カード
    ├── MemoCard.tsx                  # メモ・お知らせカード
    └── OutOfStockTodayCard.tsx       # 当日品切れ商品カード
```

## 🔧 主要機能

### 売上・業績指標
- **リアルタイム売上**: 当日売上金額のリアルタイム表示
- **前日比較**: 前日同時刻との売上比較
- **目標達成率**: 月次・日次目標に対する達成率
- **取引件数**: 当日の取引件数・平均客単価

### 商品・在庫状況
- **売上トップ商品**: 当日・当月の売上上位商品
- **在庫アラート**: 在庫切れ・在庫僅少商品の警告表示
- **入荷情報**: 本日の入荷予定・実績
- **回転率**: 商品回転率の高い・低い商品

### アラート・通知
- **システムアラート**: システム障害・メンテナンス情報
- **業務アラート**: 要対応業務・期限間近タスク
- **在庫アラート**: 品切れ・発注推奨商品
- **顧客アラート**: VIP顧客来店・誕生日等

### メモ・コミュニケーション
- **店舗メモ**: スタッフ間の申し送り事項
- **本部連絡**: 本部からの連絡・指示事項
- **今日のタスク**: 当日実施すべき業務タスク
- **重要お知らせ**: システム更新・キャンペーン情報

## 💡 使用パターン

### 売上表示カード
```typescript
// 売上金額カード
<TransactionAmountCard
  todayAmount={todaySales}
  yesterdayAmount={yesterdaySales}
  targetAmount={dailyTarget}
  currency="¥"
  loading={loading}
/>
```

### 商品情報カード
```typescript
// 売上トップ商品
<TopTransactionsItemCard
  topItems={topSellingItems}
  period="today"
  onItemClick={handleItemDetail}
  loading={loading}
/>

// 品切れ商品アラート
<OutOfStockTodayCard
  outOfStockItems={outOfStockProducts}
  onReorderClick={handleReorder}
  urgentOnly={true}
/>
```

### 入荷・在庫カード
```typescript
// 入荷情報
<ArrivalCard
  arrivals={todayArrivals}
  pendingCount={pendingArrivals}
  onArrivalManage={handleArrivalManage}
/>
```

### メモ・お知らせ
```typescript
// メモカード
<MemoCard
  memos={importantMemos}
  onMemoAdd={handleAddMemo}
  onMemoEdit={handleEditMemo}
  maxDisplay={5}
/>
```

## 🔗 関連ディレクトリ

- [../../app/auth/(dashboard)/page.tsx](../../app/auth/(dashboard)/page.tsx) - メインダッシュボードページ
- [../transaction/](../transaction/) - 売上データソース
- [../products/](../products/) - 在庫データソース
- [../arrival/](../arrival/) - 入荷データソース
- [../memo/](../memo/) - メモ機能
- [../../components/cards/](../../components/cards/) - 基盤カードコンポーネント
- [../../api/backendApi/services/](../../api/backendApi/services/) - 各種データAPI

## 📝 開発メモ

### ダッシュボード設計原則
- **視認性**: 重要情報の一目での把握
- **リアルタイム性**: 即座に最新状況を反映
- **アクション指向**: 問題発見から対応アクションまでの導線
- **カスタマイズ性**: 店舗特性に応じた表示項目調整

### データ更新戦略
- **リアルタイム**: 売上金額、在庫状況
- **短間隔**: トップ商品、アラート（5分間隔）
- **中間隔**: 入荷情報、メモ（15分間隔）
- **長間隔**: 統計情報、トレンド（1時間間隔）

### レスポンシブ対応
```typescript
// 画面サイズ別レイアウト
const DashboardLayout = {
  mobile: '1列表示、重要カード優先',
  tablet: '2列表示、中程度詳細',
  desktop: '3-4列表示、全詳細情報'
}
```

### パフォーマンス最適化
- **コンポーネント分割**: カード単位での独立更新
- **メモ化**: React.memo による不要再レンダリング防止
- **データキャッシュ**: SWR による効率的データ管理
- **遅延読み込み**: 重要度に応じた段階的データロード

### カードコンポーネント設計
```typescript
// 共通カードインターフェース
interface DashboardCardProps {
  title: string
  data: any
  loading?: boolean
  error?: Error
  onAction?: () => void
  priority?: 'high' | 'medium' | 'low'
  refreshInterval?: number
}
```

### 業務フロー連携
- **問題発見**: ダッシュボードでの異常値・アラート検知
- **詳細確認**: 該当画面への直接遷移
- **対応実行**: 具体的アクション（発注・価格変更等）
- **結果確認**: ダッシュボードでの変化確認

### カスタマイズ機能
- **表示項目選択**: 店舗業態に応じたカード選択
- **レイアウト調整**: カードの配置・サイズ変更
- **アラート閾値**: 在庫・売上アラートの店舗別設定
- **更新頻度**: データ更新間隔の調整

---
*Frontend-Agent作成: 2025-01-13*