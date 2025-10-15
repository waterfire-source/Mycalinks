# Auth Dashboard - ダッシュボード

## 概要
MycaLinks POSシステムのメインダッシュボード画面。店舗の運営状況を一覧で確認できる統合ダッシュボード。

## 主な機能
- **取引金額サマリー** - 本日の売上・買取の金額を表示
- **在庫切れ商品** - 本日在庫切れになった商品一覧
- **売上ランキング** - 取引数の多い商品TOP表示
- **入荷情報** - 最近の入荷商品リスト
- **メモ機能** - 店舗スタッフ間の情報共有

## 技術仕様

### コンポーネント構成
```tsx
// メインページコンポーネント
page.tsx
- TransactionAmountCard // 取引金額カード
- OutOfStockTodayCard // 在庫切れカード
- TopTransactionsItemCard // 売上ランキングカード
- ArrivalCard // 入荷情報カード
- MemoCard // メモカード
```

### レイアウト
- Grid構成（10カラムグリッド）
  - 左カラム（4/10）: 取引金額、在庫切れ情報
  - 右カラム（6/10）: 売上ランキング、入荷・メモ

### 依存関係
- `@/contexts/StoreContext` - 店舗情報管理
- `@/components/layouts/ContainerLayout` - 共通レイアウト
- Material-UI Grid/Box - レイアウト構築

## 使用方法
1. ログイン後、自動的にダッシュボードが表示
2. 各カードは自動更新（リアルタイムデータ）
3. カードクリックで詳細画面へ遷移可能

## データフロー
```
StoreContext
  ↓
Dashboard Page
  ↓
各種カードコンポーネント
  ↓
APIリクエスト（各カード独自）
```

## 関連リンク
- [在庫管理](/auth/(dashboard)/stock/)
- [取引管理](/auth/(dashboard)/transaction/)
- [商品マスタ](/auth/(dashboard)/item/)
- [顧客管理](/auth/(dashboard)/customers/)