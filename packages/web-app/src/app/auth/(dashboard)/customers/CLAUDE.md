# Customer Management - 顧客管理

## 概要
顧客情報の一覧表示・検索・詳細確認を行う画面。購買履歴やポイント管理、顧客メモなどの統合管理が可能。

## 主な機能
- **顧客一覧** - 全顧客のテーブル表示
- **顧客詳細** - 個人情報、購買履歴、ポイント残高
- **来店履歴** - 最終来店日、来店回数の表示
- **取引分析** - 最多取引ジャンルの自動算出
- **顧客メモ** - スタッフ間の情報共有

## 技術仕様

### コンポーネント構成
```tsx
page.tsx // メインページ
- DataGrid // 顧客一覧テーブル
- CustomerDetail // 顧客詳細パネル（右サイド）
```

### データ構造
```typescript
interface CustomerData {
  id: number;
  full_name: string | null;
  full_name_ruby: string | null;
  email: string | null;
  phone_number: string | null;
  birthday: Date | null;
  owned_point: number;
  point_exp: Date | null;
  lastUsedDate?: Date | null;
  memo?: string | null;
  // 住所情報
  zip_code: string | null;
  prefecture: string | null;
  city: string | null;
  address: string | null;
  address2: string | null;
  building: string | null;
}

interface TransactionStats {
  numberOfVisits: number;
  groupByDepartmentTransactionKind: Array<{
    department_display_name: string | null;
    total_count: number;
    transaction_kind: TransactionKind;
  }>;
}
```

### レイアウト構成
- 左側（65%）: 顧客一覧テーブル
- 右側（35%）: 選択中の顧客詳細
- 動的高さ調整対応

### APIエンドポイント
```typescript
// 顧客一覧取得（統計情報含む）
clientAPI.customer.getAllCustomer({
  store_id: number,
  includesTransactionStats: boolean
})
```

## 使用方法

### 顧客検索・一覧表示
1. 画面表示時に全顧客を自動読み込み
2. テーブルヘッダーでソート可能
3. ページネーション（50件/ページ）

### 顧客詳細確認
1. 一覧から顧客をクリック
2. 右パネルに詳細情報表示
3. 編集・メモ追加が可能

## UI/UXの特徴

### テーブルカラム
- **顧客名** - フルネーム表示
- **フリガナ** - カナ表記
- **最新来店日時** - 日付と時刻を2行表示
- **来店回数** - 累計回数
- **最多取引種類** - 最も多い取引ジャンル

### スタイリング
- ヘッダー: 赤いボーダートップ（#b82a2a）
- 行選択時のハイライト
- レスポンシブ対応（最小幅設定）

## パフォーマンス最適化
- 初回ロード時のローディング表示
- ウィンドウリサイズ時の高さ自動調整
- 大量データ対応のページネーション

## 関連機能
- **ポイント管理** - 付与・利用履歴
- **取引履歴** - 購買・買取履歴の確認
- **顧客メモ** - スタッフ間の申し送り

## 注意事項
- 個人情報の取り扱いに注意
- メモは全スタッフが閲覧可能
- ポイント有効期限の自動チェック

## 関連リンク
- [取引管理](/auth/(dashboard)/transaction/)
- [ポイント設定](/auth/(dashboard)/settings/point-setting/)
- [販売処理](/auth/(dashboard)/sale/)
- [買取処理](/auth/(dashboard)/purchase/)